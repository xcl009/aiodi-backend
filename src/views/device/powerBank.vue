<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="用户类别:">
          <el-select v-model="listQuery.search_user_type" @change="toQuery()">
            <el-option label="本人" :value="0"/>
            <el-option label="下级" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名称：">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="充电宝SN：" class="hidden-sm-and-down">
          <el-input v-model="form.search_bao_sn" />
        </el-form-item>
        <el-form-item label="设备SN码：" class="hidden-lg-and-down">
          <el-input v-model="form.search_zuo_sn" />
        </el-form-item>
        <el-form-item label="底座SN码：" class="hidden-xg-and-down">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="toQuery()">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('equip_table', '设备记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="充电宝SN：" class="hidden-md-and-up">
          <el-input v-model="form.search_bao_sn" />
        </el-form-item>
        <el-form-item label="设备SN码：" class="hidden-xg-and-up">
          <el-input v-model="form.search_zuo_sn" />
        </el-form-item>
        <el-form-item label="底座SN码：" class="hidden-xl-only">
          <el-input v-model="form.search_device_id" />
        </el-form-item>
        <el-form-item label="代理商：">
          <el-input v-model="form.search_agent_name" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="flex bg-white">
        <div class="flex1">
          <el-tabs v-model="listQuery.device_status" class="mb-0" type="card" @tab-click="typeClick">
            <el-tab-pane :label="`全部(${numInfo.total_num || 0})`" name="0" />
            <el-tab-pane :label="`在槽(${numInfo.bao_in_cao_num || 0})`" name="1" />
            <el-tab-pane :label="`弹出(${numInfo.bao_ejected_num || 0})`" name="2" />
            <el-tab-pane :label="`超时(${numInfo.bao_losted_num || 0})`" name="4" />
            <el-tab-pane :label="`异常(${numInfo.bao_different_cao_num || 0})`" name="5" />
          </el-tabs>
        </div>
      </div>

      <div class="bg-white">
        <el-table
          id="equip_table"
          ref="equip_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
          :max-height="tableMaxH"
        >
          <el-table-column label="商户名称">
            <template slot-scope="scope">
              {{ scope.row.nowat_store_name }}
            </template>
          </el-table-column>
          <el-table-column label="设备SN码" width="120">
            <template slot-scope="scope">
              {{ scope.row.nowat_zuo_sn }}
            </template>
          </el-table-column>
          <el-table-column label="底座SN码" width="120">
            <template slot-scope="scope">
              {{ scope.row.nowat_zuo_device_id || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="充电宝SN码" width="120">
            <template slot-scope="scope">
              {{ scope.row.goods_sn || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="归属代理" width="100">
            <template slot-scope="scope">
              {{ scope.row.bao_manage_name || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="归还代理" width="120">
            <template slot-scope="scope">
              {{ scope.row.nowat_zuo_manage_name || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="租借次数" width="120">
            <template slot-scope="scope">
              {{ scope.row.nowat_bao_used_num || '0' }}
            </template>
          </el-table-column>
          <el-table-column label="充电宝电量" width="120">
            <template slot-scope="scope">
              {{ scope.row.nowat_bao_electricity || "--" }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template slot-scope="scope">
              {{ statusArr[scope.row.status] || '' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button type="primary" size="small" plain round class="mb-5" @click="ejectEquip(scope.row)" v-if="scope.row.status == 0 && scope.row.depend_store_id > 0">立即弹出</el-button>
              <el-button type="primary" size="small" plain round class="mb-5 ml-0" @click="$router.push({path: `/equipment/powerBankRecord/${scope.row.id}`})">流通记录</el-button>
              <el-button type="primary" size="small" plain round class="mb-5 ml-0" @click="$router.push({path: `/order/${listQuery.search_user_type == 0 ? 'meOrder' : 'subOrder'}?search_goods_id=${scope.row.id}`})">租借订单</el-button>
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
  name: 'BindEquip',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      nowTime: Date.parse(new Date()) / 1000,
      statusArr: ['未弹出', '准备弹出', '已弹出', '有异物', '充电口有异常'],
      form: {

      },
      numInfo: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listQuery: {
        device_status: '0',
        search_user_type: 0,
        page_num: 1
      }
    }
  },
  mounted() {
    this.getStatNum()
    this.getList()
  },
  methods: {
    /**
     * 数量
     */
    getStatNum() {
      const listQuery = Object.assign({}, this.listQuery, this.form)
      this.$get('agentapi/batterys_data_stat_num', listQuery).then(res => {
        this.numInfo = res
        if(this.$refs.equip_table) this.tableMaxH = window.innerHeight - this.$refs.equip_table.$el.offsetTop - 85
      })
    },

    /**
     * 请求类型筛选
     * @param {Object} tab
     * @param {Object} event
     */
    typeClick(tab, event) {
      this.listQuery.device_status = tab.name
      this.listQuery.page = 1
      this.getList()
    },

    /**
     * 搜索查询
     */
    toQuery(type = 0) {
	  this.$refs.filterDrawer.hide()
      if (type == 1) {
        this.form = {}
        this.listQuery.page = 1
      } else {
        this.listQuery.page = 1
      }
      this.getStatNum()
      this.getList()
    },

    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.page - 1
      })
      if(this.sort_id_key && window.sort_id_key) listQuery.sort_id_key= window.sort_id_key
      this.$get('agentapi/search/query_batterys', listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.page_num = res.page_num
        if(this.total_device_num == 0){
          for(var i in res.type_device_num){
            this.total_device_num += res.type_device_num[i]
          }
          this.type_device_num = res.type_device_num
        }
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 弹出设备
     */
    ejectEquip(row){
      let cang_num = []
      this.loadObj = this.$loading({
        lock: true,
        text: '弹出中~~~',
        spinner: 'el-icon-loading'
      })
      this.$post('agentapi/eject_baos', {
        zuo_sn: row.nowat_zuo_sn,
        cang_num: [row.nowat_cang_num]
      }).then(res => {
        this.loadObj.close()
        this.$message({
          message: '弹出成功',
          type: 'success'
        })
        row.status = 2
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  #equip_table .el-button{
    padding-left: 0;
    padding-right: 0;
    width: 85px;
  }
</style>
