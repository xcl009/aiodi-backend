<template>
  <div class="rel pb-20 home-box mb-20">
    <el-image class="abs quadrangle tl" :src="require('@/assets/home/quadrangle.svg')"></el-image>
    <el-image class="abs quadrangle tr" :src="require('@/assets/home/quadrangle.svg')"></el-image>
    <el-image class="abs quadrangle bl" :src="require('@/assets/home/quadrangle.svg')"></el-image>
    <el-image class="abs quadrangle br" :src="require('@/assets/home/quadrangle.svg')"></el-image>
    <el-image class="abs pieces l" :src="require('@/assets/home/pieces.svg')"></el-image>
    <el-image class="abs pieces r" :src="require('@/assets/home/pieces.svg')"></el-image>

    <div class="abs blur-box"></div>
    <el-row :gutter="10" type="flex" class="stat-box text-center">
      <el-col :span="24" class="rel">
        <div class="abs p-all flex justify-center">
          <div class="o-v card-panel cursor" @click="$router.push({path: `/money/monthMoney`})">
            <div class="flex align-center fs-b5 baby-blue">￥<count-to :start-val="0"
                :end-val="delComma(orderStat.orderAmount)" :duration="2600" :decimals="2" /></div>
            <div class="mt-5 fs-c1 text-white">总交易额</div>
            <el-image class="mt-10 type-icon" :src="require('@/assets/home/amout.svg')"></el-image>
          </div>
        </div>
        <div class="dodge-icon b"></div>
      </el-col>
      <el-col :span="24" class="rel">
        <div class="abs p-all flex justify-center">
          <div class="o-v card-panel cursor" @click="$router.push({path: `/order`})">
            <div class="fs-b5 y-yellow"><count-to :start-val="0" :end-val="delComma(orderStat.orderNumber)"
                :duration="2600" /></div>
            <div class="mt-5 fs-c1 text-white">总订单数</div>
            <el-image class="mt-10 type-icon" :src="require('@/assets/home/order.svg')"></el-image>
          </div>
        </div>
        <div class="dodge-icon y"></div>
      </el-col>
      <el-col :span="24" class="rel">
        <div class="abs p-all flex justify-center">
          <div class="o-v card-panel cursor" @click="$router.push({path: isSaas() ? `/device` : `/device`})">
            <div class="fs-b5 baby-blue"><count-to :start-val="0" :end-val="delComma(orderStat.deviceNumber)"
                :duration="2600" /></div>
            <div class="mt-5 fs-c1 text-white">总设备数</div>
            <el-image class="mt-10 type-icon" :src="require('@/assets/home/device.svg')"></el-image>
          </div>
        </div>
        <div class="dodge-icon b"></div>
      </el-col>
      <el-col :span="24" class="rel" v-if="!isStore()">
        <div class="abs p-all flex justify-center">
          <div class="o-v card-panel cursor">
            <div class="fs-b5 y-yellow"><count-to :start-val="0" :end-val="parseInt(agentStoreStat.agentCount)" :duration="2600" /></div>
            <div class="mt-5 fs-c1 text-white">总代理数</div>
            <el-image class="mt-10 type-icon" :src="require('@/assets/home/agent.svg')"></el-image>
          </div>
        </div>
        <div class="dodge-icon y"></div>
      </el-col>
      <el-col :span="24" class="rel" v-if="!isStore()">
        <div class="abs p-all flex justify-center">
          <div class="o-v card-panel cursor">
            <div class="fs-b5 baby-blue"><count-to :start-val="0" :end-val="parseInt(agentStoreStat.storeCount)" :duration="2600" /></div>
            <div class="mt-5 fs-c1 text-white">总商户数</div>
            <el-image class="mt-10 type-icon" :src="require('@/assets/home/store.svg')"></el-image>
          </div>
        </div>
        <div class="dodge-icon b"></div>
      </el-col>
    </el-row>

    <div class="pl-20 pr-20 trapezoid-box">
      <div class="trapezoid"></div>
      <div class="trapezoid-strip"></div>
    </div>

    <el-row :gutter="20" type="flex" class="two-box mt-20 pl-20 pr-20 text-white" v-if="roomList['BD'] || roomList['VG'] || roomList['AV']">
      <template v-for="(itme, key) in config.roomDevice">
        <el-col :span="24" v-if="roomList[key] && roomList[key].length > 0">
          <div class="p-20 item-box">
            <div class="mb-20 flex align-center">
              <div class="line"></div>
              <div class="flex1"><span class="fs-b2">{{ itme }}</span><span class="ml-5">点击房间号即可创建订单</span></div>
            </div>
            <div class="o-v cursor">
              <div class="flex align-center flex-wrap room-box text-center fs-b2">
                <div class="pt-15 pb-15 item" v-for="sitem in roomList[key]"  @click="setRows(1, sitem, 6)">
                  <div>{{ sitem.place || sitem.deviceSn }}</div>
                  <div class="fs-s3">房间号</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </template>
    </el-row>

    <el-row :gutter="20" type="flex" class="two-box mt-20 pl-20 pr-20 text-white">
      <el-col :sm="24" :lg="(checkHotel() && isStore()) || !isStore() ? 8 : 12">
        <div class="p-20 item-box">
          <div class="mb-20 flex align-center">
            <div class="line"></div>
            <div class="flex1 fs-b2">交易数据对比</div>
            <div class="flex btn-box cursor">
              <div class="btn" :class="{'act': contrast_type == index}" v-for="(item, index) in contrast_arr"
                @click="contrast_type = index; $refs.contrastCarusel.setActiveItem(index)">{{ item }}</div>
            </div>
          </div>
          <el-carousel height="300px" ref="contrastCarusel" @change="contrastChange" v-if="querHistogram.today">
            <el-carousel-item v-for="(item, index) in contrast_arr" :interval="5000" :initial-index="contrast_type">
              <div class="flex">
                <div class="label">
                  <div>今日</div>
                  <div>昨日</div>
                  <div>本周</div>
                  <div>上周</div>
                  <div>本月</div>
                  <div>上月</div>
                </div>
                <div class="flex1">
                  <template v-for="key in ['today','yesterday','week','lastWeek','month','lastMonth']">
                    <div class="progress">
                      <el-progress :stroke-width="12" :show-text="false" :percentage="index == 0 ? querHistogram[key].amountPP : index == 1 ? querHistogram[key].orderPP : querHistogram[key].unitPP"></el-progress>
                    </div>
                  </template>
                </div>
                <div class="label">
                  <template v-for="key in ['today','yesterday','week','lastWeek','month','lastMonth']">
                    <div>
                      {{ index == 0 ? querHistogram[key].amount + '元' : index == 1 ? querHistogram[key].orderNumber + '单' : querHistogram[key].unitPrice  + '元'}}
                    </div>
                  </template>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </el-col>
      <el-col :sm="24" :lg="(checkHotel() && isStore()) || !isStore() ? 8 : 12">
        <div class="p-20 item-box">
          <div class="flex align-center">
            <div class="line"></div>
            <div class="flex1 fs-b2">设备数量统计</div>
          </div>
          <div class="chart-device" ref="chart_device" style="height: 100%;"></div>
        </div>
      </el-col>
      <el-col :sm="24" :lg="8" v-if="!isStore()">
        <div class="pl-20 pr-20 pt-20 item-box">
          <div class="flex align-center">
            <div class="line"></div>
            <div class="flex1 fs-b2">设备产出使用情况-模拟数据</div>
          </div>
          <el-table class="store-table text-white" :highlight-current-row="false"
            :header-row-style="{background:'none'}"
            :header-cell-style="{background:'none',color:'#1CB9FB',border:'none',fontSize:'16px'}"
            :row-style="{background:'none'}" :cell-style="{borderColor:'#143F84'}" :data="storeList"
            style="background:none">
            <el-table-column label="排名" width="70">
              <template slot-scope="scope">
                <span class="fs-c1 text-bold"
                  :class="{'y-yellow': scope.row.ranking == 1, 'baby-blue': scope.row.ranking == 3, 'text-primary': scope.row.ranking == 2}">NO.{{ scope.row.ranking }}</span>
              </template>
            </el-table-column>
            <el-table-column label="商户名称" min-width="90">
              <template slot-scope="scope">
                <span class="y-yellow">{{ scope.row.name.substring(0, 2) }}**</span>
              </template>
            </el-table-column>
            <el-table-column label="设备数量" min-width="90">
              <template slot-scope="scope">
                {{ scope.row.deviceNum }}
              </template>
            </el-table-column>
            <el-table-column label="订单量" min-width="90">
              <template slot-scope="scope">
                {{ scope.row.orderNum }}
              </template>
            </el-table-column>
            <el-table-column label="总金额" min-width="120">
              <template slot-scope="scope">
                {{ scope.row.orderAmount }}
              </template>
            </el-table-column>
            <el-table-column label="在线">
              <template slot-scope="scope">
                {{ scope.row.deviceOnline }}
              </template>
            </el-table-column>
            <el-table-column label="离线">
              <template slot-scope="scope">
                {{ scope.row.deviceOffline }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :sm="24" :lg="8" v-if="checkHotel() && isStore()">
        <div class="pl-20 pr-20 pt-20 item-box">
          <div @click="$router.push({path: `/hotelTools`})">
            <div class="flex align-center">
              <div class="line"></div>
              <div class="flex1 fs-b2">酒店功能区</div>
            </div>
            <el-carousel height="80px" direction="vertical" arrow="never">
              <el-carousel-item v-for="item in tool">
                <div class="tool-item flex align-center cursor">
                  <div class="flex1">
                    <div class="fs-a1 text-white">{{ item.title }}</div>
                    <div class="mt-5 text-gray fs-s4">{{ item.desc }}</div>
                  </div>
                  <i class="el-icon-arrow-right fs-c1"></i>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" type="flex" class="three-box mt-20 pl-20 pr-20 text-white" v-if="Ability['order']">
      <el-col :sm="24" :lg="12">
        <div class="pl-20 pr-20 pt-20 item-box">
          <div class="flex align-center">
            <div class="line"></div>
            <div class="flex1 fs-b2">订单数据明细</div>
          </div>
          <el-table ref="orderTable" class="order-table text-white" height="460px" :highlight-current-row="false"
            :header-row-style="{background:'none'}"
            :header-cell-style="{background:'none',color:'#1CB9FB',border:'none',fontSize:'16px'}"
            :row-style="{background:'#0D2749'}" :cell-style="{border:'none'}" :data="orderList"
            style="background:none">
            <el-table-column label="序号" width="60">
              <template slot-scope="scope">
                <div class="fs-c1 text-bold idx text-center" :class="'idx_' + scope.$index % 3">{{ scope.$index + 1 }}</div>
              </template>
            </el-table-column>
            <el-table-column label="商户" width="80">
              <template slot-scope="scope">
                <span>{{ scope.row.storeName.substring(0, 1) }}***</span>
              </template>
            </el-table-column>
            <el-table-column label="用户" width="80">
              <template slot-scope="scope">
                {{ scope.row.userNickName ? scope.row.userNickName.substring(0, 1) : '' }}**
              </template>
            </el-table-column>
            <el-table-column label="设备品类" width="100">
              <template slot-scope="scope">
                {{ scope.row.deviceType }}
              </template>
            </el-table-column>
            <el-table-column label="来源" width="80">
              <template slot-scope="scope">
                {{ scope.row.sourceType == 2 ? '支付宝' : '微信' }}
              </template>
            </el-table-column>
            <el-table-column label="开始时间" width="150">
              <template slot-scope="scope">
                {{ scope.row.chargeStartTime || "--" }}
              </template>
            </el-table-column>
            <el-table-column label="结束时间" width="150">
              <template slot-scope="scope">
                {{ scope.row.chargeEndTime || "--" }}
              </template>
            </el-table-column>
            <el-table-column label="金额">
              <template slot-scope="scope">
                ￥{{ scope.row.amount }}
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                 {{ Constant.OrderStatus ? Constant.OrderStatus[scope.row.status] : "--" }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :sm="24" :lg="12">
        <div class="pl-20 pr-20 pt-20 item-box">
          <div class="flex align-center">
            <div class="line"></div>
            <div class="flex1 fs-b2">近期数据比较</div>
            <div class="flex btn-box cursor">
              <div class="btn" :class="{'act': day_type == index}" v-for="(item, index) in day_type_arr"
                @click="day_type = index; getLineChart()">{{ item }}</div>
            </div>
            <div class="ml-15 box-grey">
              <el-date-picker class="range-day" type="month" size="small" v-model="form.date" :picker-options="pickerOptionsEnd" range-separator="-"
                placeholder="选择月份" value-format="yyyy-MM" @change="getTime">
              </el-date-picker>
            </div>
          </div>
          <div class="chart-daystat" ref="chartDay" style="height: 460px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 6">
        <div class="text-center">
          <div class="flex align-center justify-center">
            <div>订单可使用时长：</div>
            <el-select v-model="dform.duration" placeholder="免费时长">
              <el-option :label="`${item}小时`" :value="item" v-for="item in config.bed_order_time" />
            </el-select>
          </div>
          <div class="mt-15 fs-s3">注：提交后，{{ dform.duration }}小时内用户可扫码直接启动设备。</div>

          <div class="mt-30 text-black">
            <div class="cursor">当前剩余快活币：<span class="text-primary">{{ money.happyCurrencyNum }}</span><span
                class="ml-20 text-primary cursor" @click="$router.push({path: `/money`})">快活币充值</span></div>
            <div class="mt-15" v-if="!createOrderConfig[dform.deviceTypeCode]">订单计费规则未配置，暂不可下单</div>
            <div class="mt-15"
              v-else-if="createOrderConfig[dform.deviceTypeCode].giftDays > 0 && currentTime() < unixTime(curRow.bindStoreTime) + createOrderConfig[dform.deviceTypeCode].giftDays * 86400">
              剩余赠送免费时间：{{ formatSeconds((unixTime(curRow.bindStoreTime) + createOrderConfig[dform.deviceTypeCode].giftDays * 86400) - currentTime())}}
            </div>
            <div class="mt-15" v-else>创建订单将会扣除快活币：<span
                class="text-danger">{{ createOrderConfig[dform.deviceTypeCode].amount }}</span></div>
          </div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    arrayToObj,
    delComma,
    parseTime,
    currentTime,
    unixTime,
    formatSeconds,
    accAdd,
    accMul
  } from '@/utils/index'
  import DateUtil from '@/utils/date'
  import CountTo from 'vue-count-to'

  import {
    Finance,
    TransactionOrder,
    Server,
    Peoples
  } from '@icon-park/vue'

  import * as echarts from 'echarts/lib/echarts'
  import {
    TooltipComponent,
    LegendComponent,
    GridComponent
  } from 'echarts/components'
  import {
    PieChart,
    LineChart
  } from 'echarts/charts'
  import {
    LabelLayout
  } from 'echarts/features'
  import {
    CanvasRenderer
  } from 'echarts/renderers'
  import 'echarts-gl'

  echarts.use([
    TooltipComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
    LabelLayout,
    LineChart,
    GridComponent
  ])

  export default {
    name: 'home',
    components: {
      CountTo,

      Finance,
      TransactionOrder,
      Peoples,
      Server
    },
    data() {
      return {
        accMul,
        delComma,
        unixTime,
        formatSeconds,
        clickSubmit: false,
        totalStat: {},
        form: {},
        orderStat: {},
        deviceStat: {},
        userStat: {},
        querHistogram: {},
        totalHistogram: {},

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
        // 设备统计数据
        deviceChartColor: [
          "#3CA1FE",
          "#00C0FF",
          "#00D9EB",
          "#00EBBC",
          "#9AF68C",
          "#9AF68C",
          "#9AF68C"
        ],
        deviceChartData: [],

        day_type_arr: ['近7天', '本周', '上周', '本月', '上月'],
        day_type: 0,
        contrast_arr: ['交易额', '订单量', '客单价'],
        contrast_type: 0,

        tool: [{
            title: '连接WIFI',
            desc: '设置WIFI账号密码，客人扫一扫一键连接wifi',
          },
          {
            title: '联系前台',
            desc: '设置多个前台电话，客人扫一扫一键联系前台',
          },
          {
            title: '投诉建议',
            desc: '开启投诉建议，随时随地接收客人反馈信息，快速响应处理',
          }
        ],

        /*主题房*/
        roomList: {},
        //订单收费配置信息
        createOrderConfig: {},
        // 钱包 + 快活币余额
        money: {},

        // 租赁订单
        leaseStat: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          6: '创建订单'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        agentStoreStat: {
          agentCount: 0,
          storeCount: 0
        },
        orderList: [],

        storeList: [
          {
            ranking: 1,
            name: '春生饭店',
            deviceNum: 16,
            orderNum: 1506,
            orderAmount: '￥11,235.00',
            deviceOnline: 16,
            deviceOffline: 0
          },
          {
            ranking: 2,
            name: '夏生饭店',
            deviceNum: 13,
            orderNum: 1100,
            orderAmount: '￥10,345.00',
            deviceOnline: 12,
            deviceOffline: 1
          },
          {
            ranking: 3,
            name: '秋生饭店',
            deviceNum: 11,
            orderNum: 920,
            orderAmount: '￥9,345.00',
            deviceOnline: 9,
            deviceOffline: 2
          },
          {
            ranking: 4,
            name: '冬生饭店',
            deviceNum: 8,
            orderNum: 956,
            orderAmount: '￥9125.00',
            deviceOnline: 8,
            deviceOffline: 0
          },
          {
            ranking: 5,
            name: '早生饭店',
            deviceNum: 6,
            orderNum: 812,
            orderAmount: '￥7562.00',
            deviceOnline: 5,
            deviceOffline: 1
          },
          {
            ranking: 6,
            name: '晚生饭店',
            deviceNum: 6,
            orderNum: 806,
            orderAmount: '￥7245.00',
            deviceOnline: 5,
            deviceOffline: 1
          }
        ]
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
        return this.$store.getters.myDeviceName
      },
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      },
      rests() {
        return this.$store.getters.rests
      }
    },
    created() {

    },
    mounted() {
      this.getOrderStat()
      this.getQuerHistogram()
      this.getLineChart()
      this.getDeviceStat()
      this.getOrderList()
      if(this.isSaas()) {
        this.getUserStat()
      }else if(this.isStore()) {
        this.getDeviceList()
        this.getBalance()
      }
      if(!this.isStore()) {
        this.$get('iot-saas-basic/admin/platform/getOwnerCount').then(res => {
          this.agentStoreStat = res
        })
      }
    },
    methods: {
      /**
       * 总统计
       */
      getOrderStat() {
        this.$get('iot-saas-order/admin/order/count/queryByUser').then(res => {
          this.orderStat = res
        })
      },

      /**
       * 交易数据对比
       */
      getQuerHistogram() {
        this.$get('iot-saas-order/admin/order/count/querHistogram', {
          brandId: this.brandId
        }).then(res => {
          let totalOrderNumber = 0,
            totalAmount = 0,
            totalUnitPrice = 0;
          for (var i in res) {
            if (i == 'month' || i == 'lastMonth') {
              totalOrderNumber = accAdd(totalOrderNumber, res[i].orderNumber)
              totalAmount = accAdd(totalAmount, res[i].amount)
              totalUnitPrice = accAdd(totalUnitPrice, res[i].unitPrice)
            }
          }
          for (var i in res) {
            let amountPP = accMul(res[i].amount / totalAmount, 100),
                orderPP = accMul(res[i].orderNumber / totalOrderNumber, 100),
                unitPP = accMul(res[i].orderNumber / totalUnitPrice, 100)
            res[i].amountPP = amountPP > 100 ? 100 : amountPP
            res[i].orderPP = orderPP > 100 ? 100 : orderPP
            res[i].unitPP = unitPP > 100 ? 100 : unitPP
          }
          this.querHistogram = res
        })
      },

      /**
       * 交易数据对比滚动
       */
      contrastChange(idx) {
        this.contrast_type = idx
      },

      /**
       * 用户统计
       */
      getUserStat() {
        this.$get('iot-saas-user/admin/user/queryCountInfo').then(res => {
          this.userStat = res
        })
      },

      /**
       * 选择日期或月份
       */
      getTime(val = '', type = 1) {
        if (val){
          this.selDay = this.getMonthLastDay(val)
          this.startDateStr = `${val}-01`
          this.endDateStr = `${val}-${this.selDay}`
        }else{
          this.startDateStr = ''
          this.endDateStr = ''
        }
        this.getLineChart()
      },

      /**
       * 获取指定月最后一天
       * @param {Object} date
       */
      getMonthLastDay(date) {
      	let a = date.split('-'),
      		curDate = new Date(a[0], a[1]),
      		endDay = new Date(curDate.setDate(0)).getDate()
      	return endDay
      },

      /**
       * 近期数据对比
       */
      getLineChart() {
        let eTime = currentTime(),
          sTime = eTime - (6 * 86400),
          groupDate = [],
          amount = [],
          orderNumber = [],
          doneOrderNumber = [],
          unitPrice = [],
          params = {}
        if (this.day_type == 1) {
          sTime = DateUtil.getWeekStartDate()
          eTime = DateUtil.getWeekEndDate()
        } else if (this.day_type == 2) {
          sTime = DateUtil.getLastWeekStartDate()
          eTime = DateUtil.getLastWeekEndDate()
        } else if (this.day_type == 3) {
          sTime = DateUtil.getMonthStartDate()
          eTime = DateUtil.getMonthEndDate()
        } else if (this.day_type == 4) {
          sTime = DateUtil.getLastMonthStartDate()
          eTime = DateUtil.getLastMonthEndDate()
        } else if (this.startDateStr) {
          sTime = unixTime(this.startDateStr)
          eTime = unixTime(this.endDateStr)
        }
        params = {
          brandID: this.brandId,
          startDateStr: parseTime(sTime, '{y}-{m}-{d}'),
          endDateStr: parseTime(eTime, '{y}-{m}-{d}')
        }
        this.$get('iot-saas-order/admin/order/count/querLineChart', params).then(res => {
          let obj = arrayToObj(res, 'countGroupDate')
          for (var i = sTime; i < (eTime + 86400); i = i + 86400) {
            groupDate.push(parseTime(i, '{m}-{d}'))
            let ymd = parseTime(i, '{y}-{m}-{d}')
            if (obj[ymd] && obj[ymd].countGroupDate == ymd) {
              amount.push(obj[ymd].amount)
              orderNumber.push(obj[ymd].orderNumber)
              doneOrderNumber.push(obj[ymd].doneOrderNumber)
              unitPrice.push(obj[ymd].unitPrice)
            } else {
              amount.push(0)
              orderNumber.push(0)
              doneOrderNumber.push(0)
              unitPrice.push(0)
            }
          }
          if (this.dayChartInit) {
            this.dayChartOptions({
              groupDate,
              amount,
              orderNumber,
              doneOrderNumber,
              unitPrice,
            })
          } else {
            this.setLineChart({
              groupDate,
              amount,
              orderNumber,
              doneOrderNumber,
              unitPrice,
            })
          }
        })
      },

      /**
       * 图表初始化
       */
      setLineChart(chartData) {
        this.dayChartInit = echarts.init(this.$refs.chartDay)
        this.dayChartOptions(chartData)
      },

      /**
       * 图表设置数据
       */
      dayChartOptions({
        groupDate,
        amount,
        orderNumber,
        doneOrderNumber,
        unitPrice
      } = {}) {
        if (!groupDate) return
        let legend = ['交易额', '订单量', '平均单量', '平均交易额'],
          series = [{
              name: '交易额',
              type: 'line',
              data: amount,
              animationDuration: 2800,
              animationEasing: 'cubicInOut',
            },
            {
              name: '订单量',
              type: 'line',
              data: orderNumber,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '平均单量',
              type: 'line',
              data: doneOrderNumber,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '平均交易额',
              type: 'line',
              data: unitPrice,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        this.dayChartInit.setOption({
          color: ['#3CA1FE', '#FFA32B', '#07C160', '#FF5353'],
          xAxis: {
            data: groupDate,
            boundaryGap: false,
            axisTick: {
              show: false
            },
            axisLabel: { //x轴文字的配置
              show: true,
              textStyle: {
                color: "#fff",
              }
            },
          },
          grid: {
            left: 20,
            right: 20,
            bottom: 70,
            top: 40,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            padding: [10, 10]
          },
          yAxis: {
            type: 'value',
            axisLabel: { //x轴文字的配置
              show: true,
              textStyle: {
                color: "#fff",
              }
            },
          },

          legend: {
            bottom: 20,
            data: legend,
            lineStyle: {
              width: 0
            },
            textStyle: {
              color: 'rgba(255, 255, 255, 0.6)'
            }
          },
          series: series
        })
      },

      /**
       * 获取可提现金额
       */
      getBalance() {
        this.$get('iot-saas-pay/api/pay/withdraw/balance').then(res => {
          this.money = res || {}
        })
      },

      /**
       * 获取主题房设备
       */
      getDeviceList() {
        Object.keys(this.config.roomDevice).map(item => {
          this.$get('iot-saas-device/admin/device/findPage', {
            page: 0,
            size: 100,
            deviceTypeCode: item
          }).then((res = {}) => {
            this.$set(this.roomList, item, res.rows || '')
          })
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '' 6: '创建订单'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            this.dform = {}
            if (dialogType == 6) {
              let code = row.deviceTypeCode ? row.deviceTypeCode.substr(0, 2) : row.deviceType.code.substr(0, 2)
              if (!this.createOrderConfig[code]) {
                this.$set(this.createOrderConfig, code, {})
                this.getCreateOrderConfig(code)
              }
              this.dform = {
                deviceSn: row.deviceSn,
                deviceTypeCode: code,
                duration: 2
              }
            }
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
          case 6:
            params.duration = params.duration * 60
            this.$post('iot-saas-order/admin/order/create', params).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      },

      /**
       * 获取订单列表
       */
      getOrderList() {
        var url = 'iot-saas-order/admin/order/list'
        this.$get(url, {
          page: 0,
          size: 4
        }).then(res => {
          if(res.rows.length > 0){
            let rows = res.rows
            for(var i = res.rows.length - 1; i < 50; i++){
              if(i < res.rows.length - 1){
                rows.push(res.rows[i])
              }else{
                rows.push(res.rows[i % (res.rows.length - 1)])
              }
            }
            this.orderList = rows
            let orderTable = this.$refs.orderTable.bodyWrapper
            clearInterval(this.orderTableTimer)
            this.orderTableTimer = setInterval(() => {
              orderTable.scrollTop += 1
              if(orderTable.clientHeight + orderTable.scrollTop + 1 > orderTable.scrollHeight){
                orderTable.scrollTop = 0
              }
            }, 50)
          }
        })
      },

      /**
       * 获取创建的配置
       */
      getCreateOrderConfig(code) {
        this.$get('iot-saas-basic/admin/storeOrderConfig/v1/findById', {
          deviceTypeCode: code,
          storeId: this.agentInfo.storeIds[0]
        }).then(res => {
          this.createOrderConfig[code] = res
        })
      },

      /**
       * 设备统计
       */
      getDeviceStat() {
        this.$get('iot-saas-device/admin/device/count/queryByUser').then(res => {
          this.deviceStat = res
          let deviceChartData = [], idx = 0, colors = ['#2A9F9F','#224278','#82A8C6','#9DA5B2','#82B869','#A01E57','#E1B44F','#D65C5C','#4C65B2']
          if (res.deviceTypeDetail) {
            for (var i in res.deviceTypeDetail) {
              if(this.myDeviceId[i.substr(0, 2)]){
                deviceChartData.push({
                  name: this.myDeviceId[i.substr(0, 2)],
                  value: parseInt(res.deviceTypeDetail[i].deviceNumber),
                  itemStyle: {
                    color: colors[idx]
                  },
                })
                idx++
              }
            }
            if (deviceChartData.length > 0) {
              this.deviceChartData = deviceChartData
            }
          }
          this.deviceChart()
        })
      },

      /**
       * 设备图表初始化
       */
      deviceChart() {
        this.deviceChartInit = echarts.init(this.$refs.chart_device)
        // 传入数据生成 option ; getPie3D(数据，透明的空心占比（调节中间空心范围的0就是普通饼1就很镂空）)
        this.deviceChartOption = this.getPie3D(this.deviceChartData, 0.85);
        //将配置项设置进去
        this.deviceChartInit.setOption(this.deviceChartOption);
        //鼠标移动上去特效效果
        //this.bindListen(this.deviceChartInit);
      },

      /**
       * 监听鼠标事件，实现饼图选中效果（单选），近似实现高亮（放大）效果。
       * @param {Object} myChart
       */
      bindListen(myChart) {
        let that = this;
        let selectedIndex = '';
        let hoveredIndex = '';
        // 监听点击事件，实现选中效果（单选）
        myChart.on('click', function(params) {
          // 从 option.series 中读取重新渲染扇形所需的参数，将是否选中取反。
          let isSelected = !that.deviceChartOption.series[params.seriesIndex].pieStatus.selected;
          let isHovered = that.deviceChartOption.series[params.seriesIndex].pieStatus.hovered;
          let k = that.deviceChartOption.series[params.seriesIndex].pieStatus.k;
          let startRatio = that.deviceChartOption.series[params.seriesIndex].pieData.startRatio;
          let endRatio = that.deviceChartOption.series[params.seriesIndex].pieData.endRatio;
          // 如果之前选中过其他扇形，将其取消选中（对 option 更新）
          if (selectedIndex !== '' && selectedIndex !== params.seriesIndex) {
            that.deviceChartOption.series[selectedIndex].parametricEquation = that.getParametricEquation(that.deviceChartOption.series[
                selectedIndex].pieData
              .startRatio, that.deviceChartOption.series[selectedIndex].pieData.endRatio, false, false, k, that.deviceChartOption
              .series[
                selectedIndex].pieData
              .value);
            that.deviceChartOption.series[selectedIndex].pieStatus.selected = false;
          }
          // 对当前点击的扇形，执行选中/取消选中操作（对 option 更新）
          that.deviceChartOption.series[params.seriesIndex].parametricEquation = that.getParametricEquation(startRatio,
            endRatio,
            isSelected,
            isHovered, k, that.deviceChartOption.series[params.seriesIndex].pieData.value);
          that.deviceChartOption.series[params.seriesIndex].pieStatus.selected = isSelected;
          // 如果本次是选中操作，记录上次选中的扇形对应的系列号 seriesIndex
          isSelected ? selectedIndex = params.seriesIndex : null;
          // 使用更新后的 option，渲染图表
          myChart.setOption(that.deviceChartOption);
        });
        // 监听 mouseover，近似实现高亮（放大）效果
        myChart.on('mouseover', function(params) {
          // 准备重新渲染扇形所需的参数
          let isSelected;
          let isHovered;
          let startRatio;
          let endRatio;
          let k;
          // 如果触发 mouseover 的扇形当前已高亮，则不做操作
          if (hoveredIndex === params.seriesIndex) {
            return;
            // 否则进行高亮及必要的取消高亮操作
          } else {
            // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
            if (hoveredIndex !== '') {
              // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
              isSelected = that.deviceChartOption.series[hoveredIndex].pieStatus.selected;
              isHovered = false;
              startRatio = that.deviceChartOption.series[hoveredIndex].pieData.startRatio;
              endRatio = that.deviceChartOption.series[hoveredIndex].pieData.endRatio;
              k = that.deviceChartOption.series[hoveredIndex].pieStatus.k;
              // 对当前点击的扇形，执行取消高亮操作（对 option 更新）
              that.deviceChartOption.series[hoveredIndex].parametricEquation = that.getParametricEquation(startRatio, endRatio,
                isSelected,
                isHovered, k, that.deviceChartOption.series[hoveredIndex].pieData.value);
              that.deviceChartOption.series[hoveredIndex].pieStatus.hovered = isHovered;
              // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
              hoveredIndex = '';
            }
            // 如果触发 mouseover 的扇形不是透明圆环，将其高亮（对 option 更新）
            if (params.seriesName !== 'mouseoutSeries' && params.seriesName !== 'pie2d') {
              // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
              isSelected = that.deviceChartOption.series[params.seriesIndex].pieStatus.selected;
              isHovered = true;
              startRatio = that.deviceChartOption.series[params.seriesIndex].pieData.startRatio;
              endRatio = that.deviceChartOption.series[params.seriesIndex].pieData.endRatio;
              k = that.deviceChartOption.series[params.seriesIndex].pieStatus.k;
              // 对当前点击的扇形，执行高亮操作（对 option 更新）
              that.deviceChartOption.series[params.seriesIndex].parametricEquation = that.getParametricEquation(startRatio,
                endRatio,
                isSelected, isHovered, k, that.deviceChartOption.series[params.seriesIndex].pieData.value + 5);
              that.deviceChartOption.series[params.seriesIndex].pieStatus.hovered = isHovered;
              // 记录上次高亮的扇形对应的系列号 seriesIndex
              hoveredIndex = params.seriesIndex;
            }
            // 使用更新后的 option，渲染图表
            myChart.setOption(that.deviceChartOption);
          }
        });
        // 修正取消高亮失败的 bug
        myChart.on('globalout', function() {
          // 准备重新渲染扇形所需的参数
          let isSelected;
          let isHovered;
          let startRatio;
          let endRatio;
          let k;
          if (hoveredIndex !== '') {
            // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
            isSelected = that.deviceChartOption.series[hoveredIndex].pieStatus.selected;
            isHovered = false;
            k = that.deviceChartOption.series[hoveredIndex].pieStatus.k;
            startRatio = that.deviceChartOption.series[hoveredIndex].pieData.startRatio;
            endRatio = that.deviceChartOption.series[hoveredIndex].pieData.endRatio;
            // 对当前点击的扇形，执行取消高亮操作（对 option 更新）
            that.deviceChartOption.series[hoveredIndex].parametricEquation = that.getParametricEquation(startRatio, endRatio,
              isSelected,
              isHovered, k, that.deviceChartOption.series[hoveredIndex].pieData.value);
            that.deviceChartOption.series[hoveredIndex].pieStatus.hovered = isHovered;
            // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
            hoveredIndex = '';
          }
          // 使用更新后的 option，渲染图表
          myChart.setOption(that.deviceChartOption);
        });
      },

      /**
       * 配置构建 pieData 饼图数据 internalDiameterRatio:透明的空心占比
       * @param {Object} pieData
       * @param {Object} internalDiameterRatio
       */
      getPie3D(pieData, internalDiameterRatio) {
        let that = this;
        let series = [];
        let sumValue = 0;
        let startValue = 0;
        let endValue = 0;
        let legendData = [];
        let legendBfb = [];
        let k = 1 - internalDiameterRatio;
        pieData.sort((a, b) => {
          return (b.value - a.value);
        });
        // 为每一个饼图数据，生成一个 series-surface(参数曲面) 配置
        for (let i = 0; i < pieData.length; i++) {
          sumValue += pieData[i].value;
          let seriesItem = {
            //系统名称
            name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
            type: 'surface',
            //是否为参数曲面（是）
            parametric: true,
            //曲面图网格线（否）上面一根一根的
            wireframe: {
              show: false
            },
            pieData: pieData[i],
            pieStatus: {
              selected: false,
              hovered: false,
              k: k
            }
          }
          //曲面的颜色、不透明度等样式。
          if (typeof pieData[i].itemStyle != 'undefined') {
            let itemStyle = {};
            typeof pieData[i].itemStyle.color != 'undefined' ? itemStyle.color = pieData[i].itemStyle.color : null;
            typeof pieData[i].itemStyle.opacity != 'undefined' ? itemStyle.opacity = pieData[i].itemStyle.opacity :
              null;
            seriesItem.itemStyle = itemStyle;
          }
          series.push(seriesItem);
        }
        // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
        // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
        legendData = [];
        legendBfb = [];
        for (let i = 0; i < series.length; i++) {
          endValue = startValue + series[i].pieData.value;
          series[i].pieData.startRatio = startValue / sumValue;
          series[i].pieData.endRatio = endValue / sumValue;
          series[i].parametricEquation = this.getParametricEquation(series[i].pieData.startRatio, series[i].pieData
            .endRatio,
            false, false, k, series[i].pieData.value);
          startValue = endValue;
          let bfb = that.fomatFloat(series[i].pieData.value / sumValue, 4);
          legendData.push({
            name: series[i].name,
            value: bfb
          });
          legendBfb.push({
            name: series[i].name,
            value: bfb
          });
        }
        //(第二个参数可以设置你这个环形的高低程度)
        let boxHeight = this.getHeight3D(series, 15); //通过传参设定3d饼/环的高度
        let option = {
          //图例组件
          legend: {
            show: true,
            bottom: 10,
            data: legendData,
            //图例列表的布局朝向。
            orient: 'horizontal',
            //图例文字每项之间的间隔
            itemGap: 15,
            textStyle: {
              color: '#A1E2FF',
            },
            //icon: "circle",
            // formatter: (name) => {
            //   var target;
            //   for (var i = 0, l = pieData.length; i < l; i++) {
            //     if (pieData[i].name == name) {
            //       target = pieData[i].value;
            //     }
            //   }
            //   return `${name}: ${target}`;
            // }
            // 这个可以显示百分比那种（可以根据你想要的来配置）
            //   formatter: function(param) {
            //       let item = legendBfb.filter(item => item.name == param)[0];
            //       let bfs = that.fomatFloat(item.value * 100, 2) + "%";
            //       console.log(item.name)
            //       return `${item.name} :${bfs}`;
            //   }
          },
          //移动上去提示的文本内容
          tooltip: {
            formatter: params => {
              if (params.seriesName !== 'mouseoutSeries' && params.seriesName !== 'pie2d') {
                return `${params.seriesName}<br/>` +
                  `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>` +
                  `${ option.series[params.seriesIndex].pieData.value }`;
              }
            }
          },
          //这个可以变形
          xAxis3D: {
            min: -1,
            max: 1
          },
          yAxis3D: {
            min: -1,
            max: 1
          },
          zAxis3D: {
            min: -1,
            max: 1
          },
          //此处是修改样式的重点
          grid3D: {
            show: false,
            boxHeight: boxHeight, //圆环的高度
            top: -40,
            //这是饼图的位置
            viewControl: { //3d效果可以放大、旋转等，请自己去查看官方配置
              alpha: 30, //角度(这个很重要 调节角度的)
              distance: 150, //调整视角到主体的距离，类似调整zoom(这是整体大小)
              rotateSensitivity: 1, //设置为0无法旋转
              zoomSensitivity: 0, //设置为0无法缩放
              panSensitivity: 1, //设置为0无法平移
              autoRotate: true //自动旋转
            }
          },
          series: series
        };
        return option;
      },
      /**
       * 获取3d图的最高扇区的高度
       * @param {Object} series
       * @param {Object} height
       */
      getHeight3D(series, height) {
        series.sort((a, b) => {
          return (b.pieData.value - a.pieData.value)
        })
        let h = height * 25 / series[0].pieData.value
        return h > 100 ? 25 : h
      },

      // 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
      getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, h) {
        // 计算
        let midRatio = (startRatio + endRatio) / 2;
        let startRadian = startRatio * Math.PI * 2;
        let endRadian = endRatio * Math.PI * 2;
        let midRadian = midRatio * Math.PI * 2;
        // 如果只有一个扇形，则不实现选中效果。
        if (startRatio === 0 && endRatio === 1) {
          isSelected = false;
        }
        // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
        k = typeof k !== 'undefined' ? k : 1 / 3;
        // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
        let offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0;
        let offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0;
        // 计算高亮效果的放大比例（未高亮，则比例为 1）
        let hoverRate = isHovered ? 1.05 : 1;
        // 返回曲面参数方程
        return {
          u: {
            min: -Math.PI,
            max: Math.PI * 3,
            step: Math.PI / 32
          },
          v: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20
          },
          x: (u, v) => {
            if (u < startRadian) {
              return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            if (u > endRadian) {
              return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
          },
          y: (u, v) => {
            if (u < startRadian) {
              return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            if (u > endRadian) {
              return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
          },
          z: (u, v) => {
            if (u < -Math.PI * 0.5) {
              return Math.sin(u);
            }
            if (u > Math.PI * 2.5) {
              return Math.sin(u) * h * .1;
            }
            return Math.sin(v) > 0 ? 1 * h * .1 : -1;
          }
        };
      },

      /**
       * 自定义计算的方法
       * @param {Object} num
       * @param {Object} n
       */
      fomatFloat(num, n) {
        var f = parseFloat(num);
        if (isNaN(f)) {
          return false;
        }
        f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n); // n 幂
        var s = f.toString();
        var rs = s.indexOf('.');
        //判定如果是整数，增加小数点再补0
        if (rs < 0) {
          rs = s.length;
          s += '.';
        }
        while (s.length <= rs + n) {
          s += '0';
        }
        return s;
      },

      checkHotel(){
        return this.myDeviceId['KF'] || this.myDeviceId['VM'] || this.myDeviceId['BD']
      }
    }
  }
</script>

<style lang="scss">
  .app-main {
    &.is-home {
      background-color: #001536;
      background-image: url('../../assets/home_bg.png');
      background-size: 100%;
    }
  }
</style>
<style lang="scss" scoped>
  .home-box {
    margin: -2px 2px 0;
    padding-top: 2px;
    border: 2px solid #1166B1;
    .quadrangle{
      width: 102px;
      height: 102px;
      z-index: 1099;
      &.tl{
        top: 0;
        left: -6px;
      }
      &.tr{
        top: 0;
        right: -6px;
        transform: rotate(90deg);
      }
      &.bl{
        bottom: -6px;
        left: -6px;
        transform: rotate(-90deg);
      }
      &.br{
        bottom: -6px;
        right: -6px;
        transform: rotate(180deg);
      }
      /deep/ .el-image__placeholder{
        display: none;
      }
    }
    .pieces{
      width: 23px;
      height: 231px;
      bottom: 296px;
      &.l{
        left: -23px;
      }
      &.r{
        transform: rotate(180deg);
        right: -23px;
      }
      /deep/ .el-image__placeholder{
        display: none;
      }
    }

    .blur-box{
      height: 213px;
      width: calc(100% - 40px);
      left: 20px;
      background: linear-gradient(180deg, rgba(0, 43, 81, 0) 0%, #002B51 100%);
      filter: blur(15px);
      transform: perspective(20px) rotateX(-1deg);
    }
  }

  .baby-blue {
    color: #08EFF0;
  }

  .y-yellow {
    color: #FFD21D;
  }

  .stat-box {
    padding-top: 40px;
    z-index: 3;

    .abs {
      z-index: 3;
    }

    .dodge-icon {
      margin: 12px auto 0;
      width: 154px;
      height: 167px;

      &.b {
        animation: animateDodgeB 1s linear infinite;
      }

      &.y {
        animation: animateDodgeY 1s linear infinite;
      }
    }

    .type-icon {
      width: 72px;
      height: 72px;
      /deep/ .el-image__placeholder{
        display: none;
      }
    }
  }

  @keyframes animateDodgeB {
    0% {
      background: url('../../assets/home/blue_dodge_05.svg') 100%;
    }

    45% {
      background: url('../../assets/home/blue_dodge_05.svg') 100%;
    }

    50% {
      background: url('../../assets/home/blue_dodge_1.svg') 100%;
    }

    95% {
      background: url('../../assets/home/blue_dodge_1.svg') 100%;
    }

    100% {
      background: url('../../assets/home/blue_dodge_05.svg') 100%;
    }
  }

  @keyframes animateDodgeY {
    0% {
      background: url('../../assets/home/yellow_dodge_05.svg') 100%;
    }

    45% {
      background: url('../../assets/home/yellow_dodge_05.svg') 100%;
    }

    50% {
      background: url('../../assets/home/yellow_dodge_1.svg') 100%;
    }

    95% {
      background: url('../../assets/home/yellow_dodge_1.svg') 100%;
    }

    100% {
      background: url('../../assets/home/yellow_dodge_05.svg') 100%;
    }
  }

  .trapezoid-box {
    margin-top: -58px;

    .trapezoid {
      margin: 0 calc(100vw * 0.01);
      height: 54px;
      background: linear-gradient(180deg, #071A34 0%, #11356F 100%);
      transform: perspective(20px) rotateX(1deg);
    }

    .trapezoid-strip {
      height: 11px;
      background: #0C234F;
    }
  }

  .btn-box {
    .btn {
      margin-right: -1px;
      padding: 7px 16px;
      background: rgba(17, 102, 177, 0.1);
      border: 1px solid #1166B1;
      color: rgba(255, 255, 255, 0.8);

      &.act {
        box-shadow: inset 0 0 12px #1166B1;
        color: #1CB9FB;
      }
    }
  }

  .two-box,
  .three-box {
    .item-box {
      height: 100%;
      border: 2px solid #1166B1;

      .line {
        margin-right: 8px;
        width: 5px;
        height: 20px;
        background: #1CB9FB;
      }

      .progress {
        margin: 25px;
        padding: 3px;
        border: 1px solid #38E5A5;
        border-radius: 42px;

        /deep/ .el-progress-bar__outer {
          background: none;
        }

        /deep/ .el-progress-bar__inner {
          background: linear-gradient(90deg, #38E5A5 0%, #FEF880 100%);
        }
      }

      /deep/ .el-carousel__indicators {
        display: none;
      }

      .label {
        >div {
          margin: 25px 0;
          height: 20px;
          line-height: 20px;
        }
      }
    }
  }

  .store-table, .order-table {
    /deep/ &.el-table {
      &::before {
        height: 0;
      }
      tbody tr:hover>td {
        background: none !important
      }
      tbody tr {
        &:last-child {
          td {
            border: none
          }
        }
      }
    }
  }
  .order-table{
    .idx{
      width: 20px;
      height: 20px;
      border-radius: 47px;
      line-height: 20px;
      color: #0A1B36;
      background: #FC5354;
      &.idx_1{
        background: #F59A23;
      }
      &.idx_2{
        background: #FFFF00;
      }
    }
    /deep/ &.el-table {
      tr{
        height: 40px;
        &:nth-child(2n){
          background: none !important;
        }
        td{
          padding: 0;
        }
      }
      .gutter{
        display: none;
      }
      .el-table__body-wrapper::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
  }

  .three-box {
    .item-box {
      .box-grey {
        background: rgba(17, 102, 177, 0.1);
        border: 1px solid #1166B1;

        /deep/ .el-input__inner {
          background: none;
          border: none;
        }
      }
    }
  }




  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 2px;
    background: rgba(60, 161, 254, 0.1);
  }

  .brand-box {
    height: 36px;
    line-height: 36px;

    /deep/ .el-input__inner {
      height: 36px;
      border: none;
    }

    /deep/ .el-button {
      padding: 10px;
      border-radius: 0;
    }
  }

  .data-contrast {
    height: 270px;

    .bar {
      margin: 5px auto 8px;
      width: 25px;
      height: 117px;
      background: var(--olive);
      border-radius: 2px;

      &.high {
        height: 144px;
      }

      &.cyan {
        background: var(--cyan);
      }
    }
  }

  .chart-device {
    margin-top: -10px;
  }

  @media (max-width: 768px) {
    .chart-device {
      margin-top: 0;
      width: calc(100vw - 40px);
    }

    .chart-daystat {
      width: calc(100vw - 50px);
    }

    .el-row--flex {
      flex-wrap: wrap;
    }
  }

  .tool-item {
    height: 100%;
  }

  /** 主题房 */
  .room-box {
    padding: 1px;
    .item {
      margin: -1px;
      min-width: 100px;
      border: 2px solid #1166B1;

      &:hover {
        color: var(--olive);
      }
    }
  }
</style>
