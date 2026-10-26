<template>
  <div id="OperatePwd">
    <el-dialog :title="mode === 'set' ? $t('user.setPassword') : $t('components.passwordVerification')"
      :visible.sync="dialogStatus" :close-on-click-modal="false" :center="true" width="480px"
      append-to-body custom-class="custom-form" @close="onDialogClose">
      <div v-if="mode === 'verify'" class="text-center">
        <div class="mb-15 fs-c1">{{ $t('components.text2') }}</div>
        <div class="mb-15 pl-30 pr-30">
          <el-input ref="pwdInput" v-model="password" type="password" show-password
            :placeholder="$t('user.pleaseSetPassword')" @keyup.enter.native="onSubmit" />
        </div>
        <div class="text-gray">{{ $t('user.text') }}<a href="javascript:;" class="text-primary" @click="goSet">{{ $t('components.goSet') }}</a></div>
      </div>
      <el-form v-else ref="setForm" :model="setForm" label-position="top">
        <template v-if="agentInfo.cardCodeInd">
          <el-form-item :label="$t('user.passwordSignature')">
            <el-input v-model="setForm.cardCode" :placeholder="$t('user.passwordSignature')" />
            <div class="text-danger">{{ $t('user.idText') }}</div>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="$t('user.checkWay')">
            <el-radio-group v-model="checkType" size="medium">
              <el-radio-button v-if="!agentInfo.cardNoInd" :label="2">{{ $t('user.passwordSignature') }}</el-radio-button>
              <el-radio-button v-if="!agentInfo.towPassWordInd" :label="1">{{ $t('public.oldPassword') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-show="checkType == 2" :label="$t('user.passwordSignature')">
            <el-input v-model="setForm.cardCode" :placeholder="$t('user.passwordSignature')" />
          </el-form-item>
          <el-form-item v-show="checkType == 1" :label="$t('public.oldPassword')">
            <el-input v-model="setForm.oldPassword" show-password />
          </el-form-item>
        </template>
        <el-form-item :label="$t('public.newPassword')">
          <el-input v-model="setForm.newPassword" show-password />
        </el-form-item>
        <el-form-item :label="$t('public.confirmPassword')">
          <el-input v-model="setForm.repeatNewPassword" show-password @keyup.enter.native="savePassword" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <template v-if="mode === 'verify'">
          <el-button class="btn-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button type="primary" :disabled="clickSubmit" @click="onSubmit">{{ $t('public.confirm') }}</el-button>
        </template>
        <template v-else>
          <el-button class="btn-body" @click="mode = 'verify'">{{ $t('public.cancel') }}</el-button>
          <el-button type="primary" :disabled="clickSubmit" @click="savePassword">{{ $t('public.saveInfo') }}</el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogStatus: false,
      mode: 'verify',
      password: '',
      clickSubmit: false,
      settled: false,
      checkType: 2,
      setForm: { cardCode: '', oldPassword: '', newPassword: '', repeatNewPassword: '' }
    }
  },
  computed: {
    agentInfo() {
      return (this.$store && this.$store.getters.agentInfo) || {}
    }
  },
  methods: {
    open() {
      this.mode = 'verify'
      this.password = ''
      this.clickSubmit = false
      this.settled = false
      this.checkType = 2
      this.setForm = { cardCode: '', oldPassword: '', newPassword: '', repeatNewPassword: '' }
      this.dialogStatus = true
      this.$nextTick(() => {
        if (this.$refs.pwdInput) this.$refs.pwdInput.focus()
      })
      return new Promise((resolve, reject) => {
        this._resolve = resolve
        this._reject = reject
      })
    },
    onDialogClose() {
      this.password = ''
      if (!this.settled) {
        this.settled = true
        if (this._reject) this._reject({ cancelled: true })
      }
    },
    onSubmit() {
      if (this.clickSubmit) return
      if (!this.password) {
        this.$message({ message: this.$t('user.pleaseSetPassword'), type: 'error' })
        return
      }
      this.clickSubmit = true
      this.confirmPassword(this.password).then(() => {
        this.finishVerified()
      }).catch(() => {
        this.clickSubmit = false
      })
    },
    goSet() {
      this.mode = 'set'
      this.checkType = 2
    },
    savePassword() {
      if (this.clickSubmit) return
      const params = this.buildSetParams()
      const error = this.validateSetForm(params)
      if (error) {
        this.$message({ message: error, type: 'error' })
        return
      }
      this.clickSubmit = true
      this.$post('iot-saas-user/admin/user/twoPassword/update', params, { skipOperatePwd: true }).then(() => {
        this.markPasswordReady()
        return this.confirmPassword(params.newPassword).then(() => {
          this.finishVerified()
        }).catch(() => {
          this.clickSubmit = false
          this.mode = 'verify'
          this.password = ''
        })
      }).catch(() => {
        this.clickSubmit = false
      })
    },
    buildSetParams() {
      const params = { newPassword: this.setForm.newPassword, repeatNewPassword: this.setForm.repeatNewPassword }
      if (this.agentInfo.cardCodeInd || this.checkType == 2) {
        params.cardCode = (this.setForm.cardCode || '').trim()
      } else {
        params.oldPassword = this.setForm.oldPassword
      }
      return params
    },
    validateSetForm(params) {
      if (params.cardCode !== undefined && !params.cardCode) return this.$t('user.passwordSignature')
      if (params.oldPassword !== undefined && !params.oldPassword) return this.$t('public.oldPassword')
      if (!params.newPassword) return this.$t('user.message5')
      if (!params.repeatNewPassword) return this.$t('user.message6')
      if (params.newPassword !== params.repeatNewPassword) return this.$t('user.message4')
      return ''
    },
    confirmPassword(password) {
      return this.$post('iot-saas-user/admin/user/twoPassword/confirm', { password }, { skipOperatePwd: true })
    },
    markPasswordReady() {
      if (this.$store) {
        const agentInfo = Object.assign({}, this.agentInfo, { cardCodeInd: false, towPassWordInd: false })
        this.$store.commit('user/SET_AGENTINFO', agentInfo)
        window.agentInfo = agentInfo
      }
    },
    finishVerified() {
      this.$message({ message: this.$t('components.verificationSuccessful'), type: 'success' })
      this.settled = true
      this.password = ''
      this.dialogStatus = false
      this.clickSubmit = false
      if (this._resolve) this._resolve()
    }
  }
}
</script>

<style lang="scss" scoped></style>
