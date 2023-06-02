<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :defaultShowLength="2" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()" v-if="myDeviceName && Object.keys(myDeviceName).length > 1">
          <el-tab-pane label="全部设备" :name="''" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>

      <template v-slot:left>
        <div class="pl-10 max-w filter-btn_box white-space">
          <el-scrollbar>
            <el-button size="medium" :type="listQuery.status == item.value ? 'primary' : ''"
              :class="{'btn-body': listQuery.status != item.value}" v-for="item in orderTab"
              @click="listQuery.status = item.value; toQuery(2)">{{ item.title }}({{statInfo[item.nkey] || 0}})</el-button>
            <el-button size="medium" type="warning" @click="setRows(1, {}, 3)"
              v-if="isSaas() || isBrand()">取消支付分订单</el-button>
          </el-scrollbar>
        </div>
      </template>
      <template v-slot:defult>
        <el-form-item label="订单号">
          <el-input v-model="form.orderNo" placeholder="订单号后6位或全部" class="order-no" />
        </el-form-item>
        <el-form-item label="手机号">
          <selectSearch v-model="form.userId" :type="1" name="mobile" placeholder="手机号" @change="toQuery()">
          </selectSearch>
        </el-form-item>
        <el-form-item label="用户昵称">
          <selectSearch v-model="form.userIds" :type="2" name="nickname" placeholder="用户昵称" @change="toQuery()">
          </selectSearch>
        </el-form-item>
        <el-form-item label="商户名称">
          <selectSearch v-model="form.storeId" :type="3" name="name" placeholder="商户名称" @change="toQuery()"
            :isStoreOrder="true"></selectSearch>
        </el-form-item>
        <el-form-item label="设备SN">
          <el-input v-model="form.deviceSn" placeholder="设备SN" />
        </el-form-item>
        <el-form-item label="交易单号">
          <el-input v-model="form.transactionNo" placeholder="交易单号" />
        </el-form-item>
        <el-form-item label="订单来源">
          <el-select v-model="form.sourceType" placeholder="订单来源" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option :label="item" :value="key" v-for="(item, key) in Constant.SourceType" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="form.payType" placeholder="支付类型" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option :label="item" :value="key" v-for="(item, key) in Constant.PayType" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期筛选">
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss" start-placeholder="开始日期" end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading" stripe>
        <el-table-column label="订单号" width="140">
          <template slot-scope="scope">
            {{ scope.row.orderNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="交易单号" width="155">
          <template slot-scope="scope">
            <div>{{ scope.row.transactionNo || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template slot-scope="scope">
            {{ scope.row.deviceType || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="来源" width="50">
          <template slot-scope="scope">
            <span v-if="scope.row.sourceType == 3">后台</span>
            <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="scope.row.sourceType == 1"></i>
            <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="支付类型" width="100">
          <template slot-scope="scope">
            <div class="fs-s3">{{ Constant.PayType ? Constant.PayType[scope.row.payType] : '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150">
          <template slot-scope="scope">
            <div class="cursor text-blue" @click="setRows(1, scope.row, 4)" v-if="scope.row.userId == 0">
              查看使用用户
            </div>
            <div v-else>
              <div v-if="isBrand() || isSaas()">{{ scope.row.userMobile }}</div>
              <div v-else>{{ dealPhone(scope.row.userMobile) }}</div>
              <div class="text-cut">{{ scope.row.userNickName || "--" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商户" min-width="180" v-if="!isStore()">
          <template slot-scope="scope">
            <div>{{ scope.row.storeName || '--' }}</div>
            <!-- <div>{{ scope.row.back_store || '--' }}</div> -->
          </template>
        </el-table-column>
        <el-table-column label="时间" width="150">
          <template slot-scope="scope">
            <div class="text-green">{{ scope.row.chargeStartTime || "--" }}</div>
            <div class="text-danger">{{ scope.row.chargeEndTime || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="设备" width="240">
          <template slot-scope="scope">
            <div>二维码：{{ scope.row.deviceSn || "--" }}</div>
            <div>设备SN：{{ scope.row.factorySn || "--" }}</div>
            <div class="text-cut cursor text-blue" v-if="scope.row.depend_type == 0"
              @click="checkBao(scope.row.goods_sn)">宝SN码：{{ scope.row.goods_sn || "--" }}</div>
          </template>
        </el-table-column>
        <el-table-column label="套餐类型" width="100">
          <template slot-scope="scope">
            {{ showFeeName(scope.row.feeType) }}<span v-if="scope.row.feeType == 3">({{ scope.row.amountPaid }}元)</span>
          </template>
        </el-table-column>
        <el-table-column label="套餐" width="150">
          <template slot-scope="scope">
            {{ showFeeMode(scope.row.feeType, scope.row.feeMode)}}
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" width="75">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.amount || '0.00' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="退款(元)" width="75">
          <template slot-scope="scope">
            <el-link type="success">{{ scope.row.amountRefund || '0.00' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-link :type="scope.row.status > 2 || scope.row.order_status == -1 ? 'danger' : 'success'">
              {{ Constant.OrderStatus? Constant.OrderStatus[scope.row.status] : "--" }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150">
          <template slot-scope="scope">
            <div class="remark-box">
              <el-link type="danger" v-if="scope.row.freeTime > 0">
                <span v-if="scope.row.freeUser == 1">免费名额：{{ parseInt(scope.row.freeTime) / 60 }}小时</span>
                <span v-else>{{ scope.row.freeTime == 600000 ? '会员卡订单' : `会员卡免费${scope.row.freeTime}分钟` }}</span>
              </el-link>
              <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="getDetail(scope.row)">订单详情</el-button>
              <el-button type="danger" size="mini" plain @click="setRows(1, scope.row, 1)"
                v-if="Ability['orderFinish'] && scope.row.status == 'R'">结束订单</el-button>
              <!-- <el-button type="info" size="mini" plain @click="setRows(2, scope.row)" v-if="scope.row.deviceType == '充电宝'">宝状态</el-button> -->
              <el-button type="info" size="mini" plain @click="setRows(1, scope.row, 2)"
                v-if="Ability['orderRefund'] && (scope.row.status.indexOf('G') > -1) && scope.row.amount > 0">订单退款</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>

      <el-dialog title="订单详情" :visible.sync="detailDialog">
        <el-row class="text-center">
          <el-col :xs="12" :sm="12" :md="4" class="rel pb-50 mb-15 timeline-item el-icon-"
            v-for="(item, index) in orderFlow">
            <div class="abs" style="width: 100%;">
              <el-tooltip :content="item.reason || '无'" placement="top">
                <div class="text-cut">{{ item.event }}</div>
              </el-tooltip>
              <div class="mt-10 fs-s2 text-gray">{{ parseTime(item.createTime) }}</div>
            </div>
          </el-col>
        </el-row>

        <template v-if="orderDivide.length > 0">
          <el-table border stripe :data="orderDivide" :span-method="fenRunSpanMethod" class="custom">
            <el-table-column label="订单金额" align="center">
              <template slot-scope="scope">
                {{ amountPaid }}元
              </template>
            </el-table-column>
            <el-table-column width="190" label="分成人" align="center">
              <template slot-scope="scope">
                {{ scope.row.dividerName }}
              </template>
            </el-table-column>
            <el-table-column label="分成比例" align="center">
              <template slot-scope="scope">
                {{ scope.row.percent }}%
              </template>
            </el-table-column>
            <el-table-column label="分成金额(元)" align="center">
              <template slot-scope="scope">
                <span>{{ accSub(scope.row.amount, scope.row.loseAmount) }}</span>
                <span v-if="scope.row.costAmount > 0">(包含超时成本{{ scope.row.costAmount }}元)</span>
              </template>
            </el-table-column>
            <el-table-column label="DD金额(元)" align="center" v-if="amountPaidLose > 0">
              <template slot-scope="scope">
                {{ scope.row.loseAmount || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="退款金额(元)" align="center">
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
          <el-form class="custom-form text-center">
            <div class="text-black2">归还时间</div>
            <el-date-picker class="mt-10" v-model="dform.chargeEndTime" type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerOptionsEnd" placeholder="请选择结束时间">
            </el-date-picker>

            <template v-if="curRow.deviceType == '充电宝'">
              <div class="mt-30 text-black2">检测设备是否归还</div>
              <el-switch class="mt-10" v-model="dform.validateDeviceRefund" />
            </template>
          </el-form>
        </template>
        <template v-if="dialogType == 2">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="退回方式">
              <el-radio-group v-model="dform.refundType">
                <el-radio :label="key" v-for="(item, key) in Constant.RefundType"
                  v-if="(key == 2 && curRow.feeType == 2 && curRow.payType < 3) || (key != 2)">{{ item }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="退款金额">
              <el-input v-model="dform.amount" :placeholder="`最多${curRow.amount}元`">
                <span slot="append">元</span>
              </el-input>
            </el-form-item>
            <el-form-item label="退款原因">
              <el-input v-model="dform.reason" placeholder="非必填，若填写将展示在用户退款信息中"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 3">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="订单单号">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
            <el-form-item label="取消原因">
              <el-input v-model="dform.reason"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 4">
          <el-table border stripe :data="dform.list">
            <el-table-column label="头像" align="center">
              <template slot-scope="scope">
                <el-avatar :size="30" :src="scope.row.avatar"></el-avatar>
              </template>
            </el-table-column>
            <el-table-column label="昵称" align="center">
              <template slot-scope="scope">
                {{ scope.row.nickname }}
              </template>
            </el-table-column>
            <el-table-column label="手机号" align="center">
              <template slot-scope="scope">
                {{ scope.row.mobiel }}
              </template>
            </el-table-column>
            <el-table-column label="使用时间" align="center">
              <template slot-scope="scope">
                {{ parseTime(scope.row.startUseTime) }}
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-if="dialogType == 5">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="订单单号">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <div class="mt-30 text-center">
          <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit"
            v-if="dialogType != 4">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import {
    dealPhone,
    showFeeMode,
    showFeeName,
    parseTime,
    currentTime,
    unixTime,
    accAdd,
    accSub
  } from '@/utils/index'

  export default {
    name: 'Order',
    components: {
      Pagination,
      condition,
      selectSearch
    },
    props: {
      lowerAgent: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      Constant() {
        return this.$store.getters.Constant
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
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    data() {
      return {
        dealPhone: dealPhone,
        showFeeMode: showFeeMode,
        showFeeName: showFeeName,
        accSub: accSub,
        clickSubmit: false,
        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
            if (timeOptionRange) {
              return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
                .getTime() - secondNum) || time.getTime() > Date.now()
            }
            return time.getTime() > Date.now()
          },
          onPick: (time) => {
            //当第一时间选中才设置禁用
            if (time.minDate && !time.maxDate) {
              this.timeOptionRange = time.minDate
            }
            if (time.maxDate) {
              this.timeOptionRange = null
            }
          }
        },
        orderTab: [{
            value: '',
            title: '全部',
            nkey: 'orderNumber'
          },
          {
            value: 'R',
            title: '进行中',
            nkey: 'rentingNumber'
          },
          {
            value: 'today',
            title: '今日订单',
            nkey: 'todayNumber'
          },
          {
            value: 'O',
            title: '已完成',
            nkey: 'doneNumber'
          },
          {
            value: 'OT',
            title: '超时订单',
            nkey: 'expiredNumber'
          },
          {
            value: 'F',
            title: '租借失败',
            nkey: 'rentFailedNumber'
          },
          {
            value: 'OHW',
            title: '扣款失败',
            nkey: 'payFailedNumber'
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
        order: {},
        selID: [],

        // 订单详情
        detailDialog: false,
        orderFlow: [],
        orderDivide: [],
        amountPaid: '',
        amountPaidLose: '',

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '结束订单',
          2: '订单退款',
          3: '取消支付分订单',
          4: '订单使用用户',
          5: '免押待付款订单0元完结'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    mounted() {
      let query = this.$route.query
      this.queryKey = ['storeId', 'agentId', 'brandId', 'deviceSn', 'sourceType', 'userId']
      for (var i in this.queryKey) {
        if (query[this.queryKey[i]]) this[this.queryKey[i]] = query[this.queryKey[i]]
      }
      this.toQuery()
    },
    methods: {
      /**
       * 订单数量
       */
      getStatNum() {
        let url = 'iot-saas-order/admin/order/count/queryByUser',
          params = Object.assign({}, this.listQuery, this.form)
        if (params.date && params.date.length > 0) {
          params.startTime = params.date[0]
          params.endTime = params.date[1]
          delete params.date
        }
        for (var i in this.queryKey) {
          if (this[this.queryKey[i]]) {
            params[this.queryKey[i]] = this[this.queryKey[i]]
          }
        }
        if (params.storeId && params.storeId.indexOf('&') > -1) {
          let ids = params.storeId.split('&')
          params.storeId = ids[0]
          params.agentId = ids[1]
        }
        params.lowerAgent = this.lowerAgent || false
        if (params.deviceTypeCode == 0) delete params.deviceTypeCode
        delete params.status
        this.$get(url, params).then(res => {
          this.statInfo = res
        })
      },

      /**
       * 搜索查询
       */
      toQuery(type = 1) {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        if (type == 1) this.getStatNum()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        if (this.clickSubmit) return
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
        var url = 'iot-saas-order/admin/order/list',
          params = Object.assign({}, this.form, this.listQuery, {
            page: this.listQuery.page - 1
          })
        if (params.date && params.date.length > 0) {
          params.startTime = params.date[0]
          params.endTime = params.date[1]
          delete params.date
        }
        if (params.status == 'today') {
          let todayTime = new Date(new Date().toLocaleDateString()).getTime() / 1000
          params.startTime = parseTime(todayTime)
          params.endTime = parseTime(todayTime + 86400)
          delete params.status
        }
        for (var i in this.queryKey) {
          if (this[this.queryKey[i]]) {
            params[this.queryKey[i]] = this[this.queryKey[i]]
          }
        }
        if (params.storeId && params.storeId.indexOf('&') > -1) {
          let ids = params.storeId.split('&')
          params.storeId = ids[0]
          params.agentId = ids[1]
        }
        if (params.deviceTypeCode == 0) delete params.deviceTypeCode
        if (params.userIds) {
          params.userId = params.userIds
          delete params.userIds
        }
        if (params.orderNo && params.orderNo.length == 6) {
          params.orderNoEndSix = params.orderNo
          delete params.orderNo
        }
        params.lowerAgent = this.lowerAgent || false
        this.$get(url, params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          this.listTotal = res.total
          if (params.page == 0) {
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
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
       * 查询订单详情
       */
      getDetail(row) {
        this.$get('iot-saas-order/admin/order/detail/flow', {
          orderNo: row.orderNo
        }).then(res => {
          this.orderFlow = res
          this.orderDivide = []
          this.detailDialog = true
          if (row.status.indexOf('O') > -1 && row.amount > 0) {
            this.$get('iot-saas-order/admin/order/detail/divide', {
              orderNo: row.orderNo
            }).then(res => {
              let amountPaidLose = 0
              if (res.divideList && res.divideList.length > 0) {
                res.divideList.map(item => {
                  amountPaidLose = accAdd(amountPaidLose, item.loseAmount)
                })
              }
              this.orderDivide = res.divideList
              this.amountPaid = res.amountPaid
              this.amountPaidLose = amountPaidLose
            })
          }
        })
      },

      /**
       * 订单详情分润合并单元格
       */
      fenRunSpanMethod({
        row,
        column,
        rowIndex,
        columnIndex
      }) {
        if (columnIndex === 0) {
          if (rowIndex % 8 === 0) {
            return {
              rowspan: 8,
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
       * @param {Object} type 1 dialog类型 2 查询宝归还状态
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '结束订单' 2: '订单退款' 3: '取消订单' 4: '查看订单使用人数'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            if (dialogType == 1) {
              this.$set(this.dform, 'chargeEndTime', this.parseTime(this.currentTime()))
              if (row.deviceType == '充电宝') this.$set(this.dform, 'validateDeviceRefund', true)
            } else if (dialogType == 2) {
              this.$set(this.dform, 'refundType', '0')
            } else if (dialogType == 4) {
              this.$get('iot-saas-order/admin/order/queryStoreOrderUser', {
                orderNo: row.orderNo
              }).then(res => {
                this.$set(this.dform, 'list', res)
              })
            }
            break
          case 2:
            this.$get('iot-saas-device/admin/device/findRestoreStatus', {
              orderNo: row.orderNo
            }).then(res => {
              if (res) {
                this.$message({
                  message: '宝已归还',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '宝还未归还，未查询到归还记录',
                  type: 'error'
                })
              }
            })
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
          case 1:
            if (!params.chargeEndTime) {
              this.$message({
                message: '请选择订单结束时间',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-order/admin/order/complete', {
              orderNo: this.curRow.orderNo,
              chargeEndTime: params.chargeEndTime,
              validateDeviceRefund: params.validateDeviceRefund || false
            }).then(res => {
              this.$message({
                message: '结束订单成功',
                type: 'success'
              })
              curRow.status = 'OTG'
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 2:
            if (!params.amount) {
              this.$message({
                message: '请输入退款金额',
                type: 'error'
              })
              return
            }
            params.orderNo = this.curRow.orderNo
            this.$post('iot-saas-order/admin/order/refund', params).then(res => {
              this.$message({
                message: '订单退款成功',
                type: 'success'
              })
              curRow.status = 'OTD'
              curRow.amountRefund = params.amount
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 3:
            if (!params.orderNo) {
              this.$message({
                message: '请输入订单号',
                type: 'error'
              })
              this.clickSubmit = false
              return
            } else if (!params.reason) {
              this.$message({
                message: '请输入取消原因',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            this.$post('iot-saas-order/admin/order/cancel', params).then(res => {
              this.$message({
                message: '取消成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 5:
            if (!params.orderNo) {
              this.$message({
                message: '请输入订单号',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-order/admin/deposit/execute', {
              orderNoList: [params.orderNo]
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }

  .remark-box {
    max-height: 80px;
  }

  /deep/ .order-no {
    .el-input__inner {
      padding-right: 0;
    }
  }

  .timeline-item {
    height: 100px;

    &::after,
    &::before {
      content: '';
      position: absolute;
    }

    &::before {
      width: 60px;
      height: 14px;
      top: 45px;
      margin-left: -30px;
      content: "";
      background-color: var(--white);
      color: var(--olive);
      z-index: 99;
    }

    &::after {
      top: 51px;
      margin-left: 20px;
      width: 100%;
      height: 1px;
      background: var(--olive);
    }

    &:nth-child(2n) {
      padding-top: 70px;
    }

    &.err {
      &::before {
        content: "";
        color: "#FF5353";
      }
    }

    @media only screen and (max-width: 991px) {

      &:last-child,
      &:nth-child(2n) {
        &::after {
          width: 0;
        }
      }
    }

    @media only screen and (min-width: 992px) {

      &:last-child,
      &:nth-child(6n) {
        &::after {
          width: 0;
        }
      }
    }
  }
</style>
