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

    <div v-infinite-scroll="loadPage" class="load-box">
      <el-row :gutter="10">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-10 list-item cursor bg-white shadow-light" @click="$router.push({path: `/market/buyApp?id=${item.serviceId}`})">
            <el-image
              class="list-img"
              :src="item.serviceUrl"
              fit="cover"></el-image>
            <div class="mt-10 flex align-center">
              <div class="text-black fs-c1">{{ item.serviceName }}</div>
              <el-tag class="normal ml-5" size="mini" :class="{'expired' : item.orderStatusName == '已到期', 'is-expired' : item.orderStatusName == '即将到期'}">{{ item.orderStatusName }}</el-tag>
            </div>
            <div class="mt-10 fs-s2 text-cut_two">{{ item.brief  || '暂无简介'}}</div>
            <div class="mt-15 flex align-center">
              <div class="flex1">
                到期时间：{{ item.expiresDatetime }}
              </div>
              <el-button type="primary" size="medium" @click="$router.push({path: `/market/buyApp?id=${item.serviceId}`})" v-if="item.cycleTypeName != '永久'">{{ checkAbility(['BRAND_MEMBER'], 3) ? '去续用' : '去续费'}}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="p-30 text-center bg-white text-primary cursor" @click="$router.push({path: `/market/appList`})" v-if="listTotal == 0">
      暂未购买增值服务，去购买
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
  /deep/ .el-row{
    margin: 0 !important;
  }
  .load-box{
    max-height: calc(100vh - 120px);
    overflow-y: scroll;
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
      &.normal{
        background-color: rgba(7, 193, 96, 0.1);
        color: #07C160;
      }
      &.is-expired{
        background-color: rgba(255, 163, 44, 0.1);
        color: #FFA32C;
      }
      &.expired{
        background-color: #F2F3F5;
        color: #86909C;
      }
    }
  }

</style>
