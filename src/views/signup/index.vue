<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="ID" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="名称" width="180">
          <template slot-scope="scope">
            {{ scope.row.info_name }}
          </template>
        </el-table-column>
        <el-table-column label="页面地址">
          <template slot-scope="scope">
            packageB/pages/signup/signup?id={{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="活动类型">
          <template slot-scope="scope">
            {{ scope.row.info_type_des }}
          </template>
        </el-table-column>
        <el-table-column label="联系人" width="180">
          <template slot-scope="scope">
            <div>微信：{{ scope.row.wechat }}</div>
            <div>电话：{{ scope.row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" width="180">
          <template slot-scope="scope">
            <el-tag effect="plain" @click="$router.push({path: `/signup/signIn?id=${scope.row.id}`})">
              {{ scope.row.sign_in_num }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="$router.push({path: `/signup/edit?id=${scope.row.id}`})">编辑</el-button>
            <el-button type="danger" size="mini" round plain @click="del({id: scope.row.id, index: scope.$index})">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num"
@pagination="getList"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'signupAct',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        listLoading: true,
        listQuery: {
          info_type: -1,
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
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'signin/index'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 删除记录
       */
      del(row){
        this.$alert('确定删除此活动吗？', '删除活动', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('signin/del', {
                id: row.id
              }).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
                this.list.splice(row.index, 1)
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
