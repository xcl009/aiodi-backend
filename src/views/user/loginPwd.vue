<template>
  <el-row type="flex" justify="center" class="p-30  custom-form bg-white">
    <el-col :xs="24" :sm="12" :md="6" :lg="6">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item :label="$t('public.userName')">
          <el-input v-model="agentInfo.username" disabled></el-input>
        </el-form-item>
        <template v-if="!agentInfo.cardCodeInd">
          <el-form-item :label="$t('user.checkWay') || 'Authentication'">
            <div>
              <el-radio-group v-model="checkType" size="medium">
                <el-radio-button :label="2" v-if="!agentInfo.cardNoInd">{{ $t('user.passwordSignature') || 'Security question' }}</el-radio-button>
                <el-radio-button :label="1" v-if="!agentInfo.passWordInd">{{ $t('public.oldPassword') }}</el-radio-button>
              </el-radio-group>
            </div>
          </el-form-item>
          <el-form-item :label="$t('user.passwordSignature') || 'Security question'" v-show="checkType == 2">
            <el-input v-model="form.cardCode" :placeholder="$t('user.passwordSignature') || 'Security question'"></el-input>
          </el-form-item>
          <el-form-item :label="$t('public.oldPassword')" ref="oldPassword" prop="oldPassword" v-show="checkType == 1">
            <el-input v-model="form.oldPassword" show-password></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="$t('user.passwordSignature') || 'Security question'">
            <el-input v-model="form.cardCode" :placeholder="$t('user.passwordSignature') || 'Security question'"></el-input>
            <div class="text-danger">{{ $t('user.idText') }}</div>
          </el-form-item>
        </template>
        <el-form-item :label="$t('public.newPassword')" ref="newPassword" prop="newPassword">
          <el-input v-model="form.newPassword" show-password></el-input>
        </el-form-item>
        <el-form-item :label="$t('public.confirmPassword')" ref="repeatNewPassword" prop="repeatNewPassword">
          <el-input v-model="form.repeatNewPassword" show-password></el-input>
        </el-form-item>
        <el-form-item class="text-center">
          <el-button type="primary" size="medium" :disabled="clickSubmit" @click="onSubmit()">{{ $t('public.submit')
          }}</el-button>
          <el-button size="medium" class="btn-body" @click="$router.go(-1)">{{ $t('public.cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'loginPwd',
  components: {

  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      checkType: 2
    }
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    rules() {
      return {
        newPassword: [
          {
            required: true,
            message: this.$t('user.message1'),
            trigger: 'blur'
          },
        ],
        repeatNewPassword: [
          {
            required: true,
            message: this.$t('user.message2'),
            trigger: 'blur'
          },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$t('user.message3')))
              } else if (value !== this.form.newPassword) {
                callback(new Error(this.$t('user.message4')))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 提交保存
     */
    onSubmit(formName = 'form') {
      let that = this;
      this.clickSubmit = true
      this.$refs[formName].validate((valid, object) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          this.$post('iot-saas-user/user/password/update', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.clickSubmit = false
          }).catch(err => {
            setTimeout(() => {
              this.clickSubmit = false
            }, 1000)
          })
        } else {
          this.clickSubmit = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
