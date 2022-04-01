<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :exportStatus="true" @reset="reset" @query="toQuery" @savexlsx="outTab('list_table', '日金额统计')">
      <template v-slot:defult>
        <el-date-picker
          style="width: 300px; padding: 0 10px;"
          class="range-day flex align-center"
            v-model="form.day"
            type="daterange"
            :picker-options="pickerOptions"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="chart-daystat" ref="chart_daystat"></div>
      <el-table class="custom" stripe id="list_table" :data="tableList">
        <el-table-column label="日期">
          <template slot-scope="scope">
            {{ scope.row.date}}
          </template>
        </el-table-column>
        <el-table-column label="来源">
          <template slot-scope="scope">
            <div class="td-info">
              <div class="pl-10 pr-10 l-b">微信</div>
              <div class="pl-10 pr-10 l-b">支付宝</div>
              <div class="pl-10 pr-10">余额</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)">
          <template slot-scope="scope">
            <div class="td-info">
              <div class="pl-10 pr-10 l-b">1000.00</div>
              <div class="pl-10 pr-10 l-b">500.00</div>
              <div class="pl-10 pr-10">300.00</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单量(单)">
          <template slot-scope="scope">
            <div class="td-info">
              <div class="pl-10 pr-10 l-b">100</div>
              <div class="pl-10 pr-10 l-b">50</div>
              <div class="pl-10 pr-10">30</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收益额(元)">
          <template slot-scope="scope">
            <div class="td-info">
              <div class="pl-10 pr-10 l-b">500.00</div>
              <div class="pl-10 pr-10 l-b">300.00</div>
              <div class="pl-10 pr-10">100.00</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import condition from '@/components/condition/'

  import * as echarts from 'echarts/lib/echarts'
  import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
  import { LineChart } from 'echarts/charts'
  import { LabelLayout } from 'echarts/features'

  echarts.use([
    TooltipComponent,
    LegendComponent,
    LabelLayout,
    LineChart,
    GridComponent
  ])
  export default {
    name: 'dayMoney',
    components: {
      condition
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        list: [],
        tableList: [{},{}],
        listQuery: {},

        pickerOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        }
      }
    },
    mounted() {
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
      //this.getList()
    },
    methods: {
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 0) {
          if (rowIndex % 3 === 0) {
            return {
              rowspan: 3,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      },

      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 50
        if (this.xlsxStatus) this.xlsxStatus = false
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
        this.getList()
      },

      getList() {
        let url = 'agentapi/statistics/my_order_date_data'
        let listQuery = Object.assign(this.form, this.listQuery, {})
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.day_order_amount = []
        this.day_profit = []
        this.day_order_num = []
        this.day = []
        this.$get(url, listQuery).then(res => {
          this.list = Object.values(JSON.parse(JSON.stringify(res))).reverse()
          this.tableList = Object.values(res)
          for(var i in res){
            this.day.push(res[i].date)
            this.day_order_amount.push(res[i].day_order_amount)
            this.day_profit.push(res[i].day_profit)
            this.day_order_num.push(res[i].day_order_num)
          }
          this.initChart()
          this.clickSubmit = false
        }).catch(() => {
          this.clickSubmit = false
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
  .chart-daystat{
    height: 500px;
  }
  .custom.el-table{
    /deep/ td{
      padding: 0;
    }
    /deep/ .cell{
      padding: 0;
    }
    .td-info{
      line-height: 46px;
    }
  }
</style>
