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
        <el-input v-model="form.serviceName" placeholder="服务名称"/>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/market/addApp`})"><i class="el-icon-circle-plus-outline el-icon--left" />添加服务</el-button>
      </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
        stripe highlight-current-row :max-height="tableMaxH">
        <el-table-column label="服务类型">
          <template slot-scope="scope">
            {{ scope.row.serviceTypeName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="服务名称">
          <template slot-scope="scope">
            {{ scope.row.name || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="套餐">
          <template slot-scope="scope">
            <div v-for="item in scope.row.priceSettings">
              <span class="mr-10" v-if="scope.row.priceSettings.length > 1">{{ item.priceName }}</span>
              <span class="mr-10" v-if="item.monthAmount">月付：{{ item.monthAmount }}元</span>
              <span class="mr-10" v-if="item.yearAmount">年付：{{ item.yearAmount }}元</span>
              <span class="mr-10" v-if="item.permanentAmount">永久：{{ item.permanentAmount }}元</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button class="p-5 ml-0" type="text" @click="$router.push({path: `/market/addApp?id=${scope.row.id}`})">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'agent',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        tabs: [],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'appEdit') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery()
        this.getServiceType()
      }
    },
    computed: {

    },
    mounted() {

    },
    methods: {
      /**
       * 获取类型
       */
      getServiceType(){
        this.$store.dispatch('api/getServiceType').then(res => {
          this.tabs = res
        })
      },

      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
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
        if(params.serviceTypeCode == 0) delete params.serviceTypeCode
        this.$get('iot-saas-basic/admin/service/market/findPage', params).then(res => {
          this.listLoading = false
          this.clickSubmit = false
          this.list = res ? res.rows : []
          if(params.page == 0){
            this.listTotal = res? res.total : 0
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      }
	  }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header{
    margin-bottom: 0;
  }
</style>
