<script>
  import { onMount } from 'svelte'
  import { isApp, isAndroid, isIOS } from '$lib/helpers/platform';
  import { resizeIframe, selectorAppOrDCR } from '$lib/helpers/guardian/toolbelt.js';
  import Hls from 'hls.js';

let videoElement = null;
let player = null;
let shaka = null;
let format = '';
let muted = true;
let isPlaying = false;
let loaded = false;
let vidLoaded = false;
let placeholder = '';
let videoContainer
let intersectionObserver = null;
let logMessages = [];
let testing = false;
let targetDocument = null;

// Custom logging function
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const formattedMessage = `[${timestamp}] ${message}`;
  logMessages = [...logMessages, { text: formattedMessage, type }];
  // Still use browser console for debugging
  if (type === 'error') {
    console.error(message);
  } else {
    console.log(message);
  }
}

// Function to check if connection and screen are suitable for streaming video
async function checkStreamingCapability() {
  const screenWidth = window.screen.width;
  const pixelRatio = window.devicePixelRatio || 1;
  const effectiveWidth = screenWidth * pixelRatio;
  
  log(`Screen width: ${screenWidth}px, Pixel ratio: ${pixelRatio}, Effective width: ${effectiveWidth}px`);
  
  // Check connection speed using navigator.connection if available
  let connectionSpeed = 'unknown';
  let isConnectionGood = false;
  
  if (navigator.connection) {
    const connection = navigator.connection;
    connectionSpeed = connection.effectiveType || connection.type || 'unknown';
    
    log(`Connection type: ${connectionSpeed}`);
    log(`Connection downlink: ${connection.downlink}Mbps`);
    log(`Connection rtt: ${connection.rtt}ms`);
    
    // Determine if connection is good enough for streaming
    // effectiveType: 'slow-2g', '2g', '3g', '4g'
    // downlink: speed in Mbps
    const is5G = connection.effectiveType === '5g' || connection.downlink >= 10;
    const is4G = connection.effectiveType === '4g' || (connection.downlink >= 5 && connection.downlink < 10);
    const is3G = connection.effectiveType === '3g' || (connection.downlink >= 1.5 && connection.downlink < 5);
    const isSlow = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || connection.downlink < 1.5;
    
    if (is5G) {
      isConnectionGood = true;
      log('Connection quality: Excellent (5G) - suitable for high quality streaming');
    } else if (is4G) {
      isConnectionGood = true;
      log('Connection quality: Good (4G) - suitable for medium quality streaming');
    } else if (is3G) {
      isConnectionGood = false;
      log('Connection quality: Good (3G) - suitable for medium quality streaming');
    } else if (isSlow) {
      isConnectionGood = false;
      log('Connection quality: Poor (2G/slow) - forcing standard player');
    } else {
      // Fallback: assume good connection if we can't determine
      isConnectionGood = true;
      log('Connection quality: Unknown - assuming good connection');
    }
  } else {
    // Fallback for browsers without connection API
    log('Connection API not available - using fallback detection');
    
    // Try to estimate connection speed with a small test
    try {
      const testStart = Date.now();
      const testImage = new Image();
      testImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
      
      await new Promise((resolve, reject) => {
        testImage.onload = () => {
          const testDuration = Date.now() - testStart;
          log(`Connection test duration: ${testDuration}ms`);
          
          // Very rough estimation - less than 100ms is fast, more than 500ms is slow
          if (testDuration < 100) {
            isConnectionGood = true;
            connectionSpeed = 'fast (estimated)';
            log('Connection quality: Fast (estimated) - suitable for streaming');
          } else if (testDuration < 500) {
            isConnectionGood = true;
            connectionSpeed = 'medium (estimated)';
            log('Connection quality: Medium (estimated) - suitable for streaming');
          } else {
            isConnectionGood = false;
            connectionSpeed = 'slow (estimated)';
            log('Connection quality: Slow (estimated) - forcing standard player');
          }
          resolve();
        };
        testImage.onerror = () => {
          log('Connection test failed - assuming good connection');
          isConnectionGood = true;
          connectionSpeed = 'unknown (test failed)';
          resolve();
        };
        // Timeout after 2 seconds
        setTimeout(() => {
          log('Connection test timeout - assuming good connection');
          isConnectionGood = true;
          connectionSpeed = 'unknown (timeout)';
          resolve();
        }, 2000);
      });
    } catch (error) {
      log(`Connection test error: ${error.message} - assuming good connection`);
      isConnectionGood = true;
      connectionSpeed = 'unknown (error)';
    }
  }
  
  // Check if screen is suitable for high quality video
  const isHighResScreen = effectiveWidth >= 1920; // 1080p equivalent
  const isMediumResScreen = effectiveWidth >= 1280; // 720p equivalent
  
  log(`Screen resolution: ${isHighResScreen ? 'High' : isMediumResScreen ? 'Medium' : 'Low'}`);
  
  // Determine if streaming is recommended
  const canStream = isConnectionGood && (isHighResScreen || isMediumResScreen);
  
  if (canStream) {
    if (isHighResScreen && isConnectionGood) {
      log('Recommendation: High quality streaming (DASH/HLS)');
    } else {
      log('Recommendation: Medium quality streaming (DASH/HLS)');
    }
  } else {
    log('Recommendation: Standard player (MP4) - poor connection or low resolution screen');
  }
  
  return {
    canStream,
    connectionSpeed,
    effectiveWidth,
    isHighResScreen,
    isMediumResScreen,
    isConnectionGood
  };
}

// Function to determine if high resolution should be forced based on screen size
function shouldForceHighRes() {
  if (!settings.forceHighRes) {
    return false;
  }
  
  // Get screen dimensions
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Calculate effective resolution
  const effectiveWidth = screenWidth * pixelRatio;
  const effectiveHeight = screenHeight * pixelRatio;
  
  // Force high res for screens that can actually benefit from it
  // Consider high res beneficial for screens with effective width >= 1920px (1080p equivalent)
  const shouldForce = effectiveWidth >= 1920;
  
  log(`Screen: ${screenWidth}x${screenHeight}, Pixel ratio: ${pixelRatio}, Effective: ${effectiveWidth}x${effectiveHeight}, Force high res: ${shouldForce}`);
  
  return shouldForce;
}

const settings = {
  "vid": "1",
  "src": "png",
  "url": "https://interactive.guim.co.uk/embed/aus/2025/06/png",
  "subs": null,
  "loop": true,
  "controls": false,
  "autoplay": true,
  "hasAudio": false,
  "width": "1862",
  "height": "1010",
  "caption": null,
  "forceHighRes": true
}

onMount(async() =>{

  // Determine if we're in an iframe and get the appropriate document
  const isInIframe = window !== window.parent;
  const targetWindow = isInIframe ? window.parent : window;

  if (isInIframe) {
    log('Running in iframe, targeting parent document');

    if (testing) {
      resizeIframe();
    }
  }

  targetDocument = isInIframe ? window.parent.document : document;

  const body = targetDocument.querySelector("body");

  let mainMediaContainer = null;

  if (isApp(targetDocument)) {
    log('App detected, looking for media container');
    mainMediaContainer = targetDocument.querySelector(selectorAppOrDCR("media"));
    if (mainMediaContainer) {
      log('Found main media container');
    } else {
      log('No main media container found', 'error');
    }
  } else {
    log('Web detected, waiting for #img-1 to exist');
    // Wait for #img-1 to exist with a timeout
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 100; // Check every 100ms
    let elapsedTime = 0;
    
    while (!mainMediaContainer && elapsedTime < maxWaitTime) {
      mainMediaContainer = targetDocument.querySelector("#img-1");
      if (!mainMediaContainer) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsedTime += checkInterval;
      }
    }
    
    if (mainMediaContainer) {
      log('Found #img-1 container after waiting');
    } else {
      log('Timeout waiting for #img-1 container', 'error');
      return; // Exit early if we can't find the container
    }
  }

  const imgEl = targetDocument.querySelector('#img-1 picture img');
  const currentSrc = imgEl ? (imgEl.currentSrc || imgEl.src) : null;
  
  if (currentSrc) {
    log('Current image src:', currentSrc);
  }
  
  videoElement = document.createElement("video");
  videoElement.classList.add("special-video-header");
  videoElement.id = "special-video-header";
  
  // Set CSS styles
  videoElement.style.width = '100%';
  videoElement.style.position = 'absolute';
  videoElement.style.height = '100%';
  videoElement.style.top = '0';
  videoElement.style.left = '0';
  videoElement.style.zIndex = '1000';
  videoElement.style.objectFit = 'cover';
  videoElement.style.objectPosition = 'center';
  
  // Set crossorigin
  videoElement.setAttribute('crossorigin', 'anonymous');
  videoElement.crossOrigin = 'anonymous';

  // Set muted
  videoElement.setAttribute('muted', 'true');
  videoElement.muted = true;

  // Set loop
  videoElement.setAttribute('loop', 'true');
  videoElement.loop = true;

  // Set controls
  videoElement.setAttribute('controls', 'false');
  videoElement.controls = false;

  // Set autoplay
  videoElement.setAttribute('autoplay', 'true');
  videoElement.autoplay = true;

  // Set playsinline for iOS
  videoElement.setAttribute('playsinline', 'true');
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.playsInline = true;

  mainMediaContainer.prepend(videoElement);

  log('Created special-video-header div:');
  log(`Video element created and added to container: ${mainMediaContainer.id}`);

  
  try {
    log('Attempting to load Shaka player...');
    shaka = await import('shaka-player');
    log('Shaka player imported successfully');
    await setupPlayer();
    loaded = true;
    setupObserver();
    log('Shaka player loaded successfully');
  } catch (error) {
    log(`Failed to load Shaka player: ${error.message}`, 'error');
    log('Falling back to other video players...');
    setupPlayer();
  }

  videoElement.addEventListener('play', () => {
    isPlaying = true;
    log('Video started playing');
  });
  videoElement.addEventListener('pause', () => {
    isPlaying = false;
    log('Video paused');
  });
  videoElement.addEventListener('ended', () => {
    isPlaying = false;
    log('Video ended');
    // Restart the video if loop is enabled
    if (settings.loop) {
      log('Restarting video due to loop setting');
      videoElement.currentTime = 0;
      videoElement.play().catch(error => 
        log(`Failed to restart video: ${error.message}`, 'error')
      );
    }
  });
  
  // Add debugging for video duration and time tracking
  videoElement.addEventListener('loadedmetadata', () => {
    log(`Video duration: ${videoElement.duration}s`);
    
    // Set up a timer-based fallback for looping
    if (settings.loop && videoElement.duration > 0) {
      const expectedEndTime = Date.now() + (videoElement.duration * 1000);
      log(`Setting up timer fallback - video should end at ${new Date(expectedEndTime).toLocaleTimeString()}`);
      
      setTimeout(() => {
        if (isPlaying && videoElement.currentTime > videoElement.duration * 0.9) {
          log('Timer fallback: Video should have ended, forcing restart');
          videoElement.currentTime = 0;
          videoElement.play().catch(error => 
            log(`Failed to restart video via timer fallback: ${error.message}`, 'error')
          );
        }
      }, (videoElement.duration * 1000) + 1000); // Add 1 second buffer
    }
  });

  videoElement.addEventListener('timeupdate', () => {
    // Log time updates every 5 seconds to track progress
    if (Math.floor(videoElement.currentTime) % 5 === 0 && videoElement.currentTime > 0) {
      const timeUntilEnd = videoElement.duration - videoElement.currentTime;
      log(`Video progress: ${videoElement.currentTime.toFixed(1)}s / ${videoElement.duration.toFixed(1)}s (${timeUntilEnd.toFixed(1)}s remaining)`);
    }
    
    // Handle looping when video reaches the end - be more aggressive
    if (settings.loop && videoElement.duration > 0) {
      const timeUntilEnd = videoElement.duration - videoElement.currentTime;
      
      // If we're very close to the end (within 0.5 seconds) or if we're stuck
      if (timeUntilEnd <= 0.5) {
        log(`Video near end: ${videoElement.currentTime.toFixed(2)}s / ${videoElement.duration.toFixed(2)}s (${timeUntilEnd.toFixed(2)}s remaining) - restarting...`);
        videoElement.currentTime = 0;
        videoElement.play().catch(error => 
          log(`Failed to restart video via timeupdate: ${error.message}`, 'error')
        );
      }
      
      // Additional check: if video seems stuck at the same position for too long
      if (timeUntilEnd <= 1.0 && !videoElement.ended) {
        // Check if we've been at this position for more than 2 seconds
        if (!window.lastStuckTime) {
          window.lastStuckTime = Date.now();
          window.lastStuckPosition = videoElement.currentTime;
        } else if (Math.abs(videoElement.currentTime - window.lastStuckPosition) < 0.1) {
          const stuckDuration = (Date.now() - window.lastStuckTime) / 1000;
          if (stuckDuration > 2) {
            log(`Video appears stuck for ${stuckDuration.toFixed(1)}s at ${videoElement.currentTime.toFixed(2)}s - forcing restart`);
            videoElement.currentTime = 0;
            videoElement.play().catch(error => 
              log(`Failed to restart stuck video: ${error.message}`, 'error')
            );
            window.lastStuckTime = null;
            window.lastStuckPosition = null;
          }
        } else {
          // Reset stuck tracking if video is progressing
          window.lastStuckTime = null;
          window.lastStuckPosition = null;
        }
      }
    }
  });

  setupObserver(); // Initialize the Intersection Observer

  if (imgEl) {
    //imgEl.style.visibility = 'hidden';
  }

})


  async function setupPlayer() {
    log('setupPlayer called');
    if (!vidLoaded) {
      vidLoaded = true;
      log('Initializing video player...');
      await initializeVideoPlayer();
    } else {
      log('Video already loaded, skipping initialization');
    }
  }

  async function initializeVideoPlayer() {
    log('initializeVideoPlayer called');
    log(`Platform detection - Android: ${isAndroid(targetDocument)}, iOS: ${isIOS(targetDocument)}`);
    
    // Check streaming capability first
    const streamingCapability = await checkStreamingCapability();
    
    // If streaming is not recommended, force standard player
    if (!streamingCapability.canStream) {
      log('Forcing standard player due to poor connection or low resolution screen');
      format = 'Standard video (forced)';
      standardPlayer();
      return;
    }
    
    if (isAndroid(targetDocument) || isIOS(targetDocument)) {
      if (isAndroid(targetDocument)) {
        format = 'Guardian android app: Shaka player';
        log('Using Shaka player for Android');
        initShakaPlayer();
      } else {
        format = 'Guardian iOS app';
        log('Using standard player for iOS');
        standardPlayer();
      }
      return;
    }

    log('Checking video format support...');
    if (shaka && shaka.Player && shaka.Player.isBrowserSupported()) {
      format = 'Shaka supported';
      log('Using Shaka player');
      initShakaPlayer();
    } else if (Hls.isSupported()) {
      format = 'HLS supported';
      log('Using HLS player');
      initHLSPlayer();
    } else if (videoElement.canPlayType('video/mp4')) {
      format = 'MP4 supported';
      log('Using standard MP4 player');
      standardPlayer();
    } else {
      format = 'No supported video format';
      log('No supported video format found', 'error');
    }
  }

  function initHLSPlayer() {
    format = 'HLS video';
    log('Initializing HLS player...');
    if (Hls.isSupported()) {
      const hls = new Hls();
      
      // Configure for high resolution if forceHighRes is enabled
      if (shouldForceHighRes()) {
        log('Forcing high-resolution HLS streaming');
        hls.config.abr = {
          enabled: false, // Disable adaptive bitrate to force highest quality
          defaultBandwidthEstimate: 1000000 // 1Mbps estimate for high quality
        };
        hls.config.startLevel = -1; // Start with highest quality level
      }
      
      const hlsUrl = `${settings.url}/hls/${settings.src.trim()}/master.m3u8`;
      log(`Loading HLS source: ${hlsUrl}`);
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoElement);
      
      // Add event listener for when video ends to restart it
      if (settings.loop) {
        videoElement.addEventListener('ended', () => {
          log('HLS video ended, restarting...');
          videoElement.currentTime = 0;
          videoElement.play().catch(error => 
            log(`Failed to restart HLS video: ${error.message}`, 'error')
          );
        });
      }
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        log(`HLS error: ${JSON.stringify(data)}`, 'error');
        standardPlayer();
      });
    }
  }

  async function initShakaPlayer() {
    format = 'Shaka video';
    log('Initializing Shaka player...');
    player = new shaka.Player();
    
    // Configure for high resolution if forceHighRes is enabled
    if (shouldForceHighRes()) {
      log('Forcing high-resolution DASH streaming');
      player.configure({
        abr: {
          enabled: false // Disable adaptive bitrate to force highest quality
        },
        streaming: {
          bufferingGoal: 5, // Increase buffering goal for smoother high-res playback
          rebufferingGoal: 3
        }
      });
    }
    
    // Configure looping
    if (settings.loop) {
      log('Configuring Shaka player for looping');
      player.configure({
        streaming: {
          ...player.getConfiguration().streaming,
          alwaysStreamText: false
        }
      });
      
      // Add Shaka-specific event listeners for looping
      player.addEventListener('ended', () => {
        log('Shaka player ended event fired');
        if (settings.loop) {
          log('Restarting Shaka video via ended event');
          videoElement.currentTime = 0;
          videoElement.play().catch(error => 
            log(`Failed to restart Shaka video via ended: ${error.message}`, 'error')
          );
        }
      });
    }
    
    try {
      await player.attach(videoElement);
      const dashUrl = `${settings.url}/dash/${settings.src.trim()}/manifest.mpd`;
      log(`Loading DASH source: ${dashUrl}`);
      await player.load(dashUrl);
      
      // Add event listener for when video ends to restart it
      if (settings.loop) {
        videoElement.addEventListener('ended', () => {
          log('Shaka video ended, restarting...');
          videoElement.currentTime = 0;
          videoElement.play().catch(error => 
            log(`Failed to restart Shaka video: ${error.message}`, 'error')
          );
        });
      }
      
      log('Shaka player initialized successfully');
    } catch (error) {
      log(`Shaka player error: ${error.message}`, 'error');
      initHLSPlayer();
    }
  }

  function standardPlayer() {
    format = 'Standard video';
    log('Initializing standard player...');
    try {
      const screenWidth = document.documentElement.clientWidth;
      const iosWidth = calculateIOSWidth(screenWidth);
      log(`Screen width: ${screenWidth}px, iOS width: ${iosWidth}px`);
      const videoPath = `${settings.url}/${settings.src.trim()}-${iosWidth}.mp4`;
      log(`Loading MP4 source: ${videoPath}`);
      videoElement.src = videoPath;
      videoElement.load();
      log(`Loading standard video: ${videoPath}`);
    } catch (error) {
      log(`Standard player error: ${error.message}`, 'error');
    }
  }

  function togglePlayPause() {
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  }

  // Initialize Intersection Observer
  function setupObserver() {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && loaded && !isPlaying) {
            videoElement.play().catch(error => 
              log(`Failed to play video: ${error.message}`, 'error')
            );
          } else if (!entry.isIntersecting && isPlaying) {
            // Don't pause if video is near the end (within 1 second) to allow looping
            const timeUntilEnd = videoElement.duration - videoElement.currentTime;
            if (timeUntilEnd > 1) {
              videoElement.pause();
              log(`Video paused by intersection observer. Time until end: ${timeUntilEnd.toFixed(2)}s`);
            } else {
              log(`Not pausing video near end. Time until end: ${timeUntilEnd.toFixed(2)}s`);
            }
          }
        });
      },
      { threshold: 0.5 } // Adjust threshold as needed
    );
    
    if (videoElement) {
      intersectionObserver.observe(videoElement);
      log('Intersection observer setup complete');
    }
  }

// Function to calculate iOS width for video sizing
function calculateIOSWidth(width) {
  const iosBreakpoints = [
    { maxWidth: 231, value: 230 },
    { maxWidth: 271, value: 270 },
    { maxWidth: 361, value: 360 },
    { maxWidth: 541, value: 540 },
    { maxWidth: 721, value: 720 },
    { maxWidth: 1081, value: 1080 },
    { maxWidth: 1281, value: 1280 },
    { maxWidth: Infinity, value: 1920 }
  ];
  
  for (let i = 0; i < iosBreakpoints.length; i++) {
    if (width < iosBreakpoints[i].maxWidth) {
      return iosBreakpoints[i].value;
    }
  }
  return iosBreakpoints[iosBreakpoints.length - 1].value;
}

</script>


<div class="atom" style="width: 100%;">
  {#if testing}
  <div class="log-container">
    {#each logMessages as message}
      <div class="log-message {message.type}">
        {message.text}
      </div>
    {/each}
  </div>
  {/if}
</div>

<style lang="scss">
  .log-container {
    margin-top: 20px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
  }

  .log-message {
    padding: 4px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    &.error {
      color: #d32f2f;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  h2 {
    @include f-headline();
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
</style>