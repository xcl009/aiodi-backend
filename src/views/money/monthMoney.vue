<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @query="getTime(form.date)" @reset="getTime">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" :name="''" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item :label="$t('moeny.selectYear')">
          <el-date-picker v-model="form.date" type="year" :picker-options="pickerOptionsEnd" range-separator="-"
            :placeholder="$t('moeny.selectYear')" value-format="yyyy" @change="getTime">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="p-15 bg-white">
      <div class="chart-daystat" ref="chartDay"></div>
      <el-table class="custom" id="list_table" :data="tableList" border>
        <el-table-column :label="$t('moeny.month')" align="center">
          <template slot-scope="scope">
            {{ scope.row.countGroupDate }}
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('public.aTurnover')}`" align="center">
          <template slot-scope="scope">
            {{ scope.row.amount }}
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('home.orderNum')}`" align="center">
          <template slot-scope="scope">
            {{ scope.row.orderNumber }}
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('public.income')}`" align="center">
          <template slot-scope="scope">
            {{ scope.row.amountDivide }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" align="center">
          <template slot-scope="scope">
            <el-link type="primary" @click="$router.push({ path: `/money/dayMoney?curMonth=${scope.row.countGroupDate}` })">
              {{ $t('moeny.viewDailyStatistics') }}
            </el-link>
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
  computed: {
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
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
    this.getTime(this.curYear, 2)
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
      if (this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
      this.$get('iot-saas-order/admin/order/count/querLineChart', params).then(res => {
        res = res.sort(dateSort('countGroupDate'))
        let obj = arrayToObj(res, 'countGroupDate'),
          pros = []
        for (var i = this.selMon; i > 0; i--) {
          let mon = this.selYear + '-' + (i < 10 ? '0' + i : i)
          groupDate.unshift(mon)
          if (obj[mon] && obj[mon].countGroupDate == mon) {
            amount.unshift(obj[mon].amount)
            orderNumber.unshift(obj[mon].orderNumber)
            doneOrderNumber.unshift(obj[mon].doneOrderNumber)
            unitPrice.unshift(obj[mon].unitPrice)
          } else {
            amount.unshift(0)
            orderNumber.unshift(0)
            doneOrderNumber.unshift(0)
            unitPrice.unshift(0)
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
      let that = this;
      if (!groupDate) return
      let legend = [that.$t('public.aTurnover'), that.$t('home.allOrderNum'), that.$t('home.successNum'), that.$t('home.averageATurnover')],
        series = [{
          name: that.$t('public.aTurnover'),
          type: 'line',
          data: amount,
          animationDuration: 2800,
          animationEasing: 'cubicInOut',
        },
        {
          name: that.$t('home.allOrderNum'),
          type: 'line',
          data: orderNumber,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: that.$t('home.successNum'),
          type: 'line',
          data: doneOrderNumber,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: that.$t('home.averageATurnover'),
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
      if (!val) val = this.curYear
      if (val == this.curYear) {
        this.filtrate.startDateStr = `${val}-01`
        this.filtrate.endDateStr = `${val}-${this.curMon < 10 ? '0' + this.curMon : this.curMon}`
        this.selMon = this.curMon
      } else {
        this.filtrate.startDateStr = `${val}-01`
        this.filtrate.endDateStr = `${val}-12`
        this.selMon = 12
      }
      this.selYear = val
      this.getLineChart()
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-daystat {
  height: 500px;
}
</style>
