<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select placeholder="设备类型" v-model="form.search_depend_type" @change="toQuery()">
          <el-option :label="index" :value="item" v-for="(item, index) in deviceNameObj"/>
        </el-select>
        <el-input placeholder="手机号码" v-model="form.search_mobile" />
        <el-input placeholder="商户名称" v-model="form.search_store_name" />
        <el-input placeholder="设备SN" v-model="form.search_goods_sn" />
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.day"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="flex mb-5">
        <div class="flex1 white-space">
          <el-scrollbar>
            <el-button size="medium" :type="listQuery.deal_status == item.value ? 'primary' : ''" class="mr-10 mb-10 ml-0" :class="{'btn-body': listQuery.deal_status != item.value}" v-for="item in dealStatus" @click="toQuery(item.value)">{{ item.title }}({{numInfo[item.nkey] || 0}})</el-button>
          </el-scrollbar>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH"
        element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="身份" align="center" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.from_type == 0 ? '代理商' : '用户' }}</div>
            <div>ID:{{ scope.row.from_id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户昵称" align="center" width="120">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar size="small" :src="scope.row.from_avatar"></el-avatar>
              <div class="flex1 ml-5">{{ scope.row.from_name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" align="center" width="80">
          <template slot-scope="scope">
            {{ scope.row.mobile || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="问题类型" align="center" width="110">
          <template slot-scope="scope">
            <div>{{ issueArr[scope.row.type] }}</div>
            <div>{{ scope.row.user_type }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户" align="center" width="160">
          <template slot-scope="scope">
            {{ scope.row.store_name }} <span v-if="scope.row.door">(房间号：{{ scope.row.door }})</span>
          </template>
        </el-table-column>
        <el-table-column label="二维码" align="center" width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.sao_device_sn }}</div>
            <a class="text-blue" v-if="scope.row.order_sn" :href="`/order/order?order_sn=${scope.row.order_sn}`" target="_blank">查看订单</a>
          </template>
        </el-table-column>
        <el-table-column label="设备类型" align="center" width="80">
          <template slot-scope="scope">
            <div v-if="scope.row.depend_type == 1">{{ scope.row.support_buletooth == 1 ? '蓝牙线' : '密码线' }}</div>
            <div v-else>{{ deviceKeyObj[scope.row.depend_type] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="反馈内容" align="center" width="220">
          <template slot-scope="scope">
            {{ scope.row.content || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="错误截图" align="center" width="190">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-image class="mr-5" v-for="item in scope.row.img_url" style="width: 50px; height: 50px" :src="item"
                :preview-src-list="scope.row.img_url">
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="反馈时间" align="center" width="100">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date, '{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column label="身份" align="center" width="60">
          <template slot-scope="scope">
            {{ scope.row.from_type == 0 ? '代理商' : '用户' }}
          </template>
        </el-table-column>
        <el-table-column label="回复" align="center" min-width="250">
          <template slot-scope="scope">
            <div class="fs-s1 text-gray">
              <div v-for="item in scope.row.reply_list">
                {{ parseTime(item.add_date, '{m}-{d} {h}:{i}') }}回复：{{ item.content }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" width="100">
          <template slot-scope="scope">
            {{ scope.row.remark }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="replyDialog = true; issue = scope.row">回复</el-button>
            <el-button type="primary" size="mini" @click="deal_status = scope.row.deal_status; remark = scope.row.remark; dealDialog = true; issue = scope.row;">{{ statusObj[scope.row.deal_status] }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.count > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="listQuery.count"
          @pagination="getList"
        />
      </div>
    </div>

    <el-dialog title="问题处理" :visible.sync="dealDialog">
      <el-form label-width="auto">
        <el-form-item label="状态：">
          <el-radio-group v-model="deal_status">
            <el-radio v-for="(item, index) in statusObj" :label="Number(index)">{{ item }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input v-model="remark" type="textarea" :rows="4"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deal()" :disabled="clickSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="问题回复" :visible.sync="replyDialog">
      <el-input type="textarea" v-model="replyObj.content" rows="4"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="reply()" :disabled="clickSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
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
        clickSubmit: false,
        dealStatus: [
          {
            value: 0,
            title: '全部',
            nkey: 'all_num'
          },
          {
            value: 1,
            title: '未处理',
            nkey: 'sended_num'
          },
          {
            value: 2,
            title: '处理中',
            nkey: 'dealing_num'
          },
          {
            value: 3,
            title: '已处理',
            nkey: 'dealed_num'
          }
        ],

        issueArr: {
          1: '订单问题',
          2: '系统bug',
          3: '其他问题',
          4: '设备问题'
        },
        statusObj: {
          0: '未处理',
          1: '处理中',
          2: '已处理'
        },
        form: {},
        tableMaxH: '250',
        numInfo: {},
        list: [],
        listLoading: false,
        listQuery: {
          deal_status: this.$route.query.deal_status || '3',
          start: 1,
          total: 10,
          page_num: 1,
          limit: 20
        },
        issue: {},
        replyDialog: false,
        replyObj: {},

        dealDialog: false,
        deal_status: 1,
        remark: ''
      }
    },
    computed: {
      deviceNameObj() {
        return this.$store.state.user.deviceNameObj
      },
      deviceKeyObj() {
        return this.$store.state.user.deviceKeyObj
      },
    },
    mounted(options) {
      //this.getNum()
      //this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 数量
       */
      getNum() {
        const listQuery = Object.assign({}, this.listQuery, this.form, {
          user_type: this.user_type
        })
        this.$get('agentapi/feedback/list_num', listQuery).then(res => {
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
        this.getNum()
        this.getList()
      },

      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.listQuery.deal_status = tab.name
        this.listQuery.start = 1
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.form, this.listQuery, {
            start: this.listQuery.start - 1
          }),
          url = 'agentapi/feedback/index'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 82
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 回复
       */
      reply() {
        this.clickSubmit = true
        this.$post('commonapi/feedback/reply', {
          id: this.issue.id,
          type: 0,
          content: this.replyObj.content
        }).then(res => {
          this.replyDialog = false
          this.issue.reply_list.push({
            add_date: Date.parse(new Date()) / 1000,
            content: this.replyObj.content
          })
          this.$message({
            message: '回复成功',
            type: 'success'
          })
          this.clickSubmit = false
        }).catch(err=>{
          this.clickSubmit = false
        })
      },

      /**
       * 处理
       */
      deal() {
        this.clickSubmit = true
        this.$post('agentapi/feedback/dealed_switch', {
          id: this.issue.id,
          deal_status: this.deal_status,
          remark: this.remark
        }).then(res => {
          this.dealDialog = false
          this.issue.deal_status = this.deal_status
          this.issue.remark = this.remark
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.clickSubmit = false
        }).catch(err=>{
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-icon-circle-close {
    color: #fff;
  }
</style>
