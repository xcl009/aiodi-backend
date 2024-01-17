<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <div class="mb-20 flex align-center">
        <h4 class="mr-10 mb-0 mt-0">{{ $t('userManage.complaintFormDetails') }}</h4>
        <el-tag size="mini" :type="info.complaint_state == 'PROCESSED' ? 'primary' : 'danger'">
          {{ statu[info.complaint_state] }}
        </el-tag>
      </div>
      <el-row class="fs-s4">
        <el-col :xs="{ span: 24 }" :sm="{ span: 12 }">
          <div class="mb-10">{{ $t('userManage.complainantId') }}：{{ info.payer_openid }}</div>
        </el-col>
        <el-col :xs="{ span: 24 }" :sm="{ span: 12 }">
          <div class="mb-10">{{ $t('public.contactInformation') }}：{{ info.payer_phone }}</div>
        </el-col>
        <template v-for="item in info.complaint_order_info">
          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }">
            <div class="mb-10">{{ $t('public.transactionNum') }}：{{ item.transaction_id }}</div>
            <div class="mb-10">{{ $t('public.merchantTrackingNumber') }}：{{ item.out_trade_no }}</div>
          </el-col>
          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }">
            <div class="mb-10">{{ $t('public.orderMoeny') }}：￥{{ item.amount }}</div>
          </el-col>
        </template>
      </el-row>

      <el-table class="mt-20" :data="list" border>
        <el-table-column :label="$t('public.time')" width="110">
          <template slot-scope="scope">
            {{ RFCToDate(scope.row.operate_time) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operator')">
          <template slot-scope="scope">
            {{ scope.row.operator }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('userManage.actionType')">
          <template slot-scope="scope">
            {{ operateType[scope.row.operate_type] || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.content')">
          <template slot-scope="scope">
            {{ scope.row.operate_details }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.image')">
          <template slot-scope="scope">
            <div>
              <template v-for="item in scope.row.image_list">
                <el-image style="width: 50px; height: 50px" :src="item" :preview-src-list="scope.row.image_list">
                </el-image>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-20">
        <el-button type="primary" @click="formDialog = true"
          v-if="info.complaint_state != 'PROCESSED'">&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('userManage.leaveAMessage')
          }}&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
        <el-button type="info" @click="endComplaint()" v-if="info.complaint_state != 'PROCESSED'">{{
          $t('userManage.complaintHandling') }}</el-button>
      </div>
    </div>

    <el-dialog :title="$t('userManage.toTheUser')" :visible.sync="formDialog">
      <el-form label-width="130px">
        <el-form-item :label="$t('userManage.responseContent')">
          <el-input v-model="formInfo.response_content" rows="4" type="textarea" />
        </el-form-item>
        <el-form-item :label="$t('userManage.imageVoucher')">
          <upload v-model="formInfo.response_images" :emitUrl="false" :limit="4"
            action='agentapi/analysis/wx_complaint_updimg' />
          <div class="fs-s3 text-gray">{{ $t('userManage.max4') }}</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="formDialog = false">{{ $t('public.cancel') }}</el-button>
        <el-button type="primary" @click="postEdit()">{{ $t('public.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import upload from '@/components/upload/'
export default {
  name: 'PCDetail',
  components: {
    upload
  },
  data() {
    return {
      id: this.$route.query.id,
      info: {},
      formInfo: {
        complaint_id: this.$route.query.id,
      },
      formDialog: false,
      formEnd: false,
      list: [],
    }
  },
  computed: {
    operateType(){
      return {
        USER_CREATE_COMPLAINT: this.$t('userManage.type'),
        USER_CONTINUE_COMPLAINT: this.$t('userManage.type1'),
        USER_RESPONSE: this.$t('userManage.type2'),
        PLATFORM_RESPONSE: this.$t('userManage.type3'),
        MERCHANT_RESPONSE: this.$t('userManage.type4'),
        MERCHANT_CONFIRM_COMPLETE: this.$t('userManage.type5'),
        COMPLAINT_FULL_REFUNDED: this.$t('userManage.type6'),
        USER_CREATE_COMPLAINT_SYSTEM_MESSAGE: this.$t('userManage.type7'),
        COMPLAINT_FULL_REFUNDED_SYSTEM_MESSAGE: this.$t('userManage.type8'),
        USER_CONTINUE_COMPLAINT_SYSTEM_MESSAGE: this.$t('userManage.type9'),
        MERCHANT_CONFIRM_COMPLETE_SYSTEM_MESSAGE: this.$t('userManage.type10'),
        USER_REVOKE_COMPLAINT: this.$t('userManage.type11'),
        USER_COMFIRM_COMPLAINT: this.$t('userManage.type12'),
      }
    },
    statu(){
      return {
        PENDING: this.$t('public.pendingProcessing'),
        PROCESSING: this.$t('public.processing'),
        PROCESSED: this.$t('public.processed')
      }
    }
  },
  mounted(options) {
    this.getInfo()
    this.getList()
  },
  methods: {
    /**
     * 获取详情
     */
    getInfo() {
      this.$get('agentapi/analysis/wx_complaint_detail', {
        complaint_id: this.id
      }).then(res => {
        this.info = res
      })
    },

    /**
     * 协商历史
     */
    getList() {
      this.$get('agentapi/analysis/wx_complaint_history', {
        complaint_id: this.id
      }).then(res => {
        this.list = res.data
      })
    },

    /**
     * 提交信息
     */
    postEdit(type) {
      let that = this;
      let url = 'agentapi/analysis/wx_complaint_response', params = JSON.parse(JSON.stringify(this.formInfo))
      params.response_images = this.arrayKeys(params.response_images, 'media_id')
      this.loadObj = this.$loading({
        lock: true,
        text: that.$t('public.submitting'),
        spinner: 'el-icon-loading'
      })
      this.$post(url, params).then(res => {
        this.loadObj.close()
        this.formDialog = false
        this.$message({
          message: that.$t('public.operationSuccessful'),
          type: 'success'
        })
        this.getList()
      }).catch(err => {
        this.loadObj.close()
      })
    },

    /**
     * @param {Object} time RFC3339 日期格式
     * RFC3339转为标准格式日期
     */
    RFCToDate(time) {
      var date = new Date(time).toJSON();
      return new Date(+new Date(date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
    },

    /**
     * 完结投诉
     */
    endComplaint() {
      let that = this
      this.$alert(that.$t('user.message7'), that.$t('user.message8'), {
        confirmButtonText: that.$t('public.confirm'),
        callback: action => {
          if (action == 'confirm') {
            that.loadObj = that.$loading({
              lock: true,
              spinner: 'el-icon-loading'
            })
            that.$post('agentapi/analysis/wx_complaint_complete', {
              complaint_id: that.id
            }).then(res => {
              that.loadObj.close()
              that.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              that.$router.push({
                path: '/userManage/payComplaints'
              })
            }).catch(err => {
              that.loadObj.close()
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
