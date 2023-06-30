<template>
  <div>
    <div class="bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" :exportStatus="true" @reset="reset" @query="toQuery" @savexlsx="saveXlsx">
        <template v-slot:defult>
          <el-date-picker
            style="width: 300px; padding: 0 10px;"
            class="range-day flex align-center"
              v-model="form.day"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptionsEnd"
              @change="toQuery()">
            </el-date-picker>
        </template>
        <template v-slot:endButton>
          <div class="mt-5 ml-15 text-gray">*仅显示30天以内的记录</div>
        </template>
      </condition>

      <div class="pl-15 pr-15">
        <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          highlight-current-row :max-height="tableMaxH">
          <el-table-column label="操作人" width="150">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作内容">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作IP" width="150">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作设备" width="150">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作时间" width="150">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size"
            :total="parseInt(listTotal)" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import condition from '@/components/condition'
  import Pagination from '@/components/Pagination'
  export default {
    name: 'roleAccount',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        listTotal: 0,
        list: [
          {},
          {},
          {},
        ],
        listLoading: false,
        form: {},
        listQuery: {
          page: 1,
          size: 20,
          count: 10
        },
        pickerOptionsEnd: {
          disabledDate: (time) => {
            // let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
            // if (timeOptionRange) {
            //   return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange.getTime() - secondNum) || time.getTime() > Date.now()
            // }
            return (time.getTime() > Date.now() || time.getTime() < Date.now() - secondNum)
          }
        },
      }
    },
    computed: {

    },
    mounted() {
      this.toQuery(1)
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('/brand/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.clickSubmit = false
          if(params.page == 1){
            this.count = res.count
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 导出记录
       * @param {Object} row
       */
      saveXlsx(row){
        this.$alert('确定导出操作记录吗？', '操作记录导出', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在打包导出',
                spinner: 'el-icon-loading'
              })
              this.$export('iot-saas-device/admin/qrcode/exportAll', {
                batchNumber: row.batchNumber
              }).then(res => {
                const blob = new Blob([res])
                const fileName = `二维码列表(${this.parseTime(row.createTime)}).xlsx`
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
