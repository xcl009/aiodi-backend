<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="100px">
          <h4 class="pt-20">设备类型</h4>
          <el-checkbox-group v-model="selDevice" class="pl-10">
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <h4>基础信息</h4>
          <el-form-item label="设备数量" prop="name">
            <el-input v-model="form.name" placeholder="输入设备数量" />
          </el-form-item>
          <el-form-item label="总金额" prop="mobile">
            <el-input type="number" v-model="form.mobile" placeholder="请输入订单总金额" />
          </el-form-item>
          <el-form-item label="扣款周期">
            <div class="flex">
              <div class="flex1">
                <el-input type="number" v-model="form.day">
                  <template slot="prepend">每</template>
                  <template slot="append">天</template>
                </el-input>
              </div>
              <div class="pl-10 flex1">
                <el-input type="number" v-model="form.price">
                  <template slot="prepend">扣款</template>
                  <template slot="append">元</template>
                </el-input>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="扣款开始日期">
            <el-date-picker
                v-model="form.start"
                type="date"
                placeholder="选择日期">
              </el-date-picker>
          </el-form-item>
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
        form: {
          password: '123456',
          deviceTypeProfitRatios: {}
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
        cityList: [],
        powerInfo: {},
        role: [],

        selDevice: [],
        agentId: this.$route.query.agentId || ''
      }
    },
    computed: {
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
        return this.$store.getters.myDevice
      },
      myProfitRatio() {
        return this.$store.getters.myProfitRatio
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('iot-saas-basic/admin/agent/findById', {
          id: this.agentId
        }).then(res => {
          this.form = res
        })
      },

      /**
       * 提交添加
       */
      onSubmit() {
        let params = {}, url = 'iot-saas-basic/admin/agent/save'
        params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.agentId){
              params.id = this.agentId
              url = 'iot-saas-basic/admin/agent/updateById'
            }
            this.clickSubmit = true
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/agent'
              })
            }).catch( err => {
              setTimeout(() => {
                this.clickSubmit = false
              }, 1000)
            })
          } else {
            this.clickSubmit = false
          }
        })
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
