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
            <div class="mb-10 cursor" @click="copyText(item.out_trade_no)">{{ $t('public.orderNo') }}：{{
              item.out_trade_no }} <span class="text-primary">{{ $t('public.copy') }}</span></div>
          </el-col>
          <el-col :xs="{ span: 24 }" :sm="{ span: 12 }">
            <div class="mb-10">{{ $t('public.orderMoeny') }}：￥{{ item.amount / 100 }}</div>
          </el-col>
        </template>
      </el-row>

      <el-table class="mt-20 custom" id="list_table" ref="list_table" :data="list">
        <el-table-column :label="$t('public.time')" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.operate_time) }}
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
        <el-button type="primary" @click="dialogType = 1; dialogStatus = true"
          v-if="info.complaint_state != 'PROCESSED'">&nbsp;&nbsp;&nbsp;&nbsp;{{ $t('userManage.leaveAMessage')
          }}&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
        <el-button type="info" @click="dialogType = 2; dialogStatus = true" v-if="info.complaint_state != 'PROCESSED'">{{
          $t('userManage.complaintHandling') }}</el-button>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="620px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" label-width="auto">
          <el-form-item :label="$t('userManage.responseContent')">
            <el-input v-model="dform.responseContent" type="textarea" rows="3"
              :placeholder="$t('userManage.responseContentText')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('userManage.imageVoucher')">
            <upload v-model="dform.responseImages" :emitUrl="false" :limit="4" :upObj="upObj"
              action='iot-saas-pay/admin/wx/complaints/uploadImage' />
            <div class="fs-s3 text-gray">{{ $t('userManage.max4') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <div class="text-black">{{ $t('userManage.areYouProcessed') }}</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-center">{{ $t('userManage.areYouProcessedText') }}</div>
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
import upload from '@/components/upload/'
import { copyText } from '@/utils/index'
export default {
  name: 'PCDetail',
  components: {
    upload
  },
  data() {
    return {
      clickSubmit: false,
      copyText: copyText,
      complaintId: this.$route.query.complaintId,
      appId: this.$route.query.appId,
      info: {},
      list: [],


      upObj: {
        fileType: 'userAvatar',
        appId: this.$route.query.appId
      },
      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {}
    }
  },
  computed: {
    operateType() {
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
    statu() {
      return {
        PENDING: this.$t('public.pendingProcessing'),
        PROCESSING: this.$t('public.processing'),
        PROCESSED: this.$t('public.processed')
      }
    },
    dialogTitle() {
      return {
        1: this.$t('userManage.toTheUser'),
        2: this.$t('userManage.completingComplaints')
      }
    }
  },
  mounted(options) {
    this.getInfo()
    this.getList()
  },
  methods: {
    /**
     * 获取投诉详情
     */
    getInfo() {
      this.$get('iot-saas-pay/admin/wx/complaints/detail', {
        complaintId: this.complaintId,
        appId: this.appId
      }).then(res => {
        this.info = res
      })
    },

    /**
     * 获取投诉协商历史
     */
    getList() {
      this.$get('iot-saas-pay/admin/wx/complaints/queryNegotiationHistory', {
        complaintId: this.complaintId,
        appId: this.appId,
        page: 0,
        size: 100
      }).then((res = {}) => {
        this.list = res.rows || []
      })
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
          if (!params.responseContent) {
            this.$message({
              message: that.$t('userManage.pleaseContet'),
              type: 'error'
            })
            return
          }
          params.responseImages = this.arrayKeys(params.responseImages, 'media_id')
          this.$post('iot-saas-pay/admin/wx/complaints/response', {
            complaintId: this.complaintId,
            appId: this.appId,
            responseContent: params.responseContent,
            responseImages: params.responseImages
          }).then(res => {
            this.$message({
              message: that.$t('userManage.messageSuccessful'),
              type: 'success'
            })
            this.dialogStatus = false
            this.clickSubmit = false
            this.getList()
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 2:
          this.$post('iot-saas-pay/admin/wx/complaints/complate', {
            complaintId: this.complaintId,
            appId: this.appId
          }).then(res => {
            this.$message({
              message: that.$t('userManage.completedSuccessfully'),
              type: 'success'
            })
            this.getInfo()
            this.getList()
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
