<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <!-- <template v-slot:tabs>
        <el-tabs class="pl-10 pr-10 mb-15 bg-white" v-model="listQuery.deviceTypeId" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'0'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template> -->

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
          <el-button size="medium" :type="listQuery.haveBind === item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.haveBind !== item.value}" v-for="item in haveBind"
            @click="listQuery.haveBind = item.value;toQuery()">{{ item.title }}({{numInfo[item.nkey] || 0}})</el-button>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row @selection-change="selList" :max-height="tableMaxH">
        <el-table-column type="selection" :selectable="checkSel" width="50" />
        <el-table-column label="品牌商" align="center" width="120">
          <template slot-scope="scope">
            {{ oemInfo && oemInfo[scope.row.belong_aid] ? oemInfo[scope.row.belong_aid].mini_name : '--' }}
          </template>
        </el-table-column>
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
                  {{ scope.row.wx_mini_num || 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: `/order?goods_sn=${scope.row.goods_sn}&mini_type=2`})">
                  {{ scope.row.zfb_mini_num || 0 }}
                </el-link>
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
                <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1)">设备归属</el-button>
                <el-button type="primary" size="mini" @click="setRows(1, scope.row, 2)">二维码</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-table :data="deviceBelong" border>
          <el-table-column label="角色" property="role_name" align="center" />
          <el-table-column label="联系信息" align="center">
            <template slot-scope="scope">
              <div v-if="checkRoles(['terminal','partner'])">
                姓名：{{ scope.row.name }}&nbsp;&nbsp;&nbsp;&nbsp;电话：{{ scope.row.phone }}</div>
              <div v-if="scope.row.agent_level == 5">商户名：{{ eqiupStore.store_name }}</div>
              <div v-if="scope.row.agent_level == 5">地址：{{ eqiupStore.address }}</div>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <el-image style="width: 150px; height: 150px" :src="dform.code" fit="cover"></el-image>
          <div class="mt-20 text-grey">SN码：{{ curRow.qrcodeSn }}</div>
        </div>
      </template>
      <div class="mt-30 text-center" v-if="dialogType > 2">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
      <div class="mt-30 text-center" v-else>
        <el-button size="medium" type="primary" @click="dialogStatus = false">确定</el-button>
      </div>
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
      lowerDevice: {
        type: Boolean,
        default: false
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
        haveBind: [{
            value: '',
            title: '全部',
            nkey: ''
          },
          {
            value: true,
            title: '已绑',
            nkey: ''
          },
          {
            value: false,
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
          haveBind: this.$route.query.haveBind || '',
          page: 1,
          size: 20
        },

        selSnArr: [],
        selID: [],

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '设备归属',
          2: '设备二维码'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        // 设备归属
        deviceBelong: [],
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
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          lowerDevice: this.lowerDevice
        })
        this.$get('iot-saas-device/admin/device/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
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
       * 操作行
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '设备归属'  2: '二维码'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            if(dialogType == 1){
              this.$get('iot-saas-device/admin/device/findById', {
                id: row.id
              }).then(res => {
                console.log(res)
              })
            }else if(dialogType == 2){
              this.$set(this.dform, 'refundType', '0')
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
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            if(!params.chargeEndTime){
              this.$message({
                message: '请选择订单结束时间',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-order/admin/order/complete', {
              orderId: this.curRow.id,
              chargeEndTime: params.chargeEndTime
            }).then(res => {
              this.$message({
                message: '结束订单成功',
                type: 'success'
              })
              curRow.status = 2
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 2:
            if(!params.amount){
              this.$message({
                message: '请输入退款金额',
                type: 'error'
              })
              return
            }
            params.orderId = this.curRow.id
            this.$post('iot-saas-order/admin/order/refund', params).then(res => {
              this.$message({
                message: '订单退款成功',
                type: 'success'
              })
              curRow.status = 9
              curRow.amountRefund = params.amount
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
