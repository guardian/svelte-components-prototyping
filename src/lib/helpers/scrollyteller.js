import { supportsSticky } from "./util.js"

class ScrollyTeller {
  constructor(config) {
    this.scrollWrapper = config.parent.querySelector(".scroll-wrapper")

    const emptyWrapperHeight = this.scrollWrapper.getBoundingClientRect().height
    const quarter = window.innerHeight * 0.25

    config.parent.querySelectorAll(".scroll-text__div").forEach((el) => {
      const elHeight = el.getBoundingClientRect().height
      el.parentElement.style.height =
        elHeight > quarter
          ? emptyWrapperHeight + elHeight - quarter + "px"
          : emptyWrapperHeight + "px"
    })
    this.isMobile = window.innerWidth < 740
    this.triggerTop = !this.isMobile
      ? config.triggerTop
      : config.triggerTopMobile
    this.scrollInner = config.parent.querySelector(".scroll-inner")
    this.scrollText = config.parent.querySelector(".scroll-text")
    this.lastScroll = null
    this.lastI = null
    this.triggerPoints = []
    this.textBoxes = [].slice.apply(
      this.scrollText.querySelectorAll(".scroll-text__inner"),
    )
    this.transparentUntilActive = config.transparentUntilActive
    this.scrollWrapper.style.height =
      this.textBoxes
        .map((d) => d.getBoundingClientRect().height)
        .reduce((a, b) => a + b) + "px"
    this.boxesTops = this.textBoxes.map((d) => d.getBoundingClientRect().top)
    this.initialScrollTop = this.scrollText.getBoundingClientRect().top

    if (this.transparentUntilActive) {
      config.parent.classList.add("transparent-until-active")
    }
  }

  checkScroll() {
    if (this.lastScroll !== window.pageYOffset) {
      const bbox = this.scrollText.getBoundingClientRect()

      if (!supportsSticky) {
        if (bbox.top <= 0 && bbox.bottom >= window.innerHeight) {
          this.scrollInner.classed("fixed-top", true)
          this.scrollInner.classed("absolute-bottom", false)
          this.scrollInner.classed("absolute-top", false)
        } else if (bbox.top <= 0) {
          this.scrollInner.classed("fixed-top", false)
          this.scrollInner.classed("absolute-bottom", true)
          this.scrollInner.classed("absolute-top", false)
        } else {
          this.scrollInner.classed("fixed-top", false)
          this.scrollInner.classed("absolute-bottom", false)
          this.scrollInner.classed("absolute-top", true)
        }
      }

      if (
        bbox.top < window.innerHeight * this.triggerTop &&
        bbox.bottom > window.innerHeight / 2
      ) {
        const diffs = this.boxesTops.map(
          (t) => t + bbox.top - this.initialScrollTop,
        )
        const i = diffs
          .map((d) => d <= window.innerHeight * this.triggerTop)
          .lastIndexOf(true)

        if (i !== this.lastI) {
          this.lastI = i
          this.doScrollAction(i)

          if (this.transparentUntilActive) {
            this.textBoxes.forEach((el, j) => {
              if (j <= i) {
                el.style.opacity = "1"
              } else {
                el.style.opacity = "0.25"
              }
            })
          }
        }
      }

      this.lastScroll = window.pageYOffset
    }

    window.requestAnimationFrame(this.checkScroll.bind(this))
  }

  doScrollAction(i) {
    const trigger = this.triggerPoints.find((d) => d.num === i + 1)
    if (trigger) {
      trigger.do()
    }
  }

  watchScroll() {
    window.requestAnimationFrame(this.checkScroll.bind(this))
  }

  addTrigger(t) {
    this.triggerPoints.push(t)
  }
}

export default ScrollyTeller
