<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
      @saveXlsx="saveXlsx">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="`${$t('public.allDevice')}`" :name="''" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.orderType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}(${statInfo[item.nkey] || 0})`" :name="'' + item.value + ''"
              v-for="item in orderTab" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 2">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" :placeholder="`${$t('public.pleaseSelect')}`">
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
            value-format="yyyy-MM-dd" :start-placeholder="`${$t('public.statrtDate')}`"
            :end-placeholder="`${$t('public.endDate')}`" :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(5, {})" v-if="isSaas()">{{
          $t('order.failedOrdersNum') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(6, {})" v-if="isSaas()">{{ $t('order.leaseOrderNum')
        }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 9)" v-if="isSaas()">{{
          $t('order.orderClosure') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 10)" v-if="isSaas()">{{
          $t('order.orderCancellation') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 8)" v-if="isSaas()">{{
          $t('order.refundOfDeposit') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 3)" v-if="isSaas() || isBrand()">{{
          $t('order.cancelPayOrder') }}
        </div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 7)" v-if="isSaas() || isBrand()">{{
          $t('order.DDRecovery') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 11)" v-if="isSaas()">{{
          $t('order.refundRetry') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 12)" v-if="isSaas()">{{
          $t('order.orderInquiry') }}</div>
        <table-column-set storageKey="orderTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <div v-if="showColumn.length > 0">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" element-loading-text="Loading">
          <el-table-column :label="`${$t('public.brand')}`" width="150" prop="brandName"
            v-if="isSaas()"></el-table-column>
          <template v-for="item in showColumn">
            <el-table-column :label="`${$t('public.userInfo')}`" width="170"
              v-if="item.val && item.key == 'userNickName'">
              <template slot-scope="scope">
                <div class="cursor text-blue" @click="setRows(1, scope.row, 4)" v-if="scope.row.userId == 0">
                  {{ $t('order.usingUsers') }}
                </div>
                <div v-else class="flex align-center">
                  <img :src="scope.row.userAvatar || agentInfo.avatar" class="mr-5 radius-15" width="30" height="30" alt="">
                  <div class="text-cut">{{ scope.row.userNickName || "--" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.userId')}`" width="90" v-if="item.val && item.key == 'userId'">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.userId || '...'">
                  <div>{{ scope.row.userId ? parseInt(scope.row.userId.substr(-8, 8)) : '' }}</div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.phone')}`" width="110" v-if="item.val && item.key == 'userMobile'">
              <template slot-scope="scope">
                <template v-if="scope.row.userId > 0">
                  <div v-if="isBrand() || isSaas()">{{ scope.row.userMobile || '--' }}</div>
                  <div v-else>{{ dealPhone(scope.row.userMobile) || '--' }}</div>
                </template>
                <template v-else>
                  --
                </template>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.store')}`" min-width="180" v-if="item.val && item.key == 'storeName'">
              <template slot-scope="scope">
                <div>{{ scope.row.storeName || '--' }}</div>
                <!-- <div>{{ scope.row.back_store || '--' }}</div> -->
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.type')}`" width="90" v-if="item.val && item.key == 'deviceType'">
              <template slot-scope="scope">
                {{ scope.row.deviceType || '--' }}
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.code')}`" width="240" v-if="item.val && item.key == 'deviceSn'">
              <template slot-scope="scope">
                <div>{{ $t('public.code') }}：{{ scope.row.deviceSn || "--" }}</div>
                <!-- <div>设备SN：{{ scope.row.factorySn || "--" }}</div> -->
                <div class="text-cut cursor text-blue" v-if="scope.row.depend_type == 0"
                  @click="checkBao(scope.row.goods_sn)">{{ $t('public.sn') }}：{{ scope.row.goods_sn || "--" }}</div>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('order.source')}`" width="50" v-if="item.val && item.key == 'sourceType'">
              <template slot-scope="scope">
                <span v-if="scope.row.sourceType == 3">{{ $t('order.admin') }}</span>
                <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="scope.row.sourceType == 1"></i>
                <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.payType')}`" width="120" v-if="item.val && item.key == 'PayType'">
              <template slot-scope="scope">
                <div class="fs-s3">{{ Constant.PayType ? Constant.PayType[scope.row.payType] : '--' }}<span
                    v-if="scope.row.orderAmount > 0 && scope.row.feeType == 3 && isBrand()">(￥{{ scope.row.orderAmount
                    }})</span> </div>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.time')}`" width="160" v-if="item.val && item.key == 'chargeStartTime'">
              <template slot-scope="scope">
                <div class="text-green">{{ scope.row.chargeStartTime || "--" }}</div>
                <div class="text-danger">{{ scope.row.chargeEndTime || "--" }}</div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="套餐类型" width="100" v-if="showColumn.feeType">
              <template slot-scope="scope">
                {{ showFeeName(scope.row.feeType) }}<span v-if="scope.row.feeType == 3">({{ scope.row.amountPaid }}元)</span>
              </template>
            </el-table-column> -->
            <el-table-column :label="`${$t('public.package')}`" width="150" v-if="item.val && item.key == 'feeMode'">
              <template slot-scope="scope">
                <div>{{ showFeeMode(scope.row.feeType, scope.row.feeMode, 1, scope.row.deviceTypeCode) }}</div>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.income')}(${$t('public.element')})`" width="75"
              v-if="item.val && item.key == 'amount'">
              <template slot-scope="scope">
                <el-link type="success">{{ scope.row.amount || '0.00' }}</el-link>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.refund')}(${$t('public.element')})`" width="75"
              v-if="item.val && item.key == 'amountRefund'">
              <template slot-scope="scope">
                <el-link type="success">{{ scope.row.amountRefund || '0.00' }}</el-link>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.status')}`" width="90" v-if="item.val && item.key == 'status'">
              <template slot-scope="scope">
                <el-link :type="scope.row.status > 2 || scope.row.order_status == -1 ? 'danger' : 'success'">
                  {{ Constant.OrderStatus ? Constant.OrderStatus[scope.row.status] : "--" }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.remark')}`" min-width="150" v-if="item.val && item.key == 'remark'">
              <template slot-scope="scope">
                <div class="remark-box">
                  <el-link type="danger" v-if="scope.row.freeTime > 0">
                    <span v-if="scope.row.freeUser == 1">{{ $t('public.freeQuota') }}：{{ (parseInt(scope.row.freeTime) /
                      60).toFixed(1)
                    }}{{ $t('public.huor') }}</span>
                    <span v-else-if="scope.row.freeUser == 3">{{ $t('order.suspendBilling') }}：{{
                      parseInt(scope.row.freeTime) / 60 }}{{ $t('public.huor') }}</span>
                    <span v-else-if="scope.row.freeUser > 3">{{ scope.row.freeTime == 600000 ?
                      `${$t('order.membershipOrder')}` :
                      `${$t('order.membershipFree')}${scope.row.freeTime}${$t('public.minute')}` }}</span>
                  </el-link>
                  <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.orderNo')}`" width="140" v-if="item.val && item.key == 'orderNo'">
              <template slot-scope="scope">
                {{ scope.row.orderNo || '--' }}
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.transactionNum')}`" width="160"
              v-if="item.val && item.key == 'transactionNo'">
              <template slot-scope="scope">
                <div>{{ scope.row.transactionNo || '--' }}</div>
              </template>
            </el-table-column>
          </template>
          <el-table-column :label="`${$t('public.operate')}`" width="165" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <div class="flex flex-wrap operate">
                <div class="text-primary" @click="setRows(3, scope.row, 6)">{{ $t('public.orderDetail') }}</div>
                <div class="text-danger" @click="setRows(3, scope.row, 1)"
                  v-if="(Ability['orderFinish'] || isSaas()) && scope.row.status == 'R'">{{ $t('public.closeOrder') }}
                </div>
                <div class="text-grey" @click="setRows(3, scope.row, 2)"
                  v-if="Ability['orderRefund'] && (scope.row.status.indexOf('G') > -1) && (scope.row.amount > 0 || scope.row.amountEnable > 0)">
                  {{ $t('public.orderRefund') }}</div>
                <div class="text-grey" @click="setRows(7, scope.row, 1)" v-if="(scope.row.status.indexOf('W') > -1) && (scope.row.payType == 4)">
                  {{ scope.row.payOrder ? $t('public.submitting') : $t('order.clickPay') }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="flex justify-end">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>

      <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
        <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
        <template v-if="dialogType == 3">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item :label="`${$t('public.orderNo')}`">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
            <el-form-item :label="`${$t('order.cancelReason')}`">
              <el-input v-model="dform.reason"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 4">
          <el-table border :data="dform.list">
            <el-table-column :label="`${$t('public.img')}`" align="center">
              <template slot-scope="scope">
                <el-avatar :size="30" :src="scope.row.avatar"></el-avatar>
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.nickname')}`" align="center">
              <template slot-scope="scope">
                {{ scope.row.nickname }}
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.phone')}`" align="center">
              <template slot-scope="scope">
                {{ scope.row.mobiel }}
              </template>
            </el-table-column>
            <el-table-column :label="`${$t('public.usageTime')}`" align="center">
              <template slot-scope="scope">
                {{ parseTime(scope.row.startUseTime) }}
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-if="[5, 7, 8, 9, 10, 11].indexOf(dialogType) > -1">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item :label="`${$t('public.orderNo')}`">
              <el-input v-model="dform.orderNo"></el-input>
              <div class="mt-10 text-danger line-default" v-if="dialogType == 8">{{ $t('order.message') }}</div>
              <div class="mt-10 text-danger line-default" v-else-if="dialogType == 9">{{ $t('order.message1') }}</div>
              <div class="mt-10 text-danger line-default" v-else-if="dialogType == 10">{{ $t('order.message2') }}</div>
            </el-form-item>
            <el-form-item  :label="`${$t('order.orderFree')}`" v-if="dialogType == 11">
              <el-switch v-model="dform.isDeposit" />
            </el-form-item>
          </el-form>
        </template>
        <template v-if="[12, 13].indexOf(dialogType) > -1">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item :label="`${$t('public.orderNo')}`">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
            <el-form-item :label="`${$t('order.source')}`">
              <el-input v-model="dform.payType" :placeholder="`${$t('order.sourceText')}`"></el-input>
            </el-form-item>
            <el-form-item :label="`${$t('order.result')}`" v-if="dform.results">
              {{ dform.results }}
            </el-form-item>
            <el-form-item :label="`${$t('public.operate')}`" v-if="dform.results">
              <el-button size="medium" type="primary" @click="dialogType = 13; dialogConfirm()" :disabled="clickSubmit">{{
                $t('order.operateText') }}</el-button>
            </el-form-item>
          </el-form>
        </template>
        <div class="mt-30 text-center">
          <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit"
            v-if="dialogType != 4">{{ $t('public.confirm') }}</el-button>
        </div>
      </el-dialog>

      <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
        <template v-if="dialogType == 1">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">{{ $t('public.userInfo') }}</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">{{ $t('public.userName') }}:</div>
                  <div>{{ curRow.userNickName }}</div>
                  <div class="ml-50 label-text">{{ $t('public.userId') }}:</div>
                  <div>{{ curRow.userId }}</div>
                </div>
                <div class="flex mt-10">
                  <div class="label-text">{{ $t('public.phone') }}:</div>
                  <div v-if="isBrand() || isSaas()">{{ curRow.userMobile || `${$t('public.notHave')}` }}</div>
                  <div v-else>{{ dealPhone(curRow.userMobile) || `${$t('public.notHave')}` }}</div>
                </div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              {{ $t('public.orderInformation') }}
            </div>
            <div class="pb-20 l-b">
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.orderNo') }}:</div>
                <div>{{ curRow.orderNo }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.storeName') }}:</div>
                <div>{{ curRow.storeName }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('order.orderSource') }}:</div>
                <div>
                  <span v-if="curRow.sourceType == 3">{{ $t('order.admin') }}</span>
                  <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="curRow.sourceType == 1"></i>
                  <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
                </div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.deviceType') }}:</div>
                <div>{{ curRow.deviceType }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.payType') }}:</div>
                <div>{{ Constant.PayType ? Constant.PayType[curRow.payType] : '--' }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.package') }}:</div>
                <div class="text-cut">
                  <el-tooltip :content="showFeeMode(curRow.feeType, curRow.feeMode, 2)" placement="top">
                    <span>{{ showFeeMode(curRow.feeType, curRow.feeMode, 1, curRow.deviceTypeCode) }}</span>
                  </el-tooltip>
                </div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.statrtTime') }}:</div>
                <div>{{ curRow.chargeEndTime }}</div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              {{ $t('public.operate') }}
            </div>
            <el-form class="custom-form" label-width="130px" label-position="left">
              <template v-if="curRow.deviceTypeCode && curRow.deviceTypeCode.indexOf('PA') > -1">
                <el-form-item :label="`${$t('order.inspect')}:`">
                  <el-switch v-model="dform.validateDeviceRefund" />
                </el-form-item>
              </template>
              <el-form-item :label="`${$t('order.returnTime')}:`">
                <el-date-picker v-model="dform.chargeEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm"
                  :picker-options="pickerOptionsEnd" :placeholder="`${$t('order.returnTimeText')}`">
                </el-date-picker>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-if="dialogType == 2">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15"> {{ $t('public.userInfo') }}</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">{{ $t('public.userName') }}:</div>
                  <div>{{ curRow.userNickName }}</div>
                  <div class="ml-50 label-text">{{ $t('public.userId') }}:</div>
                  <div>{{ curRow.userId }}</div>
                </div>
                <div class="flex mt-10">
                  <div class="label-text">{{ $t('public.phone') }}:</div>
                  <div v-if="isBrand() || isSaas()">{{ curRow.userMobile || `${$t('public.notHave')}` }}</div>
                  <div v-else>{{ dealPhone(curRow.userMobile) || `${$t('public.notHave')}` }}</div>
                </div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              {{ $t('public.orderInformation') }}
            </div>
            <div class="pb-20 l-b">
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.orderNo') }}:</div>
                <div>{{ curRow.orderNo }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.deviceType') }}:</div>
                <div>{{ curRow.deviceType }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">{{ $t('public.statrtTime') }}:</div>
                <div>{{ curRow.chargeStartTime }}</div>
              </div>
              <div class="flex">
                <div class="label-text">{{ $t('public.endTime') }}:</div>
                <div>{{ curRow.chargeEndTime }}</div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              {{ $t('public.operate') }}
            </div>
            <el-form class="custom-form" label-width="auto">
              <el-form-item :label="`${$t('public.returnType')}:`">
                <el-radio-group v-model="dform.refundType">
                  <el-radio :label="key" v-for="(item, key) in Constant.RefundType"
                    v-if="(key == 3 && curRow.amountEnable > 0) || (key != 3)">{{ item }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="`${$t('public.refundAmount')}:`">
                <el-input v-model="dform.amount"
                  :placeholder="`${$t('public.max')}${dform.refundType != 3 ? curRow.amount || 0 : curRow.amountEnable || 0}${$t('public.element')}`">
                  <span slot="append">{{ $t('public.element') }}</span>
                </el-input>
              </el-form-item>
              <el-form-item :label="`${$t('order.reasonForRefund')}:`">
                <el-input v-model="dform.reason" :placeholder="`${$t('order.reasonForRefund')}`"></el-input>
                <div class="flex mt-10 line-six text-danger" v-if="isBrand()">
                  <div>{{ $t('public.tips') }}：</div>
                  <div>{{ $t('order.reasonForRefundText') }}</div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </template>
        <template v-if="dialogType == 6">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">{{ $t('public.userInfo') }}</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">{{ $t('public.userName') }}:</div>
                  <div>{{ curRow.userNickName }}</div>
                  <div class="ml-50 label-text">{{ $t('public.userId') }}:</div>
                  <div>{{ curRow.userId }}</div>
                </div>
                <div class="flex mt-10">
                  <div class="label-text">{{ $t('public.phone') }}:</div>
                  <div v-if="isBrand() || isSaas()">{{ curRow.userMobile || `${$t('public.notHave')}` }}</div>
                  <div v-else>{{ dealPhone(curRow.userMobile) || `${$t('public.notHave')}` }}</div>
                </div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              {{ $t('public.orderInformation') }}
              <el-tag class="ml-10" :type="curRow.status > 2 || curRow.status == -1 ? 'danger' : 'success'" size="mini"
                effect="dark">
                {{ Constant.OrderStatus ? Constant.OrderStatus[curRow.status] : `${$t('public.completed')}` }}
              </el-tag>
            </div>
            <div class="flex pb-20 l-b">
              <div>
                <div class="pb-10 l-b-dashed">
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.orderNo') }}:</div>
                    <div>{{ curRow.orderNo }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.deviceType') }}:</div>
                    <div>{{ curRow.deviceType }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.deviceCode') }}:</div>
                    <div>{{ curRow.deviceSn }}</div>
                  </div>
                  <div class="flex" v-if="curRow.returnStore">
                    <div class="label-text">{{ $t('order.returningEquipment') }}:</div>
                    <div>{{ curRow.afterDeviceSn || '--' }}</div>
                  </div>
                </div>
                <div class="mt-10">
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.statrtTime') }}:</div>
                    <div>{{ curRow.chargeStartTime }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('order.orderSource') }}:</div>
                    <div>
                      <span v-if="curRow.sourceType == 3">{{ $t('order.admin') }}</span>
                      <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="curRow.sourceType == 1"></i>
                      <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
                    </div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.package') }}:</div>
                    <div class="text-cut">
                      <el-tooltip :content="showFeeMode(curRow.feeType, curRow.feeMode, 2)" placement="top">
                        <span>{{ showFeeMode(curRow.feeType, curRow.feeMode, 1, curRow.deviceTypeCode) }}</span>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="flex">
                    <div class="label-text">{{ $t('public.refund') }}:</div>
                    <div>{{ curRow.amountRefund || '0.00' }}</div>
                  </div>
                </div>
              </div>
              <div>
                <div class="pl-20 pb-10 l-b-dashed">
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.transactionNum') }}:</div>
                    <div>{{ curRow.transactionNo || '--' }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.rentalMerchants') }}:</div>
                    <div>{{ curRow.storeName }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text" v-if="curRow.deviceType.indexOf('充电宝') > -1">{{ $t('public.sn') }}:</div>
                    <div class="label-text" v-else>其他:</div>
                    <div class="cursor" @click="curRow.terminalId && isBrand() ? $router.push({path: `/device/battery?terminalId=${curRow.terminalId}`}) : ''">{{ curRow.terminalId || '--' }}</div>
                  </div>
                  <div class="flex" v-if="curRow.returnStore">
                    <div class="label-text">{{ $t('public.returnToMerchant') }}:</div>
                    <div>{{ curRow.returnStore.name }}</div>
                  </div>
                </div>
                <div class="pl-20 mt-10">
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.endTime') }}:</div>
                    <div>{{ curRow.chargeEndTime || '--' }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.payType') }}:</div>
                    <div>{{ Constant.PayType ? Constant.PayType[curRow.payType] : '--' }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">{{ $t('public.income') }}:</div>
                    <div>{{ curRow.amount || '0.00' }}</div>
                  </div>
                  <div class="flex">
                    <div class="label-text">{{ $t('public.remark') }}:</div>
                    <div>
                      <span class="mr-5" v-if="curRow.afterLevel >= 0 || curRow.level >= 0">{{ curRow.afterLevel ?
                        $t('order.powerConsumption') : $t('order.DuringLease') }}({{ curRow.afterLevel >= 0 ? curRow.afterLevel : curRow.level }}%)</span>
                      <template v-if="curRow.freeTime > 0">
                        <span class="mr-5" v-if="curRow.freeUser == 1">{{ $t('public.freeQuota') }}：{{ curRow.freeTime }}{{ $t('public.minute') }}</span>
                        <span class="mr-5" v-else-if="curRow.freeUser == 3">{{ $t('order.suspendBilling') }}：{{ curRow.freeTime }}{{ $t('public.minute') }}</span>
                        <span class="mr-5" v-else-if="curRow.freeUser > 3">{{ curRow.freeTime == 600000 ?  `${$t('order.membershipOrder')}` :
                          `${$t('order.membershipFree')}${curRow.freeTime}${$t('public.minute')}` }}</span>
                      </template>
                      <span>{{ curRow.remark || '' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <template v-if="!isStore()">
              <div class="mt-20 mb-15">{{ $t('order.orderProcess') }}</div>
              <div class="flex pb-20 timeline-box white-space text-center l-b">
                <div class="rel pt-30 timeline-item el-icon-" v-for="(item, index) in dform.orderFlow">
                  <div class="pl-10 pr-10">
                    <el-tooltip :content="item.reason || $t('public.notHave')" placement="top">
                      <div class="text-cut">{{ item.event }}</div>
                    </el-tooltip>
                    <div class="mt-10 fs-s2 text-gray">{{ item.createTime }}</div>
                  </div>
                </div>
              </div>
            </template>

            <template v-if="dform.orderDivide && dform.orderDivide.length > 0">
              <div class="mt-20 mb-15">{{ $t('order.dividedDetails') }}</div>
              <el-table border :data="dform.orderDivide" :span-method="fenRunSpanMethod" class="custom">
                <el-table-column :label="$t('public.orderMoeny')" align="center">
                  <template slot-scope="scope">
                    {{ dform.amountPaid }}{{ $t('public.element') }}
                  </template>
                </el-table-column>
                <el-table-column width="160" :label="`${$t('order.divideIntoAdults')}`" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.dividerName }}
                  </template>
                </el-table-column>
                <el-table-column :label="`${$t('public.shareRatio')}`" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.percent }}%
                  </template>
                </el-table-column>
                <el-table-column width="120" :label="`${$t('public.dividedAmount')}(${$t('public.element')})`"
                  align="center">
                  <template slot-scope="scope">
                    <span>{{ accSub(scope.row.amount, scope.row.loseAmount) }}</span>
                    <span v-if="scope.row.costAmount > 0">({{ $t('order.overtimeCosts') }}{{ scope.row.costAmount
                    }}{{ $t('public.element') }})</span>
                  </template>
                </el-table-column>
                <el-table-column width="120" :label="`${$t('public.ddAmount')}(${$t('public.element')})`" align="center"
                  v-if="dform.amountPaidLose > 0">
                  <template slot-scope="scope">
                    {{ scope.row.loseAmount || '--' }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('order.dividedTypes')" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.dividerPaymentType == 2 ? $t('payType.wx') : $t('payType.balance') }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('order.splitStates')" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.dividerPaymentStatus == 0 ? `${$t('order.status')}` : scope.row.dividerPaymentStatus ==
                      -1 ? `${$t('order.status1')}` :
                      scope.row.dividerPaymentStatus == -2 ? `${$t('order.status2')}` : `${$t('order.status3')}` }}
                  </template>
                </el-table-column>
                <el-table-column width="120" :label="`${$t('public.refundAmount')}(${$t('public.element')})`"
                  align="center">
                  <template slot-scope="scope">
                    {{ scope.row.refund }}
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </div>
        </template>

        <template v-if="dialogType != 6">
          <div class="p-15 mt-30 abs bfixed text-right l-t">
            <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
            <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{
              $t('public.confirm') }}</el-button>
          </div>
        </template>
      </el-drawer>
    </div>

    <xlsx ref="toXlsx" :fileName="$t('public.orderList')"></xlsx>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
import xlsx from '@/components/xlsx/'
import {
  dealPhone,
  showFeeMode,
  showFeeName,
  parseTime,
  unixTime,
  accAdd,
  accSub
} from '@/utils/index'

export default {
  name: 'Order',
  components: {
    TableColumnSet,
    Pagination,
    condition,
    selectSearch,
    xlsx
  },
  props: {
    lowerAgent: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    Constant() {
      return this.$store.getters.Constant
    },
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
    orderTab() {
      return [{
        value: 0,
        title: this.$t('public.all'),
        nkey: 'orderNumber'
      },
      {
        value: 'R',
        title: this.$t('public.progress'),
        nkey: 'rentingNumber'
      },
      {
        value: 'today',
        title: this.$t('public.today'),
        nkey: 'todayNumber'
      },
      {
        value: 'O',
        title: this.$t('public.completed'),
        nkey: 'doneNumber'
      },
      {
        value: 'OT',
        title: this.$t('public.overtimeOrder'),
        nkey: 'expiredNumber'
      },
      {
        value: 'F',
        title: this.$t('public.leaseFailed'),
        nkey: 'rentFailedNumber'
      },
      {
        value: 'W',
        title: this.$t('public.deductionFailed'),
        nkey: 'payFailedNumber'
      }
      ]
    },
    queryObj() {
      return {
        orderNo: {
          title: this.$t('public.orderNo'),
          type: 'input'
        },
        idLastNine: {
          title: this.$t('public.userId'),
          type: 'selectSearch',
          name: 'idLastNine',
          sType: 1
        },
        userIds: {
          title: this.$t('public.userNickName'),
          type: 'selectSearch',
          name: 'nickname',
          sType: 2
        },
        userId: {
          title: this.$t('public.phone'),
          type: 'selectSearch',
          name: 'mobile',
          sType: 1
        },
        storeId: {
          title: this.$t('public.storeName'),
          type: 'selectSearch',
          name: 'name',
          sType: 3
        },
        deviceSn: {
          title: this.$t('public.deviceCode'),
          type: 'input'
        },
        terminalId: {
          title: this.$t('public.cdbSn'),
          type: 'input'
        },
        transactionNo: {
          title: this.$t('public.transactionNum'),
          type: 'input'
        },
        sourceType: {
          title: this.$t('order.orderSource'),
          type: 'select',
          selectArr: []
        },
        payType: {
          title: this.$t('public.payType'),
          type: 'select',
          selectArr: []
        }
      }
    },
    dialogTitle() {
      return {
        1: this.$t('public.closeOrder'),
        2: this.$t('public.orderRefund'),
        3: this.$t('order.cancelPayOrder'),
        4: this.$t('order.orderUser'),
        5: this.$t('order.orderEnd'),
        6: this.$t('public.orderDetail'),
        7: this.$t('order.DDRecovery'),
        8: this.$t('order.refundRetry'),
        9: this.$t('order.orderClosure'),
        10: this.$t('order.orderCancellation'),
        11: this.$t('order.wxOrderRefundRetry'),
        12: this.$t('order.orderInquiry'),
        13: this.$t('order.followUpExecution'),
      }
    },
    defaultColumn() {
      return [
        {
          key: 'userNickName',
          val: true,
          name: this.$t('public.userInfo')
        },
        {
          key: 'userId',
          val: true,
          name: this.$t('public.userId')
        },
        {
          key: 'userMobile',
          val: true,
          name: this.$t('public.phone')
        },
        {
          key: 'deviceType',
          val: true,
          name: this.$t('public.type')
        },
        {
          key: 'storeName',
          val: true,
          name: this.$t('public.storeName')
        },
        {
          key: 'sourceType',
          val: true,
          name: this.$t('order.source')
        },
        {
          key: 'PayType',
          val: true,
          name: this.$t('public.payType')
        },
        {
          key: 'chargeStartTime',
          val: true,
          name: this.$t('public.time')
        },
        {
          key: 'deviceSn',
          val: true,
          name: this.$t('public.code')
        },
        {
          key: 'feeMode',
          val: true,
          name: this.$t('public.package')
        },
        {
          key: 'amount',
          val: true,
          name: this.$t('public.income')
        },
        {
          key: 'amountRefund',
          val: true,
          name: this.$t('public.refund')
        },
        {
          key: 'status',
          val: true,
          name: this.$t('public.status')
        },
        {
          key: 'remark',
          val: true,
          name: this.$t('public.remark')
        },
        {
          key: 'orderNo',
          val: true,
          name: this.$t('public.orderNo')
        },
        {
          key: 'transactionNo',
          val: true,
          name: this.$t('public.transactionNum')
        }
      ]
    }
  },
  data() {
    return {
      dealPhone: dealPhone,
      showFeeMode: showFeeMode,
      showFeeName: showFeeName,
      accSub: accSub,
      clickSubmit: false,
      pickerOptionsEnd: {
        disabledDate: (time) => {
          let timeOptionRange = this.timeOptionRange
          let secondNum = 60 * 60 * 24 * 31 * 1000
          if (timeOptionRange) {
            return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
              .getTime() - secondNum) || time.getTime() > Date.now()
          }
          return time.getTime() > Date.now()
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

      cat_id: [],
      search_regions_tag: [],
      categoryList: [],
      areaList: [],

      tableMaxH: '250',
      listLoading: false,
      listTotal: 0,
      statInfo: {},
      list: [],
      listQuery: {
        status: '',
        page: 1,
        size: 20
      },

      formKey: {
        sel1: 'orderNo',
        sel2: 'idLastNine'
      },
      form: {},
      order: {},
      selID: [],

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],

      scrollTop: 0
    }
  },
  created() {
    if (localStorage.getItem('formKey_order')) {
      this.formKey = JSON.parse(localStorage.getItem('formKey_order'))
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
    this.queryKey = ['storeId', 'agentId', 'brandId', 'deviceSn', 'sourceType', 'userId']
    this.queryObj.sourceType.selectArr = this.Constant.SourceType
    this.queryObj.payType.selectArr = this.Constant.PayType
    if (this.isSaas()) {
      this.$set(this.queryObj, 'brandId', {
        title: this.$t('public.brandName'),
        type: 'selectSearch',
        name: 'name',
        sType: 6
      })
    }
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
    }else{
      this.$nextTick(() => {
        if(this.scrollTop){
          // 设置滚动条的位置 需要设置延迟，否则无效
          setTimeout(() => {
            this.$refs.list_table.bodyWrapper.scrollTop = this.scrollTop
          }, 100)
        }
      })
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted() {
    setTimeout(() => {
      if(this.$refs.list_table){
        this.$refs.list_table.bodyWrapper.addEventListener('scroll', (res) => {
          this.scrollTop = res.target.scrollTop
        }, false)
      }
    }, 200)
  },
  beforeDestroy() {
    localStorage.setItem('formKey_order', JSON.stringify(this.formKey))
  },
  methods: {
    /**
     * 订单数量
     */
    getStatNum() {
      let url = 'iot-saas-order/admin/order/count/queryByUser',
        params = Object.assign({}, this.listQuery, this.form)
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      for (var i in this.queryKey) {
        if (this[this.queryKey[i]]) {
          params[this.queryKey[i]] = this[this.queryKey[i]]
        }
      }
      if (params.storeId && params.storeId.indexOf('&') > -1) {
        let ids = params.storeId.split('&')
        params.storeId = ids[0]
        params.agentId = ids[1]
        params.brandId = ids[2]
      }
      if (this.lowerAgent != 'ALL') params.lowerAgent = this.lowerAgent || false
      if (params.deviceTypeCode == 0) delete params.deviceTypeCode
      delete params.status
      this.$get(url, params).then(res => {
        this.statInfo = res
      })
    },

    /**
     * 搜索查询
     */
    toQuery(type = 1) {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      if (type == 1) this.getStatNum()
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
      this.getStatNum()
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      var url = 'iot-saas-order/admin/order/list',
        params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0] + ' 00:00:00'
        params.endTime = params.date[1] + ' 23:59:59'
        delete params.date
      }
      if (params.status == 'today') {
        let todayTime = new Date(new Date().toLocaleDateString()).getTime() / 1000
        params.startTime = parseTime(todayTime)
        params.endTime = parseTime(todayTime + 86400)
        delete params.status
      }
      for (var i in this.queryKey) {
        if (this[this.queryKey[i]]) {
          params[this.queryKey[i]] = this[this.queryKey[i]]
        }
      }
      if (params.storeId && params.storeId.indexOf('&') > -1) {
        let ids = params.storeId.split('&')
        params.storeId = ids[0]
        params.agentId = ids[1]
        params.brandId = ids[2]
      }
      if (params.status == 0) delete params.status
      if (params.deviceTypeCode == 0) delete params.deviceTypeCode
      if (params.userIds) {
        params.userId = params.userIds
        delete params.userIds
      }
      if (params.idLastNine) {
        params.userId = params.idLastNine
        delete params.idLastNine
      }
      if (params.orderNo && params.orderNo.length == 6) {
        params.orderNoEndSix = params.orderNo
        delete params.orderNo
      }
      if (this.lowerAgent != 'ALL') params.lowerAgent = this.lowerAgent || false
      this.$get(url, params).then(res => {
        if (this.outStatus) {
          this.list = res ? res.rows : []
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
          this.list = res ? res.rows : []
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 55
          }
          if(this.scrollTop > 0){
            setTimeout(() => {
              this.$refs.list_table.bodyWrapper.scrollTop = 0
            }, 50)
          }
        }
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 获取商户类别
     */
    getCategory() {
      this.$get('agentapi/store/store_cat_list').then(res => {
        for (var i in res) {
          const obj = {
            value: res[i].cat_id,
            label: res[i].cat_name,
            children: []
          }
          if (this.cat_id == obj.value) {
            if (res[i].son_cat_list.length > 0) {
              this.form.cat_id = [obj.value, res[i].son_cat_list[0].cat_id]
            } else {
              this.form.cat_id = [obj.value]
            }
          }
          if (res[i].son_cat_list.length > 0) {
            for (var s in res[i].son_cat_list) {
              const child = res[i].son_cat_list[s]
              if (this.cat_id == child.cat_id) this.form.cat_id = [obj.value, child.cat_id]
              obj.children.push({
                value: child.cat_id,
                label: child.cat_name
              })
            }
          } else {
            obj.children = undefined
          }
          this.categoryList.push(obj)
        }
      })
    },

    /**
     * 获取区域
     */
    getArea() {
      this.$get('commonapi/tool/get_address_list').then(res => {
        for (var i in res) {
          const firstLevel = res[i]
          const obj = {
            value: firstLevel.tag,
            label: firstLevel.title,
            children: []
          }
          if (firstLevel.son_list.length > 0) {
            const secondLevel = firstLevel.son_list
            for (var s in secondLevel) {
              const secondItem = secondLevel[s]
              obj.children.push({
                value: secondItem.tag,
                label: secondItem.title,
                children: []
              })
              if (secondItem.son_list.length > 0) {
                const thirdLevel = secondItem.son_list
                for (var t in thirdLevel) {
                  const thirdItem = thirdLevel[t]
                  obj.children[s].children.push({
                    value: thirdItem.tag,
                    label: thirdItem.title
                  })
                }
              } else {
                obj.children = undefined
              }
            }
          } else {
            obj.children = undefined
          }
          this.areaList.push(obj)
        }
      })
    },

    /**
     * 订单详情分润合并单元格
     */
    fenRunSpanMethod({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
      if (columnIndex === 0) {
        if (rowIndex % 8 === 0) {
          return {
            rowspan: 8,
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型 2 查询宝归还状态 3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '结束订单' 2: '订单退款' 3: '取消订单' 4: '查看订单使用人数'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      let that = this;
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dialogStatus = true
          this.dform = {}
          if (dialogType == 4) {
            this.$get('iot-saas-order/admin/order/queryStoreOrderUser', {
              orderNo: row.orderNo
            }).then(res => {
              this.$set(this.dform, 'list', res)
            })
          }
          break
        case 3:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
          this.dform = {}
          if (dialogType == 1) {
            this.$set(this.dform, 'chargeEndTime', this.parseTime(this.currentTime()))
            if (row.deviceType == '充电宝') this.$set(this.dform, 'validateDeviceRefund', true)
          } else if (dialogType == 2) {
            this.$set(this.dform, 'refundType', '0')
            if (row.amountEnable && row.amountEnable > 0) {
              this.Constant.RefundType[3] = that.$t('public.balanceRefund');
              this.editObj.refundType = '3';
            }
          } else if (dialogType == 6) {
            this.$get('iot-saas-order/admin/order/detail', {
              orderNo: row.orderNo
            }).then(res => {
              if (res.devicePopupRecordFeignOutFeign && res.status != 'F') {
                this.$set(this.curRow, 'terminalId', res.devicePopupRecordFeignOutFeign.terminalId || '')
                this.$set(this.curRow, 'afterDeviceSn', res.devicePopupRecordFeignOutFeign.afterDeviceSn || '')
                if (res.devicePopupRecordFeignOutFeign.afterLevel > 0) {
                  this.$set(this.curRow, 'afterLevel', accSub(res.devicePopupRecordFeignOutFeign.level, res.devicePopupRecordFeignOutFeign.afterLevel))
                }else if(res.devicePopupRecordFeignOutFeign.level){
                  this.$set(this.curRow, 'level', res.devicePopupRecordFeignOutFeign.level)
                }
                if (parseFloat(res.devicePopupRecordFeignOutFeign.afterStoreId) > 0) {
                  this.$post('iot-saas-order/api/order/getDeductions', {
                    deductionType: 0,
                    deductionIds: [res.devicePopupRecordFeignOutFeign.afterStoreId]
                  }).then(list => {
                    if (list && list[0]) {
                    	this.$set(this.curRow, 'returnStore', list[0])
                    }
                  })
                }
              }
            })
            this.$get('iot-saas-order/admin/order/detail/flow', {
              orderNo: row.orderNo
            }).then(res => {
              this.$set(this.dform, 'orderFlow', res)
              if (row.status.indexOf('O') > -1 && row.amount > 0 && this.Ability['orderDivide']) {
                this.getDivide(row.orderNo)
              }
            })
          }
          break
        case 2:
          this.$get('iot-saas-device/admin/device/findRestoreStatus', {
            orderNo: row.orderNo
          }).then(res => {
            if (res) {
              this.$message({
                message: that.$t('order.hasBeenReturned'),
                type: 'success'
              })
            } else {
              this.$message({
                message: that.$t('order.hasNotBeenReturned'),
                type: 'error'
              })
            }
          })
          break
        case 5:
          this.$alert(that.$t('order.alert'), that.$t('order.alert1'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$get('iot-saas-order/admin/order/count/initWaitPayOrderCount').then(res => {
                  this.$message({
                    message: that.$t('public.refreshSuccessful'),
                    type: 'success'
                  })
                })
              }
            }
          })
          break
        case 6:
          this.$alert(that.$t('order.alert2'), that.$t('order.alert3'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$get('iot-saas-order/admin/order/count/initRentingOrderCount').then(res => {
                  this.$message({
                    message: that.$t('public.refreshSuccessful'),
                    type: 'success'
                  })
                })
              }
            }
          })
          break
        case 7:
          if(this.payOrderNo == row.orderNo){
            this.$message({
              message: that.$t('order.clickPayDesc'),
              type: 'error'
            })
            return
          }
          this.payOrderNo = row.orderNo
          this.$post('iot-saas-pay/open/alipay/depositPayComplete', {
            orderNo: row.orderNo
          }).then(res => {
            this.$message({
              message: that.$t('public.refreshSuccessful'),
              type: 'success'
            })
            setTimeout(() => {
            	this.getList()
            }, 1000)
          })
          break
      }
    },

    /**
     * 获取分成记录
     */
    getDivide(orderNo) {
      let that = this;
      this.$get('iot-saas-order/admin/order/detail/divide', {
        orderNo: orderNo
      }).then(res => {
        let amountPaidLose = 0
        if (res.divideList && res.divideList.length > 0) {
          res.divideList.map(item => {
            amountPaidLose = accAdd(amountPaidLose, item.loseAmount)
          })
        }
        this.$set(this.dform, 'orderDivide', res.divideList)
        this.$set(this.dform, 'amountPaid', res.amountPaid)
        this.$set(this.dform, 'amountPaidLose', amountPaidLose)
      }).catch(err => {
        if (err.message.indexOf('订单未完成或者还未分成') > -1) {
          this.$alert(that.$t('order.alert4'), that.$t('public.tips'), {
            confirmButtonText: that.$t('order.divideImmediately'),
            showCancelButton: true,
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post(`iot-saas-order/admin/order/complete/divide`, {
                  orderNos: [orderNo]
                }).then(res => {
                  this.$message({
                    message: that.$t('public.submittedSuccess'),
                    type: 'success'
                  })
                  setTimeout(() => {
                    this.getDivide(orderNo)
                  }, 4000)
                })
              }
            }
          })
        }
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
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          if (!params.chargeEndTime) {
            this.$message({
              message: that.$t('order.pleaseSelectEndTime'),
              type: 'error'
            })
            return
          }
          this.$post('iot-saas-order/admin/order/complete', {
            orderNo: this.curRow.orderNo,
            chargeEndTime: params.chargeEndTime,
            validateDeviceRefund: params.validateDeviceRefund || false
          }).then(res => {
            this.$message({
              message: that.$t('order.endOrderSuccess'),
              type: 'success'
            })
            curRow.status = 'OTG'
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 2:
          if (this.dform.refundType == 3 && (this.dform.amount > (this.curRow.amountEnable || 0))) {
            this.$message({
              message: `${that.$t('order.maxAmount')}${this.curRow.amountEnable || 0}${that.$t('public.element')}`,
              type: 'error'
            })
            this.clickSubmit = false
            return;
          }
          if (!params.amount || params.amount <= 0) {
            this.$message({
              message: that.$t('order.pleaseRefundAmount'),
              type: 'error'
            })
            this.clickSubmit = false
            return
          }
          params.orderNo = this.curRow.orderNo
          this.$post('iot-saas-order/admin/order/refund', params).then(res => {
            this.$message({
              message: that.$t('order.orderRefundSuccess'),
              type: 'success'
            })
            curRow.status = 'OHD'
            curRow.amountRefund = params.amount
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 3:
          if (!params.orderNo) {
            this.$message({
              message: that.$t('order.pleaseOrderNo'),
              type: 'error'
            })
            this.clickSubmit = false
            return
          } else if (!params.reason) {
            this.$message({
              message: that.$t('order.pleaseReasonForCancellation'),
              type: 'error'
            })
            this.clickSubmit = false
            return
          }
          this.$post('iot-saas-order/admin/order/cancel', params).then(res => {
            this.$message({
              message: that.$t('order.cancelSuccess'),
              type: 'success'
            })
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 5:
          if (!params.orderNo) {
            this.$message({
              message: that.$t('order.pleaseOrderNo'),
              type: 'error'
            })
            return
          }
          this.$post('iot-saas-order/admin/deposit/execute', {
            orderNoList: [params.orderNo]
          }).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 7: case 8: case 9: case 10: case 11:
          if (!params.orderNo) {
            this.$message({
              message: that.$t('order.pleaseOrderNo'),
              type: 'error'
            })
            return
          }
          let url = {
            7: 'iot-saas-order/admin/order/lose/recover',
            8: 'iot-saas-order/admin/order/complete/refund',
            9: 'iot-saas-pay/admin/pay/config/alipay/close',
            10: 'iot-saas-pay/admin/pay/config/alipay/cancel',
            11: 'iot-saas-pay/wechat/order/refund'
          }
          this.$post(url[this.dialogType], params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 12: case 13:
          if (!params.orderNo) {
            this.$message({
              message: that.$t('order.pleaseOrderNo'),
              type: 'error'
            })
            return
          }
          let urls = {
            12: {
              2: 'iot-saas-pay/admin/deposit/queryByOrderNo',
              3: 'iot-saas-pay/admin/deposit/alipay/queryByOrderNo',
            },
            13: {
              2: 'iot-saas-pay/admin/deposit/queryByOrderNoAndFixOrder',
              3: 'iot-saas-pay/admin/deposit/alipay/depositPayComplete',
            }
          }
          if (!urls[this.dialogType][params.payType]) {
            this.$message({
              message: that.$t('order.message3'),
              type: 'success'
            })
            this.clickSubmit = false
            return
          }
          this.$post(urls[this.dialogType][params.payType], {
            orderNo: params.orderNo
          }).then(res => {
            if (this.dialogType == 12) {
              this.$set(this.dform, 'results', res)
              this.clickSubmit = false
            } else {
              this.$message({
                message: that.$t('public.submittedSuccess'),
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }
          }).catch(err => {
            if (this.dialogType == 13) {
              this.dialogType == 12
            }
            this.clickSubmit = false
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.remark-box {
  max-height: 80px;
}

/deep/ .order-no {
  .el-input__inner {
    padding-right: 0;
  }
}

.timeline-box {
  max-width: 900px;
  overflow-y: scroll;

  .timeline-item {

    &::after,
    &::before {
      content: '';
      position: absolute;
    }

    &::before {
      width: 26px;
      height: 14px;
      top: 0;
      margin-left: -13px;
      content: "";
      background-color: var(--white);
      color: var(--olive);
      z-index: 99;
    }

    &::after {
      top: 6px;
      margin-left: 10px;
      width: 100%;
      height: 1px;
      background: var(--olive);
    }

    &:last-child {
      &::before {
        color: var(--orange);
      }

      &::after {
        width: 0;
      }
    }

    &.err {
      &::before {
        content: "";
        color: var(--orange);
      }
    }
  }
}
</style>
