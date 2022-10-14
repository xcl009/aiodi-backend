<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="myDeviceId['VM'] && vendorInfo.operationMode == 'SELF_RUN'">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">商品管理</div>
                <div class="mt-5 fs-s3 text-gray">管理售货机出售的商品，管理不同仓口设备售货模板</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/relatedTemplate`})">仓口模板</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/addGoods`})">添加商品</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods`})">商品列表</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/goodsOrder`})">查看订单</el-button>
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
                <div class="fs-b1">售货机订单管理</div>
                <div class="mt-5 fs-s3 text-gray">查看售货机的商品订单</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/goodsOrder`})">查看订单</el-button>
            </div>
          </div>
        </el-col>

        <template v-for="item in ['BD', 'VG', 'AV']">
          <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="myDeviceId['BD'] && isBrand() && checkAbility([item], 2)">
            <div class="role-item flexv justify-between">
              <div class="flex align-center">
                <div class="icon-box flex align-center justify-center">
                  <svg-icon icon-class="mall"></svg-icon>
                </div>
                <div class="pl-20 flex1">
                  <div class="fs-b1">{{ myDeviceId[item] }}</div>
                  <div class="mt-5 fs-s3 text-gray">{{ myDeviceId[item] }}设备铺货赠送规则、商户创建订单订单等设置</div>
                </div>
              </div>
              <div class="text-right">
                <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/bedSetting?deviceTypeCode=${item}`})">默认设置</el-button>
              </div>
            </div>
          </el-col>
        </template>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">概率押金</div>
                <div class="mt-5 fs-s3 text-gray">设置用户租借不能免押，需缴纳押金租借的概率</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/steal/depositCash`})">设置概率</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/steal/depositCashUser`})">概率押金名单</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_DEPOSIT_DELAY', '_DEPOSIT_MP'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">押金退款规则</div>
                <div class="mt-5 fs-s3 text-gray">设置用户缴纳的押金退款方式、模式</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/depositRefund`})">默认设置</el-button>
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
                <div class="fs-b1">免费名额规则</div>
                <div class="mt-5 fs-s3 text-gray">设置添加免费名额默认免费时长、次数</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/freeQuotaConfig`})">默认设置</el-button>
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
                <div class="fs-b1">默认计费规则</div>
                <div class="mt-5 fs-s3 text-gray">设置添加商户时各设备的默认计费信息</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/billing`})">默认设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">超时订单成本设置</div>
                <div class="mt-5 fs-s3 text-gray">设置超时订单设备成本及分润规则</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/orderOt`})">默认设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="24" class="pb-20 cursor">
          <div>更多功能开发中，请持续关注</div>
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
      if(this.isBrand()){
        this.vendorInfo = {
          operationMode: 'SELF_RUN',
          rebateRatio: 100
        }
      }else if(this.myDeviceId['VM']){
        this.getVendorInfo()
      }
    },
    methods: {
      /**
       * 我的运营模式详情
       */
      getVendorInfo(){
        this.$get('iot-saas-device/admin/vendor/setting', {
          companyId: this.isAgent() ? this.agentInfo.agentId : this.agentInfo.storeIds[0]
        }).then(res => {
          this.vendorInfo = res || {}
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .role-item {
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
    .bg-body{
      padding: 10px 15px;
    }
  }
</style>
