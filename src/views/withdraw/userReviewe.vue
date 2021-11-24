<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="提现方式:">
          <el-select v-model="form.withdraw_type" @change="toQuery()">
            <el-option :label="item" :value="index" v-for="(item, index) in config.withdraw_way"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户昵称:">
          <el-input v-model="form.search_nike_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-sm-and-down">
          <el-input v-model="form.search_mobile" />
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-md-and-down">
          <el-input v-model="form.search_uid" />
        </el-form-item>
        <el-form-item label="提现ID:" class="hidden-lg-and-down">
          <el-input v-model="form.search_id" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xg-and-down">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="datetime"
              placeholder="开始日期"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="结束日期"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '用户提现记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="手机号码:" class="hidden-md-and-up">
          <el-input v-model="form.search_mobile" />
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-lg-and-up">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="提现ID:" class="hidden-xg-and-up">
          <el-input v-model="form.search_uid" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xl-only">
          <div class="flex">
            <el-date-picker
              v-model="form.begin"
              type="datetime"
              placeholder="开始日期"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.end"
              type="datetime"
              placeholder="结束日期"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="flex bg-white">
        <div class="flex1">
          <el-tabs v-model="listQuery.withdraw_status" class="mb-0" type="card" @tab-click="typeClick">
            <el-tab-pane :label="`全部(${numInfo.all_num || 0})`" name="-1" />
            <el-tab-pane :label="`申请中(${numInfo.appling_num || 0})`" name="0" />
            <el-tab-pane :label="`已拒绝(${numInfo.refused_num || 0})`" name="2" />
            <el-tab-pane :label="`返现中(${numInfo.drawbacking_num || 0})`" name="3" />
            <el-tab-pane :label="`已到账(${numInfo.sended_num || 0})`" name="4" />
          </el-tabs>
        </div>
        <div class="pl-15 tabs-right fs-s3">
          <span class="mr-15">总提现：{{ stat_data.total_apply_amount || 0 }}元</span>
          <span class="mr-15">平台手续费：{{ stat_data.final_fee_amount || 0 }}元</span>
        </div>
      </div>
      <el-table
        class="ptd-5"
        id="list_table"
        ref="list_table"
        v-loading="listLoading"
        :data="list"
        :max-height="tableMaxH"
        element-loading-text="Loading"
        stripe
        highlight-current-row
      >
        <el-table-column label="提现ID" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户ID" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.uid }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar size="small" :src="scope.row.user_avatar" />
              <div class="flex1 ml-5">{{ scope.row.user_nick_name }}<br>{{ scope.row.user_mobile }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现金额">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.withdraw_money }}</div>
          </template>
        </el-table-column>
        <el-table-column label="手续费">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.withdraw_service_fee }}</div>
          </template>
        </el-table-column>
        <el-table-column label="到账金额">
          <template slot-scope="scope">
            <div class="el-link el-link--success">{{ scope.row.withdraw_money_get }}</div>
          </template>
        </el-table-column>
        <el-table-column label="到帐账户" width="220">
          <template slot-scope="scope">
            <div v-if="scope.row.withdraw_type == 0">
              <div>姓名：{{ scope.row.withdraw_bank_uname }}</div>
              <div>银行：{{ scope.row.withdraw_bank_info }}</div>
              <div>卡号：{{ scope.row.withdraw_bank_id }}</div>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdraw_type == 3">
              <div class="mr-5 flex1">{{ scope.row.wx_account_name }}</div>
              <el-image
                class="pay-code"
                :src="scope.row.wx_account_qrcode"
                fit="scale-down"
                :preview-src-list="[scope.row.wx_account_qrcode]"
                style="height: 80px">
              </el-image>
            </div>
            <div class="flex align-center" v-else-if="scope.row.withdraw_type == 4">
              <div class="mr-5 flex1">{{ scope.row.zfb_account_name }}</div>
              <el-image
                class="pay-code"
                style="height: 80px"
                fit="scale-down"
                :src="scope.row.zfb_account_qrcode"
                :preview-src-list="[scope.row.zfb_account_qrcode]">
              </el-image>
            </div>
            <div class="flex align-center" v-else>
              <el-avatar size="small" :src="scope.row.user_avatar"></el-avatar>
              <div class="flex1 pl-10">{{ scope.row.user_nick_name || "--" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现方式" width="150">
          <template slot-scope="scope">
            {{ config.withdraw_way[scope.row.withdraw_type] }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div class="el-link el-link--success">{{ statusObj[scope.row.withdraw_status] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div v-if="scope.row.withdraw_status == 1">
              <el-button size="mini" type="primary" round @click="upApply(scope.row, 1)">
                通过
              </el-button>
              <el-button size="mini" type="primary" round @click="upApply(scope.row, 0)">
                驳回
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center bg-white">
        <pagination
          v-show="listQuery.page_num > 0"
          :page.sync="listQuery.start"
          :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
export default {
  name: 'UserReviewe',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      son_id: this.$route.query.son_id || '',
      form: {},
      beginOptions: {
        disabledDate: (time) => {
          if (this.form.end) {
            return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          } else {
            return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          }
        }
      },
      endOptions: {
        disabledDate: (time) => {
          if (this.form.begin) {
            return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          } else {
            return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          }
        }
      },
      numInfo: {},
      stat_data: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        withdraw_status: this.$route.query.withdraw_status || '-1',
        start: 1,
        total: 10,
        page_num: 1,
        limit: 20,
      },
      statusObj: {
        0: '发起提现申请',
        1: '等待审核',
        2: '审核不通过',
        3: '审核完毕, 返现中',
        4: '返现已到账并确认'
      },
      agentInfo: {}
    }
  },
  mounted(options) {
    this.agentInfo = window.agentInfo
    this.getNum()
    this.getList()
  },
  methods: {
    /**
       * 数量
       */
    getNum() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        user_type: this.user_type
      })
      this.$get('agentapi/user_withdraw_applys_stat_num', listQuery).then(res => {
        this.numInfo = res
      })
    },

    /**
       * 搜索查询
       */
    toQuery(type = 0) {
		  this.$refs.filterDrawer.hide()
      if (type == 1) {
        this.form = {}
        this.listQuery.start = 1
      } else {
        this.listQuery.start = 1
      }
      this.getList()
    },

    /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
    typeClick(tab) {
      this.listQuery.start = 1
      this.getList()
    },

    getList() {
      const listQuery = Object.assign(this.form, this.listQuery, {
        start: this.listQuery.start - 1
      })
      const url = 'agentapi/apply/user_withdraw_applys'
      if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
      if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
      this.$get(url, listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.stat_data = res.stat_data
        this.listQuery.page_num = res.page_num
        if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
       * 审核提现
       * @param {Object} row
       */
    upApply(row, agree) {
      if (agree == 1) {
        this.$alert('确定该笔提现申请通过审核吗？', '提现审核', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.postApply(row, agree)
            }
          }
        })
      } else if (agree == 0) {
        this.$alert('确定驳回该笔提现申请吗？', '提现审核', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.postApply(row, agree)
            }
          }
        })
      }
    },

    /**
       * 提交选择结果
       * @param {Object} id
       * @param {Object} agree
       */
    postApply(row, agree) {
      const url = 'agentapi/apply/review_user_withdraw_apply'
      this.$post(url, {
        apply_id: row.id,
        agree: agree
      }).then(res => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        if(row.withdraw_type == 0 || row.withdraw_type == 3 || row.withdraw_type == 4){
          row.withdraw_status = (agree == 0 ? 2 : 4)
        } else {
          row.withdraw_status = (agree == 0 ? 2 : 3)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .pay-code .el-image__inner{
    width: inherit;
  }
</style>
