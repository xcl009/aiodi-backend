<template>
  <div>
    <el-row class="p-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" label-position="left" label-width="130px">
          <template v-for="(item, index) in deviceDataArr">
            <template v-for="(name, xcx) in config.xcx_pay.default">
              <el-form-item :label="`${name}付费模式`">
                <el-radio-group v-model="item[`${xcx}PayMode`].modeType" size="medium">
                  <el-radio-button :label="item" v-for="(item, key) in config.mode_way.default" :disabled="key != 1">{{ key }}</el-radio-button>
                </el-radio-group>
                <el-popover
                  placement="right"
                  title=""
                  width="400"
                  trigger="hover">
                  <div>
                    需了解和设置预存+先充后付？<el-link type="primary" :underline="false">点此去购买</el-link>
                  </div>
                  <el-link type="danger" :underline="false" slot="reference" class="ml-10 el-icon-question fs-c1"></el-link>
                </el-popover>
              </el-form-item>

              <el-form-item :label="`套餐设置`" v-if="item[`${xcx}PayMode`]">
                <div class="flex align-center flex-wrap" v-for="(plan, index) in item[`${xcx}PayMode`].list">
                  <el-select v-model="plan.time">
                    <el-option :label="`${time}小时`" :value="time" v-for="time in config[`plan_time`]"></el-option>
                  </el-select>
                  <el-input v-model="plan.money" class="flex1 ml-10 mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-button type="text" size="small" :disabled="item[`${xcx}PayMode`].list.length == 4" v-if="index == 0"
                    @click="item[`${xcx}PayMode`].list.push({time: 1, money: 2, tag: index + 1})">添加</el-button>
                  <el-button type="text" size="small" v-else
                    @click="item[`${xcx}PayMode`].list.splice(index, 1)" class="text-danger">删除</el-button>
                </div>
              </el-form-item>
            </template>
          </template>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        selDevice: [],
        deviceDataArr: [],
        defaultDevice: {
          weixinPayMode: {
            modeType: 'PACKAGE',
            typeName: '',
            list: [
              {
                time: 1,
                money: 2
              }
            ]
          },
          alipayPayMode: {
            modeType: 'PACKAGE',
            typeName: '',
            list: [
              {
                time: 1,
                money: 2
              }
            ]
          }
        },
      }
    },
    computed: {
      myDevice() {
        let myDevice = this.$store.getters.myDevice
        return myDevice
      },
      deviceNameObj(){
        return this.$store.state.user.deviceNameObj
      }
    },
    mounted() {
      console.log(this.myDevice)
      this.getDefaultConfig()
    },
    methods: {
      /**
       * 获取信息
       */
      getDefaultConfig() {
        this.$get('iot-saas-basic/admin/settings/find').then(res => {
          if(JSON.stringify(res) == '{}'){
            this.selDevice.push(this.myDevice[0].id)
            this.defaultDevice.deviceTypeId = this.myDevice[0].id
            this.deviceDataArr.push(this.defaultDevice)
          } else {
            this.deviceDataArr.push(res.paymentSettings)
          }
        })
      },

      /**
       * 提交数据
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.deviceDataArr)), url = 'iot-saas-basic/admin/settings/save'
        this.clickSubmit = true
        this.$post(url, {
          paymentSettings: params[0]
        }).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.$store.dispatch('user/getPlatformConfig')
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
