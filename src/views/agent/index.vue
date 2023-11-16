<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="代理名称">
          <el-input v-model="form.name" placeholder="代理名称" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input type="tel" v-model="form.mobile" placeholder="手机号码" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({ path: `/agent/addAgent` })"
          v-if="!lowerAgent && Ability['addAgent']"><i class="el-icon-plus el-icon--left" />添加代理</el-button>
        <import-data :type="2" uploadText="导入代理" v-if="isBrand()"></import-data>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column label="代理信息" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '姓名' }}</div>
            <div>{{ scope.row.mobile || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="上级代理" width="130" v-if="lowerAgent">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.parentName }}</div>
            <div>{{ scope.row.parentMobile }}</div>
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
            <div class="cursor inline text-left" @click="$router.push({ path: `/device?agentId=${scope.row.id}` })">
              <div>全部：{{ deviceCount[scope.row.id] ? parseFloat(deviceCount[scope.row.id].deviceNumber) -
                parseFloat(deviceCount[scope.row.id].lowerDeviceNumber) : '0' }}</div>
              <div>已铺货：{{ deviceCount[scope.row.id] ? parseFloat(deviceCount[scope.row.id].bindStoreNumber) -
                parseFloat(deviceCount[scope.row.id].lowerBindStoreNumber) : '0' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="120">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary" @click="$router.push({ path: `/order?agentId=${scope.row.id}` })">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx : 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary" @click="$router.push({ path: `/order?agentId=${scope.row.id}` })">
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
        <el-table-column label="操作" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <template v-if="deviceSns">
              <el-button type="primary" size="mini" @click="bindAgent(scope.row)">分配给Ta</el-button>
            </template>
            <template v-else>
              <el-dropdown-item @click.native="setRows(8, scope.row, 8)">分配代理</el-dropdown-item>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/store?agentId=${scope.row.id}` })">商户列表</el-button>
              <el-button type="primary" size="mini"
                @click="$refs.AssignAbilitys.getAuthMenu(scope.row.userId)">权限设置</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/agent/addAgent?agentId=${scope.row.id}` })"
                v-if="Ability['addAgent']">修改信息</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini">更多<i
                    class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="setRows(1, scope.row, 2, scope.$index)">删除代理</el-dropdown-item>
                  <template v-for="item in scope.row.agentDeviceType">
                    <el-dropdown-item @click.native="$refs.VendorModes.getCompanyInfo(scope.row.id)"
                      v-if="item.code == 'VM'">售货机</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/device/bedSetting?id=${scope.row.id}&userKey=agentId` })"
                      v-if="item.code == 'BD' && isBrand()">按摩床设置</el-dropdown-item>
                  </template>
                  <template
                    v-if="checkAbility(['_DEPOSIT_DELAY', '_DEPOSIT_MP'], 1, scope.row.agentDeviceType) && isBrand()">
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/device/depositRefund?id=${scope.row.id}&userKey=agentId` })">押金退回设置</el-dropdown-item>
                  </template>
                  <template v-if="checkAbility(['_BILLING'], 1, scope.row.agentDeviceType) && isBrand()">
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/device/billing?agentId=${scope.row.id}` })">默认计费设置</el-dropdown-item>
                  </template>
                  <el-dropdown-item
                    @click.native="$router.push({ path: `/store/steal?id=${scope.row.id}&userKey=agentId` })"
                    v-if="checkAbility(['_DD_END', '_DD_HIDE', '_DD_RATIO', '_DD_TIME', '_DD_FAIL'], 1, scope.row.agentDeviceType)">DD设置</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 4, scope.$index)"
                    v-if="!deviceCount[scope.row.id] && !orderCount[scope.row.id] && isBrand()">分配给代理</el-dropdown-item>
                  <el-dropdown-item
                    @click.native="$router.push({ path: `/system/toolsConfig?id=${scope.row.id}&userKey=agentId&code=DEPOSIT_PRPR` })"
                    v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'], 1, scope.row.agentDeviceType)">概率押金</el-dropdown-item>
                  <el-dropdown-item
                    @click.native="$router.push({ path: `/system/toolsConfig?id=${scope.row.id}&userKey=agentId&code=DIVIDE_ACCOUNTS` })"
                    v-if="isBrand() && checkAbility(['_DIVIDE_ACCOUNTS'], 1, scope.row.agentDeviceType)">微信分账</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, cashStat[scope.row.id], 5)"
                    v-if="checkAbility(['FROZEN_BALANCE'], 3)">冻结金额</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(6, scope.row)" v-if="isBrand()">重置登录密码</el-dropdown-item>
                  <el-dropdown-item @click.native="$router.push({ path: `/market/appList` })"
                    v-if="isBrand()">更多应用</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
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
      <template v-if="dialogType == 5">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input type="number" v-model="dform.frozenBalance" placeholder="请输入冻结金额"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">

      <template v-if="dialogType == 8">
        <div class="flexv pl-20 pr-20 text-black" style="height: 100%;">
          <div class="mb-20 pb-5 l-b">
            <condition :clickSubmit="clickSubmit" :unfoldShow="false" pdClass="p-0"
              @reset="agentList.query = { page: 1, size: 20 }; getAgentList(2)" @query="getAgentList(2)">
              <template v-slot:defult>
                <el-form-item label="代理姓名">
                  <el-input placeholder="请输入代理姓名" v-model="agentList.query.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input placeholder="请输入手机号" type="tel" v-model="agentList.query.mobile"></el-input>
                </el-form-item>
              </template>
            </condition>
          </div>
          <template v-if="agentList.newly && agentList.newly.length > 0">
            <div class="mb-15">
              最近分配
            </div>
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list">
              <template v-for="item in agentList.newly">
                <el-col :xs="24" :md="12" class="pb-15 custom">
                  <div class="p-15 item radius-5">
                    <div class="flex">
                      <div class="flex1">
                        <div class="text-black">{{ item.name }}</div>
                        <div class="mt-5 text-gray">{{ item.mobile }}</div>
                      </div>
                      <el-button type="primary" plain size="mini" @click="allocation(1, item, 9)">分配给Ta</el-button>
                    </div>
                    <div class="mt-5" v-if="item.agentDeviceType">
                      <span class="text-gray">设备类型</span>
                      <span class="ml-5" v-for="d in item.agentDeviceType">{{ d.name }}</span>
                    </div>
                    <div class="mt-5">
                      <span class="text-gray">运营区域</span>
                      <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                    </div>
                  </div>
                </el-col>
              </template>
            </el-row>
          </template>

          <div class="mb-10 flex align-center">
            查询结果
          </div>
          <div v-infinite-scroll="getAgentList" infinite-scroll-distance="1" class=" pt-5"
            style="overflow-y: auto;max-width:900px;">
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list">
              <template v-for="item in agentList.list">
                <el-col :xs="24" :md="12" class="pb-15 custom-form">
                  <el-card class="box-card">
                    <div class="p-15 item radius-5 flexv">
                      <div class="flex">
                        <div class="flex1 flex_j">
                          <div>
                            <img :src="item.avatar || agentInfo.avatar" class="userimg" />
                          </div>
                          <div class="ml-15">
                            <div class="text-black color1">{{ item.name }}</div>
                            <div class="mt-5 text-gray color">{{ item.mobile }}</div>
                          </div>
                        </div>

                      </div>
                      <div class="mt-20" v-if="item.agentDeviceType">
                        <span class="color1 " :class="i > 0 ? 'ml-30' : ''" v-for="(d, i) in item.agentDeviceType"
                          :key="i"><span class="color">{{ d.name }} </span>{{
                            d.profitRatio }}</span>
                      </div>
                      <div class="flex_j">
                        <div class="mt-5">
                          <span class="text-gray color">运营区域</span>
                          <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                        </div>
                        <div class="m_l_a">
                          <el-button type="primary" plain size="mini" @click="allocation(1, item, 9)">分配给Ta</el-button>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </template>
            </el-row>
          </div>
          <div class="bottom pt-15 pb-15">
            <el-button type="primary" plain size="mini" @click="dialogConfirm(item)">分配给自己</el-button>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 9">
        <div class="flexv pl-20 pr-20 text-black">
          <div class="mb-15 fw6">代理接收方</div>
          <div class="flex align-center pb-20 l-b">
            <img :src="checkList.avatar || agentInfo.avatar" class="userimg" width="56" alt="">
            <div class="pl-20">
              <div class="flex">
                <div class="label-text">代理名称:</div>
                <div>{{ checkList.name }}</div>
                <div class="ml-50 label-text">联系方式:</div>
                <div>{{ checkList.mobile }}</div>
              </div>
              <div class="flex mt-10">
                <div class="label-text">设备类型:</div>
                <div> <span class="ml-5" v-for="d in checkList.agentDeviceType">{{ d.name }}</span></div>
                <div class="ml-50 label-text">运营区域:</div>
                <div>{{ checkList.province }}{{ checkList.city }}{{ checkList.district }}</div>
              </div>
            </div>
          </div>
          <div class="mt-15 fw6">代理数据变更</div>

          <div class="mt-30">
            <div class="flex">
              <div class="title color2">
                可提现金额保留
              </div>
              <div class="ml-30">
                <el-switch v-model="checkList.enable" :active-value="1" :inactive-value="2" />
                <div class=" fs-s3 color mt-5">开启表示保留代理可提现金额。关闭表示清空当前代理的可提现金额</div>
              </div>
            </div>
            <div class="flex mt-20">
              <div class="title color2">
                分成比例说明
              </div>
              <div class="ml-30">
                <div class=" fs-s3 color mt-5">1.1 真实分成情况：</br>若当前代理原始的真实分成大于选中代理自身的分成，划拨后，当前代理的分成比例，默认</br>取代理自身所有的分成比例
                </div>
                <div class="fs-s3 color mt-20">1.2 真实分成情况：</br>若当前代理原始的真实分成小于选中代理自身的分成，划拨后，当前代理的分成比例，默认</br>保留代理原始的分成比例
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="[9].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>

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
      listLoading: true,
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
        5: '冻结金额',
        8: '分配代理',
        9: '分配代理'
      },
      curRow: {},
      curIdx: 0,
      dform: {},
      drawerStatus: false,

      agentRow: {}, //分配代理选择的代理信息
      // 代理
      agentList: {
        query: {
          page: 1,
          size: 20
        },
        list: [],
        newly: []
      },
      // 商户
      storeList: {
        query: {
          page: 1,
          size: 20
        },
        list: [],
        newly: []
      },
      checkList: {},
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
    if (this.$route.meta.reload) {
      this.toQuery()
    } else if (!this.list || this.list.length == 0) {
      this.listQuery.lowerAgent = this.lowerAgent
      this.toQuery(1)
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    Ability() {
      return this.$store.getters.Ability
    }
  },
  mounted() {

  },
  methods: {
    // 分配事件
    allocation(type, item, dialogType) {
      this.checkList = item;
      this.dialogType = dialogType;
    },
    /**
    * 获取代理
    */
    getAgentList(type = 1) {
      let params = JSON.parse(JSON.stringify(this.agentList.query))
      if (type == 2) {
        params.page = 1
        this.agentList.list = []
      }
      params.page--
      params.lowerAgent = false
      if (this.onLoadAgent && type == 1) return
      this.onLoadAgent = true
      this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
        this.agentList.list = this.agentList.list.concat(res.rows || [])
        if (parseInt((parseInt(res.total) / params.size)) > params.page) {
          this.onLoadAgent = false
          this.agentList.query.page = params.page + 2
        }
      })
    },
    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
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
        if (params.page == 0) {
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
    queryCash(ids) {
      if (ids.length == 0) {
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
    queryOrderCount(ids) {
      if (ids.length == 0) {
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
    queryDeviceCount(ids) {
      if (ids.length == 0) {
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
     * @param {Object} dialogType dialog内容显示类型 1: '', 2: '删除代理' 4: '分配给代理' 5: '冻结金额'
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
          if (dialogType == 5 && row.frozenBalance > 0) {
            this.dform = {
              frozenBalance: row.frozenBalance
            }
          }
          break
        case 6:
          this.$alert('确定重置该代理账号的登录密码吗？', '重置登录密码', {
            confirmButtonText: '确定',
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-user/admin/user/password/reset', {
                  userId: row.userId,
                  password: '123456'
                }).then(res => {
                  this.$message({
                    message: '重置成功',
                    type: 'success'
                  })
                })
              }
            }
          })
          break
        case 8:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      if (this.clickSubmit) return
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
          if (this.lowerAgent && params.allotMe) {
            agentId = '0'
          } else {
            agentId = this.agentRow.id
          }
          if (!agentId) {
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
        case 5:
          this.$post('iot-saas-pay/api/pay/acount/updateFrozenBalance', {
            ownerId: curRow.ownerId,
            frozenBalance: params.frozenBalance
          }).then(res => {
            this.dialogStatus = false
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            curRow.frozenBalance = params.frozenBalance
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },

    /**
     * 搜索代理
     */
    getAgent(row) {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.userimg {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.color {
  color: #86909C;
}

.color1 {
  color: #1D2129;
}

.color2 {
  color: #4E5969;
}

.flexv {
  position: relative;

  .bottom {
    position: absolute;
    width: 96%;
    bottom: 0;
    border-top: 1px solid var(--color-border-2, #E5E6EB);
    background: #FFF;
  }
}

.fw6 {
  font-weight: 600;
}

.title {
  min-width: 120px;
}
</style>
