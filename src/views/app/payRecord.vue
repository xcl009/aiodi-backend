<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
				<el-form-item label="合同类型:">
				  <el-select v-model="form.sort" @change="toQuery()">
				    <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
				  </el-select>
				</el-form-item>
        <el-form-item label="时间类型:">
          <el-select v-model="form.sort" @change="toQuery()">
            <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
          </el-select>
        </el-form-item>
				<el-form-item label="品牌名称:">
				  <el-input v-model="form.name" />
				</el-form-item>
				<el-form-item label="支付状态:">
				  <el-select v-model="form.sort" @change="toQuery()">
				    <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
				  </el-select>
				</el-form-item>
		  </template>
		</condition>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="品牌" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="支付用户" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="合同类型" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="具体类型" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="商户单号" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="交易单号" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="支付方式" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="时间类型" width="90">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="支付金额" width="200">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="当前月数">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="备注" width="190">
            <template slot-scope="scope">
              {{ scope.row.mark || '--' }}
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination
            v-show="listQuery.count > 0"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.size"
            :page-count="listQuery.count"
            @pagination="getList"
          />
        </div>
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
        sort_type: [],
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

    },
    methods: {
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
  
</style>
