<template>
  <div>
    <condition ref="condition" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="listQuery.serviceTypeCode" @tab-click="toQuery()">
          <el-tab-pane label="全部" :name="'0'" />
          <el-tab-pane :label="item.name" :name="item.code" v-for="(item, index) in tabs" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-select placeholder="设备类型" v-model="form.deviceTypeCode" @change="toQuery()">
          <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
        </el-select>
        <el-input v-model="form.serviceName" placeholder="服务名称"/>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
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
                <el-tag class="ml-5" size="mini" color="rgba(7, 193, 96, 0.1)" v-if="item.serviceTypeCode != 'CATEGORY' && checkFree[item.serviceId] != 'YES'">免费试用七天</el-tag>
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
          :pageSizes="[15, 30]"
          @pagination="getList"
        />
        <div class="p-30" v-if="listTotal == 0">服务持续更新中，请持续关注服务市场</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { arrayKeys, arrayToObj} from '@/utils/index'
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
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
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
        if(params.serviceTypeCode == 0) delete params.serviceTypeCode
        this.$get('iot-saas-basic/client/service/market/findPage', params).then((res = {}) => {
          this.list = res.rows || []
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total || 0
          }
          this.getNoFreeApp(arrayKeys(this.list, 'serviceId'))
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
