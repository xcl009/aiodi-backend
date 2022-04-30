<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select placeholder="设备类型" v-model="form.deviceTypeCode" @change="toQuery()">
          <el-option :label="index" :value="item" v-for="(item, index) in myDeviceName"/>
        </el-select>
        <el-input placeholder="手机号码" v-model="form.mobile" />
        <el-input placeholder="商户名称" v-model="form.storeName" />
        <el-input placeholder="设备SN" v-model="form.snCode" />
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.date"
            type="daterange"
            range-separator="-"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd"
            @change="toQuery()">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="flex mb-5">
        <div class="flex1 white-space">
          <el-scrollbar>
            <el-button size="medium" :type="listQuery.state == item.value ? 'primary' : ''" class="mr-10 mb-10 ml-0" :class="{'btn-body': listQuery.state != item.value}" v-for="item in dealStatus" @click="listQuery.state = item.value; toQuery()">{{ item.title }}({{statInfo[item.nkey] || 0}})</el-button>
          </el-scrollbar>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH"
        element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="身份" width="80">
          <template slot-scope="scope">
            <div>{{ getRoleName(scope.row.identity) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="用户昵称" width="120">
          <template slot-scope="scope">
            <div class="flex align-center">
              <div class="flex1 ml-5">{{ scope.row.nickname }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" width="120">
          <template slot-scope="scope">
            {{ scope.row.mobile || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="问题类型" width="110">
          <template slot-scope="scope">
            <div>{{ issueArr[scope.row.issueType] }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="商户" width="160">
          <template slot-scope="scope">
            {{ scope.row.store_name }} <span v-if="scope.row.door">(房间号：{{ scope.row.door }})</span>
          </template>
        </el-table-column> -->
        <el-table-column label="设备二维码" width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.snCode }}</div>
            <a class="text-blue" v-if="scope.row.orderNo" :href="`/order/order?orderNo=${scope.row.orderNo}`" target="_blank">查看订单</a>
          </template>
        </el-table-column>
        <!-- <el-table-column label="设备类型" width="100">
          <template slot-scope="scope">
            {{ myDeviceId[scope.row.deviceTypeCode] }}
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="错误截图" width="190">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-image class="mr-5" v-for="item in scope.row.img_url" style="width: 50px; height: 50px" :src="item"
                :preview-src-list="scope.row.img_url">
              </el-image>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column label="反馈时间" width="120">
          <template slot-scope="scope">
            {{ parseTime(scope.row.feedbackTime, '{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
        <el-table-column label="反馈内容" width="220">
          <template slot-scope="scope">
            {{ scope.row.content || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="回复" min-width="250">
          <template slot-scope="scope">
            {{ scope.row.reply }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="100">
          <template slot-scope="scope">
            {{ scope.row.remark }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-button :type="scope.row.state == 1 ? 'success' : 'danger'" size="mini" plain>{{ statusObj[scope.row.state] || '未处理' }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="setRows(1, scope.row, 1)">查看详情</el-button>
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
          <el-form-item label="反馈内容">
            <div>{{ curRow.content }}</div>
          </el-form-item>
          <el-form-item label="错误截图" v-if="curRow.errorImages && curRow.errorImages.length > 0">
            <el-image class="mr-5" v-for="item in curRow.errorImages" style="width: 50px; height: 50px" :src="item" :preview-src-list="curRow.errorImages"></el-image>
          </el-form-item>
          <el-form-item label="后台回复">
            <el-input v-model="dform.reply" type="textarea" :rows="4" placeholder="请输入回复内容"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center" v-if="curRow.state == 0">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getRoleName }  from '@/utils/index.js'
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
        dealStatus: [
          {
            value: '-1',
            title: '全部',
            nkey: 'totalCount'
          },
          {
            value: 0,
            title: '未处理',
            nkey: 'processCount'
          },
          {
            value: 1,
            title: '已处理',
            nkey: 'finishedCount'
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
          1: '已处理'
        },

        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
            if (timeOptionRange) {
              return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange.getTime() - secondNum) || time.getTime() > Date.now()
            }
            return time.getTime() > Date.now()
          }, onPick: (time) => {
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
          state: '-1',
          page: 1,
          size: 20
        },
        form: {},
        statInfo: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '反馈详情'
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
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getStat()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
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
        if(params.date){
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
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
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
            if(dialogType == 1){
              this.dform.id = row.id
            }
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfim() {
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
                  message: '设置成功'
                })
                this.curRow = Object.assign(this.curRow, params)
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
