<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item>
          <el-button type="primary" plain @click="outTable()">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table
          id="table_box"
          ref="table_box"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          :max-height="tableMaxH"
        >
          <el-table-column label="商户名称">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              {{ scope.row.add_date_des }}
            </template>
          </el-table-column>
          <el-table-column label="最新登录时间">
            <template slot-scope="scope">
              {{ scope.row.business_last_date_des }}
            </template>
          </el-table-column>
          <el-table-column label="最新铺货时间">
            <template slot-scope="scope">
              {{ scope.row.new_bind_date_des }}
            </template>
          </el-table-column>
          <el-table-column label="交易停止">
            <template slot-scope="scope">
              {{ scope.row.business_des }}
            </template>
          </el-table-column>
          <el-table-column label="联系人">
            <template slot-scope="scope">
              <span class="mr-15">{{ scope.row.name }}</span>
              <span>{{ scope.row.phone }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listQuery.page_num > 0"
            :page.sync="listQuery.start"
            :page-count="listQuery.page_num"
            :limit.sync="listQuery.limit"
            @pagination="getList"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'

import JSZip from 'jszip'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
export default {
  name: 'shopAlarm',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      nowTime: Date.parse(new Date()) / 1000,
      form: {

      },
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        page_num: 1,
        limit: 20
      },

      xlsxName: '商户警报列表',
      outStatus: false,
      excel: false,
      percentage: 0,
      wbout: {},
      wi: 0,
    }
  },
  computed: {

  },
  mounted() {
    this.getList()
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery(type = 0) {
      if (type == 1) {
        this.form = {}
        this.listQuery.start = 1
      } else {
        this.listQuery.start = 1
      }
      this.getList()
    },

    /**
     * 获取列表数据
     */
    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.start - 1
      })
      this.$get('agentapi/business/merchants_businessing_worns', listQuery).then(res => {
        if(this.outStatus){
          this.list = res.list
          if(this.listQuery.start >= res.page_num){
            this.listLoading = false
            this.percentage = 100
          } else {
            this.listQuery.start++
            this.percentage = this.percentage < 95 ? this.percentage + 5 : 95
          }
          this.$nextTick(() => {
            this.outTabdd('table_box', this.xlsxName)
          })
        } else {
          this.listLoading = false
          this.list = res.list
        }
        this.listQuery.page_num = res.page_num
        if(this.listQuery.start == 1) this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 85
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 导出
     */
    outTable(){
      this.outStatus = true
      this.listLoading = true
      this.listQuery.limit = 100
      this.list = []
      this.excel = true
      this.getList()
    },

    /**
     * 导出表格
     */
    outTabdd(tabId, fileName = 'data') {
      let fix = document.querySelector('.el-table__fixed-right')
      let xlsxParam = { raw: true }
      let wb
      if (fix) {
        this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`).removeChild(fix), xlsxParam)
        document.querySelector(`#${tabId}`).appendChild(fix)
      } else {
        this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`), xlsxParam)
      }
      this.wi++
      if(this.listLoading){
        this.getList()
        return
      }
      let wboutes = this.wbout[0]
      var no = ''
      for(var i in this.wbout){
        delete this.wbout[i].Sheets.Sheet1['!merges']
        if(i > 0){
          let sheet1 = this.wbout[i].Sheets.Sheet1
          for(var s in sheet1){
            let k = s.substring(0, 1)
            let n = s.substring(1)
            if(n != 1 && n != 'ref'){
              let k = s.substring(0, 1)
              n = s.substring(1)
              no = ((parseInt(i) * 100) + parseInt(n))
              sheet1[k + no] = sheet1[s]
            }
            delete sheet1[s]
          }
          wboutes.Sheets.Sheet1 = Object.assign(wboutes.Sheets.Sheet1, sheet1)
        }
      }
      if(this.wbout[1]) wboutes.Sheets.Sheet1['!ref'] = `A1:Q${no}`
      let wbout = XLSX.write(wboutes, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      this.percentage = 100
      if(!this.listLoading){
        try {
          FileSaver.saveAs(new Blob([wbout], {
            type: 'application/octet-stream'
          }), `${fileName}.xlsx`)
          this.excel = false
          this.$message({
            message: '导出成功',
            type: 'success'
          })
          setTimeout(()=>{
            location.reload()
          }, 1000)
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, this.wbout)
        }
        return this.wbout
      }
    },
  }
}
</script>

<style lang="scss" scoped></style>
