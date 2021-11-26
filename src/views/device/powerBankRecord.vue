<template>
  <div class="m-10 pl-10 pr-10 bg-white">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      stripe
      highlight-current-row
    >
      <el-table-column label="时间">
        <template slot-scope="scope">
          {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
        </template>
      </el-table-column>
      <el-table-column label="类型">
        <template slot-scope="scope">
          {{ scope.row.action_step_desc  }}
        </template>
      </el-table-column>
      <el-table-column label="宝SN码">
        <template slot-scope="scope">
          {{ scope.row.bao_goods_sn }}
        </template>
      </el-table-column>
      <el-table-column label="底座SN码">
        <template slot-scope="scope">
          {{ scope.row.zuo_goods_sn }}
        </template>
      </el-table-column>
      <el-table-column label="设备SN码">
        <template slot-scope="scope">
          {{ scope.row.zuo_device_id }}
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
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'BindEquip',
  components: {
    Pagination
  },
  data() {
    return {
      list: [],
      listLoading: true,
      listQuery: {
        page_num: 1,
        bao_goods_id: this.$route.params.id
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.start - 1
      })
      this.$get('agentapi/device/battery_flow_record', listQuery).then(res => {
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
