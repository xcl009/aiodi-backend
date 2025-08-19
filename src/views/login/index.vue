<template>
  <el-row type="flex" align="middle" class="pb-30 login-container flex-wrap">
    <!-- todo: CHANGE BEFORE GOING TO PRODUCTION. WE DO NOT HAVE THE RIGHTS FOR THIS IMAGE -->
    <!-- 待办事项：在投入生产前进行修改。我们没有此图像的使用权 -->
    <div >
      <el-image class="abs p-all" :src="require('@/assets/login-screen.jpg')" fit="cover"></el-image>
      <div class="abs p-all" style="background-color: rgba(0, 0, 0, 0.3)"></div>
    </div>
    <div class="login-form">
      <div class="flex align-center justify-center form-box bg-white p-50" :class="{ 'mobile': $_isMobile() }">
        <div class="pb-40 flexv">
          <img class="logo" src="@/assets/logo/ghoost-black.svg" alt="" />
          <span class="title text-primary">{{ $t('public.adminService') }}</span>
          <div class="mb-30 desc fs-b2 text-gray">{{ $t('login.logInToContinue') }}</div>
          <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="left">
            <el-form-item prop="username">
              <el-input ref="username" v-model="loginForm.username" type="text" name="username" tabindex="1"
                autocomplete="on" :placeholder="$t('login.username')">
                <people class="svg-i" slot="prefix" theme="outline" size="16" fill="#4E5969" />
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
                name="password" tabindex="2" autocomplete="on" :placeholder="$t('login.password')"
                @keyup.enter.native="handleLogin">
                <lock class="svg-i" slot="prefix" theme="outline" size="16" fill="#4E5969" />
              </el-input>
              <span class="show-pwd" @click="showPwd">
                <preview-close-one theme="outline" size="16" fill="#4E5969" v-if="passwordType === 'password'" />
                <preview-open theme="outline" size="16" fill="#4E5969" v-else />
              </span>
            </el-form-item>
            <el-button class="mt-20 login-btn" type="primary" :loading="loading"
              @click.native.prevent="handleLogin">{{ $t('public.login') }}</el-button>
          </el-form>
        </div>
      </div>
      <div class="flex justify-center align-end login-monkeyboos" v-if="THEME == 'MONKEYBOOS'">
        <el-image class="left-img hidden-sm-and-down" :src="require('@/assets/MONKEYBOOS.png')" fit="contain"></el-image>
        <div class="right-box bg-white">
          <div class="form-box">
            <div class="flex flexv align-center justify-around h-100 bg-white">
              <div>
                <div class="hello text-center text-bold">{{ $t('login.hello') }}！</div>
                <div class="title fs-b2 text-grey">{{ $t('login.logInToContinue') }}</div>
              </div>
              <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="left" class="">
                <el-form-item prop="username">
                  <el-input ref="username" v-model="loginForm.username" type="text" name="username" tabindex="1"
                    autocomplete="on" :placeholder="$t('login.username')">
                    <people class="svg-i" slot="prefix" theme="outline" size="16" fill="#4E5969" />
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
                    name="password" tabindex="2" autocomplete="on" :placeholder="$t('login.password')"
                    @keyup.enter.native="handleLogin">
                    <lock class="svg-i" slot="prefix" theme="outline" size="16" fill="#4E5969" />
                  </el-input>
                  <span class="show-pwd" @click="showPwd">
                    <preview-close-one theme="outline" size="16" fill="#4E5969" v-if="passwordType === 'password'" />
                    <preview-open theme="outline" size="16" fill="#4E5969" v-else />
                  </span>
                </el-form-item>
                <el-button class="mt-20 login-btn" type="primary" :loading="loading"
                  @click.native.prevent="handleLogin">{{ $t('public.login') }}</el-button>
              </el-form>
              <el-image :src="require('@/assets/MONKEYBOOS_LOGO.png')" class="mini-logo" fit="cover"></el-image>
            </div>
          </div>
        </div>
      </div>
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
        callback(new Error(this.$t('login.emptyUsername')))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value || value.length < 5) {
        callback(new Error(this.$t('login.emptyPassword')))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!value || value.length == 0) {
        callback(new Error(this.$t('public.phoneText')))
      } else if (!(/^1[3457689]\d{9}$/.test(value))) {
        callback(new Error(this.$t('login.message8')))
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

      gid: this.$route.params.gid || getToken('brandId') || '',
      THEME: 'DEFAULT'
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    
  },
  mounted() {
    if (this.gid && this.gid != 100000000) this.getPlatformConfig()
  },
  methods: {
    $_isMobile() {
      const rect = document.body.getBoundingClientRect()
      return rect.width - 1 < 768
    },

    /**
     * 获取平台信息
     */
    getPlatformConfig() {
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
          if (this.gid) this.loginForm.brandId = this.gid
          this.$store.dispatch('user/login', this.loginForm).then(res => {
            if (res.userType == 'factory') {
              location.href = '/factoryEject'
              this.loading = false
            } else {
              location.href = this.redirect || '/home'
              this.loading = false
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

.logo {
  width: 50%;
}

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

    .login-left {
      height: 692px;
      width: 596px;
      max-height: 90vh;
      max-width: 100%;


      .rel {
        z-index: 9;
      }

      &::after {
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

    .dot {
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

  .form-box {
    width: 400px;
    height: 692px;
    max-height: 90vh;
    max-width: 100%;
    box-shadow: 0px 0px 20px 40px rgba(0, 0, 0, 0.2);
    border-radius: 4px;

    .hello {
      font-size: 36px;
    }

    .desc{
      width: 360px;
    }

    .el-input__inner {
      min-width: 360px;
      background: var(--bodyBg);
      border: none;
    }

    .login-btn {
      width: 100%;
      border-radius: 4px;
    }

    &.mobile {
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

  .auth-code_btn {
    background: rgba(11, 161, 248, 0.4);
    color: #fff;
  }

  // 猴老板主题
  .login-monkeyboos {
    .right-box {
      width: 574px;
      max-height: 722px;
      max-width: 98%;
      padding: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      border-radius: 20px;
    }

    .left-img {
      margin-right: 160px;
      height: 700px;
      max-height: 90vh;
    }

    .form-box {
      padding: 2px;
      background-image: linear-gradient(to right, #EC1E79, #503EF9);
      border-radius: 20px;

      >div {
        border-radius: 18px;
      }
    }

    .hello {
      color: #ED1E79;
    }

    // .el-form{
    //   margin: 80px 0 130px;
    // }
    .mini-logo {
      width: 184px;
    }

    .login-btn {
      background: #ED1E79;
      border-color: #ED1E79;
    }
  }
  
  .title {
    font-size: 32px;
  }
}</style>
