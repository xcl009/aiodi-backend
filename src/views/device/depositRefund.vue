<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_DELAY`, `${deviceTypeCode}_DEPOSIT_MP`], 3)">
        <el-form ref="form" label-position="left" label-width="130px">
          <el-form-item label="状态" v-if="id">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示设置有效</span>
            </div>
          </el-form-item>

          <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_MP`], 3)">
            <el-form-item label="退回钱包">
              <div class="flex align-center">
                <el-switch v-model="form.returnWallet" :active-value="1" :inactive-value="2" />
                <span class="ml-10 fs-s3">开启表示押金退到小程序钱包，不开启表示押金原路退回</span>
              </div>
            </el-form-item>
          </template>

          <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_DELAY`], 3)">
            <el-form-item label="延时退">
              <div class="flex align-center">
                <el-switch v-model="form.refundTimeStatus" :active-value="1" :inactive-value="2" />
                <span class="ml-10 fs-s3">开启表示押金延时退回，不开启表示订单结束押金立即退回</span>
              </div>
            </el-form-item>

            <el-form-item label="延长时间" v-if="form.refundTimeStatus == 1">
              <el-input v-model="form.delayedRefundTime" type="number">
                <template slot="append">分钟</template>
              </el-input>
            </el-form-item>
          </template>

          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <div class="pb-20 cursor" @click="$router.push({path: `/market/appList`})">暂未购买此功能服务，<span class="text-primary">去购买</span></div>
      </template>
    </el-col>
  </el-row>
</template>

<script>
  import { pickKeys } from "@/utils/index"
  export default {
    name: 'steal',
    data() {
      return {
        form: {
          refundTimeStatus: 2
        },
        id: this.$route.query.id || '',
        userKey: this.$route.query.userKey || '',
        deviceTypeCode: ''
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {
      this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
      this.getInfo()
    },
    methods: {
      /**
       * 获取详情
       */
      getInfo() {
        let params = {
          deviceTypeCode: this.deviceTypeCode
        }
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$get(`iot-saas-basic/admin/depositRefundConfig/v1/find`, params).then(res => {
          if (res.enable != undefined) {
            res.refundTimeStatus = res.delayedRefundTime > 0 ? 1 : 0
            this.form = res
          }
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        if(this.userKey && this.id){
          params[this.userKey] = this.id
        } else {
          params.enable = 1
        }
        params.deviceTypeCode = this.deviceTypeCode
        params.delayedRefundTime = params.refundTimeStatus == 1 ? params.delayedRefundTime : 0
        this.$post(`iot-saas-basic/admin/depositRefundConfig/v1/update`, params).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-tabs__item{
    height: 50px;
    line-height: 50px;
    font-size: 16px;
  }
</style>
