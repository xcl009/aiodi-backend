<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">设备类型</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane label="全部设备" :name="''" />
            <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">订单状态</div>
          <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title }(${statInfo[item.nkey] || 0})`" :name="''+item.value+''" v-for="item in orderTab" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 2">
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
        <el-form-item>
          <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange" range-separator="-"
            value-format="yyyy-MM-dd" start-placeholder="开始日期" end-placeholder="结束日期"
            :picker-options="pickerOptionsEnd" @change="toQuery()">
          </el-date-picker>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">查询表格</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 3)" v-if="isSaas() || isBrand()">取消支付分订单</div>
        <!-- <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 7)" v-if="isSaas() || isBrand()">DD恢复</div> -->
        <table-column-set storageKey="orderTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <div v-if="showColumn.length > 0">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" element-loading-text="Loading">
          <el-table-column label="品牌" width="150" prop="brandName" v-if="isSaas()"></el-table-column>
          <template v-for="item in showColumn">
            <el-table-column label="用户信息" width="170" v-if="item.val && item.key == 'userNickName'">
              <template slot-scope="scope">
                <div class="cursor text-blue" @click="setRows(1, scope.row, 4)" v-if="scope.row.userId == 0">
                  查看使用用户
                </div>
                <div v-else class="flex align-center">
                  <img :src="scope.row.userAvatar || agentInfo.avatar" class="mr-5 radius-15" width="30" alt="">
                  <div class="text-cut">{{ scope.row.userNickName || "--" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用户ID" width="90" v-if="item.val && item.key == 'userId'">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.userId || '无'">
                  <div>{{ scope.row.userId ? parseInt(scope.row.userId.substr(-8, 8)) : '' }}</div>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="手机号码" width="110" v-if="item.val && item.key == 'userMobile'">
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
            <el-table-column label="商户" min-width="180" v-if="item.val && item.key == 'storeName'">
              <template slot-scope="scope">
                <div>{{ scope.row.storeName || '--' }}</div>
                <!-- <div>{{ scope.row.back_store || '--' }}</div> -->
              </template>
            </el-table-column>
            <el-table-column label="类型" width="90" v-if="item.val && item.key == 'deviceType'">
              <template slot-scope="scope">
                {{ scope.row.deviceType || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="二维码" width="240" v-if="item.val && item.key == 'deviceSn'">
              <template slot-scope="scope">
                <div>二维码：{{ scope.row.deviceSn || "--" }}</div>
                <!-- <div>设备SN：{{ scope.row.factorySn || "--" }}</div> -->
                <div class="text-cut cursor text-blue" v-if="scope.row.depend_type == 0"
                  @click="checkBao(scope.row.goods_sn)">宝SN：{{ scope.row.goods_sn || "--" }}</div>
              </template>
            </el-table-column>
            <el-table-column label="来源" width="50" v-if="item.val && item.key == 'sourceType'">
              <template slot-scope="scope">
                <span v-if="scope.row.sourceType == 3">后台</span>
                <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="scope.row.sourceType == 1"></i>
                <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
              </template>
            </el-table-column>
            <el-table-column label="支付类型" width="100" v-if="item.val && item.key == 'PayType'">
              <template slot-scope="scope">
                <div class="fs-s3">{{ Constant.PayType ? Constant.PayType[scope.row.payType] : '--' }}<span v-if="scope.row.orderAmount > 0 && scope.row.feeType == 3">(￥{{ scope.row.orderAmount }})</span>  </div>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="150" v-if="item.val && item.key == 'chargeStartTime'">
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
            <el-table-column label="套餐" width="150" v-if="item.val && item.key == 'feeMode'">
              <template slot-scope="scope">
                {{ showFeeMode(scope.row.feeType, scope.row.feeMode)}}
              </template>
            </el-table-column>
            <el-table-column label="收益(元)" width="75" v-if="item.val && item.key == 'amount'">
              <template slot-scope="scope">
                <el-link type="success">{{ scope.row.amount || '0.00' }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="退款(元)" width="75" v-if="item.val && item.key == 'amountRefund'">
              <template slot-scope="scope">
                <el-link type="success">{{ scope.row.amountRefund || '0.00' }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" v-if="item.val && item.key == 'status'">
              <template slot-scope="scope">
                <el-link :type="scope.row.status > 2 || scope.row.order_status == -1 ? 'danger' : 'success'">
                  {{ Constant.OrderStatus? Constant.OrderStatus[scope.row.status] : "--" }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150" v-if="item.val && item.key == 'remark'">
              <template slot-scope="scope">
                <div class="remark-box">
                  <el-link type="danger" v-if="scope.row.freeTime > 0">
                    <span v-if="scope.row.freeUser == 1">免费名额：{{ parseInt(scope.row.freeTime) / 60 }}小时</span>
                    <span v-else>{{ scope.row.freeTime == 600000 ? '会员卡订单' : `会员卡免费${scope.row.freeTime}分钟` }}</span>
                  </el-link>
                  <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="订单号" width="140" v-if="item.val && item.key == 'orderNo'">
              <template slot-scope="scope">
                {{ scope.row.orderNo || '--' }}
              </template>
            </el-table-column>
            <el-table-column label="交易单号" width="155" v-if="item.val && item.key == 'transactionNo'">
              <template slot-scope="scope">
                <div>{{ scope.row.transactionNo || '--' }}</div>
              </template>
            </el-table-column>
          </template>
          <el-table-column label="操作" width="165" :fixed="device == 'desktop' ? 'right' : false">
            <template slot-scope="scope">
              <div class="flex flex-wrap operate">
                <div class="text-primary" @click="setRows(3, scope.row, 6)">订单详情</div>
                <div class="text-danger" @click="setRows(3, scope.row, 1)" v-if="Ability['orderFinish'] && scope.row.status == 'R'">结束订单</div>
                <div class="text-grey" @click="setRows(3, scope.row, 2)" v-if="Ability['orderRefund'] && (scope.row.status.indexOf('G') > -1) && scope.row.amount > 0">订单退款</div>
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
            <el-form-item label="订单号">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
            <el-form-item label="取消原因">
              <el-input v-model="dform.reason"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 4">
          <el-table border :data="dform.list">
            <el-table-column label="头像" align="center">
              <template slot-scope="scope">
                <el-avatar :size="30" :src="scope.row.avatar"></el-avatar>
              </template>
            </el-table-column>
            <el-table-column label="昵称" align="center">
              <template slot-scope="scope">
                {{ scope.row.nickname }}
              </template>
            </el-table-column>
            <el-table-column label="手机号码" align="center">
              <template slot-scope="scope">
                {{ scope.row.mobiel }}
              </template>
            </el-table-column>
            <el-table-column label="使用时间" align="center">
              <template slot-scope="scope">
                {{ parseTime(scope.row.startUseTime) }}
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-if="dialogType == 5">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="订单号">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 7">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="订单号">
              <el-input v-model="dform.orderNo"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <div class="mt-30 text-center">
          <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit"
            v-if="dialogType != 4">确定</el-button>
        </div>
      </el-dialog>

      <el-drawer
        :title="dialogTitle[dialogType]"
        :visible.sync="drawerStatus"
        :wrapperClosable="false"
        >
        <template v-if="dialogType == 1">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">用户信息</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">用户名:</div>
                  <div>{{ curRow.userNickName }}</div>
                  <div class="ml-50 label-text">用户ID:</div>
                  <div>{{ curRow.userId }}</div>
                </div>
                <div class="flex mt-10">
                  <div class="label-text">手机号码:</div>
                  <div v-if="isBrand() || isSaas()">{{ curRow.userMobile || '无' }}</div>
                  <div v-else>{{ dealPhone(curRow.userMobile) || '无' }}</div>
                </div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              订单信息
            </div>
            <div class="pb-20 l-b">
              <div class="flex mb-10">
                <div class="label-text">订单号:</div>
                <div>{{ curRow.orderNo }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">商户名称:</div>
                <div>{{ curRow.storeName }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">订单来源:</div>
                <div>
                  <span v-if="curRow.sourceType == 3">后台</span>
                  <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="curRow.sourceType == 1"></i>
                  <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
                </div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">设备类型:</div>
                <div>{{ curRow.deviceType }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">支付类型:</div>
                <div>{{ Constant.PayType ? Constant.PayType[curRow.payType] : '--' }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">套餐:</div>
                <div class="text-cut">
                  <el-tooltip :content="showFeeMode(curRow.feeType, curRow.feeMode)" placement="top">
                    <span>{{ showFeeMode(curRow.feeType, curRow.feeMode) }}</span>
                  </el-tooltip>
                </div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">开始时间:</div>
                <div>{{ curRow.chargeEndTime }}</div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              操作
            </div>
            <el-form class="custom-form" label-width="130px" label-position="left">
              <template v-if="curRow.deviceType == '充电宝'">
                <el-form-item label="检测设备是否归还:">
                  <el-switch v-model="dform.validateDeviceRefund" />
                </el-form-item>
              </template>
              <el-form-item label="设置归还时间:">
                <el-date-picker v-model="dform.chargeEndTime" type="datetime"
                  value-format="yyyy-MM-dd HH:mm" :picker-options="pickerOptionsEnd" placeholder="请选择结束时间">
                </el-date-picker>
              </el-form-item>
            </el-form>
          </div>
        </template>

        <template v-if="dialogType == 2">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">用户信息</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">用户名:</div>
                  <div>{{ curRow.userNickName }}</div>
                  <div class="ml-50 label-text">用户ID:</div>
                  <div>{{ curRow.userId }}</div>
                </div>
                <div class="flex mt-10">
                  <div class="label-text">手机号码:</div>
                  <div v-if="isBrand() || isSaas()">{{ curRow.userMobile || '无' }}</div>
                  <div v-else>{{ dealPhone(curRow.userMobile) || '无' }}</div>
                </div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              订单信息
            </div>
            <div class="pb-20 l-b">
              <div class="flex mb-10">
                <div class="label-text">订单号:</div>
                <div>{{ curRow.orderNo }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">设备类型:</div>
                <div>{{ curRow.deviceType }}</div>
              </div>
              <div class="flex mb-10">
                <div class="label-text">开始时间:</div>
                <div>{{ curRow.chargeStartTime }}</div>
              </div>
              <div class="flex">
                <div class="label-text">结束时间:</div>
                <div>{{ curRow.chargeEndTime }}</div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              操作
            </div>
            <el-form class="custom-form" label-width="auto">
              <el-form-item label="退回方式:">
                <el-radio-group v-model="dform.refundType">
                  <el-radio :label="key" v-for="(item, key) in Constant.RefundType"
                    v-if="(key == 2 && curRow.feeType == 2 && curRow.payType < 3) || (key != 2)">{{ item }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="退款金额:">
                <el-input v-model="dform.amount" :placeholder="`最多${curRow.amount}元`">
                  <span slot="append">元</span>
                </el-input>
              </el-form-item>
              <el-form-item label="退款原因:">
                <el-input v-model="dform.reason" placeholder="非必填，若填写将展示在用户退款信息中"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </template>
        <template v-if="dialogType == 6">
          <div class="pl-20 pr-20 text-black">
            <div class="mb-15">用户信息</div>
            <div class="flex align-center pb-20 l-b">
              <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
              <div class="pl-20">
                <div class="flex">
                  <div class="label-text">用户名:</div>
                  <div>{{ curRow.userNickName }}</div>
                  <div class="ml-50 label-text">用户ID:</div>
                  <div>{{ curRow.userId }}</div>
                </div>
                <div class="flex mt-10">
                  <div class="label-text">手机号码:</div>
                  <div v-if="isBrand() || isSaas()">{{ curRow.userMobile || '无' }}</div>
                  <div v-else>{{ dealPhone(curRow.userMobile) || '无' }}</div>
                </div>
              </div>
            </div>

            <div class="mt-20 mb-15">
              订单信息
              <el-tag
                class="ml-10"
                :type="curRow.status > 2 || curRow.status == -1 ? 'danger' : 'success'"
                size="mini"
                effect="dark">
                {{ Constant.OrderStatus ? Constant.OrderStatus[curRow.status] : "已完成" }}
              </el-tag>
            </div>
            <div class="flex pb-20 l-b">
              <div>
                <div class="pb-10 l-b-dashed">
                  <div class="flex mb-10">
                    <div class="label-text">订单号:</div>
                    <div>{{ curRow.orderNo }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">设备类型:</div>
                    <div>{{ curRow.deviceType }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">设备二维码:</div>
                    <div>{{ curRow.deviceSn }}</div>
                  </div>
                  <div class="flex" v-if="curRow.returnStore">
                    <div class="label-text">归还设备:</div>
                    <div>{{ curRow.afterDeviceSn || '--' }}</div>
                  </div>
                </div>
                <div class="mt-10">
                  <div class="flex mb-10">
                    <div class="label-text">开始时间:</div>
                    <div>{{ curRow.chargeStartTime }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">订单来源:</div>
                    <div>
                      <span v-if="curRow.sourceType == 3">后台</span>
                      <i class="fs-a1 iconfont icon-weixin1 text-green" v-else-if="curRow.sourceType == 1"></i>
                      <i class="fs-a1 iconfont icon-zhifubao text-primary" v-else></i>
                    </div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">套餐:</div>
                    <div class="text-cut">
                      <el-tooltip :content="showFeeMode(curRow.feeType, curRow.feeMode)" placement="top">
                        <span>{{ showFeeMode(curRow.feeType, curRow.feeMode) }}</span>
                      </el-tooltip>
                    </div>
                  </div>
                  <div class="flex">
                    <div class="label-text">退款:</div>
                    <div>{{ curRow.amountRefund || '0.00' }}</div>
                  </div>
                </div>
              </div>
              <div>
                <div class="pl-20 pb-10 l-b-dashed">
                  <div class="flex mb-10">
                    <div class="label-text">交易单号:</div>
                    <div>{{ curRow.transactionNo || '--' }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">租借商户:</div>
                    <div>{{ curRow.storeName }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">宝SN:</div>
                    <div>{{ curRow.terminalId || '--' }}</div>
                  </div>
                  <div class="flex" v-if="curRow.returnStore">
                    <div class="label-text">归还商户:</div>
                    <div>{{ curRow.returnStore.name }}</div>
                  </div>
                </div>
                <div class="pl-20 mt-10">
                  <div class="flex mb-10">
                    <div class="label-text">结束时间:</div>
                    <div>{{ curRow.chargeEndTime || '--' }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">支付类型:</div>
                    <div>{{ Constant.PayType ? Constant.PayType[curRow.payType] : '--' }}</div>
                  </div>
                  <div class="flex mb-10">
                    <div class="label-text">收益:</div>
                    <div>{{ curRow.amount || '0.00' }}</div>
                  </div>
                  <div class="flex">
                    <div class="label-text">备注:</div>
                    <div>
                      <template v-if="curRow.freeTime > 0">
                        <span class="mr-5" v-if="curRow.freeUser == 1">免费名额：{{ parseInt(curRow.freeTime) / 60 }}小时</span>
                        <span class="mr-5" v-else>{{ scope.freeTime == 600000 ? '会员卡订单' : `会员卡免费${curRow.freeTime}分钟` }}</span>
                      </template>
                      <span>{{ curRow.remark ? curRow.remark: curRow.freeTime ? '' : '--' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <template v-if="!isStore()">
            <div class="mt-20 mb-15">订单流程</div>
            <div class="flex pb-20 timeline-box white-space text-center l-b">
              <div class="rel pt-30 timeline-item el-icon-"
                v-for="(item, index) in dform.orderFlow">
                <div class="pl-10 pr-10">
                  <el-tooltip :content="item.reason || '无'" placement="top">
                    <div class="text-cut">{{ item.event }}</div>
                  </el-tooltip>
                  <div class="mt-10 fs-s2 text-gray">{{ item.createTime }}</div>
                </div>
              </div>
            </div>
            </template>

            <template v-if="dform.orderDivide && dform.orderDivide.length > 0">
              <div class="mt-20 mb-15">分成明细</div>
              <el-table border :data="dform.orderDivide" :span-method="fenRunSpanMethod" class="custom">
                <el-table-column label="订单金额" align="center">
                  <template slot-scope="scope">
                    {{ dform.amountPaid }}元
                  </template>
                </el-table-column>
                <el-table-column width="160" label="分成人" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.dividerName }}
                  </template>
                </el-table-column>
                <el-table-column label="分成比例" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.percent }}%
                  </template>
                </el-table-column>
                <el-table-column width="120" label="分成金额(元)" align="center">
                  <template slot-scope="scope">
                    <span>{{ accSub(scope.row.amount, scope.row.loseAmount) }}</span>
                    <span v-if="scope.row.costAmount > 0">(包含超时成本{{ scope.row.costAmount }}元)</span>
                  </template>
                </el-table-column>
                <el-table-column width="120" label="DD金额(元)" align="center" v-if="dform.amountPaidLose > 0">
                  <template slot-scope="scope">
                    {{ scope.row.loseAmount || '--' }}
                  </template>
                </el-table-column>
                <el-table-column label="分成类型" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.dividerPaymentType == 2 ? '微信' : '余额' }}
                  </template>
                </el-table-column>
                <el-table-column label="分成状态" align="center">
                  <template slot-scope="scope">
                    {{ scope.row.dividerPaymentStatus == 0 ? '分成进行中' : scope.row.dividerPaymentStatus == -1 ? '分成失败' : scope.row.dividerPaymentStatus == -2 ? '分账回退失败' : '已分成'  }}
                  </template>
                </el-table-column>
                <el-table-column width="120" label="退款金额(元)" align="center">
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
            <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
            <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
          </div>
        </template>
      </el-drawer>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import TableColumnSet from '@/components/TableColumnSet/index'
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
      selectSearch
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
        orderTab: [{
            value: 0,
            title: '全部',
            nkey: 'orderNumber'
          },
          {
            value: 'R',
            title: '进行中',
            nkey: 'rentingNumber'
          },
          {
            value: 'today',
            title: '今日订单',
            nkey: 'todayNumber'
          },
          {
            value: 'O',
            title: '已完成',
            nkey: 'doneNumber'
          },
          {
            value: 'OT',
            title: '超时订单',
            nkey: 'expiredNumber'
          },
          {
            value: 'F',
            title: '租借失败',
            nkey: 'rentFailedNumber'
          },
          {
            value: 'OHW',
            title: '扣款失败',
            nkey: 'payFailedNumber'
          }
        ],

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

        queryObj: {
          orderNo: {
            title: '订单号',
            type: 'input'
          },
          idLastNine: {
            title: '用户ID',
            type: 'selectSearch',
            name: 'idLastNine',
            sType: 1
          },
          userIds: {
            title: '用户昵称',
            type: 'selectSearch',
            name: 'nickname',
            sType: 2
          },
          userId: {
            title: '手机号码',
            type: 'selectSearch',
            name: 'mobile',
            sType: 1
          },
          storeId: {
            title: '商户名称',
            type: 'selectSearch',
            name: 'name',
            sType: 3
          },
          deviceSn: {
            title: '设备二维码',
            type: 'input'
          },
          transactionNo: {
            title: '交易单号',
            type: 'input'
          },
          sourceType: {
            title: '订单来源',
            type: 'select',
            selectArr: []
          },
          payType: {
            title: '支付类型',
            type: 'select',
            selectArr: []
          }
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
        dialogTitle: {
          1: '结束订单',
          2: '订单退款',
          3: '取消支付分订单',
          4: '订单使用用户',
          5: '免押待付款订单0元完结',
          6: '订单详情',
          7: 'DD恢复',
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
        defaultColumn: [
          {
            key: 'userNickName',
            val: true,
            name: '用户信息'
          },
          {
            key: 'userId',
            val: true,
            name: '用户ID'
          },
          {
            key: 'userMobile',
            val: true,
            name: '手机号码'
          },
          {
            key: 'deviceType',
            val: true,
            name: '类型'
          },
          {
            key: 'storeName',
            val: true,
            name: '商户名称'
          },
          {
            key: 'sourceType',
            val: true,
            name: '来源'
          },
          {
            key: 'PayType',
            val: true,
            name: '支付类型'
          },
          {
            key: 'chargeStartTime',
            val: true,
            name: '时间'
          },
          {
            key: 'deviceSn',
            val: true,
            name: '二维码'
          },
          {
            key: 'feeMode',
            val: true,
            name: '套餐'
          },
          {
            key: 'amount',
            val: true,
            name: '收益'
          },
          {
            key: 'amountRefund',
            val: true,
            name: '退款'
          },
          {
            key: 'status',
            val: true,
            name: '状态'
          },
          {
            key: 'remark',
            val: true,
            name: '备注'
          },
          {
            key: 'orderNo',
            val: true,
            name: '订单号'
          },
          {
            key: 'transactionNo',
            val: true,
            name: '交易单号'
          }
        ]
      }
    },
    mounted() {
      let query = this.$route.query
      this.queryKey = ['storeId', 'agentId', 'brandId', 'deviceSn', 'sourceType', 'userId']
      for (var i in this.queryKey) {
        if (query[this.queryKey[i]]) this[this.queryKey[i]] = query[this.queryKey[i]]
      }
      this.queryObj.sourceType.selectArr = this.Constant.SourceType
      this.queryObj.payType.selectArr = this.Constant.PayType
      if(this.isSaas()){
        this.$set(this.queryObj, 'brandId', {
          title: '品牌名称',
          type: 'selectSearch',
          name: 'name',
          sType: 6
        })
      }
      this.toQuery()
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
        }
        if(this.lowerAgent != 'ALL') params.lowerAgent = this.lowerAgent || false
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
        if(this.lowerAgent != 'ALL') params.lowerAgent = this.lowerAgent || false
        this.$get(url, params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          this.listTotal = res.total
          if (params.page == 0) {
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 55
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
            } else if (dialogType == 6) {
              this.$get('iot-saas-order/admin/order/detail', {
              	orderNo: row.orderNo
              }).then(res => {
              	if(res.devicePopupRecordFeignOutFeign && res.status != 'R'){
                  this.$set(this.curRow, 'terminalId', res.devicePopupRecordFeignOutFeign.terminalId)
                  this.$set(this.curRow, 'afterDeviceSn', res.devicePopupRecordFeignOutFeign.afterDeviceSn)
                  if(res.devicePopupRecordFeignOutFeign.afterStoreId){
                    this.$post('iot-saas-order/api/order/getDeductions', {
                      deductionType: 0,
                      deductionIds: [res.devicePopupRecordFeignOutFeign.afterStoreId]
                    }).then(res => {
                      this.$set(this.curRow, 'returnStore', res[0])
                    })
                  }
              	}
              })
              this.$get('iot-saas-order/admin/order/detail/flow', {
                orderNo: row.orderNo
              }).then(res => {
                this.$set(this.dform, 'orderFlow', res)
                if (row.status.indexOf('O') > -1 && row.amount > 0) {
                  this.$get('iot-saas-order/admin/order/detail/divide', {
                    orderNo: row.orderNo
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
                  })
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
                  message: '宝已归还',
                  type: 'success'
                })
              } else {
                this.$message({
                  message: '宝还未归还，未查询到归还记录',
                  type: 'error'
                })
              }
            })
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
            if (!params.chargeEndTime) {
              this.$message({
                message: '请选择订单结束时间',
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
                message: '结束订单成功',
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
            if (!params.amount) {
              this.$message({
                message: '请输入退款金额',
                type: 'error'
              })
              return
            }
            params.orderNo = this.curRow.orderNo
            this.$post('iot-saas-order/admin/order/refund', params).then(res => {
              this.$message({
                message: '订单退款成功',
                type: 'success'
              })
              curRow.status = 'OTD'
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
                message: '请输入订单号',
                type: 'error'
              })
              this.clickSubmit = false
              return
            } else if (!params.reason) {
              this.$message({
                message: '请输入取消原因',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            this.$post('iot-saas-order/admin/order/cancel', params).then(res => {
              this.$message({
                message: '取消成功',
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
                message: '请输入订单号',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-order/admin/deposit/execute', {
              orderNoList: [params.orderNo]
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 7:
            if (!params.orderNo) {
              this.$message({
                message: '请输入订单号',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-order/admin/order/lose/recover', {
              orderNo: params.orderNo
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
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
  .remark-box {
    max-height: 80px;
  }

  /deep/ .order-no {
    .el-input__inner {
      padding-right: 0;
    }
  }

  .timeline-box{
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
      &:last-child{
        &::before{
          color: var(--orange);
        }
        &::after{
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
