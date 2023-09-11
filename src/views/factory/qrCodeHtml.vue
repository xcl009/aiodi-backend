<template>
  <div class="fixed p-all qrcode" v-if="show">
    <div id="reader"></div>
    <div class="text-white text-center" style="margin-top: 330px;" @click="stop(); show = false; $emit('ok', '')">取消</div>
  </div>
</template>

<script>
  import {
    Html5Qrcode
  } from "html5-qrcode"
  export default {
    data() {
      return {
        show: false
      }
    },
    beforeDestroy() {
      if(this.html5QrCode) this.stop()
    },
    methods: {
      getCameras() {
        this.show = true
        Html5Qrcode.getCameras()
          .then((devices) => {
            if (devices && devices.length) {
              this.html5QrCode = new Html5Qrcode("reader")
              this.start()
            } else {
              this.show = false
            }
          })
          .catch((err) => {
            this.show = false
            this.html5QrCode = new Html5Qrcode("reader")
            this.error = "ERROR: 您需要授予相机访问权限"
            this.$emit("err", this.error)
          })
      },
      start() {
        //environment后置 user前置
        this.html5QrCode
          .start({
              facingMode: "environment"
            }, {
              fps: 2,
              qrbox: {
                width: 250,
                height: 250
              },
            },
            (decodedText, decodedResult) => {
              this.$emit('ok', decodedText)
              this.stop()
              this.show = false
            }
          )
          .catch((err) => {
            this.$emit('err', err)
            this.stop()
            this.show = false
          })
      },
      stop() {
        this.html5QrCode
          .stop()
          .then((ignore) => {
            // QR Code scanning is stopped.
            console.log("QR Code scanning stopped.")
          })
          .catch((err) => {
            // Stop failed, handle it.
            console.log("Unable to stop scanning.")
          })
      },
    },
  };
</script>

<style lang="scss" scoped>
  .qrcode {
    background: #000000;
    opacity: 0.48;
  }

  #reader {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
</style>
