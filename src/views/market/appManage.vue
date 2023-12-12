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
          <div class="mr-10">{{ $t('public.allDevice') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.deviceType')" :name="'0'" :disabled="listQuery.serviceTypeCode == 'SYSTEM'"/>
            <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" :disabled="listQuery.serviceTypeCode == 'SYSTEM'"/>
          </el-tabs>
        </div>
        <div class="mb-20 pl-10 pr-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.service') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.type" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allServer')" name="-1" />
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
      <el-row :gutter="20">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-20 list-item cursor bg-white">
            <el-image
              class="list-img"
              :src="item.url"
              fit="cover"></el-image>
            <div class="mt-15 text-black fs-c1">
              {{ item.name }}
            </div>
            <div class="mt-15 fs-s2 text-cut_two">{{ item.brief }}</div>
            <div class="mt-15 flex align-center">
              <template v-for="(sitem, idx) in item.priceSettings">
                <div class="flex1" v-if="idx == 0">
                  <span class="fs-b3 text-danger">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount > 0 ? `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                  <span class="text-grey">{{ sitem.monthAmount > 0 ? `/${$t('payType.monthlyPayment')}` : sitem.yearAmount > 0 ? `/${$t('payType.annualPayment')}` : `/${$t('payType.permanent')}` }}</span>
                </div>
              </template>
              <el-button type="primary" size="medium" @click="$router.push({path: `/market/addApp?id=${item.id}`})">{{ $t('public.modifyNow') }}</el-button>
              <el-button type="danger" @click="setRows(1, item, 1)" v-if="brandId">{{ $t('brand.giftService') }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-drawer
      :title="dialogTitle[dialogType]"
      :visible.sync="drawerStatus"
      >
      <template v-if="dialogType == 1">
        <div class="flex justify-center">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="套餐" v-if="curRow.priceSettings">
              <el-radio-group v-model="dform.priceCode">
                <el-radio-button :label="item.priceCode" v-for="(item, key) in curRow.priceSettings">{{ item.priceName }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="dform.giveEndDatetime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择结束时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="支付快活币">
              <el-input v-model="dform.khbPrice" />
              <div>支付快活币大0时，表示该记录显示为品牌正常支付，周期为月付。</div>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template v-if="[1].indexOf(dialogType) > -1">
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
  import { arrayKeys, arrayToObj} from '@/utils/index'
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

        brandId: this.$route.query.brandId || '',

        // 弹出相关
        dialogType: 1,
        drawerStatus: false,
        dialogTitle: {
          1: '赠送服务'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    activated() {
      let queryKey = ['brandId'],
        query = this.$route.query
      for (var i in queryKey) {
        this[queryKey[i]] = query[queryKey[i]]
      }
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery()
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      myDeviceName() {
        return this.$store.getters.myDeviceName
      },
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
    },
    mounted() {
      this.$store.dispatch('api/getServiceType').then(res => {
        this.tabs = res
      })
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.list = []
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
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
        if(params.serviceTypeCode == 0) delete params.serviceTypeCode
        if(params.deviceTypeCode == 0 || params.serviceTypeCode == 'SYSTEM'){
          delete params.deviceTypeCode
          this.listQuery.deviceTypeCode = '0'
        }
        if(params.type < 0) delete params.type
        this.$get('iot-saas-basic/admin/service/market/findPage', params).then((res = {}) => {
          this.list = this.list.concat(res.rows || [])
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total || 0
          }
          this.onLoadPage = false
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 加载更多
       */
      loadPage(){
        if((parseInt(this.listTotal) / this.listQuery.size) > this.listQuery.page && !this.onLoadPage){
          this.onLoadPage = true
          this.listQuery.page++
          this.getList()
        }
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '赠送服务'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 1){
              this.dform = {
                priceCode: row.priceSettings[0].priceCode,
                giveEndDatetime: this.parseTime(this.currentTime() + 30 * 86400, '{y}-{m}-{d}')
              }
            }
            this.drawerStatus = true
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
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            if(!params.giveEndDatetime){
              this.$message({
                message: '请选择赠送服务结束时间',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-basic/admin/service/market/give', {
              priceCode: params.priceCode,
              khbPrice: params.khbPrice || '',
              giveEndDatetime: params.giveEndDatetime + ' 23:59:59',
              serviceMarketId: this.curRow.id,
              brandId : this.brandId
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.drawerStatus = false
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
  @import './list.scss';
</style>
