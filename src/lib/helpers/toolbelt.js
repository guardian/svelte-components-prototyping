/*
export function getJson(url) {
  return fetch(`${url}`).then(r => {
    return r.json()
  })
}
*/

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

export function partyNames(party) {
        return (party=="Australian Labor Party") ? "Labor" :
        (party=="Liberal National Party of Queensland") ? "LNP" :
        (party=="The Nationals") ? "National" :
        (party=="The Greens (VIC)") ? "Greens" : 
        (party=="Pauline Hanson's One Nation") ? 'One Nation' :
        (party=="Independent") ? 'Independent' :
        (party=="United Australia Party") ? 'UAP' :
        (party=="Katter's Australian Party (KAP)") ? 'Katter Party' :
        (party=="Centre Alliance") ? 'Centre Alliance' : party ;
}

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

/*
  export function commas(num) {
    return num.toLocaleString();
  }
*/

export function createTickerFeed(data) {
    // Filter out any entries with an empty prediction.
    const predictions = data.electorates.filter(d => d.prediction !== "");
  
    // Create a Map for quick lookup of party names by party code.
    const partyMap = new Map(data.partyNames.map(item => [item.partyCode, item]));
  
    // Update each prediction with additional properties.
    predictions.forEach(prediction => {
      prediction.announced = "Predicted"; // You can add a dynamic timestamp if needed.
      prediction.status = prediction.prediction === prediction.incumbent ? "hold" : "wins";
      prediction.label =
        prediction.prediction !== "IND"
          ? (partyMap.get(prediction.prediction)?.partyName ?? "")
          : prediction["prediction-name"];
    });
  
    // Partition predictions into those with a timestamp and those without.
    const { withTimestamp, withoutTimestamp } = predictions.reduce(
      (acc, item) => {
        if (item.timestamp !== "") {
          // Calculate Unix timestamp (in seconds).
          item.unix = Math.floor(new Date(item.timestamp).getTime() / 1000);
          acc.withTimestamp.push(item);
        } else {
          acc.withoutTimestamp.push(item);
        }
        return acc;
      },
      { withTimestamp: [], withoutTimestamp: [] }
    );
  
    // Sort items that have timestamps in descending order (most recent first).
    withTimestamp.sort((a, b) => b.unix - a.unix);
  
    // Return the combined array with timestamped items first.
    return [...withTimestamp, ...withoutTimestamp];
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
  

  export function autocomplete(inputValue, places) {
    if (!inputValue || inputValue.length === 0) {
      return []
    }

    let topSuggestions = places.filter((item) => {
      return item.toLowerCase().startsWith(inputValue.toLowerCase())
    })

    let otherSuggestions = places.filter((item) => {
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


  export function setColour(party) {
    //console.log("Party: ", party)
    const partyColours = {
      "ALP": "alp",
      "Australian Labor Party": "alp",
      "Labor": "alp",
      "Coalition": "coal",
      "GRN": "grn",
      "Greens": "grn",
      "Australian Greens": "grn",
      "IND": "ind",
      "Independent": "ind",
      "One Nation": "on",
      "Katter's Australian": "kap",
      "Katter's Australian Party": "kap",
      "ON": "on",
      "UAP": "uap",
      "United Australia": "uap",
      "KAP": "kap",
      "XEN": "xen",
      "CA": "ca",
      "Nick Xenophon Team": "ca",
      "Centre Alliance": "ca",
      "NAT": "nat",
      "The Nationals": "nat",
      "Nationals": "nat",
      "National Party of Australia": "nat",
      "Nationals WA": "nat",
      "LIB": "lib",
      "Liberal": "lib",
      "Liberal Party of Australia": "lib",
      "LNP": "np",
      "Liberal Nationals": "np",
      "Liberal National": "np",
      "Country": "nat",
      "National Country": "nat",
      "National Country Party": "nat",
      "Australian Country Party": "nat"
    };
    return partyColours[party] ? partyColours[party] : "others";
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


  /**
 * Calculates the frequency count of values for a given key in an array of objects.
 * @param {Array} data - An array of JSON objects.
 * @param {string} key - A key name whose corresponding values in the objects will be tallied.
 * @returns {Object} An object containing the frequency of each value found under the provided key.
 */
export function tallyFrequency(data, key) {
  return data.reduce((acc, obj) => {
    // Check if the object has the given key
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      // Increment the count for this value
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});
}


export function tallyFrequencyReversed(data, key) {
  // First, get the frequency object normally.
  const freq = tallyFrequency(data, key);
  // Get an array of the keys (these are in insertion order,
  // but if they are numeric, JavaScript will sort them numerically).
  const keys = Object.keys(freq);
  // Extract the associated values.
  const values = keys.map(k => freq[k]);
  // Reverse the values array.
  const reversedValues = values.reverse();
  // Create a new object with the same keys and the reversed values.
  const newFreq = {};
  keys.forEach((k, i) => {
    newFreq[k] = String(reversedValues[i]); // convert the value to a string
  });
  return newFreq;
}


export function resizeIframe(elem="#gv-atom") {
  if (window.frameElement) {
    const target = document.querySelector(elem);

    console.log("Inside version 1.1");

    // Post message to parent window to adjust the height
    window.parent.postMessage({
      sentinel: 'amp',
      type: 'embed-size',
      height: document.body.scrollHeight
    }, '*');

    // Hide the overflow to avoid scrollbars
    document.body.style.overflow = 'hidden';

    // Set the initial height of the iframe
    window.frameElement.height = target.offsetHeight;

    // Function to detect height changes of an element
    function onElementHeightChange(elm, callback) {
      let lastHeight = elm.clientHeight;
      let newHeight;
      (function run() {
        newHeight = elm.clientHeight;
        if (lastHeight !== newHeight) callback();
        lastHeight = newHeight;

        if (elm.onElementHeightChangeTimer) {
          clearTimeout(elm.onElementHeightChangeTimer);
        }
        elm.onElementHeightChangeTimer = setTimeout(run, 200);
      })();
    }

    // Watch for changes in the body's height
    onElementHeightChange(document.body, function() {
      window.frameElement.height = target.offsetHeight + 100;
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
