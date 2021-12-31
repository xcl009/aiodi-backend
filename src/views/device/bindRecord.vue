<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.search_depend_type" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'-1'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-form-item label="操作类型:">
          <el-select v-model="form.distribute_type" @change="toQuery()">
            <el-option label="全部" :value="0"/>
            <el-option label="铺货" :value="1"/>
            <el-option label="解绑" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名称:">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="二维码:" class="hidden-sm-and-down">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="设备SN码:" class="hidden-lg-and-down">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :disabled="clickSubmit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '设备记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="二维码:" class="hidden-md-and-up">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item label="设备SN码:" class="hidden-xg-and-up">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table
          id="list_table"
          ref="list_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          :max-height="tableMaxH"
        >
          <el-table-column label="操作人">
            <template slot-scope="scope">
              <div>{{ agentList[scope.row.action_aid] ? agentList[scope.row.action_aid].name : '' }}</div>
              <div>{{ agentList[scope.row.action_aid] ? agentList[scope.row.action_aid].phone : '' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作类型">
            <template slot-scope="scope">
              {{ scope.row.distribute_type == 1 ? '铺货' : '解绑' }}
            </template>
          </el-table-column>
          <el-table-column label="操作时间">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column label="商户">
            <template slot-scope="scope">
              {{ scope.row.store_name || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="二维码">
            <template slot-scope="scope">
              {{ scope.row.goods_sn || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="设备类型">
            <template slot-scope="scope">
              {{ scope.row.goods_name || '--' }}
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
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
export default {
  name: 'bindRecord',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      nowTime: Date.parse(new Date()) / 1000,
      clickSubmit: false,
      form: {
        distribute_type: 0,
      },
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        search_depend_type: '-1',
        page_num: 1,
        limit: 20
      },
      agentList: {}
    }
  },
  computed:{
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
  },
  mounted() {
    this.getList()
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery(type = 0) {
      if(this.clickSubmit) return
      this.clickSubmit = true
      this.$refs.filterDrawer.hide()
      if (type == 1) {
        this.form = {}
        this.listQuery.page = 1
      } else {
        this.listQuery.page = 1
      }
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.page - 1
      })
      this.$get('agentapi/merchant/bind_device_records', listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.page_num = res.page_num
        this.getAgentList(this.arrayKeys(res.list, 'action_aid'))
        if(this.$refs.list_table) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 85
        this.clickSubmit = false
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },
    
    /**
     * 代理信息
     */
    getAgentList(aids = []) {
      this.$get('commonapi/configer/these_platform_info', {
        son_aids: JSON.stringify(aids)
      }).then(res => {
        this.agentList = res.list
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  #list_table .el-button{
    padding-left: 0;
    padding-right: 0;
    width: 85px;
  }
</style>
