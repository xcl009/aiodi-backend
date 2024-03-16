<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
      @saveXlsx="saveXlsx">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('cash.withdrawalStatus') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}(${numInfo[item.nkey] || 0})`" :name="'' + item.value + ''"
              v-for="item in statusArr" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item :label="$t('cash.withdrawalDate')">
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange"
            value-format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('public.statrtDate')"
            :end-placeholder="$t('public.endDate')" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('moeny.withdrawalMethod')">
          <el-select v-model="form.withdrawType" :placeholder="$t('moeny.withdrawalMethod')" @change="toQuery()">
            <el-option :label="$t('public.all')" value="" />
            <el-option :label="item" :value="index" v-for="(item, index) in siteInfo.withdrawType" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('public.agentName')" v-if="userType == 1">
          <selectSearch v-model="form.agentIds" :type="5" name="name" :placeholder="$t('public.agentName')"
            @change="toQuery()"></selectSearch>
        </el-form-item>
        <el-form-item :label="$t('public.storeName')" v-if="userType == 2">
          <selectSearch v-model="form.storeIds" :type="3" name="name" :placeholder="$t('public.storeName')"
            @change="toQuery()"></selectSearch>
        </el-form-item>
        <el-form-item :label="$t('public.phone')" v-if="userType == 3">
          <selectSearch v-model="form.userIds" :type="1" name="mobile" :placeholder="$t('public.phone')"
            @change="toQuery()"></selectSearch>
        </el-form-item>
        <el-form-item :label="$t('public.userId')" v-if="userType == 3">
          <selectSearch v-model="form.userIds" :type="1" name="idLastNine" :placeholder="$t('public.userId')"
            @change="toQuery()"></selectSearch>
        </el-form-item>
        <el-form-item :label="$t('public.userNickName')" v-if="userType == 3">
          <selectSearch v-model="form.userIds" :type="2" name="nickname" :placeholder="$t('public.userNickName')"
            @change="toQuery()"></selectSearch>
        </el-form-item>
        <!-- <el-form-item label="手机号码">
          <el-input v-model="form.mobile" placeholder="手机号码" />
        </el-form-item> -->
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column :label="$t('cash.withdrawalNumber')" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.agentText')" min-width="150" v-if="userType == 1">
          <template slot-scope="scope">
            <div>{{ scope.row.userNickName || '--' }}</div>
            <div>{{ scope.row.userMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.store')" min-width="150" v-if="userType == 2">
          <template slot-scope="scope">
            <div>{{ scope.row.storeName || '--' }}</div>
            <div>{{ scope.row.userMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.img')" width="60" v-if="userType == 3">
          <template slot-scope="scope">
            <el-avatar class="block" :src="scope.row.userAvatar"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.user')" min-width="150" v-if="userType == 3">
          <template slot-scope="scope">
            <div>{{ scope.row.userNickName || '--' }}</div>
            <div>{{ scope.row.userMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.withdrawalTime')" width="94">
          <template slot-scope="scope">
            {{ scope.row.createTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('public.withdrawalAmount')}(${$t('public.element')})`">
          <template slot-scope="scope">
            {{ scope.row.amount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('public.commission')}(${$t('public.element')})`">
          <template slot-scope="scope">
            <div>{{ $t('system.singleStroke') }}：{{ scope.row.feeDeal || '0.00' }}</div>
            <div>{{ $t('system.taxPoints') }}：{{ scope.row.feePercent || '0.00' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('cash.accountsReceivable')}(${$t('public.element')})`">
          <template slot-scope="scope">
            {{ accSub(accSub(scope.row.amount, scope.row.feeDeal), scope.row.feePercent) }}
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('moeny.actualReceipt')}(${$t('public.element')})`">
          <template slot-scope="scope">
            {{ scope.row.amountReceived || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('moeny.toAccount')" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.withdrawType == 5">
              <div>{{ scope.row.cardName }}</div>
              <div>{{ scope.row.bankName }}<span class="ml-10">{{ scope.row.branchName }}</span></div>
              <div>{{ scope.row.cardNo }}</div>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdrawType == 2 || scope.row.withdrawType == 4">
              <div class="mr-10">
                <div>{{ scope.row.userName }}</div>
                <div class="fs-s2">{{ $t('public.qrcode') }}</div>
              </div>
              <el-image class="pay-code" :src="scope.row.qrcode" fit="scale-down" :preview-src-list="[scope.row.qrcode]">
              </el-image>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdrawType == 3">
              <el-avatar size="small" :src="scope.row.aliHeadUrl || scope.row.userAvatar"></el-avatar>
              <div class="pl-10">{{ scope.row.aliNickname || scope.row.userNickName }}</div>
            </div>
            <div class="flex align-center" v-else>
              <el-avatar size="small" :src="scope.row.wechatHeadUrl || scope.row.userAvatar"></el-avatar>
              <div class="pl-10">{{ scope.row.wechatNickname || scope.row.userNickName }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.name')" width="120">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.userName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('moeny.withdrawalMethod')" width="120">
          <template slot-scope="scope">
            {{ siteInfo.withdrawType[scope.row.withdrawType] }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.status')">
          <template slot-scope="scope">
            <div class="el-link el-link--success">
              <span>{{ statusObj[scope.row.status] }}</span>
              <span class="ml-5" @click="setRows(2, scope.row)" v-if="[1, 3].indexOf(scope.row.withdrawType) > $alert">{{
                $t('public.query') }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.remark')" width="170">
          <template slot-scope="scope"><span class="text-danger">{{ scope.row.remark }}</span></template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(1, scope.row, 2)" :disabled="scope.row.status != 0">{{
                $t('public.passThrough') }}</el-button>
              <el-button type="text" @click="setRows(1, scope.row, 1)" :disabled="scope.row.status != 0">{{
                $t('public.refuse') }}</el-button>
              <el-button type="text" @click="copyText(scope.row.wechatOpenid)" :disabled="!scope.row.wechatOpenid">{{
                $t('cash.wxId') }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 2">
        <div class="text-center custom-form">
          <div class="mb-30 text-black">{{ $t('goods.text') }}</div>
          <el-input v-model="dform.remark" :placeholder="$t('goods.inputText')" type="textarea" :rows="4" />
        </div>
      </template>
      <template v-if="dialogType == 1">
        <div class="text-center custom-form">
          <div class="mb-30 text-black">{{ $t('goods.text1') }}</div>
          <el-input v-model="dform.remark" :placeholder="$t('goods.inputText')" type="textarea" :rows="4" />
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <xlsx ref="toXlsx" :fileName="$t('cash.withdrawalRecords')"></xlsx>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import xlsx from '@/components/xlsx/'
import {
  accSub,
  copyText
} from '@/utils/index'
export default {
  name: 'agentWithdraw',
  components: {
    Pagination,
    condition,
    selectSearch,
    xlsx
  },
  props: {
    userType: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      accSub: accSub,
      copyText: copyText,
      clickSubmit: false,
      numInfo: {},
      form: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listTotal: 0,
      listQuery: {
        status: this.$route.query.status || '-1',
        page: 1,
        size: 20
      },

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {}
    }
  },
  activated() {
    if (this.$route.meta.reload) {
      this.getList()
    } else if (!this.list || this.list.length == 0) {
      this.toQuery()
    }
  },
  computed: {
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    device() {
      return this.$store.state.app.device
    },
    statusObj() {
      return {
        0: this.$t('public.inReview'),
        1: this.$t('cash.typeText'),
        2: this.$t('cash.typeText1'),
        3: this.$t('cash.typeText2')
      }
    },
    statusArr() {
      return [
        {
          value: '-1',
          title: this.$t('public.all'),
          nkey: 'all'
        },
        {
          value: '0',
          title: this.$t('public.inReview'),
          nkey: 'applying'
        },
        {
          value: 1,
          title: this.$t('cash.rejected'),
          nkey: 'reject'
        },
        {
          value: 2,
          title: this.$t('cash.approved'),
          nkey: 'approved'
        },
        {
          value: 3,
          title: this.$t('public.passed'),
          nkey: 'done'
        }
      ]
    },
    dialogTitle() {
      return {
        2: this.$t('goods.dialogTitle'),
        1: this.$t('goods.dialogTitle1')
      }
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
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
      this.getStat()
    },

    /**
     * 重置查询
     */
    reset() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.form = {
        activated_status: 1
      }
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
      this.getStat()
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      params.userType = this.userType
      if (params.status == '-1') delete params.status
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      this.$get('iot-saas-pay/admin/pay/withdraw/list', params).then((res = {}) => {
        this.list = res.rows || []
        if (this.outStatus) {
          let end = false
          if (params.size > this.list.length) end = true
          this.$nextTick(() => {
            this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size), () => {
              if (end) {
                this.outStatus = false
                this.toQuery()
              } else {
                this.listQuery.page += 1
                this.getList()
              }
            })
          })
        } else {
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
          }
        }
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 导出
     */
    saveXlsx() {
      this.outStatus = true
      this.listLoading = true
      this.listQuery.size = 100
      this.list = []
      this.getList()
    },

    /**
     * 统计数据
     */
    getStat() {
      var params = Object.assign({}, this.form, this.listQuery)
      params.userType = this.userType
      if (params.status == '-1') delete params.status
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      this.$get('iot-saas-pay/admin/pay/withdraw/summary', params).then(res => {
        this.numInfo = res
      })
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 2: '提现通过', 1: '提现拒绝'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          break
        case 2:
          this.$post('iot-saas-pay/admin/pay/withdraw/check', {
            id: row.id
          }).then(res => {
            this.getList()
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
        case 2:
          this.$post('iot-saas-pay/admin/pay/withdraw/approve', {
            id: curRow.id,
            status: this.dialogType,
            remark: params.remark
          }).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            curRow.status = this.dialogType
            curRow.remark = params.remark
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
            if (err && err.code == 19876) {
              this.dialogStatus = false
            }
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pay-code {
  width: 50px;
  height: 50px;
}
</style>
