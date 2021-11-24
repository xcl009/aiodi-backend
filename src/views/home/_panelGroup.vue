<template>
  <el-row :gutter="device === 'mobile' ? 10 : 20" class="pl-20 pt-20 pr-20 panel-group bg-white">
    <el-col :xs="12" :sm="12" :lg="agentInfo.business_type == 1 ? 6 : 5" class="card-panel-col" v-if="agentInfo.business_type != 1">
      <div class="radius-10 o-v card-panel cursor text-white" @click="$router.push({path: `/home/dayMoney`})">
        <div class="p-15 flex align-end">
          <div class="flex1 flex line-1 align-start fs-s3">
            <span class="mt-10">日</span>
            <i class="iconfont icon-xiajiang"></i>
            <div class="p-5 today-num">{{ totalData.today_order_amount }}</div>
          </div>
          <div class="text-right">
            <div class="flex justify-end fs-b2 f-w">
              ￥<count-to :start-val="0" :end-val="delComma(totalData.total_order_amount)" :duration="2600" :decimals="2"/>
            </div>
            <div class="mt-5 card-panel-text fs-s3">总交易额</div>
          </div>
        </div>
        <div class="to-view flex align-center fs-s3">
          <div class="flex1">
            查看更多
          </div>
          <i class="iconfont icon-you"></i>
        </div>
      </div>
      <div class="mt-5 fs-s2 text-gray">所有订单的总交易额</div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="agentInfo.business_type == 1 ? 6 : 5" class="card-panel-col">
      <div class="radius-10 o-v card-panel cursor text-white" @click="$router.push({path: agentInfo.check_order == 1 && agentInfo.virtual_divide == 0 ? `${checkRoles(['terminal']) ? '/order/subOrder': '/order/meOrder'}` : ''})">
        <div class="p-15 flex align-end">
          <div class="flex1 flex line-1 align-start fs-s3">
            <span class="mt-10">日</span>
            <i class="iconfont icon-xiajiang"></i>
            <div class="p-5 today-num">{{ totalData.today_order_num }}</div>
          </div>
          <div class="text-right">
            <div class="fs-b2 f-w">
              <count-to :start-val="0" :end-val="totalData.total_order_num || 0" :duration="2600"/>
            </div>
            <div class="mt-5 card-panel-text fs-s3">总订单数</div>
          </div>
        </div>
        <div class="to-view flex align-center fs-s3">
          <div class="flex1">
            查看更多
          </div>
          <i class="iconfont icon-you"></i>
        </div>
      </div>
      <div class="mt-5 fs-s2 text-gray">我的和下级总订单数量</div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="agentInfo.business_type == 1 ? 6 : 5" class="card-panel-col">
      <div class="radius-10 o-v card-panel cursor text-white" @click="$router.push({path: `${checkRoles(['terminal']) ? '/equipment/subEquipment': '/equipment/index'}`})">
        <div class="p-15 flex align-end">
          <div class="flex1 flex line-1 align-start fs-s3">
            <span class="mt-10">日</span>
            <i class="iconfont icon-xiajiang"></i>
            <div class="p-5 today-num">{{ totalData.today_zuos }}</div>
          </div>
          <div class="text-right">
            <div class="fs-b2 f-w">
              <count-to :start-val="0" :end-val="totalData.total_zuos || 0" :duration="2600"/>
            </div>
            <div class="mt-5 card-panel-text fs-s3">总设备数</div>
          </div>
        </div>
        <div class="to-view flex align-center fs-s3">
          <div class="flex1">
            查看更多
          </div>
          <i class="iconfont icon-you"></i>
        </div>
      </div>
      <div class="mt-5 fs-s2 text-gray">我的总设备数量</div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="agentInfo.business_type == 1 ? 6 : 5" class="card-panel-col">
      <div class="radius-10 o-v card-panel cursor text-white" @click="$router.push({path: `/userManage/userList`})">
        <div class="p-15 flex align-end">
          <div class="flex1 flex line-1 align-start fs-s3">
            <span class="mt-10">日</span>
            <i class="iconfont icon-xiajiang"></i>
            <div class="p-5 today-num">{{ totalData.today_order_user_num }}</div>
          </div>
          <div class="text-right">
            <div class="fs-b2 f-w">
              <count-to :start-val="0" :end-val="totalData.total_order_user_num || 0" :duration="2600"/>
            </div>
            <div class="mt-5 card-panel-text fs-s3">总用户数</div>
          </div>
        </div>
        <div class="to-view flex align-center fs-s3">
          <div class="flex1">
            查看更多
          </div>
          <i class="iconfont icon-you"></i>
        </div>
      </div>
      <div class="mt-5 fs-s2 text-gray">我设备租借的用户数量</div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="agentInfo.business_type == 1 ? 6 : 5" class="card-panel-col">
      <div class="radius-10 o-v card-panel cursor text-white" @click="toWithdraw()">
        <div class="p-15 flex align-end">
          <div class="flex1 flex line-1 align-start fs-s3">
            <span class="mt-10">日</span>
            <i class="iconfont icon-xiajiang"></i>
            <div class="p-5 today-num">{{ totalData.today_profit }}</div>
          </div>
          <div class="text-right">
            <div class="flex justify-end fs-b2 f-w">
              ￥<count-to :start-val="0" :end-val="delComma(totalData.available_withdraw_money)" :duration="2600" :decimals="2"/>
            </div>
            <div class="mt-5 card-panel-text fs-s3">可提现金额</div>
          </div>
        </div>
        <div class="to-view flex align-center fs-s3">
          <div class="flex1">
            <span v-if="checkRoles(['terminal', 'partner']) || agentInfo.withdraw_right == 0">无需提现</span>
            <span v-else>去提现</span>
          </div>
          <i class="iconfont icon-you"></i>
        </div>
      </div>
      <div class="mt-5 fs-s2 text-gray">我可以提现的金额</div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { delComma } from '@/utils/index'

export default {
  components: {
    CountTo
  },
  props: {
    totalData: {
      type: Object,
      default: {

      }
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    agentInfo(){
      return this.$store.state.user.agentInfo
    },
  },
  data(){
    return {
      delComma: delComma
    }
  },
  mounted(){

  },
  methods: {
    toWithdraw() {
      if(this.agentInfo.withdraw_right == 1 && !this.checkRoles(['terminal', 'partner'])){
        this.$router.push({path: `/withdraw/withdraw`})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  .card-panel-col {
    margin-bottom: 20px;
    border-radius: 4px;

    &:first-child{
      .card-panel {
        background-color: rgba(50, 195, 210, 1);
      }
    }
    &:nth-child(2){
      .card-panel {
        background-color: rgba(80, 150, 195, 1);
      }
    }
    &:nth-child(3){
      .card-panel {
        background-color: rgba(240, 160, 165, 1);
      }
    }
    &:nth-child(4){
      .card-panel {
        background-color: rgba(140, 70, 170, 1);
      }
    }
    &:nth-child(5){
      .card-panel {
        background-color: rgba(50, 150, 220, 1);
      }
    }
  }

  .card-panel {
    // font-size: 12px;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    }

    .icon-xiajiang{
      margin: 0 -2px 0 -4px;
      font-size: 32px;
    }

    .today-num{
      padding: 3px;
      border-radius: 2px;
      background-color: rgba(255, 255, 255, .35);
    }

    .to-view{
      padding: 10px 15px;
      background-color: rgba(0, 0, 0, .08);
    }

    .card-panel-icon-wrapper {
      flex: 1;
      padding: 15px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      font-size: 48px;
    }

    .card-panel-description {
      font-weight: bold;
      margin: 20px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
    }
  }
}

// @media (max-width:550px) {
//   .card-panel-description {
//     display: none;
//   }

//   .card-panel-icon-wrapper {
//     float: none !important;
//     width: 100%;
//     height: 100%;
//     margin: 0 !important;

//     .svg-icon {
//       display: block;
//       margin: 14px auto !important;
//       float: none !important;
//     }
//   }
// }
</style>
