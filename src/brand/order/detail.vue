<template>
  <div class="p-10">
    <div class="pl-20 pr-20 pb-20 bg-white">
      <el-row class="fs-s4">
        <el-col :xs="{span: 24}" :sm="{span: 12}">
          <h4 class="mb-10">订单状态（{{ info.order_status_des }}）</h4>
          <div>{{ info.remark }}</div>

          <h4 class="mb-10">订单信息</h4>
          <div class="mb-10">订单号：{{info.order_sn}}</div>
          <div class="mb-10">用户昵称：{{info.user_nick_name}}</div>
          <div class="mb-10">用户ID：{{ info.uid }}</div>
          <div class="mb-10">手机号码：{{ info.user_mobile }}</div>
          <template v-if="info.depend_type == 0">
            <div class="mb-10">租借时间：{{info.charge_start}}</div>
            <div class="mb-10">租借商户：{{ info.rent_address || '--' }}</div>
            <div class="mb-10">归还时间：{{ info.charge_end || '--' }}</div>
            <div class="mb-10">归还商户：{{ info.back_address || '--' }}</div>
            <div class="mb-10">设备SN码：{{ info.goods_sn }}</div>
            <div class="mb-10">押金类型：{{ info.pay_type == 2 ? '免押' : '押金' }}</div>
            <div class="mb-10">押金状态：{{ info.deposit_status }}</div>
            <div class="mb-10" v-if="info.out_order_no">免押单号：{{ info.out_order_no }}</div>
            <div class="mb-10" v-if="info.transaction_id">交易单号：{{ info.transaction_id }}</div>
          </template>
          <template v-else>
            <div class="mb-10">开始时间：{{info.charge_start}}</div>
            <div class="mb-10">结束时间：{{ info.charge_end || '--' }}</div>
            <div class="mb-10">设备SN码：{{ info.goods_sn }}</div>
            <div class="mb-10">套餐类型：{{ xiyiji_fee_plan.name }}</div>
            <div class="mb-10">支付方式：{{ info.deposit_status }}</div>
          </template>
          <div class="flex align-center">
            <div class="flex1">实付金额：￥{{ info.money_paid }}</div>
            <el-button type="primary" plain size="small" @click="detailDialog = true">流转记录</el-button>
          </div>
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 12}">
          <template v-if="washRefund.refund_status > 0">
            <h4 class="mb-10">退款详情</h4>
            <div class="mb-10">退款状态：{{ refundStatus[washRefund.refund_status] }}</div>
            <div class="mb-10" v-if="washRefund.refuse_reason">拒绝原因：{{ info.refuse_reason }}</div>
            <div class="mb-10">退款金额：{{ washRefund.refund_money }}元</div>
            <div class="mb-10">手机号码：{{ washRefund.mobile }}</div>
            <div class="mb-10">问题描述：{{ washRefund.refund_reason }}</div>
            <div class="flex">
              <div>错误截图：</div>
              <div class="flex1">
                <el-image class="mr-5" v-for="item in washRefund.refund_img_url" style="width: 50px; height: 50px" :src="item"
                  :preview-src-list="washRefund.refund_img_url">
                </el-image>
              </div>
            </div>
          </template>
          <template v-if="info.agents_profit.length != 0">
            <h4 class="mb-10">分成明细（{{ info.money_paid }})</h4>
            <div class="mb-10 flex" v-for="item in info.agents_profit">
              <div class="flex1">{{ item.agent_name }}：{{ item.parent_name }}</div>
              <div class="flex1">{{ item.get_profit }}元（{{ item.profit_percent }}）</div>
            </div>
          </template>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="流转记录" :visible.sync="detailDialog">
      <el-timeline>
        <el-timeline-item v-for="(item, index) in flow" :key="index" placement="top" :timestamp="item.date">
          <div>{{ item.event }} ---> {{ item.result }}</div>
          <div v-if="item.reason" class="mt-5">
            <el-link type="danger">{{ item.reason }}</el-link>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'orderDetail',
    components: {

    },
    data() {
      return {
        detailDialog: false,
        flow: [],
        info: {
          agents_profit: []
        },
        xiyiji_fee_plan: {},
        washRefund: {},
        refundStatus: { 1: '申请中', 2: '已拒绝', 3: '已通过', 4: '已退款' }
      }
    },
    mounted(options) {
      this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('wxapi/order_detail', {
          order_id: this.$route.query.order_id
        }).then(res => {
          this.flow = res.operate_flow
          this.info = res.order_info
          this.xiyiji_fee_plan = res.xiyiji_fee_plan
          this.refundInfo(res.order_info.order_id)
        })
      },

      /**
       * 退款详情
       */
      refundInfo() {
        this.$get('wxapi/order/order_refund_appy_detail', {
          order_id: this.$route.query.order_id
        }).then(res => {
          this.washRefund = res[0] || {}
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
