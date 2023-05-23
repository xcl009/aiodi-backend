<template>
  <el-row class="pl-20 pr-20 custom-form bg-white">
    <el-col :sm="24" :md="16" :lg="14" :xl="10">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId"/>
      </el-tabs>

      <template v-if="checkAbility([`${deviceTypeCode}_FREEQUOTA`], 3)">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="130px">
          <h4>免费名额默认设置</h4>
          <el-form-item label="免费" prop="freeTime">
            <el-input v-model="form.freeTime" type="number">
              <template slot="append">小时</template>
            </el-input>
          </el-form-item>
          <el-form-item label="每天可使用" prop="freeTimes">
            <el-input v-model="form.freeTimes" type="number">
              <template slot="append">次</template>
            </el-input>
          </el-form-item>

          <h4>代理添加免费名额限制</h4>
          <el-form-item label="单商户最多" prop="agentConfigFreeQuotaNum">
            <el-input v-model="form.agentConfigFreeQuotaNum" type="number">
              <template slot="append">名额</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最多免费" prop="agentConfigFreeTime">
            <el-input v-model="form.agentConfigFreeTime" type="number">
              <template slot="append">小时</template>
            </el-input>
          </el-form-item>
          <el-form-item label="每天最多可使用" prop="agentConfigFreeTimes">
            <el-input v-model="form.agentConfigFreeTimes" type="number">
              <template slot="append">次</template>
            </el-input>
          </el-form-item>
          <el-form-item class="mt-10">
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">立即提交</el-button>
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
  export default {
    name: 'freeQuotaConfig',
    data() {
      return {
        rules: {
          freeTime: [{
            required: true,
            message: '请填写默认免费时长',
            trigger: 'blur'
          }],
          freeTimes: [{
            required: true,
            message: '请填写默认每天使用次数',
            trigger: 'blur'
          }],
          agentConfigFreeQuotaNum: [{
            required: true,
            message: '请填写代理单商户可添加名额数量',
            trigger: 'blur'
          }],
          agentConfigFreeTime: [{
            required: true,
            message: '请填写代理可修改免费最高时长',
            trigger: 'blur'
          }],
          agentConfigFreeTimes: [{
            required: true,
            message: '请填写代理可修改每天最多使用次数',
            trigger: 'blur'
          }]
        },
        clickSubmit: false,
        form: {},
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
        this.$get(`iot-saas-basic/admin/free/quota/config/v1/find`, {
          deviceTypeCode: this.deviceTypeCode
        }).then((res = {}) => {
          if (res.deviceTypeCode != undefined) {
            res.agentConfigFreeTime = parseInt(res.agentConfigFreeTime) / 60
            res.freeTime = parseInt(res.freeTime) / 60
            this.form = res
          } else {
            this.form = {}
          }
        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        params.deviceTypeCode = this.deviceTypeCode
        params.freeTime = parseFloat(params.freeTime) * 60
        params.agentConfigFreeTime = parseFloat(params.agentConfigFreeTime) * 60
        this.clickSubmit = true
        this.$refs['form'].validate((valid, object) => {
          if (valid) {
            this.$post(`iot-saas-basic/admin/free/quota/config/v1/update`, params).then(res => {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
          } else {
            this.clickSubmit = false
          }
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
