<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('public.agentNickNames')">
          <el-input v-model="form.name" :placeholder="$t('public.agentNickNames')" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input type="tel" v-model="form.mobile" :placeholder="$t('public.phone')" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({ path: `/agent/addAgent` })"
          v-if="!lowerAgent && Ability['addAgent']"><i class="el-icon-plus el-icon--left" />{{ $t('agent.addAgent')
          }}</el-button>
        <import-data :type="2" :uploadText="$t('agent.importAgent')" v-if="isBrand()"></import-data>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" :max-height="tableMaxH">
        <el-table-column :label="$t('agent.agentInfo')" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || $t('public.fullName') }}</div>
            <div>{{ scope.row.mobile || $t('public.phone') }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.superiorAgent')" width="130" v-if="lowerAgent">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.parentName }}</div>
            <div>{{ scope.row.parentMobile }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.category')">
          <template slot-scope="scope">
            <template v-for="(item, index) in scope.row.agentDeviceType">
              <div class="cursor" v-if="index < 2">
                {{ myDeviceId[item.code] || '' }}
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.numberOfDevices')">
          <template slot-scope="scope">
            <div class="cursor inline text-left" @click="$router.push({ path: `/device?agentId=${scope.row.id}` })">
              <div>{{ $t('public.all') }}: {{ deviceCount[scope.row.id] ? parseFloat(deviceCount[scope.row.id].deviceNumber) : 0}}</div>
              <div>{{ $t('public.shipped') }}: {{ deviceCount[scope.row.id] ? parseFloat(deviceCount[scope.row.id].bindStoreNumber) : 0 }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.orderNum')" width="120">
          <template slot-scope="scope">
            <div class="text-primary cursor" @click="$router.push({ path: `/order?agentId=${scope.row.id}`})">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('public.amount')}`" width="150">
          <template slot-scope="scope">
            <div class="inline">
              <div>{{ $t('public.aTurnover') }}: {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
              </div>
              <div>{{ $t('public.totalRevenue') }}: {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide :
                '0.00' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="`${$t('brand.withdrawableAmount')}`" width="120">
          <template slot-scope="scope">
            <div class="text-primary cursor" @click="$refs.UpdateBlances.setRows(cashStat[scope.row.id] || {})" v-if="checkAbility(['WD_MODIFY'], 3)">
              {{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}
            </div>
            <div class="cursor" v-else>
              {{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brand.dividendRatio')">
          <template slot-scope="scope">
            <div class="inline text-left">
              <template v-for="(item, index) in scope.row.agentDeviceType">
                <div v-if="index < 2">
                  {{ myDeviceId[item.code] }}&nbsp;&nbsp;{{ item.profitRatio || '0' }}%
                </div>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')" width="235" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <template v-if="deviceSns">
                <el-button type="text" @click="bindAgent(scope.row)">{{ $t('public.assign')
                }}</el-button>
              </template>
              <template v-else>
                <el-button type="text" @click="$router.push({ path: `/store?agentId=${scope.row.id}` })">{{
                  $t('brand.storeList') }}</el-button>
                <el-button type="text" @click="$refs.AssignAbilitys.getAuthMenu(scope.row.userId)">{{
                  $t('public.permissionSettings') }}</el-button>
                <el-button type="text"
                  @click="$router.push({ path: `/agent/addAgent?agentId=${scope.row.id}` })"
                  v-if="Ability['addAgent']">{{ $t('public.modifyingInformation') }}</el-button>
                <!-- <el-button type="primary" size="mini" @click.native="setRows(8, scope.row, 8)">分配代理</el-button> -->
                <el-dropdown trigger="click">
                  <el-button type="text">{{ $t('public.adds') }}<i
                      class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="setRows(1, scope.row, 2, scope.$index)">{{ $t('agent.deleteAgent')
                    }}</el-dropdown-item>
                    <template v-for="item in scope.row.agentDeviceType">
                      <el-dropdown-item @click.native="$refs.VendorModes.getCompanyInfo(scope.row.id)"
                        v-if="item.code == 'VM'">{{ $t('agent.vendingMachine') }}</el-dropdown-item>
                      <el-dropdown-item
                        @click.native="$router.push({ path: `/device/bedSetting?id=${scope.row.id}&userKey=agentId` })"
                        v-if="item.code == 'BD' && isBrand()">{{ $t('agent.setMassageTable') }}</el-dropdown-item>
                    </template>
                    <template
                      v-if="checkAbility(['_DEPOSIT_DELAY', '_DEPOSIT_MP'], 1, scope.row.agentDeviceType) && isBrand()">
                      <el-dropdown-item
                        @click.native="$router.push({ path: `/device/depositRefund?id=${scope.row.id}&userKey=agentId` })">{{
                          $t('agent.returnSettings') }}</el-dropdown-item>
                    </template>
                    <template v-if="checkAbility(['_BILLING'], 1, scope.row.agentDeviceType) && isBrand()">
                      <el-dropdown-item @click.native="$router.push({ path: `/device/billing?agentId=${scope.row.id}` })">{{
                        $t('agent.setBilling') }}</el-dropdown-item>
                    </template>
                    <!-- <el-dropdown-item @click.native="setRows(1, scope.row, 4, scope.$index)"
                      v-if="!deviceCount[scope.row.id] && !orderCount[scope.row.id] && isBrand()">{{
                        $t('public.assignToAgent') }}</el-dropdown-item> -->
                    <el-dropdown-item
                    @click.native="setRows(8, scope.row, 8)"
                      v-if="isBrand()">{{ $t('store.assignAgents') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/store/steal?id=${scope.row.id}&userKey=agentId` })"
                      v-if="checkAbility(['_DD_END', '_DD_HIDE', '_DD_RATIO', '_DD_TIME', '_DD_FAIL'], 1, scope.row.agentDeviceType)">{{ $t('store.DDSettings') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/system/cashSet?id=${scope.row.id}&userKey=agentId` })"
                      v-if="isBrand() && checkAbility(['WD_AGENT','WD_STORE','WD_USER'], 3)">{{ $t('system.withdrawRule') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/system/toolsConfig?id=${scope.row.id}&userKey=agentId&code=DEPOSIT_PRPR` })"
                      v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'], 1, scope.row.agentDeviceType)">{{
                        $t('public.probabilityDeposit') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/system/toolsConfig?id=${scope.row.id}&userKey=agentId&code=DIVIDE_ACCOUNTS` })"
                      v-if="isBrand() && checkAbility(['_DIVIDE_ACCOUNTS'], 1, scope.row.agentDeviceType)">{{
                        $t('public.weChatAccountSplitting') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/device/orderOt?id=${scope.row.id}&roleType=2` })"
                      v-if="isBrand()">{{
                        $t('device.deviceCost') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(1, cashStat[scope.row.id], 5)"
                      v-if="checkAbility(['FROZEN_BALANCE'], 3)">{{ $t('public.freezeAmount') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(8, scope.row, 11)" v-if="isBrand()">{{ $t('public.setLoginPassword') }}</el-dropdown-item>
                    <!-- <el-dropdown-item @click.native="$router.push({ path: `/market/appList` })"
                      v-if="isBrand()">{{ $t('public.moreApplications') }}</el-dropdown-item> -->
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
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
      <template v-if="dialogType == 1">

      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <div class="text-black">{{ $t('agent.delText') }}</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left line-default">{{ $t('agent.delText1') }}</div>
        </div>
      </template>
      <template v-if="dialogType == 4">
        <div class="text-center">
          <div class="pb-20">
            <selectSearch :type="5" :emitRow="true" name="name" :placeholder="$t('store.agentNameSerach')"
              @change="getAgent"></selectSearch>
          </div>
          <div class="pb-20" v-if="agentRow.id">
            <span>
              {{ $t('public.name') }}: {{ agentRow.name }}</span>
            <span class="ml-10">{{ $t('public.telephone') }}: {{ agentRow.mobile }}</span>
          </div>
          <div class="flex justify-center align-center" v-if="!agentRow.id && lowerAgent">
            <div class="mr-10">{{ $t('public.assignToOneself') }}</div>
            <el-switch v-model="dform.allotMe" />
          </div>
        </div>
      </template>
      <template v-if="dialogType == 5">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input type="number" v-model="dform.frozenBalance" :placeholder="$t('store.frozenBalanceText')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 8">
        <div class="flexv pl-20 pr-20 text-black" style="height: 100%;">
          <div class="mb-20 pb-5 l-b">
            <condition :clickSubmit="clickSubmit" :unfoldShow="false" pdClass="p-0"
              @reset="agentList.query = { page: 1, size: 20 }; getAgentList(2)" @query="getAgentList(2)">
              <template v-slot:defult>
                <el-form-item :label="$t('public.agentName')">
                  <el-input v-model="agentList.query.name"></el-input>
                </el-form-item>
                <el-form-item :label="$t('public.phonenumberContactPerson')">
                  <el-input :placeholder="$t('public.phoneText')" type="tel" v-model="agentList.query.mobile"></el-input>
                </el-form-item>
              </template>
            </condition>
          </div>
          <template v-if="agentList.newly && agentList.newly.length > 0">
            <div class="mb-15">
              {{ $t('public.recentlyAllocated') }}
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
                      <el-button type="primary" plain size="mini" @click="allocation(1, item, 9)">{{
                        $t('public.assign') }}</el-button>
                    </div>
                    <div class="mt-5" v-if="item.agentDeviceType">
                      <span class="text-gray">{{ $t('public.deviceType') }}</span>
                      <span class="ml-5" v-for="d in item.agentDeviceType">{{ d.name }}</span>
                    </div>
                    <div class="mt-5">
                      <span class="text-gray">{{ $t('public.operatingArea') }}</span>
                      <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                    </div>
                  </div>
                </el-col>
              </template>
            </el-row>
          </template>

          <div class="mb-10 flex align-center">
            {{ $t('public.queryResults') }}
          </div>
          <div v-infinite-scroll="getAgentList" infinite-scroll-distance="1" class=" pt-5"
            style="overflow-y: auto;width:1000px;">
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list pb-50">
              <template v-for="item in agentList.list">
                <el-col :xs="24" :md="12" class="pb-15 custom-form" v-if="item.isShow = true">
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
                          <span class="text-gray color">{{ $t('public.operatingArea') }}</span>
                          <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                        </div>
                        <div class="m_l_a">
                          <el-button type="primary" plain size="mini" @click="allocation(1, item, 9)">{{
                            $t('public.assign') }}</el-button>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </template>
            </el-row>
          </div>
          <div class="bottom pt-15 pb-15" v-if="curRow.parentId != 0">
            <el-button type="primary" plain size="mini" @click="allocation(2, {}, 9)">{{ $t('public.assignToOneself')
            }}</el-button>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 9">
        <div class="flexv pl-20 pr-20 text-black">
          <div class="mb-15 fw6">{{ $t('store.partnerRecipient') }}</div>
          <div class="flex align-center pb-20 l-b">
            <img :src="checkList.avatar || agentInfo.avatar" class="userimg" width="56" alt="">
            <div class="pl-20">
              <div class="flex">
                <div class="label-text">{{ checkList.id != 0 ? $t('public.agentNickNames') : $t('public.brandNames') }}:
                </div>
                <div>{{ checkList.name }}</div>
                <div class="ml-50 label-text">{{ $t('public.contactInformation') }}:</div>
                <div>{{ checkList.mobile }}</div>
              </div>
              <div class="flex mt-10" v-if="curRow.id != 0">
                <div class="label-text">{{ $t('public.deviceType') }}:</div>
                <div> <span class="ml-5" v-for="d in checkList.agentDeviceType">{{ d.name }}</span></div>
                <div class="ml-50 label-text">{{ $t('public.operatingArea') }}:</div>
                <div>{{ checkList.province }}{{ checkList.city }}{{ checkList.district }}</div>
              </div>
            </div>
          </div>
          <div class="mt-15 fw6">{{ $t('agent.agentData') }}</div>

          <div class="mt-30">
            <div class="flex">
              <div class="title color2">
                {{ $t('store.empty') }}
              </div>
              <div class="ml-30">
                <el-radio-group v-model="checkList.enable">
                  <el-radio-button :label="0">{{ $t('public.reserve') }}</el-radio-button>
                  <el-radio-button :label="1">{{ $t('public.reserveEmpty') }}</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="flex mt-20">
              <div class="title color2">
                {{ $t('store.message3') }}
              </div>
              <div class="ml-30">
                <div class=" fs-s3 color mt-5">{{ $t('agent.text1') }}</br>{{ $t('agent.text2') }}</br>{{
                  $t('agent.text3') }}
                </div>
                <div class="fs-s3 color mt-20">{{ $t('agent.text4') }}</br>{{ $t('agent.text5') }}</br>{{
                  $t('agent.text6') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 11">
        <el-form class="pl-20 pr-20 custom-form">
          <el-form-item :label="$t('public.loginPassword')">
            <el-switch v-model="dform.password" />
            <div class="fs-s3 text-danger">{{ $t('store.resettingStorePasswordText') }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.operationPassword')">
            <el-switch v-model="dform.twoPassword" :active-value="1" :inactive-value="0" />
            <div class="fs-s3 text-danger">{{ $t('store.resetOPwdText') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[9, 11].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
    </el-drawer>

    <AssignAbility ref="AssignAbilitys"></AssignAbility>
    <VendorMode ref="VendorModes" v-if="myDeviceId['VM']"></VendorMode>
    <update-blance ref="UpdateBlances" userType="store" v-if="checkAbility(['WD_MODIFY'], 3)"></update-blance>
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
import UpdateBlance from '@/components/UpdateBlance/'
export default {
  name: 'agent',
  components: {
    Pagination,
    condition,
    VendorMode,
    AssignAbility,
    ImportData,
    selectSearch,
    UpdateBlance
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
      agentList: {
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
    } else {
      this.toQuery()
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
    },
    dialogTitle() {
      return {
        1: '',
        2: this.$t('agent.deleteAgent'),
        3: '',
        4: this.$t('store.assignPartners'),
        5: this.$t('public.freezeAmount'),
        8: this.$t('store.assignAgents'),
        9: this.$t('store.assignAgents'),
        11: this.$t('public.setLoginPassword')
      }
    }
  },
  methods: {
    // 分配事件
    allocation(type, item, dialogType) {
      let jitem = JSON.parse(JSON.stringify(item))
      if (type == 2) {
        jitem = {
          name: this.agentInfo.nickname,
          mobile: this.agentInfo.mobile,
          id: 0
        }
      }
      jitem.enable = 0
      this.checkList = jitem
      this.dialogType = dialogType
    },
    /**
    * 获取代理
    */
    getAgentList(type = 1, form, item) {
      let params = JSON.parse(JSON.stringify(this.agentList.query))
      if (type == 2) {
        params.page = 1
        this.agentList.list = []
      }
      params.page--
      if (this.onLoadAgent && type == 1) return
      this.onLoadAgent = true
      this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
        this.agentList.list = this.agentList.list.concat(res.rows || [])
        if (parseInt((parseInt(res.total) / params.size)) > params.page) {
          this.onLoadAgent = false
          this.agentList.query.page = params.page + 2
        }
        if (form) {
          this.agentList.list.forEach((res, index) => {
            if (res.id == item.id) {
              this.agentList.list.splice(index, 1)
            }
          })
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
      this.$get('iot-saas-device/admin/device/count/queryGroupCountV2', {
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
      let that = this;
      this.getAgentList(2, true, row);
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
        case 8:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
        break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
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
              message: that.$t('public.setSuccess')
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
              message: that.$t('public.deleteSuccess'),
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
              message: that.$t('store.pleaseSelectObjet'),
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
              message: that.$t('agent.message1'),
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
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            curRow.frozenBalance = params.frozenBalance
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 9:
          this.$post('iot-saas-basic/admin/brand/giveAgent', {
            agentId: curRow.id,
            targetAgentId: this.checkList.id,
            giveType: 2,
            isApprove: this.checkList.enable,
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.getList();
            this.drawerStatus = false;
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 11:
          params.userId = curRow.userId
          if(params.password) params.password = '123456'
          this.$post('iot-saas-user/admin/user/password/reset', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
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
      let that = this;
      this.loadObj = this.$loading({
        lock: true,
        text: that.$t('agent.assigning'),
        spinner: 'el-icon-loading'
      })
      this.$post('iot-saas-device/admin/device/bindAgent', {
        agentId: row.id,
        deviceSns: this.deviceSns.split(',')
      }).then(res => {
        this.loadObj.close()
        this.$message({
          message: that.$t('agent.message1'),
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
