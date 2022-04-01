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
            <el-form-item label="角色说明" prop="desc">
              <el-input v-model="form.desc" placeholder="请输入角色说明，最多50字" />
            </el-form-item>
          </el-col>
        </el-row>

        <h4 class="pl-10">功能权限</h4>
        <el-table class="ml-10" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          :show-header="false" stripe highlight-current-row border>
          <el-table-column width="200">
            <template slot-scope="scope">
              <el-checkbox v-model="power.first">主页</el-checkbox>
            </template>
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <el-checkbox v-model="power.first">查看日交易额</el-checkbox>
              <el-checkbox v-model="power.first">查看设备数量</el-checkbox>
              <el-checkbox v-model="power.first">查看用户数量</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
              <el-checkbox v-model="power.first">数据统计</el-checkbox>
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
        form: {},
        rules: {
          name: [{
            required: true,
            message: '请填写角色名称',
            trigger: 'blur'
          }],
          desc: [{
            required: true,
            message: '角色说明',
            trigger: 'blur'
          }]
        },
        role: [],
        id: '',

        myDevice: [{
          'depend_name': '密码线',
          'depend_type': 1
        }],
        selType: [],
        id: this.$route.params.id,

        power: {},
        list: [{}, {}]
      }
    },
    computed: {
      myDeviceName() {
        return this.$store.getters.myDeviceName
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      //this.getPower()
    },
    methods: {
      /**
       * 获取权限
       */
      getPower() {
        this.$get('agentapi/add_agent', {
          all_roles: 0
        }).then(res => {
          this.powerInfo = res
          this.role = res.give_role_right
          this.form.role_id = res.give_role_right[0].role_id
        })
        this.$get('agentapi/sttuf/son_device_type', {
          son_id: this.id
        }).then(res => {
          let selType = []
          for (var i in res) {
            if (this.id) {
              if (res[i].son_taked > 0) {
                selType.push(res[i].depend_type)
              }
            } else if (res[i].taked > 0) {
              selType.push(res[i].depend_type)
              break
            }
          }
          this.selType = JSON.parse(JSON.stringify(selType))
          this.myDevice = res
          if (this.id > 0) {
            this.getInfo()
          }
        })
      },

      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get('agentapi/edit_agent', {
          son_id: this.id
        }).then(res => {
          let info = res.agent_info
          delete info.password
          if (this.siteInfo.agent_withdraw_fee_type != 2) info.agent_withdraw_fee_type = this.siteInfo
            .agent_withdraw_fee_type
          info.old_steal_order_right = info.steal_order_right
          if (this.powerInfo.steal_order_right == 0) info.steal_order_right = 0
          this.form = info
        })
      },

      onSubmit(formName) {
        let params = {},
          url = 'agentapi/save_add_agent',
          profit_key = this.config.profit_key
        params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.id > 0) {
              params.son_id = this.id
              url = 'agentapi/save_edit_agent'
            }
            params.user_name = params.phone
            for (var i in this.selType) {
              params['depend_type_' + this.selType[i]] = 1
              if (!params[`${profit_key[this.selType[i]]}percent`]) {
                params[`${profit_key[this.selType[i]]}percent`] = 0
              }
            }
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              if (this.checkRoles(['terminal'])) {
                this.$router.push({
                  path: '/partner/index'
                })
              } else if (params.admin_pid != this.agentInfo.id) {
                this.$router.push({
                  path: '/agent/subAgent'
                })
              } else {
                this.$router.push({
                  path: '/agent/index'
                })
              }
            }).catch(err => {
              setTimeout(() => {
                this.clickSubmit = false
              }, 1000)
            })
          } else {
            this.clickSubmit = false
          }
        })
      },

      /**
       * 选择区域
       */
      selectCity(e) {
        this.form.province = e.province.value
        this.form.city = e.city.value
        this.form.county = e.area.value
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
