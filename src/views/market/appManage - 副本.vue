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
        <el-table-column label="套餐" min-width="300">
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
            <el-button class="p-5 ml-0" type="text" @click="setRows(1, scope.row, 1)" v-if="brandId">赠送服务</el-button>
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

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="flex justify-center">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="套餐" v-if="curRow.priceSettings">
              <el-radio-group v-model="dform.priceCode">
                <el-radio-button :label="item.priceCode" v-for="(item, key) in curRow.priceSettings">{{ item.priceName }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="dform.giveEndDatetime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择结束时间">
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
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
        },
        brandId: this.$route.query.brandId || '',

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '赠送服务'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      to.meta.urlQuery = JSON.stringify(to.query)
      if (from.name == 'addApp') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      let queryKey = ['brandId'], query = this.$route.query
      for(var i in queryKey){
        this[queryKey[i]] = query[queryKey[i]]
      }
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0 || this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery()
        this.getServiceType()
      }
      this.urlQuery = this.$route.meta.urlQuery
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
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '赠送服务'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 1){
              this.dform = {
                priceCode: row.priceSettings[0].priceCode,
                giveEndDatetime: this.parseTime(this.currentTime() + 30 * 86400)
              }
            }
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            if(!params.giveEndDatetime){
              this.$message({
                message: '请选择赠送服务结束时间',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-basic/admin/service/market/give', {
              priceCode: params.priceCode,
              giveEndDatetime: params.giveEndDatetime,
              serviceMarketId: this.curRow.id,
              brandId : this.brandId
            }).then(res => {
              this.$message({
                message: '赠送服务成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
	  }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header{
    margin-bottom: 0;
  }
</style>
