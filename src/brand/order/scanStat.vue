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

    <div class="p-5">
      <div class="pl-10 pr-10 bg-white">
        <div class="p-20 bg-white" id="moneyChart"></div>
        <el-row>
          <el-col class="pl-10 pr-10 mb-20" :sm="12" :md="8" :lg="8"  :xl="6" v-for="item in list">
            <el-card class="profit-table" shadow="hover">
              <div slot="header" class="fs-s3 clearfix line-1">
                <span>日期：{{ item.date }}</span>
              </div>
              <div class="flex fs-s4">
                <div class="flex1 num-content">
                  <div class="mb-10">扫码租借次数：{{ item.day_scan_num }}次</div>
                  <!-- <div class="mb-10">总订单数：{{ item.day_rent_num }}单</div> -->
                  <div class="mb-10">有效订单数：{{ item.day_using_num }}单</div>
                  <div class="mb-10">无效订单数：{{ item.day_not_using_num }}单</div>
                  <div class="mb-10">扫码租借人数：{{ item.day_scan_user_num }}人</div>
                  <div class="mb-10">使用人数：{{ item.day_using_user_num }}人</div>
                  <div class="mb-10">扫码2次未使用人数：{{ item.day_scan_2nd_unrent_user_num }}人</div>
                  <div>扫码3次未使用人数：{{ item.day_scan_3nd_unrent_user_num }}人</div>
                </div>
                <div class="flex1 num-content">
                  <div class="mb-10">扫码归还次数：{{ item.day_finish_num }}次</div>
                  <div class="mb-10">扫码归还人数：{{ item.day_finish_user_num }}人</div>
                  <div class="mb-10">扫码归还成功次数：{{ item.day_used_num }}次</div>
                  <div class="mb-10">扫码归还失败次数：{{ item.day_wrong_num }}次</div>
                  <div class="mb-10">扫码3次归还成功次数：{{ item.day_3td_used_num }}次</div>
                  <div>扫码3次归还成功人数：{{ item.day_3td_used_user_num }}人</div>
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
          <el-table-column label="扫码租借次数">
            <template slot-scope="scope">
              {{ scope.row.day_scan_num }}
            </template>
          </el-table-column>
          <el-table-column label="总订单数">
            <template slot-scope="scope">
              {{ scope.row.day_rent_num }}
            </template>
          </el-table-column>
          <el-table-column label="有效订单数">
            <template slot-scope="scope">
              {{ scope.row.day_used_num }}
            </template>
          </el-table-column>
          <el-table-column label="无效订单数">
            <template slot-scope="scope">
              {{ scope.row.day_not_using_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码租借人数">
            <template slot-scope="scope">
              {{ scope.row.day_scan_user_num }}
            </template>
          </el-table-column>
          <el-table-column label="使用人数">
            <template slot-scope="scope">
              {{ scope.row.day_using_user_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码2次未使用人数">
            <template slot-scope="scope">
              {{ scope.row.day_scan_2nd_unrent_user_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码3次未使用人数：">
            <template slot-scope="scope">
              {{ scope.row.day_scan_3nd_unrent_user_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码归还次数">
            <template slot-scope="scope">
              {{ scope.row.day_finish_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码归还人数">
            <template slot-scope="scope">
              {{ scope.row.day_finish_user_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码归还成功次数">
            <template slot-scope="scope">
              {{ scope.row.day_used_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码归还失败次数">
            <template slot-scope="scope">
              {{ scope.row.day_wrong_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码3次归还成功次数">
            <template slot-scope="scope">
              {{ scope.row.day_3td_used_num }}
            </template>
          </el-table-column>
          <el-table-column label="扫码3次归还成功人数">
            <template slot-scope="scope">
              {{ scope.row.day_3td_used_user_num }}
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
        listQuery: {},
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
        this.listQuery.page = 1
        this.getList()
      },

      getList() {
        let url = 'agentapi/statistics/stat_user_scan_data'
        let listQuery = Object.assign(this.form, this.listQuery, {})
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.day = []
        this.day_scan_num = []
        this.day_scan_user_num = []
        this.day_used_num = []
        this.day_using_user_num = []
        this.$get(url, listQuery).then(res => {
          this.list = Object.values(JSON.parse(JSON.stringify(res))).reverse()
          this.tableList = Object.values(res)
          for(var i in res){
            this.day.push(res[i].date)
            this.day_scan_num.push(res[i].day_scan_num)
            this.day_scan_user_num.push(res[i].day_scan_user_num)
            this.day_used_num.push(res[i].day_used_num)
            this.day_using_user_num.push(res[i].day_using_user_num)
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
            data: ['扫码次数', '扫码人数', '使用次数', '使用人数']
          },
          series: [
            {
              name: '扫码次数',
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
              smooth: true,
              type: 'line',
              data: this.day_scan_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '扫码人数',
              smooth: true,
              type: 'line',
              data: this.day_scan_user_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '使用次数',
              smooth: true,
              type: 'line',
              data: this.day_used_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }, {
              name: '使用人数',
              smooth: true,
              type: 'line',
              data: this.day_using_user_num,
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
  .num-content div{
    cursor: pointer;
  }
  .num-content div:hover{
    color: #409EFF;
  }
</style>
