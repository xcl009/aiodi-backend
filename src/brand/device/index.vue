<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'0'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>

      <template v-slot:defult>
        <el-input v-model="form.deviceSn" placeholder="二维码" />
        <el-input v-model="form.factorySn" placeholder="设备SN" />
        <selectSearch v-model="form.storeId" :type="3" name="name" placeholder="商户名称" @change="toQuery()" v-if="!isStore()"></selectSearch>
        <selectSearch v-model="form.agentId" :type="5" name="name" placeholder="代理名称" @change="toQuery()" v-if="lowerDevice && !isStore()"></selectSearch>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex" v-if="!isStore()" >
        <div class="flex1">
          <el-button size="medium" :type="listQuery.haveBind === item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.haveBind !== item.value}" v-for="item in haveBind"
            @click="listQuery.haveBind = item.value;toQuery()">{{ item.title }}({{deviceCount[item.nkey] || 0}})</el-button>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row @selection-change="selList" :max-height="tableMaxH">
        <el-table-column type="selection" :selectable="checkSel" width="50" />
        <el-table-column label="设备名称" width="120">
          <template slot-scope="scope">
            {{ scope.row.deviceType.name || '密码线' }}
          </template>
        </el-table-column>
        <el-table-column label="设备归属" width="180" v-if="lowerDevice">
          <template slot-scope="scope">
            <template v-if="scope.row.agent">
              <div>{{ scope.row.agent.name }}</div>
              <div>{{ dealPhone(scope.row.agent.mobile) }}</div>
            </template>
            <template v-else>
              <div>{{ scope.row.brand.name }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="设备SN码">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>二维码：{{ scope.row.deviceSn || "--" }}</div>
              <div class="text-cut">设备SN：{{ scope.row.factorySn || "--" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可借|可还" v-if="myDeviceId['PA']">
          <template slot-scope="scope">
            <div v-if="scope.row.onlineStatus">
              {{ scope.row.tenantNumber }}|{{ scope.row.restoreNumber }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" v-if="myDeviceId['PA']">
          <template slot-scope="scope">
            <div v-if="scope.row.onlineStatus">
              <div :class="scope.row.onlineStatus == 'online' ? 'text-primary' : 'text-danger'">{{ scope.row.onlineStatus == 'online' ? '在线' : '离线'}}</div>
              <div>{{ parseTime(scope.row.updateTime) }}</div>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="设备属性" width="110">
          <template slot-scope="scope">
            工厂：{{ scope.row.deviceFactory.name }}
          </template>
        </el-table-column>
        <el-table-column label="是否铺货" width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.distribute ? "是" : "否" }}</div>
            <div v-if="scope.row.distribute">{{ scope.row.bindStoreTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户名称" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.store">
              <div class="text-cut_two">{{ scope.row.store.name }}</div>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="120">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary"
                  @click="$router.push({path: `/order?deviceIds=${scope.row.id}&sourceType=1`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx : 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: `/order?deviceIds=${scope.row.id}&sourceType=2`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].ali : 0 }}
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" width="90">
          <template slot-scope="scope">
            {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" :fixed="device == 'desktop' ? 'right' : false" v-if="!isStore()">
          <template slot-scope="scope">
            <div class="flex justify-center">
              <div class="flex flex-wrap w-160">
                <el-button type="primary" size="mini" @click="setRows(1, scope.row, 2)">二维码</el-button>
                <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1)" v-if="lowerDevice == false">设备归属</el-button>
                <el-button type="primary" size="mini" @click="unboundStore(scope.row)" v-if="scope.row.distribute">解绑</el-button>
                <template v-if="lowerDevice">
                  <el-button type="primary" size="mini"
                    @click="unbindAgent(scope.row, scope.$index)" v-if="!scope.row.distribute">
                  回收设备</el-button>
                </template>
                <template v-else>
                  <el-button type="primary" size="mini"
                    @click="$router.push({path: `/agent/index?deviceId=${scope.row.id}`})" v-if="!scope.row.distribute">
                    去分配</el-button>
                  <el-button type="primary" size="mini"
                    @click="$router.push({path: `/store/meStore?deviceId=${scope.row.id}`})" v-if="!scope.row.distribute">
                  去铺货</el-button>
                </template>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="rel flex justify-center">
        <div class="abs flex pagination-left">
          <template v-if="lowerDevice">
            <el-button type="primary" size="medium" :disabled="selID.length == 0"
              @click="unbindAgent()">批量回收
            </el-button>
          </template>
          <template v-else-if="!isStore()">
            <el-button type="primary" size="medium" :disabled="selID.length == 0"
              @click="$router.push({path: `/store/meStore?deviceId=${selID}`})">批量铺货</el-button>
            <el-button type="primary" size="medium" :disabled="selID.length == 0"
              @click="$router.push({path: `/agent/index?deviceId=${selID}`})">批量分配
            </el-button>
          </template>
        </div>
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-table :data="deviceInfo[curRow.id].deviceOwnerUserList" border v-if="deviceInfo[curRow.id]">
          <el-table-column label="角色">
            <template slot-scope="scope">
              {{ config.system_role[scope.row.userType] }}
            </template>
          </el-table-column>
          <el-table-column label="联系信息">
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <el-image class="access-url" :src="deviceInfo[curRow.id].accessUrl" fit="cover" v-if="deviceInfo[curRow.id] && deviceInfo[curRow.id].accessUrl"></el-image>
          <div class="access-url" id="accessUrl" v-else></div>
          <div class="mt-20 text-grey">SN码：{{ curRow.deviceSn }}</div>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" label-width="auto">
          <el-form-item>
            <el-input v-model="dform.mobile" placeholder="请输入备注(如房间号)"></el-input>
          </el-form-item>
        </el-form>
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
  import selectSearch from '@/components/condition/selectSearch'
  import QRCode from 'qrcodejs2'
  export default {
    name: 'device',
    components: {
      Pagination,
      condition,
      selectSearch
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
        haveBind: [
          {
            value: '',
            title: '全部',
            nkey: 'deviceNumber'
          },
          {
            value: true,
            title: '已绑',
            nkey: 'bindStoreNumber'
          },
          {
            value: false,
            title: '未绑',
            nkey: 'noBindStoreNumber'
          }
        ],
        form: {
          //search_store_name: this.$route.query.store_name || ''
        },
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          haveBind: this.$route.query.haveBind || '',
          page: 1,
          size: 20
        },
        orderCount: {},
        deviceCount: {},

        selSnArr: [],
        selID: [],

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '设备归属',
          2: '设备二维码',
          3: '备注'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        // 设备归属
        deviceInfo: {},
      }
    },
    mounted(options) {
      let query = this.$route.query
      this.queryKey = ['brandId', 'storeId', 'agentId', 'deviceIds', 'sourceType']
      for (var i in this.queryKey) {
        if(query[this.queryKey[i]]) this.form[this.queryKey[i]] = query[this.queryKey[i]]
      }
      if(!this.isStore()) this.queryDeviceCount()
      this.toQuery()
    },
    methods: {
      /**
       * 设备数量统计查询
       */
      queryDeviceCount(){
        let params = {}
        if(this.form.agentId){
          params.countType = 'AGENT'
          params.groupIds = this.form.agentId
        } else if(this.isAgent()){
          params.countType = 'AGENT'
          params.groupIds = this.agentInfo.agentId
        } else if(this.isBrand()){
          params.countType = 'BRAND'
          params.groupIds = this.agentInfo.brandId
        }
        if(this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
        this.$get('iot-saas-device/admin/device/count/queryGroupCount', params).then(res => {
          if(res[params.groupIds]){
            res = res[params.groupIds]
          } else {
            this.deviceCount = {
              deviceNumber: 0,
              bindStoreNumber: 0,
              noBindStoreNumber: 0
            }
            return
          }
          if(this.lowerDevice){
            this.deviceCount = {
              deviceNumber: res.lowerDeviceNumber,
              bindStoreNumber: res.lowerBindStoreNumber,
              noBindStoreNumber: parseInt(res.lowerDeviceNumber) -  parseInt(res.lowerBindStoreNumber)
            }
          } else {
            this.deviceCount = {
              deviceNumber: parseInt(res.deviceNumber) -  parseInt(res.lowerDeviceNumber),
              bindStoreNumber: parseInt(res.bindStoreNumber) -  parseInt(res.lowerBindStoreNumber),
              noBindStoreNumber: (parseInt(res.deviceNumber) -  parseInt(res.lowerDeviceNumber)) - (parseInt(res.bindStoreNumber) -  parseInt(res.lowerBindStoreNumber))
            }
          }
        })
      },

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
        this.getList()
        this.queryDeviceCount()
      },

      /**
       * 重置查询
       */
      reset() {
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
        this.queryDeviceCount()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          lowerDevice: this.lowerDevice
        })
        if(params.deviceTypeCode == 0) delete params.deviceTypeCode
        this.$get('iot-saas-device/admin/device/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
          }
          this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 订单统计数量查询
       */
      queryOrderCount(ids){
        if(ids.length == 0){
          this.orderCount = {}
          return
        }
        this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
          countType: 'DEVICE',
          groupIds: ids.join(',')
        }).then(res => {
          this.orderCount = res
        })
      },

      /**
       * 设备解绑
       */
      unboundStore(row) {
        this.$alert('确定解绑该设备？', '解绑设备', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-device/admin/device/unbindStore', {
                deviceIds: [row.id]
              }).then(res => {
                this.$message({
                  message: '解绑成功',
                  type: 'success'
                })
                row.distribute = false
                row.store = ''
              })
            }
          }
        })
      },

      /**
       * 设备回收
       */
      unbindAgent(row, idx) {
        this.$alert('确定回收该设备？', '回收设备', {
          confirmButtonText: '确定',
          center: true,
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-device/admin/device/unbindAgent', {
                deviceIds: row ? [row.id] : this.selID
              }).then(res => {
                this.$message({
                  message: '回收成功',
                  type: 'success'
                })
                if(idx){
                  this.list.splice(idx, 1)
                } else {
                  this.getList()
                }
              })
            }
          }
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
            if(dialogType == 1 || dialogType == 2){
              if(this.deviceInfo[row.id]){
                this.$nextTick(()=>{
                  if(!this.deviceInfo[row.id].accessUrl && dialogType == 2){
                    this.deviceCode(this.deviceInfo[row.id].content)
                  }
                })
                return
              }
              this.$get('iot-saas-device/admin/device/findBelongById', {
                id: row.id
              }).then(res => {
                this.$set(this.deviceInfo, row.id, res)
                if(!res.accessUrl && dialogType == 2){
                  this.deviceCode(res.content)
                }
              })
            }
            break
        }
      },

      /**
       * 设置二维码
       */
      deviceCode(url){
        document.getElementById('accessUrl').innerHTML = ''
        new QRCode('accessUrl', {
          width: 150,
          height: 150,
          text: url
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .access-url{
    margin: 0 auto;
    width: 150px;
    height: 150px
  }
</style>
