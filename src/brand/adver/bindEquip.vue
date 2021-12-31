<template>
  <div class="p-10">
    <div class="mb-20 p-20 bg-white">
      <el-form ref="form" class="text-center" :model="form" :inline="true">
        <el-form-item class="ml-20" label="设备类别：">
          <el-select v-model="listQuery.search_goods_type" placeholder="请选择设备类别">
            <el-option label="充电座" value="1"></el-option>
            <el-option label="密码线" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="ml-20" label="设备状态：">
          <el-select v-model="listQuery.is_distributed" placeholder="请选择设备状态">
            <el-option label="全部" value="2"></el-option>
            <el-option label="未铺货" value="0"></el-option>
            <el-option label="已铺货" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="ml-20" label="商户名称：">
          <el-input v-model="listQuery.search_store_name" placeholder="请输入商户名称" />
        </el-form-item>
        <el-form-item class="ml-20" label="底座SN码：">
          <el-input v-model="listQuery.search_goods_sn" placeholder="请输入底座SN码" />
        </el-form-item>
      </el-form>
      <div class="flex justify-center">
        <el-button type="primary" @click="toQuery()">查询<i class="el-icon-search el-icon--right"></i></el-button>
        <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right"></i></el-button>
      </div>
    </div>

    <el-tabs class="mb-0 bg-white" type="card" v-model="listQuery.search_user_type" @tab-click="typeClick">
      <el-tab-pane label="我的设备" name="0"></el-tab-pane>
      <el-tab-pane label="下级设备" name="1" v-if="!checkRoles(['salesman'])"></el-tab-pane>
    </el-tabs>
    <div class="p-20 bg-white">
      <div class="mb-20 flex align-center">
        <!-- <div class="flex1"></div> -->
        <el-button size="small" type="primary" :disabled="selSnArr.length == 0" @click="bindAd()">绑定广告</el-button>
      </div>
      <el-table id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row
        @selection-change="selSb">
        <el-table-column type="selection" :selectable="checkSel" width="50">
        </el-table-column>
        <el-table-column label="设备名称">
          <template slot-scope="scope">
            {{ scope.row.goods_name}}
          </template>
        </el-table-column>
        <el-table-column label="设备SN码" width="150">
          <template slot-scope="scope">
            {{ scope.row.goods_sn }}
          </template>
        </el-table-column>
        <el-table-column label="是否已铺货" width="110">
          <template slot-scope="scope">
            <span>{{ scope.row.is_distributed == 1 ? "是" : "否" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商户名称">
          <template slot-scope="scope">
            {{ scope.row.store_name || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="商户ID" width="110">
          <template slot-scope="scope">
            {{ scope.row.store_id || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <div v-if='listQuery.search_user_type == 0'>
              <el-button v-if='scope.row.is_distributed == 1' type="text" size="small" @click="bindAd(scope.row)">绑定广告</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="p-20 flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num" :limit.sync="listQuery.limit"
          @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'bindEquip',
    components: {
      Pagination
    },
    data() {
      return {
        form: {},
        list: [],
        listLoading: true,
        listQuery: {
          search_goods_type: '1',
          is_distributed: '1',
          search_user_type: 0,
          page_num: 1
        },
        selSnArr: []
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 校验是否可选
       */
      checkSel(row) {
        return true
      },

      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.listQuery.page = 1
        this.getList()
      },

      /**
       * 选择设备
       * @param {Object} res
       */
      selSb(list) {
        let selSnArr = []
        for (var i in list){
          selSnArr.push(list[i].goods_sn)
        }
        this.selSnArr = selSnArr
      },

      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if (type == 1) {
          this.form = {}
          this.listQuery.page = 1
        } else {
          this.listQuery.page = 1
        }
        this.getList()
      },

      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.page - 1
        })
        this.$get('agentapi/search/query_devices', listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * @param {Object} row
       * 绑定广告
       */
      bindAd(row){
        let selSnArr = this.selSnArr
        if(row) selSnArr.push(row.goods_sn)
        this.$post('agentapi/bind_ad_sns', {
          id: this.id,
          goods_sn: selSnArr
        }).then(res => {
          this.$message({
            message: '绑定成功',
            type: 'success'
          })
          history.back()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
</style>
