<template>
  <div class="p-5">
    <div class="p-20 mb-5 bg-white">
      <div class="mb-15 fs-s3">账户收入</div>
      <div class="flex flex-wrap">
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">总拉取量</div>
          <div class="f-w">{{ summary.req_succ_count }}</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">总曝光量</div>
          <div class="f-w">{{ summary.exposure_count }}</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">总曝光率</div>
          <div class="f-w">{{ summary.exposure_rate }}%</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">总点击量</div>
          <div class="f-w">{{ summary.click_count }}</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">总点击率</div>
          <div class="f-w">{{ summary.click_rate }}%</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">昨日收入(元)</div>
          <div class="f-w">100</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">近7日收入(元)</div>
          <div class="f-w">100</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">千次曝光收益(元)</div>
          <div class="f-w">{{ summary.ecpm / 100 }}</div>
        </div>
        <div class="pr-30 solid-right">
          <div class="mb-10 fs-s3 text-gray">累计收入(元)</div>
          <div class="f-w">{{ summary.income / 100 }}</div>
        </div>
      </div>
      <div class="pt-20 mt-30 l-t">
        <div class="mb-20 flex justify-end">
          <el-date-picker v-model="selDate" :picker-options="pickerOptions" @change="getStatistics()"
            value-format="yyyy-MM-dd" size='small' type="daterange" />
        </div>
        <div id="lineChart" ref="lineChart" style="height: 500px;"></div>
      </div>
    </div>

    <div class="bg-white" v-if="false">
      <div class="p-15 l-b">昨日关键数据</div>
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div>{{ scope.row.business_des }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            <div>{{ scope.row.list.length }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <router-link :to="`/advert/weChatList?business_type=${scope.row.business_type}`">
              <el-button type="primary" size="mini" round plain>设置广告</el-button>
            </router-link>
            <el-button type="primary" size="mini" round plain @click="setShow(scope.row)"
              v-if="checkRoles(['partner'])">{{ scope.row.is_show == 1 ? '已开启' : '已关闭' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import CountTo from 'vue-count-to'
  import {
    parseTime,
    delComma,
    colorPalette
  } from '@/utils/index'
  require('echarts/theme/macarons') // echarts theme
  export default {
    name: 'weChatAdBase',
    components: {

    },
    data() {
      return {
        list: [],
        listLoading: true,
        summary: {},

        adType: {
          1: 'Banner广告',
          2: '激励视频广告',
          3: '插屏广告',
          4: '视频广告',
          5: '视频前贴广告',
          6: '封面广告',
          7: '原生模板广告'
        },

        selDate: '',
        pickerOptions: {
          disabledDate: time => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 60 * 1000
            if (time.getTime() > (new Date(new Date().toLocaleDateString()).getTime()) - 86400000) {
              return true
            }
          }
        },
      }
    },
    mounted() {
      this.getList()
      let endTime = (new Date(new Date().toLocaleDateString()).getTime() / 1000) - 86400
      let startTime = endTime - (6 * 86400)
      this.selDate = [
        parseTime(startTime, '{y}-{m}-{d}'),
        parseTime(endTime, '{y}-{m}-{d}')
      ]
      this.getStatistics()
    },
    methods: {
      /**
       * 获取广告位置
       */
      getList() {
        let url = 'agentapi/ad/get_wx_ad_positions'
        this.$get(url).then(res => {
          this.list = Object.values(res)
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 设置是否显示
       */
      setShow(row) {
        let is_show = row.is_show == 1 ? 0 : 1
        this.$post('agentapi/ad/save_wx_ad_positions_permission', {
          business_type: row.business_type,
          is_show: is_show
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.is_show = is_show
        })
      },

      /**
       * 折线图统计
       */
      getStatistics() {
        let url = 'agentapi/analysis/wxad_adpos_general'
        //url = 'agentapi/analysis/wxad_settlement'
        this.$get(url, {
          start_date: this.selDate[0],
          end_date: this.selDate[1]
        }).then(res => {
          this.summary = res.summary
          let list = [], dayArr = [], dayData = {}
          if(res.total_num > 0){

          } else {
            let end_time = Date.parse(new Date(this.selDate[1])) / 1000, start_time = Date.parse(new Date(this.selDate[0])) / 1000
            console.log(start_time)
            console.log(end_time)
            for(var i = start_time; i < end_time; i = i + 86400){
              dayArr.push(parseTime(i, '{y}-{m}-{d}'))
              dayData[1] = dayData[1] || []
              dayData[1].push(0)

              dayData[3] = dayData[3] || []
              dayData[3].push(0)

              dayData[4] = dayData[4] || []
              dayData[4].push(0)

              dayData[7] = dayData[7] || []
              dayData[7].push(0)
            }
          }
          this.$nextTick(() => {
            this.initChart({
              dayArr,
              dayData
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
        dayData
      } = {}) {
        if (!dayArr) return
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
          // legend: {
          //   data: ['交易额', '订单量', '平均单量', '平均交易额']
          // },
          series: [{
              name: 'Banner广告',
              smooth: true,
              type: 'line',
              data: dayData[1],
              animationDuration: 2800,
              animationEasing: 'cubicInOut',
            },
            {
              name: '插屏广告',
              smooth: true,
              type: 'line',
              data: dayData[3],
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '视频广告',
              smooth: true,
              type: 'line',
              data: dayData[4],
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            },
            {
              name: '原生模板广告',
              smooth: true,
              type: 'line',
              data: dayData[7],
              animationDuration: 2800,
              animationEasing: 'quadraticOut'
            }
          ]
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-range-input {
    width: 100px;
  }

  /deep/ .el-date-editor {
    width: 240px;
  }
</style>
