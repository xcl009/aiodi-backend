<template>
  <div>
    <el-row>
      <el-col :md="{span: 24}" :lg="{span: 12}">
        <div id="pieChart" ref="pieChart" style="height: 450px;"></div>
      </el-col>
      <el-col :md="{span: 24}" :lg="{span: 12}" class="flex align-center">
        <div class="pb-30 pl-30 flex1">
          <div class="mb-30 mt-10 mr-30 text-right">
            <el-radio-group v-model="percentType" size="medium">
              <el-radio-button label="0">交易额</el-radio-button>
              <el-radio-button label="1">订单量</el-radio-button>
            </el-radio-group>
          </div>
          <div v-for="item in timeArr" class="mt-20 el-progress flex align-center">
            <div class="fs-s3">{{ item.title }}</div>
            <el-progress
              class="ml-10 mr-10 flex1"
              :class="item.bg"
              :text-inside="true"
              :stroke-width="40"
              :format="_progressFormat(percentType == 0 ? item.percent_money : item.percent_order)"
              :percentage="percentType == 0 ? (item.percent_money > 100 ? 100 : item.percent_money) : (item.percent_order > 100 ? 100 : item.percent_order)"
              :color="item.color"
            />
            <div v-if="percentType == 0" style="width: 140px;" class="pr-10 fs-s4"><count-to :start-val="0" :end-val="delComma(item.money)" :duration="2600" :decimals="2"/>元</div>
            <div v-if="percentType == 1" style="width: 140px;" class="pr-10 fs-s4"><count-to :start-val="0" :end-val="item.order_num" :duration="2600"/>单</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div v-show="false">{{ deviceNameObj }}</div>
  </div>

</template>

<script>
import echarts from 'echarts'
import CountTo from 'vue-count-to'
import { delComma, countPer, colorPalette } from '@/utils/index'
require('echarts/theme/macarons') // echarts theme

export default {
  components: {
    CountTo
  },
  props: {

  },
  data() {
    return {
      colorPalette: colorPalette(),

      delComma: delComma,
      chart: null,
      // 饼状图
      device_type: -1,
      equipData: {},
      chartData: [
        {
            "device_type": 8,
            "value": 0,
            "name": "加湿器"
        },
        {
            "device_type": 7,
            "value": 0,
            "name": "套套机"
        },
        {
            "device_type": 0,
            "value": 2360,
            "name": "充电宝"
        },
        {
            "device_type": 1,
            "value": 64654,
            "name": "密码线"
        },
        {
            "device_type": 2,
            "value": 1,
            "name": "按摩枕"
        },
        {
            "device_type": 3,
            "value": 24,
            "name": "充电桩"
        },
        {
            "device_type": 4,
            "value": 75,
            "name": "洗衣机"
        },
        {
            "device_type": 6,
            "value": 1,
            "name": "电吹风"
        }
      ],
      chartTitle: [],

      percentType: '0',
      timeArr: [
        {
            "money": 9078.13,
            "percent_money": 0.37,
            "order_num": 2276,
            "percent_order": 0.5,
            "title": "今日",
            "bg": "progress1",
            "color": "rgba(2015,154,255,1)"
        },
        {
            "money": 11622.14,
            "percent_money": 0.48,
            "order_num": 3496,
            "percent_order": 0.76,
            "title": "昨日",
            "bg": "progress2",
            "color": "rgba(2015,154,255,1)"
        },
        {
            "money": 42390.18,
            "percent_money": 1.75,
            "order_num": 11756,
            "percent_order": 2.57,
            "title": "本周",
            "bg": "progress3",
            "color": "rgba(151,161,254,1)"
        },
        {
            "money": 84081.24,
            "percent_money": 3.47,
            "order_num": 22592,
            "percent_order": 4.94,
            "title": "上周",
            "bg": "progress4",
            "color": "rgba(59,183,254,1)"
        },
        {
            "money": 291720.42,
            "percent_money": 12.04,
            "order_num": 77865,
            "percent_order": 17.03,
            "title": "本月",
            "bg": "progress1",
            "color": "rgba(237,134,140,1)"
        },
        {
            "money": 386966.91,
            "percent_money": 15.97,
            "order_num": 76195,
            "percent_order": 16.66,
            "title": "上月",
            "bg": "progress2",
            "color": "rgba(2015,154,255,1)"
        }
      ],

      money: {},

      search_agent_id: 0
    }
  },
  computed: {
    deviceNameObj(){
      this.getEquipData()
      return this.$store.getters.deviceNameObj
    },
    deviceKeyObj(){
      return this.$store.getters.deviceKeyObj
    },
    agentInfo(){
      return this.$store.state.user.agentInfo
    },
  },
  mounted() {

    this.initChart([
        "#95706d",
        "#97b552",
        "#2ec7c9",
        "#b6a2de",
        "#5ab1ef",
        "#ffb980",
        "#d87a80",
        "#e5cf0d"
    ])
    //this.getMoney()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    _progressFormat(value) {
      return () => {
        return value + '%'
      }
    },

    /**
     * 可提现金额
     */
    getMoney() {
      this.$get('agentapi/index').then(res => {
        this.money = res
      })
    },

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
        if (this.chartData.length == 0) {
          let goodsKey = this.config.goods_key, colorArr = []
          for (var i in this.deviceNameObj) {
            let key = goodsKey[this.deviceNameObj[i]] + '_num'
            this.chartData.push({
              device_type: this.deviceNameObj[i],
              value: res[key] || 0,
              name: this.deviceKeyObj[this.deviceNameObj[i]]
            })
            colorArr.push(this.colorPalette[this.deviceNameObj[i]])
            // if (res[this.equipKey[i]] == 0) {
            //   this.chartData[i].label = {
            //     show: false
            //   }
            // }
          }
          this.$nextTick(() => {
            this.initChart(colorArr)
          })
        }
        const timeArr = []
        timeArr.push({
          money: res.type_order_today_amount,
          percent_money: countPer(res.type_order_today_amount, res.type_order_total_amount),
          order_num: res.type_order_today_num,
          percent_order: countPer(res.type_order_today_num, res.type_order_total_num),
          title: '今日',
          bg: 'progress1',
          color: 'rgba(2015,154,255,1)'
        })
        timeArr.push({
          money: res.type_order_yesterday_amount,
          percent_money: countPer(res.type_order_yesterday_amount, res.type_order_total_amount),
          order_num: res.type_order_yesterday_num,
          percent_order: countPer(res.type_order_yesterday_num, res.type_order_total_num),
          title: '昨日',
          bg: 'progress2',
          color: 'rgba(2015,154,255,1)'
        })
        timeArr.push({
          money: res.type_order_this_week_amount,
          percent_money: countPer(res.type_order_this_week_amount, res.type_order_total_amount),
          order_num: res.type_order_this_week_num,
          percent_order: countPer(res.type_order_this_week_num, res.type_order_total_num),
          title: '本周',
          bg: 'progress3',
          color: 'rgba(151,161,254,1)'
        })
        timeArr.push({
          money: res.type_order_last_week_amount,
          percent_money: countPer(res.type_order_last_week_amount, res.type_order_total_amount),
          order_num: res.type_order_last_week_num,
          percent_order: countPer(res.type_order_last_week_num, res.type_order_total_num),
          title: '上周',
          bg: 'progress4',
          color: 'rgba(59,183,254,1)'
        })
        timeArr.push({
          money: res.type_order_this_month_amount,
          percent_money: countPer(res.type_order_this_month_amount, res.type_order_total_amount),
          order_num: res.type_order_this_month_num,
          percent_order: countPer(res.type_order_this_month_num, res.type_order_total_num),
          title: '本月',
          bg: 'progress1',
          color: 'rgba(237,134,140,1)'
        })
        timeArr.push({
          money: res.type_order_last_month_amount,
          percent_money: countPer(res.type_order_last_month_amount, res.type_order_total_amount),
          order_num: res.type_order_last_month_num,
          percent_order: countPer(res.type_order_last_month_num, res.type_order_total_num),
          title: '上月',
          bg: 'progress2',
          color: 'rgba(2015,154,255,1)'
        })
        this.timeArr = timeArr
      })
    },

    /**
     * 图表初始化
     */
    initChart(colorArr) {
      this.chart = echarts.init(this.$refs.pieChart, 'macarons')
      this.setOptions(colorArr)
    },

    /**
     * 图表设置数据
     */
    setOptions(colorArr) {
      const that = this
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        },
        legend: {
          show: false,
          top: 20,
          left: 20,
          itemGap: 15,
          itemWidth: 15,
          itemHeight: 15,
          textStyle: {
            fontSize: 14,
            padding: [2, 0, 0, 0]
          }
        },
        color: colorArr,
        series: [{
          type: 'pie',
          radius: ['35%', '55%'],
          //top: 50,
          //selectedMode: 'single',
          label: { // 饼图图形上的文本标签
            normal: {
              show: true,
              //position: 'inside', // 标签的位置
              lineHeight: 20,
              textStyle: {
                fontWeight: 300,
                fontSize: 12 // 文字的字体大小
              },
              formatter: '{b}({d}%)' // {b}\n
            }
          },
          data: that.chartData
        }]
      })
      if(that.goods_index >= 0){
        that.chart.dispatchAction({
          type: 'highlight',
          dataIndex: that.goods_index
        })
      }
      that.chart.on('click', function(params) {
        if(that.goods_index >= 0){
          that.chart.dispatchAction({
            type: 'downplay',
            dataIndex: that.goods_index
          })
        }
        that.chart.dispatchAction({
          type: 'highlight',
          dataIndex: params.dataIndex
        })
        that.goods_index = params.dataIndex
        that.device_type = params.data.device_type
        that.getEquipData()
      })
    },

    /**
     * 选择设备类型
     */
    switchType(type){
      let device = JSON.parse(JSON.stringify(this.deviceNameObj))
      let goods_index = Object.values(device).indexOf(type)
      if(this.goods_index >= 0){
        this.chart.dispatchAction({
          type: 'downplay',
          dataIndex: this.goods_index
        })
      }
      this.device_type = type
      this.goods_index = goods_index
      this.chart.dispatchAction({
        type: 'highlight',
        dataIndex: goods_index
      })
      //this.getEquipData()
    },

    /**
     * 选择平台
     */
    switchPlat(search_agent_id){
      this.chartData = []
      this.search_agent_id = search_agent_id
      this.getEquipData()
    }
  }
}
</script>
<style lang="scss" scoped>
  #pieChart {

  }

  >>>.el-progress {
    .el-progress-bar__outer {
      border-radius: 2px;
    }

    .el-progress-bar__inner {
      border-radius: 2px;
    }

    .progress1 {
      .el-progress-bar__outer {
        background-color: rgba(255, 224, 221, 1);
      }
    }

    .progress2 {
      .el-progress-bar__outer {
        background-color: rgba(240, 225, 254, 1);
      }
    }

    .progress3 {
      .el-progress-bar__outer {
        background-color: rgba(223, 227, 255, 1);
      }
    }

    .progress4 {
      .el-progress-bar__outer {
        background-color: rgba(202, 234, 255, 1);
      }
    }
  }
</style>
