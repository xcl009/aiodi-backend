<template>
  <div class="p-5">
    <condition ref="condition" :clickSubmit="clickSubmit" :defaultShowLength="2" @reset="reset" @query="toQuery">
      <template v-slot:left>
        <div class="pl-10 max-w filter-btn_box white-space">
          <el-scrollbar>
            <el-button size="medium" :type="!listQuery.serviceTypeCode ? 'primary' : ''"
              :class="{'btn-body': listQuery.serviceTypeCode}"
              @click="listQuery.serviceTypeCode = ''; toQuery(2)">全部服务</el-button>
            <el-button size="medium" :type="listQuery.serviceTypeCode == item.code ? 'primary' : ''"
              :class="{'btn-body': listQuery.serviceTypeCode != item.code}" v-for="item in tabs"
              @click="listQuery.serviceTypeCode = item.code; toQuery(2)">{{ item.name }}</el-button>
          </el-scrollbar>
        </div>
      </template>
      <template v-slot:defult>
        <el-form-item label="设备类型">
          <el-select placeholder="设备类型" v-model="form.deviceTypeCode" @change="toQuery()">
            <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input v-model="form.serviceName" placeholder="服务名称" />
        </el-form-item>
      </template>
    </condition>

    <div class="load-box" v-infinite-scroll="loadPage">
      <el-row :gutter="10">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-10 list-item cursor bg-white shadow-light" @click="$router.push({path: `/market/buyApp?id=${item.serviceId}`})">
            <el-image
              class="list-img"
              :src="item.url"
              fit="cover"></el-image>
            <div class="mt-10 flex align-center">
              <div class="text-black fs-c1">{{ item.serviceName }}</div>
              <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)" v-if="item.serviceTypeCode != 'CATEGORY' && checkFree[item.serviceId] != 'YES'">0元试用</el-tag>
              <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)">会员免费</el-tag>
            </div>
            <div class="mt-10 fs-s2 text-cut_two">{{ item.desc  || '暂无简介'}}</div>
            <div class="mt-15 flex align-center">
              <template v-for="(sitem, idx) in item.priceSettings">
                <div class="flex1" v-if="idx == 0">
                  <span class="fs-b3 text-danger">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount > 0 ? `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                  <span class="text-grey">{{ sitem.monthAmount > 0 ? `/月付` : sitem.yearAmount > 0 ? `/年付` : `/永久` }}</span>
                </div>
              </template>
              <el-button type="primary" size="medium">立即购买</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="p-30 text-center bg-white" v-if="listTotal == 0">
      服务持续更新中，请持续关注服务市场
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
        clickSubmit: false,
        tabs: [],
        form: {},
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 24
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
    height: calc(100vh - 120px); 
    overflow-y: scroll;
  }
</style>
