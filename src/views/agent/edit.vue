<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :rules="rules" :model="form" label-width="140px">
          <h4>运营产品：</h4>
          <el-form-item label="产品类型：">
            <el-checkbox-group v-model="selType" :min="1">
              <el-checkbox v-for="item in agentDevice" :label="item.depend_type" v-if="item.taked == 1">{{ item.depend_name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <h4>基础信息：</h4>
          <el-form-item label="开通类型：" prop="role_id">
            <el-select v-model="form.role_id" placeholder="请选择开通类型" :disabled="$route.params.id ? true : false">
              <el-option v-for="item in role" :label="item.role_name" :value="item.role_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="运营模式：" v-if="[3,4].indexOf(form.role_id) > -1">
            <el-radio v-model="form.business_type" :label="0" v-if="agentInfo.business_type == 0">代理模式</el-radio>
            <el-radio v-model="form.business_type" :label="1">员工模式</el-radio>
          </el-form-item>
          <el-form-item label="姓名：" prop="name">
            <el-input v-model="form.name" placeholder="输入下级代理姓名" />
          </el-form-item>
          <!-- <el-form-item label="用户名：">
            <el-input v-model="form.user_name" placeholder="会作为用户代理登录的账户" />
          </el-form-item> -->
          <el-form-item label="手机号码：" prop="phone">
            <el-input v-model="form.phone" placeholder="输入手机号" />
            <div class="fs-s2 text-gray">此手机号码会作为登录账户</div>
          </el-form-item>
          <el-form-item label="登录密码：" v-if="!id">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="运营区域：">
            <v-distpicker :province="form.charge_province" :city="form.charge_city" :area="form.charge_county" @selected="selectCity"></v-distpicker>
          </el-form-item>
          <el-form-item label="公司地址：">
            <el-input v-model="form.company_address" placeholder="输入公司地址" />
          </el-form-item>

          <template v-if="form.business_type == 1">
            <h4>提成比例</h4>
            <el-form-item label="提成比例：">
              <el-input v-model="form.devide_percent" placeholder="输入提成比例" />
            </el-form-item>
          </template>

          <template v-else>
            <h4>分润比例</h4>
            <template v-for="(item, index) in agentDevice">
              <el-form-item :label="`${item.depend_name}：`" v-if="selType.indexOf(item.depend_type) > -1">
                <el-input v-model="form[config.profit_key[item.depend_type] + 'percent' ]" :placeholder="`最高不能超过${powerInfo[config.profit_key[item.depend_type] +'percent' ] || 100}%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
              <el-form-item :label="`套套机商品：`" v-if="selType.indexOf(item.depend_type) > -1 && item.depend_type == 7">
                <el-input v-model="form.condom_product_percent" :placeholder="`最高不能超过${powerInfo.condom_product_percent || 100}%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
              <el-form-item :label="`会员：`" v-if="item.depend_type == 3 && selType.indexOf(item.depend_type) > -1">
                <el-input v-model="form.member_card_percent" :placeholder="`最高不能超过${powerInfo.member_card_percent || 100}%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </template>
          </template>

          <h4>代理权限</h4>
          <el-form-item label="基本权限：">
            <el-checkbox :true-label="1" :false-label="0" v-model="form.check_order" v-show="powerInfo.check_order == 1">查看订单</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.withdraw_right" v-show="powerInfo.withdraw_right == 1 || checkRoles(['partner'])" v-if="!checkRoles(['terminal'])">提现</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.finish_order" v-show="powerInfo.finish_order == 1">结束订单</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.drawback_order" v-show="powerInfo.drawback_order == 1">订单退款</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.steal_order_right" v-show="(powerInfo.steal_order_right == 1 || form.old_steal_order_right == 1) && checkRoles(['terminal','partner'])" :disabled="powerInfo.steal_order_right == 0">DD功能</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.wx_ad_right" v-if="checkRoles(['terminal'])">微信广告</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.buy_goods_right" v-if="powerInfo.buy_goods_right == 1 && checkRoles(['terminal'])">出售设备</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.take_my_product" v-if="powerInfo.take_my_product == 1 && selType.indexOf(7) > -1">添加商品</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.modify_fee_right" v-if="checkRoles(['terminal'])">编辑计费</el-checkbox>
            <el-checkbox :true-label="1" :false-label="0" v-model="form.virtual_divide_status" v-if="powerInfo.virtual_divide_status == 1">分成不一致</el-checkbox>
            <!-- <el-checkbox :true-label="1" :false-label="0" v-model="form.business_store_type" v-if="checkRoles(['terminal'])">车主模式</el-checkbox> -->
          </el-form-item>

          <template v-if="(form.take_my_product && !checkRoles(['terminal'])) || (form.condom_manager_fee > 0)">
            <h4>售货机</h4>
            <el-form-item label="商品管理费：">
              <el-input v-model="form.condom_manager_fee" placeholder="商品管理费">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template>

          <div v-show="false">
            <h4>提现手续费</h4>
            <el-form-item label="模式：">
              <el-radio v-model="form.agent_withdraw_fee_type" :label="0" :disabled="siteInfo.agent_withdraw_fee_type != 2">税点</el-radio>
              <el-radio v-model="form.agent_withdraw_fee_type" :label="1" :disabled="siteInfo.agent_withdraw_fee_type != 2">手续费</el-radio>
              <el-radio v-model="form.agent_withdraw_fee_type" :label="2" :disabled="siteInfo.agent_withdraw_fee_type != 2">税点+手续费</el-radio>
            </el-form-item>
            <div class="flex">
              <el-form-item class="mr-20" label="税点：">
                <el-input v-model="form.withdraw_percent" oninput="value=value.replace(/[^\d.]/g,'')">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
              <el-form-item class="mr-20" label="手续费：">
                <el-input v-model="form.withdraw_fee" oninput="value=value.replace(/[^\d.]/g,'')">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </div>
            <el-form-item>
              <div class="fs-s2 text-gray">注：您填写增加的手续费，将在下级代理提现时以分润的方式发放到您的账户，下级代理提现手续费 = 您设置的手续费 + 总后台设置的手续费。</div>
            </el-form-item>
          </div>
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
          business_type: 0,
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

        agentDevice: [],
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
      this.form.business_type = this.agentInfo.business_type
      this.form.agent_withdraw_fee_type = this.siteInfo.agent_withdraw_fee_type
      this.getPower()
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
