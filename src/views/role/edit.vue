<template>
  <el-row class="pl-20 pr-30 custom-form bg-white">
    <el-col>
      <el-form ref="form" :rules="rules" :model="form" label-width="auto" :hide-required-asterisk="true">
        <el-row>
          <el-col :xs="24" :sm="16" :md="12" :lg="8">
            <h4 class="pl-10">添加角色</h4>
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="角色说明" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入角色说明，最多50字" />
            </el-form-item>
          </el-col>
        </el-row>

        <h4 class="pl-10">功能权限</h4>
        <el-table class="ml-10" id="list_table" ref="list_table" v-loading="listLoading" :data="mentList" element-loading-text="Loading"
          :show-header="false" stripe highlight-current-row border>
          <el-table-column width="200">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.checked">{{ scope.row.name }}</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <div v-if="scope.row.childrenAuthList">
                <el-checkbox v-model="item.checked" v-for="(item, index) in scope.row.childrenAuthList">{{ item.name }}</el-checkbox>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="ml-10 mt-30 mb-30" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import upload from '@/components/upload'
  import Tinymce from '@/components/Tinymce'
  export default {
    components: {
      upload,
      Tinymce
    },
    data() {
      return {
        clickSubmit: false,
        listLoading: true,
        form: {},
        rules: {
          name: [{
            required: true,
            message: '请填写角色名称',
            trigger: 'blur'
          }],
          remark: [{
            required: true,
            message: '角色说明',
            trigger: 'blur'
          }]
        },
        mentList: [],
        roleId: this.$route.query.roleId
      }
    },
    mounted() {
      this.getMenu()
    },
    methods: {
      /**
       * 获取信息
       */
      getMenu() {
        this.$get('iot-saas-user/auth/allMenu', {
          roleId: this.roleId || 1
        }).then(res => {
          this.form = {
            name: res.roleName,
            remark: res.describe
          }
          this.mentList = res.menus
          this.listLoading = false
        })
      },

      onSubmit(formName) {
        let url = 'iot-saas-user/auth/role',
            params = JSON.parse(JSON.stringify(this.form)),
            type = '$post'
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            params.menuIds = []
            if (this.roleId > 0) {
              params.roleId = this.roleId
              type = '$put'
            }
            this.mentList.map(pItem => {
              if(pItem.checked){
                params.menuIds.push(pItem.id)
                if(pItem.childrenAuthList){
                  pItem.childrenAuthList.map(item => {
                    if(item.checked) params.menuIds.push(item.id)
                  })
                }
              }
            })
            this[type](url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
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

<style scoped>
  .el-checkbox{
    min-width: 140px;
    line-height: 30px;
  }
</style>
