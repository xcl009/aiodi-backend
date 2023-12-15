<template>
  <el-row type="flex" justify="center" class="p-30  custom-form bg-white">
    <el-col :xs="24" :sm="12" :md="6" :lg="6">
      <el-form ref="form" :model="form">
        <el-form-item class="text-center">
          <upload v-model="form.avatar" :upObj="{fileType: 'userAvatar'}"/>
        </el-form-item>
        <el-form-item :label="$t('public.fullName')">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
        <el-form-item class="text-center">
          <el-button type="primary" size="medium" :disabled="clickSubmit" @click="editUser()">{{ $t('public.saveInfo') }}</el-button>
          <el-button size="medium" class="btn-body" @click="$router.go(-1)">{{ $t('public.cancel') }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import upload from '@/components/upload'
  export default {
    name: 'userInfo',
    components: {
      upload
    },
    data() {
      return {
        userInfo: {},
        clickSubmit: false,
        form: {}
      }
    },
    computed: {
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      this.form = {
        avatar: this.agentInfo.avatar,
        nickname: this.agentInfo.nickname
      }
    },
    methods: {
      /**
       * 修改用户信息
       */
      editUser() {
        let that = this;
        this.clickSubmit = true
        this.$post('iot-saas-user/user/info/update', this.form).then(res => {
          this.$message({
            message: that.$t('public.editSuccess'),
            type: 'success'
          })
          this.clickSubmit = false
        }).catch(()=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
