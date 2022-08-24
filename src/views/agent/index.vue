<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-input v-model="form.name" placeholder="代理名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
		  </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/agent/addAgent`})" v-if="!lowerAgent && Ability['addAgent']"><i class="el-icon-plus el-icon--left" />添加代理</el-button>
        <import-data :type="2" uploadText="导入代理"></import-data>
      </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column label="代理信息" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '姓名' }}</div>
            <div>{{ scope.row.mobile || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="品类">
          <template slot-scope="scope">
            <div class="cursor" v-for="item in scope.row.agentDeviceType">
              {{ item.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设备数">
          <template slot-scope="scope">
            <div class="cursor inline text-left" @click="$router.push({path: `/device?agentId=${scope.row.id}`})">
              <div>全部：{{ deviceCount[scope.row.id] ? parseFloat(deviceCount[scope.row.id].deviceNumber) - parseFloat(deviceCount[scope.row.id].lowerDeviceNumber) : '0' }}</div>
              <div>已铺货：{{ deviceCount[scope.row.id] ? parseFloat(deviceCount[scope.row.id].bindStoreNumber) - parseFloat(deviceCount[scope.row.id].lowerBindStoreNumber) : '0' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="120">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary"
                  @click="$router.push({path: `/order?agentId=${scope.row.id}`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx : 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: `/order?agentId=${scope.row.id}`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].ali : 0 }}
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" width="150">
          <template slot-scope="scope">
            <div class="inline">
              <div>交易额：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}</div>
              <div>总收益：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide : '0.00' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可提现金额(元)" width="120">
          <template slot-scope="scope">
            <span class="cursor text-blue">{{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分润比例">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div v-for="item in scope.row.agentDeviceType">
                {{ item.name }}&nbsp;&nbsp;{{ item.profitRatio || '0' }}%
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="190">
          <template slot-scope="scope">
            <template v-if="deviceSns">
              <el-button type="primary" size="mini" @click="bindAgent(scope.row)">分配给Ta</el-button>
            </template>
            <template v-else>
              <el-button class="p-5 ml-0" size="medium" type="text" @click="$router.push({path: `/store?agentId=${scope.row.id}`})">商户列表</el-button>
              <el-button class="p-5 ml-0" size="medium" type="text" @click="$refs.AssignAbilitys.getAuthMenu(scope.row.userId)">权限设置</el-button>
              <el-button class="p-5 ml-0" size="medium" type="text" @click="$router.push({path: `/agent/addAgent?agentId=${scope.row.id}`})" v-if="!lowerAgent && Ability['addAgent']">修改信息</el-button>
              <el-dropdown trigger="click">
                <el-button class="p-5 ml-0" size="medium" type="text">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="setRows(1, scope.row, 2, scope.$index)">删除代理</el-dropdown-item>
                  <template v-for="item in scope.row.agentDeviceType">
                    <el-dropdown-item @click.native="$refs.VendorModes.getCompanyInfo(scope.row.id)" v-if="item.code == 'VM'">售货机</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/device/bedSetting?id=${scope.row.id}&userKey=agentId`})" v-if="item.code == 'BD' && isBrand()">按摩床设置</el-dropdown-item>
                  </template>
                  <el-dropdown-item @click.native="$router.push({path: `/store/steal?id=${scope.row.id}&userKey=agentId`})" v-if="checkAbility(scope.row.agentDeviceType, ['_DD_RATIO', '_DD_TIME', '_DD_FAIL'])">DD设置</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 4, scope.$index)" v-if="!deviceCount[scope.row.id] && !orderCount[scope.row.id] && isBrand()">分配给代理</el-dropdown-item>
                  <el-dropdown-item @click.native="$router.push({path: `/market/appList`})" v-if="isBrand()">更多应用</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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

      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <div class="text-black">确定删除此代理吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left line-default">注：若该代理下存在设备，则无法删除。需解绑回收设备。</div>
        </div>
      </template>
      <template v-if="dialogType == 4">
        <div class="text-center">
          <div class="pb-20">
            <selectSearch :type="5" :emitRow="true" name="name" placeholder="输入代理名称搜索" @change="getAgent"></selectSearch>
          </div>
          <div class="pb-20" v-if="agentRow.id">
            <span>名称：{{ agentRow.name }}</span>
            <span class="ml-10">电话：{{ agentRow.mobile }}</span>
          </div>
          <div class="flex justify-center align-center" v-if="!agentRow.id && lowerAgent">
            <div class="mr-10">分配给自己</div>
            <el-switch v-model="dform.allotMe" />
          </div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>

    <AssignAbility ref="AssignAbilitys"></AssignAbility>
    <VendorMode ref="VendorModes" v-if="myDeviceId['VM']"></VendorMode>
  </div>
</template>

<script>
  import { arrayToObj } from '@/utils/index'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import VendorMode from '@/components/VendorMode/'
  import AssignAbility from '@/components/AssignAbility/'
  import ImportData from '@/components/ImportData/'
  import selectSearch from '@/components/condition/selectSearch'
  export default {
    name: 'agent',
    components: {
      Pagination,
      condition,
      VendorMode,
      AssignAbility,
      ImportData,
      selectSearch
    },
    props: {
      lowerAgent: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        arrayToObj: arrayToObj,
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {},

        orderCount: {},
        deviceCount: {},
        cashStat: {},

        deviceSns: '',

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '',
          2: '删除代理',
          3: '',
          4: '分配商户',
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        agentRow: {} //分配代理选择的代理信息
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'addAgent') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      let queryKey = ['deviceSns'],
        query = this.$route.query
      for (var i in queryKey) {
        this[queryKey[i]] = query[queryKey[i]]
      }
      if(this.$route.meta.reload){
        this.toQuery()
      }else if(!this.list || this.list.length == 0) {
        this.listQuery.lowerAgent = this.lowerAgent
        this.toQuery(1)
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
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
          this.queryCash(this.arrayKeys(res.rows, 'id'))
          this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
          this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 获取可提现金额
       */
      queryCash(ids){
        if(ids.length == 0){
          this.cashStat = {}
          return
        }
        this.$get('iot-saas-pay/api/pay/acount/list', {
          accountType: 1,
          ownerIds: ids.join(',')
        }).then(res => {
          this.cashStat = res
        })
      },

      /**
       * 订单数量统计查询
       */
      queryOrderCount(ids){
        if(ids.length == 0){
          this.orderCount = {}
          return
        }
        this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
          countType: 'AGENT',
          groupIds: ids.join(',')
        }).then(res => {
          this.orderCount = res
        })
      },

      /**
       * 设备数量统计查询
       */
      queryDeviceCount(ids){
        if(ids.length == 0){
          this.deviceCount = {}
          return
        }
        this.$get('iot-saas-device/admin/device/count/queryGroupCount', {
          countType: 'AGENT',
          groupIds: ids.join(',')
        }).then(res => {
          this.deviceCount = res
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前行
       * @param {Object} dialogType dialog内容显示类型 1: '', 2: '删除代理' 4: '分配给代理'
       * @param {Object} idx 当前行所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1:
            this.$put('').then(res => {
              this.$message({
                type: 'success',
                message: '设置成功'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 2:
            this.$post('iot-saas-basic/admin/agent/delete', {
              agentId: curRow.id
            }).then(res => {
              this.dialogStatus = false
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.list.splice(curIdx, 1)
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 4:
            let agentId = -1
            if(this.lowerAgent && params.allotMe){
              agentId = '0'
            } else {
              agentId = this.agentRow.id
            }
            if(!agentId){
              this.$message({
                message: '请选择分配对象',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            this.$post('iot-saas-basic/admin/agent/updateFather', {
              sonAgentId: curRow.id,
              fatherAgentId: agentId
            }).then(res => {
              this.$message({
                message: '分配成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
              this.list.splice(curIdx, 1)
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      },

      /**
       * 搜索代理
       */
      getAgent(row){
        this.agentRow = row
      },

      /**
       * 分配设备
       */
      bindAgent(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '正在分配',
          spinner: 'el-icon-loading'
        })
        this.$post('iot-saas-device/admin/device/bindAgent', {
          agentId: row.id,
          deviceSns: this.deviceSns.split(',')
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
      },

      /**
       * 校验是否拥有设备类型相关能力
       */
      checkAbility(deviceArr, keyArr, type = 1){
        let val = false
        for(var i in deviceArr){
          if(type == 1){
            for(var s in keyArr){
              if(this.Ability[deviceArr[i].code + keyArr[s]]){
                val = true
                break
              }
            }
          } else if(type == 2){
            if(keyArr.indexOf(deviceArr[i].code) > -1){
              val = true
              break
            }
          }
          if(val == true) break
        }
        return val
      },
	  }
  }
</script>

<style lang="scss" scoped>

</style>
