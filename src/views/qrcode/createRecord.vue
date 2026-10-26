<template>
  <div>
    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading"
        highlight-current-row :max-height="tableMaxH">
        <el-table-column :label="$t('qrcode.batchNumber')">
          <template slot-scope="scope">
            {{ scope.row.batchNumber }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('qrcode.number')">
          <template slot-scope="scope">
            {{ scope.row.number || 0 }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('qrcode.generationTime')">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="exportAll(scope.row)">{{ $t('public.export') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'createRecord',
  components: {
    Pagination
  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20
      }
    }
  },
  mounted(options) {
    this.getList()
  },
  methods: {
    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      this.$get('iot-saas-device/admin/qrcode/findBatchPage', params).then(res => {
        this.listLoading = false
        this.clickSubmit = false
        this.list = res.rows
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 85
        }
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 导出单次生成的二维码记录
     * @param {Object} row
     */
    exportAll(row) {
      let that = this;
      this.$alert(that.$t('shopping.message3'), that.$t('shopping.message5'), {
        confirmButtonText: that.$t('public.confirm'),
        callback: action => {
          if (action == 'confirm') {
            this.loadObj = this.$loading({
              lock: true,
              text: that.$t('shopping.message5'),
              spinner: 'el-icon-loading'
            })
            this.$export(`iot-saas-device/admin/qrcode/exportAll?batchNumber=${row.batchNumber}`).then(res => {
              const blob = new Blob([res])
              const fileName = `${that.$t('public.qrCodeList')}(${this.parseTime(row.createTime)}).xlsx`
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
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
            }).catch(err => {
              this.loadObj.close()
              this.$message({
                message: that.$t('public.exportFailed'),
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

<style lang="scss" scoped></style>
