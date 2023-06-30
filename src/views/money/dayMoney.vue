<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @query="getTime(form.date)" @reset="getTime">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="listQuery.deviceTypeCode" @tab-click="getLineChart()">
          <el-tab-pane label="全部设备" :name="'0'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>
      
      <template v-slot:defult>
        <el-form-item label="选择月份">
          <el-date-picker v-model="form.date" type="month" :picker-options="pickerOptionsEnd" range-separator="-"
            placeholder="选择月份" value-format="yyyy-MM" @change="getTime">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="p-15 bg-white">
      <div class="chart-daystat" ref="chartDay"></div>
      <el-table class="custom" id="list_table" :data="tableList" border>
        <el-table-column label="日期" align="center">
          <template slot-scope="scope">
            {{ scope.row.countGroupDate }}
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" align="center">
          <template slot-scope="scope">
            {{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column label="订单量(单)" align="center">
          <template slot-scope="scope">
            {{ scope.row.orderNumber }}
          </template>
        </el-table-column>
        <el-table-column label="收益额(元)" align="center">
          <template slot-scope="scope">
            {{ scope.row.amountDivide }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import {
    arrayToObj,
    delComma,
    parseTime,
    currentTime,
    dateSort
  } from '@/utils/index'
  import condition from '@/components/condition/'

  import * as echarts from 'echarts/lib/echarts'
  import {
    TooltipComponent,
    LegendComponent,
    GridComponent
  } from 'echarts/components'
  import {
    LineChart
  } from 'echarts/charts'
  import {
    LabelLayout
  } from 'echarts/features'

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
        curMonth: this.$route.query.curMonth,
        form: {},
        filtrate: {},
        list: [],
        tableList: [],
        listQuery: {},
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
      }
    },
    mounted() {
      let cutDate = new Date()
      this.curYear = cutDate.getFullYear()
      this.curMon = cutDate.getMonth() + 1
      this.curMon = this.curMon > 9 ? this.curMon : '0' + this.curMon
      this.curDay = cutDate.getDate()
      this.getTime(this.curMonth || `${this.curYear}-${this.curMon}`, 2)
    },
    methods: {
      objectSpanMethod({
        row,
        column,
        rowIndex,
        columnIndex
      }) {
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
       * 近期数据对比
       */
      getLineChart() {
        let groupDate = [],
          amount = [],
          orderNumber = [],
          doneOrderNumber = [],
          unitPrice = [],
          params = this.filtrate

        params.brandID = this.brandId
        if(this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
        this.$get('iot-saas-order/admin/order/count/querLineChart', params).then(res => {
          res = res.sort(dateSort('countGroupDate'))
          let obj = arrayToObj(res, 'countGroupDate'),
            pros = []
          for (var i = 1; i < this.selDay; i++) {
            let mon = this.selMon + '-' + (i < 10 ? '0' + i : i)
            groupDate.push(mon)
            if (obj[mon] && obj[mon].countGroupDate == mon) {
              amount.push(obj[mon].amount)
              orderNumber.push(obj[mon].orderNumber)
              doneOrderNumber.push(obj[mon].doneOrderNumber)
              unitPrice.push(obj[mon].unitPrice)
            } else {
              amount.push(0)
              orderNumber.push(0)
              doneOrderNumber.push(0)
              unitPrice.push(0)
            }
          }
          this.tableList = res
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
       * 选择日期或月份
       */
      getTime(val = '', type = 1) {
        let mon = `${this.curYear}-${this.curMon}`
        if (!val) val = mon
        if(val == mon){
          this.filtrate.startDateStr = `${val}-01`
          this.filtrate.endDateStr = `${val}-${this.curDay < 10 ? '0' + this.curDay : this.curDay}`
          this.selDay = this.curDay
        } else {
          this.selDay = this.getMonthLastDay(val)
          this.filtrate.startDateStr = `${val}-01`
          this.filtrate.endDateStr = `${val}-${this.selDay}`
        }
        this.selMon = val
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
			}
    }
  }
</script>

<style lang="scss" scoped>
  .chart-daystat {
    height: 500px;
  }
</style>
