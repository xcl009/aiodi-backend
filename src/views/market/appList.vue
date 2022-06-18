<template>
  <div>
    <div class="pt-15 pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex align-center">
        <div class="flex1">
          <el-button size="medium" :type="!listQuery.serviceTypeCode ? 'primary' : ''"
            :class="{'btn-body': listQuery.serviceTypeCode}"
            @click="listQuery.serviceTypeCode = ''; toQuery()">全部</el-button>
          <el-button size="medium" :type="listQuery.serviceTypeCode == item.code ? 'primary' : ''"
            :class="{'btn-body': listQuery.serviceTypeCode != item.code}" v-for="item in tabs"
            @click="listQuery.serviceTypeCode = item.code; toQuery()">{{ item.name }}</el-button>
        </div>
      </div>

      <el-row :gutter="24">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="8" v-for="item in list">
          <div class="flex align-center list-item cursor" @click="$router.push({path: `/market/buyApp?id=${item.serviceId}`})">
            <el-image
              class="list-img"
              :src="item.url"
              fit="cover"></el-image>
            <div class="pl-15 pr-15 flex1">
              <div class="flex align-center text-black">
                <div>{{ item.serviceName }}</div>
                <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)" v-if="item.serviceTypeCode != 'CATEGORY'">免费试用七天</el-tag>
                <div class="flex1"></div>
                <!-- <el-rate :value="5" disabled></el-rate> -->
              </div>
              <div class="mt-10 fs-s2 text-cut_two" v-html="item.description"></div>
              <div class="mt-10 flex align-center">
                <template v-for="(sitem, idx) in item.priceSettings">
                  <div class="flex1 fs-b2 text-danger" v-if="idx == 0">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}/月付` : sitem.yearAmount > 0 ? `¥${sitem.yearAmount}/年付` : `¥${sitem.permanentAmount}/永久` }}</div>
                </template>
                <el-button type="primary" size="medium">立即购买</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="flex justify-center">
        <pagination
          v-if="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
        <div class="p-30" v-if="listTotal == 0">服务持续更新中，请持续关注服务市场</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {arrayKeys} from '@/utils/index'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'agentWithdraw',
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
          size: 15
        }
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
      }
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
        this.listQuery.size = 15
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-basic/client/service/market/findPage', params).then(res => {
          this.list = res ? res.rows : []
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res ? res.total : 0
          }
          //this.getNoFreeApp(arrayKeys(this.list, 'serviceId'))
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 免费使用
       */
      getNoFreeApp(serviceIds = []){
        console.log(serviceIds)
        if(serviceIds.length <= 0) return
        this.$get('iot-saas-basic/client/service/market/findListTryoutStatus', {
          serviceIds: serviceIds
        }).then(res => {
          console.log(res)
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .list-item{
    margin: 12px 0;
    border: 1px solid #E5E6EB;
    border-radius: 2px;
    .list-img{
      width: 138px;
      height: 138px;
      border-radius: 2px;
    }
    /deep/ .el-rate__icon{
      margin-right: 0;
    }
    .el-tag{
      border: none;
      color: #07C160;
    }
  }

</style>
