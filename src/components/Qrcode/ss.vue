<template>
  <!--
  生成二维码开放接口:
 二维码内容[通常为url]
 二维码大小[限制为正方形]
 二维码下方显示：文字
 二维码中间显示：图片
 -->
  <div id="meQrcode" :title="qrText">
    <div class="qrcode_box">
      <img class="qrcode_canvas" id="qrcode_canvas" ref="qrcode_canvas" :alt="$t('components.codeImg')" />
      <img v-if="qrLogo" class="qrcode_logo" ref="qrcode_logo" :src="qrLogo" :alt="$t('components.companyLogo')" />
      <canvas :width="qrSize" :height="qrSize + 20" class="canvas bg-white" ref="canvas"></canvas>
    </div>
  </div>
</template>
<script>
import QRCode from "qrcode"
export default {
  props: {
    qrUrl: {
      type: String,
      default: "http://www.baidu.com/"
    },
    qrSize: {
      type: Number,
      default: 300
    },
    qrText: {
      default: "NO.202002110000045"
    },
    qrLogo: {
      type: String,
      default: ''
    },
    qrLogoSize: {
      type: Number,
      default: 50
    },
    qrTextSize: {
      type: Number,
      default: 14
    }
  },
  data() {
    return {};
  },
  methods: {
    /**
     * @argument qrUrl        二维码内容
     * @argument qrSize       二维码大小
     * @argument qrText       二维码中间显示文字
     * @argument qrTextSize   二维码中间显示文字大小(默认16px)
     * @argument qrLogo       二维码中间显示图片
     * @argument qrLogoSize   二维码中间显示图片大小(默认为80)
     */
    handleQrcodeToDataUrl() {
      let qrcode_canvas = this.$refs.qrcode_canvas;
      let qrcode_logo = this.$refs.qrcode_logo;
      let canvas = this.$refs.canvas;
      const that = this;
      QRCode.toDataURL(
        this.qrUrl, {
        errorCorrectionLevel: "H"
      },
        (err, url) => {
          qrcode_canvas.src = url;
          // 画二维码里的logo// 在canvas里进行拼接
          let ctx = canvas.getContext("2d");

          setTimeout(() => {
            //获取图片
            ctx.drawImage(qrcode_canvas, 0, 0, that.qrSize, that.qrSize);
            if (that.qrLogo) {
              //设置logo大小
              //设置获取的logo将其变为圆角以及添加白色背景
              ctx.fillStyle = "#fff";
              ctx.beginPath();
              let logoPosition = (that.qrSize - that.qrLogoSize) / 2; //logo相对于canvas居中定位
              let h = that.qrLogoSize + 10; //圆角高 10为基数(logo四周白色背景为10/2)
              let w = that.qrLogoSize + 10; //圆角宽
              let x = logoPosition - 5
              let y = logoPosition - 5
              let r = //圆角半径
                ctx.moveTo(x + r, y);
              ctx.arcTo(x + w, y, x + w, y + h, r);
              ctx.arcTo(x + w, y + h, x, y + h, r);
              ctx.arcTo(x, y + h, x, y, r);
              ctx.arcTo(x, y, x + w, y, r);
              ctx.closePath();
              ctx.fill();
              qrcode_logo.onload = function () {
                ctx.drawImage(
                  qrcode_logo,
                  logoPosition,
                  logoPosition,
                  that.qrLogoSize,
                  that.qrLogoSize
                );
              }
            }
            if (that.qrText) {
              //设置字体
              ctx.font = "bold " + that.qrTextSize + "px Arial";
              let tw = ctx.measureText(that.qrText).width; //文字真实宽度
              let ftop = that.qrSize - that.qrTextSize; //根据字体大小计算文字top
              let fleft = (that.qrSize - tw) / 2; //根据字体大小计算文字left
              ctx.textBaseline = "top"; //设置绘制文本时的文本基线。
              ctx.fillStyle = "#333";
              ctx.fillText(that.qrText, fleft, ftop + 5);
            }
            qrcode_canvas.src = canvas.toDataURL();
          }, 0);
        }
      );
    }
  },
  mounted() {
    this.handleQrcodeToDataUrl();
  },
  updated() {
    this.handleQrcodeToDataUrl();
  },
};
</script>
<style scoped>
.qrcode_box,
#meQrcode {
  display: inline-block;
}

.qrcode_box img {
  padding: 50px;
  display: none;
}
</style>
