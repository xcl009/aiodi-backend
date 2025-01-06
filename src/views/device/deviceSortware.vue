<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
      @saveXlsx="saveXlsx">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName"
              v-if="item == 'PA'" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.deviceStatus') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.haveBind" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}(${deviceCount[item.nkey] || 0})`" :name="'' + item.value + ''"
              v-for="item in haveBind" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 2">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" :placeholder="$t('public.pleaseSelect')">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key" v-if="checkQueryRepeat(key, item, formKey)"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
              <el-input :placeholder="`${$t('public.enter')}${queryObj[formKey[`sel${item}`]].title}`"
                v-model="form[formKey[`sel${item}`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel${item}`]]" :type="queryObj[formKey[`sel${item}`]].sType"
                :name="queryObj[formKey[`sel${item}`]].name" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                @change="toQuery()"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                clearable @change="toQuery()">
                <el-option :label="item.label" :value="item.value"
                  v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(5, {})" v-if="isSaas()">清除设备缓存</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(3, {}, 11)" v-if="isBrand() || isSaas()">设备软件升级</div>
        <table-column-set storageKey="deviceSortwareTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row @selection-change="selList" :max-height="tableMaxH">
        <el-table-column type="selection" width="50" />
        <el-table-column :label="$t('public.brand')" width="150" v-if="isSaas()">
          <template slot-scope="scope">
            {{ scope.row.brand.name }}
          </template>
        </el-table-column>
        <template v-for="item in showColumn">
          <el-table-column :label="item.name" width="100" v-if="item.val && item.key == 'deviceType'">
            <template slot-scope="scope">
              {{ scope.row.deviceType.name || '' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="240" v-else-if="item.val && item.key == 'deviceSn'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <span class="mr-10">{{ scope.row.deviceSn || "--" }}</span>
                <el-popover trigger="hover">
                  <div class="access-url" :ref="`sn_${scope.row.deviceSn}`" :id="`sn_${scope.row.deviceSn}`"></div>
                  <div class="flex" slot="reference">
                    <svg-icon icon-class="h_qrcode"
                      @mouseover="deviceCode(scope.row.deviceSn, scope.row.content)"></svg-icon>
                  </div>
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="100" v-else-if="item.val && item.key == 'tenantNumber'">
            <template slot-scope="scope">
              <div
                v-if="scope.row.onlineStatus && (scope.row.deviceType.code.indexOf('PA') > -1 || scope.row.deviceType.code.indexOf('CU') > -1)">
                {{ scope.row.tenantNumber }} / {{ scope.row.restoreNumber }}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'deviceFactory'">
            <template slot-scope="scope">
              {{ scope.row.deviceFactory ? scope.row.deviceFactory.name : '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="95" v-else-if="item.val && item.key == 'onlineStatus'">
            <template slot-scope="scope">
              <div
                v-if="scope.row.onlineStatus && checkAbility(['PA', 'DC', 'VG', 'AV', 'BD', 'CU'], 2, [scope.row.deviceType])">
                <el-popover trigger="hover">
                  <div>{{ scope.row.updateTime }}</div>
                  <span class="cursor text-primary" slot="reference"
                    v-if="scope.row.onlineStatus == 'ONLINE'">{{ $t('public.onLine') }}</span>
                  <span class="cursor text-danger" slot="reference"
                    v-else>{{ $t('public.offline') }}{{ formatSeconds(currentTime() - unixTime(scope.row.updateTime), 'd') }}</span>
                </el-popover>
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 150"
            v-else-if="item.val"></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="235" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('device.message1')" @onConfirm="unboundStore(scope.row)">
                <el-button type="text" :disabled="!scope.row.distribute" slot="reference">{{ $t('device.unbind') }}</el-button>
              </el-popconfirm>
              <el-button type="text" v-if="myDeviceId['PA'] && checkAbility(['eject'], 3)"
                :disabled="['PA01', 'DC01'].indexOf(scope.row.deviceType.code) == -1" slot="reference"
                @click="$router.push({path: `/device/eject?deviceSn=${scope.row.deviceSn}`})">{{ $t('public.eject') }}</el-button>
              <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('device.restartText')" @onConfirm="restart(scope.row)"
                v-if="scope.row.onlineStatus == 'ONLINE' && scope.row.deviceType.code.indexOf('PA') > -1">
                <el-button type="text" slot="reference">{{ $t('device.restart') }}</el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="rel flex justify-center">
        <div class="abs flex pagination-left">
          <el-button type="primary" size="mini" :disabled="selID.length == 0" @click="setRows(3, {}, 11)">设备软件升级</el-button>
        </div>
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus"
      :close-on-click-modal="[11].indexOf(dialogType) == -1" :wrapperClosable="[11].indexOf(dialogType) == -1">
      <template v-if="dialogType == 7">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('public.deviceSn')">
            <el-input v-model="dform.deviceSN" :placeholder="$t('public.deviceSn')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('device.serverAddress')">
            <el-input v-model="dform.address" :placeholder="$t('device.serverAddressText')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('device.port')">
            <el-input v-model="dform.port" :placeholder="$t('device.portText')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('device.heartbeatTime')">
            <el-input v-model="dform.heartbeat" :placeholder="$t('device.heartbeatTimeText')">
              <template slot="append">{{ $t('public.second') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="text-danger">{{ $t('device.message5') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 11">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()" style="width: 600px;">
          <el-form-item label="设备二维码">
            <el-input v-model="dform.deviceSns" placeholder="多设备英文逗号隔开" type="textarea" rows="4"></el-input>
          </el-form-item>
          <!-- <el-form-item label="设备工厂">
            <el-select v-model="dform.factoryCode">
              <template v-for="item in factoryList">
                <el-option :label="item.name" :value="item.code"></el-option>
              </template>
            </el-select>
          </el-form-item> -->
          <el-form-item label="叠层口数">
            <el-select v-model="dform.deviceSlot" @change="selSlot">
              <template v-for="item in [4,6,8,12,16,20,24,28,32,36,40]">
                <el-option :label="item + '口'" :value="item"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="软件类型">
            <el-radio-group v-model="dform.updateType" @change="selUpdateType">
              <el-radio :label="key"
                v-for="(item, key) in updateType">{{ item }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="更新包地址">
            <el-input v-model="dform.domainUrl" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="更新包路径">
            <el-input v-model="dform.path" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="更新包md5">
            <el-input v-model="dform.md5" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="更新包大小">
            <el-input v-model="dform.size" :placeholder="$t('public.enter')" :disabled="updateDisabled"><template
                slot="append">字节</template></el-input>
          </el-form-item>
          <el-form-item label="设备版本">
            <el-input v-model="dform.deviceVersion" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="包版本名称">
            <el-input v-model="dform.fileVersion" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[3, 6, 7, 11, 12].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-popconfirm :title="dialogType == 11 ? '请仔细确认升级设备和软件类型及版本是否匹配，不匹配会导致设备出现异常' : '确定提交吗？'"
            @onConfirm="dialogConfirm()">
            <el-button size="medium" type="primary" :disabled="clickSubmit"
              slot="reference">{{ $t('public.confirm') }}</el-button>
          </el-popconfirm>
        </div>
      </template>
    </el-drawer>

    <xlsx ref="toXlsx" :fileName="$t('device.equipmentRecord')"></xlsx>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import TableColumnSet from '@/components/TableColumnSet/index'
  import xlsx from '@/components/xlsx/'
  import QRCode from 'qrcodejs2'
  import {
    unixTime,
    formatSeconds,
    currentTime,
    accSub
  } from '@/utils/index'
  export default {
    name: 'deviceSortward',
    components: {
      TableColumnSet,
      Pagination,
      condition,
      selectSearch,
      xlsx
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
      },
      Ability() {
        return this.$store.getters.Ability
      },
      haveBind() {
        return [{
            value: 0,
            title: this.$t('public.all'),
            nkey: 'SUM'
          },
          {
            value: 'ONLINE',
            title: this.$t('public.onLine'),
            nkey: 'ONLINE'
          },
          {
            value: 'OFFLINE',
            title: this.$t('public.offline'),
            nkey: 'OFFLINE'
          }
        ]
      },
      queryObj() {
        return {
          deviceSn: {
            title: this.$t('public.code'),
            type: 'input'
          },
          roomVer: {
            title: 'roomVer',
            type: 'input'
          },
          brandId: {
            title: this.$t('public.brandName'),
            type: 'selectSearch',
            name: 'name',
            sType: 6
          }
        }
      },
      dialogTitle() {
        return {
          7: this.$t('device.address'),
          9: this.$t('device.switchBrand'),
          10: this.$t('device.goodsToMerchants'),
          11: '设备软件升级',
          12: '系统状态设置'
        }
      },
      defaultColumn() {
        return [{
            key: 'deviceType',
            val: true,
            name: this.$t('public.deviceType')
          },
          {
            key: 'factorySn',
            val: true,
            name: this.$t('device.deviceSnCode'),
            width: 200,
          },
          {
            key: 'deviceSn',
            val: true,
            name: this.$t('public.code')
          },
          {
            key: 'tenantNumber',
            val: this.checkAbility(['PA'], 2),
            hidden: !this.checkAbility(['PA'], 2),
            name: this.$t('device.lendableReturnable')
          },
          {
            key: 'deviceFactory',
            val: true,
            name: this.$t('public.deviceProperties')
          },
          {
            key: 'onlineStatus',
            val: true,
            name: this.$t('public.presence')
          },
          {
            key: 'trafficCardId',
            val: true,
            name: this.$t('device.trafficCardNumber'),
            width: 250
          },
          {
            key: 'signalStrength',
            val: true,
            name: this.$t('device.signalValue'),
            width: 80
          },
          {
            key: 'romVer',
            val: true,
            name: 'RomVersion',
            width: 'auto'
          },
          {
            key: 'voice',
            val: true,
            name: this.$t('device.volume'),
            width: 80
          },
          {
            key: 'batteryLevel',
            val: false,
            name: this.$t('device.electricity')
          }
        ]
      }
    },
    data() {
      return {
        formatSeconds: formatSeconds,
        unixTime: unixTime,
        clickSubmit: false,
        formKey: {
          sel1: 'deviceSn',
          sel2: 'brandId'
        },
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20,
          deviceTypeCode: 'PA',
        },
        deviceCount: {},

        selSnArr: [],
        selID: [],

        // 钱包 + 快活币余额
        money: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        drawerStatus: false,
        curRow: {},
        curIdx: 0,
        dform: {},
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
        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
        // 设备归属
        deviceInfo: {},

        factoryList: [],

        updateType: {'1': '网关版', '10': '仓位版(10)', '12': '仓位版(12)'},
        updateDisabled: true
      }
    },
    beforeRouteEnter(to, from, next) {
      to.meta.urlQuery = JSON.stringify(to.query)
      to.meta.reload = false
      next()
    },
    activated() {
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery()
      }
      this.urlQuery = this.$route.meta.urlQuery
    },
    mounted(options) {

    },
    methods: {
      /**
       * 选择设备
       * @param {Object} res
       */
      selList(list) {
        let selSnArr = [],
          selID = []
        for (var i in list) {
          selSnArr.push(list[i].deviceSn)
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
        this.deviceCodeIds = {}
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
          lowerDevice: this.lowerDevice,
          factoryCode: this.agentInfo.username,
        })
        if (['ONLINE', 'OFFLINE'].indexOf(params.haveBind) > -1) {
          params.onlineStatus = params.haveBind
          delete params.haveBind
        }
        if (params.haveBind == 0) delete params.haveBind
        if (params.deviceTypeCode == 0) delete params.deviceTypeCode
        this.$get('iot-saas-device/admin/device/findPage', params).then((res = {}) => {
          this.list = res.rows || []
          if (this.outStatus) {
            let end = false
            if (params.size > this.list.length) end = true
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size), () => {
                if (end) {
                  this.outStatus = false
                  this.toQuery()
                } else {
                  this.listQuery.page += 1
                  this.getList()
                }
              })
            })
          } else {
            this.listLoading = false
            this.clickSubmit = false
            if (params.page == 0) {
              this.listTotal = res.total
              this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
              this.deviceCount = res.ext || {}
            }
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 导出
       */
      saveXlsx() {
        this.outStatus = true
        this.listLoading = true
        this.listQuery.size = 100
        this.list = []
        this.$refs['toXlsx'].clearData()
        this.getList()
      },

      /**
       * 设备重启
       */
      restart(row) {
        this.$get('iot-saas-device/admin/device/restartDevice', {
          deviceSn: row.deviceSn
        }).then(res => {
          this.$message({
            message: this.$t('public.operationSuccessful'),
            type: 'success'
          })
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型  3
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            this.dform = {}
            break
          case 3:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.drawerStatus = true
            this.dform = {}
            if (dialogType == 11) {
              this.getFactory()
              let deviceSns = ''
              if(this.selSnArr.length > 0){
                deviceSns = this.selSnArr.join(',')
              }
              this.dform = {
                deviceSns: deviceSns,
                factoryCode: this.agentInfo.username,
                updateType: '1',
              }
            }
            break
          case 5:
            this.$prompt('请输入设备二维码(多设备用英文逗号隔开)', '温馨提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(({
              value
            }) => {
              this.$get(`iot-saas-device/open/device/delDeviceInfoRedisByDeviceSn`, {
                deviceSns: value.split(',')
              }).then(res => {
                this.$message({
                  message: this.$t('public.operationSuccessful'),
                  type: 'success'
                })
              })
            })
            break
        }
      },

      /**
       * 获取工厂
       */
      getFactory() {
        if (this.factoryList.length > 0) return
        this.$get('iot-saas-basic/admin/factory/list').then(res => {
          this.factoryList = res.filter(item => item.deviceTypeList && item.deviceTypeList.indexOf('PA') > -1)
        })
        this.$get('iot-saas-pay/open/pay/system/config', {
          key: 'deviceUpdateConfig'
        }).then(res => {
          let deviceUpdateConfig = res.valueJson ? JSON.parse(res.valueJson) : {}
          if (deviceUpdateConfig.config) {
            let configObj = JSON.parse(deviceUpdateConfig.config)
            if(configObj.updateType){
              this.updateType = configObj.updateType
              delete configObj.updateType
            }
            if(configObj.updateDisabled){
              this.updateDisabled = configObj.updateDisabled == 1
              delete configObj.updateDisabled
            }
            this.deviceUpdateConfig = configObj
          }
        })
      },

      /**
       * 弹窗确认
       */
      dialogConfirm(row = {}) {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if (this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 11:
            if (!params.deviceSns) {
              this.$message({
                message: '设备二维码不能为空',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            if (!params.domainUrl) {
              this.$message({
                message: '更新包地址不能为空',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            this.$post('iot-saas-device/admin/device/updateDeviceVersions', params).then(res => {
              this.$message({
                message: this.$t('public.operationSuccessful'),
                type: 'success'
              })
              this.drawerStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      },

      /**
       * 设置二维码
       */
      deviceCode(sn, url) {
        let deviceCodeIds = this.deviceCodeIds || {}
        if (deviceCodeIds[sn]) return
        deviceCodeIds[sn] = sn
        this.$refs[`sn_${sn}`][0].innerHTML = ''
        this.$nextTick(() => {
          new QRCode(this.$refs[`sn_${sn}`][0], {
            width: 150,
            height: 150,
            text: url
          })
        })
      },

      /**
       * 选择槽口数
       */
      selSlot(val) {
        let dform = this.dform
        if (!dform.factoryCode) {
          this.$message({
            message: '请先选择工厂',
            type: 'error'
          })
          return
        }
        let key = `${dform.factoryCode}_${val}_${dform.updateType}`,
          obj = JSON.parse(JSON.stringify(this.dform))
        if (this.deviceUpdateConfig[key]) {
          obj = Object.assign({}, this.dform, this.deviceUpdateConfig[key])
        } else {
          let keys = ['domainUrl', 'path', 'md5', 'size', 'deviceVersion', 'fileVersion']
          for (var i in keys) {
            if (obj[keys[i]]) {
              delete obj[keys[i]]
            }
          }
        }
        this.dform = obj
      },

      /**
       * 选择更新类型
       */
      selUpdateType(val) {
        let dform = this.dform
        if (!this.dform.factoryCode) {
          this.$message({
            message: '请先选择工厂',
            type: 'error'
          })
          return
        }
        let key = `${dform.factoryCode}_${dform.deviceSlot}_${val}`,
          obj = JSON.parse(JSON.stringify(this.dform))
        if (this.deviceUpdateConfig[key]) {
          obj = Object.assign({}, this.dform, this.deviceUpdateConfig[key])
        } else {
          let keys = ['domainUrl', 'path', 'md5', 'size', 'deviceVersion', 'fileVersion']
          for (var i in keys) {
            if (obj[keys[i]]) {
              delete obj[keys[i]]
            }
          }
        }
        this.dform = obj
      },
      
      /**
       * 设备解绑
       */
      unboundStore(row) {
        this.$post("iot-saas-device/admin/device/unbindStore", {
          deviceIds: [row.id],
        }).then((res) => {
          this.$message({
            message: this.$t("public.unbindSuccessful"),
            type: "success",
          });
          row.distribute = false;
          row.store = "";
        });
      },
    }
  }
</script>

<style>
  .dropdown.el-popper {
    margin-top: 0;
    min-width: 150px;
  }
</style>
<style lang="scss" scoped>
  .access-url {
    margin: 0 auto;
    width: 150px;
    height: 150px
  }

  .relation-label {
    width: 5em;
  }
</style>
