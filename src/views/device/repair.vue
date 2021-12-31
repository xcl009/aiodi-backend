<template>
  <div class="p-5">
    <el-tabs class="bg-white" type="card" v-model="getType" @tab-click="typeClick">
      <el-tab-pane label="我的设备" name="0"></el-tab-pane>
      <el-tab-pane label="下级设备" name="1" v-if="!checkRoles(['salesman'])"></el-tab-pane>
    </el-tabs>
    <div class="bg-white">
      <div class="pr-10 flex align-center ">
        <div class="flex1"></div>
        <el-button size="small" type="primary" plain @click="outTab('order_table')">导出<i class="el-icon-male el-icon--right"></i></el-button>
      </div>
      <el-table id="order_table"
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        stripe
        highlight-current-row
      >
        <el-table-column label="商户">
          <template slot-scope="scope">
            <div>{{ scope.row.store_name || '--'}}</div>
            <div>{{ scope.row.mobile || '--'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户地址">
          <template slot-scope="scope">
            {{ scope.row.address || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="设备负责人" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.operator_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="负责人电话" width="120">
          <template slot-scope="scope">
            {{ scope.row.operator_phone || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="设备状态">
          <template slot-scope="scope">
            {{ statusArr[scope.row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template slot-scope="scope">
            {{ scope.row.add_date }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button v-if='getType == 0' class="e-btn mt-10" type="primary" size="mini" @click="getMiniCategoryList(scope.row)">确认处理</el-button>
          </template>
        </el-table-column> -->
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit" :page-count="listQuery.page_num" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'repair',
    components: { Pagination },
    data() {
      return {
        getType: 0,
        typeUrl: ['agentapi/my_repair_reposts', 'agentapi/my_sttuf_repair_reposts'],
        statusArr: ['已报修','维修中','已修复'],
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1
        }
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.getType = tab.name
        this.listQuery.page = 1
        this.getList()
      },

      getList(){
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.page - 1
        });
        this.$get(this.typeUrl[this.getType], listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
