<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-form-item label="服务类型">
          <el-select placeholder="服务类型" v-model="form.serviceTypeCode" @change="toQuery()">
            <el-option v-for="item in tabs" :label="item.name" :value="''+item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select placeholder="设备类型" v-model="form.deviceTypeCode" @change="toQuery()">
            <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="周期类型">
          <el-select placeholder="周期类型" v-model="form.cycleType" @change="toQuery()">
            <el-option v-for="item in cycleType" :label="item.name" :value="''+item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input placeholder="服务名称" v-model="form.serviceName" />
        </el-form-item>
        <el-form-item label="品牌名称">
          <el-input placeholder="品牌名称" v-model="form.brandName" />
        </el-form-item>
		  </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
        stripe highlight-current-row :max-height="tableMaxH">
        <el-table-column label="品牌" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.brandName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="服务类型">
          <template slot-scope="scope">
            {{ scope.row.serviceTypeName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="设备类型">
          <template slot-scope="scope">
            {{ scope.row.deviceTypeName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="服务名称" min-width="200">
          <template slot-scope="scope">
            {{ scope.row.serviceName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="周期">
          <template slot-scope="scope">
            {{ scope.row.cycleTypeName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="支付快活币" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.payAmount || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="到期时间" min-width="150">
          <template slot-scope="scope">
            {{ scope.row.expiresDatetime || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="190">
          <template slot-scope="scope">
            {{ scope.row.remark || '--' }}
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
    name: 'payRecord',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        tabs: [],
        cycleType: [
          {
            name: '月付',
            value: 'MONTH'
          },
          {
            name: '年付',
            value: 'YEAR'
          },
          {
            name: '永久',
            value: 'ALL'
          }
        ],
        form: {
          brandName: ''
        },
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == '') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      this.form.brandName = this.$route.query.brandName || ''
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery()
        this.getServiceType()
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
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
        this.$get('iot-saas-basic/admin/service/market/record/findPage', params).then(res => {
          this.listLoading = false
          this.list = res ? res.rows : []
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res ? res.total : 0
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
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
