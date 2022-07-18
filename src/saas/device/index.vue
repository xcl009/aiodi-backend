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
        <selectSearch v-model="form.storeId" :type="3" name="name" placeholder="商户名称" @change="toQuery()"></selectSearch>
        <selectSearch v-model="form.agentId" :type="5" name="name" placeholder="代理名称" @change="toQuery()"></selectSearch>
        <selectSearch v-model="form.brandId" :type="6" name="name" placeholder="品牌名称" @change="toQuery()"></selectSearch>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex">
        <div class="flex1">
          <el-button size="medium" :type="listQuery.haveBind === item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.haveBind !== item.value}" v-for="item in haveBind"
            @click="listQuery.haveBind = item.value;toQuery()">{{ item.title }}({{deviceCount[item.nkey] || 0}})</el-button>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row :max-height="tableMaxH">
        <el-table-column label="品牌商" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.brand.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="设备名称" width="120">
          <template slot-scope="scope">
            {{ scope.row.deviceType.name || '密码线' }}
          </template>
        </el-table-column>
        <el-table-column label="设备归属" width="180">
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
        <el-table-column label="商户名称" width="180">
          <template slot-scope="scope">
            <div v-if="scope.row.store">
              <div class="text-cut_two">{{ scope.row.store.name }}</div>
            </div>
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
        <el-table-column label="操作" width="190" :fixed="device == 'desktop' ? 'right' : false">
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
      <div class="mt-30 text-center" v-if="dialogType > 2">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
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
          // {
          //   value: 'online',
          //   title: '在线',
          //   nkey: 'bindStoreNumber'
          // },
          // {
          //   value: 'offline',
          //   title: '离线',
          //   nkey: 'bindStoreNumber'
          // },
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
        form: {},
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
        deviceInfo: {},
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
      let query = this.$route.query
      this.queryKey = ['brandId', 'agentId']
      for (var i in this.queryKey) {
        this[this.queryKey[i]] = query[this.queryKey[i]]
      }
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery(1)
        this.queryDeviceCount()
      }
      this.urlQuery = this.$route.meta.urlQuery
    },
    mounted(options) {

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
      },

      /**
       * 设备数量统计查询
       */
      queryDeviceCount(){
        let params = {}
        if(this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
        if(this.agentId){
          params.countType = 'AGENT'
          params.groupIds = this.agentId
        }else if(this.brandId){
          params.countType = 'BRAND'
          params.groupIds = this.brandId
        } else {
          if(this.deviceCount.deviceNumber != undefined){
            if(params.deviceTypeCode){
              this.deviceCount.deviceNumber = 0
              this.deviceCount.bindStoreNumber = 0
              this.deviceCount.noBindStoreNumber = 0
              for(var i in this.deviceCount.deviceTypeDetail){
                let item = this.deviceCount.deviceTypeDetail[i]
                if(i.indexOf(params.deviceTypeCode) > -1){
                  this.deviceCount.deviceNumber += parseInt(item.deviceNumber)
                  this.deviceCount.bindStoreNumber += parseInt(item.bindStoreNumber)
                  this.deviceCount.noBindStoreNumber += parseInt( item.deviceNumber ) - parseInt( item.bindStoreNumber )
                }
              }
            } else {
              this.deviceCount.deviceNumber = this.deviceCountes.deviceNumber
              this.deviceCount.bindStoreNumber = this.deviceCountes.bindStoreNumber
              this.deviceCount.noBindStoreNumber = this.deviceCountes.noBindStoreNumber
            }
          } else {
            this.$get('iot-saas-device/admin/device/count/queryByUser').then(res => {
              res.noBindStoreNumber = parseInt( res.deviceNumber ) - parseInt( res.bindStoreNumber )
              this.deviceCountes = JSON.parse(JSON.stringify(res))
              this.deviceCount = res
            })
          }
          return
        }
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
          this.deviceCount = {
            deviceNumber: res.deviceNumber,
            bindStoreNumber: res.bindStoreNumber,
            noBindStoreNumber: parseInt(res.deviceNumber) -  parseInt(res.bindStoreNumber)
          }
        })
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          lowerDevice: this.lowerDevice
        })
        for(var i in this.queryKey){
          if(this[this.queryKey[i]]){
            params[this.queryKey[i]] = this[this.queryKey[i]]
          }
        }
        if(['online', 'offline'].indexOf(params.haveBind) > -1){
          params.onlineStatus = params.haveBind
          delete params.haveBind
        }
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
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:

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
