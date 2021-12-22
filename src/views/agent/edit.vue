<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <div class="pt-20 pb-20 text-black text-bold">运营产品</div>
          <el-checkbox-group v-model="selDevice" :min="1">
            <el-checkbox v-for="item in myDevice" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>

          <div class="pt-20 pb-20 text-black text-bold">基础信息</div>
          <el-form-item label="品牌logo">
            <upload v-model="form.logo" />
          </el-form-item>
          <el-form-item label="品牌名称" prop="name">
            <el-input v-model="form.name" placeholder="输入品牌名称" />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码（此号码会作为登录账户）" />
          </el-form-item>
          <el-form-item label="登录密码" v-if="!aid">
            <el-input v-model="form.password" placeholder="会作为用户代理登录的密码" />
          </el-form-item>
          <el-form-item label="运营区域">
            <el-cascader v-model="form.areaId" :options="areaList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item label="公司名称">
            <el-input v-model="form.companyName" placeholder="公司名称" />
          </el-form-item>
          <el-form-item label="公司地址">
            <el-input v-model="form.companyAddress" placeholder="输入公司地址" />
          </el-form-item>
          <el-form-item label="公司电话">
            <el-input v-model="form.companyPhoneNum" placeholder="输入公司电话" />
          </el-form-item>

          <template>
            <div class="pt-20 pb-20 text-black text-bold">分润比例</div>
            <template v-for="(item, index) in form.deviceTypDeviceProfitRatios">
              <el-form-item :label="`${item.name}：`" v-if="selDevice.indexOf(item.id) > -1">
                <el-input v-model="item.profitRatio" :placeholder="`最高不能超过100%`">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
            </template>
          </template>

          <!-- <template v-if="(form.take_my_product && !checkRoles(['terminal'])) || (form.condom_manager_fee > 0)">
            <div class="pt-20 pb-20 text-black text-bold">售货机</div>
            <el-form-item label="商品管理费">
              <el-input v-model="form.condom_manager_fee" placeholder="商品管理费">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template> -->

          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload'
  export default {
    components: {
      upload
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          password: '123456',
          deviceTypDeviceProfitRatios: []
        },
        rules: {
          role_id: [
            { required: true, message: '请选择开通类型', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请填写联系人姓名', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请填写手机号码作为登录账户', trigger: 'blur' }
          ]
        },
        areaList: [],
        powerInfo: {},
        role: [],

        selDevice: [],
        aid: this.$route.params.aid || ''
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
      },
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      myDevice() {
        let myDevice = this.$store.getters.myDevice
        this.selDevice.push(myDevice[0].id)
        //this.form.deviceTypDeviceProfitRatios = myDevice
        return myDevice
      }
    },
    mounted() {
      this.form.deviceTypDeviceProfitRatios = this.myDevice
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
          this.myDevice = res
          if(this.id > 0){
            this.getInfo()
          }
        })
      },

      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-user/admin/brand/updateStatusById', {
          id: this.aid
        }).then(res => {
          let info = res.agent_info
          delete info.password
          if(this.siteInfo.agent_withdraw_fee_type != 2) info.agent_withdraw_fee_type = this.siteInfo.agent_withdraw_fee_type
          info.old_steal_order_right = info.steal_order_right
          if(this.powerInfo.steal_order_right == 0) info.steal_order_right = 0
          this.form = info
        })
      },

      /**
       * 上传文件成功通知
       */
      fileOk(arr) {
        this.form.avatar = arr[0] || ''
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let params = {}, url = 'iot-saas-basic/brand', profit_key = this.config.profit_key
        params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.id > 0){
              params.id = this.id
              url = 'iot-saas-basic/brand/updateById'
            }
            this.clickSubmit = true
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
       * 获取城市
       */
      getCity(){
        this.$get('commonapi/tool/get_address_list').then(res => {
          for (var i in res) {
            const firstLevel = res[i]
            const obj = {
              value: firstLevel.tag,
              label: firstLevel.title,
              children: []
            }
            if (firstLevel.son_list.length > 0) {
              const secondLevel = firstLevel.son_list
              for (var s in secondLevel) {
                const secondItem = secondLevel[s]
                if (this.region_tag == secondItem.tag) this.form.region_tag = [obj.value, secondItem.tag]
                obj.children.push({
                  value: secondItem.tag,
                  label: secondItem.title,
                  children: []
                })
                if (secondItem.son_list.length > 0) {
                  const thirdLevel = secondItem.son_list
                  for (var t in thirdLevel) {
                    const thirdItem = thirdLevel[t]
                    if (this.region_tag == thirdItem.tag) this.form.region_tag = [obj.value, secondItem.tag, thirdItem.tag]
                    obj.children[s].children.push({
                      value: thirdItem.tag,
                      label: thirdItem.title
                    })
                  }
                } else {
                  obj.children = undefined
                }
              }
            } else {
              obj.children = undefined
            }
            this.areaList.push(obj)
          }
          if (!this.id) {
            const first = this.areaList[0]
            this.form.region_tag = [first.value, first.children[0].value, first.children[0].children[0].value]
          }
        })
      },
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
