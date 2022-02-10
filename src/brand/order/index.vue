<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <!-- <template v-slot:tabs>
        <el-tabs class="pl-10 pr-10 mb-15 bg-white" v-model="listQuery.device_type" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'-1'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template> -->

      <template v-slot:defult>
        <el-input v-model="form.orderNo" placeholder="订单号" />
        <!-- <el-select
          v-model="form.userIds"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="手机号"
          :remote-method="searchUser"
          :loading="searchLoading">
          <el-option
            v-for="item in searchList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select> -->
        <el-input v-model="form.custom_mobile" placeholder="手机号" />
        <el-input v-model="form.custom_nick_name" placeholder="用户昵称" />
        <el-input v-model="form.store_name" placeholder="商户名称" />
        <el-input v-model="form.deviceIds" placeholder="设备SN" />
        <el-input v-model="form.transactionNo" placeholder="交易单号" />
        <el-select v-model="form.sourceType" placeholder="订单来源" @change="toQuery()">
          <el-option label="全部" value="" />
          <el-option label="微信" value="1" />
          <el-option label="支付宝" value="2" />
        </el-select>
        <el-select v-model="form.payType" placeholder="支付类型" @change="toQuery()">
          <el-option label="全部" value="" />
          <el-option label="微信" value="1" />
          <el-option label="支付宝" value="2" />
          <el-option label="微信免押" value="3" />
          <el-option label="支付宝免押" value="4" />
          <el-option label="余额" value="5" />
          <!-- <el-option label="充值卡" value="6" /> -->
        </el-select>
        <!-- <el-cascader v-model="cat_id" :options="categoryList" :show-all-levels="false"
          :props="{ expandTrigger: 'hover' }" placeholder="行业分类" />
        <el-cascader v-model="search_regions_tag" :options="areaList" :show-all-levels="false"
          :props="{ expandTrigger: 'hover', checkStrictly: true }" placeholder="所在地区"/> -->
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.selDay"
            type="daterange"
            range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd"
            @change="toQuery()">
          </el-date-picker>
      </template>
    </condition>

    <to-xlsx ref="toXlsx"></to-xlsx>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="flex mb-5">
        <div class="flex1 white-space">
          <el-scrollbar>
            <el-button size="medium" :type="listQuery.status == item.value ? 'primary' : ''" class="mr-10 mb-10 ml-0" :class="{'btn-body': listQuery.status != item.value}" v-for="item in orderTab" @click="listQuery.status = item.value; toQuery()">{{ item.title }}({{statInfo[item.nkey] || 0}})</el-button>
          </el-scrollbar>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading"
        @selection-change="selOrder">
        <el-table-column type="selection" v-if="checkRoles(['partner'])" :selectable="checkSel" width="50"/>
        <!-- <el-table-column label="品牌商" align="center">
          <template slot-scope="scope">
            {{ oemInfo[scope.row.agent_id] ? oemInfo[scope.row.agent_id].mini_name : '品牌名' }}
          </template>
        </el-table-column> -->
        <el-table-column label="订单号" width="140" align="center">
          <template slot-scope="scope">
            {{ scope.row.orderNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="交易单号" width="142" align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.transaction_id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90" align="center">
          <template slot-scope="scope">
            {{ scope.row.deviceType || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="来源" width="50" align="center">
          <template slot-scope="scope">
            <i class="fs-a1 iconfont icon-weixin1 text-green" v-if="scope.row.sourceType == 1"></i>
            <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="支付类型" width="100" align="center">
          <template slot-scope="scope">
            <div class="fs-s3">{{ payType[scope.row.payType] || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150" align="center">
          <template slot-scope="scope">
            <div>{{ dealPhone(scope.row.userMobile) }}</div>
            <div class="text-cut">{{ scope.row.user_nick_name || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户" min-width="180" align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.storeName || '--' }}</div>
            <!-- <div>{{ scope.row.back_store || '--' }}</div> -->
          </template>
        </el-table-column>
        <el-table-column label="时间" width="140" align="center">
          <template slot-scope="scope">
            <div class="text-green">{{ scope.row.chargeEndTime || "--" }}</div>
            <div class="text-danger">{{ scope.row.chargeStartTime || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="设备SN码" width="240" align="center">
          <template slot-scope="scope">
            <div>二维码：{{ scope.row.deviceQrcode || "--" }}</div>
            <div>设备SN：{{ scope.row.deviceSn || "--" }}</div>
            <div class="text-cut cursor text-blue" v-if="scope.row.depend_type == 0"
              @click="checkBao(scope.row.goods_sn)">宝SN码：{{ scope.row.goods_sn || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="150" align="center">
          <template slot-scope="scope">
            {{ showFeeMode(scope.row.feeType, scope.row.feeMode)}}
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" width="75" align="center">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.amount }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="退款(元)" width="75" align="center">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.amountRefund }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70" align="center">
          <template slot-scope="scope">
            <el-link :type="scope.row.status > 2 || scope.row.order_status == -1 ? 'danger' : 'success'">
              {{ orderStatus[scope.row.status] || "--" }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150" align="center">
          <template slot-scope="scope">
            <div class="remark-box">
              <div class="fs-s4 text-danger" v-if="scope.row.steal_type_des">{{ scope.row.steal_type_des }}</div>
              <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
              <div v-if="scope.row.delivery_status == 2" class="fs-s4">快递单号：{{ scope.row.delivery_sn }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="getDetail(scope.row)">订单详情</el-button>
            <el-button type="danger" size="mini" plain @click="setRows(1, scope.row, 1)" v-if="(scope.row.status == 1)">结束订单</el-button>
            <el-button type="info" size="mini" plain @click="setRows(1, scope.row, 2)" v-if="(scope.row.status >= 2 && scope.row.status <= 4)">订单退款</el-button>


            <!-- <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status == 1"
              @click="upApply(scope.row, 1)">通过申请</el-button>
            <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status == 1"
              @click="upApply(scope.row, 0)">驳回申请</el-button>
            <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status > 0"
              @click="refundInfo(scope.row)">退款详情</el-button>
            <template v-if="scope.row.refund_apply_status != 1">
              <el-button type="primary" size="mini" plain round
                v-if="agentInfo.drawback_order == 1 && scope.row.money_paid > 0 && (!scope.row.refund_drawbacked || scope.row.refund_drawbacked == 0) && listQuery.status != 6"
                @click="refundDialog = true; order = scope.row; refundObj.refund_money = ''; refundObj.refund_2_balance = siteInfo.drawbacke_2_balance;">订单退款</el-button>
              <el-button type="primary" size="mini" plain round v-if="checkRoles(['terminal']) && listQuery.status == 6 && scope.row.mini_type == 1 && scope.row.free_pay_status == 3"
                @click="cancelZFF(scope.row)">取消服务</el-button>
              <el-button type="danger" size="mini" plain round
                v-if="checkRoles(['partner']) && scope.row.delivery_status == 1" @click="deliver(scope.row)">立即发货
              </el-button>
            </template>
            <el-button type="primary" size="mini" plain round
              v-if="checkRoles(['partner', 'terminal']) && listQuery.status == 6"
              @click="deduct(scope.row)">立即扣款</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>

      <el-dialog title="订单详情" :visible.sync="detailDialog">
        <el-row class="text-center">
          <el-col :xs="12" :sm="12" :md="4" class="rel pb-50 mb-15 timeline-item el-icon-" v-for="(item, index) in orderFlow">
            <div class="abs" style="width: 100%;">
              <div>{{ item.event }}</div>
              <div class="mt-10 fs-s2 text-gray">{{ parseTime(item.createTime) }}</div>
            </div>
          </el-col>
        </el-row>

        <template>
          <el-table border stripe :data="orderDivide" :span-method="fenRunSpanMethod" class="custom">
            <el-table-column align="center" label="订单金额">
              <template slot-scope="scope">
                {{ amountPaid }}元
              </template>
            </el-table-column>
            <el-table-column align="center" width="190" label="分成人" >
              <template slot-scope="scope">
                {{ scope.row.dividerName }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="分成比例" >
              <template slot-scope="scope">
                {{ scope.row.percent }}%
              </template>
            </el-table-column>
            <el-table-column align="center" label="分成金额(元)" >
              <template slot-scope="scope">
                {{ scope.row.amount }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="退款金额(元)" >
              <template slot-scope="scope">
                {{ scope.row.refund }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-dialog>

      <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
        <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
        <template v-if="dialogType == 1">
          <el-form class="custom-form flex justify-center">
            <el-date-picker
                v-model="dform.chargeEndTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择结束时间">
              </el-date-picker>
          </el-form>
        </template>
        <template v-if="dialogType == 2">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="退回方式">
              <el-radio-group v-model="dform.refund_type">
                <el-radio :label="1">退回小程序钱包</el-radio>
                <el-radio :label="0">原路退回</el-radio>
                <el-radio :label="2" v-if="curRow.pay_type == 1 && curRow.pay_deposite_yuan == order.fund_deposite_yuan">押金一起退回</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="退款金额">
              <el-input v-model="dform.mobile" placeholder="最多6元">
                 <span slot="append">元</span>
              </el-input>
            </el-form-item>
            <el-form-item label="退款原因">
              <el-input v-model="dform.mobile" placeholder="非必填，若填写将展示在用户退款信息中"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 3">
          <div class="text-center">
            <div class="text-black">确定删除此商户吗？</div>
            <div class="mt-10 pl-40 pr-40 text-danger text-left">注：若该商户下存在设备，则无法删除。需由该设备的归属商户去回收，无法跨级回收。</div>
          </div>
        </template>
        <div class="mt-30 text-center">
          <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
        </div>
      </el-dialog>


      <el-dialog title="结束订单" :visible.sync="endOrderDialog">
        <el-form label-width="140px">
          <el-form-item :label="order.depend_type == 0 ? '归还时间：' : '结束时间：'" prop="name">
            <el-date-picker v-model="endOrderObj.return_time" type="datetime" value-format="timestamp"
              style="width: 100%;" :placeholder="order.depend_type == 0 ? '归还时间：' : '结束时间：'"
              :picker-options="endOptions" />
          </el-form-item>
          <el-form-item label="检测设备是否归还：" v-if="order.depend_type == 0">
            <el-switch v-model="endOrderObj.check_bao_backed" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="endOrderDialog = false">取 消</el-button>
          <el-button type="primary" @click="endOrder(2, order)" :disabled="clickSubmit">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="订单退款" :visible.sync="refundDialog">
        <el-form label-width="130px">
          <el-form-item label="退款方式：">
            <el-radio-group v-model="refundObj.refund_2_balance">
              <el-radio :label="1">退回小程序钱包</el-radio>
              <el-radio :label="0">原路退回</el-radio>
              <el-radio :label="2" v-if="order.pay_type == 1 && order.pay_deposite_yuan == order.fund_deposite_yuan">全部押金原路退回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="退款金额：" v-if="refundObj.refund_2_balance != 2">
            <el-input v-model="refundObj.refund_money">
              <template slot="append">元<span class="el-link el-link--danger">（最多{{ order.money_paid }}元）</span></template>
            </el-input>
          </el-form-item>
          <el-form-item label="退款原因：">
            <el-input v-model="refundObj.refund_reason" type="textarea" />
            <div class="fs-s2 text-gray">注：非必填信息，若填写将展示在下发给用户的退款消息中。</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="refundDialog = false">取 消</el-button>
          <el-button type="primary" @click="refundOrder(order)" :disabled="clickSubmit">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="退款详情" :visible.sync="washRefundDialog">
        <div class="mt-10 mb-15"><span class="text-gray">退款状态：</span>{{ refundStatus[washRefund.refund_status] }}</div>
        <div class="mt-10 mb-15" v-if="washRefund.refuse_reason"><span
            class="text-gray">拒绝原因：</span>{{ washRefund.refuse_reason }}</div>
        <div class="mt-10 mb-15"><span class="text-gray">手机号码：</span>{{ washRefund.mobile }}</div>
        <div class="mt-10 mb-15"><span class="text-gray">退款金额：</span>{{ washRefund.refund_money }}元</div>
        <div class="flex mt-10 mb-15">
          <div class="text-gray">问题描述：</div>
          <div class="flex1">{{ washRefund.refund_reason || '未填写' }}</div>
        </div>
        <div class="flex mt-10 mb-15">
          <div class="text-gray">错误截图：</div>
          <div class="flex1">
            <el-image class="mr-5" v-for="item in washRefund.refund_img_url" style="width: 50px; height: 50px"
              :src="item" :preview-src-list="washRefund.refund_img_url">
            </el-image>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import toXlsx from '@/components/xlsx/'
  import selPlat from '@/components/selPlat'
  import {
    swapItems,
    dealPhone
  } from '@/utils/index'

  export default {
    name: 'Order',
    components: {
      Pagination,
      condition,
      toXlsx,
      selPlat
    },
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    computed: {
      xlsxName: function() {
        let xlsxName = '订单记录';
        let b = '';
        let e = ''
        if (this.form.begin) {
          b = this.parseTime(this.form.begin / 1000, '{y}.{m}{d}')
        }
        if (this.form.end) {
          e = this.parseTime(this.form.end / 1000, '{y}.{m}{d}')
        }
        if (b && e) {
          xlsxName = b + '-' + e
        } else if (b || e) {
          xlsxName = b || e
        }
        return xlsxName
      },
      device() {
        return this.$store.state.app.device
      },
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      myDevice() {
        return this.$store.state.user.myDevice
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      }
    },
    data() {
      return {
        dealPhone: dealPhone,
        clickSubmit: false,
        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
            if (timeOptionRange) {
              return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange.getTime() - secondNum) || time.getTime() > Date.now()
            }
            return time.getTime() > Date.now()
          }, onPick: (time) => {
            //当第一时间选中才设置禁用
            if (time.minDate && !time.maxDate) {
              this.timeOptionRange = time.minDate
            }
            if (time.maxDate) {
              this.timeOptionRange = null
            }
          }
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
            }
          }
        },
        orderTab: [
          {
            value: '',
            title: '全部',
            nkey: 'all'
          },
          {
            value: 1,
            title: '使用中',
            nkey: 'renting'
          },
          {
            value: 'today',
            title: '今日订单',
            nkey: 'today'
          },
          {
            value: 2,
            title: '已完成',
            nkey: 'done'
          },
          {
            value: 4,
            title: '超时订单',
            nkey: 'expired'
          },
          {
            value: 5,
            title: '租借失败',
            nkey: 'rentFail'
          },
          {
            value: 6,
            title: '扣款失败',
            nkey: 'payFail'
          }
        ],

        cat_id: [],
        search_regions_tag: [],
        categoryList: [],
        areaList: [],

        tableMaxH: '250',
        listLoading: false,
        listTotal: 0,
        statInfo: {},
        list: [],
        listQuery: {
          status: '',
          page: 1,
          size: 20
        },
        form: {},
        orderStatus: {
          0: '待支付',
          1: '使用中',
          2: '已完成',
          3: '手动完结',
          4: '超时完成',
          5: '租借失败',
          6: '扣款失败',
          7: '申请退款',
          8: '拒绝退款',
          9: '已退款',
          10: '支付已关闭'
        },
        payType: {
          1: '微信',
          2: '支付宝',
          3: '微信免押',
          4: '支付宝免押',
          5: '余额',
          6: '充值卡'
        },

        order: {},
        selID: [],

        // 结束订单
        endOrderDialog: false,
        endOrderObj: {
          return_time: '',
          check_bao_backed: true
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
            }
          }
        },

        // 订单详情
        detailDialog: false,
        orderFlow: [],
        orderDivide: [],
        amountPaid: '',

        // 订单退款
        refundDialog: false,
        refundObj: {
          refund_2_balance: 1,
          refund_money: ''
        },

        // 退款详情
        washRefundDialog: false,
        washRefund: {},
        refundStatus: {
          1: '申请中',
          2: '已拒绝',
          3: '已通过',
          4: '已退款'
        },


        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '结束订单',
          2: '订单退款',
          3: '删除商户'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        searchLoading: false,
        searchList: [],
      }
    },
    mounted(options) {
      this.toQuery()
    },
    methods: {
      /**
       * 订单数量
       */
      getStatNum() {
        const params = Object.assign({}, this.listQuery, this.form)
        if(params.selDay && params.selDay.length > 0){
          params.chargeStartTime = params.selDay[0]
          params.chargeEndTime = params.selDay[1]
          delete params.selDay
        }
        this.$get('iot-saas-order/admin/order/summary', params).then(res => {
          this.statInfo = res
        })
      },

      /**
       * 校验是否可选
       */
      checkSel(row) {
        return row.delivery_status == 1
      },

      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getStatNum()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getStatNum()
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        if(params.selDay && params.selDay.length > 0){
          params.chargeStartTime = params.selDay[0]
          params.chargeEndTime = params.selDay[1]
          delete params.selDay
        }
        if(params.status == 'today'){
          params.today = true
          delete params.status
        }
        this.$get('iot-saas-order/admin/order/list', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          this.listTotal = res.total
          if(params.page == 0){
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 套餐显示
       */
      showFeeMode(type, mode){
        mode = JSON.parse(mode)
        if(type == 1){
          return `${mode.time}小时${mode.money}元`
        }
      },

      /**
       * 获取商户类别
       */
      getCategory() {
        this.$get('agentapi/store/store_cat_list').then(res => {
          for (var i in res) {
            const obj = {
              value: res[i].cat_id,
              label: res[i].cat_name,
              children: []
            }
            if (this.cat_id == obj.value) {
              if (res[i].son_cat_list.length > 0) {
                this.form.cat_id = [obj.value, res[i].son_cat_list[0].cat_id]
              } else {
                this.form.cat_id = [obj.value]
              }
            }
            if (res[i].son_cat_list.length > 0) {
              for (var s in res[i].son_cat_list) {
                const child = res[i].son_cat_list[s]
                if (this.cat_id == child.cat_id) this.form.cat_id = [obj.value, child.cat_id]
                obj.children.push({
                  value: child.cat_id,
                  label: child.cat_name
                })
              }
            } else {
              obj.children = undefined
            }
            this.categoryList.push(obj)
          }
        })
      },

      /**
       * 获取区域
       */
      getArea() {
        this.$get('commonapi/tool/get_address_list').then(res => {
          for (var i in res) {
            const firstLevel = res[i]
            const obj = {
              value: firstLevel.tag,
              label: firstLevel.title,
              children: []
            }
            if (firstLevel.son_list.length > 0) {
              const secondLevel = firstLevel.son_list
              for (var s in secondLevel) {
                const secondItem = secondLevel[s]
                obj.children.push({
                  value: secondItem.tag,
                  label: secondItem.title,
                  children: []
                })
                if (secondItem.son_list.length > 0) {
                  const thirdLevel = secondItem.son_list
                  for (var t in thirdLevel) {
                    const thirdItem = thirdLevel[t]
                    obj.children[s].children.push({
                      value: thirdItem.tag,
                      label: thirdItem.title
                    })
                  }
                } else {
                  obj.children = undefined
                }
              }
            } else {
              obj.children = undefined
            }
            this.areaList.push(obj)
          }
        })
      },

      /**
       * 手动结束订单
       */
      endOrder(type, row) {
        if (type == 1) {
          this.order = row
          this.endOrderObj.return_time = Date.parse(new Date())
          this.endOrderDialog = true
        } else {
          this.$alert('确定结束此订单吗？', '结束订单', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == 'confirm') {
                this.clickSubmit = true
                this.$get('agentapi/business/manual_finish_order', {
                  order_id: row.order_id,
                  bao_sn: row.goods_sn,
                  return_time: (this.endOrderObj.return_time / 1000),
                  check_bao_backed: (this.endOrderObj.check_bao_backed ? 1 : 0)
                }).then(res => {
                  this.endOrderDialog = false
                  this.order = {}
                  this.clickSubmit = false
                  this.$message({
                    message: '结束成功',
                    type: 'success'
                  })
                  row.order_status = 3
                }).catch(err => {
                  this.clickSubmit = false
                })
              }
            }
          })
        }
      },

      /**
       * 选择订单
       */
      selOrder(list) {
        let selID = []
        list.map(item => {
          selID.push(item.order_id)
        })
        this.selID = selID
      },

      /**
       * 发货
       */
      deliver(row) {
        let order_id = row ? [row.order_id] : this.selID
        if (order_id.length == 0) {
          this.$message({
            message: '请选择需要发货的订单',
            type: 'error'
          })
          return
        }
        this.$prompt('请输入快递单号', '设备发货', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在提交',
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/delivery_bao', {
                order_id: order_id,
                agree: 1,
                delivery_sn: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: '发货成功',
                  type: 'success'
                })
                this.toQuery()
              }).catch(err => {
                this.loadObj.close()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 缩水恢复
       */
      stealDel() {
        this.$prompt('请输入订单单号', '缩水恢复', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在提交',
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/show_hidding_order', {
                order_sn: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: '恢复成功',
                  type: 'success'
                })
                done()
              }).catch(err => {
                this.loadObj.close()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 订单退款
       */
      refundOrder(row) {
        this.$alert('确认给该笔订单退款吗？', '订单退款', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.clickSubmit = true
              this.$post('agentapi/business/drawback_paid_order', {
                order_id: row.order_id,
                refund_money: this.refundObj.refund_money,
                refund_2_balance: this.refundObj.refund_2_balance,
                refund_reason: this.refundObj.refund_reason
              }).then(res => {
                this.refundDialog = false
                this.clickSubmit = false
                this.$message({
                  message: '退款成功',
                  type: 'success'
                })
                row.refund_drawbacked = this.refundObj.refund_money
              }).catch(err => {
                this.clickSubmit = false
              })
            }
          }
        })
      },

      /**
       * 查询订单详情
       */
      getDetail(row) {
        this.$get('iot-saas-order/admin/order/detail/flow', {
          orderId: row.id
        }).then(res => {
          this.orderFlow = res
          this.detailDialog = true
          if(row.status > 0){
            this.$get('iot-saas-order/admin/order/detail/divide', {
              orderId: row.id
            }).then(res => {
              this.orderDivide = res.divideVOList
              this.amountPaid = res.amountPaid
            })
          }
        })
      },

      /**
       * 查询宝的最新信息
       */
      checkBao(bao_sn) {
        this.$get('commonapi/check/bao_status', {
          bao_sn: bao_sn
        }).then(res => {
          this.baoDialog = true
          this.baoList = [res]
        })
      },

      /**
       * 退款详情
       */
      refundInfo(row) {
        this.$get('wxapi/order/order_refund_appy_detail', {
          order_id: row.order_id
        }).then(res => {
          this.washRefundDialog = true
          this.washRefund = res[0]
        })
      },

      /**
       * 审核提现
       * @param {Object} row
       */
      upApply(row, agree) {
        if (agree == 1) {
          this.$alert('确定通过吗？', '通过退款申请', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == 'confirm') {
                if (this.clickSubmit) return
                this.clickSubmit = true
                this.postApply(row, agree)
              }
            }
          })
        } else if (agree == 0) {
          this.$prompt('', '驳回退款申请', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: '',
            inputPlaceholder: '驳回原因'
          }).then(({
            value
          }) => {
            if (this.clickSubmit) return
            this.clickSubmit = true
            this.postApply(row, agree, value)
          })
        }
      },

      /**
       * 提交选择结果
       * @param {Object} id
       * @param {Object} agree
       */
      postApply(row, agree, refund_reason) {
        this.$post('agentapi/order/audit_refund_appy', {
          order_id: row.order_id,
          agree: agree,
          refuse_reason: refund_reason
        }).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          if(row.depend_type == 4) row.order_status = (agree == 0 ? 1 : 3)
          row.refund_apply_status = (agree == 0 ? 2 : 3)
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      },

      /**
       * 微信支付分取消
       */
      cancelZFF(row){
        this.$alert('确定取消用户的支付分订单吗？', '取消服务订单', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.clickSubmit = true
              this.$get('wxapi/cancelZff', {
                out_order_no: row.out_order_no,
                appid: row.appid,
                agent_id: row.agent_id
              }).then(res => {
                this.$message({
                  message: res.msg,
                  type: 'success'
                })
              })
            }
          }
        })
      },

      /**
       * 订单扣款
       */
      deduct(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/order/press_paying_fund_order', {
          order_id: row.order_id
        }).then(res => {
          this.loadObj.close()
          this.$message({
            message: res.msg,
            type: 'success'
          })
        }).catch(err => {
          this.loadObj.close()
        })
      },

      /**
       * 订单详情分润合并单元格
       */
      fenRunSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          if (rowIndex % 4 === 0) {
            return {
              rowspan: 4,
              colspan: 1
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0
            }
          }
        }
      },


      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '结束订单'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            if(dialogType == 1){
              this.$set(this.dform, 'chargeEndTime', this.parseTime(this.currentTime()))
            }else if(dialogType == 2){
              this.$set(this.dform, 'refund_type', 1)
            }
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfim() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1:
            if(!params.chargeEndTime){
              this.$message({
                message: '请选择订单结束时间',
                type: 'error'
              })
              return
            }
            console.log(params)
            this.$post('iot-saas-order/admin/order/complete', {
              orderId: this.curRow.id,
              chargeEndTime: params.chargeEndTime
            }).then(res => {
              this.$message({
                message: '结束订单成功',
                type: 'success'
              })
              curRow.status = 2
              this.dialogStatus = false
            })
            break
        }
      },

      searchUser(query) {
        console.log(query)
        if (query !== '') {
          this.loading = true
          this.$post('iot-saas-order/admin/order/list', {
            page: 0,
            size: 10,
            orderId: this.curRow.id,
            chargeEndTime: params.chargeEndTime
          }).then(res => {
            this.$message({
              message: '结束订单成功',
              type: 'success'
            })
            curRow.status = 2
          })

          setTimeout(() => {
            this.loading = false
            // this.options = this.list.filter(item => {
            //   return item.label.toLowerCase()
            //     .indexOf(query.toLowerCase()) > -1;
            // })
          }, 200)
        } else {
          this.options = []
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }

  .scan-code_btn {
    padding: 4px 4px 0 0;
    border-bottom: 1px solid #E4E7ED;
  }

  .remark-box {
    max-height: 80px;
  }

  .timeline-item{
    height: 100px;
    &::after,&::before{
      content: '';
      position: absolute;
    }
    &::before{
      width: 60px;
      height: 14px;
      top: 45px;
      margin-left: -30px;
      content: "";
      background-color: var(--white);
      color: var(--olive);
      z-index: 99;
    }
    &::after{
      top: 51px;
      margin-left: 20px;
      width: 100%;
      height: 1px;
      background: var(--olive);
    }
    &:nth-child(2n){
      padding-top: 70px;
    }

    &.err{
      &::before{
        content: "";
        color: "#FF5353";
      }
    }
    @media only screen and (max-width: 991px) {
      &:last-child, &:nth-child(2n){
        &::after{
          width: 0;
        }
      }
    }
    @media only screen and (min-width: 992px) {
      &:last-child, &:nth-child(6n){
        &::after{
          width: 0;
        }
      }
    }
  }
</style>
