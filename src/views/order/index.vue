<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :exportStatus="true" @reset="reset" @query="toQuery" @savexlsx="saveXlsx">
      <template v-slot:tabs>
        <el-tabs class="pl-10 pr-10 mb-15 bg-white" v-model="listQuery.device_type" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'-1'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>

      <template v-slot:defult>
        <el-input v-model="form.order_sn" placeholder="订单号" />
        <el-input v-model="form.custom_mobile" placeholder="手机号" />
        <el-input v-model="form.custom_nick_name" placeholder="用户昵称" />
        <el-input v-model="form.store_name" placeholder="商户名称" />
        <el-input v-model="form.goods_sn" placeholder="设备SN" />
        <el-input v-model="form.transaction_id" placeholder="交易单号" />
        <el-input v-model="form.out_order_no" placeholder="商户单号" />
        <el-select v-model="form.mini_type" placeholder="订单来源" @change="toQuery()">
          <el-option label="全部" value="0" />
          <el-option label="微信" value="1" />
          <el-option label="支付宝" value="2" />
        </el-select>
        <el-select v-model="form.pay_type" placeholder="支付类型" @change="toQuery()">
          <el-option label="全部" value="0" />
          <el-option label="押金" value="1" />
          <el-option label="免押" value="2" />
          <el-option label="余额" value="3" />
          <el-option label="储值卡" value="4" />
          <el-option label="会员卡" value="5" />
        </el-select>
        <el-cascader v-model="cat_id" :options="categoryList" :show-all-levels="false"
          :props="{ expandTrigger: 'hover' }" placeholder="行业分类" />
        <el-cascader v-model="search_regions_tag" :options="areaList" :show-all-levels="false"
          :props="{ expandTrigger: 'hover', checkStrictly: true }" placeholder="所在地区"/>
        <el-date-picker
          style="width: 300px; padding: 0 10px;"
          class="range-day flex align-center"
            v-model="form.day"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
      </template>
    </condition>

    <to-xlsx ref="toXlsx"></to-xlsx>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="flex mb-5">
        <div class="flex1 white-space">
          <el-scrollbar>
            <el-button size="medium" :type="listQuery.order_type == item.value ? 'primary' : ''" class="mr-10 mb-10 ml-0" :class="{'btn-body': listQuery.order_type != item.value}" v-for="item in order_type" @click="toQuery(item.value)">{{ item.title }}({{numInfo[item.nkey] || 0}})</el-button>
          </el-scrollbar>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading"
        @selection-change="selOrder">
        <el-table-column type="selection" v-if="checkRoles(['partner']) && !xlsxStatus" :selectable="checkSel" width="50"/>
        <el-table-column label="品牌商" align="center">
          <template slot-scope="scope">
            {{ oemInfo[scope.row.agent_id] ? oemInfo[scope.row.agent_id].mini_name : '品牌名' }}
          </template>
        </el-table-column>
        <el-table-column label="小程序ID" v-if="xlsxStatus" align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.appid }}</div>
          </template>
        </el-table-column>
        <el-table-column label="订单号" width="140" align="center">
          <template slot-scope="scope">
            {{ scope.row.order_sn || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="交易单号" width="142" align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.transaction_id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户单号" width="142" align="center">
          <template slot-scope="scope">
            {{ scope.row.out_order_no || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90" align="center">
          <template slot-scope="scope">
            {{ scope.row.goods_name || '密码线' }}
          </template>
        </el-table-column>
        <el-table-column label="来源" width="50" align="center">
          <template slot-scope="scope">
            <i class="fs-a1 iconfont icon-weixin1 text-green" v-if="scope.row.mini_type == 1"></i>
            <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="支付类型" width="100" align="center">
          <template slot-scope="scope">
            <div class="fs-s3">{{ scope.row.deposit_status || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150" align="center">
          <template slot-scope="scope">
            <div>{{ dealPhone(scope.row.user_mobile) }}</div>
            <div class="text-cut">{{ scope.row.user_nick_name || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户" min-width="180" align="center">
          <template slot-scope="scope">
            <div>{{ scope.row.rent_store || '--' }}</div>
            <div>{{ scope.row.back_store || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="140" align="center">
          <template slot-scope="scope">
            <div class="text-green">{{ scope.row.charge_start || "1970-01-01 00:00:00" }}</div>
            <div class="text-danger">{{ scope.row.charge_end || "1970-01-01 00:00:00" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="设备SN码" width="220" align="center">
          <template slot-scope="scope">
            <div>二维码：{{ scope.row.zuo_sn || "--" }}</div>
            <div>设备SN：{{ scope.row.device_id || "--" }}</div>
            <div class="text-cut cursor text-blue" v-if="scope.row.depend_type == 0"
              @click="checkBao(scope.row.goods_sn)">宝SN码：{{ scope.row.goods_sn || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="150" align="center">
          <template slot-scope="scope">
            {{ scope.row.rent_desc || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" width="75" align="center">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.money_paid || "--" }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="退款(元)" width="75" align="center">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.refund_drawbacked }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70" align="center">
          <template slot-scope="scope">
            <el-link :type="scope.row.order_status > 2 || scope.row.order_status == -1 ? 'danger' : 'success'">
              {{ orderStatus[scope.row.order_status] || "--" }}
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
        <el-table-column label="操作" align="center" width="100" :fixed="device == 'desktop' ? 'right' : false" v-if="!xlsxStatus">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="detailDialog = true">订单详情</el-button>
            <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status == 1"
              @click="upApply(scope.row, 1)">通过申请</el-button>
            <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status == 1"
              @click="upApply(scope.row, 0)">驳回申请</el-button>
            <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status > 0"
              @click="refundInfo(scope.row)">退款详情</el-button>
            <template v-if="scope.row.refund_apply_status != 1">
              <el-button type="primary" size="mini" plain round
                v-if="agentInfo.drawback_order == 1 && scope.row.money_paid > 0 && (!scope.row.refund_drawbacked || scope.row.refund_drawbacked == 0) && listQuery.order_type != 7"
                @click="refundDialog = true; order = scope.row; refundObj.refund_money = ''; refundObj.refund_2_balance = siteInfo.drawbacke_2_balance;">订单退款</el-button>
              <el-button type="primary" size="mini" plain round v-if="checkRoles(['terminal']) && listQuery.order_type == 7 && scope.row.mini_type == 1 && scope.row.free_pay_status == 3"
                @click="cancelZFF(scope.row)">取消服务</el-button>
              <el-button type="primary" size="mini" plain round
                v-if="(scope.row.order_status == 1 || scope.row.order_status == 0) && agentInfo.finish_order == 1"
                @click="endOrder(1, scope.row)">结束订单</el-button>
              <el-button type="danger" size="mini" plain round
                v-if="checkRoles(['partner']) && scope.row.delivery_status == 1" @click="deliver(scope.row)">立即发货
              </el-button>
            </template>
            <el-button type="primary" size="mini" plain round
              v-if="checkRoles(['partner', 'terminal']) && listQuery.order_type == 7"
              @click="deduct(scope.row)">立即扣款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center" v-if="!xlsxStatus">
        <pagination
          v-show="listQuery.pageSize > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          @pagination="getList"
        />
      </div>

      <el-dialog title="订单详情" :visible.sync="detailDialog">
        <el-row class="text-center">
          <el-col :xs="12" :sm="12" :md="4" class="rel pb-50 mb-15 timeline-item el-icon-" v-for="(item, index) in 10">
            <div class="abs" style="width: 100%;">
              <div>{{ index == 5 ? '用户主动完结订单' : '用户创建订单' }}</div>
              <div class="mt-10 fs-s2 text-gray">2021-08-08 08:08:08</div>
            </div>
          </el-col>
        </el-row>

        <template>
          <el-table border stripe :data="[{name:'总后台', f: '50', m: '5'},{name:'代理商', f: '30', m: '3'},{name:'商户', f: '20', m: '2'}]" :span-method="fenRunSpanMethod" class="custom">
            <el-table-column align="center" label="订单金额">
              <template slot-scope="scope">
                10元
              </template>
            </el-table-column>
            <el-table-column align="center" width="190" label="分成人" >
              <template slot-scope="scope">
                {{ scope.row.name }}：美羊羊
              </template>
            </el-table-column>
            <el-table-column align="center" label="分成比例" >
              <template slot-scope="scope">
                {{ scope.row.f }}%
              </template>
            </el-table-column>
            <el-table-column align="center" label="分成金额(元)" >
              <template slot-scope="scope">
                {{ scope.row.m }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="退款金额(元)" >
              <template slot-scope="scope">
                0
              </template>
            </el-table-column>
          </el-table>
        </template>
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

      <el-dialog title="宝详情" :visible.sync="baoDialog" top="36vh" width="600px">
        <el-table :data="baoList">
          <el-table-column label="SN">
            <template slot-scope="scope">
              <div>底座：{{ scope.row.device_id }}</div>
              <div>宝：{{ scope.row.B1 }}</div>
            </template>
          </el-table-column>
          <el-table-column label="基本信息">
            <template slot-scope="scope">
              <div>槽口：{{ scope.row.B2 }}</div>
              <div>电量：{{ scope.row.B3 }}%</div>
              <div>电线：{{ scope.row.B4 == 0 ? '正常' : '故障'}}</div>
              <div>电池：{{ scope.row.B5 == 0 ? '正常' : '故障'}}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-link type="danger">{{ baoStatus[scope.row.status] }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="弹出次数" width="80">
            <template slot-scope="scope">
              {{ scope.row.used_num }}
            </template>
          </el-table-column>
          <el-table-column label="最新时间" width="100">
            <template slot-scope="scope">
              {{ parseTime(scope.row.updated, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
        </el-table>
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
        clickSubmit: false,
        order_type: [
          {
            value: 0,
            title: '全部',
            nkey: ''
          },
          {
            value: 1,
            title: '使用中',
            nkey: ''
          },
          {
            value: 2,
            title: '今日订单',
            nkey: ''
          },
          {
            value: 3,
            title: '已完成',
            nkey: ''
          },
          {
            value: 4,
            title: '超时订单',
            nkey: ''
          },
          {
            value: 5,
            title: '租借失败',
            nkey: ''
          },
          {
            value: 6,
            title: '扣款失败',
            nkey: ''
          }
        ],


        dealPhone: dealPhone,
        cat_id: [],
        search_regions_tag: [],
        categoryList: [],
        areaList: [],
        form: {
          cat_id: '',
          search_regions_tag: '',
          order_sn: this.$route.query.order_sn || '',
          search_uid: this.$route.query.search_uid || '',
          goods_sn: this.$route.query.goods_sn || '',
          store_name: this.$route.query.store_name || '',
          transaction_id: this.$route.query.transaction_id || ''
        },
        numInfo: {},
        tableMaxH: '250',
        oemInfo: {},
        list: [{},{},{},{},{},{},{},{},{},{},{},{},{},{}],
        listLoading: false,
        listQuery: {
          device_type: '-1',
          search_user_type: this.user_type,
          son_id: this.$route.query.son_id || '',
          order_type: this.$route.query.order_type || 0,
          start: 1,
          limit: 50
        },
        orderStatus: {
          '-1': '待支付',
          0: '未启动',
          1: '进行中',
          2: '已完成',
          3: '手动完结',
          4: '异常',
          5: '超时完成'
        },
        beginOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
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
        orderNum: {},
        order: {},
        selID: [],

        // 结束订单
        endOrderDialog: false,
        endOrderObj: {
          return_time: '',
          check_bao_backed: true
        },

        // 订单详情
        detailDialog: false,

        // 订单退款
        refundDialog: false,
        refundObj: {
          refund_2_balance: 1,
          refund_money: ''
        },

        //宝信息
        baoDialog: false,
        baoList: [],
        baoStatus: ['未弹出', '准备弹出', '已弹出', '有异物', '充电口有异常'],

        // 退款详情
        washRefundDialog: false,
        washRefund: {},
        refundStatus: {
          1: '申请中',
          2: '已拒绝',
          3: '已通过',
          4: '已退款'
        },

        // 导出
        xlsxStatus: false
      }
    },
    mounted(options) {
      // this.getList()
      // this.getStatNum()
      // this.getCategory()
      // this.getArea()
      this.$nextTick(()=>{
        this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 20
      })
    },
    methods: {
      /**
       * 订单数量
       */
      getStatNum() {
        const listQuery = Object.assign({}, this.listQuery, this.form)
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.$get('agentapi/order_data_stat_num', listQuery).then(res => {
          this.numInfo = res
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
      toQuery(val = '') {
        if(this.clickSubmit) return
        this.clickSubmit = true
        if (this.cat_id && this.cat_id.length > 0) {
          this.form.cat_id = this.cat_id[this.cat_id.length - 1]
        }
        if (this.search_regions_tag && this.search_regions_tag.length > 0) {
          this.form.search_regions_tag = this.search_regions_tag[this.search_regions_tag.length - 1]
        }
        this.listQuery.page = 1
        this.listQuery.total = 50
        if(val) this.listQuery.order_type = val
        if (this.xlsxStatus) this.xlsxStatus = false
        this.getStatNum()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 10
        this.getStatNum()
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.page - 1
        })
        if (params.end && params.begin) {
          if (params.end - params.begin > 180 * 24 * 60 * 60 * 1000) {
            this.$message.error('筛选时间维度不可超过180天')
            this.clickSubmit = false
            return
          }
          params.page_switch = 1
        }
        if (params.begin) params.begin = this.parseTime(params.begin, '{y}-{m}-{d}')
        if (params.end) params.end = this.parseTime(params.end, '{y}-{m}-{d}')
        if (params.device_type == -1) delete params.device_type
        this.$get('order/findPage', params).then(res => {
          if (this.xlsxStatus) {
            this.toXlsxEnd = false
            this.list = res.list
            if (params.limit > res.list.length) {
              this.end = true
              this.listLoading = false
            } else {
              this.listQuery.page++
              this.percentage = this.percentage < 96 ? this.percentage + 2 : 96
            }
            this.$nextTick(() => {
              this.$refs.toXlsx.saveTableXlsx(this.toXlsxEnd, function(){
                this.getList()
              })
            })
          } else {
            this.listLoading = false
            this.list = res.list
          }
          this.clickSubmit = false
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          if(this.checkRoles(['terminal'])) this.getOEMInfo(this.arrayKeys(res.list, 'agent_id'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 导出
       */
      saveXlsx() {
        this.xlsxStatus = true
        this.listLoading = true
        this.listQuery.size = 200
        this.list = []
        this.getList()
      },

      /**
       * 品牌信息
       */
      getOEMInfo(aids = []) {
        this.$get('commonapi/configer/these_platform_info', {
          son_aids: JSON.stringify(aids)
        }).then(res => {
          this.oemInfo = res.list
        })
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
        this.$get('wxapi/order_detail', {
          order_id: row.order_id
        }).then(res => {
          res.agents_profit = res.order_info.agents_profit
          res.money_paid = res.order_info.money_paid
          this.order = res
          this.detailDialog = true
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
