<template>
  <el-row class="pl-20 pr-30 custom-form bg-white">
    <el-col>
      <el-form ref="form" :rules="rules" :model="form" label-width="auto" :hide-required-asterisk="true">
        <el-row>
          <el-col :xs="24" :sm="16" :md="12" :lg="8">
            <h4 class="pl-10">{{ $t('role.addRole') }}</h4>
            <el-form-item :label="$t('role.roleName')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('role.pleaseRoleName')" />
            </el-form-item>
            <el-form-item :label="$t('role.roleDescription')" prop="remark">
              <el-input v-model="form.remark" :placeholder="$t('role.roleDescriptionText')" />
            </el-form-item>
          </el-col>
        </el-row>

        <h4 class="pl-10">{{ $t('role.functionalPermissions') }}</h4>
        <el-table class="ml-10" id="list_table" ref="list_table" v-loading="listLoading" :data="mentList"
          element-loading-text="Loading" :show-header="false" highlight-current-row border>
          <el-table-column width="200">
            <template slot-scope="scope">
              <el-checkbox v-model="selMenu[scope.row.id]">{{ scope.row.name }}</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <div v-if="scope.row.childrenAuthList">
                <el-checkbox v-model="selMenu[item.id]" v-for="(item, index) in scope.row.childrenAuthList">{{ item.name
                }}</el-checkbox>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="ml-10 mt-30 mb-30" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{
          $t('public.submit') }}</el-button>
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
      mentList: [],
      selMenu: {},
      roleId: this.$route.query.roleId
    }
  },
  computed: {
    rules(){
      return {
        name: [{
          required: true,
          message: this.$t('role.pleaseRoleNamee'),
          trigger: 'blur'
        }],
        remark: [{
          required: true,
          message: this.$t('role.roleDescription'),
          trigger: 'blur'
        }]
      }
    },
  },
  mounted() {
    this.getMenu()
  },
  methods: {
    /**
     * 获取信息
     */
    getMenu() {
      this.$get('iot-saas-user/auth/menu', {
        ifTreeStructure: true
      }).then(res => {
        this.mentList = res
        this.listLoading = false
      })
      this.$get('iot-saas-user/auth/allMenu', {
        roleId: this.roleId || 1
      }).then(res => {
        this.form = {
          name: res.roleName,
          remark: res.describe
        }
        let selMenu = {}
        res.menus.map(item => {
          selMenu[item.id]= true
          if(item.childrenAuthList && item.childrenAuthList.length > 0){
            item.childrenAuthList.map(sitem => {
              selMenu[sitem.id]= true
            })
          }
        })
        this.selMenu = selMenu
      })
    },

    onSubmit(formName) {
      let that = this;
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
          for(var i in this.selMenu){
            if (this.selMenu[i]) {
              params.menuIds.push(i)
            }
          }
          this.clickSubmit = false
          this[type](url, params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
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
.el-checkbox {
  min-width: 140px;
  line-height: 30px;
}
</style>
