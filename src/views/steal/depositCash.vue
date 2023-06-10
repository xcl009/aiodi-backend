<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>
      <template v-if="checkAbility([`${deviceTypeCode}_DEPOSIT_PRPR`], 3)">
        <el-form ref="form" label-position="left" label-width="auto">
          <h4 class="flex mb-20 mt-10">
            <div>概率押金</div>
            <div class="ml-5">
              <el-popover placement="top-start" title="温馨提示" width="450" trigger="hover">
                <div>
                  设置后用户下单有一定概率提示免押失败，需缴纳押金才可租借
                </div>
                <svg-icon icon-class="doubt" slot="reference"></svg-icon>
              </el-popover>
            </div>
          </h4>

          <el-form-item label="是否开启">
            <div class="flex align-center">
              <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示设置有效，设置后5分钟内生效</span>
            </div>
          </el-form-item>

          <el-form-item label="概率">
            <el-input type="number" v-model="form.probability">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>

          <!-- <div class="flex">
            <el-form-item label="每">
              <el-input type="number" v-model="form.orderBaseNum">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
            <el-form-item label="押">
              <el-input type="number" v-model="form.probability">
                <template slot="append">单</template>
              </el-input>
            </el-form-item>
          </div> -->

          <el-form-item label="时间">
            <el-input type="number" v-model="form.durationTime">
              <template slot="append">天</template>
            </el-input>
            <div>
              用户在进入概率押金名单{{ form.durationTime || 0 }}天后再次租借会重新计算概率是否可免押租借
            </div>
          </el-form-item>

          <el-form-item label="钱包余额">
            <el-input type="number" v-model="form.walletBalance">
              <template slot="append">元</template>
            </el-input>
            <div>
              用户钱包余额大于等于{{ form.walletBalance > 0 ? form.walletBalance : 0.1 }}元时无需进行概率押金计算，直接免押租借
            </div>
          </el-form-item>

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
  import {
    pickKeys
  } from "@/utils/index"
  export default {
    name: 'steal',
    data() {
      return {
        form: {},
        deviceTypeCode: '',
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
        if(!this.checkAbility([`${this.deviceTypeCode}_DEPOSIT_PRPR`], 3)) return
        this.$get(`iot-saas-basic/admin/probabilityDeposit/v1/find`, {
          deviceTypeCode: this.deviceTypeCode
        }).then((res = {} )=> {
          if (res.enable == undefined) {
            this.form = {
              enable: 2,
              durationTime: 7,
              probability: 0,
              walletBalance: 0
            }
          } else {
            res.durationTime = parseInt(res.durationTime) / 1440
            this.form = res
          }
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        params.deviceTypeCode = this.deviceTypeCode
        params.durationTime = parseInt(params.durationTime) * 1440
        this.$post(`iot-saas-basic/admin/probabilityDeposit/v1/update`, params).then(res => {
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
  /deep/ .el-tabs__item {
    height: 50px;
    line-height: 50px;
    font-size: 16px;
  }
</style>
