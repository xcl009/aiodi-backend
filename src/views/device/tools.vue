<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :xl="5" class="pb-20 cursor">
          <div class="role-item flexv justify-between" v-if="vendorInfo.operationMode == 'SELF_RUN' && myDeviceId['VM']">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20">
                <div class="flex1 fs-b1">商品管理</div>
                <div class="mt-5 fs-s3 text-gray">管理售货机出售的商品，管理不同仓口设备售货模板</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/relatedTemplate`})">仓口模板</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/addGoods`})">添加商品</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/goodsOrder`})">商品订单</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods`})">商品列表</el-button>
            </div>
          </div>
          <div v-else>暂无可用相关功能</div>
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
        vendorInfo: {
          operationMode: 'SELF_RUN',
          rebateRatio: 100
        }, // 售货机运营信息
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      }
    },
    mounted() {
      if(!this.isBrand() && this.myDeviceId['VM']){
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
