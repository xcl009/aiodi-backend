<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="myDeviceId['VM'] && vendorInfo.operationMode == 'SELF_RUN'">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.commodityManagement') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.commodityManagementText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/goods/relatedTemplate` })">{{
                $t('system.warehouseTemplate') }}</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/goods/addGoods` })">{{
                $t('system.addGoods') }}</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/goods` })">{{
                $t('system.productList') }}</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/goods/goodsOrder` })">{{
                $t('userManage.viewOrder') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-else-if="myDeviceId['VM'] && Ability['order']">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.vendingOrder') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.vendingOrderText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/goods/goodsOrder` })">{{
                $t('userManage.viewOrder') }}</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(Object.keys(config.roomDevice), 2)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.themeRoomEquipment') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.themeRoomEquipmentText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/bedSetting` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('public.probabilityDeposit') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.probabilityDepositText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/steal/depositCash` })">{{
                $t('system.setProbability') }}</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/steal/depositCashUser` })">{{
                $t('system.probabilityDepositList') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_DEPOSIT_DELAY', '_DEPOSIT_MP'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.depositRefundRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.depositRefundRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/depositRefund` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_FREEQUOTA'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.freeQuotaRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.freeQuotaRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/freeQuotaConfig` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_BILLING'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.defaultBillingRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.defaultBillingRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/billing` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_DD_RATIO', '_DD_TIME', '_DD_FAIL'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('store.DDSettings') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.ddRules') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/store/steal` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand()">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.overdueOrders') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.overdueOrdersText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/orderOt` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="checkAbility(['WD_AGENT', 'WD_STORE', 'WD_USER'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.withdrawalRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.withdrawalRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/system/cashSet` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="24" class="pb-20 cursor">
          <div>{{ $t('system.development') }}</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'deviceTools',
  components: {

  },
  data() {
    return {
      vendorInfo: {}, // 售货机运营信息
    }
  },
  computed: {
    Ability() {
      return this.$store.getters.Ability
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    }
  },
  mounted() {
    if (this.isBrand()) {
      this.vendorInfo = {
        operationMode: 'SELF_RUN',
        rebateRatio: 100
      }
    } else if (this.myDeviceId['VM']) {
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
  }
}
</script>

<style lang="scss" scoped>.role-item {
  padding: 20px 16px;
  height: 184px;
  border-radius: 4px;
  border: 1px solid #E5E6EB;

  .icon-box {
    width: 64px;
    height: 64px;
    background-color: var(--olive);
    border-radius: 64px;
    font-size: 20px;
    color: var(--white);
  }

  .bg-body {
    padding: 10px 15px;
  }
}</style>
