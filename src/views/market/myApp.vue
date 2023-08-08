<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :filterForm="false" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-20 pt-10 pl-10 pr-10 flex align-center bg-white">
          <div class="mr-10">服务类型</div>
          <el-tabs class="flex-1" v-model="listQuery.serviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane label="全部服务" :name="''" />
            <el-tab-pane label="系统服务" name="SYSTEM" />
            <el-tab-pane label="品类服务" name="CUSTOMIZE" />
            <!-- <el-tab-pane label="主题皮肤" name="THEME" /> -->
          </el-tabs>
        </div>
        <div class="mb-20 pl-10 pr-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">设备类型</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane label="全部设备" :name="'0'" :disabled="listQuery.serviceTypeCode == 'SYSTEM'"/>
            <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" :disabled="listQuery.serviceTypeCode == 'SYSTEM'"/>
          </el-tabs>
        </div>
        <div class="mb-20 pl-10 pr-10 flex align-center bg-white">
          <div class="mr-10">会员服务</div>
          <el-tabs class="flex-1" v-model="listQuery.Type" @tab-click="toQuery()">
            <el-tab-pane label="全部服务" name="-1" />
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

    <div v-infinite-scroll="loadPage" class="pb-20 load-box">
      <div class="p-30 text-center bg-white text-primary cursor" @click="$router.push({path: `/market/appList`})" v-if="listTotal == 0">
        暂未购买增值服务，去购买
      </div>
      <el-row :gutter="20">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-20 list-item cursor bg-white" @click="$router.push({path: `/market/buyApp?id=${item.serviceId}`})">
            <div class="flex align-start">
              <el-image
                class="list-img"
                :src="item.serviceUrl"
                fit="cover"></el-image>
              <div class="flex1"></div>
              <div class="flex align-center">
                <span class="mr-5 fs-b5 text-green" :class="{'text-danger' : item.orderStatusName == '已到期', 'text-orange' : item.orderStatusName == '即将到期'}">•</span>
                <span>{{ item.orderStatusName }}</span>
              </div>
            </div>
            <div class="mt-15 text-black fs-c1 text-cut">
              {{ item.serviceName }}-{{ item.priceName }}
            </div>
            <div class="mt-15 fs-s2 text-cut_two">{{ item.brief  || '暂无简介'}}</div>
            <div class="mt-15 flex align-center">
              <div class="flex1">
                {{ item.expiresDatetime }}到期
              </div>
              <el-button type="primary" size="medium" plain v-if="item.cycleTypeName != '永久'">{{ checkAbility(['BRAND_MEMBER'], 3) ? '立即续用' : '立即续费'}}</el-button>
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
    name: 'myApp',
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
          size: 24,
          serviceTypeCode: '',
          deviceTypeCode: '0',
          Type: '-1'
        },
        checkFree: {}
      }
    },
    activated() {
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
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      myDeviceName() {
        return this.$store.getters.myDeviceName
      },
      rests() {
        return this.$store.getters.rests
      }
    },
    mounted() {
      // this.$store.dispatch('api/getServiceType').then(res => {
      //   this.tabs = res
      // })
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
        if(params.Type < 0) delete params.Type
        this.$get('iot-saas-basic/client/service/market/record/findPage', params).then((res = {}) => {
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
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './list.scss';
</style>
