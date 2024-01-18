<template>
  <div>
    <el-dialog :visible.sync="excel" :close-on-click-modal="false" :close-on-press-escape="false"
      :title="$t('components.loadingProgress')" width="240px">
      <div class="text-center">
        <el-progress type="circle" :percentage="percentage"></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import Sortable from 'sortablejs'
export default {
  props: {
    table_id: {
      type: String,
      default: 'list_table'
    },
    fileName: {
      type: String,
      default: 'data'
    }
  },
  computed: {

  },
  data() {
    return {
      excel: false,
      percentage: 0,
      wbout: {},
      wi: 0,
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 导出数据到表格
     */
    saveTableXlsx(end, pages, cbk) {
      let that = this;
      this.excel = true
      let fix = document.querySelector('.el-table__fixed-right')
      let xlsxParam = { raw: true }
      let wb
      console.log(end,pages,cbk)
      if (fix) {
        this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${this.table_id}`).removeChild(fix), xlsxParam)
        document.querySelector(`#${this.table_id}`).appendChild(fix)
      } else {
        this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${this.table_id}`), xlsxParam)
      }
      if (this.wi == 49 && !end) {
        this.wi = 0
      } else {
        this.wi++
        if (!end) {
          this.percentage = this.percentage < 96 ? parseFloat(((100 / pages) * this.wi).toFixed(2)) : 96
          setTimeout(()=>{
            cbk()
          }, 200)
          return
        }
      }
      let wboutes = this.wbout[0]
      var no = ''
      for (var i in this.wbout) {
        delete this.wbout[i].Sheets.Sheet1['!merges']
        delete this.wbout[i].Sheets.Sheet1['ANaN']
        if (i > 0) {
          let sheet1 = this.wbout[i].Sheets.Sheet1
          for (var s in sheet1) {
            let k = s.substring(0, 1)
            let n = s.substring(1)
            if (n != 1 && n != 'ref') {
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
      if (this.wbout[1]) wboutes.Sheets.Sheet1['!ref'] = `A1:S${no}`
      let wbout = XLSX.write(wboutes, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      this.percentage = 100
      if (end || this.wi == 0) {
        try {
          FileSaver.saveAs(new Blob([wbout], {
            type: 'application/octet-stream'
          }), `${this.fileName}.xlsx`)
          this.$message({
            message: that.$t('public.exportSuccess'),
            type: 'success'
          })
          if (this.wi == 0 && !end) {
            setTimeout(() => {
              this.percentage = 0
              this.wbout = []
              cbk()
            }, 1000)
          } else {
            setTimeout(() => {
              this.excel = false
              cbk()
            }, 1000)
          }
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, this.wbout)
        }
        return this.wbout
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
