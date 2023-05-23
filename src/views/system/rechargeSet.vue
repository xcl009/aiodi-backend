<template>
  <div>
    <condition ref="condition" :filterForm="false">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="form.currencyType" @tab-click="getInfo">
          <el-tab-pane label="用户余额充值" name="RMB" />
          <el-tab-pane label="商户快活币充值" name="KHB" />
        </el-tabs>
      </template>
    </condition>

    <el-row class="p-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :model="form" label-position="left" label-width="120px">
          <h4 class="mt-0" v-if="form.currencyType == 'RMB'">余额充值</h4>
          <el-form-item :label="`充值`" v-if="form.currencyType == 'RMB'">
            <div class="mb-10 flex align-center flex-wrap" v-for="(item, index) in form.configList">
              <el-input type="number" v-model="item.amount" class="flex1 mr-10">
                <template slot="append">元</template>
              </el-input>
              <div>赠送</div>
              <el-input type="number" v-model="item.giftAmount" class="flex1 ml-10 mr-10">
                <template slot="append">元</template>
              </el-input>
              <el-button type="text" size="small" :disabled="form.configList.length == 6" v-if="index == 0"
                @click="form.configList.push({amount: '', giftAmount: ''})">添加</el-button>
              <el-button type="text" size="small" v-else
                @click="form.configList.splice(index, 1)" class="text-danger">删除</el-button>
            </div>
          </el-form-item>

          <h4 class="mt-0" v-if="form.currencyType == 'KHB'">快活币充值</h4>
          <el-form-item :label="`充值`" v-if="form.currencyType == 'KHB'">
            <div class="mb-10 flex align-center flex-wrap" v-for="(item, index) in form.configList">
              <el-input type="number" v-model="item.amount" class="flex1 mr-10">
                <template slot="append">快活币</template>
              </el-input>
              <div>赠送</div>
              <el-input type="number" v-model="item.giftAmount" class="flex1 ml-10 mr-10">
                <template slot="append">快活币</template>
              </el-input>
              <el-button type="text" size="small" :disabled="form.configList.length == 6" v-if="index == 0"
                @click="form.configList.push({amount: '', giftAmount: ''})">添加</el-button>
              <el-button type="text" size="small" v-else
                @click="form.configList.splice(index, 1)" class="text-danger">删除</el-button>
            </div>
          </el-form-item>
          <el-form-item class="mb-0">
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
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
        let url = 'iot-saas-pay/admin/recharge/update',
          params = JSON.parse(JSON.stringify(this.form))
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
