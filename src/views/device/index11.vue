<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.search_goods_type" @tab-click="delete form.search_goods_type; toQuery()">
          <el-tab-pane :label="`全部(${total_device_num})`" :name="'-1'" />
          <el-tab-pane :label="item.type_name + (type_device_num[item.depend_type] >= 0 ? '(' + type_device_num[item.depend_type] + ')' : '')" :name="''+item.depend_type+''" v-for="(item, index) in tabDevice" v-if="item.is_delete == 0"/>
        </el-tabs>
      </template>

      <template v-slot:defult>
        <el-form-item label="商户名称:">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="二维码:">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="设备SN:" class="hidden-sm-and-down">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
        <el-form-item label="设备工厂:" class="hidden-md-and-down">
          <el-select v-model="form.search_device_factory_id" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in search_factorys_condition"/>
          </el-select>
        </el-form-item>
        <el-form-item label="设备信号:" class="hidden-lg-and-down">
          <el-select v-model="form.search_device_inet_type" @change="toQuery()">
            <el-option :label="item" :value="item" v-for="item in search_device_inet_condition"/>
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型:" class="hidden-xg-and-down">
          <el-select v-model="form.search_goods_type_id" @change="toQuery()">
            <template v-for="(item, key) in allDevice[listQuery.search_goods_type]">
              <el-option :label="item.type_name" :value="item.id"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :disabled="clickSubmit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('equip_table', '设备记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <sel-plat v-if="checkRoles(['terminal'])" :listQuery="listQuery" @change="toQuery()"></sel-plat>
        <el-form-item label="用户类型:" v-if="all">
          <el-select v-model="listQuery.search_user_type" @change="toQuery()">
            <el-option label="我的设备" :value="0"/>
            <el-option label="下级设备" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="底座SN:" class="hidden-md-and-up">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
        <el-form-item label="设备工厂:" class="hidden-lg-and-up">
          <el-select v-model="form.search_device_factory_id" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in search_factorys_condition"/>
          </el-select>
        </el-form-item>
        <el-form-item label="设备信号:" class="hidden-xg-and-up">
          <el-select v-model="form.search_device_inet_type" @change="toQuery()">
            <el-option :label="item" :value="item" v-for="item in search_device_inet_condition"/>
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型:" class="hidden-xl-only">
          <el-select v-model="form.search_goods_type_id" @change="toQuery()">
            <template v-for="(item, key) in allDevice[listQuery.search_goods_type]">
              <el-option :label="item.type_name" :value="item.id"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="代理姓名:" v-if="user_type == 1">
          <el-input v-model="form.search_agent_name" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="flex bg-white">
        <div class="flex1">
          <el-tabs v-model="listQuery.device_status" class="mb-0" type="card" @tab-click="typeClick">
            <el-tab-pane :label="`全部(${numInfo.all_num || 0})`" name="0" />
            <el-tab-pane :label="`在线(${numInfo.online_num || 0})`" name="1" />
            <el-tab-pane :label="`离线(${numInfo.not_online_num || 0})`" name="2" />
            <el-tab-pane :label="`已绑(${numInfo.distributed_num || 0})`" name="4" />
            <el-tab-pane :label="`未绑(${numInfo.not_distributed_num || 0})`" name="5" />
            <!-- <el-tab-pane :label="`故障(${numInfo.trouble_num || 0})`" name="3" /> -->
          </el-tabs>
        </div>
        <div class="pb-5 pr-15" style="padding-top: 4px; border-bottom: 1px solid #E4E7ED;">
          <el-button size="small" type="primary" plain @click="$router.push({path: `/equipment/bindRecord`})">铺货记录</el-button>
          <el-button size="small" type="primary" plain v-if="checkRoles(['terminal'])" @click="showUpgrade(systemUpgrade)">{{ systemUpgrade.upgrade_status == 2 ? '升级设备中' : '设备升级'}}</el-button>
          <el-button size="small" type="primary" plain v-if="checkRoles(['terminal'])" @click="costPrice()" :disabled="selID.length == 0">设备成本</el-button>
          <template v-if="!checkRoles(['terminal'])">
            <el-button size="small" type="primary" plain @click="distribu()" :disabled="selSnArr.length == 0">去铺货</el-button>
            <el-button size="small" type="primary" plain v-if="agent_id" @click="distribu(3)" :disabled="selSnArr.length == 0">点此分配</el-button>
            <el-button size="small" type="primary" plain v-else @click="distribu(2)" :disabled="selSnArr.length == 0">去分配</el-button>
            <el-button size="small" type="primary" plain v-if="ad_id" @click="bindAd()" :disabled="selSnArr.length == 0">绑定广告</el-button>
            <el-button size="small" type="danger" plain v-else-if="listQuery.son_id" @click="distribu(4)" :disabled="selSnArr.length == 0">回收设备</el-button>
          </template>
        </div>
      </div>

      <div class="bg-white">
        <el-table
          class="ptd-5"
          id="equip_table"
          ref="equip_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          @selection-change="selSb"
          :max-height="tableMaxH"
        >
          <el-table-column type="selection" v-if="checkRoles(['terminal'])" width="50" />
          <el-table-column type="selection" v-else :selectable="checkSel" width="50" />
          <el-table-column label="品牌商" v-if="checkRoles(['terminal'])">
            <template slot-scope="scope">
              {{ oemInfo[scope.row.belong_aid] ? oemInfo[scope.row.belong_aid].mini_name : '' }}
            </template>
          </el-table-column>
          <el-table-column label="设备名称">
            <template slot-scope="scope">
              {{ scope.row.goods_name }}
            </template>
          </el-table-column>
          <el-table-column label="设备归属" width="180" v-if="user_type == 1">
            <template slot-scope="scope">
              <div v-if="scope.row.manage_role_name">{{ scope.row.manage_name }}（{{ scope.row.manage_role_name }}）</div>
              <div>{{ scope.row.manage_phone }}</div>
            </template>
          </el-table-column>
          <el-table-column label="设备SN码" width="230">
            <template slot-scope="scope">
              <div>二维码：{{ scope.row.goods_sn || "--" }}</div>
              <div class="text-cut">设备SN：{{ scope.row.device_id || "--" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="可借|可还" width="100">
            <template slot-scope="scope">
              <div v-if="scope.row.goods_type == 1">
                {{ scope.row.rent_num }} | {{ scope.row.back_num }}
              </div>
              <div v-else>
                --
              </div>
            </template>
          </el-table-column>
          <el-table-column label="流量卡号(IMEI)" width="120">
            <template slot-scope="scope">
              {{ scope.row.device_card_num || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="设备属性" width="110">
            <template slot-scope="scope">
              {{ search_factorys_condition[scope.row.device_factory_id] }}
              {{ scope.row.device_type_classify }}
              {{ scope.row.device_inet_type }}
            </template>
          </el-table-column>
          <el-table-column label="信号值" width="80" :render-header="renderHeader">
            <template slot-scope="scope">
              <router-link :to="`/equipment/signal?goods_sn=${scope.row.goods_sn}`" v-if="scope.row.device_signal">
                <span class="text-blue">{{ scope.row.device_signal }}</span>
              </router-link>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="链接次数" width="80">
            <template slot-scope="scope">
              {{ scope.row.conn_count || '0' }}
            </template>
          </el-table-column>
          <el-table-column label="是否铺货" width="100">
            <template slot-scope="scope">
              <div>{{ scope.row.is_distributed == 1 ? "是" : "否" }}</div>
              <div>{{ scope.row.operate_date }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商户名称" width="150">
            <template slot-scope="scope">
              <div class="text-cut_two">{{ scope.row.store_name || "--" }}</div>
              <div v-if="scope.row.attach_room_no">房间号：{{ scope.row.attach_room_no }}</div>
            </template>
          </el-table-column>
          <el-table-column label="订单数" width="120" v-if="checkRoles(['terminal','partner'])">
            <template slot-scope="scope">
              <div>微信：<el-link type="primary" @click="$router.push({path: `${user_type == 0 ? '/order/meOrder' : '/order/subOrder'}?goods_sn=${scope.row.goods_sn}&mini_type=1`})">{{ scope.row.wx_mini_num }}</el-link></div>
              <div>支付宝：<el-link type="primary" @click="$router.push({path: `${user_type == 0 ? '/order/meOrder' : '/order/subOrder'}?goods_sn=${scope.row.goods_sn}&mini_type=2`})">{{ scope.row.zfb_mini_num }}</el-link></div>
            </template>
          </el-table-column>
          <el-table-column label="交易额" width="90" v-if="checkRoles(['terminal','partner'])">
            <template slot-scope="scope">
              ￥{{ scope.row.order_amount }}
            </template>
          </el-table-column>
          <el-table-column label="设备成本" width="90" v-if="checkRoles(['terminal'])">
            <template slot-scope="scope">
              ￥{{ scope.row.cost_price }}
            </template>
          </el-table-column>
          <el-table-column label="心跳状态" width="100">
            <template slot-scope="scope">
              <div v-if="[3,9,10].indexOf(scope.row.goods_type) > -1">
                --
              </div>
              <div v-else>
                <router-link :to="`/equipment/signal?type=2&goods_sn=${scope.row.goods_sn}`">
                  <el-link :type="scope.row.device_state == 1 ? 'primary' : 'danger'">
                    {{ deviceState[scope.row.device_state] }}
                  </el-link>
                  <div>{{ parseTime(scope.row.device_updated) }}</div>
                </router-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="270" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" plain round @click="equipBelong(scope.row)">设备归属</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" v-if="scope.row.goods_type == 1 && !checkRoles(['terminal'])" @click="$router.push({path: `/equipment/popup/${scope.row.goods_sn}`})">设备弹出</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" v-if="scope.row.goods_type == 1" @click="$router.push({path: `/equipment/popupRecord/${scope.row.goods_sn}`})">弹出记录</el-button>
              <template v-if="listQuery.search_user_type == 0">
                <el-button type="primary" size="mini" plain round class="ml-0" @click="distribu(5, scope.row)" v-if="scope.row.is_distributed == 1">房间号</el-button>
                <el-button type="primary" size="mini" plain round v-else class="ml-0" @click="distribu(1, scope.row)">去&nbsp;铺&nbsp;货</el-button>
                <el-button type="primary" size="mini" plain round class="ml-0" v-if="agent_id && scope.row.is_distributed == 0" @click="distribu(3, scope.row)">分配设备</el-button>
                <el-button type="primary" size="mini" plain round class="ml-0" v-else-if="scope.row.is_distributed == 0"  @click="distribu(2, scope.row)">分配设备</el-button>
              </template>
              <el-button type="primary" size="mini" plain round class="ml-0" v-if="scope.row.is_distributed == 1" @click="deleteEquip(scope.row)">&nbsp;解&nbsp;&nbsp;绑&nbsp;</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" v-else-if="listQuery.search_user_type == 1 && scope.row.is_distributed == 0"  @click="distribu(4, scope.row)">回收设备</el-button>
              <el-button v-if="ad_id" type="primary" size="mini" plain round class="ml-0"  @click="bindAd(scope.row)">绑定广告</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" @click="showUpgrade(scope.row)">{{ scope.row.upgrade_status == 2 ? '升级设备中' : '设备升级'}}</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" @click="showCode(scope.row)">二维码</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" v-if="scope.row.goods_type == 1" @click="restart(scope.row)">重启设备</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" v-if="scope.row.goods_type == 1 && !checkRoles(['terminal'])" @click="$router.push({path: `/equipment/popup/${scope.row.goods_sn}?type=2`})">充电宝绑定</el-button>
              <el-button size="mini" type="primary" plain round class="ml-0" v-if="checkRoles(['terminal'])" @click="costPrice(scope.row)">设备成本</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listQuery.page_num > 0"
            :page.sync="listQuery.start"
            :page-count="listQuery.page_num"
            :limit.sync="listQuery.limit"
            @pagination="getList"
          />
        </div>
      </div>

      <el-dialog title="设备归属" :visible.sync="equipBelongDialog">
        <el-table :data="eqiupBelong">
          <el-table-column label="角色" property="role_name" />
          <el-table-column label="联系信息">
            <template slot-scope="scope">
              <div v-if="checkRoles(['terminal','partner'])">姓名：{{ scope.row.name }}&nbsp;&nbsp;&nbsp;&nbsp;电话：{{ scope.row.phone }}</div>
              <div v-if="scope.row.agent_level == 5">商户名：{{ eqiupStore.store_name }}</div>
              <div v-if="scope.row.agent_level == 5">地址：{{ eqiupStore.address }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <el-dialog title="设备弹出" :visible.sync="baoDialog">
        <el-table :data="baoList">
          <el-table-column label="卡槽位置" property="cang_num" />
          <el-table-column label="电池编号">
            <template slot-scope="scope">{{ scope.row.bao_sn || '--' }}</template>
          </el-table-column>
          <el-table-column label="电池电量">
            <template slot-scope="scope">{{ scope.row.electricity ? scope.row.electricity + '%' : '--' }}</template>
          </el-table-column>
          <el-table-column label="弹出次数">
            <template slot-scope="scope">{{ scope.row.used_num || '--' }}</template>
          </el-table-column>
          <el-table-column label="在线状态">
            <template slot-scope="scope">{{ statusArr[scope.row.bao_status] || '已弹出' }}</template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="small" plain round :disabled="scope.row.bao_status != 0" @click="equipPopup(scope.row)">弹出</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <el-dialog title="设备升级" :visible.sync="upgradeDialog">
        <el-form label-width="100px">
          <el-form-item label="升级设备：" v-if="!upgradeObj.goods_sn">
            <el-checkbox-group v-model="upgradeObj.updating_depend">
              <el-checkbox-button :label="item" v-for="(item, key) in myDeviceName">{{ key }}</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="升级状态：">
            <el-switch v-model="upgradeObj.upgrade_status" :active-value="2" :inactive-value="1"/>
          </el-form-item>
          <el-form-item label="升级提示语：">
            <el-input type="textarea" v-model="upgradeObj.upgrade_desc" rows="4"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="setUpgrade()">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
import selPlat from '@/components/selPlat'
export default {
  name: 'BindEquip',
  components: {
    Pagination,
    drawer,
    selPlat
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
      nowTime: Date.parse(new Date()) / 1000,
      deviceState: ['掉线', '正常', '维护', '异常'],
      form: {
        search_store_name: this.$route.query.store_name || ''
      },
      numInfo: {},
      tableMaxH: '250',
      oemInfo: {},
      list: [],
      listLoading: true,
      listQuery: {
        search_agent_id: '0',
        son_id: this.$route.query.son_id || '',
        device_status: this.$route.query.device_status || 0,
        search_goods_type: '-1',
        search_user_type: '0',
        page_num: 1,
        limit: 20
      },
      type_device_num: [],
      tabDevice: [],
      allDevice: {},

      total_device_num: 0,
      all: this.$route.query.all || 0,
      agent_id: this.$route.query.agent_id || '',
      ad_id: this.$route.query.ad_id || '',
      selSnArr: [],
      selID: [],

      device_row: {},

      // 设备归属
      eqiupBelong: [],
      eqiupStore: {},
      equipBelongDialog: false,

      // 设备弹出
      statusArr: ['在槽', '借出中', '已借出', '异常'],
      baoList: [],
      baoDialog: false,

      upgradeDialog: false,
      upgradeObj: {},
      systemUpgrade: {},
      sort_id_key: this.$route.query.sort_id_key || false,

      search_factorys_condition: {},
      search_device_condition: {},
      search_device_inet_condition: []
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    myDeviceName(){
      return this.$store.state.user.myDeviceName
    },
    myDeviceId(){
      return this.$store.state.user.myDeviceId
    }
  },
  mounted() {
    this.listQuery.search_user_type = this.all ? 0 : this.user_type
    this.getStatNum()
    this.getList()
    this.getSystemUpgrade()
    this.getDeviceList()
  },
  methods: {
    /**
     * 信号值注解
     */
    renderHeader(h, { column, $index }) {
      return [column.label, h(
        'el-tooltip',
        {
          props: {
              content: '0~31，31为最好，大于18方可连接网络',
              placement: 'top'
          }
        },
        [h('span', { class: {'el-icon-question': true} })]
      )]
    },

    /**
     * 获取设备类型
     */
    getDeviceList() {
      this.$get('agentapi/goods/goods_detail_types', {
        limit: 1000
      }).then(res => {
        let tabDevice = {}, tabDeviceID = {}, arr = [], allDevice = {}
        for(var i in this.myDeviceName){
          res.list.map( item => {
            if(this.myDeviceName[i] == item.depend_type){
              if(!tabDevice[`t_${item.goods_type}`]){
                tabDeviceID[item.id] = item.depend_type
                allDevice[item.depend_type] = []
                allDevice[item.depend_type].push(item)
                tabDevice[`t_${item.goods_type}`] = item
              } else {
                arr.push(item)
              }
            }
          })
        }
        for(var i in tabDeviceID){
          arr.map(item => {
            if(item.depend_type == tabDeviceID[i]){
              allDevice[tabDeviceID[i]].push(item)
            }
          })
        }
        this.tabDevice = tabDevice
        this.allDevice = allDevice
      })
    },

    /**
     * 系统维护状态
     */
    getSystemUpgrade(){
      this.$get('agentapi/system/upgrade_switch').then(res => {
        this.systemUpgrade = res
      })
    },

    /**
     * 数量
     */
    getStatNum() {
      const listQuery = Object.assign({}, this.listQuery, this.form)
      this.$get('agentapi/device_data_stat_num', listQuery).then(res => {
        this.numInfo = res
      })
    },

    /**
     * 请求类型筛选
     * @param {Object} tab
     * @param {Object} event
     */
    typeClick(tab, event) {
      this.listQuery.device_status = tab.name
      this.listQuery.page = 1
      this.getList()
    },

    /**
     * 校验是否可选
     */
    checkSel(row) {
      if (this.ad_id) {
        return true
      } else {
        return row.is_distributed == 0
      }
    },

    /**
       * 选择设备
       * @param {Object} res
       */
    selSb(list) {
      let selSnArr = [], selID = []
      for (var i in list) {
        selSnArr.push(list[i].goods_sn)
        selID.push(list[i].id)
      }
      this.selSnArr = selSnArr
      this.selID = selID
    },

    /**
     * 搜索查询
     */
    toQuery(type = 0) {
      if(this.clickSubmit) return
      this.clickSubmit = true
      this.$refs.filterDrawer.hide()
      if (type == 1) {
        this.form = {}
        this.listQuery.page = 1
      } else {
        this.listQuery.page = 1
      }
      this.getStatNum()
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.page - 1
      })
      if(this.sort_id_key && window.sort_id_key) listQuery.sort_id_key= window.sort_id_key
      this.$get('agentapi/search/query_draft_devices', listQuery).then(res => { //SyStatistics/getDeviceList
        //this.list = res.list
        this.getDeviceDetail(this.arrayKeys(res.list, 'id'), res.list)
        this.listQuery.page_num = res.page_num
        if(this.total_device_num == 0 || this.type_device_num != res.type_device_num){
          this.total_device_num = 0
          for(var i in res.type_device_num){
            this.total_device_num += res.type_device_num[i]
          }
          this.type_device_num = res.type_device_num
        }
        this.tableMaxH = window.innerHeight - this.$refs.equip_table.$el.offsetTop - 83
        if(this.search_device_inet_condition.length == 0){
          this.search_factorys_condition = res.search_factorys_condition
          this.search_device_condition = res.search_device_condition
          this.search_device_inet_condition = res.search_device_inet_condition
        }
        if(this.checkRoles(['terminal'])) this.getOEMInfo(this.arrayKeys(res.list, 'belong_aid'))
        this.clickSubmit = false
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 设备详情
     */
    getDeviceDetail(search_goods_ids = [], list) {
      this.$get('agentapi/search/query_devices_detail', {
        search_goods_ids: JSON.stringify(search_goods_ids)
      }).then(res => {
        let deviceDetail = {}
        if(res.list){
          res.list.map(item => {
            deviceDetail[item.id] = item
          })
          list.map(item => {
            if(deviceDetail[item.id]){
              return Object.assign(item, deviceDetail[item.id])
            }
          })
        }
        this.list = list
        this.listLoading = false
      })
    },

    /**
     * 品牌信息
     */
    getOEMInfo(aids = []) {
      this.$get('commonapi/configer/these_platform_info', {
        son_aids: JSON.stringify(aids)
      }).then(res => {
        this.oemInfo = res.list
      })
    },

    /**
     * @param {Object} row
     * 解绑设备
     */
    deleteEquip(row) {
      const that = this
      this.$alert('确定解绑此商户的设备吗？', '解绑设备', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.$post('agentapi/unset_binded_zuo', {
              zuo_sn: row.goods_sn
            }).then(res => {
              this.$message({
                message: '解绑成功',
                type: 'success'
              })
              row.is_distributed = 0
              row.store_id = ''
              row.store_name = ''
            })
          }
        }
      })
    },

    /**
     * type 1 铺货 2 去分配 3 直接分配 4 回收设备 5 设置房间号
     */
    distribu(type = 1, row) {
      const selSn = this.selSnArr.join(',')
      switch (type) {
        case 1:
          this.$router.push({
            path: '/shop/allShop',
            query: {
              zuo_sn: row ? row.goods_sn : selSn
            }
          })
          break
        case 2:
          this.$router.push({
            path: '/agent/index',
            query: {
              zuo_sn: row ? row.goods_sn : selSn
            }
          })
          break
        case 3:
          this.loadObj = this.$loading({
            lock: true,
            text: '正在分配',
            spinner: 'el-icon-loading'
          })
          this.$post('agentapi/save_distribute_agent_devices', {
            son_id: this.agent_id,
            goods_sn: row ? [row.goods_sn] : this.selSnArr
          }).then(res => {
            this.loadObj.close()
            this.$message({
              message: '分配成功',
              type: 'success'
            })
            history.back()
          })
          break
        case 4:
          this.loadObj = this.$loading({
            lock: true,
            text: '正在回收',
            spinner: 'el-icon-loading'
          })
          this.$post('agentapi/save_recover_agent_devices', {
            son_id: this.listQuery.son_id || row.manage_aid,
            goods_sn: row ? [row.goods_sn] : this.selSnArr
          }).then(res => {
            this.loadObj.close()
            this.$message({
              message: '回收成功',
              type: 'success'
            })
            if(!row.manage_aid){
              history.back()
            } else {
              this.getList()
            }
          })
          break
        case 5:
          this.$prompt('请输入房间号', '房间号', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: row.attach_room_no || ''
          }).then(({
            value
          }) => {
            this.$post('agentapi/device/save_device_room_no', {
              goods_sn: row.goods_sn,
              attach_room_no: value
            }).then(res => {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
              row.attach_room_no = value
            })
          })
          break
      }
    },

    /**
     * @param {Object} row
     * 绑定广告
     */
    bindAd(row) {
      const selSnArr = this.selSnArr
      if (row) selSnArr.push(row.goods_sn)
      this.$post('agentapi/ad/bind_ad_sns', {
        id: this.ad_id,
        goods_sn: selSnArr
      }).then(res => {
        this.$message({
          message: '绑定成功',
          type: 'success'
        })
        history.back()
      })
    },

    /**
       * 设备信息
       */
    equipBelong(row) {
      this.$get('agentapi/get_device_manager', {
        goods_sn: row.goods_sn
      }).then(res => {
        this.eqiupBelong = res.belong
        this.eqiupStore = res.bind_store || {}
        this.equipBelongDialog = true
      })
    },

    /**
     * 展示设备升级层
     * @param {Object} row
     */
    showUpgrade(row){
      this.upgradeObj = {
        upgrade_status: parseInt(row.upgrade_status),
        upgrade_desc: row.upgrade_desc,
        updating_depend: row.updating_depend || [],
        goods_sn: row.goods_sn || ''
      }
      this.device_row = row
      this.upgradeDialog = true
    },

    /**
     * 设备升级
     */
    setUpgrade(){
      let url = 'agentapi/system/upgrade_switch', params
      params = this.upgradeObj
      if(params.goods_sn) {
        params.zuo_sn = this.upgradeObj.goods_sn
        url = 'agentapi/device/upgrade_switch'
      }
      this.$post(url, params).then(res => {
        this.$message({
          message: '设置成功',
          type: 'success'
        })
        this.device_row.upgrade_status = params.upgrade_status
        this.upgradeDialog = false
      })
    },

    /**
     * 设备二维码
     */
    showCode(row){
      if(row.code_sn_src){
        this.$alert('<div class="text-center"><img src="'+ row.code_sn_src +'" width="250"/></div>', '设备二维码', {
          dangerouslyUseHTMLString: true
        })
      }else if(row.code_sn_body){
        this.$get('QRcode/createCodeSnImage', {
          code_sn: row.goods_sn
        }).then(res => {
          row.code_sn_src = res.img_url
          this.$alert('<div class="text-center"><img src="'+ row.code_sn_src +'" width="250"/></div>', '设备二维码', {
            dangerouslyUseHTMLString: true
          })
        })
      }
    },

    /**
     * @param {Object} row
     * 重启设备
     */
    restart(row) {
      const that = this
      this.$alert('确定重启此设备吗？', '重启设备', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.$post('agentapi/device/restart', {
              goods_sn: row.goods_sn
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
            })
          }
        }
      })
    },

    /**
     * 设置设备成本价
     * @param {Object} row
     */
    costPrice(row = {}){
      this.$prompt('请输入设备成本', '设备成本', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: row.cost_price || ''
      }).then(({
        value
      }) => {
        this.$post('agentapi/device/goods_attr', {
          goods_id: row.id ? [row.id] : this.selID,
          cost_price: value
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          if( row.cost_price ){
            row.cost_price = value
          } else {
            this.getList()
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  #equip_table .el-button{
    padding-left: 0;
    padding-right: 0;
    width: 80px;
  }
</style>
