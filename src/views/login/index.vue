<template>
  <el-row type="flex" align="middle" class="pb-30 login-container flex-wrap">
    <el-image class="abs p-all" src="https://oss.kuaihuoya.net/pwd/2021-12-14/090498296.png" fit="cover"></el-image>
    <div class="login-form">
      <el-row :gutter="0">
        <el-col :xs="24" :sm="24" :md="12" class="hidden-sm-and-down">
          <div class="rel p-50 flexv justify-between login-left text-white">
            <div class="rel pt-30">
              <div class="title text-bold">
                {{ siteInfo.appName || '物享云联' }}<br>
                {{ !siteInfo.appName ? 'SaaS' : '' }}后台管理系统
              </div>
              <div class="mt-15 flex align-center fs-c1">
                <div>万物互联</div>
                <div class="ml-10 mr-10 dot"></div>
                <div>共享发展</div>
                <div class="ml-10 mr-10 dot"></div>
                <div>驱动未来</div>
              </div>
            </div>
            <img class="rel" width="100" :src="siteInfo.appLogo || '/logo.png'" alt="">
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <div class="flex align-center justify-center title-container bg-white" :class="{'mobile': device_mobile}">
            <div class="pb-40">
              <div class="hello">您好！</div>
              <div class="mb-30 title fs-b2 text-gray">欢迎登录{{ siteInfo.appName }}后台管理系统</div>
              <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="left">
                <el-form-item prop="username">
                  <el-input ref="username" v-model="loginForm.username" type="text" name="username" tabindex="1" autocomplete="on" placeholder="请输入用户名/手机号">
                    <people class="svg-i" slot="prefix" theme="outline" size="16" fill="#4E5969"/>

                    <!-- <svg-icon class="svg-i" slot="prefix" icon-class="zhanghu" /> -->
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType" name="password" tabindex="2" autocomplete="on" placeholder="请输入密码" @keyup.enter.native="handleLogin">
                    <lock class="svg-i" slot="prefix" theme="outline" size="16" fill="#4E5969"/>
                  </el-input>
                  <span class="show-pwd" @click="showPwd">
                    <preview-close-one theme="outline" size="16" fill="#4E5969" v-if="passwordType === 'password'"/>
                    <preview-open theme="outline" size="16" fill="#4E5969" v-else/>
                  </span>
                </el-form-item>
                <el-button class="mt-20 login-btn" type="primary" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-row>
</template>

<script>
  import { getToken, setToken, removeToken } from '@/utils/auth'
  import { People, Lock, PreviewOpen, PreviewCloseOne } from '@icon-park/vue'
  export default {
    name: 'Login',
    components: {
      People,
      Lock,
      PreviewOpen,
      PreviewCloseOne
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
      return {
        siteInfo: {},
        loginType: '1',
        loginForm: {},
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
          }]
        },
        loading: false,
        passwordType: 'password',
        redirect: undefined,

        device_mobile: false,

        gid: this.$route.params.gid || ''
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
      this.device_mobile = this.$_isMobile()
      if(this.gid) this.getPlatformConfig()
    },
    methods: {
      $_isMobile() {
        const rect = document.body.getBoundingClientRect()
        return rect.width - 1 < 768
      },

      /**
       * 获取平台信息
       */
      getPlatformConfig(){
        this.$store.dispatch('user/getPlatformConfig', {
          brandId: this.gid
        }).then(res => {
          this.siteInfo = res
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
    min-height: 100%;
    width: 100%;
    overflow: hidden;
    .el-input {
      input {
        padding-left: 40px;
        height: 36px;
      }
    }
    .login-form {
      position: relative;
      max-width: 96%;
      max-height: 90vh;
      margin: 0 auto;
      overflow: hidden;
      .login-left{
        height: 692px;
        width: 596px;
        max-height: 90vh;
        max-width: 100%;
        .title{
          font-size: 56px;
        }
        .rel{
          z-index: 9;
        }
        &::after{
          content: '';
          background: rgba(255, 255, 255, .1);
          backdrop-filter: blur(5px);
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          z-index: 0;
        }
      }
      .dot{
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--white);
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
      margin: 12px 0 0 8px;
      color: #4E5969;
    }
    .title-container {
      width: 596px;
      height: 692px;
      max-height: 90vh;
      max-width: 100%;
      .hello{
        font-size: 36px;
      }
      .el-input__inner{
        width: 320px;
        background: var(--bodyBg);
        border: none;
      }
      .login-btn{
        width: 100%;
      }
      &.mobile{
        max-height: 60vh;
      }
    }
    .show-pwd {
      position: absolute;
      right: 10px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
    .auth-code_btn{
      background: rgba(11,161,248,0.4);
      color: #fff;
    }
  }
</style>
