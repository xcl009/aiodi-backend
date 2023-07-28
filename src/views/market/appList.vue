<template>
  <div>
    <el-tabs class="mb-0 bg-white" v-model="listQuery.serviceTypeCode" type="card" @tab-click="toQuery">
      <el-tab-pane label="全部服务" name=""></el-tab-pane>
      <el-tab-pane label="系统服务" name="SYSTEM"></el-tab-pane>
      <el-tab-pane label="品类服务" name="CUSTOMIZE"></el-tab-pane>
      <!-- <el-tab-pane label="主题皮肤" name="THEME"></el-tab-pane> -->
    </el-tabs>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName && listQuery.serviceTypeCode == 'CUSTOMIZE'">
          <div class="mr-10">设备类型</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane label="全部设备" :name="''" />
            <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
        <!-- <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">服务类型</div>
          <el-tabs class="flex-1" v-model="listQuery.Type" @tab-click="toQuery()">
            <el-tab-pane label="全部服务" name="" />
            <el-tab-pane label="VIP服务" name="1" />
            <el-tab-pane label="SVIP服务" name="2" />
          </el-tabs>
        </div> -->
      </template>
      <template v-slot:defult>
        <el-form-item label="服务名称">
          <el-input v-model="form.serviceName" placeholder="服务名称" />
        </el-form-item>
      </template>
    </condition>

    <div class="load-box" v-infinite-scroll="loadPage">
      <div class="p-30 text-center bg-white" v-if="listTotal == 0">
        服务持续更新中，请持续关注服务市场
      </div>
      <el-row :gutter="10">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-10 list-item cursor bg-white shadow-light" @click="$router.push({path: `/market/buyApp?id=${item.serviceId}`})">
            <el-image
              class="list-img"
              :src="item.url"
              fit="cover"></el-image>
            <div class="mt-10 flex align-center">
              <div class="text-black fs-c1">{{ item.serviceName }}</div>
              <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)" v-if="checkAbility(['BRAND_MEMBER'], 3)">会员免费</el-tag>
              <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)" v-else-if="item.serviceTypeCode != 'CATEGORY' && checkFree[item.serviceId] != 'YES'">0元试用</el-tag>
            </div>
            <div class="mt-10 fs-s2 text-cut_two">
              {{ item.brief }}
            </div>
            <div class="mt-15 flex align-center">
              <template v-if="checkAbility(['BRAND_MEMBER'], 3)">
                <div class="flex1">
                  <span class="mr-5 fs-b3 text-danger">￥0</span>
                  <template v-for="(sitem, idx) in item.priceSettings">
                    <template v-if="idx == 0">
                      <span class="text-grey text-line">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount > 0 ? `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                      <span class="text-grey">{{ sitem.monthAmount > 0 ? `/月` : sitem.yearAmount > 0 ? `/年` : `/永久` }}</span>
                    </template>
                  </template>
                </div>
              </template>
              <template v-else>
                <template v-for="(sitem, idx) in item.priceSettings">
                  <div class="flex1" v-if="idx == 0">
                    <span class="fs-b3 text-danger">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount > 0 ? `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                    <span class="text-grey">{{ sitem.monthAmount > 0 ? `/月付` : sitem.yearAmount > 0 ? `/年付` : `/永久` }}</span>
                  </div>
                </template>
              </template>
              <template v-if="item.serviceTypeCode != 'CUSTOMIZE' || myDeviceId[item.deviceTypeCode]">
                <el-button type="info" size="medium" v-if="checkAbility(arrayKeys(item.priceSettings, 'priceCode'), 4)">已选用</el-button>
                <el-button type="primary" size="medium" v-else>{{ checkAbility(['BRAND_MEMBER'], 3) ? '立即添加' : '立即购买'}}</el-button>
              </template>
              <template v-else>
                <el-button type="info" size="medium">无{{ myDeviceId[item.deviceTypeCode] }}品类，不可选</el-button>
              </template>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
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
          deviceTypeCode: '',
          //Type: ''
        },
        checkFree: {}
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
        if(query[queryKey[i]]){
          this.listQuery[queryKey[i]] = query[queryKey[i]]
        }
      }
      for (var i in fromKey) {
        if(query[fromKey[i]]){
          this.$set(this.form, fromKey[i], query[fromKey[i]])
        } else {
          delete this.form[fromKey[i]]
        }
      }
      if(this.listQuery.deviceTypeCode) this.listQuery.serviceTypeCode = 'CUSTOMIZE'
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        if(!this.listQuery.deviceTypeCode && !this.form.serviceName){
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
        if(params.deviceTypeCode == 0 || params.serviceTypeCode != 'CUSTOMIZE') delete params.deviceTypeCode
        if(params.Type == 0) delete params.Type
        this.$get('iot-saas-basic/client/service/market/findPage', params).then((res = {}) => {
          this.list = this.list.concat(res.rows || [])
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total || 0
          }
          this.getNoFreeApp(arrayKeys(this.list, 'serviceId'))
          this.onLoadPage = false
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 免费使用
       */
      getNoFreeApp(serviceIds = []){
        if(serviceIds.length <= 0) return
        this.$get('iot-saas-basic/client/service/market/findListTryoutStatus', {
          serviceIds: serviceIds
        }).then(res => {
          if(res) this.checkFree = arrayToObj(res, 'serviceId', 'statusCode')
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
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-row{
    margin: 0 !important;
  }
  .list-item{
    margin-top: 10px;
    border-radius: 4px;
    .list-img{
      width: 44px;
      height: 44px;
      border-radius: 4px;
      border: thin solid #f5f5f5;
    }
    .text-cut_two{
      height: 32px;
    }
    /deep/ .el-rate__icon{
      margin-right: 0;
    }
    .el-tag{
      border: none;
      color: #07C160;
    }
  }
  .load-box{
    height: calc(100vh - 180px);
    overflow-y: scroll;
  }
</style>
