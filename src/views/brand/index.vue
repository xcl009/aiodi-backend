<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('brand.brandName')">
          <el-input v-model="form.name" :placeholder="$t('brand.brandName')" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input v-model="form.mobile" :placeholder="$t('public.phone')" />
        </el-form-item>
        <el-form-item :label="$t('public.status')">
          <el-select :placeholder="$t('public.status')" v-model="form.status" @change="toQuery()">
            <el-option :label="$t('brand.effective')" :value="1" />
            <el-option :label="$t('brand.invalid')" :value="2" />
          </el-select>
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="$router.push({ path: `/brand/addBrand` })"><i
            class="el-icon-circle-plus-outline el-icon--left" />{{ $t('brand.addBrand') }}</el-button>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="brandTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" width="150" v-if="item.key == 'name'">
            <template slot-scope="scope">
              <div class="mb-5 cursor" @click="copyText(scope.row.id)">{{ scope.row.name || $t('brand.brandName') }}
              </div>
              <el-tooltip class="item" effect="dark" :content="scope.row.brandUser.mobile" placement="top"
                v-if="scope.row.brandUser">
                <div>{{ dealPhone(scope.row.brandUser.mobile) }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" min-width="160" v-else-if="item.key == 'companyName'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar shape="square" :size="35" fit="cover"
                  :src="ossThumbnail(scope.row.logo || agentInfo.avatar)"></el-avatar>
                <div class="pl-5 flex-sub">{{ scope.row.companyName || '--' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="130" v-else-if="item.key == 'createTime'">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="130" v-else-if="item.key == 'expiresTime'">
            <template slot-scope="scope">
              {{ parseTime(scope.row.expiresTime, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="100" v-else-if="item.key == 'isLeader'">
            <template slot-scope="scope">
              <div class="text-primary cursor" v-if="scope.row.isLeader == 1">{{ $t('brand.regimentalCommander') }}
              </div>
              <div class="text-primary cursor" @click="setRow(3, scope.row)"
                v-else-if="scope.row.isLeader == 0 && scope.row.leaderBrandId == 0">{{ $t('brand.setAsTeamLeader') }}
              </div>
              <div class="mb-5" v-else>{{ scope.row.leaderBrandName || '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="200" v-else-if="item.key == 'brandDeviceType'">
            <template slot-scope="scope">
              <div>
                <span class="mr-20 inline" v-for="item in scope.row.brandDeviceType">
                  {{ item.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" min-width="100" v-else-if="item.key == 'deviceCount'">
            <template slot-scope="scope">
              <div class="inline text-left" @click="$router.push({ path: `/device?brandId=${scope.row.id}` })">
                <div>
                  {{ $t('public.all') }}：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}
                </div>
                <div>{{ $t('public.shipped') }}：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].bindStoreNumber
      :
      '0' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.key == 'orderCount'">
            <template slot-scope="scope">
              <div class="text-primary cursor" @click="$router.push({ path: `/order?brandId=${scope.row.id}` })">
                {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="下级总数" width="150">
            <template slot-scope="scope">
              <div class="inline text-left">
                <div class="mb-5">直属下级：{{ scope.row.child_agent_num || 0}}</div>
                <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column :label="item.name" width="120" v-else-if="item.key == 'amount'">
            <template slot-scope="scope">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 120" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({ path: `/order?brandId=${scope.row.id}` })">{{
      $t('brand.orderList') }}</el-button>
              <el-button type="primary" size="mini" @click="$router.push({ path: `/store?brandId=${scope.row.id}` })">{{
      $t('brand.storeList') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 2)">{{ $t('brand.contractManagement')
                }}</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/market/appManage?brandId=${scope.row.id}` })">{{ $t('public.giftService')
                }}</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/brand/addBrand?brandId=${scope.row.id}` })">{{
      $t('public.modifyingInformation') }}</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini" class="" @click="">{{ $t('public.adds') }}<i
                    class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="$router.push({ path: `/market?brandName=${scope.row.name}` })">{{
      $t('brand.addedService') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="toLogin(scope.row)">{{ $t('brand.branding') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 1)">{{ $t('brand.deductionVoucher')
                    }}</el-dropdown-item>
                  <el-dropdown-item @click.native="copyloginUrl(scope.row)">{{ $t('brand.loginAddress')
                    }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 3)">{{ $t('brand.toMiniProgram')
                    }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(5, scope.row)">{{ $t('brand.cache') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 11)">{{ $t('public.setLoginPassword')
                    }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 12)">{{ $t('brand.payChannel')
                    }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 14)">{{ $t('brand.loginChannel')
                    }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(1, scope.row, scope.$index)" v-if="scope.row.status == 1">{{
      $t('brand.deleteBrand') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(2, scope.row, scope.$index)" v-else>{{
      $t('brand.accountRecovery') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('brand.voucherAmount')">
            <el-input v-model="dform.amount">
              <template slot="append">{{ siteInfo.currencySymbol }}</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="text-danger" style="width: 400px; max-width: 100%;">{{ $t('public.tips') }}：{{
      $t('brand.renewText') }}{{ dform.amount || 0
              }}，{{ $t('brand.renewText1') }}{{ (dform.amount || 0) * 3 }}，{{ $t('brand.renewText2') }}。</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="flex flexv pl-20 pr-20 pb-20" style="width: 600px; height: 100%;">
          <upload :uploadText="$t('brand.uploadContract')" accept=".pdf,.PDF" :upObj="{ fileType: 'pdfFile' }"
            @onSuccess="uploadPdf" />
          <div class="mt-20 mb-15 text-black">{{ $t('brand.contractInformation') }}</div>
          <div class="text-gray" v-if="!dform.pdfUrl">{{ $t('brand.contractNotUploaded') }}</div>
          <div class="flex1">
            <iframe ref="pdfCotainer" :src="dform.pdfUrl" width="100%" height="100%"
              style="min-height: 600px;"></iframe>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()"
          v-if="dform.jumpDetail && dform.jumpDetail.wx">
          <h4>{{ $t('payType.wx') }}</h4>
          <template v-for="item in curRow.brandDeviceType">
            <el-form-item :label="item.name">
              <el-input v-model="dform.jumpDetail.wx[`${item.code}`]" :placeholder="$t('brand.appidText')"></el-input>
            </el-form-item>
          </template>
          <h4>{{ $t('payType.zfb') }}</h4>
          <template v-for="item in curRow.brandDeviceType">
            <el-form-item :label="item.name">
              <el-input v-model="dform.jumpDetail.ali[`${item.code}`]" :placeholder="$t('brand.appidText')"></el-input>
            </el-form-item>
          </template>
          <el-form-item>
            <div class="text-danger" style="width: 400px; max-width: 100%;">
              {{ $t('brand.message') }}
            </div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 11">
        <el-form class="pl-20 pr-20 custom-form">
          <el-form-item :label="$t('public.loginPassword')">
            <el-switch v-model="dform.password" />
            <div class="fs-s3 text-danger">{{ $t('store.resettingStorePasswordText') }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.operationPassword')">
            <el-switch v-model="dform.twoPassword" :active-value="1" :inactive-value="0" />
            <div class="fs-s3 text-danger">{{ $t('store.resetOPwdText') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 12">
        <div class="pl-20 pr-20 channel-box">
          <el-radio-group v-model="dform.sourceType" @change="getBrandCannel()">
            <el-radio-button :label="key" v-for="(item, key) in Constant.SourceType">{{ item }}</el-radio-button>
          </el-radio-group>

          <template v-if="brandChannels.length > 0">
            <div class="mt-15 mb-15">排序值越大越靠前</div>
            <div class="flex align-center p-10 mb-15 channel-item radius-10 cursor"
              :class="{ 'act': item.status == 'ENABLE' }" v-for="item in brandChannels">
              <el-avatar class="block" :size="40" :src="item.logo" fit="cover" shape="square"></el-avatar>
              <div class="pl-10 pr-10 flex-1">
                <div :class="{ 'text-bold text-black': item.status == 'ENABLE' }" @click.stop="$set(item, 'editName', true)" v-show="!item.editName">{{ item.name }}</div>
                <el-input v-model="item.name" autofocus @blur.stop="item.editName = false" size="mini" v-show="item.editName" />
                <div class="mt-5 fs-s2">{{ item.code }}</div>
              </div>
              <div class="flex align-center sort-box text-center">
                <template v-if="item.status == 'ENABLE'">
                  <span class="mr-5">排序值</span>
                  <el-input class="flex-1" v-model="item.sort" type="number" />
                </template>
              </div>
              <div class="pay-config text-primary text-center">
                <span v-if="item.status == 'ENABLE' && item.code != 'BALANCE' && item.id" @click.stop="setRows(1, item, 13)">{{
      $t('brand.payConfig') }}</span>
              </div>
              <div class="mr-20 text-primary text-center" v-if="item.status == 'ENABLE'">
                <span @click.stop="item.access = (item.access == 'ENABLE' ? 'DISABLE' : 'ENABLE')">{{ item.access == 'ENABLE' ? '已接入' : '开通中' }}</span>
              </div>
              <el-checkbox v-model="item.status" true-label="ENABLE" false-label="DISABLE"></el-checkbox>
            </div>
          </template>
          <template v-else>
            <div class="mt-15 mb-15">暂无可配置通道</div>
          </template>
        </div>
      </template>
      <template v-if="dialogType == 13">
        <el-form class="pl-20 pr-20 custom-form max-w" style="width: 600px;">
          <el-form-item>
            <i class="text-primary el-icon-arrow-left cursor fs-a1" @click="dialogType = 12"></i>
          </el-form-item>
          <el-form-item :label="$t('brand.appType')">
            <el-select v-model="dform.sourceType" class="tfixed" disabled>
              <el-option :label="item" :value="parseInt(key)" v-for="(item, key) in Constant.SourceType" />
            </el-select>
          </el-form-item>
          <el-form-item label="APPID">
            <el-input v-model="dform.appId"></el-input>
            <div class="generatebox generate" @click="generateChange()">没有APPID请点击生成</div>
          </el-form-item>
          <el-form-item label="code">
            <el-input v-model="dform.channelCode" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('public.content')">
            <el-input type="textarea" :autosize="{ minRows: 14, maxRows: 16 }" :placeholder="$t('public.content')"
              v-model="dform.content">
            </el-input>
          </el-form-item>
          <template v-if="curRow.code == 'ALIPAY_HK' && dform.content">
            <el-form-item :label="$t('miniProgram.zfbId')">
              <el-input v-model="dform.content.pid"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.clientId')">
              <el-input v-model="dform.content.clientId"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.gatewayUrl')">
              <el-input v-model="dform.content.gatewayUrl"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.appPrivateKey')">
              <el-input v-model="dform.content.appPrivateKey" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.appPublicKey')">
              <el-input v-model="dform.content.appPublicKey" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.alipayPublicKey')">
              <el-input v-model="dform.content.alipayPublicKey" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.appCert')">
              <el-input v-model="dform.content.appCert" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.alipayCert')">
              <el-input v-model="dform.content.alipayCert" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.alipayRootCert')">
              <el-input v-model="dform.content.alipayRootCert" type="textarea" :rows="6"></el-input>
            </el-form-item>
          </template>
          <template v-if="curRow.code == 'WECHAT_APP' && dform.content">
            <el-form-item label="MCHID">
              <el-input v-model="dform.content.merchantId"></el-input>
            </el-form-item>
            <el-form-item label="apiV3Key">
              <el-input v-model="dform.content.apiV3Key"></el-input>
            </el-form-item>
            <el-form-item label="merchantSerialNumber">
              <el-input v-model="dform.content.merchantSerialNumber"></el-input>
            </el-form-item>
            <el-form-item label="apiclientKey">
              <el-input v-model="dform.content.apiclientKey" type="textarea" :rows="6"></el-input>
            </el-form-item>
            <el-form-item label="payNotifyUrl">
              <el-input v-model="dform.content.payNotifyUrl"></el-input>
            </el-form-item>
            <el-form-item label="refundNotifyUrl">
              <el-input v-model="dform.content.refundNotifyUrl"></el-input>
            </el-form-item>
          </template>
          <template v-if="['VNPAY_APP', 'VNPAY_H5'].indexOf(curRow.code) > -1 && dform.content">
            <el-form-item label="secretKey">
              <el-input v-model="dform.content.secretKey"></el-input>
            </el-form-item>
            <el-form-item label="appReturnUrl">
              <el-input v-model="dform.content.appReturnUrl"></el-input>
            </el-form-item>
            <el-form-item label="h5ReturnUrl">
              <el-input v-model="dform.content.h5ReturnUrl"></el-input>
            </el-form-item>
            <el-form-item label="payUrl">
              <el-input v-model="dform.content.payUrl"></el-input>
            </el-form-item>
            <el-form-item label="apiUrl">
              <el-input v-model="dform.content.apiUrl"></el-input>
            </el-form-item>
            <el-form-item label="tmnCode">
              <el-input v-model="dform.content.tmnCode"></el-input>
            </el-form-item>
            <el-form-item label="refundUrl">
              <el-input v-model="dform.content.refundUrl"></el-input>
            </el-form-item>
          </template>
        </el-form>
      </template>
      <template v-if="dialogType == 14">
        <div class="pl-20 pr-20 channel-box" v-if="loginChannel.length > 0">
          <!-- <el-radio-group v-model="dform.sourceType" @change="getBrandLoginCannel(curRow.id)">
            <el-radio-button :label="key" v-for="(item, key) in Constant.SourceType">{{ item }}</el-radio-button>
          </el-radio-group> -->
          
          <div class="flex align-center p-10 mb-15 channel-item radius-10 cursor"
            :class="{ 'act': brandLoginChannels[item.loginCode] }" v-for="item in loginChannel"
            @click="dialogConfirm(brandLoginChannels[item.loginCode] || item)">
            <el-avatar class="block" :size="35" :src="item.loginLogo" :fit="cover" shape="square"></el-avatar>
            <div class="pl-15 pr-15 flex-1">
              <div :class="{ 'text-bold text-black': brandLoginChannels[item.loginCode] }">{{ item.loginName }} {{
      item.loginExt || '' }}</div>
              <div class="mt-5 fs-s2">{{ item.loginCode }}</div>
            </div>
            <div class="text-primary">{{ $t('brand.loginConfig') }}</div>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 15">
        <el-form class="pl-20 pr-20 custom-form max-w" style="width: 600px;">
          <el-form-item>
            <i class="text-primary el-icon-arrow-left cursor fs-a1" @click="dialogType = 14"></i>
          </el-form-item>
          <el-form-item :label="$t('brand.appType')">
            <el-select v-model="dform.soureType" class="tfixed">
              <el-option :label="item" :value="parseInt(key)" v-for="(item, key) in Constant.SourceType" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.status')">
            <el-select v-model="dform.status" class="tfixed">
              <el-option :label="$t('brand.effective')" :value="1" />
              <el-option :label="$t('brand.invalid')" :value="2" />
            </el-select>
          </el-form-item>
          <template v-if="dform.loginCode == 'WECHAT'">
            <el-form-item label="APPID">
              <el-input v-model="dform.content.appId"></el-input>
            </el-form-item>
            <el-form-item :label="$t('miniProgram.xcxAPPSECRET')">
              <el-input v-model="dform.content.appSecret"></el-input>
            </el-form-item>
          </template>
          <template v-if="dform.loginCode == 'GOOGLE'">
            <el-form-item label="clientId">
              <el-input v-model="dform.content.clientId"></el-input>
            </el-form-item>
          </template>
        </el-form>
      </template>
      <template v-if="[1, 3, 11, 12, 13, 15].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{
            $t('public.confirm')
            }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import upload from '@/components/upload'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import {
  copyText
} from '@/utils/index'
import {
  getToken,
  setToken,
  removeToken
} from '@/utils/auth'
import TableColumnSet from '@/components/TableColumnSet/index'

export default {
  name: 'brand',
  components: {
    upload,
    TableColumnSet,
    Pagination,
    condition
  },
  data() {
    return {
      copyText: copyText,
      clickSubmit: false,
      form: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20
      },
      orderCount: {},
      deviceCount: {},

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],

      // 弹出相关
      dialogType: 1,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
      twoDform:{},

      //支付通道
      payChannel: [],
      channels: {},
      brandChannels: {},

      //登录通道
      loginChannel: [],
      brandLoginChannels: {}
    }
  },
  defaultColumn() {
    return [
      {
        key: 'name',
        val: true,
        name: this.$t('brand.brandInfo')
      },
      {
        key: 'companyName',
        val: false,
        name: this.$t('brand.corporateName')
      },
      {
        key: 'createTime',
        val: true,
        name: this.$t('brand.timeOfEntry'),
        width: 260
      },
      {
        key: 'isLeader',
        val: true,
        name: this.$t('brand.regimentalCommander')
      },
      {
        key: 'fatherBrandName',
        val: true,
        name: this.$t('brand.inviter')
      },
      {
        key: 'brandDeviceType',
        val: true,
        name: this.$t('brand.category')
      },
      {
        key: 'deviceCount',
        val: true,
        name: this.$t('brand.numberOfDevices')
      },
      {
        key: 'orderCount',
        val: true,
        name: this.$t('public.orderNum')
      },
      {
        key: 'amount',
        val: true,
        name: `${this.$t('public.aTurnover')}`
      },
      {
        key: 'expiresTime',
        val: true,
        name: `${this.$t('public.expirationTime')}`
      }
    ]
  },
  activated() {
    if (this.$route.meta.reload) {
      this.getList()
    } else if (!this.list || this.list.length == 0) {
      this.toQuery(1)
    }
  },
  computed: {
    Constant() {
      return this.$store.getters.Constant
    },
    device() {
      return this.$store.state.app.device
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    defaultColumn() {
      return [{
        key: 'name',
        val: true,
        name: this.$t('brand.brandInfo')
      },
      {
        key: 'companyName',
        val: false,
        name: this.$t('brand.corporateName')
      },
      {
        key: 'createTime',
        val: true,
        name: this.$t('brand.timeOfEntry'),
        width: 260
      },
      {
        key: 'isLeader',
        val: true,
        name: this.$t('brand.regimentalCommander')
      },
      {
        key: 'fatherBrandName',
        val: true,
        name: this.$t('brand.inviter')
      },
      {
        key: 'brandDeviceType',
        val: true,
        name: this.$t('brand.category')
      },
      {
        key: 'deviceCount',
        val: true,
        name: this.$t('brand.numberOfDevices')
      },
      {
        key: 'orderCount',
        val: true,
        name: this.$t('home.orderNum')
      },
      {
        key: 'amount',
        val: true,
        name: `${this.$t('public.aTurnover')}`
      }
      ]
    },
    dialogTitle() {
      return {
        1: this.$t('brand.giftOfDeductionVouchers'),
        2: this.$t('brand.contractManagement'),
        3: this.$t('brand.toMiniProgram'),
        11: this.$t('public.setLoginPassword'),
        12: this.$t('brand.payChannel'),
        13: this.$t('brand.payConfig'),
        14: this.$t('brand.loginChannel'),
        15: this.$t('brand.loginConfig'),
      }
    },
    sort_type() {
      return [{
        name: this.$t('brand.comprehensiveSorting'),
        value: 0
      },
      {
        name: this.$t('brand.highToLow'),
        value: 1
      },
      {
        name: this.$t('brand.lowToHogh'),
        value: 2
      },
      {
        name: this.$t('brand.nearToFar'),
        value: 3
      },
      {
        name: this.$t('brand.farToNear'),
        value: 4
      }
      ]
    },
  },
  mounted() {

  },
  methods: {
    generateChange() {
      let that = this;
      let channel = this.dform.channelCode.split('_')
      this.$get('iot-saas-pay/api/pay/app/getAppId', { channel: channel[0] }).then(res => {
        this.dform.appId = res;
        this.$message({
          message: that.$t('public.operationSuccessful'),
          type: 'success'
        })


      }).catch(() => {
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
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      this.form = {
        status: 1
      }
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      this.$get('iot-saas-basic/admin/brand/findPage', params).then(res => {
        this.listLoading = false
        this.list = res.rows
        this.clickSubmit = false
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
        }
        this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
        this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },


    /**
     * 订单数量统计查询
     */
    queryOrderCount(ids) {
      if (ids.length == 0) {
        this.orderCount = {}
        return
      }
      this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
        countType: 'BRAND',
        groupIds: ids.join(',')
      }).then(res => {
        this.orderCount = res
      })
    },

    /**
     * 设备数量统计查询
     */
    queryDeviceCount(ids) {
      if (ids.length == 0) {
        this.deviceCount = {}
        return
      }
      this.$get('iot-saas-device/admin/device/count/queryGroupCountV2', {
        countType: 'BRAND',
        groupIds: ids.join(',')
      }).then(res => {
        this.deviceCount = res
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前行
     * @param {Object} dialogType dialog内容显示类型 1: '赠送券' 2: '合同'
     * @param {Object} idx 当前行所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          if([13].indexOf(dialogType) == -1) this.curRow = row
          this.curIdx = idx
          this.dform = {}
          if (dialogType == 2) {
            this.$get('iot-saas-basic/admin/platform/getFileInfo', {
              bussinessId: row.id,
              type: 1
            }).then(res => {
              this.dform = {
                pdfUrl: res.url
              }
            })
          } else if (dialogType == 1) {
            this.$get('iot-saas-basic/admin/settings/find', {
              brandId: row.id,
              code: 'VIP_COUPON'
            }).then(res => {
              if (res && res.setting) {
                let coupon = JSON.parse(res.setting)
                this.dform = {
                  amount: coupon.amount || 0
                }
              }
            })
          } else if (dialogType == 3) {
            this.$get('iot-saas-basic/admin/settings/find', {
              brandId: row.id,
              code: 'BRAND_JUMP_MINI'
            }).then(res => {
              if (res && res.setting) {
                let info = JSON.parse(res.setting)
                console.log(info)
                this.dform = {
                  jumpDetail: {
                    wx: JSON.parse(info.wx),
                    ali: JSON.parse(info.ali),
                  }
                }
              } else {
                this.dform = {
                  jumpDetail: {
                    wx: {},
                    ali: {}
                  }
                }
              }
            })
          } else if (dialogType == 12) {
            this.dform = {
              sourceType: 4,
            }
            console.log(row,'row')
            this.twoDform.brandId = row.brandId;
            this.twoDform.bindId = row.id;
            this.getBrandCannel()

            // let channels = {}
            // this.$get('iot-saas-pay/admin/pay/channel/all').then(res => {
            //   this.payChannel = res
            //   res.map(item => {
            //     channels[item.id] = {
            //       status: item.status,
            //       sort: item.sort
            //     }
            //   })

            // })
          } else if (dialogType == 13) {
            let content = row.content ? JSON.parse(row.content) : {}
            console.log(row, 'rows')
            console.log(content, 'content')
            this.dform = {
              id: row.configId || '',
              brandId: row.brandId,
              bindId: row.id,
              sourceType: row.sourceType || 4,
              channelCode: row.code,
              appId: row.appId || '',
              content: row.content
            }
          } else if (dialogType == 14) {
            this.dform = {
              sourceType: 4
            }
            this.$get('iot-saas-user/admin/queryAllLoginChannel').then(res => {
              this.loginChannel = res
              this.getBrandLoginCannel(row.id)
            })
          }
          this.drawerStatus = true
        break
      }
    },

    /**
     * 获取品牌支付通道
     * @param {Object} id
     */
    getBrandCannel() {
      this.$get('iot-saas-pay/admin/pay/channel', {
        brandId: this.curRow.id,
        sourceType: this.dform.sourceType
      }).then(res => {
        this.brandChannels = res
      })
    },

    /**
     * 获取品牌登录通道
     * @param {Object} id
     * @param {Object} channels
     */
    getBrandLoginCannel(id) {
      this.$get('iot-saas-user/open/api/queryLoginChannelByBrands', {
        brandId: id,
        sourceType: this.dform.sourceType
      }).then(res => {
        let brandChannels = {}
        res.map(item => {
          brandChannels[item.loginCode] = item
        })
        this.brandLoginChannels = brandChannels
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 删除品牌 2 账号恢复 3 设为团长 4 设备统计数量  5 代理层级缓存  6 重置登录密码
     * @param {Object} row
     * @param {Object} index
     */
    setRow(type, row, index) {
      let that = this;
      switch (type) {
        case 1:
          this.$alert(that.$t('brand.areYouDeleteBrand'), that.$t('brand.deleteBrand'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-basic/admin/brand/updateStatusById', {
                  id: row.id,
                  status: 0
                }).then(res => {
                  this.$message({
                    message: that.$t('public.deleteSuccess'),
                    type: 'success'
                  })
                  this.list.splice(index, 1)
                })
              }
            }
          })
          break
        case 2:
          this.$alert(that.$t('brand.accountToNormal'), that.$t('brand.accountRecovery'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-basic/admin/brand/updateStatusById', {
                  id: row.id,
                  status: 0
                }).then(res => {
                  this.$message({
                    message: that.$t('brand.recoveryWasSuccess'),
                    type: 'success'
                  })
                  this.list.splice(index, 1)
                })
              }
            }
          })
          break
        case 3:
          this.$alert(that.$t('brand.areYouSetAsTeamLeader'), that.$t('brand.regimentalCommander'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-basic/admin/brand/setLeader', {
                  brandId: row.id
                }).then(res => {
                  this.$message({
                    message: that.$t('public.setSuccess'),
                    type: 'success'
                  })
                })
              }
            }
          })
          break
        case 5:
          this.$alert(that.$t('brand.agentLevel'), that.$t('brand.levelRefresh'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$get('iot-saas-basic/admin/agent/initAgentCache', {
                  brandId: row.id
                }).then(res => {
                  this.$message({
                    message: that.$t('public.refreshSuccessful'),
                    type: 'success'
                  })
                })
              }
            }
          })
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm(row = {}) {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          params.brandId = curRow.id
          this.$post('iot-saas-basic/admin/settings/saveCoupon', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 3:
          params.brandId = curRow.id
          if (params.jumpDetail.wx) params.jumpDetail.wx = JSON.stringify(params.jumpDetail.wx)
          if (params.jumpDetail.ali) params.jumpDetail.ali = JSON.stringify(params.jumpDetail.ali)
          this.$post('iot-saas-basic/admin/settings/saveJump', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 11:
          params.userId = curRow.userId
          if (params.password) params.password = '123456'
          this.$post('iot-saas-user/admin/user/password/reset', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 12:
          params.brandId = curRow.id
          let channels = []
          for (var i in this.brandChannels) {
            channels.push({
              alias: this.brandChannels[i].name,
              channelId: this.brandChannels[i].channelId,
              status: this.brandChannels[i].status,
              sort: this.brandChannels[i].sort,
              access: this.brandChannels[i].access
            })
          }
          params.channels = channels
          this.$post('iot-saas-pay/admin/pay/channel/saveChannelBrand', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.getBrandCannel()
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 13:
          this.clickSubmit = false
          // params.content.appId = JSON.parse(params.content).appId
          // params.content = JSON.parse(params.content)
          this.$post('iot-saas-pay/admin/pay/channel/saveAppConfig', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.dialogType = 12
            this.getBrandCannel()
            this.clickSubmit = false
            this.drawerStatus = false;
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 14:
          this.dform = {
            id: row.brandId ? row.id : '',
            brandId: row.brandId || '',
            soureType: row.soureType ? parseInt(row.soureType) : '',
            status: row.status ? parseInt(row.status) : 0,
            loginCode: row.loginCode,
            loginChannelId: row.loginChannelId || row.id,
            content: row.content ? JSON.parse(row.content) : {}
          }
          this.dialogType = 15
          this.clickSubmit = false
          break
        case 15:
          params.content = JSON.stringify(params.content)
          let url15 = 'iot-saas-user/admin/updateLoginChannelByBrands'
          if (!params.brandId) {
            params.brandId = this.curRow.id
            url15 = 'iot-saas-user/admin/saveLoginChannelByBrands'
          }
          this.$post(url15, params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.dialogType = 14
            this.getBrandLoginCannel(params.brandId)
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },

    /**
     * 登录代理后台
     * @param {Object} row
     */
    toLogin(row) {
      let that = this;
      this.loadObj = this.$loading({
        lock: true,
        text: that.$t('public.loggingIn'),
        spinner: 'el-icon-loading'
      })
      this.$post('iot-saas-user/admin/login', {
        userType: 'brand',
        id: row.id
      }).then(res => {
        setToken(getToken(), 'token1')
        setToken(res.loginToken.accessToken)
        setTimeout(() => {
          location.href = '/home'
          this.loadObj.close()
        }, 500)
      }).catch(err => {
        this.loadObj.close()
      })
    },

    /**
     * 复制贴牌登录地址
     * @param {Object} row
     */
    copyloginUrl(row) {
      let that = this;
      copyText(`${location.origin}/login/${row.id}`)
      this.$message({
        message: that.$t('public.copySuccess'),
        type: 'success'
      })
    },

    /**
     * 上传合同
     */
    uploadPdf(res) {
      let that = this;
      this.$post('iot-saas-basic/admin/platform/saveFileInfo', {
        type: 1,
        businessId: this.curRow.id,
        url: res.data.url
      }).then(ares => {
        this.dform = {
          pdfUrl: res.data.url
        }
        this.$message({
          message: that.$t('public.uploadSuccess'),
          type: 'success'
        })
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.channel-box {
  .channel-item {
    min-width: 500px;
    max-width: 800px;
    border: 2px solid #eee;

    &.act {
      border-color: var(--olive);
    }
  }

  /deep/ .el-avatar {
    background: none;
  }

  .sort-box {
    width: 110px;

    /deep/ .el-input__inner {
      padding-right: 0;
      width: 100%;
      height: 32px;
    }
  }

  .pay-config {
    width: 90px;
  }
}

.generatebox {
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 10px;
}

.generate {
  color: #165DFF;

}
</style>
