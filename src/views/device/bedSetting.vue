<template>
  <el-row class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="12" :lg="10">
      <el-form ref="form" :model="form" label-position="left" label-width="130px">
        <h4 class="mt-0">状态</h4>
        <el-form-item label="是否开启">
          <el-switch v-model="form.enable" :active-value="1" :inactive-value="2" />
        </el-form-item>

        <h4>订单相关</h4>
        <el-form-item label="扣除快活币">
          <el-input v-model="form.amount" placeholder="商户创建按摩床订单扣除快活币数量">
            <template slot="append">快活币</template>
          </el-input>
        </el-form-item>
        <el-form-item label="使用人数">
          <el-input v-model="form.limitUserNum" placeholder="商户创建的订单限几个用户使用">
            <template slot="append">人</template>
          </el-input>
        </el-form-item>

        <h4>赠送规则</h4>
        <el-form-item label="赠送模式">
          <el-radio-group v-model="form.giftType" size="medium">
            <el-radio-button :label="idx" v-for="(item, idx) in ['快活币', '时间']">{{ item }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="赠送数量" v-if="form.giftType == 0">
          <el-input v-model="form.giftKhb" placeholder="赠送快活币数量">
            <template slot="append">快活币</template>
          </el-input>
          <div class="fs-s2 text-gray">每绑定一个设备赠送商户{{ form.giftKhb }}快活币，解绑设备也会扣除赠送的快活币</div>
        </el-form-item>
        <el-form-item label="赠送天数" v-if="form.giftType == 1">
          <el-input v-model="form.giftDays" placeholder="赠送免费床东订单天数">
            <template slot="append">天</template>
          </el-input>
          <div class="fs-s2 text-gray">设备绑定商户后，商户在{{ form.giftDays }}天内在后台创建订单无需支付快活币</div>
        </el-form-item>
        <el-form-item class="mb-0">
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
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
        form: {
          enable: 1,
          giftKhb: 400,
          giftDays: 0,
          giftType: 0,
          limitUserNum: 1,
          amount: 20,
        },
        id: this.$route.query.id || '',
        userKey: this.$route.query.userKey || '',
        deviceTypeCode: 'BD',
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
        let params = {
          deviceTypeCode: this.deviceTypeCode
        }
        if(this.userKey && this.id) params[this.userKey] = this.id
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
        let url = 'iot-saas-basic/admin/storeOrderConfig/v1/update',
          params = JSON.parse(JSON.stringify(this.form))
        params.deviceTypeCode = this.deviceTypeCode
        if(params.giftType == 0) params.giftDays = 0
        if(params.giftType == 1) params.giftKhb = 0
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.clickSubmit = true
        this.$post(url, params).then(res => {
          this.clickSubmit = false
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style scoped>

</style>
