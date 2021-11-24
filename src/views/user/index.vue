<template>
  <div class="p-10">
    <div class="p-30 bg-white flex justify-center">
      <el-form ref="form" :model="userForm" label-width="80px" style="width: 500px">
        <el-form-item label="头像：">
          <upload :file-list="fileList" ratio="1:1" @fileOk="fileOk" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userForm.name"></el-input>
        </el-form-item>
        <!-- <el-form-item label="用户名">
          <el-input v-model="userForm.user_name"></el-input>
        </el-form-item> -->
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" disabled></el-input>
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="userForm.id_card"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="userForm.bank_id"></el-input>
        </el-form-item>
        <el-form-item label="所属银行">
          <el-input v-model="userForm.bank_name"></el-input>
        </el-form-item>
        <el-form-item label="所属分行">
          <el-input v-model="userForm.bank_branch_name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="editUser()">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
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
        userForm: {},
        fileList: []
      }
    },
    mounted() {
      this.getInfo()
    },
    methods: {
      getInfo() {
        this.$get('agentapi/my_user_info').then(res => {
          this.userInfo = res
          this.userForm = res
          this.fileList = [{
            url: res.avatar
          }];
        })
      },

      /**
       * 修改用户信息
       */
      editUser() {
        this.userForm.user_name = this.userForm.phone
        this.$post('agentapi/save_my_info', this.userForm).then(res => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          // setTimeout(()=>{
          //   location.reload()
          // }, 1000)
        })
      },

      /**www
       * 上传文件成功通知
       */
      fileOk(arr) {
        this.userForm.avatar = arr[0] || ''
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
