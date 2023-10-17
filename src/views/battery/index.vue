<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item v-for="item in 1">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" placeholder="请选择">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key" v-if="checkQueryRepeat(key, item, formKey)"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
              <el-input :placeholder="`请输入${queryObj[formKey.sel1].title}`" v-model="form[formKey[`sel${item}`]]"></el-input>
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
        <div class="flex1 fs-c1 text-black">查询表格</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(3, {}, 1)">创建订单</div>
        <table-column-set storageKey="leaseOrderTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" min-width="140" v-if="item.key == 'name'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <div :class="`role-label fs-s2 ` + (scope.row.createType == 1 ? 'agent' : '')">{{ scope.row.createType == 1 ? '代' : '商' }}</div>
                <div class="pl-5 flex1">{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="150" v-else-if="item.key == 'warningStatue'">
            <template slot-scope="scope">
              {{ scope.row.warningStatue == 1 ? '预警' : '正常' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="90" v-else-if="item.key == 'onlineStatue'">
            <template slot-scope="scope">
              {{ scope.row.ext ? '在槽' : '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="90" v-else-if="item.key == 'belongStatue'">
            <template slot-scope="scope">
              {{ scope.row.initAgentId != scope.row.currentAgentId ? '流出' : '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="150" v-else-if="item.key.indexOf('Time') > -1">
            <template slot-scope="scope">
              {{ parseTime(scope.row[item.key]) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 110" v-else></el-table-column>
        </template>
        <el-table-column label="操作" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-popconfirm
                class="pop"
                cancel-button-type=""
                icon="el-icon-info"
                icon-color="#FF7D00"
                title="确定弹出该充电宝吗？"
                @onConfirm="singleEject(scope.row)"
              >
                <el-button type="text" :disabled="!scope.row.ext" slot="reference">弹出</el-button>
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
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import TableColumnSet from '@/components/TableColumnSet/index'
  import {
    arrayToObj
  } from '@/utils/index'

  export default {
    name: 'leaseOrder',
    components: {
      condition,
      selectSearch,
      TableColumnSet,
      Pagination
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
        queryObj: {
          terminalId: {
            title: '宝SN',
            type: 'input'
          },
          terminalSn: {
            title: '二维码',
            type: 'input'
          },
          /* initAgentName: {
            title: '初始代理名称',
            type: 'input'
          },
          initStoreName: {
            title: '初始商户名称',
            type: 'input'
          },
          onlineStatue: {
            title: '状态',
            type: 'select',
            selectArr: {0: '在槽', 1: '不在槽'}
          } */
        },
        formKey: {
          sel1: 'terminalId',
          //sel2: 'terminalSn'
        },
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20,
          status: '-1'
        },
        totalStat: {},
        orderStat: {},
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
            name: '设备二维码',
            width: 180,
          },
          {
            key: 'terminalId',
            val: true,
            name: '宝SN',
            width: 150
          },
          {
            key: 'onlineStatue',
            val: true,
            name: '状态'
          },
          {
            key: 'factoryName',
            val: true,
            name: '所属工厂'
          },
          // {
          //   key: 'deviceTypeCode',
          //   val: true,
          //   name: '特点'
          // },
          {
            key: 'lendCountTotal',
            val: true,
            name: '租借次数'
          },
          {
            key: 'lendAmountTotal',
            val: true,
            name: '累计金额'
          },
          {
            key: 'lendDurationTotal',
            val: true,
            name: '使用时长'
          },
          {
            key: 'lendDurationAvg',
            val: true,
            name: '近10次使用时长',
            width: 130
          },
          {
            key: 'deviceDamageIndex',
            val: true,
            name: '损坏指数'
          },
          {
            key: 'warningStatue',
            val: true,
            name: '预警状态'
          },
          {
            key: 'initAgentName',
            val: true,
            name: '初始代理',
            width: 200
          },
          {
            key: 'currentAgentName',
            val: true,
            name: '当前代理',
            width: 200
          },
          {
            key: 'initStoreName',
            val: true,
            name: '初始商户',
            width: 200
          },
          {
            key: 'currentStoreName',
            val: true,
            name: '当前商户',
            width: 200
          },
          {
            key: 'belongStatue',
            val: true,
            name: '归属状态'
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
            name: '最近检修时间'
          }
        ]
      }
    },
    mounted(options) {
      this.toQuery()
    },
    methods: {
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
        if (params.status < 0) delete params.status
        if (params.deviceTypeCode == 0) delete params.deviceTypeCode
        for(var i in params){
          if(i.indexOf('deductionId') > -1 && params[i]){
            let v = params[i]
            delete params[i]
            params.deductionId = v
          }
        }
        this.$get('iot-saas-device/admin/device/stock/findPage', params).then(async (res = {}) => {
          this.listLoading = false
          this.clickSubmit = false
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
          if(params.page == 0){
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 60
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
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
            message: '指令已发送',
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

</style>
