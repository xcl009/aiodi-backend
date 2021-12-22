<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <div class="mb-20 flex align-center">
        <h4 class="mr-10 mb-0 mt-0">投诉单详情</h4>
        <el-tag size="mini" :type="info.complaint_state == 'PROCESSED' ? 'primary' : 'danger'">
          {{ statu[info.complaint_state] }}
        </el-tag>
      </div>
      <el-row class="fs-s4">
        <el-col :xs="{span: 24}" :sm="{span: 12}">
          <div class="mb-10">投诉人openid：{{ info.payer_openid }}</div>
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 12}">
          <div class="mb-10">联系方式：{{ info.payer_phone }}</div>
        </el-col>
        <template v-for="item in info.complaint_order_info">
          <el-col :xs="{span: 24}" :sm="{span: 12}">
            <div class="mb-10">交易单号：{{ item.transaction_id }}</div>
            <div class="mb-10">商户单号：{{ item.out_trade_no }}</div>
          </el-col>
          <el-col :xs="{span: 24}" :sm="{span: 12}">
            <div class="mb-10">订单金额：￥{{ item.amount }}</div>
          </el-col>
        </template>
      </el-row>

      <el-table
        class="mt-20"
        :data="list"
        border>
        <el-table-column label="时间" width="110">
          <template slot-scope="scope">
            {{ RFCToDate(scope.row.operate_time) }}
          </template>
        </el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{ scope.row.operator }}
          </template>
        </el-table-column>
        <el-table-column label="动作类型">
          <template slot-scope="scope">
            {{ operateType[scope.row.operate_type] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="内容">
          <template slot-scope="scope">
            {{ scope.row.operate_details }}
          </template>
        </el-table-column>
        <el-table-column label="图片">
          <template slot-scope="scope">
            <div>
              <template v-for="item in scope.row.image_list">
              <el-image
                  style="width: 50px; height: 50px"
                  :src="item"
                  :preview-src-list="scope.row.image_list">
                </el-image>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-20">
        <el-button type="primary" @click="formDialog = true" v-if="info.complaint_state != 'PROCESSED'">&nbsp;&nbsp;&nbsp;&nbsp;留言&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
        <el-button type="info" @click="endComplaint()" v-if="info.complaint_state != 'PROCESSED'">投诉处理完成</el-button>
      </div>
    </div>

    <el-dialog title="留言给用户" :visible.sync="formDialog">
      <el-form label-width="130px">
        <el-form-item label="留言内容">
          <el-input v-model="formInfo.response_content" rows="4" type="textarea" />
        </el-form-item>
        <el-form-item label="图片凭证">
          <upload v-model="formInfo.response_images" :emitUrl="false" :limit="4" action='agentapi/analysis/wx_complaint_updimg'/>
          <div class="fs-s3 text-gray">最多4张</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="formDialog = false">取 消</el-button>
        <el-button type="primary" @click="postEdit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import upload from '@/components/upload/two'
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

        operateType: {
          USER_CREATE_COMPLAINT: '用户提交投诉',
          USER_CONTINUE_COMPLAINT: '用户继续投诉',
          USER_RESPONSE: '用户留言',
          PLATFORM_RESPONSE: '平台留言',
          MERCHANT_RESPONSE: '商户留言',
          MERCHANT_CONFIRM_COMPLETE: '商户处理完成',
          COMPLAINT_FULL_REFUNDED: '投诉单全额退款',
          USER_CREATE_COMPLAINT_SYSTEM_MESSAGE: '用户提交投诉系统通知',
          COMPLAINT_FULL_REFUNDED_SYSTEM_MESSAGE: '投诉单全额退款系统通知',
          USER_CONTINUE_COMPLAINT_SYSTEM_MESSAGE: '用户继续投诉系统通知',
          MERCHANT_CONFIRM_COMPLETE_SYSTEM_MESSAGE: '商户处理完成系统通知',
          USER_REVOKE_COMPLAINT: '用户主动撤诉',
          USER_COMFIRM_COMPLAINT: '用户确认投诉解决',
        },
        statu: {
          PENDING: "待处理",
          PROCESSING: "处理中",
          PROCESSED: "已处理完成"
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
        let url = 'agentapi/analysis/wx_complaint_response', params = JSON.parse(JSON.stringify(this.formInfo))
        params.response_images = this.arrayKeys(params.response_images, 'media_id')
        this.loadObj = this.$loading({
          lock: true,
          text: '提交中',
          spinner: 'el-icon-loading'
        })
        this.$post(url, params).then(res => {
          this.loadObj.close()
          this.formDialog = false
          this.$message({
            message: '留言成功',
            type: 'success'
          })
          this.getList()
        }).catch(err=>{
          this.loadObj.close()
        })
      },

      /**
       * @param {Object} time RFC3339 日期格式
       * RFC3339转为标准格式日期
       */
      RFCToDate(time){
        var date = new Date(time).toJSON();
        return new Date(+new Date(date)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
      },

      /**
       * 完结投诉
       */
      endComplaint(){
        let that = this
        this.$alert('确定已处理完成完成反馈吗？', '完结反馈', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              that.loadObj = that.$loading({
                lock: true,
                text: '提交中',
                spinner: 'el-icon-loading'
              })
              that.$post('agentapi/analysis/wx_complaint_complete', {
                complaint_id: that.id
              }).then(res => {
                that.loadObj.close()
                that.$message({
                  message: '完结成功',
                  type: 'success'
                })
                that.$router.push({
                  path: '/userManage/payComplaints'
                })
              }).catch( err => {
                that.loadObj.close()
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
