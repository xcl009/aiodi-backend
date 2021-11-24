
<template>
  <span :data-time="time" class="number-grow" :id="idName" :data-value="value">0</span></template>
<script>
export default {
  props: {
    idName: {
      default: 'grow_1'
    },
    time: {
      type: Number,
      default: 2
    },
    value: {
      type: Number,
      default: 720000
    }
  },
  methods: {
    isElementInViewport(offset = 0) {
        const box = this.els.getBoundingClientRect(),
              top = (box.top >= 0),
              left = (box.left >= 0),
              bottom = (box.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset),
              right = (box.right <= (window.innerWidth || document.documentElement.clientWidth) + offset);
        return (top && left && bottom && right);
    },

    numberGrow () {
      let that = this
      window.addEventListener('scroll',()=>{
        if(!that.growStatus){
          that.isViewPort = that.isElementInViewport()
          if(that.isViewPort){
            that.growStatus = true
            let step = (that.value * 10) / (that.time * 1000)
            let current = 0
            let start = 0
            let t = setInterval(() => {
              start += step
              if (start > that.value) {
                clearInterval(t)
                start = that.value
                t = null
              }
              if (current === start) {
                return
              }
              current = parseInt(start)
              that.els.innerHTML = current.toString().replace(/(\d)(?=(?:\d{3}[+]?)+$)/g, '$1,')
            }, 10)
          }
        }
      })
    }
  },
  mounted () {
    this.els = document.getElementById(this.idName)
    this.numberGrow()
  }
}
</script>

<style>

</style>
