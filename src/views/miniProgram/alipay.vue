<template>
  <div>
    <div class="pl-10 pr-10 bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item :label="$t('public.appletName')">
            <el-input v-model="form.appName" />
          </el-form-item>
        </template>
      </condition>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column :label="$t('public.applet')">
          <template slot-scope="scope">
            {{ scope.row.appName || $t('public.appletName') }}
          </template>
        </el-table-column>
        <el-table-column label="APPID">
          <template slot-scope="scope">
            {{ scope.row.appId || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('miniProgram.latestTemplateVersion')">
          <template slot-scope="scope">
            {{ scope.row.latestVersion || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('miniProgram.currentTemplateVersion')">
          <template slot-scope="scope">
            {{ scope.row.currentVersion || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.status')">
          <template slot-scope="scope">
            {{ appAuditStatus[scope.row.appAuditStatus] || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.remark')">
          <template slot-scope="scope">
            {{ scope.row.appAuditResult || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.uploadTime')" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" align="center" width="245"
          :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1)">{{ $t('miniProgram.uploadCode')
              }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(2, scope.row, 1)"
                v-if="scope.row.appAuditStatus == 1">{{ $t('miniProgram.submitForReview') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(3, scope.row, 1)"
                v-if="scope.row.appAuditStatus == 2">{{ $t('miniProgram.reviewStatus') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(5, scope.row, 1)"
                v-if="scope.row.appAuditStatus == 2">{{ $t('miniProgram.cancelReview') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(4, scope.row, 1)"
                v-if="scope.row.appAuditStatus == 3">{{ $t('miniProgram.publishCode') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(6, scope.row, 1)"
                v-if="scope.row.appAuditStatus == 4">{{ $t('miniProgram.returnToDevelopment') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(7, scope.row, 1)"
                v-if="scope.row.appAuditStatus == 1">{{ $t('miniProgram.privacySettings') }}</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/system/alipayEdit?app_id=${scope.row.appId}` })" v-if="isBrand()">{{
                  $t('public.modifyingInformation') }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>

      <div class="pt-20 text-center text-primary cursor" @click="$router.push({ path: `/system/alipayEdit` })"
        v-if="list.length == 0">{{ $t('miniProgram.bindApplet') }}</div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">{{ $t('miniProgram.uploadCodeText') }}</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import condition from '@/components/condition/'
import Pagination from '@/components/Pagination'
export default {
  name: 'alipay',
  components: {
    condition,
    Pagination
  },
  data() {
    return {
      clickSubmit: false,
      tableMaxH: '250',
      form: {},
      listQuery: {
        page: 1,
        size: 20
      },
      listTotal: 0,
      list: [],
      listLoading: false,

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {}
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    appAuditStatus() {
      return {
        0: this.$t('public.toBeUploaded'),
        1: this.$t('public.audit'),
        2: this.$t('public.inReview'),
        3: this.$t('public.toBeReleased'),
        4: this.$t('public.reviewFailed'),
        5: this.$t('public.published')
      }
    },
    dialogTitle() {
      return {
        1: this.$t('miniProgram.uploadCode')
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    if (from.name == "alipayEdit") {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    if (this.$route.meta.reload) {
      this.toQuery()
    } else if (!this.list || this.list.length == 0) {
      this.toQuery()
    }
  },
  mounted() {
    
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
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
      this.$get('iot-saas-pay/admin/pay/config/alipay/list', params).then(res => {
        this.list = res.rows || []
        this.listTotal = res.total
        this.listLoading = false
        this.clickSubmit = false
        if(params.page == 0){
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
        }
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 操作
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '上传代码' 2: '提交审核' 3: '查询审核状态' 4: '发布代码' 5: '取消审核' 6: '回退开发' 7: '体验版本'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      let that = this;
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          break
        case 2:
          if (this.clickSubmit) return
          this.clickSubmit = true
          this.$post(`iot-saas-pay/alipay/${row.appId}/submit/audit`).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            row.appAuditStatus = 2
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 3:
          this.$get(`iot-saas-pay/alipay/${row.appId}/version`).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            row.appAuditStatus = res
          })
          break
        case 4:
          if (this.clickSubmit) return
          this.clickSubmit = true
          this.$post(`iot-saas-pay/alipay/${row.appId}/push/release`).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            row.appAuditStatus = 5
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 5:
          this.$confirm(that.$t('miniProgram.message4'), that.$t('miniProgram.cancelReview'), {
            confirmButtonText: that.$t('public.confirm'),
            cancelButtonText: that.$t('public.cancel'),
            type: 'warning'
          }).then(() => {
            this.$post(`iot-saas-pay/alipay/${row.appId}/cancel/audit`).then(res => {
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              row.appAuditStatus = 1
            })
          })
          break
        case 6:
          this.$confirm(that.$t('miniProgram.message5'), that.$t('miniProgram.message6'), {
            confirmButtonText: that.$t('public.confirm'),
            cancelButtonText: that.$t('public.cancel'),
            type: 'warning'
          }).then(() => {
            this.$post(`iot-saas-pay/alipay/${row.appId}/fallback/develop`).then(res => {
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              row.appAuditStatus = 1
            })
          })
          break
        case 7:
          this.$post(`iot-saas-pay/alipay/${row.appId}/create/experience`).then(res => {
            console.log(res)
          })
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          this.$post(`iot-saas-pay/alipay/upload/code`, {
            appId: curRow.appId,
            ext: {
              appId: curRow.appId,
            },
            extEnable: true,
          }).then(res => {
            this.$message({
              message: that.$t('public.uploadSuccess'),
              type: 'success'
            })
            curRow.appAuditStatus = 1
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
