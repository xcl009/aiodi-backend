<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit">
      <template v-slot:defult>
        <el-date-picker
          style="width: 300px; padding: 0 10px;"
          class="range-day flex align-center"
            v-model="form.date"
            type="year"
            :picker-options="pickerOptionsEnd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="getTime">
          </el-date-picker>
      </template>
    </condition>

    <div class="p-15 bg-white">
      <div class="chart-daystat" ref="chartDay"></div>
      <el-table class="custom" stripe id="list_table" :data="tableList" border>
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
            {{ scope.row.doneOrderNumber }}
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
  import { arrayToObj, delComma, parseTime, currentTime } from '@/utils/index'
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
        filtrate: {},
        list: [],
        tableList: [],
        listQuery: {},
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
      }
    },
    mounted() {
      let cutDate = new Date()
      this.curYear = cutDate.getFullYear()
      this.curMon = cutDate.getMonth() + 1
      this.getTime(this.curYear, 2)

      //this.getLineChart()
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
       * 近期数据对比
       */
      getLineChart(){
        let eTime = currentTime(),
          sTime = eTime - (15 * 86400),
          groupDate = [],
          amount = [],
          orderNumber = [],
          doneOrderNumber = [],
          unitPrice = [],
          params = this.filtrate

        params.brandID = this.brandId
        this.$get('iot-saas-order/admin/order/count/querLineChart', params).then(res => {
          let obj = arrayToObj(res, 'countGroupDate'), pros = []
          for(var i = this.selMon; i > 0; i--){
          	let mon = this.selYear + '-' + (i < 10 ? '0' + i : i)
            groupDate.push(mon)
            if(obj[mon] && obj[mon].countGroupDate == mon){
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
			 * 选择日期或月份
			 */
			getTime(val, type = 1){
        if(type == 1){
          if(this.curMonth){
            val = parseTime(val, '{y}-{m}')
          } else {
            val = parseTime(val, '{y}')
          }
        }
        if(this.curMonth){

        } else {
          if(val == this.curYear){
            this.filtrate.startDateStr = `${val}-01`
            this.filtrate.endDateStr = `${val}-${this.curMon < 10 ? '0' + this.curMon : this.curMon}`
          	this.selMon = this.curMon
          } else {
            this.filtrate.startDateStr = `${val}-01`
            this.filtrate.endDateStr = `${val}-12`
          	this.selMon = 12
          }
          this.selYear = val
        }
				this.getLineChart()
			}
    }
  }
</script>

<style lang="scss" scoped>
  .chart-daystat{
    height: 500px;
  }
</style>
