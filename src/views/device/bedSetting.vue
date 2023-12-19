<template>
  <el-row class="pl-20 pr-20 pt-10 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in themeRoom" />
      </el-tabs>

      <el-form ref="form" :model="form" label-position="left" label-width="130px">
        <el-form-item :label="$t('steal.isItEnabled')">
          <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
        </el-form-item>

        <h4>{{ $t('device.orderRelated') }}</h4>
        <el-form-item :label="$t('device.deductingHappyCoins')">
          <el-input type="number" v-model="form.amount" :placeholder="$t('device.deductingHappyCoinsText')">
            <template slot="append">{{ $t('payType.khb') }}</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('device.limitUserNum')">
          <el-input type="number" v-model="form.limitUserNum" :placeholder="$t('device.limitUserNumText')">
            <template slot="append">{{ $t('public.people') }}</template>
          </el-input>
        </el-form-item>

        <h4>{{ $t('device.giftType') }}</h4>
        <el-form-item :label="$t('device.giftMode')">
          <el-radio-group v-model="form.giftType" size="medium">
            <el-radio-button :label="idx" v-for="(item, idx) in [$t('payType.khb'), $t('public.time')]">{{ item
            }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('device.giftQuantity')" v-if="form.giftType == 0">
          <el-input type="number" v-model="form.giftKhb" :placeholder="$t('device.giftQuantityText')">
            <template slot="append">{{ $t('payType.khb') }}</template>
          </el-input>
          <div class="fs-s2 text-gray">{{ $t('device.text') }}{{ form.giftKhb }}{{ $t('device.text1') }}</div>
        </el-form-item>
        <el-form-item :label="$t('device.giftDays')" v-if="form.giftType == 1">
          <el-input type="number" v-model="form.giftDays" :placeholder="$t('device.giftDaysText')">
            <template slot="append">{{ $t('public.day') }}</template>
          </el-input>
          <div class="fs-s2 text-gray">{{ $t('device.text2') }}{{ form.giftDays }}{{ $t('device.text3') }}</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
export default {
  components: {

  },
  data() {
    return {
      clickSubmit: false,
      themeRoom: {},
      form: {
        enable: 2,
        giftKhb: 0,
        giftDays: 3,
        giftType: 1,
        limitUserNum: 1,
        amount: 20,
      },
      id: this.$route.query.id || '',
      userKey: this.$route.query.userKey || '',
      deviceTypeCode: this.$route.query.deviceTypeCode || 'BD',
    }
  },
  computed: {
    myDeviceId() {
      return this.$store.getters.myDeviceId
    }
  },
  mounted() {
    let themeRoom = {}
    for (var i in this.myDeviceId) {
      if (Object.keys(this.config.roomDevice).indexOf(i) > -1) {
        themeRoom[i] = this.myDeviceId[i]
      }
    }
    this.themeRoom = themeRoom
    this.getInfo()
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      let params = {
        deviceTypeCode: this.deviceTypeCode
      }
      if (this.userKey && this.id) params[this.userKey] = this.id
      this.$get('iot-saas-basic/admin/storeOrderConfig/v1/findById', params).then(res => {
        if (res.enable != undefined) {
          this.form = {
            enable: res.enable,
            giftKhb: res.giftKhb,
            giftDays: res.giftDays,
            giftType: res.giftDays ? 1 : 0,
            limitUserNum: res.limitUserNum,
            amount: res.amount
          }
        }
      })
    },

    onSubmit() {
      let that = this;
      let url = 'iot-saas-basic/admin/storeOrderConfig/v1/update',
        params = JSON.parse(JSON.stringify(this.form))
      params.deviceTypeCode = this.deviceTypeCode
      if (params.giftType == 0) params.giftDays = 0
      if (params.giftType == 1) params.giftKhb = 0
      if (this.userKey && this.id) params[this.userKey] = this.id
      this.clickSubmit = true
      this.$post(url, params).then(res => {
        this.clickSubmit = false
        this.$message({
          message: that.$t('public.submittedSuccess'),
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
