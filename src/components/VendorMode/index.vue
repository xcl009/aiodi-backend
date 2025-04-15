<template>
  <el-dialog :visible.sync="dialogStatus" :show-close="false" :modal-append-to-body="false" width="600px" :center="true"
    :title="$t('components.machineSettings')">
    <el-form class="custom-form pl-20 pr-20" label-width="auto">
      <el-form-item :label="$t('components.operationMode')">
        <el-radio-group v-model="dform.operationMode" size="small">
          <el-radio-button label="REBATE">{{ $t('components.dividendModel') }}</el-radio-button>
          <el-radio-button label="SELF_RUN" v-if="vendorInfo.operationMode == 'SELF_RUN'">{{
            $t('components.selfOperatedMode') }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('brand.dividendRatio')" v-if="dform.operationMode == 'REBATE'">
        <el-input v-model="dform.rebateRatio" :placeholder="`${$t('store.max')}${vendorInfo.rebateRatio}`">
          <span slot="append">%</span>
        </el-input>
        <div class="mt-10 fs-s3 line-default">
          {{ $t('components.text3') }}
        </div>
      </el-form-item>
      <template v-if="vendorInfo.operationMode == 'SELF_RUN' || vendorInfo.replenishment == 'YES'">
        <el-form-item :label="$t('components.whetherToRestock')" v-if="dform.operationMode == 'REBATE'">
          <el-switch v-model="dform.replenishment" active-value="YES" inactive-value="NO">
          </el-switch>
        </el-form-item>
      </template>
      <el-form-item :label="$t('components.managementFees')" v-if="dform.operationMode == 'SELF_RUN'">
        <el-input v-model="dform.poundage" :placeholder="$t('components.managementFeesText')">
          <span :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</span>
        </el-input>
        <div class="mt-10 fs-s3 line-default">
          {{ $t('components.text4') }}
        </div>
      </el-form-item>
    </el-form>
    <div class="mt-30 text-center">
      <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
      <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  currencySymbolposition
} from '@/utils/index'
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
      dform: {},
      currencySymbolpositionType:false
    }
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    }
  },
  mounted() {
    this.currencySymbolpositionType =  currencySymbolposition();
    if (!this.isBrand()) {
      this.getVendorInfo()
    }
  },
  methods: {
    /**
     * 我的运营模式详情
     */
    getVendorInfo() {
      this.$get('iot-saas-device/admin/vendor/setting', {
        companyId: this.isAgent() ? this.agentInfo.agentId : this.agentInfo.storeIds[0]
      }).then(res => {
        this.vendorInfo = res || {}
      })
    },

    /**
     * 获取公司模板
     */
    getCompanyInfo(companyId) {
      let that = this;
      if (!this.isBrand() && !this.vendorInfo.operationMode) {
        this.$message({
          type: 'error',
          message: that.$t('components.message6')
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
    dialogConfirm() {
      let that = this;
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.$put('iot-saas-device/admin/vendor/setting', this.dform).then(res => {
        this.$message({
          message: that.$t('public.operationSuccessful'),
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
<style scoped lang="scss"></style>
