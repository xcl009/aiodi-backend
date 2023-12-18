<template>
  <div>
    <condition ref="condition" :filterForm="false">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="form.currencyType" @tab-click="getInfo">
          <el-tab-pane :label="$t('system.balanceRecharge')" name="RMB" />
          <el-tab-pane :label="$t('system.happyCoinRecharge')" name="KHB" />
        </el-tabs>
      </template>
    </condition>

    <el-row class="p-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <h4 class="mt-0" v-if="form.currencyType == 'RMB'">{{ $t('userManage.rechargeType') }}</h4>
          <el-form-item :label="`${$t('public.recharge')}`" v-if="form.currencyType == 'RMB'">
            <div class="mb-10 flex align-center flex-wrap" v-for="(item, index) in form.configList">
              <el-input type="number" v-model="item.amount" class="flex1 mr-10">
                <template slot="append">{{ $t('public.element') }}</template>
              </el-input>
              <div>{{ $t('public.give') }}</div>
              <el-input type="number" v-model="item.giftAmount" class="flex1 ml-10 mr-10">
                <template slot="append">{{ $t('public.element') }}</template>
              </el-input>
              <el-button type="text" size="small" :disabled="form.configList.length == 6" v-if="index == 0"
                @click="form.configList.push({ amount: '', giftAmount: '' })">{{ $t('public.add') }}</el-button>
              <el-button type="text" size="small" v-else @click="form.configList.splice(index, 1)" class="text-danger">{{
                $t('public.delete') }}</el-button>
            </div>
          </el-form-item>

          <h4 class="mt-0" v-if="form.currencyType == 'KHB'">{{ $t('home.khbRecharge') }}</h4>
          <el-form-item :label="`${$t('public.recharge')}`" v-if="form.currencyType == 'KHB'">
            <div class="mb-10 flex align-center flex-wrap" v-for="(item, index) in form.configList">
              <el-input type="number" v-model="item.amount" class="flex1 mr-10">
                <template slot="append">{{ $t('payType.khb') }}</template>
              </el-input>
              <div>{{ $t('public.give') }}</div>
              <el-input type="number" v-model="item.giftAmount" class="flex1 ml-10 mr-10">
                <template slot="append">{{ $t('payType.khb') }}</template>
              </el-input>
              <el-button type="text" size="small" :disabled="form.configList.length == 6" v-if="index == 0"
                @click="form.configList.push({ amount: '', giftAmount: '' })">{{ $t('public.add') }}</el-button>
              <el-button type="text" size="small" v-else @click="form.configList.splice(index, 1)" class="text-danger">{{
                $t('public.delete') }}</el-button>
            </div>
          </el-form-item>
          <el-form-item class="mb-0">
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
            }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import condition from '@/components/condition/'
export default {
  components: {
    condition
  },
  data() {
    return {
      clickSubmit: false,
      form: {
        currencyType: 'RMB',
        configList: [

        ]
      }
    }
  },
  mounted() {
    this.getInfo()
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$get('iot-saas-pay/api/recharge/list', {
        currencyType: this.form.currencyType
      }).then(res => {
        res = res.length > 0 ? res : [{
          amount: 100,
          giftAmount: 0
        }]
        this.form.configList = res
      })
    },

    onSubmit() {
      let that = this;
      let url = 'iot-saas-pay/admin/recharge/update',
        params = JSON.parse(JSON.stringify(this.form))
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        this.clickSubmit = false
        this.$message({
          message: that.$t('public.submit'),
          type: 'success'
        })
      }).catch(err => {
        this.clickSubmit = false
      })
    }
  }
}
</script>

<style scoped></style>
