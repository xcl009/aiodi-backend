<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">提现状态</div>
          <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title }(${numInfo[item.nkey] || 0})`" :name="''+item.value+''" v-for="item in statusArr" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item label="提现日期">
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange"
            value-format="yyyy-MM-dd" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
            @change="toQuery()">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="提现方式">
          <el-select v-model="form.withdrawType" placeholder="提现方式" @change="toQuery()">
            <el-option label="全部" value="" />
            <el-option :label="item" :value="index" v-for="(item, index) in siteInfo.withdrawType" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理姓名" v-if="userType == 1" >
          <el-input v-model="form.name" placeholder="代理姓名"/>
        </el-form-item>
        <el-form-item label="商户名称" v-if="userType == 2" >
          <el-input v-model="form.storeName" placeholder="商户名称"/>
        </el-form-item>
        <el-form-item label="用户昵称" v-if="userType == 3" >
          <el-input v-model="form.nickName" placeholder="用户昵称"/>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="form.mobile" placeholder="手机号码" />
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column label="提现单号" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="代理商" min-width="150" v-if="userType == 1">
          <template slot-scope="scope">
            <div>{{ scope.row.userNickName || '--' }}</div>
            <div>{{ scope.row.userMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户" min-width="150" v-if="userType == 2">
          <template slot-scope="scope">
            <div>{{ scope.row.storeName || '--' }}</div>
            <div>{{ scope.row.userMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="头像" width="60" v-if="userType == 3">
          <template slot-scope="scope">
            <el-avatar class="block" :src="scope.row.userAvatar"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="用户" min-width="150" v-if="userType == 3">
          <template slot-scope="scope">
            <div>{{ scope.row.userNickName || '--' }}</div>
            <div>{{ scope.row.userMobile || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="提现时间" width="94">
          <template slot-scope="scope">
            {{ scope.row.createTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="提现金额(元)">
          <template slot-scope="scope">
            {{ scope.row.amount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="手续费(元)">
          <template slot-scope="scope">
            <div>单笔：{{ scope.row.feeDeal || '0.00' }}</div>
            <div>税点：{{ scope.row.feePercent || '0.00' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="应到账(元)">
          <template slot-scope="scope">
            {{ accSub(accSub(scope.row.amount, scope.row.feeDeal), scope.row.feePercent) }}
          </template>
        </el-table-column>
        <el-table-column label="实际到账(元)">
          <template slot-scope="scope">
            {{ scope.row.amountReceived || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="到账账户" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.withdrawType == 5">
              <div>{{ scope.row.cardName }}</div>
              <div>{{ scope.row.bankName }}<span class="ml-10">{{ scope.row.branchName }}</span></div>
              <div>{{ scope.row.cardNo }}</div>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdrawType == 2 || scope.row.withdrawType == 4">
              <div class="mr-10">
                <div>{{ scope.row.userName }}</div>
                <div class="fs-s2">收款码</div>
              </div>
              <el-image class="pay-code" :src="scope.row.qrcode" fit="scale-down"
                :preview-src-list="[scope.row.qrcode]">
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
        <el-table-column label="真实姓名" width="120">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.userName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="提现方式" width="120">
          <template slot-scope="scope">
            {{ siteInfo.withdrawType[scope.row.withdrawType] }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div class="el-link el-link--success">
              <span>{{ statusObj[scope.row.status] }}</span>
              <span class="ml-5" @click="setRows(2, scope.row)">查询</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" width="170">
          <template slot-scope="scope">{{ scope.row.remark }}</template>
        </el-table-column>
        <el-table-column label="操作" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(1, scope.row, 2)" :disabled="scope.row.status != 0">通过</el-button>
              <el-button type="text" @click="setRows(1, scope.row, 1)" :disabled="scope.row.status != 0">拒绝</el-button>
              <el-button type="text" @click="copyText(scope.row.wechatOpenid)" :disabled="!scope.row.wechatOpenid">微信Id</el-button>
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
          <div class="mb-30 text-black">确定该笔提现申请通过审核吗？</div>
          <el-input v-model="dform.remark" placeholder="请输入备注内容" type="textarea" :rows="4" />
        </div>
      </template>
      <template v-if="dialogType == 1">
        <div class="text-center custom-form">
          <div class="mb-30 text-black">确定该笔提现申请拒绝通过吗？</div>
          <el-input v-model="dform.remark" placeholder="请输入备注内容" type="textarea" :rows="4" />
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import {
    accSub,
    copyText
  } from '@/utils/index'
  export default {
    name: 'agentWithdraw',
    components: {
      Pagination,
      condition
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
        statusObj: {
          0: '审核中',
          1: '审核不通过 ',
          2: '审核通过,到账中',
          3: '审核通过,已到账'
        },
        statusArr: [
          {
            value: '-1',
            title: '全部',
            nkey: 'all'
          },
          {
            value: '0',
            title: '审核中',
            nkey: 'applying'
          },
          {
            value: 1,
            title: '已拒绝',
            nkey: 'reject'
          },
          {
            value: 2,
            title: '到账中',
            nkey: 'approved'
          },
          {
            value: 3,
            title: '已通过',
            nkey: 'done'
          }
        ],
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
        dialogTitle: {
          2: '通过提现',
          1: '拒绝提现'
        },
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
        if(params.status == '-1') delete params.status
        if (params.date && params.date.length > 0) {
          params.startTime = params.date[0] + ' 00:00:00'
          params.endTime = params.date[1] + ' 23:59:59'
          delete params.date
        }
        this.$get('iot-saas-pay/admin/pay/withdraw/list', params).then(res => {
          this.list = res.rows || []
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 统计数据
       */
      getStat() {
        var params = Object.assign({}, this.form, this.listQuery)
        params.userType = this.userType
        if(params.status == '-1') delete params.status
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
                message: '提交成功',
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
