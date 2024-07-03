<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand()">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box default flex align-center justify-center">
                <svg-icon icon-class="setting"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.overdueOrders') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.overdueOrdersText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/orderOt` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="myDeviceId['VM'] && vendorInfo.operationMode == 'SELF_RUN'">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box default flex align-center justify-center">
                <svg-icon icon-class="setting"></svg-icon>
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
              <div class="icon-box default flex align-center justify-center">
                <svg-icon icon-class="setting"></svg-icon>
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
              <div class="icon-box default flex align-center justify-center">
                <svg-icon icon-class="setting"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.themeRoomEquipment') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.themeRoomEquipmentText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/bedSetting` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
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
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.depositRefundRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.depositRefundRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/depositRefund` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_FREEQUOTA'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.freeQuotaRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.freeQuotaRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary"
                @click="$router.push({ path: `/device/freeQuotaConfig` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_BILLING'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.defaultBillingRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.defaultBillingRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/device/billing` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_DD_RATIO', '_DD_TIME', '_DD_FAIL'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('store.DDSettings') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.ddRules') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/store/steal` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_DD_RATIO', '_DD_TIME', '_DD_FAIL'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('steal.delayedOrder') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('steal.delayedOrderText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'ORDER_CLOSE_TIME' }, 5)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="checkAbility(['WD_AGENT', 'WD_STORE', 'WD_USER'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.withdrawalRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.withdrawalRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/system/cashSet` })">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['MOBILE_POWER'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.setLoginPone') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.setLoginPone') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'MOBILE_POWER' }, 1)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['RENT_LIMIT'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.frequencyLimit') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.frequencyLimitText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'RENT_LIMIT' }, 2)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['NEAR_STORE'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.setMap') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.setMapText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'NEAR_STORE' }, 3)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['STORE_MONEY_SET'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.statisticalSettings') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.statisticalSettingsText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'STORE_MONEY_SET' }, 4)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['TIKTOK_DRAINS'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.tiktok') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.tiktokText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'TIKTOK_DRAINS' }, 6)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_MEMBER_XF', '_MEMBER_DQ'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('order.membershipOrder') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('store.membershipCard') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary"
                @click="$router.push({ path: `/store/openMemberRecord` })">{{
        $t('userManage.viewOrder') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['_MEMBER_XF', '_MEMBER_DQ'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.checkTwoPwd') }} </div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.setCheckTwoPwd') }} </div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'IS_CHECK_TWOPASSWORD' }, 7)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="isBrand() && checkAbility(['AUTO_REFUND_DEPOSIT'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="fuwu"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('public.refundOfDeposit') }} </div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('public.refundOfDepositText1') }} </div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'AUTO_REFUND_DEPOSIT' }, 8)">{{
        $t('public.setUp') }}</el-button>
            </div>
          </div>
        </el-col>

        <el-col :span="24" class="pb-20 cursor">
          <div>{{ $t('system.development') }}</div>
        </el-col>
      </el-row>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <el-form-item :label="$t('payType.wx')">
            <el-switch v-model="dform.wx_phone" :active-value="1" :inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('system.wxText') }}</div>
          </el-form-item>
          <!-- <el-form-item label="支付宝">
            <el-switch v-model="dform.ali_phone" :active-value="1" :inactive-value="0" />
            <div class="line-default fs-s3">开启表示支付宝用户登录需授权手机号码（须获得获取会员手机号权限，否则用户无法正常登录）</div>
          </el-form-item> -->
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <el-form-item :label="$t('system.borrowableTimes')">
            <el-input v-model="dform.RENT_LIMIT" type="number"><template slot="append">单</template></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <el-form-item :label="`${name}${$t('system.icon')}`" v-for="(name, code) in myDeviceId">
            <div class="flex align-center">
              <upload v-model="dform[`${code}_icon`]" ratio="1:1" />
              <div class="mb-30 pl-15 text-primary cursor"
                v-if="dform[`${code}_icon`] && Object.keys(myDeviceId).length > 1"
                @click="copyIcon(dform[`${code}_icon`], code)">{{ $t('system.oneClickSynchronization') }}</div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('system.displayStatus')">
            <el-switch v-model="dform.nearStore" :active-value="1" :inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('system.displayStatusText') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 4">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <h4>{{ $t('public.store') }}</h4>
          <el-form-item :label="$t('system.revenueDetails')">
            <el-switch v-model="dform.checkIncome" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item :label="$t('system.monthlyAndDailyStatistics')">
            <el-switch v-model="dform.checkMouthStat" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item :label="$t('system.simplify')">
            <el-switch v-model="dform.checkMouthStatSp" :active-value="1" :inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('system.simplifyText') }}</div>
          </el-form-item>
          <el-form-item :label="$t('system.checkOrder')">
            <el-radio-group v-model="dform.checkOrder">
              <el-radio-button :label="0">{{ $t('system.checkOrder1') }}</el-radio-button>
              <el-radio-button :label="1">{{ $t('system.checkOrder2') }}</el-radio-button>
              <el-radio-button :label="2">{{ $t('system.checkOrder3') }}</el-radio-button>
            </el-radio-group>
            <div class="mt-10 line-default fs-s3">{{ $t('system.checkOrderText') }}</div>
          </el-form-item>

          <h4>{{ $t('public.agent') }}</h4>
          <el-form-item :label="$t('system.monthlyAndDailyStatistics')">
            <el-switch v-model="dform.checkMouthStatAgent" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item :label="$t('system.simplify')">
            <el-switch v-model="dform.checkMouthStatSpAgent" :active-value="1" :inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('system.simplifyText') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 5">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <el-form-item :label="$t('system.showComplete')">
            <el-switch v-model="dform.closeTimeComplete" :active-value="1" :inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('system.showCompleteText') }} </div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 6">
        <el-form class="custom-form pl-20 pr-20" :model="dform">
          <el-form-item :label="$t('system.tiktokVal')">
            <el-input v-model="dform.tiktokDrains" type="textarea" rows="5"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 7">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <el-form-item :label="$t('steal.isItEnabled')">
            <el-switch v-model="dform.IS_CHECK_TWOPASSWORD" active-value="1" inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('system.setCheckTwoPwdText') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 8" >
        <el-form class="custom-form pl-20 pr-20" label-width="auto" :model="dform">
          <el-form-item :label="$t('steal.isItEnabled')">
            <el-switch v-model="dform.AUTO_REFUND_DEPOSIT" active-value="1" inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('public.refundOfDepositText1') }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.refundOfDepositText5')">
            <el-switch v-model="dform.TIME_LIMITED_RELIEF" active-value="1" inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('public.refundOfDepositText6') }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.refundOfDepositText7')">
            <el-switch v-model="dform.TIME_LIMITED_RELIEF_SHOW" active-value="1" inactive-value="0" />
            <div class="line-default fs-s3">{{ $t('public.refundOfDepositText8') }}</div>
          </el-form-item>

          <el-tabs v-model="activeName" type="card" >
            <el-tab-pane :label="$t('public.refundOfDepositText2')" name="voluntarily">
             <div class="cash">
              <el-form-item :label="$t('public.refundOfDepositText3')">
                <el-switch v-model="dform.AUTO_REFUND_DEPOSIT_VOLUNTARILY" active-value="1" inactive-value="0" />

              </el-form-item>
              <img src="@/assets/img1.png" class="imgs"
                v-if="dform.AUTO_REFUND_DEPOSIT_VOLUNTARILY == 0 || !dform.AUTO_REFUND_DEPOSIT_VOLUNTARILY" />
              <img src="@/assets/img2.png" class="imgs" v-if="dform.AUTO_REFUND_DEPOSIT_VOLUNTARILY == 1 " />
             </div>
            </el-tab-pane>
            <!-- <el-tab-pane :label="$t('public.refundOfDepositText4')" name="custom">
              <div class="cash">
                 <div v-for="(item,index) in payList" :key="index" class="mt-10 paybox">
                     <div class="text-center">
                      {{ item.name }}
                     </div>
                     <div class="flex_c mt-5 text-center">
                       <div class="text-center">
                        {{$t('system.taxPoints')}}:{{item.taxRate}}%
                       </div>
                       <div class="ml-10 text-center">
                        {{$t('system.singleStroke')}}:{{item.handlingFee}}
                       </div>
                     </div>
                 </div>
              </div>

            </el-tab-pane> -->
          </el-tabs>

        </el-form>
      </template>
      <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
        <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import upload from '@/components/upload'
export default {
  name: 'systemTools',
  components: {
    upload
  },
  data() {
    return {
      clickSubmit: false,
      vendorInfo: {}, // 售货机运营信息
      // 弹出相关
      dialogType: 1,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
      activeName: 'voluntarily',
      payList: [
        {
          day: 0,
          handlingFee: 0,
          name:"hoàn phí nhanh chóng",
          taxRate:0
        },
        {
          day: 0,
          handlingFee: 0,
          name:"3-7 ngày làm việc",
          taxRate:0
        },
        {
          day: 0,
          handlingFee: 0,
          name:"5-7 ngày làm việc",
          taxRate:0
        }
      ]
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
    },
    dialogTitle() {
      return {
        1: this.$t('system.userLoginPhone'),
        2: this.$t('system.frequencyLimit'),
        3: this.$t('system.setMap'),
        4: this.$t('system.setStore'),
        5: this.$t('steal.delayedOrder'),
        6: this.$t('system.tiktok'),
        7: this.$t('system.checkTwoPwd'),
        8: this.$t('public.refundOfDeposit')
      }
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

    /**
     * 操作数据
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '设置登录手机号权限'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          if ([1, 2, 3, 4, 5, 6, 7, 8].indexOf(dialogType) > -1) {
            this.$get('iot-saas-basic/admin/settings/find', {
              code: row.code
            }).then(res => {
              if (res && res.code) {
                this.dform = JSON.parse(res.setting)
                if(this.dialogType == 8){
                  this.activeName = this.dform.type
                 
                }
              } else {
                switch (dialogType) {
                  case 1:
                    this.dform = {
                      wx_phone: 0,
                      //ali_phone: 0
                    }
                    break
                  case 2:
                    this.dform = {
                      RENT_LIMIT: 3
                    }
                    break
                  case 3:
                    this.dform = {
                      nearStore: 1
                    }
                    break
                  case 4:
                    this.dform = {
                      checkIncome: 1,
                      checkMouthStat: 1,
                      checkMouthStatSp: 0,
                      checkOrder: 0,
                      checkMouthStatAgent: 1,
                      checkMouthStatSpAgent: 0,
                    }
                    break
                  case 5:
                    this.dform = {
                      closeTimeComplete: 0
                    }
                    break
                    case 8:
                    this.dform = {
                      AUTO_REFUND_DEPOSIT: 0,
                      TIME_LIMITED_RELIEF:0,
                      AUTO_REFUND_DEPOSIT_VOLUNTARILY:0,
                      TIME_LIMITED_RELIEF_SHOW:0,
                    }
                    console.log(this.dform,'this.dform')
                    break
                }
              }
            })
          } else {
            this.dform = {}
          }
          this.drawerStatus = true
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8:
          this.clickSubmit = false
          if (this.dialogType == 8) {
            params.type = this.activeName;
          }
          this.$post('iot-saas-basic/admin/settings/save', {
            code: curRow.code,
            setting: JSON.stringify(params)
          }).then(res => {
            this.$message({
              message: this.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },

    /**
     * 同步设备icon
     */
    copyIcon(url, code) {
      for (var i in this.myDeviceId) {
        if (i != code) {
          this.$set(this.dform, `${i}_icon`, url)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.role-item {
  padding: 15px;
  height: 165px;
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

}
.paybox{
 border:1px solid #ccc;
 padding:10px;
 border-radius: 6px;
}
.cash{
  min-width:450px;
}
</style>
