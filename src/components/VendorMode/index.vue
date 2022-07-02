<template>
  <el-dialog :visible.sync="dialogStatus" :show-close="false" :modal-append-to-body="false" width="600px" :center="true"  title="售货机设置">
    <el-form class="custom-form pl-20 pr-20" label-width="auto">
      <el-form-item label="运营模式">
        <el-radio-group v-model="dform.operationMode" size="small">
          <el-radio-button label="REBATE">分润模式</el-radio-button>
          <el-radio-button label="SELF_RUN" v-if="vendorInfo.operationMode == 'SELF_RUN'">自营模式</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分润比例" v-if="dform.operationMode == 'REBATE'">
        <el-input v-model="dform.rebateRatio" :placeholder="`最高不能超过${vendorInfo.rebateRatio}`">
          <span slot="append">%</span>
        </el-input>
        <div class="mt-10 fs-s3 text-gray line-default">
          TA的商户和设备将关联您或您上级添加的商品，售出订单按比例分成
        </div>
      </el-form-item>
      <template v-if="vendorInfo.operationMode == 'SELF_RUN' || vendorInfo.replenishment == 'YES'">
        <el-form-item label="是否补货" v-if="dform.operationMode == 'REBATE'">
          <el-switch
            v-model="dform.replenishment"
            active-value="YES"
            inactive-value="NO"
            >
          </el-switch>
        </el-form-item>
      </template>
      <el-form-item label="管理费" v-if="dform.operationMode == 'SELF_RUN'">
        <el-input v-model="dform.poundage" placeholder="每笔商品订单您想要收取的费用">
          <span slot="append">元</span>
        </el-input>
        <div class="mt-10 fs-s3 text-gray line-default">
          下级自己添加商品，商户和设备关联自己的商品，售出订单您得到设置的管理费
        </div>
      </el-form-item>
    </el-form>
    <div class="mt-30 text-center">
      <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
      <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'VendorMode',
    data() {
      return {
        clickSubmit: false,
        dialogStatus: false,
        vendorInfo: {
          operationMode: 'SELF_RUN',
          rebateRatio: 100
        }, // 售货机运营信息
        dform: {}
      }
    },
    mounted() {
      if(!this.isBrand()){
        this.getVendorInfo()
      }
    },
    methods: {
      /**
       * 我的运营模式详情
       */
      getVendorInfo(){
        this.$get('iot-saas-device/admin/vendor/setting').then(res => {
          this.vendorInfo = res || {}
        })
      },

      /**
       * 获取公司模板
       */
      getCompanyInfo(companyId){
        if(!this.isBrand() && !this.vendorInfo.operationMode){
          this.$message({
            type: 'error',
            message: '暂未查询到您的运营模式，请联系您的上级处理'
          })
          return
        }
        this.dialogStatus = true
        this.companyId = companyId
        this.$get('iot-saas-device/admin/vendor/setting', {
          companyId: companyId
        }).then((res = {}) => {
          this.dform = {
            childId: companyId,
            operationMode: res.operationMode || 'REBATE',
            rebateRatio: res.rebateRatio || '',
            poundage: res.poundage || 0,
            replenishment: res.replenishment || 'NO',
          }
        })
      },

      /**
       * 弹窗确认
       */
      dialogConfim() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.$put('iot-saas-device/admin/vendor/setting', this.dform).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.dialogStatus = false
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      }
    }
  }
</script>
<style scoped lang="scss">

</style>
