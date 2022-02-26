<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-input v-model="form.name" placeholder="代理名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
		  </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/agent/create`})"><i class="el-icon-plus el-icon--left" />添加代理</el-button>
      </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="代理信息" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '姓名' }}</div>
            <div>{{ scope.row.mobile || '手机号码' }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="运营城市" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '深圳' }}</div>
          </template>
        </el-table-column> -->
        <el-table-column label="品类" align="center">
          <template slot-scope="scope">
            <div class="inline text-left">
              <el-tag
                class="block mtb-3 cursor"
                :hit="true"
                size="medium"
                effect="plain"
                @click="$router.push({path: `/device?agent_id=${scope.row.id}`})" v-for="item in scope.row.agentDeviceType">
                {{ item.name }}<!-- &nbsp;&nbsp;{{ scope.row.goods_sum || '0' }} -->
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下级总数" align="center" width="150">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div class="mb-5">{{ scope.row.child_agent_num || 0}}</div>
              <!-- <div>间属下级：{{ scope.row.child_agent_num || 0}}</div> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可提现金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分润比例" align="center">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div v-for="item in scope.row.agentDeviceType">
                {{ item.name }}&nbsp;&nbsp;{{ item.profitRatio || '0' }}%
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="240">
          <template slot-scope="scope">
            <template v-if="deviceId">
              <el-button type="primary" size="mini" @click="singleAssign(scope.row)">分配给Ta</el-button>
            </template>
            <template v-else>
              <div class="pl-10 inline text-left">
                <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({path: `/order?agentId=${scope.row.id}`})">订单列表</el-button>
                <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({path: `/order?agentId=${scope.row.id}`})">商户列表</el-button>
                <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="setRows(1, scope.row, 1)">权限设置</el-button>
                <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({path: `/agent/edit/${scope.row.id}`})">修改信息</el-button>
                <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="setRows(1, scope.row, 2, scope.$index)">删除代理</el-button>
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination
          v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center" v-if="dform.abilitys">
          <el-checkbox class="mt-5 mb-5" v-model="dform.abilitys.checkOrder">查看订单</el-checkbox>
          <el-checkbox class="mt-5 mb-5" v-model="dform.abilitys.checkEndOrder">结束订单</el-checkbox>
          <el-checkbox class="mt-5 mb-5" v-model="dform.abilitys.checkRefundOrder">结束退款</el-checkbox>
          <el-checkbox class="mt-5 mb-5" v-model="dform.abilitys.checkWithdrawRight">提现</el-checkbox>
        </div>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <div class="text-black">确定删除此代理吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left">注：若该代理下存在设备，则无法删除。需解绑回收设备。</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'

  export default {
    name: 'agent',
    components: {
      Pagination,
      condition
    },
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        clickSubmit: false,
        sort_type: [{
            name: '综合排序',
            value: 0
          },
          {
            name: '收益从高到低',
            value: 1
          },
          {
            name: '收益从低到高',
            value: 2
          },
          {
            name: '创建时间由近到远',
            value: 3
          },
          {
            name: '创建时间由远到近',
            value: 4
          }
        ],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        deviceId: '',

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '代理权限设置',
          2: '删除代理'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "agentEdit") {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      this.deviceId = this.$route.query.deviceId || ''
      if(this.$route.meta.reload){
        this.toQuery()
      }else if(!this.list || this.list.length == 0) {
        this.listQuery.son_type = this.user_type
        this.toQuery(1)
      }
    },
    computed: {
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    mounted() {

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
        this.form = {
          activated_status: 1
        }
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
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
       * @param {Object} dialogType dialog内容显示类型 1: '代理权限设置', 2: '删除代理'
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
              this.$set(this.dform, 'abilitys', {})
              this.$set(this.dform, 'agentId', row.id)
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
            this.$post('iot-saas-basic/admin/agent/updateAgentAuth', params).then(res => {
              this.$message({
                type: 'success',
                message: '设置成功'
              })
              this.rowObj = Object.assign(this.rowObj, params)
            })
            break
          case 2:
            this.$post('agentapi/delete_agent', {
              son_id: row.id
            }).then(res => {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.list.splice(row.index, 1)
            })
            break
        }
      },

      /**
       * 分配设备
       */
      singleAssign(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '正在分配',
          spinner: 'el-icon-loading'
        })
        this.$post('iot-saas-device/admin/device/singleAssign', {
          agentId: row.id,
          deviceId: this.deviceId
        }).then(res => {
          this.loadObj.close()
          this.$message({
            message: '分配成功',
            type: 'success'
          })
          history.back()
        }).catch(err => {
          this.loadObj.close()
        })
      }
	  }
  }
</script>

<style lang="scss" scoped>

</style>
