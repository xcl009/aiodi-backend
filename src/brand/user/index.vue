<template>
  <el-row type="flex" justify="center" class="p-30  custom-form bg-white">
    <el-col :xs="24" :sm="12" :md="6" :lg="6">
      <el-form ref="form" :model="form">
        <el-form-item class="text-center">
          <upload v-model="form.logo" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
       <!-- <el-form-item label="手机号">
          <el-input v-model="form.phone" disabled></el-input>
        </el-form-item> -->
        <el-form-item class="text-center">
          <el-button type="primary" size="medium" :disabled="clickSubmit" @click="editUser()">保存信息</el-button>
          <el-button size="medium" class="btn-body" @click="$router.push({path: `/home`})">取消</el-button>
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
    mounted() {
      //this.getInfo()
    },
    methods: {
      getInfo() {
        this.$get('agentapi/my_user_info').then(res => {
          this.userInfo = res
          this.form = res
        })
      },

      /**
       * 修改用户信息
       */
      editUser() {
        this.form.user_name = this.form.phone
        this.clickSubmit = true
        this.$post('agentapi/save_my_info', this.form).then(res => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          // setTimeout(()=>{
          //   location.reload()
          // }, 1000)
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
