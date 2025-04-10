<template>
  <div>
    <el-row :gutter="20" type="flex" class="flex-wrap mb-15 fs-s2 text-nowrap">
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/total.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">{{ $t('leaseOrder.orderNumber') }}</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.orderNumber || 0 }}</span>{{ $t('public.pen')
            }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/device.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">{{ $t('leaseOrder.deviceNumber') }}</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.deviceNumber || 0.00 }}</span>{{
              $t('public.tower') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/ok.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">{{ $t('leaseOrder.payAmount') }}</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.payAmount || 0.00 }}</span></div>
          </div>
        </div>
      </el-col>
      <el-col :span="24" :md="6">
        <div class="flex align-center pl-15 pr-15 pt-10 pb-10 bg-white radius-5">
          <img :src="require('@/assets/lease/wait.svg')" width="54">
          <div class="flex1 ml-10">
            <div class="mb-5">{{ $t('leaseOrder.residueAmount') }}</div>
            <div><span class="mr-5 fs-b3 text-bold text-black">{{ totalStat.residueAmount || 0.00 }}</span></div>
          </div>
        </div>
      </el-col>
    </el-row>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" :name="''" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.orderType') }}</div>
          <el-tabs class="flex1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}(${orderStat[item.value] || 0})`" :name="'' + item.value + ''"
              v-for="item in orderTabs" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 1">
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
                @change="toQuery()" :isStoreOrder="['storeId'].indexOf(formKey[`sel${item}`]) > -1"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel' + item]].title}`"
                clearable @change="toQuery()">
                <el-option :label="item" :value="key" v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd" :start-placeholder="$t('public.statrtDate')" :end-placeholder="$t('public.endDate')"
            :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(3, {}, 1)">{{ $t('public.createOrderText') }}</div>
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
                  {{ scope.row.createType == 1 ? $t('public.take') : $t('public.discuss') }}</div>
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
        <el-table-column :label="$t('public.operate')" width="165" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(3, scope.row, 2)">{{ $t('public.particulars') }}</el-button>
              <el-button type="text" @click="setRows(3, scope.row, 3)"
                :disabled="[2, 9].indexOf(scope.row.status) > -1">{{ $t('public.edit') }}</el-button>
              <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('leaseOrder.text')" @onConfirm="closeOrder(scope.row)">
                <el-button type="text" :disabled="[2, 9].indexOf(scope.row.status) > -1" slot="reference"><span
                    :class="{ 'text-danger': [2, 9].indexOf(scope.row.status) == -1 }">{{ $t('public.cancel')
                    }}</span></el-button>
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
          <div class="text-black">{{ $t('leaseOrder.text1') }}</div>
          <div class="mt-10 pl-40 pr-40 text-danger">{{ $t('leaseOrder.text2') }}</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
      <template v-if="dialogType == 1 || dialogType == 3">
        <el-form class="custom-form" ref="form" :rules="rules" :model="dform" :hide-required-asterisk="true">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">
              {{ $t('leaseOrder.leasedObject') }}
            </div>
            <div class="flex" v-if="!curRow.id">
              <el-select class="max-select l-r" v-model="dform.createType">
                <el-option :label="$t('leaseOrder.agentPhone')" :value="1"></el-option>
                <el-option :label="$t('leaseOrder.storePhone')" :value="0"></el-option>
              </el-select>
              <selectSearch :type="dform.createType == 1 ? 5 : 3" :emitRow="true" name="mobile"
                :placeholder="dform.createType == 1 ? $t('leaseOrder.inputText1') : $t('leaseOrder.inputText2')"
                @change="getSearchRow"></selectSearch>
            </div>

            <template v-if="showRow.id || curRow.id">
              <div class="flex mt-15 pb-20 l-b">
                <div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('leaseOrder.tenant') }}:</div>
                    <div>{{ showRow.name || curRow.name }}</div>
                  </div>
                  <div class="flex">
                    <div class="label-text">{{ $t('leaseOrder.tenantIdentity') }}:</div>
                    <div>{{ dform.createType == 1 ? $t('public.agentText') : $t('public.store') }}</div>
                  </div>
                </div>
                <div class="ml-20">
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.phone') }}:</div>
                    <div>{{ showRow.mobile || curRow.mobile }}</div>
                  </div>
                </div>
              </div>
            </template>

            <div class="mt-20 mb-15">
              {{ $t('public.deviceType') }}
            </div>
            <div class="pb-20 l-b">
              <el-radio-group v-model="dform.deviceTypeCode" :disabled="curRow.id ? true : false">
                <el-radio :label="item" v-for="(item, index) in myDeviceName">{{ index }}</el-radio>
              </el-radio-group>
            </div>

            <div class="mt-20 mb-15">
              {{ $t('public.basicInformation') }}
            </div>
            <el-form-item :label="$t('leaseOrder.deviceNum')" :error="ferror.deviceNum">
              <el-input type="number" v-model="dform.deviceNum" :placeholder="$t('leaseOrder.deviceNumText')"
                @input="(v) => (ferror.deviceNum = checkDigit(v, 1, 999999, 0))" />
            </el-form-item>
            <el-form-item :label="$t('public.totalAmount')" :error="ferror.amountTotal">
              <el-input type="number" v-model="dform.amountTotal" :placeholder="$t('leaseOrder.totalAmount')"
                @input="(v) => (ferror.amountTotal = checkDigit(v, 1, 9999999))">
                <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol}}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('leaseOrder.periodicDeductions')" :error="ferror.deductionAmount">
              <el-input type="number" v-model="dform.deductionAmount" :placeholder="$t('leaseOrder.inputText3')"
                @input="(v) => (ferror.deductionAmount = checkDigit(v, 0.1, 9999))">
                <el-select v-model="dform.deductionCycle" slot="prepend">
                  <el-option :label="$t('public.everyDay')" :value="1"></el-option>
                  <el-option :label="$t('public.weekly')" :value="7"></el-option>
                  <el-option :label="$t('public.monthly')" :value="30"></el-option>
                </el-select>
                <template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('leaseOrder.kkStartTime')">
              <el-date-picker v-model="dform.deductionTimeStr" type="date" format="yyyy-MM-dd" value-format="timestamp"
                :placeholder="$t('leaseOrder.selectDate')" :disabled="curRow.id ? true : false"
                :picker-options="deductionTimeStart">
              </el-date-picker>
            </el-form-item>
          </div>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="pl-20 pr-20 text-black">
          <div class="mb-15">
            {{ $t('leaseOrder.orderNo') }}：{{ curRow.orderNo }}
            <el-tag class="ml-10" :type="(orderTab[curRow.status] ? orderTab[curRow.status].type : '')" size="mini"
              effect="dark">
              {{ orderTab[curRow.status] ? orderTab[curRow.status].title : '' }}
            </el-tag>
          </div>
          <div class="flex align-center pb-10 l-b-dashed">
            <div class="">
              <div class="flex mb-10">
                <div class="label-text">{{ $t('leaseOrder.tenant') }}:</div>
                <div>{{ curRow.name }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.deviceType') }}:</div>
                <div>{{ myDeviceId[curRow.deviceTypeCode] }}</div>
              </div>
              <div class="flex">
                <div class="label-text">{{ $t('leaseOrder.leaseCreationTime') }}:</div>
                <div>{{ parseTime(curRow.createTime, '{y}-{m}-{d}') }}</div>
              </div>
            </div>
            <div class="ml-20">
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.contactInformation') }}:</div>
                <div>{{ curRow.mobile || '--' }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('leaseOrder.deviceNum') }}:</div>
                <div>{{ curRow.deviceNum }}</div>
              </div>
              <div class="flex">
                <div class="label-text">{{ $t('leaseOrder.kkStartTime') }}:</div>
                <div>{{ parseTime(curRow.deductionTime, '{y}-{m}-{d}') }}</div>
              </div>
            </div>
            <div class="ml-20">
              <div class="flex mb-10">
                <div class="label-text">{{ $t('leaseOrder.tenantIdentity') }}:</div>
                <div>{{ queryObj.createType.selectArr[curRow.createType] }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('leaseOrder.deductionPeriod') }}:</div>
                <div>{{currencySymbolpositionType ?  siteInfo.currencySymbol: ''  }}{{ curRow.deductionAmount }}{{currencySymbolpositionType ?  '': siteInfo.currencySymbol }}/{{ curRow.deductionCycle == 1 ? '' :
                  curRow.deductionCycle }}{{ $t('public.day') }}</div>
              </div>
              <div class="flex">
                <div class="label-text">{{ $t('leaseOrder.estimatedCompletionTime') }}:</div>
                <div>{{ parseTime(curRow.closeTime, '{y}-{m}-{d}') }}</div>
              </div>
            </div>
          </div>

          <div class="mt-20 mb-15">
            {{ $t('leaseOrder.deductionInformation') }}
          </div>
          <el-row :gutter="20" type="flex" class="flex-wrap mb-15 fs-s2 text-nowrap">
            <el-col :span="24" :md="8">
              <div class="flex align-start p-15 pay-i radius-5">
                <img :src="require('@/assets/lease/info_amout.svg')" width="32">
                <div class="pl-10 flex-1">
                  <div>{{ $t('leaseOrder.totalAmountTo') }}</div>
                  <div class="mt-5"><span class="fs-b2 text-bold">{{ curRow.amountTotal }}</span></div>
                </div>
              </div>
            </el-col>
            <el-col :span="24" :md="8">
              <div class="flex align-start p-15 pay-i radius-5">
                <img :src="require('@/assets/lease/info_time.svg')" width="32">
                <div class="pl-10 flex-1">
                  <div>{{ $t('leaseOrder.remainingAmount') }}</div>
                  <div class="mt-5"><span class="fs-b2 text-bold">{{ accSub(curRow.amountTotal, curRow.payAmount) }}</span></div>
                </div>
              </div>
            </el-col>
            <el-col :span="24" :md="8">
              <div class="flex align-start p-15 pay-i radius-5">
                <img :src="require('@/assets/lease/info_wait.svg')" width="32">
                <div class="pl-10 flex-1">
                  <div>{{ $t('leaseOrder.text3') }}</div>
                  <div class="mt-5" v-if="[2, 9].indexOf(curRow.status) == -1">
                    <span class="fs-b2 text-bold">{{ formatSeconds(accSub(unixTime(curRow.nextDeductionTime),
                      currentTime()), 'd-h') || $t('leaseOrder.text4') }}</span>
                  </div>
                  <div class="mt-5" v-else><span class="fs-b2 text-bold">{{ curRow.status == 9 ? $t('public.canceled') :
                    $t('public.completed') }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-table class="custom" :data="dform.list" :summary-method="getSummaries" show-summary>
            <el-table-column :label="$t('leaseOrder.deductionTime')">
              <template slot-scope="scope">
                {{ parseTime(scope.row.tradeTime, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('leaseOrder.deductionMethod')">
              <template slot-scope="scope">
                {{ $t('payType.balance') }}
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('leaseOrder.deductionAmount')}`">
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
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
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
  arrayToObj,
  currencySymbolposition
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
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    queryObj() {
      return {
        orderNo: {
          title: this.$t('public.orderNo'),
          type: 'input'
        },
        deductionId1: {
          title: this.$t('public.agentNickNames'),
          type: 'selectSearch',
          name: 'name',
          sType: 5
        },
        deductionId: {
          title: this.$t('leaseOrder.agentPhones'),
          type: 'selectSearch',
          name: 'mobile',
          sType: 5
        },
        deductionId3: {
          title: this.$t('public.storeName'),
          type: 'selectSearch',
          name: 'name',
          sType: 3
        },
        deductionId2: {
          title: this.$t('leaseOrder.storePhones'),
          type: 'selectSearch',
          name: 'mobile',
          sType: 3
        },
        createType: {
          title: this.$t('leaseOrder.rentalRole'),
          type: 'select',
          selectArr: {
            0: this.$t('public.store'),
            1: this.$t('public.agent')
          }
        }
      }
    },
    orderTabs() {
      return [
        {
          value: '-1',
          title: this.$t('public.all') || '',
          nkey: 'orderNumber'
        },
        {
          value: '0',
          title: this.$t('public.notStarted') || '',
          nkey: 'noNumber',
          type: 'warning'
        },
        {
          value: '1',
          title: this.$t('public.progress') || '',
          nkey: 'rentingNumber',
          type: 'danger'
        },
        {
          value: '2',
          title: this.$t('public.completed') || '',
          nkey: 'okNumber',
          type: 'success'
        },
        {
          value: '9',
          title: this.$t('public.canceled') || '',
          nkey: 'doneNumber',
          type: 'info'
        }
      ]
    },
    orderTab() {
      return arrayToObj([
        {
          value: '-1',
          title: this.$t('public.all') || '',
          nkey: 'orderNumber'
        },
        {
          value: '0',
          title: this.$t('public.notStarted') || '',
          nkey: 'noNumber',
          type: 'warning'
        },
        {
          value: '1',
          title: this.$t('public.progress') || '',
          nkey: 'rentingNumber',
          type: 'danger'
        },
        {
          value: '2',
          title: this.$t('public.completed') || '',
          nkey: 'okNumber',
          type: 'success'
        },
        {
          value: '9',
          title: this.$t('public.canceled') || '',
          nkey: 'doneNumber',
          type: 'info'
        }
      ], 'value')
    },
    dialogTitle() {
      return {
        1: this.$t('leaseOrder.dialogTitle'),
        2: this.$t('leaseOrder.dialogTitle1'),
        3: this.$t('leaseOrder.dialogTitle2'),
        4: this.$t('leaseOrder.dialogTitle3')
      }
    },
    defaultColumn() {
      return [{
        key: 'name',
        val: true,
        name: this.$t('leaseOrder.tenant')
      },
      {
        key: 'mobile',
        val: true,
        name: this.$t('public.phone')
      },
      {
        key: 'orderNo',
        val: true,
        name: this.$t('public.orderNo'),
        width: 260
      },
      {
        key: 'deviceTypeCode',
        val: true,
        name: this.$t('public.deviceType')
      },
      {
        key: 'deviceNum',
        val: true,
        name: this.$t('leaseOrder.deviceNum')
      },
      {
        key: 'amountTotal',
        val: true,
        name: `${this.$t('leaseOrder.amountTotal')}`
      },
      {
        key: 'payAmount',
        val: true,
        name: `${this.$t('leaseOrder.payAmounts')}`
      },
      {
        key: 'deductionCycle',
        val: true,
        name: `${this.$t('leaseOrder.deductionPeriod')}(${this.$t('public.day')})`
      },
      {
        key: 'statusStr',
        val: true,
        name: this.$t('public.status')
      },
      {
        key: 'deductionTime',
        val: false,
        name: this.$t('leaseOrder.kkStart'),
        width: 170
      },
      {
        key: 'closeTime',
        val: false,
        name: this.$t('leaseOrder.estimatedCompletion'),
        width: 170
      },
      {
        key: 'createTime',
        val: false,
        name: this.$t('public.creationTime'),
        width: 170
      }
      ]
    },
    /**
       * 添加修改校验条件
       */
    rules() {
      return {
        deviceTypeCode: [{
          required: true,
          message: this.$t('qrcode.plseaseDeviceType'),
          trigger: 'change'
        }],
        amountTotal: [{
          required: true,
          message: this.$t('leaseOrder.inputText'),
          trigger: 'blur'
        },
        {
          pattern: /(^[0-9]{1,6}$)|(^[0-9]{1,6}[\.]{1}[0-9]{1,2}$)/,
          message: this.$t('leaseOrder.message4'),
          trigger: 'blur'
        }],
        deviceNum: [{
          required: true,
          message: this.$t('leaseOrder.message'),
          trigger: 'blur'
        },
        {
          pattern: /(^[0-9]{1,6}$)|(^[0-9]{1,6}[\.]{1}[0-9]{1,2}$)/,
          message: this.$t('leaseOrder.message4'),
          trigger: 'blur'
        }],
        deductionAmount: [{
          required: true,
          message: this.$t('leaseOrder.message2'),
          trigger: 'blur'
        },
        {
          pattern: /(^[0-9]{1,4}$)|(^[0-9]{1,4}[\.]{1}[0-9]{1,2}$)/,
          message: this.$t('leaseOrder.message5'),
          trigger: 'blur'
        }]
      }
    },
  },
  data() {
    return {
      formatSeconds: formatSeconds,
      unixTime: unixTime,
      accSub: accSub,
      clickSubmit: false,
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
      curRow: {},
      curIdx: 0,
      dform: {},
      ferror: {},
      showRow: {},

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
      currencySymbolpositionType:false
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'addStore') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let query = this.$route.query
    for (var i in this.queryKey) {
      if (query[this.queryKey[i]]) {
        this.form[this.queryKey[i]] = query[this.queryKey[i]]
      } else {
        delete this.form[this.queryKey[i]]
      }
    }
    if (this.$route.meta.reload) {
      this.getList()
    } else if (this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery()
      this.getTotalStat()
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted(options) {
    this.currencySymbolpositionType =  currencySymbolposition();
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
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      let error = false
      for (var i in this.ferror) {
        if (this.ferror[i]) {
          error = true
          break
        }
      }
      if (error) return
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
              message: that.$t('leaseOrder.message6'),
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
                  message: that.$t('public.operationSuccessful'),
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
      let that = this;
      this.$post(`iot-saas-order/admin/order/device/rent/close/${row.id}`).then(res => {
        this.$message({
          message: that.$t('public.operationSuccessful'),
          type: 'success'
        })
        row.status = 9
        row.statusStr = that.$t('public.canceled')
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
          sums[index] = this.$t('leaseOrder.text5');
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
