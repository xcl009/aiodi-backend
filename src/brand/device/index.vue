<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-input v-model="form.qrcodeSn" placeholder="二维码" />
        <el-input v-model="form.deviceSn" placeholder="设备SN" />
        <el-input v-model="form.storeName" placeholder="商户名称" />
        <el-input v-model="form.agentName" placeholder="代理名称" />
        <el-input v-model="form.brandName" placeholder="品牌名称" />
        <el-input v-model="form.factoryName" placeholder="公司名称" />
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex">
        <div class="flex1">
          <el-button size="medium" :type="listQuery.device_status == item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.device_status != item.value}" v-for="item in device_status"
            @click="toQuery(item.value)">{{ item.title }}({{numInfo[item.nkey] || 0}})</el-button>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row @selection-change="selList" :max-height="tableMaxH">
        <el-table-column type="selection" :selectable="checkSel" width="50" />
        <el-table-column label="设备名称" align="center">
          <template slot-scope="scope">
            {{ scope.row.deviceType.name || '密码线' }}
          </template>
        </el-table-column>
        <el-table-column label="设备归属" align="center" width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.manage_name || '用户名' }}</div>
            <div>{{ scope.row.manage_phone || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="设备SN码" align="center" width="230">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>二维码：{{ scope.row.qrcodeSn || "--" }}</div>
              <div class="text-cut">设备SN：{{ scope.row.deviceSn || "--" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设备属性" align="center" width="110">
          <template slot-scope="scope">
            工厂：{{ scope.row.deviceFactory.name }}
          </template>
        </el-table-column>
        <el-table-column label="是否铺货" align="center" width="100">
          <template slot-scope="scope">
            <div>{{ scope.row.distribute ? "是" : "否" }}</div>
            <div>{{ scope.row.operate_date }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户名称" align="center" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.store">
              <div class="text-cut_two">{{ scope.row.store.name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" align="center" width="120">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary"
                  @click="$router.push({path: `/order?goods_sn=${scope.row.goods_sn}&mini_type=1`})">
                  {{ scope.row.wx_mini_num || 0 }}</el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: `/order?goods_sn=${scope.row.goods_sn}&mini_type=2`})">
                  {{ scope.row.zfb_mini_num || 0 }}</el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" align="center" width="90">
          <template slot-scope="scope">
            {{ scope.row.order_amount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="120" v-if="false">
          <template slot-scope="scope">
            <div class="text-danger">已绑定</div>
            <div>2021-11-26 18:27</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="190" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex justify-center">
              <div class="flex flex-wrap w-160">
                <el-button type="primary" size="mini" @click="deviceBelong(scope.row)">设备归属</el-button>
                <el-button type="primary" size="mini" @click="unboundStore(scope.row)" v-if="scope.row.distribute">解绑</el-button>
                <el-button type="primary" size="mini" @click="$router.push({path: `/agent/index?deviceId=${scope.row.id}`})" v-if="!scope.row.distribute">去分配</el-button>
                <el-button type="primary" size="mini" @click="$router.push({path: `/store/meStore?deviceId=${scope.row.id}`})" v-if="!scope.row.distribute">去铺货</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="rel flex justify-center">
        <div class="abs flex pagination-left">
          <el-button type="primary" size="medium" :disabled="selID.length == 0" @click="$router.push({path: `/store/meStore?deviceId=${selID}`})">去铺货</el-button>
          <el-button type="primary" size="medium" :disabled="selID.length == 0" @click="toQuery(item.value)">去分配</el-button>
        </div>
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-dialog title="设备归属" :visible.sync="deviceBelongDialog">
      <el-table :data="deviceBelong">
        <el-table-column label="角色" property="role_name" />
        <el-table-column label="联系信息">
          <template slot-scope="scope">
            <div v-if="checkRoles(['terminal','partner'])">
              姓名：{{ scope.row.name }}&nbsp;&nbsp;&nbsp;&nbsp;电话：{{ scope.row.phone }}</div>
            <div v-if="scope.row.agent_level == 5">商户名：{{ eqiupStore.store_name }}</div>
            <div v-if="scope.row.agent_level == 5">地址：{{ eqiupStore.address }}</div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'

  export default {
    name: 'device',
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
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      myDevice() {
        return this.$store.state.user.myDevice
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
        device_status: [{
            value: 0,
            title: '全部',
            nkey: ''
          },
          {
            value: 1,
            title: '已绑',
            nkey: ''
          },
          {
            value: 2,
            title: '未绑',
            nkey: ''
          }
        ],
        form: {
          //search_store_name: this.$route.query.store_name || ''
        },
        numInfo: {},
        tableMaxH: '250',
        oemInfo: {},
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          device_status: this.$route.query.device_status || 0,
          // search_user_type: this.user_type,
          page: 1,
          size: 20
        },

        selSnArr: [],
        selID: [],

        // 设备归属
        deviceBelong: [],
        eqiupStore: {},
        deviceBelongDialog: false
      }
    },
    mounted(options) {
      this.toQuery()
    },
    methods: {
      /**
       * 信号值注解
       */
      renderHeader(h, {
        column,
        $index
      }) {
        return [column.label, h(
          'el-tooltip', {
            props: {
              content: '0~31，31为最好，大于18方可连接网络',
              placement: 'top'
            }
          },
          [h('span', {
            class: {
              'el-icon-question': true
            }
          })]
        )]
      },

      /**
       * 校验是否可选
       */
      checkSel(row) {
        return !row.distribute
      },

      /**
       * 选择设备
       * @param {Object} res
       */
      selList(list) {
        let selSnArr = [],
          selID = []
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
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        //this.getStatNum()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        //this.getStatNum()
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-device/admin/device/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.rows
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
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

      /**
       * 设备解绑
       */
      unboundStore(row){
        this.$alert('确定解绑设备？', '解绑设备', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-device/admin/device/singleUnboundStore', {
                deviceId: row.id
              }).then(res => {
                this.$message({
                  message: '解绑成功',
                  type: 'success'
                })
                row.distribute = false
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
