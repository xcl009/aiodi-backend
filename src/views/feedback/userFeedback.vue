<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="设备类型:">
          <el-select v-model="form.search_depend_type" @change="toQuery()">
            <el-option :label="index" :value="item" v-for="(item, index) in deviceNameObj"/>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码:">
          <el-input v-model="form.search_mobile" />
        </el-form-item>
        <el-form-item label="商户名称:" class="hidden-sm-and-down">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="设备SN:" class="hidden-md-and-down">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-lg-and-down">
          <div class="flex">
            <el-date-picker v-model="form.begin" type="datetime" placeholder="开始" value-format="yyyy-MM-dd HH:hh:ss"
              style="width: 100%;" :picker-options="beginOptions" />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker v-model="form.end" type="datetime" placeholder="结束" value-format="yyyy-MM-dd HH:hh:ss"
              style="width: 100%;" :picker-options="endOptions" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-tooltip class="item" effect="dark" content="选择开始时间和结束时间,点击查询后即可导出该时间段内的订单" placement="top">
            <el-button type="primary" plain @click="outTable()">导出<i class="el-icon-male el-icon--right" /></el-button>
          </el-tooltip>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="商户名称:" class="hidden-md-and-up">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="设备SN:" class="hidden-lg-and-up">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="时间筛选:" class="hidden-xg-and-up">
          <div class="flex">
            <el-date-picker v-model="form.begin" type="datetime" placeholder="开始" value-format="yyyy-MM-dd HH:hh:ss"
              style="width: 100%;" :picker-options="beginOptions" />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker v-model="form.end" type="datetime" placeholder="结束" value-format="yyyy-MM-dd HH:hh:ss"
              style="width: 100%;" :picker-options="endOptions" />
          </div>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <el-tabs v-model="listQuery.deal_status" class="mb-0 bg-white" type="card" @tab-click="typeClick">
        <el-tab-pane :label="`全部(${numInfo.all_num || 0})`" name="3" />
        <el-tab-pane :label="`未处理(${numInfo.sended_num || 0})`" name="0"/>
        <el-tab-pane :label="`处理中(${numInfo.dealing_num || 0})`" name="1"/>
        <el-tab-pane :label="`已处理(${numInfo.dealed_num || 0})`" name="2"/>
      </el-tabs>
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH"
          element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="身份" width="80">
            <template slot-scope="scope">
              <div>{{ scope.row.from_type == 0 ? '代理商' : '用户' }}</div>
              <div>ID:{{ scope.row.from_id }}</div>
            </template>
          </el-table-column>
          <el-table-column label="用户昵称" width="120">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.from_avatar"></el-avatar>
                <div class="flex1 ml-5">{{ scope.row.from_name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="联系电话" width="80">
            <template slot-scope="scope">
              {{ scope.row.mobile || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="问题类型" width="110">
            <template slot-scope="scope">
              <div>{{ issueArr[scope.row.type] }}</div>
              <div>{{ scope.row.user_type }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商户" width="160">
            <template slot-scope="scope">
              {{ scope.row.store_name }} <span v-if="scope.row.door">(房间号：{{ scope.row.door }})</span>
            </template>
          </el-table-column>
          <el-table-column label="二维码" width="100">
            <template slot-scope="scope">
              <div>{{ scope.row.sao_device_sn }}</div>
              <a class="text-blue" v-if="scope.row.order_sn" :href="`/order/order?order_sn=${scope.row.order_sn}`" target="_blank">查看订单</a>
            </template>
          </el-table-column>
          <el-table-column label="设备类型" width="80">
            <template slot-scope="scope">
              <div v-if="scope.row.depend_type == 1">{{ scope.row.support_buletooth == 1 ? '蓝牙线' : '密码线' }}</div>
              <div v-else>{{ deviceKeyObj[scope.row.depend_type] }}</div>
            </template>
          </el-table-column>
          <el-table-column label="反馈内容" width="220">
            <template slot-scope="scope">
              {{ scope.row.content || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="错误截图" width="190">
            <template slot-scope="scope">
              <div class="flex flex-wrap">
                <el-image class="mr-5" v-for="item in scope.row.img_url" style="width: 50px; height: 50px" :src="item"
                  :preview-src-list="scope.row.img_url">
                </el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="反馈时间" width="100">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column label="身份" width="60">
            <template slot-scope="scope">
              {{ scope.row.from_type == 0 ? '代理商' : '用户' }}
            </template>
          </el-table-column>
          <el-table-column label="回复" min-width="250">
            <template slot-scope="scope">
              <div class="fs-s1 text-gray">
                <div v-for="item in scope.row.reply_list">
                  {{ parseTime(item.add_date, '{m}-{d} {h}:{i}') }}回复：{{ item.content }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备注" width="100">
            <template slot-scope="scope">
              {{ scope.row.remark }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="primary" plain round size="mini" class="ml-0" @click="replyDialog = true; issue = scope.row">回复</el-button>
              <el-button type="primary" plain round size="mini" class="ml-0" @click="deal_status = scope.row.deal_status; remark = scope.row.remark; dealDialog = true; issue = scope.row;">{{ statusObj[scope.row.deal_status] }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center" v-if="!outStatus">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
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
  import drawer from '@/components/filterDrawer/filter'
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  import Sortable from 'sortablejs'
  export default {
    name: 'userList',
    components: {
      Pagination,
      drawer
    },
    data() {
      return {
        clickSubmit: false,
        beginOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
            }
          }
        },
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
        listLoading: true,
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
        remark: '',

        outStatus: false,
        excel: false,
        percentage: 0,
        wbout: {},
        wi: 0,
      }
    },
    computed: {
      xlsxName: function() {
        let xlsxName = '反馈记录'
        return xlsxName
      },
      deviceNameObj() {
        return this.$store.state.user.deviceNameObj
      },
      deviceKeyObj() {
        return this.$store.state.user.deviceKeyObj
      },
    },
    mounted(options) {
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
          if (this.outStatus) {
            this.list = res.list
            if (listQuery.limit > res.list.length) {
              this.listLoading = false
              this.percentage = 100
            } else {
              this.listQuery.start++
              this.percentage = this.percentage < 95 ? this.percentage + 5 : 95
            }
            this.$nextTick(() => {
              this.outTabdd('list_table', this.xlsxName)
            })
          } else {
            this.listLoading = false
            this.list = res.list
            this.listQuery.page_num = res.page_num
          }
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
      },

      /**
       * 导出
       */
      outTable() {
        this.outStatus = true
        this.listLoading = true
        this.listQuery.limit = 100
        this.list = []
        this.excel = true
        this.getList()
      },

      /**
       * 导出表格
       */
      outTabdd(tabId, fileName = 'data') {
        console.log(tabId)
        let fix = document.querySelector('.el-table__fixed-right')
        let xlsxParam = {
          raw: true
        }
        let wb
        if (fix) {
          this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`).removeChild(fix),
            xlsxParam)
          document.querySelector(`#${tabId}`).appendChild(fix)
        } else {
          this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`), xlsxParam)
        }
        this.wi++
        console.log(this.listLoading)
        if (this.listLoading) {
          this.getList()
          return
        }
        let wboutes = this.wbout[0]
        var no = ''
        for (var i in this.wbout) {
          delete this.wbout[i].Sheets.Sheet1['!merges']
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
        if (this.wbout[1]) wboutes.Sheets.Sheet1['!ref'] = `A1:Q${no}`
        let wbout = XLSX.write(wboutes, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        })
        this.percentage = 100
        if (!this.listLoading) {
          try {
            FileSaver.saveAs(new Blob([wbout], {
              type: 'application/octet-stream'
            }), `${fileName}.xlsx`)
            this.excel = false
            this.$message({
              message: '导出成功',
              type: 'success'
            })
            setTimeout(() => {
              location.reload()
            }, 1000)
          } catch (e) {
            if (typeof console !== 'undefined') console.log(e, this.wbout)
          }
          return this.wbout
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
