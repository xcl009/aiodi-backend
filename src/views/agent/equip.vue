<template>
  <div class="p-5">
    <div class="mb-5 pl-10 pt-10 pr-10 bg-white">
      <el-form ref="form" class="filter-from text-center" :inline="true">
        <el-form-item class="mb-10 flex1" label="设备类别：">
          <el-select v-model="listQuery.type">
            <el-option label="充电座" value="1" />
            <el-option label="密码线" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item class="mb-10 flex1" label="记录类型：">
          <el-select v-model="listQuery.distribute_flow">
            <el-option label="全部" value="0" />
            <el-option label="分配" value="1" />
            <el-option label="回收" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item class="mb-10">
          <el-button type="primary" @click="toQuery()">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('order_table')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="p-5 bg-white">
      <el-table id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="设备名称">
          <template slot-scope="scope">
            {{ scope.row.goods_name }}
          </template>
        </el-table-column>
        <el-table-column label="设备SN码">
          <template slot-scope="scope">
            {{ scope.row.goods_sn }}
          </template>
        </el-table-column>
        <el-table-column label="操作时间">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column label="操作类型">
          <template slot-scope="scope">
            <el-link :type="scope.row.flow_type == 1 ? 'danger' : 'success'">{{ scope.row.flow_type == 1 ? "回收" : "分配" }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">
            {{ scope.row.flow_reason }}
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.page_num > 0"
          :page.sync="listQuery.start"
          :page-count="listQuery.page_num"
          :limit.sync="listQuery.limit"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'Equipment',
  components: {
    Pagination
  },
  data() {
    return {
      list: [],
      listLoading: true,
      listQuery: {
        son_id: this.$route.query.son_id || '',
        type: '1',
        distribute_flow: '0',
        start: 1,
        limit: 20,
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
     * 搜索查询
     */
    toQuery(type = 0) {
      if (type == 1) this.form = {}
      this.listQuery.start = 1
      this.getList()
    },

    getList() {
      const listQuery = Object.assign({}, this.listQuery, {
        start: this.listQuery.start - 1
      })
      this.$get('agentapi/agent_distribute_log', listQuery).then(res => {
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
