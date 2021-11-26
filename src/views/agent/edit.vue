<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :rules="rules" :model="form" label-width="140px">
          <h4>运营产品：</h4>
          <el-form-item label="产品类型：">
            <el-checkbox-group v-model="selType" :min="1">
              <el-checkbox v-for="item in agentDevice" :label="item.depend_type">{{ item.depend_name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <h4>基础信息：</h4>
          <el-form-item label="开通类型：" prop="role_id">
            <el-select v-model="form.role_id" placeholder="请选择开通类型" :disabled="$route.params.id ? true : false">
              <el-option v-for="item in role" :label="item.role_name" :value="item.role_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="姓名：" prop="name">
            <el-input v-model="form.name" placeholder="输入下级代理姓名" />
          </el-form-item>
          <el-form-item label="手机号码：" prop="mobile">
            <el-input v-model="form.mobile" placeholder="输入手机号" />
            <div class="fs-s2 text-gray">此手机号码会作为登录账户</div>
          </el-form-item>
          <el-form-item label="登录密码：" v-if="!id">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="运营区域：">
            <v-distpicker :province="form.charge_province" :city="form.charge_city" :area="form.charge_county" @selected="selectCity"></v-distpicker>
          </el-form-item>
          <el-form-item label="公司地址：">
            <el-input v-model="form.address" placeholder="输入公司地址" />
          </el-form-item>

          <template>
            <h4>分润比例：</h4>
            <template v-for="(item, index) in agentDevice">
              <el-form-item :label="`${item.depend_name}：`" v-if="selType.indexOf(item.depend_type) > -1">
                <el-input v-model="form.percent" :placeholder="`最高不能超过100%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </template>
          </template>

          <template v-if="(form.take_my_product && !checkRoles(['terminal'])) || (form.condom_manager_fee > 0)">
            <h4>售货机</h4>
            <el-form-item label="商品管理费：">
              <el-input v-model="form.condom_manager_fee" placeholder="商品管理费">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import VDistpicker from '@/components/Distpicker'
  export default {
    components: {
      VDistpicker
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          password: '123456',
          role_id: '',
          devide_percent: 0,
          agent_withdraw_fee_type: 0,
          withdraw_percent: 0,
          withdraw_fee: 0,
          check_order: 0,
          withdraw_right: 0,
          finish_order: 0,
          drawback_order: 0
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
