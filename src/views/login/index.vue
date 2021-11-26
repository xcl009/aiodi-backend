<template>
  <el-row type="flex" align="middle" class="login-container flex-wrap">
    <el-image class="abs p-all" src="https://rainywp.oss-cn-shenzhen.aliyuncs.com/pwd/2020-10-28/173917111.jpg" fit="cover"></el-image>
    <div class="login-form">
      <div class="rel logo">
        <div class="sem"></div>
        <img class="rel" :src="platformConfig.mini_logo || '/logo.png'" alt="">
      </div>
      <div class="title-container text-center rel">
        <img class="abs jiao" src="@/assets/jiao.png" v-for="item in 4" alt="">
        <div class="mt-30 mb-30 title fs-b3 text-white">欢迎登录物享云联后台管理系统</div>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="left">
          <el-form-item class="mt-20 mb-40" prop="username">
            <el-input ref="username" v-model="loginForm.username" type="text" name="username" tabindex="1" autocomplete="on" placeholder="请输入用户名">
              <svg-icon class="svg-i" slot="prefix" icon-class="zhanghu" />
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <span slot="suffix" class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType" name="password" tabindex="2" autocomplete="on" placeholder="请输入密码" @keyup.enter.native="handleLogin">
              <svg-icon class="svg-i" slot="prefix" icon-class="password" />
            </el-input>
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
          <el-button class="mt-20 login-btn" type="primary" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>
        </el-form>
      </div>
    </div>
  </el-row>
</template>

<script>
  import { getToken, setToken, removeToken } from '@/utils/auth'
  import AuthCode from '@/components/AuthCode/'
  export default {
    name: 'Login',
    components: {
      AuthCode
    },
    data() {
      const validateUsername = (rule, value, callback) => {
        if (!value || value.length < 1) {
          callback(new Error('请输入用户名'))
        } else {
          callback()
        }
      }
      const validatePassword = (rule, value, callback) => {
        if (!value || value.length < 6) {
          callback(new Error('请输入密码'))
        } else {
          callback()
        }
      }
      const validatePhone = (rule, value, callback) => {
        if (!value || value.length == 0) {
          callback(new Error('请输入手机号码'))
        }else if(!(/^1[3457689]\d{9}$/.test(value))){
          callback(new Error('手机号码格式不正确'))
        } else {
          callback()
        }
      }
      const validateAuthcode = (rule, value, callback) => {
        if (!value || value.length < 4) {
          callback(new Error('请输入短信验证码'))
        } else {
          callback()
        }
      }
      return {
        platformConfig: {},
        loginType: '1',
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        loginRules: {
          username: [{
            required: true,
            trigger: 'blur',
            validator: validateUsername
          }],
          password: [{
            required: true,
            trigger: 'blur',
            validator: validatePassword
          }]
        },
        authForm: {},
        authRules: {
          phone_num: [{
            required: true,
            trigger: 'blur',
            validator: validatePhone
          }],
          captche_num: [{
            required: true,
            trigger: 'blur',
            validator: validateAuthcode
          }]
        },
        loading: false,
        passwordType: 'password',
        redirect: undefined
      }
    },
    watch: {
      $route: {
        handler: function(route) {
          this.redirect = route.query && route.query.redirect
        },
        immediate: true
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 获取平台信息
       */
      getPlatformConfig(){
        this.$store.dispatch('user/getPlatformConfig', {
          agent_id: this.gid
        }).then(res => {
          this.platformConfig = res
        })
      },

      /**
       * 显示密码
       */
      showPwd() {
        if (this.passwordType === 'password') {
          this.passwordType = ''
        } else {
          this.passwordType = 'password'
        }
        this.$nextTick(() => {
          this.$refs.password.focus()
        })
      },

      /**
       * 密码登录
       */
      handleLogin() {
        this.$refs.loginForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('user/login', this.loginForm).then(res => {
              location.href = this.redirect || '/home'
              this.loading = false
            }).catch(() => {
              this.loading = false
            })
          } else {
            return false
          }
        })
      },

      /**
       * 获取验证码
       */
      getAuthCode(){
        this.$refs.authForm.validateField('phone_num', valid => {
          if (valid) return false
          this.$refs.authCode.getAuthCode({
            phone_num: this.authForm.phone_num,
            platform_agent_id: this.gid,
            type: 3
          })
        })
      },

      /**
       * 验证码登录
       */
      authLogin() {
        this.$refs.authForm.validate(valid => {
          if (valid) {
            this.loading = true
            this.$store.dispatch('user/codeLogin', this.authForm).then(res => {
              if(res.status_code == 'NEW_USER'){
                this.$router.push({ path: '/regist', query: { 'gid': this.gid } })
              } else {
                location.href = this.redirect || '/home'
              }
            }).catch(() => {
              this.loading = false
            })
          } else {
            return false
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  /* 修复input 背景不协调 和光标变色 */
  /* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */
  $bg: #283443;
  $light_gray: #fff;
  $cursor: #fff;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input {
      color: $bg;
    }
  }

  $bg: #2d3a4b;
  $dark_gray: #889aa4;
  $light_gray: #eee;

  .login-container {
    padding-bottom: 100px;
    min-height: 100%;
    width: 100%;
    overflow: hidden;

    .el-input {
      input {
        padding-left: 40px;
        height: 50px;
      }
    }

    .login-form {
      position: relative;
      width: 520px;
      max-width: 96%;
      margin: 0 auto;
      overflow: hidden;

      .logo {
        width: 120px;
        height: 120px;
        margin: 0 auto -55px;
        z-index: 999;
        img{
          margin-top: 3px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
        }
        .sem{
          top: 0;
          left: -4px;
          position: absolute;
          content: '';
          width: 128px;
          height: 65px;
          border-radius: 65px 65px 0 0;
          background: rgba(11, 161, 248, .5);
        }
      }
    }

    .slogan {
      width: 600px;
      height: 380px;
      max-width: 96%;
      margin: 0 auto;
      font-size: 60px;
      line-height: 100px;
      text-shadow: 1px 1px 0 rgba(255, 255, 255, .8), 2px 2px 0 rgba(255, 255, 255, .8);
      color: #444;
      .cursor{
        display: inline-block;
        height: 60px;
        width: 1px;
        background: #303133;
        vertical-align: middle;
        margin: -4px 0 0 5px;
        animation: caret-smooth 1s ease-in-out infinite
      }
    }

    @keyframes caret-smooth {
      0%,20% {
        opacity: 1
      }

      60%,to {
        opacity: 0
      }
    }

    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-i {
      margin: 17px 0 0 8px;
      color: #00e1eb;
    }

    .title-container {
      padding: 50px;
      background: rgba(11, 161, 248, .1);
      border: 3px solid rgba(11, 161, 248, .5);
      .title{
        letter-spacing: 3px;
      }
      .el-input__inner{
        background: rgba(11, 161, 248, .4);
        border: none;
        color: #fff;
      }
      .login-btn{
        width: 100%;
        letter-spacing: 5px;
        font-size: 16px;
        &:hover{
          color: #000;
        }
      }

      .jiao{
        width: 50px;
        &:nth-child(1){
          left: -3px;
          top: -3px;
        }
        &:nth-child(2){
          right: -3px;
          top: -3px;
          transform: rotateY(180deg);
        }
        &:nth-child(3){
          left: -3px;
          bottom: -3px;
          transform: rotateX(180deg);
        }
        &:nth-child(4){
          right: -3px;
          bottom: -3px;
          transform: rotateY(180deg) rotateX(180deg);
        }
      }
    }

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 8px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }

    .el-tabs__item{
      height: 60px;
      line-height: 60px;
      color: #fff;
      &.is-active {
        color: #00ffeb;
      }
    }
    .el-tabs__active-bar{
      background: #00ffeb;
    }

    .auth-code_btn{
      background: rgba(11,161,248,0.4);
      color: #fff;
    }
  }
</style>
