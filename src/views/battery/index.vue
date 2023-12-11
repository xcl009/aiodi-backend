<template>
  <div>
    <el-row :gutter="20" type="flex" class="flex-wrap mb-15 fs-s2 text-nowrap">
      <el-col :span="24" :md="5">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/total.svg')" width="54">
          <div class="flex1 ml-10">
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ listTotal || 0 }}</span>{{ $t('public.individual') }}</div>
            <div class="mt-5">{{ $t('battery.batteryCount') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="5">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/device.svg')" width="54">
          <div class="flex1 ml-10">
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.deviceStockLifeStatusCounts || 0 }}</span>{{ $t('public.individual') }}</div>
            <div class="mt-5">{{ $t('battery.theSlotBatteryCount') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="5">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/ok.svg')" width="54">
          <div class="flex1 ml-10">
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.deviceStockLifeLendingStatusCounts || 0 }}</span>{{ $t('public.individual') }}</div>
            <div class="mt-5">{{ $t('battery.underLeaseBatteryCount') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="5">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/wait.svg')" width="54">
          <div class="flex1 ml-10">
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.deviceStockLifePopupStatusCounts || 0 }}</span>{{ $t('public.individual') }}</div>
            <div class="mt-5">{{ $t('battery.popUpBatteryCount') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="5">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/wait.svg')" width="54">
          <div class="flex1 ml-10">
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.deviceStockLifeExceptionStatusCounts || 0 }}</span>{{ $t('public.individual') }}</div>
            <div class="mt-5">{{ $t('battery.abnormalBatteryCount') }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true" @saveXlsx="saveXlsx">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.deviceStatus') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}`" :name="''+item.value+''" v-for="item in orderTab" />
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
              <el-input :placeholder="`${$t('public.enter')}${queryObj[formKey[`sel${item}`]].title}`" v-model="form[formKey[`sel${item}`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel${item}`]]" :type="queryObj[formKey[`sel${item}`]].sType" :name="queryObj[formKey[`sel${item}`]].name" :placeholder="`${queryObj[formKey['sel'+item]].title}`" @change="toQuery()"
                :isStoreOrder="['storeId'].indexOf(formKey[`sel${item}`])> -1"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel'+item]].title}`" clearable @change="toQuery()">
                <el-option :label="item" :value="key" v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
        <!-- <el-form-item>
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd" start-placeholder="开始日期" end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item> -->
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(3, {}, 1)">{{ $t('public.createOrderText') }}</div>
        <table-column-set storageKey="leaseOrderTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" min-width="140" v-if="item.key == 'name'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <div :class="`role-label fs-s2 ` + (scope.row.createType == 1 ? 'agent' : '')">{{ scope.row.createType == 1 ?  $t('public.take')  : $t('public.discuss') }}</div>
                <div class="pl-5 flex1">{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="150" v-else-if="item.key == 'warningStatue'">
            <template slot-scope="scope">
              {{ scope.row.warningStatue == 1 ?  $t('public.earlyWarning') : $t('public.normal') }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="150" v-else-if="item.key == 'onlineStatue'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-button :type="onlineStatus[scope.row.onlineStatue] ? onlineStatus[scope.row.onlineStatue].type : ''" circle class="mr-5 btn-status_circle"></el-button>
                <span>{{ onlineStatus[scope.row.onlineStatue] ? onlineStatus[scope.row.onlineStatue].desc : '--' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="90" v-else-if="item.key == 'belongStatue'">
            <template slot-scope="scope">
              {{ scope.row.initAgentId != scope.row.currentAgentId ? $t('public.outflow') : '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="150" v-else-if="item.key.indexOf('Time') > -1">
            <template slot-scope="scope">
              {{ parseTime(scope.row[item.key]) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 110" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-popconfirm
                class="pop"
                cancel-button-type=""
                icon="el-icon-info"
                icon-color="#FF7D00"
                :title="$t('battery.toPopUp')"
                @onConfirm="singleEject(scope.row)"
              >
                <el-button type="text" :disabled="!scope.row.ext" slot="reference">{{ $t('public.eject') }}</el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end">
        <pagination
          v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>

    <el-drawer
      :title="dialogTitle[dialogType]"
      :visible.sync="drawerStatus"
      >
      <template v-if="dialogType == 1">

      </template>

      <template v-if="[1, 3].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
        </div>
      </template>
    </el-drawer>

    <xlsx ref="toXlsx" :fileName="$t('battery.cdbList')"></xlsx>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import TableColumnSet from '@/components/TableColumnSet/index'
  import xlsx from '@/components/xlsx/'
  import {
    arrayToObj
  } from '@/utils/index'

  export default {
    name: 'leaseOrder',
    components: {
      condition,
      selectSearch,
      TableColumnSet,
      Pagination,
      xlsx
    },
    computed: {
      myDeviceName(){
        let myDeviceName = this.$store.state.user.myDeviceName || { '充电宝': 'PA' }
        return myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId || {}
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      device() {
        return this.$store.state.app.device
      },
    },
    data() {
      return {
        clickSubmit: false,
        onlineStatus: [
          {
            type: 'primary',
            desc: this.$t('public.inTheSlot'),
          },
          {
            type: 'success',
            desc: this.$t('public.underLease'),
          },
          {
            type: 'warning',
            desc: this.$t('public.maintenancePopup'),
          },
          {
            type: 'warning',
            desc: this.$t('public.leasingPopup'),
          },
          {
            type: 'warning',
            desc: this.$t('public.inProgress'),
          },
          {
            type: 'danger',
            desc: this.$t('public.abnormalNotInSlot'),
          }
        ],
        orderTab: [
          {
            value: 0,
            title: this.$t('public.all'),
            nkey: 'orderNumber'
          },
          {
            value: 'warningStatue,1',
            title: this.$t('public.earlyWarning'),
            nkey: 'warningStatue'
          },
          {
            value: 'warningStatue,0',
            title: this.$t('public.unannouncedMaintenance'),
            nkey: 'todayNumber'
          },
          {
            value: 'onlineStatue,0',
            title: this.$t('public.currentlyInSlot'),
            nkey: 'doneNumber'
          },
          {
            value: 'onlineStatue,1',
            title: this.$t('public.underLease'),
            nkey: 'expiredNumber'
          },
          {
            value: 'onlineStatue,3',
            title: this.$t('public.leasingPopup'),
            nkey: 'expiredNumber'
          },
          {
            value: 'onlineStatue,2',
            title: this.$t('battery.popUpMaintenance'),
            nkey: 'rentFailedNumber'
          },
          {
            value: 'onlineStatue,5',
            title: this.$t('public.abnormalNotInSlot'),
            nkey: 'payFailedNumber'
          }
        ],
        queryObj: {
          terminalId: {
            title: this.$t('public.sn'),
            type: 'input'
          },
          terminalSn: {
            title: this.$t('public.code'),
            type: 'input'
          },
          // initStoreName: {
          //   title: '初始商户',
          //   type: 'input'
          // },
          // currentStoreName: {
          //   title: '当前商户',
          //   type: 'input'
          // },
          // initAgentName: {
          //   title: '初始代理',
          //   type: 'input'
          // },
          // currentAgentName: {
          //   title: '当前代理',
          //   type: 'input'
          // },
        },
        formKey: {
          sel1: 'terminalId',
          sel2: 'terminalSn'
        },
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20,
          status: 0
        },
        totalStat: {},
        pickerOptionsEnd: {
          disabledDate: (time) => {
            let timeOptionRange = this.timeOptionRange
            let secondNum = 60 * 60 * 24 * 31 * 1000
            if (timeOptionRange) {
              return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
                .getTime() - secondNum) || time.getTime() > Date.now()
            }
            return time.getTime() > Date.now() + 86400000
          },
          onPick: (time) => {
            //当第一时间选中才设置禁用
            if (time.minDate && !time.maxDate) {
              this.timeOptionRange = time.minDate
            }
            if (time.maxDate) {
              this.timeOptionRange = null
            }
          }
        },

        // 弹出相关
        dialogType: 1,
        drawerStatus: false,
        dialogTitle: {
          1: ''
        },
        curRow: {},
        curIdx: 0,
        dform: {},
        showRow: {},

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
        defaultColumn: [
          {
            key: 'terminalSn',
            val: true,
            name: this.$t('public.deviceCode'),
            width: 180,
          },
          {
            key: 'terminalId',
            val: true,
            name: this.$t('public.sn'),
            width: 150
          },

          {
            key: 'factoryName',
            val: true,
            name: this.$t('battery.factory')
          },
          // {
          //   key: 'deviceTypeCode',
          //   val: true,
          //   name: '特点'
          // },
          {
            key: 'lendCountTotal',
            val: true,
            name: this.$t('public.numberOfRentals')
          },
          {
            key: 'lendAmountTotal',
            val: true,
            name: this.$t('battery.accumulatedAmount')
          },
          {
            key: 'lendDurationTotal',
            val: true,
            name: this.$t('battery.usageDuration')
          },
          {
            key: 'lendDurationAvg',
            val: true,
            name: this.$t('battery.lendDurationAvg'),
            width: 130
          },
          {
            key: 'deviceDamageIndex',
            val: true,
            name: this.$t('battery.deviceDamageIndex')
          },
          {
            key: 'warningStatue',
            val: true,
            name: this.$t('battery.warningStatue')
          },
          {
            key: 'initAgentName',
            val: true,
            name: this.$t('battery.initAgentName'),
            width: 150
          },
          {
            key: 'currentAgentName',
            val: true,
            name: this.$t('battery.currentAgentName'),
            width: 150
          },
          {
            key: 'initStoreName',
            val: true,
            name: this.$t('battery.initStoreName'),
            width: 150
          },
          {
            key: 'currentStoreName',
            val: true,
            name: this.$t('battery.currentStoreName'),
            width: 150
          },
          {
            key: 'belongStatue',
            val: true,
            name: this.$t('battery.belongStatue')
          },
          {
            key: 'onlineStatue',
            val: true,
            name: this.$t('battery.status')
          },
          // {
          //   key: 'lastOverhaulId',
          //   val: true,
          //   name: '最近检修人',
          //   width: 200
          // },
          {
            key: 'lastOverhaulTime',
            val: true,
            name: this.$t('battery.lastOverhaulTime')
          }
        ]
      }
    },
    mounted(options) {
      this.toQuery()
      this.getStat()
    },
    methods: {
      /**
       * 获取可提现金额
       */
      getStat(){
        this.$get('iot-saas-device/admin/device/stock/countsByBrandId', {
          brandId: this.agentInfo.brandId
        }).then(res => {
          this.totalStat = res || {}
        })
      },

      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
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
          page: this.listQuery.page - 1
        })
        if (params.date && params.date.length > 0) {
          params.startTime = params.date[0] + ' 00:00:00'
          params.endTime = params.date[1] + ' 23:59:59'
          delete params.date
        }
        if (params.status <= 0){
          delete params.status
        }else{
          let status = params.status.split(',')
          params[status[0]] = status[1]
          delete params.status
        }
        for(var i in params){
          if(i.indexOf('deductionId') > -1 && params[i]){
            let v = params[i]
            delete params[i]
            params.deductionId = v
          }
        }
        this.$get('iot-saas-device/admin/device/stock/findPage', params).then(async (res = {}) => {
          let list = res.rows || []
          if(list.length > 0){
            let ids = this.arrayKeys(list, 'terminalId')
            await this.getOtherData('iot-saas-device/admin/device/stocks/ext/findPage', {
							devicePowerIds: ids.join(','),
						}).then(extRes => {
              if(extRes && extRes.rows.length > 0){
              	let extObj = arrayToObj(extRes.rows, 'terminalId')
              	list.map(item => {
              		return item.ext = extObj[item.terminalId] ? extObj[item.terminalId] : ''
              	})
              }
            })
          }
          this.list = list
          if (this.outStatus) {
            let end = false
            if (params.size > this.list.length) end = true
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size),  () => {
                if(end){
                  this.outStatus = false
                  this.toQuery()
                }else{
                  this.listQuery.page += 1
                  this.getList()
                }
              })
            })
          }else{
            this.listLoading = false
            this.clickSubmit = false
            if(params.page == 0){
              this.listTotal = res.total
              this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
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
        this.getList()
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型  2  3 drawer类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 3:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.drawerStatus = true
            this.dform = {}
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
        if (this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:

          break
        }
      },

      /**
       * 单弹
       */
      singleEject(row){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.$get('iot-saas-device/admin/device/singlePopup', {
          deviceSn: row.terminalSn,
          slot: row.ext.slot
        }).then((res = {}) => {
          this.$message({
            message: this.$t('public.commandSent'),
            type: 'success'
          })
          row.ext = ''
          this.clickSubmit = false
        }).catch(() => {
          this.clickSubmit = false
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  @media only screen and (min-width: 992px){
    /deep/ .el-col-md-5{
      width: 20%;
    }
  }
</style>
