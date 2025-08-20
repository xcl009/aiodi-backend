<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :defaultShowLength="4" @reset="reset" @query="toQuery">
      <template v-slot:left>
        <div class="pl-10 max-w filter-btn_box white-space">
          <el-scrollbar>
            <el-button size="medium" :type="listQuery.state == item.value ? 'primary' : ''"
              :class="{ 'btn-body': listQuery.state != item.value }" v-for="item in dealStatus"
              @click="listQuery.state = item.value; toQuery()">{{ item.title }}({{ statInfo[item.nkey] || 0
              }})</el-button>
          </el-scrollbar>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item :label="$t('public.phone')">
          <el-input :placeholder="$t('userManage.userPhone')" v-model="form.mobile" />
        </el-form-item>
        <el-form-item :label="$t('public.deviceSn')">
          <el-input :placeholder="$t('public.deviceSn')" v-model="form.deviceSn" />
        </el-form-item>
        <el-form-item :label="$t('public.storeName')" v-if="!isStore()">
          <el-input :placeholder="$t('public.storeName')" v-model="form.storeName" />
        </el-form-item>
        <el-form-item :label="$t('userManage.feedbackRecipient')" v-if="!isStore()">
          <el-select :placeholder="$t('userManage.feedbackRecipient')" v-model="form.feedbackType" @change="toQuery()">
            <el-option :label="item" :value="index" v-for="(item, index) in feedbackType" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('public.deviceType')">
          <el-select :placeholder="$t('public.deviceType')" v-model="form.deviceTypeCode" @change="toQuery()">
            <el-option :label="index" :value="item" v-for="(item, index) in myDeviceName" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('userManage.feedbackDate')">
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd HH:mm:ss" :start-placeholder="$t('public.statrtDate')"
            :end-placeholder="$t('public.endDate')" :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('public.identity')" width="80">
          <template slot-scope="scope">
            <div>{{ getRoleName(scope.row.userType) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.userNickName')" width="120">
          <template slot-scope="scope">
            <div class="flex align-center">
              <div class="flex1 ml-5">{{ scope.row.nickname }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.telephone')" width="120">
          <template slot-scope="scope">
            {{ scope.row.mobile || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.store')" width="200" v-if="form.feedbackType == 'store'">
          <template slot-scope="scope">
            <div>{{ scope.row.storeName }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.questionType')" width="110">
          <template slot-scope="scope">
            <div>{{ scope.row.issueType }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.deviceCode')" width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.deviceSn || '--' }}</div>
            <a class="text-blue" v-if="scope.row.orderNo" :href="`/order/order?orderNo=${scope.row.orderNo}`"
              target="_blank">{{ $t('userManage.viewOrder') }}</a>
          </template>
        </el-table-column>
        <!-- <el-table-column label="设备类型" width="100">
          <template slot-scope="scope">
            {{ myDeviceId[scope.row.deviceTypeCode] }}
          </template>
        </el-table-column> -->
        <el-table-column :label="$t('userManage.feedbackTime')" width="120">
          <template slot-scope="scope">
            {{ parseTime(scope.row.feedbackTime, '{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.feedbackContet')" min-width="250">
          <template slot-scope="scope">
            {{ scope.row.content || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.screenshot')" width="190">
          <template slot-scope="scope">
            <div class="flex flex-wrap" v-if="scope.row.errorImages">
              <el-image class="mr-5" v-for="item in scope.row.errorImages.split(',')" style="width: 50px; height: 50px"
                fit="cover" :src="item" :preview-src-list="scope.row.errorImages.split(',')">
              </el-image>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.reply')" min-width="200">
          <template slot-scope="scope">
            {{ scope.row.reply || '--' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="备注" width="100">
          <template slot-scope="scope">
            {{ scope.row.remark }}
          </template>
        </el-table-column> -->
        <el-table-column :label="$t('public.status')" width="100">
          <template slot-scope="scope">
            <el-button class="ml-0" :type="scope.row.state == 1 ? 'success' : 'danger'" size="mini" plain>{{
              statusObj[scope.row.state] || $t('userManage.untreated') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1)">{{ $t('public.detail') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="700px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form label-width="auto" class="custom-form">
          <el-form-item :label="$t('userManage.feedbackContet')">
            <div>{{ curRow.content }}</div>
          </el-form-item>
          <el-form-item :label="$t('userManage.errorScreenshot')"
            v-if="dform.errorImages && dform.errorImages.length > 0">
            <el-image class="mr-5" v-for="item in dform.errorImages" style="width: 50px; height: 50px" :src="item"
              :preview-src-list="dform.errorImages"></el-image>
          </el-form-item>
          <el-form-item :label="$t('userManage.backendReply')">
            <el-input v-model="dform.reply" type="textarea" :rows="4"
              :placeholder="$t('userManage.replyText')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center" v-if="curRow.state == 0">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRoleName
} from '@/utils/index.js'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
export default {
  name: 'userList',
  components: {
    Pagination,
    condition
  },
  data() {
    return {
      getRoleName: getRoleName,
      clickSubmit: false,
      pickerOptionsEnd: {
        disabledDate: (time) => {
          let timeOptionRange = this.timeOptionRange
          let secondNum = 60 * 60 * 24 * 31 * 1000
          if (timeOptionRange) {
            return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
              .getTime() - secondNum) || time.getTime() > Date.now()
          }
          return time.getTime() > Date.now()
        },
        onPick: (time) => {
          //当第一时间选中才设置禁用
          if (time.minDate && !time.maxDate) {
            this.timeOptionRange = time.minDate
          }
          if (time.maxDate) {
            this.timeOptionRange = null
          }
        }
      },
      tableMaxH: '250',
      list: [],
      listLoading: false,
      listTotal: 0,
      listQuery: {
        state: '',
        page: 1,
        size: 20
      },
      form: {
        feedbackType: 'brand'
      },
      statInfo: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      dialogTitle: {
        1: this.$t('userManage.feedbackDetails')
      },
      curRow: {},
      curIdx: 0,
      dform: {},

      issue: {},
      replyDialog: false,
      replyObj: {},

      dealDialog: false,
      deal_status: 1,
      remark: ''
    }
  },
  computed: {
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    device() {
      return this.$store.state.app.device
    },
    dealStatus() {
      return [{
        value: '',
        title: this.$t('public.all'),
        nkey: 'totalCount'
      },
      {
        value: '0',
        title: this.$t('userManage.untreated'),
        nkey: 'processCount'
      },
      {
        value: '1',
        title: this.$t('userManage.processed'),
        nkey: 'finishedCount'
      }
      ]
    },
    feedbackType() {
      return {
        brand: this.$t('userManage.platformIssues'),
        store: this.$t('userManage.merchantIssues'),
      }
    },
    statusObj() {
      return {
        0: this.$t('userManage.untreated'),
        1: this.$t('userManage.processed')
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == '') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let queryKey = [],
      query = this.$route.query
    for (var i in queryKey) {
      this[queryKey[i]] = query[queryKey[i]]
    }
    if (this.$route.meta.reload) {
      this.getList()
    } else if (this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery(1)
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted(options) {

  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getStat()
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.form = {
        feedbackType: 'brand'
      }
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getStat()
      this.getList()
    },

    /**
     * 获取数量
     */
    getStat() {
      var params = Object.assign({}, this.form)
      if (params.date) {
        params.startDate = params.date[0]
        params.endDate = params.date[1]
        delete params.date
      }
      this.$get('iot-saas-basic/admin/feedback/findBrandCount', params).then(res => {
        this.statInfo = res
      })
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.date) {
        params.startDate = params.date[0]
        params.endDate = params.date[1]
        delete params.date
      }
      this.$get('iot-saas-basic/admin/feedback/findBrandPage', params).then(res => {
        this.list = res.rows
        this.listLoading = false
        this.clickSubmit = false
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
        }
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前行
     * @param {Object} dialogType dialog内容显示类型 1: '查看反馈详情'
     * @param {Object} idx 当前行所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          if (dialogType == 1) {
            this.dform = {
              id: row.id,
              errorImages: (row.errorImages ? row.errorImages.split(',') : []),
              reply: row.reply
            }
          }
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
      switch (this.dialogType) {
        case 1:
          params.state = 1
          this.$post('iot-saas-basic/admin/feedback/replById', params).then(res => {
            this.$post('iot-saas-basic/admin/feedback/updateById', params).then(res => {
              this.$message({
                type: 'success',
                message: that.$t('public.operationSuccessful')
              })
              this.curRow.state = params.state
              this.curRow.reply = params.reply
              this.dialogStatus = false
            })
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-icon-circle-close {
  color: #fff;
}
</style>
