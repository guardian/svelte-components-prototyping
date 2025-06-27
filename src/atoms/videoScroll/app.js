import "./styles/main.scss"
import Atom from "./components/Atom.svelte"

// enable this when creating an atom for the article template
// import '$lib/helpers/resizeFrame';

// create scrollbar width CSS variable
import "$lib/helpers/scrollbarWidth"

import { hydrate, mount } from "svelte"

let isAndroid = document.querySelector("body").classList.contains("android")
let isIOS = document.querySelector("body").classList.contains("ios")

let app

if (!isAndroid && !isIOS) {
  app = hydrate(Atom, {
    target: document.getElementById("gv-atom"),
    props: { name: "atom" },
  })
} else {
  // Android doesn't support hydrate - reads hydration markers differently to other browser engines
  // ios also seems to struggle
  let atomEl = document.getElementById("gv-atom")
  atomEl.innerHTML = ""
  app = mount(Atom, {
    target: document.getElementById("gv-atom"),
    props: { name: "atom" },
  })
}

export default app
