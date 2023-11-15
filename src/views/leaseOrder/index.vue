<template>
  <div>
    <el-row :gutter="20" type="flex" class="flex-wrap mb-15 fs-s2 text-nowrap">
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/total.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">总租赁订单数</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.orderNumber || 0 }}</span>笔</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/device.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">总租赁设备数</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.deviceNumber || 0.00 }}</span>台</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/ok.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">已扣金额</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.payAmount || 0.00 }}</span>元</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/wait.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">待扣金额</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.residueAmount || 0.00 }}</span>元</div>
          </div>
        </div>
      </el-col>
    </el-row>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">设备类型</div>
          <el-tabs class="flex1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane label="全部设备" :name="''" />
            <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">订单状态</div>
          <el-tabs class="flex1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title }(${orderStat[item.value] || 0})`" :name="''+item.value+''"
              v-for="item in orderTabs" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 1">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" placeholder="请选择">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key" v-if="checkQueryRepeat(key, item, formKey)"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
              <el-input :placeholder="`请输入${queryObj[formKey[`sel${item}`]].title}`"
                v-model="form[formKey[`sel${item}`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel${item}`]]" :type="queryObj[formKey[`sel${item}`]].sType"
                :name="queryObj[formKey[`sel${item}`]].name" :placeholder="`${queryObj[formKey['sel'+item]].title}`"
                @change="toQuery()" :isStoreOrder="['storeId'].indexOf(formKey[`sel${item}`])> -1"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel'+item]].title}`"
                clearable @change="toQuery()">
                <el-option :label="item" :value="key"
                  v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptionsEnd"
            @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">查询表格</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(3, {}, 1)">创建订单</div>
        <table-column-set storageKey="leaseOrderTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" id="table_box" ref="table_box" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" min-width="140" v-if="item.key == 'name'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <div :class="`role-label fs-s2 ` + (scope.row.createType == 1 ? 'agent' : '')">
                  {{ scope.row.createType == 1 ? '代' : '商' }}</div>
                <div class="pl-5 flex1">{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="150" v-else-if="item.key == 'mobile'">
            <template slot-scope="scope">
              {{ scope.row.mobile }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="90" v-else-if="item.key == 'deviceTypeCode'">
            <template slot-scope="scope">
              {{ myDeviceId[scope.row.deviceTypeCode] }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 120" v-else-if="item.key.indexOf('Time') > -1">
            <template slot-scope="scope">
              {{ parseTime(scope.row[item.key]) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 120" v-else></el-table-column>
        </template>
        <el-table-column label="操作" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(3, scope.row, 2)">详情</el-button>
              <el-button type="text" @click="setRows(3, scope.row, 3)"
                :disabled="[2, 9].indexOf(scope.row.status) > -1">编辑</el-button>
              <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                title="确定取消该订单吗？取消后不可恢复" @onConfirm="closeOrder(scope.row)">
                <el-button type="text" :disabled="[2, 9].indexOf(scope.row.status) > -1" slot="reference"><span
                    :class="{'text-danger': [2, 9].indexOf(scope.row.status) == -1}">取消</span></el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 4">
        <div class="text-center">
          <div class="text-black">确定取消此订单吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger">注：取消后不可恢复。</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
      <template v-if="dialogType == 1 || dialogType == 3">
        <el-form class="custom-form" ref="form" :rules="rules" :model="dform" :hide-required-asterisk="true">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">
              租赁对象
            </div>
            <div class="flex" v-if="!curRow.id">
              <el-select class="max-select l-r" v-model="dform.createType">
                <el-option label="代理商手机号" :value="1"></el-option>
                <el-option label="商户手机号" :value="0"></el-option>
              </el-select>
              <selectSearch :type="dform.createType == 1 ? 5 : 3" :emitRow="true" name="mobile"
                :placeholder="dform.createType == 1 ? '请输入代理商手机号' : '请输入商户手机号'" @change="getSearchRow"></selectSearch>
            </div>

            <template v-if="showRow.id || curRow.id">
              <div class="flex mt-15 pb-20 l-b">
                <div>
                  <div class="flex mb-10">
                    <div class="label-text">租赁人:</div>
                    <div>{{ showRow.name || curRow.name }}</div>
                  </div>
                  <div class="flex">
                    <div class="label-text">租赁人身份:</div>
                    <div>{{ dform.createType == 1 ? '代理商' : '商户' }}</div>
                  </div>
                </div>
                <div class="ml-20">
                  <div class="flex mb-10">
                    <div class="label-text">手机号:</div>
                    <div>{{ showRow.mobile || curRow.mobile }}</div>
                  </div>
                </div>
              </div>
            </template>

            <div class="mt-20 mb-15">
              设备类型
            </div>
            <div class="pb-20 l-b">
              <el-radio-group v-model="dform.deviceTypeCode" :disabled="curRow.id ? true: false">
                <el-radio :label="item" v-for="(item, index) in myDeviceName">{{ index }}</el-radio>
              </el-radio-group>
            </div>

            <div class="mt-20 mb-15">
              基础信息
            </div>
            <el-form-item label="设备数量" :error="ferror.deviceNum">
              <el-input type="number" v-model="dform.deviceNum" placeholder="输入设备数量"
              @input="(v) => (ferror.deviceNum = checkDigit(v, 1, 999999, 0))"/>
            </el-form-item>
            <el-form-item label="总金额" :error="ferror.amountTotal">
              <el-input type="number" v-model="dform.amountTotal" placeholder="请输入总金额"
                @input="(v) => (ferror.amountTotal = checkDigit(v, 1, 9999999))">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="周期扣款" :error="ferror.deductionAmount">
              <el-input type="number" v-model="dform.deductionAmount" placeholder="请输入扣款金额"
              @input="(v) => (ferror.deductionAmount = checkDigit(v, 0.1, 9999))">
                <el-select v-model="dform.deductionCycle" slot="prepend">
                  <el-option label="每天" :value="1"></el-option>
                  <el-option label="每周" :value="7"></el-option>
                  <el-option label="每月" :value="30"></el-option>
                </el-select>
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="扣款开始时间">
              <el-date-picker v-model="dform.deductionTimeStr" type="date" format="yyyy-MM-dd" value-format="timestamp"
                placeholder="选择日期" :disabled="curRow.id ? true: false" :picker-options="deductionTimeStart">
              </el-date-picker>
            </el-form-item>
          </div>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="pl-20 pr-20 text-black">
          <div class="mb-15">
            租赁单号：{{ curRow.orderNo }}
            <el-tag class="ml-10" :type="(orderTab[curRow.status] ? orderTab[curRow.status].type : '')" size="mini"
              effect="dark">
              {{ orderTab[curRow.status] ? orderTab[curRow.status].title : '' }}
            </el-tag>
          </div>
          <div class="flex align-center pb-10 l-b-dashed">
            <div class="">
              <div class="flex mb-10">
                <div class="label-text">租赁人:</div>
                <div>{{ curRow.name }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">设备类型:</div>
                <div>{{ myDeviceId[curRow.deviceTypeCode] }}</div>
              </div>
              <div class="flex">
                <div class="label-text">租赁创建时间:</div>
                <div>{{ parseTime(curRow.createTime, '{y}-{m}-{d}') }}</div>
              </div>
            </div>
            <div class="ml-20">
              <div class="flex mb-10">
                <div class="label-text">联系方式:</div>
                <div>{{ curRow.mobile || '--' }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">设备数量:</div>
                <div>{{ curRow.deviceNum }}</div>
              </div>
              <div class="flex">
                <div class="label-text">扣款开始时间:</div>
                <div>{{ parseTime(curRow.deductionTime, '{y}-{m}-{d}') }}</div>
              </div>
            </div>
            <div class="ml-20">
              <div class="flex mb-10">
                <div class="label-text">租赁人身份:</div>
                <div>{{ queryObj.createType.selectArr[curRow.createType] }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">扣款周期:</div>
                <div>{{ curRow.deductionAmount }}元/{{ curRow.deductionCycle == 1 ? '' : curRow.deductionCycle }}天</div>
              </div>
              <div class="flex">
                <div class="label-text">预计完成时间:</div>
                <div>{{ parseTime(curRow.closeTime, '{y}-{m}-{d}') }}</div>
              </div>
            </div>
          </div>

          <div class="mt-20 mb-15">
            扣款信息
          </div>
          <el-row :gutter="20" type="flex" class="flex-wrap mb-15 fs-s2 text-nowrap">
            <el-col :span="24" :md="8">
              <div class="flex align-start p-15 pay-i radius-5">
                <img :src="require('@/assets/lease/info_amout.svg')" width="32">
                <div class="pl-10 flex-1">
                  <div>应扣款总金额</div>
                  <div class="mt-5"><span class="fs-b2 text-bold">{{ curRow.amountTotal }}</span><span
                      class="fs-s2 text-gray"> 元</span></div>
                </div>
              </div>
            </el-col>
            <el-col :span="24" :md="8">
              <div class="flex align-start p-15 pay-i radius-5">
                <img :src="require('@/assets/lease/info_time.svg')" width="32">
                <div class="pl-10 flex-1">
                  <div>剩余未扣金额</div>
                  <div class="mt-5"><span
                      class="fs-b2 text-bold">{{ accSub(curRow.amountTotal, curRow.payAmount) }}</span><span
                      class="fs-s2 text-gray"> 元</span></div>
                </div>
              </div>
            </el-col>
            <el-col :span="24" :md="8">
              <div class="flex align-start p-15 pay-i radius-5">
                <img :src="require('@/assets/lease/info_wait.svg')" width="32">
                <div class="pl-10 flex-1">
                  <div>距离下次扣款</div>
                  <div class="mt-5" v-if="[2, 9].indexOf(curRow.status) == -1">
                    <span
                      class="fs-b2 text-bold">{{ formatSeconds(accSub(unixTime(curRow.nextDeductionTime), currentTime()), 'd-h') || '1天内' }}</span>
                  </div>
                  <div class="mt-5" v-else><span class="fs-b2 text-bold">{{ curRow.status == 9 ? '已取消' : '已完成' }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-table class="custom" :data="dform.list" :summary-method="getSummaries" show-summary>
            <el-table-column label="扣款时间">
              <template slot-scope="scope">
                {{ parseTime(scope.row.tradeTime, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column label="扣款方式">
              <template slot-scope="scope">
                余额
              </template>
            </el-table-column>
            <el-table-column label="扣款金额(元)">
              <template slot-scope="scope">
                {{ Math.abs(scope.row.amount) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="flex justify-end" v-if="dform.listTotal > 0">
            <pagination :page.sync="dform.page" :limit.sync="dform.size" :total="parseInt(dform.listTotal)"
              layout="total,prev,pager,next" @pagination="getTradeLog" />
          </div>
        </div>
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
    accSub,
    formatSeconds,
    unixTime,
    arrayToObj
  } from '@/utils/index'

  const orderStatus = [{
      value: '-1',
      title: '全部',
      nkey: 'orderNumber'
    },
    {
      value: '0',
      title: '未开始',
      nkey: 'noNumber',
      type: 'warning'
    },
    {
      value: '1',
      title: '进行中',
      nkey: 'rentingNumber',
      type: 'danger'
    },
    {
      value: '2',
      title: '已完成',
      nkey: 'okNumber',
      type: 'success'
    },
    {
      value: '9',
      title: '已取消',
      nkey: 'doneNumber',
      type: 'info'
    }
  ]
  export default {
    name: 'leaseOrder',
    components: {
      condition,
      selectSearch,
      TableColumnSet,
      Pagination
    },
    computed: {
      myDeviceName() {
        let myDeviceName = this.$store.state.user.myDeviceName || {
          '充电宝': 'PA'
        }
        //this.listQuery.deviceTypeCode = Object.values(myDeviceName)[0]
        return myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId || {}
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      device() {
        return this.$store.state.app.device
      },
    },
    data() {
      return {
        formatSeconds: formatSeconds,
        unixTime: unixTime,
        accSub: accSub,
        clickSubmit: false,
        queryObj: {
          orderNo: {
            title: '订单号',
            type: 'input'
          },
          deductionId1: {
            title: '代理名称',
            type: 'selectSearch',
            name: 'name',
            sType: 5
          },
          deductionId: {
            title: '代理手机号码',
            type: 'selectSearch',
            name: 'mobile',
            sType: 5
          },
          deductionId3: {
            title: '商户名称',
            type: 'selectSearch',
            name: 'name',
            sType: 3
          },
          deductionId2: {
            title: '商户手机号码',
            type: 'selectSearch',
            name: 'mobile',
            sType: 3
          },
          createType: {
            title: '租赁角色',
            type: 'select',
            selectArr: {
              0: '商户',
              1: '代理'
            }
          }
        },
        formKey: {
          sel1: 'orderNo',
          sel2: 'storeId'
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
        orderTabs: orderStatus,
        orderTab: arrayToObj(orderStatus, 'value'),
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
        deductionTimeStart: {
          disabledDate: (time) => {
            return time.getTime() < Date.now()
          }
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        drawerStatus: false,
        dialogTitle: {
          1: '创建租赁订单',
          2: '租赁订单详情',
          3: '编辑租赁订单',
          4: '取消租赁订单'
        },
        curRow: {},
        curIdx: 0,
        dform: {},
        ferror: {},
        showRow: {},

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
        defaultColumn: [{
            key: 'name',
            val: true,
            name: '租赁人'
          },
          {
            key: 'mobile',
            val: true,
            name: '手机号码'
          },
          {
            key: 'orderNo',
            val: true,
            name: '订单号',
            width: 260
          },
          {
            key: 'deviceTypeCode',
            val: true,
            name: '设备类型'
          },
          {
            key: 'deviceNum',
            val: true,
            name: '设备数量'
          },
          {
            key: 'amountTotal',
            val: true,
            name: '总扣款金额(元)'
          },
          {
            key: 'payAmount',
            val: true,
            name: '已扣款金额(元)'
          },
          {
            key: 'deductionCycle',
            val: true,
            name: '扣款周期(天)'
          },
          {
            key: 'statusStr',
            val: true,
            name: '状态'
          },
          {
            key: 'deductionTime',
            val: false,
            name: '扣款开始',
            width: 170
          },
          {
            key: 'closeTime',
            val: false,
            name: '预计完成',
            width: 170
          },
          {
            key: 'createTime',
            val: false,
            name: '创建时间',
            width: 170
          }
        ],

        /**
         * 添加修改校验条件
         */
        rules: {
          deviceTypeCode: [{
            required: true,
            message: '请选择设备类型',
            trigger: 'change'
          }],
          amountTotal: [{
            required: true,
            message: '请输入订单总金额',
            trigger: 'blur'
          },
          {
            pattern: /(^[0-9]{1,6}$)|(^[0-9]{1,6}[\.]{1}[0-9]{1,2}$)/,
            message: '范围在1-999999',
            trigger: 'blur'
          }],
          deviceNum: [{
              required: true,
              message: '请填写设备数量',
              trigger: 'blur'
            },
            {
              pattern: /(^[0-9]{1,6}$)|(^[0-9]{1,6}[\.]{1}[0-9]{1,2}$)/,
              message: '范围在1-999999',
              trigger: 'blur'
          }],
          deductionAmount: [{
            required: true,
            message: '请填写周期扣款金额',
            trigger: 'blur'
          },
          {
            pattern: /(^[0-9]{1,4}$)|(^[0-9]{1,4}[\.]{1}[0-9]{1,2}$)/,
            message: '范围在1-9999',
            trigger: 'blur'
          }]
        }
      }
    },
    mounted(options) {
      this.getTotalStat()
      this.toQuery()
    },
    methods: {
      /**
       * 获取统计
       */
      getTotalStat() {
        this.$get(`iot-saas-order/admin/order/device/rent/statistics/all/${this.agentInfo.brandId}`).then(res => {
          this.totalStat = res || {}
        })
      },

      /**
       * 获取订单数统计
       */
      getOrderStat() {
        let params = {}
        if (this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
        this.$get(`iot-saas-order/admin/order/device/rent/statistics/order`, params).then(res => {
          let orderStat = arrayToObj(res, 'status', 'orderNumber')
          orderStat['-1'] = 0
          res.map(item => {
            orderStat['-1'] += parseInt(item.orderNumber)
          })
          this.orderStat = orderStat
        })
      },

      /**
       * 搜索查询
       */
      toQuery() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getOrderStat()
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取其他信息
       */
      getOtherData(url, params) {
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
        for (var i in params) {
          if (i.indexOf('deductionId') > -1 && params[i]) {
            let v = params[i]
            delete params[i]
            params.deductionId = v
          }
        }
        this.$get('iot-saas-order/admin/order/device/rent/findPage', params).then(async (res = {}) => {
          this.listLoading = false
          this.clickSubmit = false
          let list = res.rows || []
          if (list.length > 0) {
            let storeIds = [],
              agentIds = []
            list.map(item => {
              if (item.createType == 0 && storeIds.indexOf(item.deductionId) == -1) {
                storeIds.push(item.deductionId)
              } else if (item.createType == 1 && agentIds.indexOf(item.deductionId) == -1) {
                agentIds.push(item.deductionId)
              }
            })
            if (storeIds.length > 0) {
              await this.getOtherData('iot-saas-order/admin/order/device/rent/getDeductions', {
                deductionType: 0,
                deductionIds: storeIds
              }).then(ares => {
                let storeObj = arrayToObj(ares, 'id')
                list.map(item => {
                  if (item.createType == 0 && storeObj[item.deductionId]) {
                    delete storeObj[item.deductionId]['id']
                    return item = Object.assign(item, storeObj[item.deductionId])
                  }
                })
              })
            }
            if (agentIds.length > 0) {
              await this.getOtherData('iot-saas-order/admin/order/device/rent/getDeductions', {
                deductionType: 1,
                deductionIds: agentIds
              }).then(ares => {
                let agentObj = arrayToObj(ares, 'id')
                list.map(item => {
                  if (item.createType == 1 && agentObj[item.deductionId]) {
                    delete agentObj[item.deductionId]['id']
                    return item = Object.assign(item, agentObj[item.deductionId])
                  }
                })
              })
            }
          }
          this.list = list
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 65
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型 2  3 drawer类型
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
            break
          case 3:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.drawerStatus = true
            if (dialogType == 1) {
              if (!this.dform.createType) {
                this.dform = {
                  marketCode: 'DEVICE_LEASE',
                  createType: 1,
                  deductionCycle: 1,
                  deviceTypeCode: Object.values(this.myDeviceName)[0]
                }
              }
            } else {
              this.dform = {}
              if (dialogType == 2 && row.payAmount > 0) {
                this.dform = {
                  page: 1,
                  size: 20,
                }
                this.getTradeLog()
              } else if (dialogType == 3) {
                this.dform = {
                  createType: row.createType,
                  deviceTypeCode: row.deviceTypeCode,
                  deviceNum: row.deviceNum,
                  amountTotal: row.amountTotal,
                  deductionAmount: row.deductionAmount,
                  deductionCycle: row.deductionCycle,
                  deductionTimeStr: unixTime(row.deductionTime) * 1000
                }
              }
            }
            break
        }
      },

      /**
       * 获取扣款记录
       */
      getTradeLog() {
        let params = JSON.parse(JSON.stringify(this.dform))
        this.$get('iot-saas-pay/api/pay/tradeLog/page', {
          page: params.page - 1,
          size: params.size,
          operatorId: this.curRow.id
        }).then(res => {
          this.$set(this.dform, 'list', res.rows)
          this.$set(this.dform, 'listTotal', res.total)
        })
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        let error = false
        for(var i in this.ferror){
          if(this.ferror[i]){
            error = true
            break
          }
        }
        if(error) return
        if (this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
          case 3:
            let url = 'iot-saas-order/admin/order/device/rent/save'
            if (curRow.id) {
              url = `iot-saas-order/admin/order/device/rent/update/${curRow.id}`
            }
            if (!params.deductionId && !curRow.id) {
              this.$message({
                message: '请先查找租赁对象',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            if (params.deductionTimeStr) params.deductionTimeStr = this.parseTime(params.deductionTimeStr / 1000,
              '{y}-{m}-{d} {h}:{i}:{s}')
            this.$refs['form'].validate((valid) => {
              if (valid) {
                this.$post(url, params).then(res => {
                  this.$message({
                    message: '操作成功',
                    type: 'success'
                  })
                  this.clickSubmit = false
                  this.toQuery()
                  this.drawerStatus = false
                }).catch(err => {
                  this.clickSubmit = false
                })
              } else {
                this.clickSubmit = false
              }
            })
            break
        }
      },

      /**
       * 取消订单
       */
      closeOrder(row) {
        this.$post(`iot-saas-order/admin/order/device/rent/close/${row.id}`).then(res => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          row.status = 9
          row.statusStr = '已取消'
        })
      },

      /**
       * 搜索数据显示
       */
      getSearchRow(row) {
        this.showRow = row
        this.dform.deductionId = row.id
      },

      /**
       * 合计
       */
      getSummaries(param) {
        const {
          columns,
          data
        } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '已扣金额合计(元)';
            return;
          }
          if (index == columns.length - 1) {
            sums[index] = this.curRow.payAmount
          }
        })
        return sums
      }
    }
  }
</script>

<style lang="scss" scoped>
  .pay-i {
    border: 1px solid #E5E6EB;
  }

  .role-label {
    padding: 0 4px;
    border-radius: 2px;
    background: #E8FFFB;
    color: #0FC6C2;

    &.agent {
      background: #FFF3E8;
      color: #F77234;
    }
  }

  .max-select.l-r {
    border-right: solid #E5E6EB 1px;
  }
</style>
