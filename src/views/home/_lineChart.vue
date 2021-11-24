<template>
  <div>
    <el-row :gutter="device === 'mobile' ? 0 : 5" type="flex" class="flex-wrap">
      <el-col class="mb-5" :md="24" :lg="13">
        <el-card :body-style="{padding: '0px'}" shadow="hover">
          <div class="mb-10 pl-10 pt-10 flex align-center">
            <b class="mr-15">数据图</b>
            <el-radio-group class="flex1" v-model="date_type" @change="getStatistics()" size="mini">
              <el-radio-button :label="5">最近7天</el-radio-button>
              <el-radio-button :label="3">本周</el-radio-button>
              <el-radio-button :label="4">上周</el-radio-button>
              <el-radio-button :label="1">本月</el-radio-button>
              <el-radio-button :label="2">上月</el-radio-button>
            </el-radio-group>
            <el-dropdown trigger="click">
              <span class="pr-15 cursor el-dropdown-link">
                {{ drop_title }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item tabindex="-1" @click.native="drop(-1, '全部设备')">全部设备</el-dropdown-item>
                <el-dropdown-item v-for="(item, key) in deviceNameObj" :tabindex="item" @click.native="drop(item, key)">
                  {{ key }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div id="lineChart" ref="lineChart" style="height: 460px;"></div>
        </el-card>
      </el-col>

      <el-col class="mb-5" :md="24" :lg="11" v-if="!checkRoles(['merchants'])">
        <el-card shadow="hover" :body-style="{ padding: '10px' }">
          <div class="mb-20 flex flex-wrap align-center">
            <b class="mr-15">运营数据</b>
            <el-radio-group class="hidden-sm-and-down" v-model="listQuery.sel_agent_level" size="small" @change="selDataType">
              <el-radio-button label="0">全部</el-radio-button>
              <el-radio-button :label="key" v-if="agentInfo.agent_level < key" v-for="(item, key) in give_role">{{ item }}</el-radio-button>
            </el-radio-group>
            <div class="flex1"></div>
            <router-link :to="`/home/operateData?l=${ listQuery.sel_agent_level }`" v-if="listQuery.count > 5" class="fs-s2 text-gray">更多<i class="el-icon-arrow-right el-icon--right"></i></router-link>
          </div>
          <el-radio-group class="hidden-sm-and-up mb-10" v-model="listQuery.sel_agent_level" size="small" @change="selDataType">
            <el-radio-button label="0">全部</el-radio-button>
            <el-radio-button :label="key" v-if="agentInfo.agent_level < key" v-for="(item, key) in give_role">{{ item }}</el-radio-button>
          </el-radio-group>
          <el-table :data="list" stripe border highlight-current-row>
            <el-table-column label="名称">
              <template slot-scope="scope">
                {{ scope.row.name ? scope.row.name : scope.row.nick_name }}
              </template>
            </el-table-column>
            <el-table-column label="角色">
              <template slot-scope="scope">
                {{ give_role[scope.row.role_id] }}
              </template>
            </el-table-column>
            <el-table-column label="总交易额" v-if="agentInfo.business_type != 1">
              <template slot-scope="scope">
                {{ scope.row.order_total_amount }}
              </template>
            </el-table-column>
            <el-table-column label="本月交易额" v-if="agentInfo.business_type != 1">
              <template slot-scope="scope">
                {{ scope.row.order_month_amount }}
              </template>
            </el-table-column>
            <el-table-column label="今日交易额" v-if="agentInfo.business_type != 1">
              <template slot-scope="scope">
                {{ scope.row.order_today_amount }}
              </template>
            </el-table-column>
            <el-table-column label="昨日交易额" v-if="agentInfo.business_type != 1">
             <template slot-scope="scope">
               {{ scope.row.order_yesterday_amount }}
             </template>
            </el-table-column>
            <el-table-column label="总订单数">
              <template slot-scope="scope">
                {{ scope.row.order_total_num }}
              </template>
            </el-table-column>
            <el-table-column label="本月订单数">
              <template slot-scope="scope">
                {{ scope.row.order_month_num }}
              </template>
            </el-table-column>
            <el-table-column label="今日订单数">
              <template slot-scope="scope">
                {{ scope.row.order_today_num }}
              </template>
            </el-table-column>
            <el-table-column label="昨日订单数">
              <template slot-scope="scope">
                {{ scope.row.order_yesterday_num }}
              </template>
            </el-table-column>
            <el-table-column label="总商户">
              <template slot-scope="scope">
                {{ scope.row.store_num }}
              </template>
            </el-table-column>
            <el-table-column label="已铺货底座">
              <template slot-scope="scope">
                {{ scope.row.all_zuo_num }}
              </template>
            </el-table-column>
            <!-- <el-table-column label="已铺货底座">
              <template slot-scope="scope">
                {{ scope.row.devoted_zuo_num }}
              </template>
            </el-table-column> -->
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import CountTo from 'vue-count-to'
  import {
    delComma,
    colorPalette
  } from '@/utils/index'
  require('echarts/theme/macarons') // echarts theme

  export default {
    components: {
      CountTo
    },
    data() {
      return {
        delComma: delComma,
        date_type: 5,
        device_data: [],
        colorPalette: colorPalette(),
        give_role: {},
        list: [],
        listQuery: {
          page: 0,
          sel_agent_level: 0,
          limit: 5,
        },

        device_type: -1,
        search_agent_id: '',

        drop_title: '全部设备'
      }
    },

    props: {

    },

    computed: {
      device() {
        return this.$store.state.app.device
      },
      agentInfo(){
        return this.$store.state.user.agentInfo
      },
      deviceNameObj(){
        return this.$store.getters.deviceNameObj
      }
    },

    mounted() {
      this.getPower()
      this.getStatistics()
      if(!this.checkRoles(['merchants'])) this.getList()
    },

    methods: {
      /**
         * 获取权限
         */
      getPower() {
        let give_role = { 5: '商户'}
        this.$get('agentapi/add_agent').then(ares => {
          for (var i in ares.give_role_right) {
            let role_i = ares.give_role_right[i]
            give_role[role_i.role_id] = role_i.role_name
          }
          this.give_role = give_role
        })
      },

      /**
       * 获取运营数据
       */
      getList() {
        let url = 'SyStatistics/getTotalBusinessData'
        this.$get(url, this.listQuery).then(res => {
          this.list = res.list
          this.listQuery.count = res.count
        })
      },

      /**
       * 运营数据类型筛选
       * @param {Object} val
       */
      selDataType(val) {
        this.listQuery.sel_agent_level = val
        this.getList()
      },

      /**
       * 折线图统计
       */
      getStatistics() {
        let date_type = this.date_type,
          week = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        this.$get('agentapi/my_statistics_data', {//'agentapi/my_statistics_data'
          date_type: date_type,
          device_type: this.device_type,
          search_agent_id: this.search_agent_id
        }).then(res => {
          let list = res.list,
            dayArr = [],
            day_order_amount = [],
            day_order_num = [],
            day_average_order_num = [],
            day_average_order_amount = []
          for (var i in list) {
            if (date_type == 5) {
              dayArr.push(list[i].day)
            } else if (date_type > 2) {
              dayArr.push(week[i])
            } else {
              dayArr.push(list[i].day_start)
            }
            day_order_amount.push(delComma(list[i].day_order_amount))
            day_order_num.push(list[i].day_order_num)
            day_average_order_num.push(list[i].day_average_order_num)
            day_average_order_amount.push(delComma(list[i].day_average_order_amount))
          }
          this.$nextTick(() => {
            this.initChart({
              dayArr,
              day_order_amount,
              day_order_num,
              day_average_order_num,
              day_average_order_amount
            })
          })
        })
      },

      /**
       * 表初始化
       */
      initChart(chartData) {
        this.chart = echarts.init(this.$refs.lineChart, 'macarons')
        this.setOptions(chartData)
      },

      /**
       * 图表设置数据
       */
      setOptions({
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
              smooth: true,
              type: 'line',
              data: day_order_amount,
              animationDuration: 2800,
              animationEasing: 'cubicInOut',
            },
            {
              name: '订单量',
              smooth: true,
              type: 'line',
              data: day_order_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '平均单量',
              smooth: true,
              type: 'line',
              data: day_average_order_num,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '平均交易额',
              smooth: true,
              type: 'line',
              data: day_average_order_amount,
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        if(this.agentInfo.business_type == 1){
          legend.splice(0, 1)
          legend.splice(2, 1)

          series.splice(0, 1)
          series.splice(2, 1)
        }
        this.chart.setOption({
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
            bottom: 20,
            top: 40,
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            hideDelay: 5000,
            axisPointer: {
              type: 'cross'
            },
            padding: [10, 10]
          },
          yAxis: {
            axisTick: {
              show: false
            }
          },
          legend: {
            data: legend
          },
          series: series
        })
      },

      /**
       * 选择设备类型
       */
      switchType(type){
        this.device_type = type
        this.getStatistics()
      },

      /**
       * 选择平台
       */
      switchPlat(search_agent_id){
        this.search_agent_id = search_agent_id
        this.getStatistics()
      },

      /**
       * 选择设备类型
       * @param {Object} v
       * @param {Object} n
       */
      drop(v, n){
        this.drop_title = n
        this.device_type = v
        this.getStatistics()
      }
    }
  }
</script>

<style lang="scss" scoped>
  >>> .income-table{
    height: 352px;
  }
</style>
