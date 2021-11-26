<template>
  <div class="p-5">
    <el-row class="pt-30 pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <el-form-item label="功能名称：">
            <el-input v-model="form.name" placeholder="输入功能名称" />
          </el-form-item>
          <el-form-item label="功能介绍：">
            <tinymce v-model="form.introduce" :height="300" />
          </el-form-item>
          <el-form-item label="服务亮点：">
            <tinymce v-model="form.introduce" :height="300" />
          </el-form-item>
          <el-form-item label="教程链接：">
            <el-input v-model="form.mobile" placeholder="输入教程链接" />
          </el-form-item>
          <el-form-item label="需求来源：">
            <el-input v-model="form.mobile" placeholder="输入需求来源" />
          </el-form-item>
          <el-form-item label="价格设置：">
            <div class="flex">
              <el-input v-model="form.rent_fee_std" class="mr-10">
                <template slot="append">元/月</template>
              </el-input>
              <el-input v-model="form.rent_unit_minute_std" class="ml-10">
                <template slot="append">元/年</template>
              </el-input>
              <el-input v-model="form.rent_unit_minute_std" class="ml-10">
                <template slot="append">元/永久</template>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import Tinymce from '@/components/Tinymce'
  export default {
    components: {
      Tinymce
    },
    data() {
      return {
        clickSubmit: false,
        form: {

        },
        rules: {
          role_id: [
            { required: true, message: '请选择开通类型', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请填写联系人姓名', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请填写手机号码作为登录账户', trigger: 'blur' }
          ],
        },
        powerInfo: {},
        role: [],
        id: '',

        agentDevice: [{'depend_name': '密码线', 'depend_type': 1}],
        selType: [],
        id: this.$route.params.id
      }
    },
    computed: {
      deviceNameObj() {
        return this.$store.getters.deviceNameObj
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
        this.$get('agentapi/add_agent', { all_roles: 0 }).then(res => {
          this.powerInfo = res
          this.role = res.give_role_right
          this.form.role_id = res.give_role_right[0].role_id
        })
        this.$get('agentapi/sttuf/son_device_type', {
          son_id: this.id
        }).then(res => {
          let selType = []
          for(var i in res){
            if(this.id){
              if(res[i].son_taked > 0){
                selType.push(res[i].depend_type)
              }
            }else if(res[i].taked > 0){
              selType.push(res[i].depend_type)
              break
            }
          }
          this.selType = JSON.parse(JSON.stringify(selType))
          this.agentDevice = res
          if(this.id > 0){
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
          if(this.siteInfo.agent_withdraw_fee_type != 2) info.agent_withdraw_fee_type = this.siteInfo.agent_withdraw_fee_type
          info.old_steal_order_right = info.steal_order_right
          if(this.powerInfo.steal_order_right == 0) info.steal_order_right = 0
          this.form = info
        })
      },

      onSubmit(formName) {
        let params = {}, url = 'agentapi/save_add_agent', profit_key = this.config.profit_key
        params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.id > 0){
              params.son_id = this.id
              url = 'agentapi/save_edit_agent'
            }
            params.user_name = params.phone
            for(var i in this.selType){
              params['depend_type_' + this.selType[i]] = 1
              if(!params[`${profit_key[this.selType[i]]}percent`]){
                params[`${profit_key[this.selType[i]]}percent`] = 0
              }
            }
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              if(this.checkRoles(['terminal'])){
                this.$router.push({
                  path: '/partner/index'
                })
              }else if(params.admin_pid != this.agentInfo.id){
                this.$router.push({
                  path: '/agent/subAgent'
                })
              } else {
                this.$router.push({
                  path: '/agent/index'
                })
              }
            }).catch( err => {
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
      selectCity(e){
        this.form.province = e.province.value
        this.form.city = e.city.value
        this.form.county = e.area.value
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
