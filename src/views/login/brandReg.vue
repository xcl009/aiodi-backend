<template>
  <el-row type="flex" align="middle" class="login-container flex-wrap">
    <el-image class="abs p-all" src="https://oss.kuaihuoya.net/pwd/2021-12-14/090498296.png" fit="cover"></el-image>
    <div class="login-form bg-white radius-10">
      <div class="p-20 fs-b2 text-center text-black" v-if="clientWidth < 992">{{ $t('login.invitingRegistration') }}</div>
      <div class="mb-20 p-30 fs-b2 text-center text-black" v-else>{{ $t('login.invitingRegistration') }}</div>
      <div class="mb-30 pb-20">
        <el-steps :space="200" :active="steps" align-center>
          <el-step :title="$t('login.inputText')"></el-step>
          <el-step :title="$t('login.inputText1')"></el-step>
          <el-step :title="$t('login.inputText2')"></el-step>
        </el-steps>
      </div>

      <el-form ref="form" :rules="rules" :model="form" :hide-required-asterisk="true"
        :label-width="clientWidth < 992 ? '' : '90px'" label-position="left" v-if="steps == 0">
        <el-row class="pl-50 pr-50 custom-form" :class="{ 'mobile': clientWidth < 992 }" :gutter="50">
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item ref="name" :label="$t('public.userName')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('login.inputText3')" />
            </el-form-item>
            <el-form-item ref="password" :label="$t('public.loginPassword')" prop="password">
              <el-input type="password" v-model="form.password" :placeholder="$t('login.inputText4')" show-password />
            </el-form-item>
            <el-form-item ref="confirmPassword" :label="$t('public.confirmPassword')" prop="confirmPassword">
              <el-input type="password" v-model="form.confirmPassword" :placeholder="$t('login.inputText5')" show-password
                @blur="checkPwd()" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <el-form-item ref="invitationCode" :label="$t('login.invitationCode')" prop="invitationCode">
              <el-input v-model="form.invitationCode" :placeholder="$t('login.inputText6')" />
            </el-form-item>
            <el-form-item ref="mobile" :label="$t('public.phone')" prop="mobile">
              <el-input v-model="form.mobile" :placeholder="$t('public.phoneText')" />
            </el-form-item>
            <el-form-item ref="verificationCode" :label="$t('user.code')" prop="verificationCode">
              <el-input v-model="form.verificationCode" :placeholder="$t('public.inputText7')">
                <template slot="append"><auth-code ref="authCode" :isBtn="false" @authCode="getAuthCode()"
                    class="text-primary"></auth-code></template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="pb-30 text-center line-1" :class="{ 'mt-pc': clientWidth >= 992, 'mt-30': clientWidth < 992 }">
          <el-button type="primary" class="login-btn" @click="checkSubmit()" :disabled="clickSubmit">{{
            $t('public.nextStep') }}</el-button>
          <div class="mt-20 flex align-center justify-center">
            <el-checkbox v-model="form.checked"></el-checkbox>
            <span class="ml-5 text-gray">{{ $t('public.readAndAgree') }}</span>
            <a class="text-primary" @click="dialogStatus = true">《{{ $t('login.text') }}》</a>
          </div>
        </div>
      </el-form>

      <div v-if="steps == 1">
        <div class="flex justify-center flex-wrap" style="padding: 30px 100px;">
          <el-button size="medium" :type="form.selCode === item.code ? 'primary' : ''"
            :class="{ 'btn-body': form.selCode !== item.code }" v-for="item in device" @click="form.selCode = item.code">{{
              item.name }}</el-button>
        </div>
        <div class="pb-30 text-center line-1" :class="{ 'mt-pc': clientWidth >= 992, 'mt-30': clientWidth < 992 }">
          <div>
            <el-button type="info" class="login-btn btn-body" @click="steps = 0">{{ $t('public.back') }}</el-button>
            <el-button type="primary" class="login-btn" @click="onSubmit()" :disabled="clickSubmit">{{
              $t('public.inputText2') }}</el-button>
          </div>
        </div>
      </div>


      <div v-if="steps == 2">
        <div class="flex justify-center">
          <i class="el-icon-success"></i>
          <div class="pl-15 pt-5">
            <div class="fs-c1">{{ $t('login.text1') }}</div>
            <div class="mt-5 text-gray">{{ $t('login.text2') }}</div>
          </div>
        </div>
        <div class="mt-30 flex justify-center">
          <el-table border :data="account">
            <el-table-column prop="mobile" :label="$t('public.accountNumber')" width="150" align="center">

            </el-table-column>
            <el-table-column prop="password" :label="$t('public.loginPassword')" width="150" align="center">

            </el-table-column>
          </el-table>
        </div>
        <div class="pt-30 pb-30 text-center line-1" :class="{ 'mt-pc': clientWidth >= 992, 'mt-30': clientWidth < 992 }">
          <el-button type="primary" class="login-btn" @click="$router.push({ path: `/login/${gid}` })">{{ $t('login.login')
          }}</el-button>
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :close-on-click-modal="false" :show-close="false"
      width="650px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ $t('login.text') }}</div>
      <div class="p-10" style="max-height: 500px;  min-height: 200px;  overflow-y: scroll; background-color: #f5f5f5;">
        {{ $t('login.text3') }}
      </div>
      <div class="mt-30 text-center">
        <el-button size="medium" type="primary" @click="dialogStatus = false; form.checked = true">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import { getToken, setToken, removeToken } from '@/utils/auth'
import AuthCode from '@/components/AuthCode/'
import ResizeMixin from '@/layout/mixin/ResizeHandler'
export default {
  name: 'brandReg',
  components: {
    AuthCode
  },
  mixins: [ResizeMixin],
  data() {
    return {
      rules: {
        name: [{
          required: true,
          message: this.$t('login.message'),
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: this.$t('login.message1'),
          trigger: 'blur'
        }],
        confirmPassword: [
          {
            required: true,
            message: this.$t('login.message2'),
            trigger: 'blur'
          },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$t('user.message3')))
              } else if (value !== this.form.password) {
                callback(new Error(this.$t('user.message4')))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        invitationCode: [{
          required: true,
          message: this.$t('login.inputText6'),
          trigger: 'blur'
        }],
        mobile: [{
          required: true,
          message: this.$t('login.message3'),
          trigger: 'blur'
        }],
        verificationCode: [{
          required: true,
          message: this.$t('login.message4'),
          trigger: 'blur'
        }],
        selCode: [{
          required: true,
          message: this.$t('login.message5'),
          trigger: 'blur'
        }]
      },
      clickSubmit: false,
      gid: this.$route.params.gid || '',
      form: {
        invitationCode: this.$route.params.code,
        selCode: '',
        checked: true
      },
      device: [
        {
          "code": "PA",
          "name": this.$t('public.powerBank')
        },
        {
          "code": "PL",
          "name": this.$t('public.chargingCable')
        }
      ],

      steps: 0,
      account: [],

      dialogStatus: false,
    }
  },
  computed: {
    clientWidth() {
      return this.$store.getters.clientWidth
    }
  },
  mounted() {
    if (!this.gid || !this.form.invitationCode) {
      this.$alert(this.$t('login.message6'), this.$t('login.message7'), {
        confirmButtonText: this.$t('public.confirm'),
        callback: action => {
          this.$router.push({ path: `/login` })
        }
      })
    }
    //this.getPlatformConfig()
  },
  methods: {
    /**
     * 获取平台信息
     */
    getPlatformConfig() {
      this.$store.dispatch('user/getPlatformConfig', {
        brand_id: this.gid
      }).then(res => {
        console.log(res)

      })
    },

    /**
     * 获取验证码
     */
    getAuthCode() {
      this.$refs.form.validateField('mobile', valid => {
        if (valid) return false
        this.$refs.authCode.getAuthCode({
          mobile: this.form.mobile,
          invitationCode: this.form.invitationCode
        })
      })
    },

    /**
     * 第一步校验
     */
    checkSubmit(formName = 'form') {
      this.steps = 1
      return
      if (!this.form.checked) {
        this.$message({
          message: '请查看入驻协议并勾选同意',
          type: 'error'
        })
        return
      }
      this.clickSubmit = true
      this.$refs[formName].validate((valid, object) => {
        if (valid) {
          this.params = JSON.parse(JSON.stringify(this.form))
          this.steps = 1
          this.clickSubmit = false
        } else {
          this.formErrow(object)
          this.clickSubmit = false
        }
      })
    },

    /**
     * 提交
     */
    onSubmit() {
      let url = 'iot-saas-basic/brand/open/register'
      this.clickSubmit = true
      const params = JSON.parse(JSON.stringify(this.form))
      params.deviceTypeProfitRatios = [{
        deviceTypeCode: params.selCode,
        profitRatio: 100
      }]
      this.$post(url, params).then(res => {
        this.clickSubmit = false
        this.steps = 2
        this.account = [
          {
            mobile: params.mobile,
            password: params.password,
          }
        ]
      }).catch(err => {
        setTimeout(() => {
          this.clickSubmit = false
        }, 1000)
      })
    },

    /**
     * 检查密码
     */
    checkPwd() {
      this.$refs.form.validateField('re_pwd', (valid, object) => {
        if (this.form.re_pwd != this.form.pwd) {
          this.formErrow(object)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  padding-bottom: 10vh;
  min-height: 100%;
  width: 100%;
  overflow: hidden;
}

.login-form {
  position: relative;
  width: 980px;
  max-width: 95%;
  margin: 0 auto;
  overflow: hidden;
}

.custom-form {
  .el-input {
    min-width: 255px;
  }

  &.mobile {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}

.el-steps {
  margin: 0 auto;
  width: 440px;

  .el-step__icon.is-text {
    background-color: #F2F3F5;
    border-color: #F2F3F5;

    .el-step__icon-inner {
      font-weight: 500;
    }
  }

  .is-wait {}

  .el-step.is-center .el-step__line {
    left: 96px;
    width: 100px;
    height: 1px;
    background: #E5E6EB;
  }

  .el-step__head.is-process {
    .el-step__icon.is-text {
      background-color: #3CA1FE;
      border-color: #3CA1FE;
      color: white;
    }
  }
}

.el-icon-success {
  font-size: 32px;
  color: rgba(7, 193, 96, 1);
}

.el-table {
  max-width: 301px;
}

.mt-pc {
  margin-top: 120px;
}</style>
