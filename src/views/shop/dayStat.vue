<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="时间筛选:">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="datetime"
              placeholder="开始"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="结束"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '日金额统计')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-10">
      <div class="pl-10 pr-10 bg-white">
        <div class="p-20 bg-white" id="moneyChart"></div>
        <el-row>
          <el-col class="pl-10 pr-10 mb-20" :sm="12" :md="8" :lg="8"  :xl="8" v-for="item in list">
            <el-card class="profit-table" shadow="hover">
              <div slot="header" class="fs-s3 clearfix line-1">
                <span>日期：{{ item.date }}</span>
              </div>
              <div class="flex fs-s4">
                <div class="flex1">
                  <div class="mb-10 f-w">交易额：<span class="text-danger">{{ item.day_order_amount }}元</span></div>
                  <div class="mb-10">微&nbsp;&nbsp;&nbsp;信：<span>{{ item.day_wx_order_amount }}元</span></div>
                  <div class="mb-10">支付宝：<span>{{ item.day_zfb_order_amount }}元</span></div>
                  <div>余&nbsp;&nbsp;&nbsp;额：<span>{{ item.day_balance_order_amount }}元</span></div>
                </div>
                <div class="flex1">
                  <div class="mb-10 f-w">订单量：<span class="text-primary">{{ item.day_order_num }}笔</span></div>
                  <div class="mb-10">微&nbsp;&nbsp;&nbsp;信：<span>{{ item.day_wx_order_num }}笔</span></div>
                  <div class="mb-10">支付宝：<span>{{ item.day_zfb_order_num }}笔</span></div>
                  <div>余&nbsp;&nbsp;&nbsp;额：<span>{{ item.day_balance_order_num }}笔</span></div>
                </div>
                <div class="flex1">
                  <div class="mb-10 f-w">收益额：<span class="text-danger">{{ item.day_profit }}元</span></div>
                  <div class="mb-10">微&nbsp;&nbsp;&nbsp;信：<span>{{ item.day_wx_profit }}元</span></div>
                  <div class="mb-10">支付宝：<span>{{ item.day_zfb_profit }}元</span></div>
                  <div>余&nbsp;&nbsp;&nbsp;额：<span>{{ item.day_balance_profit }}元</span></div>
                </div>
                <div class="flex1">
                  <div class="mb-10 f-w">使用率：<span class="text-danger">{{ item.day_usage_rate }}%</span></div>
                  <div class="mb-10">微&nbsp;&nbsp;&nbsp;信：<span>{{ item.day_wx_usage_rate }}%</span></div>
                  <div class="mb-10">支付宝：<span>{{ item.day_zfb_usage_rate }}%</span></div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-table id="list_table" :data="tableList" style="display: none;">
          <el-table-column label="日期">
            <template slot-scope="scope">
              {{ scope.row.date}}
            </template>
          </el-table-column>
          <el-table-column label="总交易额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_order_amount }}
            </template>
          </el-table-column>


          <el-table-column label="微信交易额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_wx_order_amount }}
            </template>
          </el-table-column>
          <el-table-column label="支付宝交易额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_zfb_order_amount }}
            </template>
          </el-table-column>
          <el-table-column label="余额交易额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_balance_order_amount }}
            </template>
          </el-table-column>

          <el-table-column label="总订单量(笔)">
            <template slot-scope="scope">
              {{ scope.row.day_order_num }}
            </template>
          </el-table-column>
          <el-table-column label="微信订单量(笔)">
            <template slot-scope="scope">
              {{ scope.row.day_wx_order_num }}
            </template>
          </el-table-column>
          <el-table-column label="支付宝订单量(笔)">
            <template slot-scope="scope">
              {{ scope.row.day_zfb_order_num }}
            </template>
          </el-table-column>
          <el-table-column label="余额订单量(笔)">
            <template slot-scope="scope">
              {{ scope.row.day_balance_order_num }}
            </template>
          </el-table-column>

          <el-table-column label="总收益额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_profit }}
            </template>
          </el-table-column>
          <el-table-column label="微信收益额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_wx_profit }}
            </template>
          </el-table-column>
          <el-table-column label="支付宝收益额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_zfb_profit }}
            </template>
          </el-table-column>
          <el-table-column label="余额收益额(元)">
            <template slot-scope="scope">
              {{ scope.row.day_balance_profit }}
            </template>
          </el-table-column>

          <el-table-column label="使用率">
            <template slot-scope="scope">
              {{ scope.row.day_usage_rate }}%
            </template>
          </el-table-column>
          <el-table-column label="微信使用率">
            <template slot-scope="scope">
              {{ scope.row.day_wx_usage_rate }}%
            </template>
          </el-table-column>
          <el-table-column label="支付宝使用率">
            <template slot-scope="scope">
              {{ scope.row.day_zfb_usage_rate }}%
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'dayMoney',
    components: {
      drawer
    },
    data() {
      return {
        form: {},
        list: [],
        tableList: [],
        listQuery: {
          store_id: this.$route.params.id
        },
        beginOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
            }
          }
        }
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if (type == 1) this.form = {}
        this.listQuery.start = 1
        this.getList()
      },

      getList() {
        let url = 'agentapi/statistics/my_store_date_data'
        let listQuery = Object.assign(this.form, this.listQuery, {})
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.day_order_amount = []
        this.day_profit = []
        this.day_order_num = []
        this.day_usage_rate = []
        this.day = []
        this.$get(url, listQuery).then(res => {
          this.list = Object.values(JSON.parse(JSON.stringify(res))).reverse()
          this.tableList = Object.values(res)
          for(var i in res){
            this.day.push(res[i].date)
            this.day_order_amount.push(res[i].day_order_amount)
            this.day_profit.push(res[i].day_profit)
            this.day_order_num.push(res[i].day_order_num)
            this.day_usage_rate.push(res[i].day_usage_rate)
          }
          this.initChart()
        }).catch(() => {

        })
      },

      /**
       * 设置图表
       */
      initChart() {
        const that = this
        this.chart = echarts.init(document.getElementById('moneyChart'), 'macarons')
        this.chart.setOption({
          xAxis: {
            type: 'category',
            data: that.day,
            boundaryGap: false,
            axisTick: {
              show: false
            }
          },
          yAxis: {
            axisTick: {
              show: false
            },
            type: 'value'
          },
          grid: {
            left: 20,
            right: 20,
            bottom: 20,
            top: 40,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            padding: [5, 10]
          },
          dataZoom: [
            {
              show: true,
              realtime: true,
              start: 0,
              end: 100
            }
          ],
          legend: {
            data: ['总交易额', '总收益额', '总订单量', '使用率']
          },
          series: [
            {
              name: '总交易额',
              itemStyle: {
                normal: {
                  color: '#3888fa',
                  lineStyle: {
                    color: '#3888fa',
                    width: 2
                  },
                  areaStyle: {
                    color: '#f3f8ff'
                  }
                }
              },
              label: {
                normal: {
                  show: true,
                  position: 'top',
                  formatter: '￥{c}'
                }
              },
              smooth: true,
              type: 'bar',
              data: this.day_order_amount,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '总收益额',
              label: {
                normal: {
                  show: true,
                  position: 'top',
                  formatter: '￥{c}'
                }
              },
              smooth: true,
              type: 'bar',
              data: this.day_profit,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '总订单量',
              label: {
                normal: {
                  show: true,
                  position: 'top',
                  formatter: '{c}单'
                }
              },
              smooth: true,
              type: 'bar',
              data: this.day_order_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '使用率',
              label: {
                normal: {
                  show: true,
                  position: 'top',
                  formatter: '{c}%'
                }
              },
              smooth: true,
              type: 'bar',
              data: this.day_usage_rate,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  #moneyChart{
    height: 500px;
  }
</style>
