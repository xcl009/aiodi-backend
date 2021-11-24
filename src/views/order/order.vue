<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.device_type" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'-1'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in deviceNameObj" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-form-item label="订单单号:">
          <el-input v-model="form.order_sn" />
        </el-form-item>
        <el-form-item label="手机号码:">
          <el-input v-model="form.custom_mobile" />
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-sm-and-down">
          <el-input v-model="form.search_uid" />
        </el-form-item>
        <el-form-item label="商户名称:" class="hidden-md-and-down">
          <el-input v-model="form.store_name" />
        </el-form-item>
        <el-form-item label="设备SN:" class="hidden-lg-and-down">
          <el-input v-model="form.goods_sn" />
        </el-form-item>
        <el-form-item label="交易单号:" class="hidden-xg-and-down">
          <el-input v-model="form.transaction_id" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :disabled="clickSubmit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-tooltip class="item" effect="dark" content="选择开始时间和结束时间,点击查询后即可导出该时间段内的订单" placement="top">
            <el-button type="primary" plain @click="outTable()">导出<i class="el-icon-male el-icon--right" /></el-button>
          </el-tooltip>
        </el-form-item>
      </template>
      <template v-slot:more>
        <sel-plat v-if="checkRoles(['terminal'])" :listQuery="listQuery" @change="toQuery()"></sel-plat>
        <el-form-item label="订单归属:" v-if="listQuery.son_id > 0">
          <el-select v-model="listQuery.search_user_type" @change="toQuery()">
            <el-option label="代理本人" :value="0" />
            <el-option label="代理下级" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单来源:">
          <el-select v-model="listQuery.mini_type" @change="toQuery()">
            <el-option label="全部" value="0" />
            <el-option label="微信" value="1" />
            <el-option label="支付宝" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付类型:">
          <el-select v-model="listQuery.pay_type" @change="toQuery()">
            <el-option label="全部" value="0" />
            <el-option label="押金" value="1" />
            <el-option label="免押" value="2" />
            <el-option label="余额" value="3" />
            <el-option label="储值卡" value="4" />
            <el-option label="会员卡" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-md-and-up">
          <el-input v-model="form.search_uid" />
        </el-form-item>
        <el-form-item label="商户名称:" class="hidden-lg-and-up">
          <el-input v-model="form.store_name" />
        </el-form-item>
        <el-form-item label="设备SN:" class="hidden-xg-and-up">
          <el-input v-model="form.goods_sn" />
        </el-form-item>
        <el-form-item label="交易单号:" class="hidden-xl-only">
          <el-input v-model="form.transaction_id" />
        </el-form-item>
        <el-form-item label="用户昵称:">
          <el-input v-model="form.custom_nick_name" />
        </el-form-item>
        <el-form-item label="商户单号:">
          <el-input v-model="form.out_order_no" />
        </el-form-item>
        <el-form-item label="行业分类:">
          <el-cascader v-model="cat_id" :options="categoryList" :show-all-levels="false"
            :props="{ expandTrigger: 'hover' }" />
        </el-form-item>
        <el-form-item label="所在地区:">
          <el-cascader v-model="search_regions_tag" :options="areaList" :show-all-levels="false"
            :props="{ expandTrigger: 'hover', checkStrictly: true }" />
        </el-form-item>
        <el-form-item label="时间筛选:">
          <div class="flex">
            <el-date-picker v-model="form.begin" type="datetime" placeholder="开始" value-format="timestamp"
              style="width: 100%;" :picker-options="beginOptions" />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker v-model="form.end" type="datetime" placeholder="结束" value-format="timestamp"
              style="width: 100%;" :picker-options="endOptions" />
          </div>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="flex bg-white">
        <div class="flex1">
          <el-tabs v-model="listQuery.order_type" class="" type="card" @tab-click="typeClick">
            <el-tab-pane :label="`全部(${numInfo.total_order_num || 0})`" name="4" />
            <el-tab-pane :label="`使用中(${numInfo.renting_order_num || 0})`" name="1" />
            <el-tab-pane :label="`今日订单(${numInfo.today_order_num || 0})`" name="0" />
            <el-tab-pane :label="`已完成(${numInfo.finish_order_num || 0})`" name="2" />
            <el-tab-pane :label="`超时订单(${numInfo.overtime_order_num || 0})`" name="3" />
            <el-tab-pane :label="`租借失败(${numInfo.fail_order_num || 0})`" name="5" />
            <el-tab-pane :label="`扣款失败(${numInfo.deduction_failed_num || 0})`" name="7" />
            <el-tab-pane :label="`申请退款(${numInfo.refund_apply_num || 0})`" name="8" />
            <el-tab-pane :label="`DD(${numInfo.stealed_order_num || 0})`" name="9"
              v-if="agentInfo.steal_order_right == 1" />
          </el-tabs>
        </div>
        <div class="scan-code_btn">
          <el-button type="primary" size="small" plain
            @click="deviceSortArr = JSON.parse(JSON.stringify(agentDevice)); deviceSortDialog = true; deviceSort()">排序设置
          </el-button>
          <el-button type="primary" size="small" plain @click="stealDel()" v-if="checkRoles(['terminal', 'partner'])">
            DD恢复</el-button>
          <el-button type="primary" size="small" plain @click="$router.push({path: `/order/scanCode`})"
            v-if="!checkRoles(['merchants'])">扫码记录</el-button>
          <el-button type="danger" size="small" plain @click="deliver()"
            v-if="checkRoles(['partner']) && listQuery.order_type == 3">批量发货</el-button>
        </div>
      </div>

      <div class="bg-white">
        <el-table class="ptd-5" id="order_table" ref="order_table" v-loading="listLoading" :data="list"
          :max-height="tableMaxH" stripe highlight-current-row element-loading-text="Loading"
          @selection-change="selOrder">
          <el-table-column type="selection" v-if="checkRoles(['partner']) && !outStatus" :selectable="checkSel" width="50"/>
          <el-table-column label="品牌商" v-if="checkRoles(['terminal'])">
            <template slot-scope="scope">
              {{ oemInfo[scope.row.agent_id] ? oemInfo[scope.row.agent_id].mini_name : '' }}
            </template>
          </el-table-column>
          <el-table-column label="小程序ID" v-if="outStatus">
            <template slot-scope="scope">
              <div>{{ scope.row.appid }}</div>
            </template>
          </el-table-column>
          <el-table-column label="订单号" width="140">
            <template slot-scope="scope">
              {{ scope.row.order_sn }}
            </template>
          </el-table-column>
          <el-table-column label="交易单号" width="142">
            <template slot-scope="scope">
              <div>{{ scope.row.transaction_id }}</div>
            </template>
          </el-table-column>
          <el-table-column label="商户单号" width="142">
            <template slot-scope="scope">
              {{ scope.row.out_order_no }}
            </template>
          </el-table-column>
          <el-table-column label="类型" width="90">
            <template slot-scope="scope">
              {{ scope.row.goods_name }}
            </template>
          </el-table-column>
          <el-table-column label="来源" width="70">
            <template slot-scope="scope">
              {{ scope.row.mini_type == 1 ? "微信" : "支付宝" }}
            </template>
          </el-table-column>
          <el-table-column label="支付类型" width="100">
            <template slot-scope="scope">
              <div class="fs-s3">{{ scope.row.deposit_status }}</div>
            </template>
          </el-table-column>
          <el-table-column label="用户ID" width="70">
            <template slot-scope="scope">
              {{ scope.row.uid }}
            </template>
          </el-table-column>
          <el-table-column label="用户" width="150">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar class="mr-5" :size="25" :src="scope.row.user_avatar" v-if="!outStatus"/>
                <div class="flex1">
                  <div v-if="config.system_other.order_amount_show || checkRoles(config.system_other.have_role)">
                    {{ scope.row.user_mobile }}
                  </div>
                  <div v-else="config.system_other.order_amount_show">{{ dealPhone(scope.row.user_mobile) }}</div>
                  <div class="text-cut">{{ scope.row.user_nick_name || "--" }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商户" min-width="180">
            <template slot-scope="scope">
              <div class="flex">
                <div>租用：</div>
                <div class="flex1">{{ scope.row.rent_store || '--' }}</div>
              </div>
              <div class="flex" v-if="scope.row.depend_type == 0">
                <div>归还：</div>
                <div class="flex1">{{ scope.row.back_store || '--' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="200">
            <template slot-scope="scope">
              <div>开始：{{ scope.row.charge_start || "--" }}</div>
              <div>结束：{{ scope.row.charge_end || "--" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="设备SN码" width="220">
            <template slot-scope="scope">
              <div>二维码：{{ scope.row.zuo_sn || "--" }}</div>
              <div>设备SN：{{ scope.row.device_id || "--" }}</div>
              <div class="text-cut cursor text-blue" v-if="scope.row.depend_type == 0"
                @click="checkBao(scope.row.goods_sn)">宝SN码：{{ scope.row.goods_sn || "--" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="套餐" width="150">
            <template slot-scope="scope">
              {{ scope.row.rent_desc || "--" }}
            </template>
          </el-table-column>
          <el-table-column label="收益(元)" width="75" style="padding: 0;"
            v-if="config.system_other.order_amount_show || checkRoles(config.system_other.have_role)">
            <template slot-scope="scope">
              <el-link type="success">{{ scope.row.money_paid || "--" }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="退款(元)" width="75"
            v-if="config.system_other.order_amount_show || checkRoles(config.system_other.have_role)">
            <template slot-scope="scope">
              <el-link type="success">{{ scope.row.refund_drawbacked }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="70">
            <template slot-scope="scope">
              <el-link :type="scope.row.order_status > 2 || scope.row.order_status == -1 ? 'danger' : 'success'">
                {{ orderStatus[scope.row.order_status] || "--" }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="150">
            <template slot-scope="scope">
              <div class="remark-box">
                <div class="fs-s4 text-danger" v-if="scope.row.steal_type_des">{{ scope.row.steal_type_des }}</div>
                <el-link type="danger" v-if="scope.row.remark">{{ scope.row.remark }}</el-link>
                <div v-if="scope.row.delivery_status == 2" class="fs-s4">快递单号：{{ scope.row.delivery_sn }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110" :fixed="device == 'desktop' ? 'right' : false" v-if="!outStatus">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" plain round @click="getOrderDetail(scope.row)" class="ml-10"
                v-if="(config.system_other.order_amount_show || checkRoles(config.system_other.have_role)) && agentInfo.business_type != 1">订单详情
              </el-button>
              <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status == 1"
                @click="upApply(scope.row, 1)">通过申请</el-button>
              <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status == 1"
                @click="upApply(scope.row, 0)">驳回申请</el-button>
              <el-button type="primary" size="mini" plain round v-if="scope.row.refund_apply_status > 0"
                @click="refundInfo(scope.row)">退款详情</el-button>
              <template v-if="scope.row.refund_apply_status != 1">
                <el-button type="primary" size="mini" plain round
                  v-if="agentInfo.drawback_order == 1 && scope.row.money_paid > 0 && (!scope.row.refund_drawbacked || scope.row.refund_drawbacked == 0) && listQuery.order_type != 7"
                  @click="refundDialog = true; order = scope.row; refundObj.refund_money = ''; refundObj.refund_2_balance = siteInfo.drawbacke_2_balance;">订单退款</el-button>
                <el-button type="primary" size="mini" plain round v-if="checkRoles(['terminal']) && listQuery.order_type == 7 && scope.row.mini_type == 1 && scope.row.free_pay_status == 3"
                  @click="cancelZFF(scope.row)">取消服务</el-button>
                <el-button type="primary" size="mini" plain round
                  v-if="(scope.row.order_status == 1 || scope.row.order_status == 0) && agentInfo.finish_order == 1"
                  @click="endOrder(1, scope.row)">结束订单</el-button>
                <el-button type="danger" size="mini" plain round
                  v-if="checkRoles(['partner']) && scope.row.delivery_status == 1" @click="deliver(scope.row)">立即发货
                </el-button>
              </template>
              <el-button type="primary" size="mini" plain round
                v-if="checkRoles(['partner', 'terminal']) && listQuery.order_type == 7"
                @click="deduct(scope.row)">立即扣款</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center" v-if="!outStatus">
          <pagination
            :total="(list.length == listQuery.limit ? (listQuery.start + 1) * listQuery.limit : listQuery.start * listQuery.limit)"
            :page.sync="listQuery.start" :limit.sync="listQuery.limit" layout='sizes, prev, pager, next, jumper'
            @pagination="getList" />
        </div>
      </div>

      <el-dialog title="订单详情" :visible.sync="detailDialog">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in order.operate_flow" :key="index" placement="top"
            :timestamp="item.date">
            <div>{{ item.event }} ---> {{ item.result }}</div>
            <div v-if="item.reason" class="mt-5">
              <el-link type="danger">{{ item.reason }}</el-link>
            </div>
          </el-timeline-item>
        </el-timeline>

        <template v-if="siteInfo.order_profits_detail_show == 1 || checkRoles(config.system_other.have_role)">
          <div class="mt-10 mb-15 text-center">分成明细：{{ order.money_paid }}</div>
          <div class="flex mb-10 text-center">
            <div class="flex1">分成人</div>
            <div class="flex1">分成比例</div>
            <div class="flex1">分成金额</div>
            <div class="flex1">退款金额</div>
          </div>
          <template v-for="item in order.agents_profit">
            <div class="flex mb-10 text-center" v-if="item.agent_level >= agentInfo.agent_level">
              <div class="flex1">{{ item.agent_name }}：{{ item.parent_name }}</div>
              <div class="flex1">{{ item.profit_percent }}</div>
              <div class="flex1">{{ item.get_profit }}元</div>
              <div class="flex1">{{ item.drawback_profit }}元</div>
            </div>
          </template>
        </template>
      </el-dialog>

      <el-dialog title="结束订单" :visible.sync="endOrderDialog">
        <el-form label-width="140px">
          <el-form-item :label="order.depend_type == 0 ? '归还时间：' : '结束时间：'" prop="name">
            <el-date-picker v-model="endOrderObj.return_time" type="datetime" value-format="timestamp"
              style="width: 100%;" :placeholder="order.depend_type == 0 ? '归还时间：' : '结束时间：'"
              :picker-options="endOptions" />
          </el-form-item>
          <el-form-item label="检测设备是否归还：" v-if="order.depend_type == 0">
            <el-switch v-model="endOrderObj.check_bao_backed" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="endOrderDialog = false">取 消</el-button>
          <el-button type="primary" @click="endOrder(2, order)" :disabled="clickSubmit">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="订单退款" :visible.sync="refundDialog">
        <el-form label-width="130px">
          <el-form-item label="退款方式：">
            <el-radio-group v-model="refundObj.refund_2_balance">
              <el-radio :label="1">退回小程序钱包</el-radio>
              <el-radio :label="0">原路退回</el-radio>
              <el-radio :label="2" v-if="order.pay_type == 1 && order.pay_deposite_yuan == order.fund_deposite_yuan">全部押金原路退回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="退款金额：" v-if="refundObj.refund_2_balance != 2">
            <el-input v-model="refundObj.refund_money">
              <template slot="append">元<span
                  class="el-link el-link--danger">（最多{{ order.money_paid }}元）</span></template>
            </el-input>
          </el-form-item>
          <el-form-item label="退款原因：">
            <el-input v-model="refundObj.refund_reason" type="textarea" />
            <div class="fs-s2 text-gray">注：非必填信息，若填写将展示在下发给用户的退款消息中。</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="refundDialog = false">取 消</el-button>
          <el-button type="primary" @click="refundOrder(order)" :disabled="clickSubmit">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="宝详情" :visible.sync="baoDialog" top="36vh" width="600px">
        <el-table :data="baoList">
          <el-table-column label="SN">
            <template slot-scope="scope">
              <div>底座：{{ scope.row.device_id }}</div>
              <div>宝：{{ scope.row.B1 }}</div>
            </template>
          </el-table-column>
          <el-table-column label="基本信息">
            <template slot-scope="scope">
              <div>槽口：{{ scope.row.B2 }}</div>
              <div>电量：{{ scope.row.B3 }}%</div>
              <div>电线：{{ scope.row.B4 == 0 ? '正常' : '故障'}}</div>
              <div>电池：{{ scope.row.B5 == 0 ? '正常' : '故障'}}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-link type="danger">{{ baoStatus[scope.row.status] }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="弹出次数" width="80">
            <template slot-scope="scope">
              {{ scope.row.used_num }}
            </template>
          </el-table-column>
          <el-table-column label="最新时间" width="100">
            <template slot-scope="scope">
              {{ parseTime(scope.row.updated, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <el-dialog title="退款详情" :visible.sync="washRefundDialog">
        <div class="mt-10 mb-15"><span class="text-gray">退款状态：</span>{{ refundStatus[washRefund.refund_status] }}</div>
        <div class="mt-10 mb-15" v-if="washRefund.refuse_reason"><span
            class="text-gray">拒绝原因：</span>{{ washRefund.refuse_reason }}</div>
        <div class="mt-10 mb-15"><span class="text-gray">手机号码：</span>{{ washRefund.mobile }}</div>
        <div class="mt-10 mb-15"><span class="text-gray">退款金额：</span>{{ washRefund.refund_money }}元</div>
        <div class="flex mt-10 mb-15">
          <div class="text-gray">问题描述：</div>
          <div class="flex1">{{ washRefund.refund_reason || '未填写' }}</div>
        </div>
        <div class="flex mt-10 mb-15">
          <div class="text-gray">错误截图：</div>
          <div class="flex1">
            <el-image class="mr-5" v-for="item in washRefund.refund_img_url" style="width: 50px; height: 50px"
              :src="item" :preview-src-list="washRefund.refund_img_url">
            </el-image>
          </div>
        </div>
      </el-dialog>

      <el-dialog :visible.sync="excel" :close-on-click-modal="false" :close-on-press-escape="false" title="导出加载进度"
        width="240px">
        <div class="text-center">
          <el-progress type="circle" :percentage="percentage"></el-progress>
        </div>
      </el-dialog>

      <el-dialog title="设备排序设置-拖拽排序" :visible.sync="deviceSortDialog" width="400px">
        <el-table ref="dragDevice" :data="deviceSortArr" row-key="depend_type" border fit highlight-current-row
          :show-header="false">
          <el-table-column align="center" label="设备类型">
            <template slot-scope="{row}">
              <span class="cursor">{{ row.depend_name }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="deviceSortDialog = false">取 消</el-button>
          <el-button type="primary" @click="postDeviceSort(2, order)">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  import selPlat from '@/components/selPlat'
  import {
    swapItems,
    dealPhone
  } from '@/utils/index'

  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  import Sortable from 'sortablejs'
  export default {
    name: 'Order',
    components: {
      Pagination,
      drawer,
      selPlat
    },
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    computed: {
      xlsxName: function() {
        let xlsxName = '订单记录';
        let b = '';
        let e = ''
        if (this.form.begin) {
          b = this.parseTime(this.form.begin / 1000, '{y}.{m}{d}')
        }
        if (this.form.end) {
          e = this.parseTime(this.form.end / 1000, '{y}.{m}{d}')
        }
        if (b && e) {
          xlsxName = b + '-' + e
        } else if (b || e) {
          xlsxName = b || e
        }
        return xlsxName
      },
      device() {
        return this.$store.state.app.device
      },
      deviceNameObj() {
        return this.$store.state.user.deviceNameObj
      },
      deviceKeyObj() {
        return this.$store.state.user.deviceKeyObj
      },
      agentDevice() {
        return this.$store.state.user.agentDevice
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
        dealPhone: dealPhone,
        drawer: true,
        cat_id: [],
        search_regions_tag: [],
        categoryList: [],
        areaList: [],
        form: {
          cat_id: '',
          search_regions_tag: '',
          order_sn: this.$route.query.order_sn || '',
          search_uid: this.$route.query.search_uid || '',
          goods_sn: this.$route.query.goods_sn || '',
          store_name: this.$route.query.store_name || '',
          transaction_id: this.$route.query.transaction_id || ''
        },
        numInfo: {},
        tableMaxH: '250',
        oemInfo: {},
        list: [],
        listLoading: true,
        listQuery: {
          device_type: '-1',
          search_user_type: 0,
          son_id: this.$route.query.son_id || '',
          order_type: this.$route.query.order_type || '4',
          mini_type: this.$route.query.mini_type || '0',
          search_goods_id: this.$route.query.search_goods_id || '',
          pay_type: '0',
          type: 1,
          start: 1,
          limit: 50
        },
        orderStatus: {
          '-1': '待支付',
          0: '未启动',
          1: '进行中',
          2: '已完成',
          3: '手动完结',
          4: '异常',
          5: '超时完成'
        },
        beginOptions: {
          disabledDate: (time) => {
            if (this.form.end) {
              return time.getTime() > this.form.end || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
            }
          }
        },
        endOptions: {
          disabledDate: (time) => {
            if (this.form.begin) {
              return time.getTime() < this.form.begin || time.getTime() > new Date(new Date().toLocaleDateString())
                .getTime()
            } else {
              return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
            }
          }
        },
        orderNum: {},
        order: {},
        selID: [],

        // 结束订单
        endOrderDialog: false,
        endOrderObj: {
          return_time: '',
          check_bao_backed: true
        },

        // 订单详情
        detailDialog: false,

        // 订单退款
        refundDialog: false,
        refundObj: {
          refund_2_balance: 1,
          refund_money: ''
        },
        sort_id_key: this.$route.query.sort_id_key || false,

        //宝信息
        baoDialog: false,
        baoList: [],
        baoStatus: ['未弹出', '准备弹出', '已弹出', '有异物', '充电口有异常'],

        // 退款详情
        washRefundDialog: false,
        washRefund: {},
        refundStatus: {
          1: '申请中',
          2: '已拒绝',
          3: '已通过',
          4: '已退款'
        },

        outStatus: false,
        excel: false,
        percentage: 0,
        wbout: {},
        wi: 0,

        // 设备类型排序
        deviceSortArr: [],
        deviceSortDialog: false
      }
    },
    mounted(options) {
      this.listQuery.search_user_type = this.user_type
      this.getOrderNum()
      this.getList()
      this.getCategory()
      this.getArea()
    },
    methods: {
      /**
       * 订单数量
       */
      getOrderNum() {
        const listQuery = Object.assign({}, this.listQuery, this.form)
        if (listQuery.begin) listQuery.begin = this.parseTime(listQuery.begin, '{y}-{m}-{d}')
        if (listQuery.end) listQuery.end = this.parseTime(listQuery.end, '{y}-{m}-{d}')
        this.$get('agentapi/order_data_stat_num', listQuery).then(res => {
          this.numInfo = res
        })
      },

      /**
       * 校验是否可选
       */
      checkSel(row) {
        return row.delivery_status == 1
      },


      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.listQuery.order_type = tab.name
        this.listQuery.start = 1
        this.getList()
      },

      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.$refs.filterDrawer.hide()
        if (type == 1) {
          this.form = {}
          this.listQuery.start = 1
          this.listQuery.limit = 10
        } else {
          if (this.cat_id && this.cat_id.length > 0) {
            this.form.cat_id = this.cat_id[this.cat_id.length - 1]
          }
          if (this.search_regions_tag && this.search_regions_tag.length > 0) {
            this.form.search_regions_tag = this.search_regions_tag[this.search_regions_tag.length - 1]
          }
          this.listQuery.start = 1
          this.listQuery.total = 50
        }
        if (this.outStatus) this.outStatus = false
        this.getOrderNum()
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.start - 1
        })
        if (params.end && params.begin) {
          if (params.end - params.begin > 180 * 24 * 60 * 60 * 1000) {
            this.$message.error('筛选时间维度不可超过180天')
            this.clickSubmit = false
            return
          }
          params.page_switch = 1
        } else if (params.order_type == 0) {
          params.begin = new Date(new Date().setHours(0, 0, 0, 0)) / 1000
          params.end = params.begin + 86400
          params.order_type = 4
        }
        if (params.begin) params.begin = this.parseTime(params.begin, '{y}-{m}-{d}')
        if (params.end) params.end = this.parseTime(params.end, '{y}-{m}-{d}')
        if (params.device_type == -1) delete params.device_type
        if (this.sort_id_key && window.sort_id_key) params.sort_id_key = window.sort_id_key
        this.$get('agentapi/search/query_orders_new', params).then(res => {
          if (this.outStatus) {
            this.list = res.list
            if (params.limit > res.list.length) {
              this.listLoading = false
              this.percentage = 100
            } else {
              this.listQuery.start++
              this.percentage = this.percentage < 96 ? this.percentage + 2 : 96
            }
            this.$nextTick(() => {
              this.outTabdd('order_table', this.xlsxName)
            })
          } else {
            this.listLoading = false
            this.list = res.list
          }
          this.clickSubmit = false
          this.tableMaxH = window.innerHeight - this.$refs.order_table.$el.offsetTop - 80
          if(this.checkRoles(['terminal'])) this.getOEMInfo(this.arrayKeys(res.list, 'agent_id'))
          this.postSetRecode(params.order_type)
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 品牌信息
       */
      getOEMInfo(aids = []) {
        this.$get('commonapi/configer/these_platform_info', {
          son_aids: JSON.stringify(aids)
        }).then(res => {
          this.oemInfo = res.list
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
       * 手动结束订单
       */
      endOrder(type, row) {
        if (type == 1) {
          this.order = row
          this.endOrderObj.return_time = Date.parse(new Date())
          this.endOrderDialog = true
        } else {
          this.$alert('确定结束此订单吗？', '结束订单', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == 'confirm') {
                this.clickSubmit = true
                this.$get('agentapi/business/manual_finish_order', {
                  order_id: row.order_id,
                  bao_sn: row.goods_sn,
                  return_time: (this.endOrderObj.return_time / 1000),
                  check_bao_backed: (this.endOrderObj.check_bao_backed ? 1 : 0)
                }).then(res => {
                  this.endOrderDialog = false
                  this.order = {}
                  this.clickSubmit = false
                  this.$message({
                    message: '结束成功',
                    type: 'success'
                  })
                  row.order_status = 3
                }).catch(err => {
                  this.clickSubmit = false
                })
              }
            }
          })
        }
      },

      /**
       * 选择订单
       */
      selOrder(list) {
        let selID = []
        list.map(item => {
          selID.push(item.order_id)
        })
        this.selID = selID
      },

      /**
       * 发货
       */
      deliver(row) {
        let order_id = row ? [row.order_id] : this.selID
        if (order_id.length == 0) {
          this.$message({
            message: '请选择需要发货的订单',
            type: 'error'
          })
          return
        }
        this.$prompt('请输入快递单号', '设备发货', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在提交',
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/delivery_bao', {
                order_id: order_id,
                agree: 1,
                delivery_sn: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: '发货成功',
                  type: 'success'
                })
                this.toQuery()
              }).catch(err => {
                this.loadObj.close()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 缩水恢复
       */
      stealDel() {
        this.$prompt('请输入订单单号', '缩水恢复', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在提交',
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/show_hidding_order', {
                order_sn: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: '恢复成功',
                  type: 'success'
                })
                done()
              }).catch(err => {
                this.loadObj.close()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 订单退款
       */
      refundOrder(row) {
        this.$alert('确认给该笔订单退款吗？', '订单退款', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.clickSubmit = true
              this.$post('agentapi/business/drawback_paid_order', {
                order_id: row.order_id,
                refund_money: this.refundObj.refund_money,
                refund_2_balance: this.refundObj.refund_2_balance,
                refund_reason: this.refundObj.refund_reason
              }).then(res => {
                this.refundDialog = false
                this.clickSubmit = false
                this.$message({
                  message: '退款成功',
                  type: 'success'
                })
                row.refund_drawbacked = this.refundObj.refund_money
              }).catch(err => {
                this.clickSubmit = false
              })
            }
          }
        })
      },

      /**
       * 查询订单详情
       */
      getOrderDetail(row) {
        this.$get('wxapi/order_detail', {
          order_id: row.order_id
        }).then(res => {
          res.agents_profit = res.order_info.agents_profit
          res.money_paid = res.order_info.money_paid
          this.order = res
          this.detailDialog = true
        })
      },

      /**
       * 查询宝的最新信息
       */
      checkBao(bao_sn) {
        this.$get('commonapi/check/bao_status', {
          bao_sn: bao_sn
        }).then(res => {
          this.baoDialog = true
          this.baoList = [res]
        })
      },

      /**
       * 退款详情
       */
      refundInfo(row) {
        this.$get('wxapi/order/order_refund_appy_detail', {
          order_id: row.order_id
        }).then(res => {
          this.washRefundDialog = true
          this.washRefund = res[0]
        })
      },

      /**
       * 审核提现
       * @param {Object} row
       */
      upApply(row, agree) {
        if (agree == 1) {
          this.$alert('确定通过吗？', '通过退款申请', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == 'confirm') {
                if (this.clickSubmit) return
                this.clickSubmit = true
                this.postApply(row, agree)
              }
            }
          })
        } else if (agree == 0) {
          this.$prompt('', '驳回退款申请', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: '',
            inputPlaceholder: '驳回原因'
          }).then(({
            value
          }) => {
            if (this.clickSubmit) return
            this.clickSubmit = true
            this.postApply(row, agree, value)
          })
        }
      },

      /**
       * 提交选择结果
       * @param {Object} id
       * @param {Object} agree
       */
      postApply(row, agree, refund_reason) {
        this.$post('agentapi/order/audit_refund_appy', {
          order_id: row.order_id,
          agree: agree,
          refuse_reason: refund_reason
        }).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          if(row.depend_type == 4) row.order_status = (agree == 0 ? 1 : 3)
          row.refund_apply_status = (agree == 0 ? 2 : 3)
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      },

      /**
       * 微信支付分取消
       */
      cancelZFF(row){
        this.$alert('确定取消用户的支付分订单吗？', '取消服务订单', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.clickSubmit = true
              this.$get('wxapi/cancelZff', {
                out_order_no: row.out_order_no,
                appid: row.appid,
                agent_id: row.agent_id
              }).then(res => {
                this.$message({
                  message: res.msg,
                  type: 'success'
                })
              })
            }
          }
        })
      },

      /**
       * 订单扣款
       */
      deduct(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/order/press_paying_fund_order', {
          order_id: row.order_id
        }).then(res => {
          this.loadObj.close()
          this.$message({
            message: res.msg,
            type: 'success'
          })
        }).catch(err => {
          this.loadObj.close()
        })
      },

      /**
       * setSort
       */
      deviceSort() {
        this.$nextTick(() => {
          const el = this.$refs.dragDevice.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
          this.sortable = Sortable.create(el, {
            ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
            setData: function(dataTransfer) {
              // to avoid Firefox bug
              // Detail see : https://github.com/RubaXa/Sortable/issues/1012
              dataTransfer.setData('Text', '')
            },
            onEnd: evt => {
              const targetRow = this.deviceSortArr.splice(evt.oldIndex, 1)[0]
              this.deviceSortArr.splice(evt.newIndex, 0, targetRow)
            }
          })
        })
      },

      /**
       * 设备类型排序提交
       */
      postDeviceSort() {
        let params = {
          take_my_depend_sort: 1,
          depend_sort: {}
        }
        this.loadObj = this.$loading({
          lock: true,
          text: '',
          spinner: 'el-icon-loading'
        })
        this.deviceSortArr.map((item, index) => {
          params.depend_sort[item.depend_type] = this.deviceSortArr.length - index
        })
        this.$post('agentapi/ucenter/depend_sort', params).then(res => {
          this.$store.dispatch('user/getDeviceType').then(data => {
            this.deviceSortDialog = false
            this.loadObj.close()
            setTimeout(()=>{
              this.$message({
                message: '设置成功',
                type: 'success'
              })
            }, 100)
          })
        })
      },

      /**
       * 提交操作记录
       * @param {Object} order_type
       */
      postSetRecode(order_type) {
        if (order_type == this.order_type) return
        this.order_type = order_type
        switch (parseInt(order_type)) {
          case 4: // 全部
            this.tag_type = 1
            break
          case 0: // 今日订单
            this.tag_type = 3
            break
          case 1: // 使用中
            this.tag_type = 2
            break
          case 2: // 已完成
            this.tag_type = 4
            break
          case 3: // 超时借出
            this.tag_type = 5
            break
          case 5: // 租借失败
            this.tag_type = 6
            break
          case 6: // 0元订单
            this.tag_type = 1
            break
          case 7: // 扣款失败
            this.tag_type = 7
            break
          case 8: // 申请退款
            this.tag_type = 8
            break
        }
        if (!this.tag_type) return
        this.$store.dispatch('user/postSetRecode', [2, parseInt(this.user_type) + 1, this.tag_type])
      },

      /**
       * 导出
       */
      outTable() {
        this.outStatus = true
        this.listLoading = true
        this.listQuery.limit = 200
        this.list = []
        this.excel = true
        this.getList()
      },

      /**
       * 导出表格
       */
      outTabdd(tabId, fileName = 'data') {
        let fix = document.querySelector('.el-table__fixed-right')
        let xlsxParam = { raw: true }
        let wb
        if (fix) {
          this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`).removeChild(fix), xlsxParam)
          document.querySelector(`#${tabId}`).appendChild(fix)
        } else {
          this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`), xlsxParam)
        }
        if(this.wi == 49 && this.listLoading){
          this.wi = 0
        } else {
          this.wi++
          if (this.listLoading) {
            setTimeout(()=>{
              this.getList()
            }, 200)
            return
          }
        }
        let wboutes = this.wbout[0]
        var no = ''
        for (var i in this.wbout) {
          delete this.wbout[i].Sheets.Sheet1['!merges']
          delete this.wbout[i].Sheets.Sheet1['ANaN']
          if (i > 0) {
            let sheet1 = this.wbout[i].Sheets.Sheet1
            for (var s in sheet1) {
              let k = s.substring(0, 1)
              let n = s.substring(1)
              if (n != 1 && n != 'ref') {
                let k = s.substring(0, 1)
                n = s.substring(1)
                no = ((parseInt(i) * this.listQuery.limit) + parseInt(n))
                sheet1[k + no] = sheet1[s]
              }
              delete sheet1[s]
            }
            wboutes.Sheets.Sheet1 = Object.assign(wboutes.Sheets.Sheet1, sheet1)
          }
        }
        if (this.wbout[1]) wboutes.Sheets.Sheet1['!ref'] = `A1:S${no}`
        let wbout = XLSX.write(wboutes, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        })
        this.percentage = 100
        if (!this.listLoading || this.wi == 0) {
          try {
            FileSaver.saveAs(new Blob([wbout], {
              type: 'application/octet-stream'
            }), `${fileName}.xlsx`)
            this.$message({
              message: '导出成功',
              type: 'success'
            })
            if(this.wi == 0 && this.listLoading){
              setTimeout(()=>{
                this.percentage = 0
                this.wbout = []
                this.getList()
              }, 1000)
            } else {
              setTimeout(() => {
                this.excel = false
                location.reload()
              }, 1000)
            }
          } catch (e) {
            if (typeof console !== 'undefined') console.log(e, this.wbout)
          }
          return this.wbout
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }

  .scan-code_btn {
    padding: 4px 4px 0 0;
    border-bottom: 1px solid #E4E7ED;
  }

  .remark-box {
    max-height: 80px;
  }
</style>
