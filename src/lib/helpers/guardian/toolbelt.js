
import appMap from "./appMap"

export async function getJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`getJson: HTTP ${response.status} fetching ${url}`);
      return [];
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`getJson: could not load JSON from ${url}`, err);
    return [];
  }
}

const isMobileApp = () => {
  const parentIsIos = document.querySelector(".ios")
  const parentIsAndroid = document.querySelector(".android")
  return parentIsIos || parentIsAndroid
}

const selectorAppOrDCR = (toSelect) =>
  isMobileApp() ? appMap[toSelect].app : appMap[toSelect].desktop

export function merge(to, from) {

    for (const n in from) {
        if (typeof to[n] != 'object') {
            to[n] = from[n];
        } else if (typeof from[n] == 'object') {
            to[n] = merge(to[n], from[n]);
        }
    }
    return to;
};

export function contains(a, b) {

    if (Array.isArray(b)) {
        return b.some(x => a.indexOf(x) > -1);
    }

    return a.indexOf(b) > -1;
}

export function sort(arr, value, ranked=false) {
    let ordered = arr.sort((a, b) => (a[value] < b[value]) ? 1 : -1)
    if (ranked) {
      ordered.forEach( (item, index) => {
          item.rank = index + 1
      });
    }
    return ordered
}

export function sum(arr, prop) {

    let total = 0
    for ( var i = 0, _len = arr.length; i < _len; i++ ) {
        total += arr[i][prop]
    }
    return total
}

export function commas(num) {
    var result = parseFloat(num).toFixed();
    result = result.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    return result
}

/**
 * Returns a human-friendly time difference string.
 *
 * @param {string|number} inputTime - Either a Unix timestamp (in seconds)
 *   or a formatted timestamp string (e.g. "05-31-2022 06:56:09").
 * @returns {string} A string such as "just now", "7 minutes ago", etc.
 */
export function timeAgo(inputTime) {
  if (inputTime == null) return "";

  let time;

  // 1) Unix timestamp
  if (
    typeof inputTime === "number" ||
    (typeof inputTime === "string" && /^\d+$/.test(inputTime))
  ) {
    time = new Date(Number(inputTime) * 1000);

  // 2) ISO-style string
  } else if (typeof inputTime === "string" && inputTime.includes("T")) {
    let dateString = inputTime.replace(/(\.\d{3})\d+/, "$1");
    time = new Date(dateString);

  // 3) Your MM-DD-YYYY HH:mm:ss format
  } else if (typeof inputTime === "string" && /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(inputTime)) {
    // Split date/time
    const [datePart, timePart] = inputTime.split(" ");
    const [MM, DD, YYYY] = datePart.split("-").map(Number);
    const [hh, mm, ss]    = timePart.split(":").map(Number);
    // Construct a local Date in your browser’s zone
    time = new Date(YYYY, MM - 1, DD, hh, mm, ss);

  // 4) Fallback (e.g. old-Safari)
} else if (
  typeof inputTime === "string" &&
  /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(inputTime)
) {
  const [datePart, timePart] = inputTime.split(" ");
  const [MM, DD, YYYY]      = datePart.split("-").map(Number);
  const [hh, mm, ss]        = timePart.split(":").map(Number);

  // Construct a UTC date so it's not treated as local
  time = new Date(Date.UTC(YYYY, MM - 1, DD, hh, mm, ss));
} else {
    return "";
  }

  if (isNaN(time.getTime())) return "";

  const now        = new Date();
  const diffMs     = now - time;
  const diffSec    = Math.floor(diffMs / 1000);
  const diffMin    = Math.floor(diffSec / 60);
  const diffHrs    = Math.floor(diffMin / 60);
  const diffDays   = Math.floor(diffHrs / 24);

  if (diffSec < 10)       return "just now";
  if (diffSec < 60)       return `${diffSec} second${diffSec === 1 ? "" : "s"} ago`;
  if (diffMin < 60)       return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHrs < 24)       return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
  return                    `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function isoToUnix(isoDate) {
  const msTimestamp = new Date(isoDate).getTime();
  return Math.floor(msTimestamp / 1000);
}
  

  export function autocomplete(inputValue, arrayOfStuff) {
    if (!inputValue || inputValue.length === 0) {
      return []
    }

    let topSuggestions = arrayOfStuff.filter((item) => {
      return item.toLowerCase().startsWith(inputValue.toLowerCase())
    })

    let otherSuggestions = arrayOfStuff.filter((item) => {
      if (topSuggestions.includes(item)) {
        return false
      }

      return item.toLowerCase().includes(inputValue.toLowerCase())
    })


    //console.log([...topSuggestions, ...otherSuggestions].slice(0, 10))

    return [...topSuggestions, ...otherSuggestions].slice(0, 10).map((item) => {
      //let result = this.results.find((result) => result.electorate.toLowerCase() === item.toLowerCase())

      //return result 

      //console.log(result)
      
      return {
        text: item
      }
    
    })
  }


  export function mustache(template, self, parent, invert) {
    var render = mustache
    var output = ""
    var i
  
    function get (ctx, path) {
      path = path.pop ? path : path.split(".")
      ctx = ctx[path.shift()]
      ctx = ctx != null ? ctx : ""
      return (0 in path) ? get(ctx, path) : ctx
    }
  
    self = Array.isArray(self) ? self : (self ? [self] : [])
    self = invert ? (0 in self) ? [] : [1] : self
    
    for (i = 0; i < self.length; i++) {
      var childCode = ''
      var depth = 0
      var inverted
      var ctx = (typeof self[i] == "object") ? self[i] : {}
      ctx = Object.assign({}, parent, ctx)
      ctx[""] = {"": self[i]}
      
      template.replace(/([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,
        function(match, code, y, z, close, invert, name) {
          if (!depth) {
            output += code.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g,
              function(match, raw, comment, isRaw, partial, name) {
                return raw ? get(ctx, raw)
                  : isRaw ? get(ctx, name)
                  : partial ? render(get(ctx, name), ctx)
                  : !comment ? new Option(get(ctx, name)).innerHTML
                  : ""
              }
            )
            inverted = invert
          } else {
            childCode += depth && !close || depth > 1 ? match : code
          }
          if (close) {
            if (!--depth) {
              name = get(ctx, name)
              if (/^f/.test(typeof name)) {
                output += name.call(ctx, childCode, function (template) {
                  return render(template, ctx)
                })
              } else {
                output += render(childCode, name, ctx, inverted) 
              }
              childCode = ""
            }
          } else {
            ++depth
          }
        }
      )
    }
    return output
  }

function updateParentVarFromArticleBackground() {
  try {
    const root = window.parent.document.documentElement;
    const articleBg = getComputedStyle(root).getPropertyValue('--article-background').trim();
    
    // Only set the property if the article background value exists
    if (articleBg) {
      root.style.setProperty('--interactive-atom-background', articleBg);
    }
  } catch (error) {
    console.log('Failed to update parent variable from article background:', error);
  }
}

export function resizeIframe() {
  if (window.self !== window.top) {
    setTimeout(() => {
      if (window.resize) {
        const html = document.querySelector("html");
        const body = document.querySelector("body");

        html.style.overflow = "hidden";
        html.style.margin = "0px";
        html.style.padding = "0px";

        body.style.overflow = "hidden";
        body.style.margin = "0px";
        body.style.padding = "0px";

        window.resize();
      }
    }, 100);

    const parentRoot = window.parent.document.documentElement;

    updateParentVarFromArticleBackground();

    const observer = new window.parent.MutationObserver(() => {
      updateParentVarFromArticleBackground();
    });

    observer.observe(parentRoot, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
}


/**
 * @param ts  A timestamp string in "MM-DD-YYYY HH:mm:ss" format,
 *            representing Australia/Sydney local time.
 * @returns   A JS Date object for that exact moment.
 */
export function parseAussieLocal(ts) {

  const date = new Date(ts * 1000);

  const sydneyString = date.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return sydneyString
}

export {
  selectorAppOrDCR
}