<template>
  <div>
    <div class="pl-10 pr-10 pt-20 bg-white l-t shadow-light">
      <el-form ref="form" class="filter-from text-center" :inline="true" size="small">
        <el-form-item class="flex1">
          <el-select v-model="user_type" @change="selUser">
            <el-option label="新增用户数" value="0" />
            <el-option label="活跃用户数" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="flex1">
          <el-select v-model="date_type" @change="selTime">
            <el-option label="最近7天" value="0" />
            <el-option label="昨天" value="2" />
            <el-option label="最近30天" value="1" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="p-20">
      <div class="mb-20 bg-white shadow-light">
        <div class="p-15 l-b">性别及年龄分布</div>
        <el-row>
          <el-col :md="{span: 24}" :lg="{span: 12}">
            <div id="genderEChart" style="height: 400px;"></div>
            <div class="pb-15 text-center">性别分布</div>
          </el-col>
          <el-col :md="{span: 24}" :lg="{span: 12}">
            <div id="ageEChart" style="height: 400px;"></div>
            <div class="pb-15 text-center">年龄分布</div>
          </el-col>
        </el-row>
      </div>

      <div class="mb-20 bg-white shadow-light">
        <div class="p-15 l-b">地区分布</div>
        <el-row>
          <el-col :md="{span: 24}" :lg="{span: 12}">
            <div id="mapEChart" style="height: 500px;"></div>
          </el-col>
          <el-col class="p-10" :md="{span: 24}" :lg="{span: 12}">
            <el-table :data="visit_uv_current.province" max-height="500" :header-cell-style="{background: '#f5f7fa'}" style="border: 1px solid #ebebeb;">
              <el-table-column label="省份" width="150">
                <template slot-scope="scope">
                  {{ scope.row.name }}
                </template>
              </el-table-column>
              <el-table-column label="用户数">
                <template slot-scope="scope">
                  <div class="flex align-center">
                    <div class="map-uv_num">{{ scope.row.value }}</div>
                    <div class="flex1">
                      <div class="map-uv_p" :style="{'width': (scope.row.value / uv_total[user_type].province_uv) * 100 + '%'}"></div>
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <div class="p-20">
          <el-table :data="visit_uv_current.city" max-height="500" :header-cell-style="{background: '#f5f7fa'}" style="border: 1px solid #ebebeb;">
            <el-table-column label="城市" width="150">
              <template slot-scope="scope">
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column label="用户数">
              <template slot-scope="scope">
                <div class="flex align-center">
                  <div class="map-uv_num">{{ scope.row.value }}</div>
                  <div class="flex1">
                    <div class="map-uv_p" :style="{'width': (scope.row.value / uv_total[user_type].city_uv) * 100 + '%'}"></div>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="mb-20 bg-white shadow-light">
        <div class="p-15 l-b">终端与机型分布</div>
        <el-row>
          <el-col :md="{span: 24}" :lg="{span: 12}">
            <div id="platformsEChart" style="height: 400px;"></div>
            <div class="pb-15 text-center">终端</div>
          </el-col>
          <el-col class="p-10" :md="{span: 24}" :lg="{span: 12}">
            <div id="devicesEChart" style="height: 400px;"></div>
            <div class="pb-15 text-center">机型</div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts'
  import {
    delComma,
    countPer
  } from '@/utils/index'
  import china from 'echarts/map/json/china.json'
  echarts.registerMap('china', china)
  require('echarts/theme/macarons') // echarts theme
  const animationDuration = 3000
  export default {
    name: 'portrait',
    components: {},
    data() {
      return {
        user_type: '0',
        date_type: '0',
        user_title: ['新增用户数', '活跃用户数'],
        visit_uv_current: {},
        visit_uv_new: {},
        visit_uv: {},
        uv_total: {}
      }
    },
    mounted() {
      this.getData()
    },
    methods: {
      /**
       * 选择用户类型
       */
      selUser(){
        this.visit_uv_current = this.user_type == 1 ? this.visit_uv : this.visit_uv_new
        this.setEChart()
      },

      /**
       * 选择时间
       */
      selTime(){
        this.getData()
      },

      /**
       * 获取数据
       */
      getData() {
        this.$get('agentapi/analysis/wx_user_portrait', {
          date_type: this.date_type
        }).then(res => {
          let city_uv_new = 0, province_uv_new = 0, city_uv = 0, province_uv = 0
          for(var i in res.visit_uv_new.city){
            city_uv_new += res.visit_uv_new.city[i].value
          }
          for(var i in res.visit_uv_new.province){
            province_uv_new += res.visit_uv_new.province[i].value
          }
          for(var i in res.visit_uv.city){
            city_uv += res.visit_uv.city[i].value
          }
          for(var i in res.visit_uv.province){
            province_uv += res.visit_uv.province[i].value
          }
          this.uv_total = [
            {
              city_uv: city_uv_new,
              province_uv: province_uv_new
            },
            {
              city_uv: city_uv,
              province_uv: province_uv
            }
          ]
          this.visit_uv_current = res.visit_uv_new
          this.visit_uv_new = res.visit_uv_new
          this.visit_uv = res.visit_uv
          this.setEChart()
        })
      },

      /**
       * 设置图表
       */
      setEChart(){
        this.genderEChart()
        this.ageEChart()
        this.mapEChart()
        this.platformsEChart()
        this.devicesEChart()
      },

      /**
       * 性别图表设置数据
       */
      genderEChart() {
        const that = this
        this.EChart = echarts.init(document.getElementById('genderEChart'), 'macarons')
        this.EChart.setOption({
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
          series: [{
            type: 'pie',
            radius: ['50%', '70%'],
            label: { // 饼图图形上的文本标签
              normal: {
                show: true,
                lineHeight: 20,
                textStyle: {
                  fontWeight: 300,
                  fontSize: 12 // 文字的字体大小
                },
                formatter: '{b}({d}%)' // {b}\n
              }
            },
            data: that.visit_uv_current.genders
          }]
        })
      },

      /**
       * 年龄段图表设置数据
       */
      ageEChart() {
        const that = this
        let xAxis_data = [], series_data = []
        for(var i in this.visit_uv_current.ages){
          let age = this.visit_uv_current.ages[i]
          xAxis_data.push(age.name)
          series_data.push(age.value)
        }
        this.EChart = echarts.init(document.getElementById('ageEChart'), 'macarons')
        this.EChart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          grid: {
            top: 40,
            left: 20,
            right: 20,
            bottom: 40,
            containLabel: true
          },
          xAxis: [{
            type: 'category',
            data: xAxis_data,
            axisTick: {
              alignWithLabel: true
            }
          }],
          yAxis: [{
            type: 'value',
            axisTick: {
              show: false
            }
          }],
          series: [{
            type: 'bar',
            stack: 'vistors',
            barWidth: '40%',
            data: series_data,
            animationDuration
          }]
        })
      },

      /**
       * 地图图表设置数据
       */
      mapEChart() {
        let that = this, province = that.visit_uv_current.province, max_num = 0
        for(var i in province){
          max_num = max_num && max_num > province[i].value ? max_num : province[i].value
          if(province[i].name.indexOf('省') > -1) province[i].name = province[i].name.replace('省', '')
        }
        this.EChart = echarts.init(document.getElementById('mapEChart'), 'macarons')
        this.EChart.setOption({
          tooltip: {
            trigger: 'item'
          },
          visualMap: {
            min: 0,
            max: max_num,
            left: 20,
            bottom: 20,
            text: ['高', '低'], // 文本，默认为数值文本
            calculable: true
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
              mark: {
                show: true
              },
              dataView: {
                show: true,
                readOnly: false
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          series: [{
            name: this.user_title[this.user_type],
            type: 'map',
            mapType: 'china',
            zoom: 1.1,
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              areaColor: '#f5ffff'
            },
            data: that.visit_uv_current.province
          }]
        })
      },

      /**
       * 终端图表设置数据
       */
      platformsEChart() {
        const that = this
        this.EChart = echarts.init(document.getElementById('platformsEChart'), 'macarons')
        this.EChart.setOption({
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
          series: [{
            type: 'pie',
            radius: ['50%', '70%'],
            label: { // 饼图图形上的文本标签
              normal: {
                show: true,
                lineHeight: 20,
                textStyle: {
                  fontWeight: 300,
                  fontSize: 12 // 文字的字体大小
                },
                formatter: '{b}({d}%)' // {b}\n
              }
            },
            data: that.visit_uv_current.platforms
          }]
        })
      },

      /**
       * 机型图表设置数据
       */
      devicesEChart() {
        const that = this
        this.EChart = echarts.init(document.getElementById('devicesEChart'), 'macarons')
        this.EChart.setOption({
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
          series: [{
            type: 'pie',
            radius: ['50%', '70%'],
            label: { // 饼图图形上的文本标签
              normal: {
                show: true,
                lineHeight: 20,
                textStyle: {
                  fontWeight: 300,
                  fontSize: 12 // 文字的字体大小
                },
                formatter: '{b}({d}%)' // {b}\n
              }
            },
            data: that.visit_uv_current.devices
          }]
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .map-uv_num{
    width: 150px;
  }
  .map-uv_p{
    height: 15px;
    background: #90c328;
    border-radius: 2px;
  }
</style>
