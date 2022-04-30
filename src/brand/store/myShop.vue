<template>
  <div>
    <div class="p-10">
      <div class="pl-10 pr-10 bg-white">
        <el-table id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe
          highlight-current-row>
          <el-table-column label="门头照" width="100">
            <template slot-scope="scope">
              <el-image style="width: 60px; height: 60px" :src="scope.row.avatar" fit="fill" />
            </template>
          </el-table-column>
          <el-table-column label="商户名称">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="商户地址">
            <template slot-scope="scope">
              {{ scope.row.address }}
            </template>
          </el-table-column>
          <el-table-column label="铺货人" width="150">
            <template slot-scope="scope">
              {{ scope.row.operator_name || "--" }}<br>
              {{ scope.row.operator_phone }}
            </template>
          </el-table-column>
          <el-table-column label="分润人" width="150">
            <template slot-scope="scope">
              {{ scope.row.name || "--" }}<br>
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column label="分润比例" width="150">
            <template slot-scope="scope">
              {{ scope.row.percent || "--" }}
            </template>
          </el-table-column>
          <el-table-column label="商户收益">
            <template slot-scope="scope">
              {{ scope.row.profit || "--" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain @click="switchShop(scope.row)" v-if="agentInfo.id != scope.row.aid">切换到此商户</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { getToken, setToken, removeToken } from '@/utils/auth'
  import Pagination from '@/components/Pagination'
  export default {
    name: 'myShop',
    components: {
      Pagination
    },
    data() {
      return {
        agentInfo: {},
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1
        }
      }
    },
    mounted(){
      this.getList()
    },
    methods: {
      getList() {
        const url = 'agentapi/store/switch_store_list'
        const listQuery = Object.assign({}, this.listQuery, this.form, {
          start: this.listQuery.page - 1
        })
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 铺货
       */
      switchShop(row) {
        this.$alert('确定切换到该商户吗？', '切换商户', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('agentapi/store/switch_other_store', {
                store_id: row.id
              }).then(res => {
                this.$store.dispatch('user/postSetRecode', [4, 1, 2])
                setToken(res.token)
                setToken(res.user_id, 'user_id')
                this.$message({
                  message: '切换成功',
                  type: 'success'
                })
                setTimeout(()=>{
                  location.href = '/shop/myShop'
                }, 2000)
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  >>>.filter-cate .el-input__inner {
    width: 180px;
  }
</style>
