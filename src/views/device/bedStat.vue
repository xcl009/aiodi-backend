<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :exportStatus="true" @reset="reset" @query="toQuery" @saveXlsx="saveXlsx">
      <template v-slot:defult>
        <el-input v-model="form.deviceSn" placeholder="二维码" />
        <el-select v-model="form.duration" @change="toQuery()" placeholder="在线时长">
          <el-option label="全部" :value="null" />
          <el-option label="大于15分钟" :value="15" />
          <el-option label="大于30分钟" :value="30" />
          <el-option label="大于2小时" :value="120" />
          <el-option label="大于4小时" :value="240" />
          <el-option label="大于8小时" :value="480" />
          <el-option label="大于12小时" :value="720" />
        </el-select>
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.date"
            type="daterange"
            range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd"
            @change="toQuery()">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" highlight-current-row>
        <el-table-column label="设备sn">
          <template slot-scope="scope">
            {{ scope.row.deviceSn }}
          </template>
        </el-table-column>
        <el-table-column label="商户">
          <template slot-scope="scope">
            {{ scope.row.storeName }}
          </template>
        </el-table-column>
        <el-table-column label="上线时间">
          <template slot-scope="scope">
            {{ scope.row.onlineDatetime }}
          </template>
        </el-table-column>
        <el-table-column label="下线时间">
          <template slot-scope="scope">
            {{ scope.row.offlineDatetime }}
          </template>
        </el-table-column>
        <el-table-column label="在线时长">
          <template slot-scope="scope">
            {{ scope.row.onlineDuration }}
          </template>
        </el-table-column>
      </el-table>

      <div class="rel flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  import Pagination from '@/components/Pagination/'
  export default {
    name: 'bedStat',
    components: {
      condition,
      Pagination,
    },
    computed: {
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          storeId: this.$route.query.id || '',
          page: 1,
          size: 20
        },
        form: {
          deviceSn: this.$route.query.deviceSn || '',
        },
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
    mounted(options) {
      this.toQuery()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        if(params.date && params.date.length > 0){
          params.startDatetime = params.date[0]
          params.endDatetime = params.date[1]
          delete params.date
        }
        this.$get('iot-saas-device/massageBed/statistics/findPage', params).then((res = {}) => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total || 0
          }
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 导出记录
       */
      saveXlsx(){
        this.$alert('确定导出设备在线记录吗？', '导出', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在打包导出',
                spinner: 'el-icon-loading'
              })
              var params = Object.assign({}, this.form, this.listQuery)
              if(params.date && params.date.length > 0){
                params.startDatetime = params.date[0]
                params.endDatetime = params.date[1]
                delete params.date
              }
              delete params.page
              delete params.size
              let param = '?'
              for(var i in params){
                if(params[i]){
                  param = param + `${i}=${params[i]}&`
                }
              }
              param = param.substring(0, param.length - 1)
              this.$export(`iot-saas-device/massageBed/statistics/export${param}`).then(res => {
                const blob = new Blob([res])
                const fileName = `设备在线统计记录(${this.parseTime(this.currentTime())}).xlsx`
                if ('download' in document.createElement('a')) {
                  const elink = document.createElement('a')
                  elink.download = fileName
                  elink.style.display = 'none'
                  elink.href = URL.createObjectURL(blob)
                  document.body.appendChild(elink)
                  elink.click()
                  URL.revokeObjectURL(elink.href)
                  document.body.removeChild(elink)
                } else {
                  navigator.msSaveBlob(blob, fileName)
                }
                this.loadObj.close()
                this.$message({
                  message: '导出成功',
                  type: 'success'
                })
              }).catch(err => {
                this.loadObj.close()
                this.$message({
                  message: '导出失败',
                  type: 'error'
                })
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
