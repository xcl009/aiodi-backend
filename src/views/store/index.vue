<template>
  <div>
    <template v-if="!isStore()">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item label="品牌名称" v-if="isSaas()">
            <selectSearch v-model="form.brandId" :type="6" name="name" placeholder="请输入品牌名称" @change="toQuery()"></selectSearch>
          </el-form-item>
          <el-form-item label="是否铺货">
            <el-select v-model="form.haveDevice" @change="toQuery()" placeholder="是否铺货">
              <el-option label="全部" :value="null" />
              <el-option label="已铺货" value="1" />
              <el-option label="未铺货" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="商户名称">
          <el-input v-model="form.name" placeholder="商户名称" />
            </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="form.mobile" placeholder="手机号码" />
          </el-form-item>
        </template>
        <template v-slot:endButton>
          <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/store/addStore`})" v-if="!lowerStore && !isSaas() && !form.agentId"><i class="el-icon-plus el-icon--left" />添加商户</el-button>
          <import-data :type="3" uploadText="导入商户" v-if="isBrand() && !lowerStore && !form.agentId"></import-data>
        </template>
      </condition>
    </template>

    <div class="pl-10 pr-10 bg-white" :class="{'pt-15': isStore()}">
      <el-table class="ptd-5" id="list_table" ref="list_table" highlight-current-row element-loading-text="Loading"
        v-loading="listLoading" :max-height="tableMaxH" :data="list">
        <el-table-column label="品牌" width="150" prop="brandName" v-if="isSaas()"></el-table-column>
        <el-table-column label="门头照" width="60">
          <template slot-scope="scope">
            <el-link>
              <el-avatar class="block" shape="square" :size="35" :src="scope.row.avatar || agentInfo.avatar" fit="fill" icon="el-icon-picture-outline"></el-avatar>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="商户" min-width="190">
          <template slot-scope="scope">
            <div>{{ scope.row.name || '--' }}</div>
            <div>{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" width="120">
          <template slot-scope="scope">
            {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="总收益(元)" width="120">
          <template slot-scope="scope">
            {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="可提现(元)" width="120">
          <template slot-scope="scope">
            {{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="订单量" width="140">
          <template slot-scope="scope">
            <div class="inline" v-if="isSaas()">
              <div class="cursor" @click="$router.push({path: `/order?storeId=${scope.row.id}&agentId=${scope.row.agentId}&brandId=${scope.row.brandId}`})">订单量：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}</div>
              <div class="cursor" @click="$router.push({path: `/device?storeId=${scope.row.id}&agentId=${scope.row.agentId}&brandId=${scope.row.brandId}`})">设备数：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}</div>
            </div>
            <div class="inline" v-else>
              <div class="cursor" @click="$router.push({path: (lowerStore ? `/order/subOrder?storeId=${scope.row.id}&agentId=${scope.row.agentId}` : `/order?storeId=${scope.row.id}&agentId=${scope.row.agentId}`)})">订单量：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}</div>
              <div class="cursor" @click="$router.push({path: (lowerStore ? `/device/subDevice?storeId=${scope.row.id}&agentId=${scope.row.agentId}` : `/device?storeId=${scope.row.id}&agentId=${scope.row.agentId}`)})">设备数：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}</div>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column label="上级代理" width="120" v-if="lowerStore">
          <template slot-scope="scope">
            <div>{{ supUser[scope.row.agentId] ? supUser[scope.row.agentId].name : '' }}</div>
            <div>{{ supUser[scope.row.agentId] ? dealPhone(supUser[scope.row.agentId].mobile) : '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分润人" width="180" v-if="!isStore()">
          <template slot-scope="scope">
            <div v-if="scope.row.user">{{ scope.row.user.nickname || '' }}</div>
            <div v-if="scope.row.user && scope.row.user.mobile.length == 11">
              <el-tooltip class="item" effect="dark" :content="scope.row.user.mobile" placement="top" v-if="isSaas()">
                <div>{{ dealPhone(scope.row.user.mobile) }}</div>
              </el-tooltip>
              <div v-else>{{ scope.row.user.mobile }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设备统计" width="300" v-if="!isStore()">
          <template slot-scope="scope">
            <div class="row-device_stat">
              <template v-for="(item, index) in scope.row.storeDivisionConfig">
                <div class="flex line-1 item" v-if="index < 2">
                  <div class="w-80 l-r">{{ myDeviceId[item.deviceTypeCode] }}</div>
                  <div class="w-80 pl-10 l-r">{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '10000' }}{{ item.deviceTypeCode == 'PL' ? '条' : '台' }}</div>
                  <div class="flex1 pl-10"><span v-if="scope.row.divisionMode == 1"><span v-if="isStore()">{{ item.promised || item.live }}</span><span v-else>{{ item.live || item.promised }}</span>%({{ config.closeType[item.closeType] }})</span><span v-else>不分成</span></div>
                </div>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="城市区域" min-width="150">
          <template slot-scope="scope">
            {{ scope.row.province }}
            {{ scope.row.city }}
            {{ scope.row.district }}
          </template>
        </el-table-column>
        <el-table-column label="行业分类" width="90">
          <template slot-scope="scope">
            {{ cateObj[scope.row.catId] ? cateObj[scope.row.catId].catName : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" :fixed="device == 'desktop' ? 'right' : false" v-if="isStore()">
          <template slot-scope="scope">
            <template>
              <el-button type="primary" size="mini" @click="setRows(2, scope.row)" v-if="agentInfo.storeIds && agentInfo.storeIds[0] != scope.row.id">切换到此商户</el-button>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="245" :fixed="device == 'desktop' ? 'right' : false" v-else>
          <template slot-scope="scope">
            <template v-if="isSaas()">
              <el-button type="primary" size="mini" @click="toLogin(scope.row)">一键登录</el-button>
            </template>
            <template v-else-if="form.deviceSns">
              <el-button type="primary" size="mini" @click="bindStore(scope.row)">铺货</el-button>
            </template>
            <template v-else>
              <div class="flex flex-wrap">
                <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1, scope.$index)">设备绑定</el-button>
                <el-button type="primary" size="mini" @click="$refs.AssignAbilitys.getAuthMenu(scope.row.userId)">权限设置</el-button>
                <el-button type="primary" size="mini" @click="$router.push({path: `/store/addStore?storeId=${scope.row.id}`})">修改信息</el-button>
                <el-button type="primary" size="mini" @click.native="setRows(1, scope.row, 3, scope.$index)">删除商户</el-button>
                <el-button type="primary" size="mini" @click="$router.push({path: `/store/addStore?parentId=${scope.row.id}`})" v-if="scope.row.parentId == '0'">添加分店</el-button>
                <el-dropdown trigger="click">
                  <el-button type="primary" size="mini">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <template v-if="checkAbility(['VM'], 2, scope.row.storeDivisionConfig)">
                      <el-dropdown-item @click.native="$refs.VendorModes.getCompanyInfo(scope.row.id)">售货机运营模式</el-dropdown-item>
                      <el-dropdown-item @click.native="$refs.relatedTemplates.getCompanyTemplate(scope.row.id)">售货机仓口模板</el-dropdown-item>
                    </template>
                    <template v-if="checkAbility(Object.keys(config.roomDevice), 2, scope.row.storeDivisionConfig) && isBrand()">
                      <el-dropdown-item @click.native="$router.push({path: `/device/bedSetting?id=${scope.row.id}&userKey=storeId`})">主题房设置</el-dropdown-item>
                    </template>
                    <el-dropdown-item @click.native="$router.push({path: `/device/bedStat?id=${scope.row.id}`})" v-if="isBrand() && checkAbility(['BD', 'VG'], 2, scope.row.storeDivisionConfig)">在线统计</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/store/membership?id=${scope.row.id}&userKey=storeId`})" v-if="checkAbility(['_MEMBER_XF', '_MEMBER_DQ'], 1, scope.row.storeDivisionConfig)">会员卡</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/store/steal?id=${scope.row.id}&userKey=storeId`})" v-if="checkAbility(['_DD_END', '_DD_HIDE', '_DD_RATIO', '_DD_TIME', '_DD_FAIL'], 1, scope.row.storeDivisionConfig)">DD设置</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/device/freeQuota?id=${scope.row.id}&userKey=storeId`})" v-if="checkAbility(['_FREEQUOTA'], 1, scope.row.storeDivisionConfig)">免费名额</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(1, scope.row, 4, scope.$index)" v-if="!deviceCount[scope.row.id] && !orderCount[scope.row.id]">分配给代理</el-dropdown-item>
                    <!-- <el-dropdown-item @click.native="setRows(1, scope.row, 5)">重置登录密码</el-dropdown-item> -->
                    <el-dropdown-item @click.native="$router.push({path: `/system/toolsConfig?id=${scope.row.id}&userKey=storeId&code=DEPOSIT_PRPR`})" v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'], 1, scope.row.storeDivisionConfig)">概率押金</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/system/toolsConfig?id=${scope.row.id}&userKey=storeId&code=DIVIDE_ACCOUNTS`})" v-if="isBrand() && checkAbility(['_DIVIDE_ACCOUNTS'], 1, scope.row.storeDivisionConfig)">微信分账</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(1, cashStat[scope.row.id], 6)" v-if="checkAbility(['FROZEN_BALANCE'], 3)">冻结金额</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/market/appList`})" v-if="isBrand()">更多应用</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form">
          <el-input v-model="dform.deviceSns" placeholder="设备编号与编号之间用英文逗号隔开" type="textarea" :rows="5" />
        </el-form>
      </template>
      <template v-if="dialogType == 3">
        <div class="text-center">
          <div class="text-black">确定删除此商户吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left">注：若该商户下存在设备，则无法删除。需由该设备的归属代理去回收，无法跨级回收。</div>
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
          <div class="flex justify-center align-center" v-if="!agentRow.id && lowerStore">
            <div class="mr-10">分配给自己</div>
            <el-switch v-model="dform.allotMe" />
          </div>
        </div>
      </template>
      <template v-if="dialogType == 5">
        <div class="text-center">
          <div class="text-black">确定重置到该商户登录密码吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger">注：重置后登录密码为123456</div>
        </div>
      </template>
      <template v-if="dialogType == 6">
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

    <relatedTemplate ref="relatedTemplates"></relatedTemplate>
    <AssignAbility ref="AssignAbilitys" noFlag="AGENT_ASSIGN"></AssignAbility>
    <VendorMode ref="VendorModes" v-if="myDeviceId['VM'] && !isSaas()"></VendorMode>
  </div>
</template>

<script>
  import qs from 'qs'
  import { getToken, setToken, removeToken } from '@/utils/auth'
  import { arrayToObj } from '@/utils/index'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import RelatedTemplate from '@/components/RelatedTemplate/'
  import VendorMode from '@/components/VendorMode/'
  import AssignAbility from '@/components/AssignAbility/'
  import ImportData from '@/components/ImportData/'
  import selectSearch from '@/components/condition/selectSearch'
  export default {
    name: 'subShop',
    components: {
      Pagination,
      condition,
      RelatedTemplate,
      VendorMode,
      AssignAbility,
      ImportData,
      selectSearch
    },
    props: {
      lowerStore: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        clickSubmit: false,
        catList: [],
        cityList: [],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        orderCount: {},
        cashStat: {},
        deviceCount: {},
        supUser: {},
        cateObj: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '设备绑定',
          2: '',
          3: '删除商户',
          4: '分配商户',
          5: '重置密码',
          6: '冻结金额',
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        agentRow: {} //分配代理选择的代理信息
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    beforeRouteEnter(to, from, next) {
      to.meta.urlQuery = JSON.stringify(to.query)
      if (from.name == 'addStore') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      let query = this.$route.query
      this.queryKey = ['deviceSns', 'agentId', 'brandId']
      for (var i in this.queryKey) {
        if(query[this.queryKey[i]]){
          this.form[this.queryKey[i]] = query[this.queryKey[i]]
        } else {
          delete this.form[this.queryKey[i]]
        }
      }
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery()
      }
      this.urlQuery = this.$route.meta.urlQuery
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
      },

      /**
       * 重置查询
       */
      reset() {
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取其他信息
       */
      getOtherData(url, params){
      	return new Promise((resolve) => {
      		this.$post(url, params).then(res => {
      			resolve(res)
      		})
      	})
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          lowerStore: this.isSaas() ? true : this.lowerStore
        })
        this.$get('iot-saas-basic/admin/store/findPage', params).then(async (res = {}) => {
          let list = res.rows || []
          if(this.isSaas() && list.length > 0){
            let brandIds = []
            list.map(item => {
              if(brandIds.indexOf(item.brandId) == -1){
                brandIds.push(item.brandId)
              }
            })
            if(brandIds.length > 0){
              await this.getOtherData('iot-saas-order/admin/order/device/rent/getDeductions', {
                deductionType: 2,
                deductionIds: brandIds
              }).then(ares => {
                let brandObj = arrayToObj(ares, 'id')
                list.map(item => {
                  return item.brandName = brandObj[item.brandId].name
                })
              })
            }
          }
          this.list = list
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
          }
          this.queryCash(this.arrayKeys(res.rows, 'id'))
          this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
          this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
          if(this.lowerStore) this.getSupUser(this.arrayKeys(res.rows, 'userId'))
          this.getStoreCate(this.arrayKeys(res.rows, 'catId'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
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
          accountType: 2,
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
          countType: 'STORE',
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
          countType: 'STORE',
          groupIds: ids.join(',')
        }).then(res => {
          this.deviceCount = res
        })
      },

      /**
       * 获取上级代理
       */
      getSupUser(uids){
        if(uids == 0){
          this.supUser = {}
          return
        }
        this.$get('iot-saas-basic/admin/agent/queryByStoreUserId', {
          storeUserIds: uids.join(',')
        }).then(res => {
          this.supUser = res
        })
      },

      /**
       * 根据区域标识数组获取区域名称
       */
      getStoreCate(catId){
        if(catId.length == 0){
          this.cateObj = {}
          return
        }
        this.$get('iot-saas-basic/admin/store/findNameByCatIds', {
          catId: catId.join(',')
        }).then(res => {
          this.cateObj = res
        })
      },

      /**
       * 获取商户类别
       */
      getCategory() {
        this.$get('iot-saas-basic/admin/store/category').then(res => {
          let list = {}
          res.map(item => {
            if(item.level == 1){
              list[item.catId] = {
                value: item.catId,
                label: item.catName,
                children: []
              }
            }else if(item.level == 2){
              list[item.parentId].children.push({
                value: item.catId,
                label: item.catName
              })
            }
          })
          this.catList = Object.values(list)
        })
      },

      /**
       * 获取区域
       */
      getCity() {
        this.$store.dispatch('api/getRegions').then(res => {
          let list = {}
          res.map(item => {
            if(item.level == 1){
              list[item.tag] = {
                value: item.tag,
                label: item.title,
                children: {}
              }
            }else if(item.level == 2){
              let tag = item.tag.substring(0, 3)
              list[tag].children[item.tag] = {
                value: item.tag,
                label: item.title,
                children: []
              }
            }else if(item.level == 3){
              let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
              list[tag1].children[tag2].children.push({
                value: item.tag,
                label: item.title
              })
            }
          })
          list = Object.values(list)
          list.map(item => {
            if(JSON.stringify(item.children) == '{}'){
              item.children = []
            } else {
              item.children = Object.values(item.children)
            }
            return item
          })
          this.cityList = list
        })
      },

      /**
       * 铺货
       */
      bindStore(row) {
        let url = 'iot-saas-device/admin/device/bindStore', params = {
          storeId: row.id
        }
        if(row.deviceSns){
          params.deviceSns = row.deviceSns.split(',')
        } else {
          params.deviceSns = this.form.deviceSns.split(',')
        }
        this.$post(url, params).then((res) => {
          this.$message({
            type: 'success',
            message: '铺货成功'
          })
          if(this.deviceIds){
            history.back()
          } else {
            this.dialogStatus = false
          }
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型 2 切换商户 3 重置登录密码
       * @param {Object} row 选择当前商户
       * @param {Object} dialogType dialog内容显示类型 1: '设备绑定', 2: '', 3: '删除商户' 4: '分配给代理'
       * @param {Object} idx 当前商户所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 6 && row.frozenBalance > 0){
              this.dform = {
                frozenBalance: row.frozenBalance
              }
            }
            this.dialogStatus = true
            break
          case 2:
            this.$alert('确定切换到该商户？', '切换商户', {
              confirmButtonText: '确定',
              callback: action => {
                if (action == 'confirm') {
                  this.$post('iot-saas-user/store/login', {
                    storeId : row.id
                  }).then(res => {
                    setToken(res.loginToken.accessToken)
                    this.$message({
                      message: '切换成功',
                      type: 'success'
                    })
                    setTimeout(() => {
                      location.href = '/'
                    }, 1500)
                  })
                }
              }
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
        switch (this.dialogType) {
          case 1:
            if(this.lowerStore){
              this.$post('iot-saas-device/admin/device/bindAgent', {
                deviceSns: params.deviceSns,
                agentId: curRow.agentId,
              }).then(res => {
                this.bindStore({ id: curRow.id, deviceSns: params.deviceSns })
              })
            } else {
              this.bindStore({ id: curRow.id, deviceSns: params.deviceSns })
            }
            break
          case 2:

            break
          case 3:
            this.$post('iot-saas-basic/admin/store/delete', {
              storeId: curRow.id
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.list.splice(curIdx, 1)
            })
            break
          case 4:
            let agentId = -1
            if(this.lowerStore && params.allotMe){
              agentId = this.isBrand() ? '0' : this.agentInfo.agentId
            } else {
              agentId = this.agentRow.id
            }
            if(!agentId){
              this.$message({
                message: '请选择分配对象',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-basic/admin/store/updateFather', {
              storeId: curRow.id,
              agentId: agentId
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.list.splice(curIdx, 1)
            })
            break
          case 5:
            this.$post('iot-saas-user/admin/user/updateMobilePass', {
              id: curRow.userId,
              password: '123456'
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
            })
            break
          case 6:
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
      getAgent(row){
        this.agentRow = row
      },

      /**
       * 登录代理后台
       * @param {Object} row
       */
      toLogin(row){
        this.loadObj = this.$loading({
          lock: true,
          text: '正在登录',
          spinner: 'el-icon-loading'
        })
        this.$post('iot-saas-user/admin/login', {
          userType: 'store',
          id: row.id
        }).then(res => {
          setToken(getToken(), 'token1')
          setToken(res.loginToken.accessToken)
          setTimeout(()=>{
            location.href = '/home'
            this.loadObj.close()
          }, 500)
        }).catch(err=>{
          this.loadObj.close()
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .text-cut_two {
    max-height: 66px;
    line-height: 22px;
    -webkit-line-clamp: 3;
    /*规定超过两行的部分截断*/
  }

  .row-device_stat{
    .item{
      &+.item{
        margin-top: 10px;
      }
      .w-80{
        width: 80px;
      }
    }
  }
</style>
