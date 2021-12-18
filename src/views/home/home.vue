<template>
  <div class="home-box">
    <el-row :gutter="device === 'mobile' ? 10 : 20">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/money/dayMoney`})">
          <div>总交易额</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="fs-b5 text-black">￥</div>
              <div class="mr-10 fs-b5 text-black"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center">
              <finance theme="outline" size="27" fill="#3CA1FE"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/order`})">
          <div>总订单数</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(255, 163, 43, 0.1)">
              <transaction-order theme="outline" size="27" fill="#FFA32B"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/device`})">
          <div>总设备数</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(7, 193, 96, 0.1)">
              <server theme="outline" size="27" fill="#07C160"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="o-v p-15 card-panel cursor bg-white" @click="$router.push({path: `/userManage`})">
          <div>总用户数</div>
          <div class="flex align-center line-1">
            <div class="flex1 flex align-center">
              <div class="mr-10 fs-b5"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
              <i class="iconfont icon-right fs-s1"></i>
            </div>
            <div class="stat-icon flex align-center justify-center" style="background: rgba(255, 83, 83, 0.1)">
              <peoples theme="outline" size="27" fill="#FF5353"/>
            </div>
          </div>
          <div class="flex align-center">
            <div>今日</div>
            <div class="ml-5 mr-5 text-danger"><count-to :start-val="0" :end-val="delComma(totalStat.total_order_amount)" :duration="2600" :decimals="2"/></div>
            <div class="iconfont icon-shangsheng fs-s1 text-danger"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="device === 'mobile' ? 10 : 20" class="mt-15">
      <el-col :xs="24" :sm="16" :lg="18">
          <el-scrollbar class="bg-white">
            <div class="flex align-center brand-box white-space" @click="">
              <div class="pl-10 pr-10">全部品牌</div>
              <div class="pl-10 pr-10" v-for="item in 20">充电鸭</div>
            </div>
          </el-scrollbar>
      </el-col>
      <el-col :xs="24" :sm="8" :lg="6">
        <div class="flex align-center brand-box bg-white">
          <el-input placeholder="请输入品牌名进行搜索" v-model="form.brand_name" class="input-with-select"></el-input>
          <el-button icon="el-icon-search" type="primary"></el-button>
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
          <div class="mt-20 flex justify-around text-center">
            <div class="flex align-end">
              <div class="mr-5">
                <div class="fs-s2">{{ contrast_type == 0 ? '￥3,145' : contrast_type == 1 ? 1200 : '￥8'}}</div>
                <div class="bar"></div>
                <div>今日</div>
              </div>
              <div>
                <div class="fs-s2">{{ contrast_type == 0 ? '￥3,145' : contrast_type == 1 ? 1200 : '￥8'}}</div>
                <div class="bar high cyan"></div>
                <div>昨日</div>
              </div>
            </div>
            <div class="flex align-end">
              <div class="mr-5">
                <div class="fs-s2">{{ contrast_type == 0 ? '￥3,145' : contrast_type == 1 ? 1200 : '￥8'}}</div>
                <div class="bar"></div>
                <div>本周</div>
              </div>
              <div>
                <div class="fs-s2">{{ contrast_type == 0 ? '￥3,145' : contrast_type == 1 ? 1200 : '￥8'}}</div>
                <div class="bar high cyan"></div>
                <div>上周</div>
              </div>
            </div>
            <div class="flex align-end">
              <div class="mr-5">
                <div class="fs-s2">{{ contrast_type == 0 ? '￥3,145' : contrast_type == 1 ? 1200 : '￥8'}}</div>
                <div class="bar"></div>
                <div>本月</div>
              </div>
              <div>
                <div class="fs-s2">{{ contrast_type == 0 ? '￥3,145' : contrast_type == 1 ? 1200 : '￥8'}}</div>
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
                <el-dropdown-item v-for="(item, index) in day_type_arr" @click.native="day_type = index">{{ item }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <div class="ml-15 box-grey">
              <el-date-picker
                class="range-day"
                  v-model="form.day"
                  type="daterange"
                  size="small"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
                </el-date-picker>
            </div>
          </div>
          <div class="chart-daystat" ref="chart_daystat" style="height: 508px;"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { delComma } from '@/utils/index'
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
        deviceChartData: [
          {
            "device_type": 1,
            "value": 6000,
            "name": "密码线"
          },
          {
            "device_type": 0,
            "value": 0,
            "name": "充电宝"
          },
          {
            "device_type": 7,
            "value": 0,
            "name": "套套机"
          },
          // {
          //   "device_type": 3,
          //   "value": 24,
          //   "name": "充电桩"
          // },
          {
            "device_type": 8,
            "value": 0,
            "name": "加湿器"
          },
          // {
          //   "device_type": 4,
          //   "value": 75,
          //   "name": "洗衣机"
          // }
        ],

        day_type_arr: ['近7天', '本周', '上周', '本月', '上月'],
        day_type: 0,
        contrast_arr: ['交易额', '订单量', '客单价'],
        contrast_type: 0
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      deviceNameObj() {
        return this.$store.getters.deviceNameObj
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      rests() {
        return this.$store.getters.rests
      }
    },
    created() {

    },
    mounted() {
      this.deviceChart()

      this.dayChart({
        "dayArr": [
          "11-19",
          "11-20",
          "11-21",
          "11-22",
          "11-23",
          "11-24",
          "11-25"
        ],
        "day_order_amount": [
          10515.23,
          14484.7,
          13969.25,
          10455.24,
          11234.67,
          11622.14,
          9078.13
        ],
        "day_order_num": [
          3074,
          3655,
          3430,
          2995,
          2989,
          3496,
          2276
        ],
        "day_average_order_num": [
          "3,130.71",
          "3,130.71",
          "3,130.71",
          "3,130.71",
          "3,130.71",
          "3,130.71",
          "3,130.71"
        ],
        "day_average_order_amount": [
          11622.75,
          11622.75,
          11622.75,
          11622.75,
          11622.75,
          11622.75,
          11622.75
        ]
      })
    },
    methods: {
      /**
       * 获取饼状图数据
       */
      getEquipData() {
        return
        this.$get('agentapi/my_type_device_data', {
          device_type: this.device_type,
          search_agent_id: this.search_agent_id
        }).then(res => {
          this.equipData = res
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

      /**
       * 图表初始化
       */
      dayChart(chartData) {
        this.dayChartInit = echarts.init(this.$refs.chart_daystat)
        this.dayChartOptions(chartData)
      },

      /**
       * 图表设置数据
       */
      dayChartOptions({
        dayArr,
        day_order_amount,
        day_order_num,
        day_average_order_num,
        day_average_order_amount
      } = {}) {
        if (!dayArr) return
        let legend = ['交易额', '订单量', '平均单量', '平均交易额'],
          series = [
            {
              name: '交易额',
              type: 'line',
              data: day_order_amount,
              animationDuration: 2800,
              animationEasing: 'cubicInOut',
            },
            {
              name: '订单量',
              type: 'line',
              data: day_order_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '平均单量',
              type: 'line',
              data: day_average_order_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '平均交易额',
              type: 'line',
              data: day_average_order_amount,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        this.dayChartInit.setOption({
          color: ['#3CA1FE', '#FFA32B', '#07C160', '#FF5353'],
          xAxis: {
            data: dayArr,
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

</style>
