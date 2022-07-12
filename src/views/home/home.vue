<template>
  <div class="pb-30 home-box">
    <el-row :gutter="device === 'mobile' ? 10 : 20">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/money/monthMoney`})">
          <div>总交易额</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="fs-b5 text-black">￥</div>
              <div class="mr-10 fs-b5 text-black"><count-to :start-val="0" :end-val="delComma(orderStat.orderAmount)" :duration="2600" :decimals="2"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center">
              <finance theme="outline" size="27" fill="#3CA1FE"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(orderStat.todayAmount)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" v-if="Ability['order']">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/order`})">
          <div>总订单数</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(orderStat.orderNumber)" :duration="2600"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(255, 163, 43, 0.1)">
              <transaction-order theme="outline" size="27" fill="#FFA32B"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(orderStat.todayNumber)" :duration="2600"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: isSaas() ? `/device` : `/device`})">
          <div>总设备数</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(deviceStat.deviceNumber)" :duration="2600"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(7, 193, 96, 0.1)">
              <server theme="outline" size="27" fill="#07C160"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(totalStat.todayDeviceNumber)" :duration="2600"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" v-if="isSaas()">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/userManage`})">
          <div>总用户数</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(userStat.userNumber)" :duration="2600"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(255, 83, 83, 0.1)">
              <peoples theme="outline" size="27" fill="#FF5353"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(userStat.todayNumber)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6" v-if="!isSaas()">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/money`})">
          <div>总收益</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(orderStat.orderDivide)" :duration="2600" :decimals="2"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(255, 83, 83, 0.1)">
              <peoples theme="outline" size="27" fill="#FF5353"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(orderStat.todayDivide)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="device === 'mobile' ? 10 : 20" class="mt-15">
      <el-col :xs="24" :sm="10" :lg="8">
        <div class="pl-15 pr-15 pt-10 pb-15 data-contrast bg-white">
          <div class="flex align-center">
            <div class="flex1 text-black">交易数据对比</div>
            <el-dropdown>
              <div class="flex align-center pl-10 pr-10 box-grey cursor text-primary">
                {{ contrast_arr[contrast_type] }}<i class="el-icon-arrow-down el-icon--right fs-s1"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in contrast_arr" @click.native="contrast_type = index">{{ item }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="mt-20 flex justify-around text-center" v-if="querHistogram.today">
            <div class="flex align-end">
              <div class="mr-5">
                <div class="fs-s2">{{ contrast_type == 0 ? querHistogram.today.amount : contrast_type == 1 ? querHistogram.today.orderNumber : querHistogram.today.unitPrice}}</div>
                <div class="bar"></div>
                <div>今日</div>
              </div>
              <div>
                <div class="fs-s2">{{ contrast_type == 0 ? querHistogram.yesterday.amount : contrast_type == 1 ? querHistogram.yesterday.orderNumber : querHistogram.yesterday.unitPrice}}</div>
                <div class="bar high cyan"></div>
                <div>昨日</div>
              </div>
            </div>
            <div class="flex align-end">
              <div class="mr-5">
                <div class="fs-s2">{{ contrast_type == 0 ? querHistogram.week.amount : contrast_type == 1 ? querHistogram.week.orderNumber : querHistogram.week.unitPrice}}</div>
                <div class="bar"></div>
                <div>本周</div>
              </div>
              <div>
                <div class="fs-s2">{{ contrast_type == 0 ? querHistogram.lastWeek.amount : contrast_type == 1 ? querHistogram.lastWeek.orderNumber : querHistogram.lastWeek.unitPrice}}</div>
                <div class="bar high cyan"></div>
                <div>上周</div>
              </div>
            </div>
            <div class="flex align-end">
              <div class="mr-5">
                <div class="fs-s2">{{ contrast_type == 0 ? querHistogram.month.amount : contrast_type == 1 ? querHistogram.month.orderNumber : querHistogram.month.unitPrice}}</div>
                <div class="bar"></div>
                <div>本月</div>
              </div>
              <div>
                <div class="fs-s2">{{ contrast_type == 0 ? querHistogram.lastMonth.amount : contrast_type == 1 ? querHistogram.lastMonth.orderNumber : querHistogram.lastMonth.unitPrice}}</div>
                <div class="bar high cyan"></div>
                <div>上月</div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-20 pl-15 pr-15 pt-10 pb-10 data-contrast bg-white">
          <div class="text-black">设备数据统计</div>
          <div class="chart-device" ref="chart_device" style="height: 250px;"></div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="14" :lg="16">
        <div class="pl-15 pr-15 pt-10 pb-10 bg-white">
          <div class="flex align-center">
            <div class="flex1 text-black">近期数据对比</div>
            <el-dropdown>
              <div class="flex align-center pl-10 pr-10 box-grey cursor text-primary white-space">
                {{ day_type_arr[day_type] }}<i class="el-icon-arrow-down el-icon--right fs-s1"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in day_type_arr" @click.native="day_type = index; getLineChart()">{{ item }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <div class="ml-15 box-grey">
              <el-date-picker
                class="range-day"
                  v-model="form.date"
                  type="daterange"
                  size="small"
                  range-separator="-"
                  value-format="timestamp"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="pickerOptionsEnd"
                  @change="getLineChart()">
                </el-date-picker>
            </div>
          </div>
          <div class="chart-daystat" ref="chartDay" style="height: 508px;"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="device === 'mobile' ? 10 : 20" class="mt-15" v-if="(myDeviceId['KF'] || myDeviceId['VM']) && isStore()">
      <el-col :xs="24" :sm="10" :lg="8">
        <div class="pl-15 pr-15 pt-10 pb-10 bg-white" @click="$router.push({path: `/hotelTools`})">
          <div class="flex align-center">
            <div class="flex1 text-black">酒店功能区</div>
            <div class="flex align-center pl-10 pr-10 box-grey cursor text-primary">
              去管理<i class="el-icon-arrow-right fs-s1"></i>
            </div>
          </div>
          <el-carousel height="80px" direction="vertical" arrow="never">
            <el-carousel-item v-for="item in tool" :key="item">
              <div class="tool-item flex align-center cursor">
                <div class="flex1">
                  <div class="fs-a1 text-black">{{ item.title }}</div>
                  <div class="mt-5 text-gray fs-s4">{{ item.desc }}</div>
                </div>
                <i class="el-icon-arrow-right fs-c1"></i>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </el-col>
      <el-col :xs="24" :sm="14" :lg="16">

      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { arrayToObj, delComma, parseTime, currentTime } from '@/utils/index'
  import DateUtil from '@/utils/date'
  import CountTo from 'vue-count-to'

  import { Finance, TransactionOrder, Server, Peoples } from '@icon-park/vue'

  import * as echarts from 'echarts/lib/echarts'
  import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { PieChart, LineChart } from 'echarts/charts'
  import { LabelLayout } from 'echarts/features'
  import { CanvasRenderer } from 'echarts/renderers'
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
        delComma: delComma,
        totalStat: {},
        form: {},
        orderStat: {},
        deviceStat: {},
        userStat: {},
        querHistogram: {},

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

        tool: [
          {
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
        ]
      }
    },
    computed: {
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
      if(this.isSaas()) this.getUserStat()
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
          this.querHistogram = res
        })
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
       * 设备统计
       */
      getDeviceStat() {
        this.$get('iot-saas-device/admin/device/count/queryByUser').then(res => {
          this.deviceStat = res
          let deviceChartData = []
          if(res.deviceTypeDetail){
            for(var i in res.deviceTypeDetail){
              deviceChartData.push({
                "value": res.deviceTypeDetail[i].deviceNumber,
                "name": this.myDeviceId[i.substr(0, 2)]
              })
            }
            if(deviceChartData.length > 0){
              this.deviceChartData = deviceChartData
            }
          }
          this.deviceChart()
        })
      },

      /**
       * 近期数据对比
       */
      getLineChart(){
        let eTime = currentTime(),
          sTime = eTime - (6 * 86400),
          groupDate = [],
          amount = [],
          orderNumber = [],
          doneOrderNumber = [],
          unitPrice = [],
          params = {}

        if(this.day_type == 1){
          sTime = DateUtil.getWeekStartDate()
          eTime = DateUtil.getWeekEndDate()
        }else if(this.day_type == 2){
          sTime = DateUtil.getLastWeekStartDate()
          eTime = DateUtil.getLastWeekEndDate()
        }else if(this.day_type == 3){
          sTime = DateUtil.getMonthStartDate()
          eTime = DateUtil.getMonthEndDate()
        }else if(this.day_type == 4){
          sTime = DateUtil.getLastMonthStartDate()
          eTime = DateUtil.getLastMonthEndDate()
        }else if(this.form.date){
          sTime = this.form.date[0] / 1000
          eTime = this.form.date[1] / 1000
        }
        params = {
          brandID: this.brandId,
          startDateStr: parseTime(sTime, '{y}-{m}-{d}'),
          endDateStr: parseTime(eTime, '{y}-{m}-{d}')
        }
        this.$get('iot-saas-order/admin/order/count/queryLineChart', params).then(res => {
          let obj = arrayToObj(res, 'countGroupDate')
          for(var i = sTime; i < (eTime + 86400); i = i + 86400){
            groupDate.push(parseTime(i, '{m}-{d}'))
            let ymd = parseTime(i, '{y}-{m}-{d}')
            if(obj[ymd] && obj[ymd].countGroupDate == ymd){
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
          if(this.dayChartInit){
            this.dayChartOptions({
              groupDate,
              amount,
              orderNumber,
              doneOrderNumber,
              unitPrice,
            })
          }else{
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
          series = [
            {
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
            }
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
            type: 'value'
          },
          legend: {
            bottom: 20,
            data: legend,
            lineStyle: {
              width: 0
            }
          },
          series: series
        })
      },


      /**
       * 设备图表初始化
       */
      deviceChart() {
        this.deviceChartInit = echarts.init(this.$refs.chart_device)
        this.deviceChartOptions()
      },

      /**
       * 设备图表设置数据
       */
      deviceChartOptions() {
        const that = this
        this.deviceChartInit.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
          },
          color: this.deviceChartColor,
          series: [{
            type: 'pie',
            radius: ['55%', '83%'],
            center: ['55%', '50%'],
            label: { // 饼图图形上的文本标签
              normal: {
                show: true,
                lineHeight: 20,
                postion: 'outer',
                // margin: '20%',
                textStyle: {
                  fontWeight: 300,
                  fontSize: 12 // 文字的字体大小
                },
                formatter: '{b}（{d}%）' // {b}\n
              }
            },
            labelLine: {
              normal: {
                smooth: 0.2,
                length: 8,
                length2: 15,
              }
            },
            data: that.deviceChartData
          }]
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .stat-icon{
    width: 48px;
    height: 48px;
    border-radius: 2px;
    background: rgba(60, 161, 254, 0.1);
  }
  .brand-box{
    height: 36px;
    line-height: 36px;
    /deep/ .el-input__inner{
      height: 36px;
      border: none;
    }
    /deep/ .el-button{
      padding: 10px;
      border-radius: 0;
    }
  }
  .data-contrast{
    height: 270px;
    .bar{
      margin: 5px auto 8px;
      width: 25px;
      height: 117px;
      background: var(--olive);
      border-radius: 2px;
      &.high{
        height: 144px;
      }
      &.cyan{
        background: var(--cyan);
      }
    }
  }
  .chart-device{
    margin-top: -10px;
  }
  @media (max-width: 768px) {
    .chart-device{
      margin-top: 0;
      width: calc(100vw - 40px);
    }
    .chart-daystat{
      width: calc(100vw - 50px);
    }
  }

  .tool-item{
    height: 100%;
  }
</style>
