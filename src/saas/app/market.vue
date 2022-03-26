<template>
  <div>
		<condition ref="condition">
      <template v-slot:tabs>
        <el-tabs class="pl-10 pr-10 mb-15 bg-white" v-model="listQuery.device_type" @tab-click="toQuery()">
          <el-tab-pane label="全部" :name="'0'" />
          <el-tab-pane label="品类" :name="'1'" />
          <el-tab-pane label="系统服务" :name="'2'" />
          <el-tab-pane label="密码线定制" :name="'3'" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-input v-model="form.name" placeholder="服务名称"/>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/app/create`})"><i class="el-icon-circle-plus-outline el-icon--left" />添加服务</el-button>
      </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
        stripe highlight-current-row :max-height="tableMaxH">
        <el-table-column label="服务类型">
          <template slot-scope="scope">
            {{ scope.row.money || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="基本信息">
          <template slot-scope="scope">
            {{ scope.row.money || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="服务种类">
          <template slot-scope="scope">
            {{ scope.row.money || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain class="ml-0" @click="">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.count > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="listQuery.count"
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
        form: {},
        tableMaxH: '250',
        list: [
          {}
        ],
        listLoading: false,
        listQuery: {
          page: 1,
          size: 20,
          count: 10
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "agentEdit") {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      this.zuo_sn = this.$route.query.zuo_sn || ''
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery(1)
      }
    },
    computed: {

    },
    mounted() {
      this.getServiceType()
    },
    methods: {
      /**
       * 获取类型
       */
      getServiceType(){
        this.$store.dispatch('api/getServiceType').then(res => {
          console.log(res)
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
        this.$get('/brand/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.clickSubmit = false
          if(params.page == 1){
            this.count = res.count
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
