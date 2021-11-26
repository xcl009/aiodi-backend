<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="商户名称:">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="二维码:">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="设备SN:">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
      </template>
    </condition>

    <div class="p-5">
      <div class="flex pl-10 pr-10 bg-white">
        <div class="flex1">
          <el-tabs v-model="listQuery.device_status" @tab-click="toQuery()">
            <el-tab-pane :label="`全部(${numInfo.all_num || 0})`" name="0" />
            <el-tab-pane :label="`在线(${numInfo.online_num || 0})`" name="1" />
            <el-tab-pane :label="`离线(${numInfo.not_online_num || 0})`" name="2" />
            <el-tab-pane :label="`已绑(${numInfo.distributed_num || 0})`" name="4" />
            <el-tab-pane :label="`未绑(${numInfo.not_distributed_num || 0})`" name="5" />
          </el-tabs>
        </div>
      </div>

      <div class="bg-white">
        <el-table
          class="ptd-5"
          id="list_table"
          ref="list_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          @selection-change="selList"
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
          <el-table-column label="设备属性" width="110">
            <template slot-scope="scope">
              {{ search_factorys_condition[scope.row.device_factory_id] }}
              {{ scope.row.device_type_classify }}
              {{ scope.row.device_inet_type }}
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
          <el-table-column label="订单数" width="120">
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
          <el-table-column label="操作" width="270" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" plain round @click="deviceBelong(scope.row)">设备归属</el-button>
              <template v-if="listQuery.search_user_type == 0">
                <el-button type="primary" size="mini" plain round class="ml-0" @click="distribu(5, scope.row)" v-if="scope.row.is_distributed == 1">房间号</el-button>
                <el-button type="primary" size="mini" plain round v-else class="ml-0" @click="distribu(1, scope.row)">去&nbsp;铺&nbsp;货</el-button>
                <el-button type="primary" size="mini" plain round class="ml-0" v-if="agent_id && scope.row.is_distributed == 0" @click="distribu(3, scope.row)">分配设备</el-button>
                <el-button type="primary" size="mini" plain round class="ml-0" v-else-if="scope.row.is_distributed == 0"  @click="distribu(2, scope.row)">分配设备</el-button>
              </template>
              <el-button type="primary" size="mini" plain round class="ml-0" v-if="scope.row.is_distributed == 1" @click="deletedevice(scope.row)">&nbsp;解&nbsp;&nbsp;绑&nbsp;</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" v-else-if="listQuery.search_user_type == 1 && scope.row.is_distributed == 0"  @click="distribu(4, scope.row)">回收设备</el-button>
              <el-button type="primary" size="mini" plain round class="ml-0" @click="showCode(scope.row)">二维码</el-button>
              <el-button size="mini" type="primary" plain round class="ml-0" v-if="checkRoles(['terminal'])" @click="costPrice(scope.row)">设备成本</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="flex justify-center">
          <pagination
            v-show="listQuery.pageSize > 0"
            :page.sync="listQuery.page"
						:limit.sync="listQuery.size"
            @pagination="getList"
          />
        </div>
      </div>

      <el-dialog title="设备归属" :visible.sync="deviceBelongDialog">
        <el-table :data="deviceBelong">
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
              <el-button type="primary" size="small" plain round :disabled="scope.row.bao_status != 0" @click="devicePopup(scope.row)">弹出</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'

  export default {
    name: 'Order',
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
    computed: {
      device() {
        return this.$store.state.app.device
      },
      deviceNameObj() {
        return this.$store.state.user.deviceNameObj
      },
      deviceKeyObj() {
        return this.$store.state.user.deviceKeyObj
      },
      agentDevice() {
        return this.$store.state.user.agentDevice
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      }
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          search_store_name: this.$route.query.store_name || ''
        },
        numInfo: {},
        tableMaxH: '250',
        oemInfo: {},
        list: [],
        listLoading: false,
        listQuery: {
          device_status: this.$route.query.device_status || 0,
          search_user_type: this.user_type,
          page: 1,
          size: 20
        },

        selSnArr: [],
        selID: [],

        // 设备归属
        deviceBelong: [],
        eqiupStore: {},
        deviceBelongDialog: false,

        // 设备弹出
        statusArr: ['在槽', '借出中', '已借出', '异常'],
        baoList: [],
        baoDialog: false
      }
    },
    mounted(options) {

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
       * 校验是否可选
       */
      checkSel(row) {
        return row.is_distributed == 0
      },

      /**
       * 选择设备
       * @param {Object} res
       */
      selList(list) {
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
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        if (this.cat_id && this.cat_id.length > 0) {
          this.form.cat_id = this.cat_id[this.cat_id.length - 1]
        }
        if (this.search_regions_tag && this.search_regions_tag.length > 0) {
          this.form.search_regions_tag = this.search_regions_tag[this.search_regions_tag.length - 1]
        }
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getStatNum()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getStatNum()
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('agentapi/search/query_orders_new', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.clickSubmit = false
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
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
    }
  }
</script>

<style lang="scss" scoped>

</style>
