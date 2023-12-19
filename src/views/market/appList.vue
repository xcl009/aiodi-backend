<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :filterForm="false" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-20 pt-10 pl-10 pr-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.serviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.serviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allServer')" :name="''" />
            <el-tab-pane :label="$t('public.services')" name="SYSTEM" />
            <el-tab-pane :label="$t('public.categoryServices')" name="CUSTOMIZE" />
            <!-- <el-tab-pane label="主题皮肤" name="THEME" /> -->
          </el-tabs>
        </div>
        <div class="mb-20 pl-10 pr-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" :name="'0'" :disabled="listQuery.serviceTypeCode == 'SYSTEM'" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName"
              :disabled="listQuery.serviceTypeCode == 'SYSTEM'" />
          </el-tabs>
        </div>
        <div class="mb-20 pl-10 pr-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.service') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.type" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" name="-1" />
            <el-tab-pane name="0">
              <img class="vip-icon" :src="require('@/assets/market_vip.png')" width="51" slot="label">
            </el-tab-pane>
            <el-tab-pane name="2">
              <img class="vip-icon" :src="require('@/assets/market_svip.png')" width="60" slot="label">
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </condition>

    <div class="pb-20 load-box" v-infinite-scroll="loadPage">
      <div class="p-30 text-center bg-white" v-if="listTotal == 0">
        {{ $t('market.continuousUpdates') }}
      </div>
      <el-row :gutter="20" class="fs-s2">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-20 list-item cursor bg-white" @click="setRows(2, item, 1)">
            <div class="flex align-start">
              <el-image class="list-img" :src="item.url" fit="cover"></el-image>
              <div class="flex1"></div>
              <div class="flex align-center" v-if="checkAbility(['BRAND_MEMBER'], 3)">
                <span class="mr-5 fs-b5 text-green">•</span>
                <span> {{ $t('market.vipFree') }}</span>
              </div>
              <!-- <div class="flex align-center" v-else-if="item.serviceTypeCode != 'CATEGORY' && checkFree[item.serviceId] != 'YES'">
                <span class="mr-5 fs-b5 text-green">•</span>
                <span>0元试用</span>
              </div> -->
            </div>
            <div class="mt-15 text-black fs-c1 text-cut">
              {{ item.serviceName }}
            </div>
            <div class="mt-15 text-cut_two text-grey">
              {{ item.brief }}
            </div>
            <div class="mt-15 flex align-center">
              <div class="mr-5 text-grey">{{ $t('market.heat') }}</div>
              <img :src="require('@/assets/market_hot.svg')" class="block" width="14" alt="" v-for="item in 3">
            </div>
            <div class="mt-15 flex align-center">
              <template v-if="checkAbility(['BRAND_MEMBER'], 3)">
                <div class="flex1">
                  <span class="mr-5 fs-b4 text-black">￥0</span>
                  <template v-for="(sitem, idx) in item.priceSettings">
                    <template v-if="idx == 0">
                      <span class="text-line">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount > 0 ?
                        `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                      <span>{{ sitem.monthAmount > 0 ? `/${$t('public.theMoon')}` : sitem.yearAmount > 0 ?
                        `/${$t('public.year')}` : `/${$t('payType.permanent')}` }}</span>
                    </template>
                  </template>
                </div>
              </template>
              <template v-else>
                <template v-for="(sitem, idx) in item.priceSettings">
                  <div class="flex1" v-if="idx == 0">
                    <span class="fs-b3 text-black">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount >
                      0 ? `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                    <span>{{ sitem.monthAmount > 0 ? `/${$t('payType.monthlyPayment')}` : sitem.yearAmount > 0 ?
                      `/${$t('payType.annualPayment')}` : `/${$t('payType.permanent')}` }}</span>
                  </div>
                </template>
              </template>
              <template v-if="item.serviceTypeCode != 'CUSTOMIZE' || myDeviceId[item.deviceTypeCode]">
                <el-button type="info" size="medium" class="bg-body" plain
                  v-if="checkAbility(arrayKeys(item.priceSettings, 'priceCode'), 4)">{{ $t('market.selected')
                  }}</el-button>
                <el-button type="primary" size="medium" plain v-else>{{ checkAbility(['BRAND_MEMBER'], 3) ?
                  $t('market.addNow') : $t('public.buyNow') }}</el-button>
              </template>
              <template v-else>
                <el-button type="info" size="medium" class="bg-body" plain>{{ $t('public.notHave') }}{{
                  myDeviceId[item.deviceTypeCode] }}{{ $t('market.text') }}</el-button>
              </template>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <div class="flexv pl-20 pr-20 text-black">
          <div class="mb-15">
            {{ $t('market.serviceDetails') }}
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-15 w-60 text-grey">{{ $t('market.serverName') }}</div>
            <div>{{ info.name }}</div>
          </div>
          <div class="flex align-center mb-10" v-if="info.deviceType">
            <div class="mr-15 w-60 text-grey">{{ $t('market.serviceType') }}</div>
            <div>{{ info.deviceType.name }}</div>
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-15 w-60 text-grey">{{ $t('market.serviceVip') }}</div>
            <div>{{ info.type == 0 ? 'VIP' : 'SVIP' }}</div>
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-15 w-60 text-grey">{{ $t('market.servicePrece') }}</div>
            <div class="flex align-center" v-if="checkAbility(['BRAND_MEMBER'], 3) && rests.expiresDatetime">
              <div class="fs-b3 text-danger">￥0</div>
              <div class="ml-10 fs-c1 text-black3 text-line" v-if="info.priceSettings">￥{{
                info.priceSettings[dform.priceCode][cycleKey] || 0 }}</div>
            </div>
            <div class="fs-c1 text-danger" v-else-if="info.priceSettings">{{ info.priceSettings[dform.priceCode][cycleKey]
              || 0 }}</div>
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-15 w-60 text-grey">{{ $t('public.payType') }}</div>
            <div>{{ $t('payType.khb') }}（{{ $t('payType.balance') }}：{{ money.happyCurrencyNum || 0 }}{{
              $t('public.individual') }}）</div>
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-15 w-60 text-grey">{{ $t('market.servicePeriod') }}</div>
            <div v-if="checkAbility(['BRAND_MEMBER'], 3) && rests.expiresDatetime">
              <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" effect="plain">
                {{ rests.expiresDatetime }}{{ $t('public.becomeDue') }}
              </el-tag>
            </div>
            <div v-else-if="info.priceSettings && info.priceSettings[dform.priceCode]">
              <template v-for="item in cycle">
                <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" effect="plain"
                  v-if="item.key == 'TRYOUT' && checkFree[id] != 'YES' && info.serviceTypeCode != 'CATEGORY'"
                  :type="cycleKey == item.key ? '' : 'info'" @click="cycleKey = item.key; dform.cycle = item.code">
                  {{ item.label }}
                </el-tag>
                <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" effect="plain"
                  v-if="(info.priceSettings[dform.priceCode][item.key] > 0)" :type="cycleKey == item.key ? '' : 'info'"
                  @click="cycleKey = item.key; dform.cycle = item.code">
                  {{ item.label }}
                </el-tag>
              </template>
            </div>
          </div>
          <div class="flex mb-10" v-if="info.priceSettings && Object.values(info.priceSettings).length > 0"
            style="width: 500px;">
            <div class="mr-15 mt-5 w-60 text-grey">{{ $t('market.serviceMode') }}</div>
            <div class="flex1 flex flex-wrap">
              <template v-for="item in info.priceSettings">
                <div class="mb-10">
                  <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" effect="plain"
                    :type="dform.priceCode == item.priceCode ? '' : 'info'" @click="dform.priceCode = item.priceCode">
                    {{ item.priceName }}{{ checkAbility([item.priceCode], 3) ? `（${$t('market.selectedText')})` : '' }}
                  </el-tag>
                </div>
              </template>
            </div>
          </div>
          <div class="pt-20 l-t">
            {{ $t('market.service') }}
          </div>
          <div style="color: #4E5969;" v-html="info.description"></div>
        </div>
      </template>
      <template v-if="[1].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="flex align-center justify-end p-15 mt-30 abs bfixed bg-white text-right l-t">
          <template v-if="checkAbility(['BRAND_MEMBER'], 3) && rests.expiresDatetime">
            <div class="mr-20 fs-b3 text-danger">￥0</div>
          </template>
          <template v-else-if="info.priceSettings">
            <div class="mr-20 fs-b3 text-danger">{{ info.priceSettings[dform.priceCode][cycleKey] || 0 }}</div>
          </template>
          <el-button size="medium" type="primary" @click="setRows(1, curRow, 2)" :disabled="clickSubmit">{{
            checkAbility(['BRAND_MEMBER'], 3) ? `${$t('market.addNow')}` : `${$t('public.buyNow')}` }}</el-button>
        </div>
      </template>
      <template v-if="[0].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="520px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 2">
        <div class="text-black">
          <div class="flex align-center mb-10">
            <div class="mr-20 w-60 text-grey">{{ $t('market.serverName') }}</div>
            <div>{{ info.name }}</div>
          </div>
          <div class="flex align-center mb-10" v-if="info.priceSettings">
            <div class="mr-20 w-60 text-grey">{{ $t('market.serviceMode') }}</div>
            <div>{{ info.priceSettings[dform.priceCode].priceName }}</div>
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-20 w-60 text-grey">{{ $t('public.payType') }}</div>
            <div>{{ $t('payType.khb') }}（{{ $t('payType.balance') }}：{{ money.happyCurrencyNum || 0
            }}{{ $t('public.individual') }}）</div>
          </div>
          <div class="flex align-center mb-10">
            <div class="mr-20 w-60 text-grey">{{ $t('shopping.paidInAmount') }}</div>
            <div class="flex align-center" v-if="checkAbility(['BRAND_MEMBER'], 3) && rests.expiresDatetime">
              <div class="fs-b3 text-danger">￥0</div>
              <div class="ml-10 fs-c1 text-black3 text-line" v-if="info.priceSettings">￥{{
                info.priceSettings[dform.priceCode][cycleKey] || 0 }}</div>
            </div>
            <div class="fs-c1 text-danger" v-else-if="info.priceSettings">{{ info.priceSettings[dform.priceCode][cycleKey]
              || 0 }}</div>
          </div>
        </div>
        <div class="mt-30 text-center">
          <el-button size="medium" class="bg-body" @click="dialogStatus = false; dialogType = 1; drawerStatus = true">{{
            $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <div class="text-center fs-c1">
          <div class="text-green" style="font-size: 48px;">
            <i class="el-icon-success"></i>
          </div>
          <div class="mt-15 text-black">{{ $t('public.buySuccess') }}</div>
          <div class="mt-5 text-grey">{{ $t('market.text1') }}</div>
        </div>
        <div class="mt-30 text-center">
          <el-button size="medium" class="bg-body" @click="dialogStatus = false; $router.push({ path: `/market` })">{{
            $t('market.viewServices') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogStatus = false">{{ $t('public.iGotIt') }}</el-button>
        </div>
      </template>

    </el-dialog>
  </div>
</template>

<script>
import { arrayKeys, arrayToObj } from '@/utils/index'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
export default {
  name: 'appList',
  components: {
    Pagination,
    condition
  },
  data() {
    return {
      arrayKeys: arrayKeys,
      clickSubmit: false,
      tabs: [],
      form: {},
      list: [],
      listLoading: false,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 50,
        serviceTypeCode: '',
        deviceTypeCode: '0',
        type: '-1'
      },
      money: {},
      checkFree: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      dialogTitle: {
        1: '',
        2: this.$t('market.confirmationInformation'),
        3: '',
      },
      curRow: {},
      curIdx: 0,
      dform: {},
      info: {},

      cycle: [
        // {
        //   code: 'TRYOUT',
        //   key: 'TRYOUT',
        //   label: '免费试用七天'
        // },
        {
          code: 'MONTH',
          key: 'monthAmount',
          label: this.$t('market.oneMonth')
        },
        {
          code: 'YEAY',
          key: 'yearAmount',
          label: this.$t('market.aYear')
        },
        {
          code: 'PERMANENT',
          key: 'permanentAmount',
          label: this.$t('payType.permanent')
        }
      ],
    }
  },
  computed: {
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    myDeviceName() {
      return this.$store.getters.myDeviceName
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    rests() {
      return this.$store.getters.rests
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'buyService') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let query = this.$route.query,
      queryKey = ['deviceTypeCode'],
      fromKey = ['serviceName']
    for (var i in queryKey) {
      if (query[queryKey[i]]) {
        this.listQuery[queryKey[i]] = query[queryKey[i]]
      }
    }
    for (var i in fromKey) {
      if (query[fromKey[i]]) {
        this.$set(this.form, fromKey[i], query[fromKey[i]])
      } else {
        delete this.form[fromKey[i]]
      }
    }
    if (this.listQuery.deviceTypeCode) this.listQuery.serviceTypeCode = 'CUSTOMIZE'
    if (this.$route.meta.reload) {
      this.getList()
    } else if (this.urlQuery != this.$route.meta.urlQuery) {
      if (this.listQuery.deviceTypeCode == 0 && !this.form.serviceName) {
        this.listQuery.deviceTypeCode = Object.values(this.myDeviceName)[0]
        this.listQuery.serviceTypeCode = 'CUSTOMIZE'
      }
      this.toQuery()
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted() {
    this.$store.dispatch('api/getServiceType').then(res => {
      this.tabs = res
    })
    this.$get('iot-saas-pay/api/pay/withdraw/balance').then(res => {
      this.money = res || {}
    })
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.list = []
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      this.form = {}
      this.listQuery.page = 1
      this.listQuery.size = 24
      this.list = []
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.serviceTypeCode == 0) delete params.serviceTypeCode
      if (params.deviceTypeCode == 0 || params.serviceTypeCode == 'SYSTEM') {
        delete params.deviceTypeCode
        this.listQuery.deviceTypeCode = '0'
      }
      if (params.type < 0) delete params.type
      this.$get('iot-saas-basic/client/service/market/findPage', params).then((res = {}) => {
        this.list = this.list.concat(res.rows || [])
        this.listLoading = false
        this.clickSubmit = false
        if (params.page == 0) {
          this.listTotal = res.total || 0
        }
        //this.getNoFreeApp(arrayKeys(this.list, 'serviceId'))
        this.onLoadPage = false
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 免费使用
     */
    getNoFreeApp(serviceIds = []) {
      if (serviceIds.length <= 0) return
      this.$get('iot-saas-basic/client/service/market/findListTryoutStatus', {
        serviceIds: serviceIds
      }).then(res => {
        if (res) this.checkFree = arrayToObj(res, 'serviceId', 'statusCode')
      })
    },

    /**
     * 加载更多
     */
    loadPage() {
      if ((parseInt(this.listTotal) / this.listQuery.size) > this.listQuery.page && !this.onLoadPage) {
        this.onLoadPage = true
        this.listQuery.page++
        this.getList()
      }
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型  2 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '查看详情' 2：'确认购买'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          if (dialogType == 2) {
            this.drawerStatus = false
          } else {
            this.dform = {}
          }
          this.dialogStatus = true
          break
        case 2:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dform = {
            cycle: 'MONTH',
            priceCode: ''
          }
          if (dialogType == 1) {
            this.info = {}
            this.$get(`iot-saas-basic/admin/service/market/${row.serviceId}`).then(res => {
              this.dialogTitle[1] = res.name
              this.dform.priceCode = res.priceSettings[0].priceCode
              res.priceSettings = arrayToObj(res.priceSettings, 'priceCode')
              for (var i in this.cycle) {
                if (res.priceSettings[this.dform.priceCode][this.cycle[i].key] > 0) {
                  this.dform.cycle = this.cycle[i].code
                  this.cycleKey = this.cycle[i].key
                  break
                }
              }
              this.info = res
            })
          }
          this.drawerStatus = true
          break
      }
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
        case 2:
          params.payTypeCode = 'HAPPY_MONEY'
          params.serviceId = curRow.serviceId
          this.$post('iot-saas-basic/client/service/market/buy', params).then(res => {
            this.$store.dispatch('user/getInfo')
            this.$root.$emit('getBalance')
            this.dialogType = 3
            this.clickSubmit = false
            this.toQuery()
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },
  }
}
</script>

<style lang="scss" scoped>@import './list.scss';</style>
