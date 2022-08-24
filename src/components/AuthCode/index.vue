<template>
  <el-button class="ml-10 auth-code_btn" :disabled="authCountdown" @click="$emit('authCode')">
    {{ authCountdown ? authCountTime + '秒后重试' : '获取验证码'}}
  </el-button>
</template>

<script>
export default {
  name: 'AuthCode',
  props: {
    
  },
  data() {
    return {
      authCountdown: false,
      authCountTime: 0
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 获取验证码
     */
    getAuthCode(params, url = 'iot-saas-basic/brand/open/sendRegisterCode'){
      this.codeTime()
      this.$post(url, params).then(res => {

      }).catch(() => {
        this.$message({
          message: '验证码发送失败，请重新尝试',
          type: 'error'
        })
        this.authCountdown = false
      })
    },

    /**
     * 验证码倒计时
     */
    codeTime(){
      const TIME_COUNT = 120
      if (!this.timer) {
        this.authCountTime = TIME_COUNT
        this.authCountdown = true
        this.timer = setInterval(() => {
        if (this.authCountTime > 0 && this.authCountTime <= TIME_COUNT) {
          this.authCountTime--
        } else {
          this.authCountdown = false
          clearInterval(this.timer)
          this.timer = null
          }
        }, 1000)
      }
    },
  }
}
</script>
