<template>
  <div class="p-5">
    <div class="bg-white">
      <div class="pt-10 ml-10 flex align-center">
        <el-button size="medium" type="primary" @click="$router.push({path: `/tutorial/edit?type=${type}`})">添加{{ title }}</el-button>
      </div>
      <el-table class="ptd-5" id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe
        highlight-current-row>
        <el-table-column label="封面图">
          <template slot-scope="scope">
            <el-image style="width: 60px; height: 60px" :src="scope.row.img_url" fit="cover"></el-image>
          </template>
        </el-table-column>
        <el-table-column label="标题">
          <template slot-scope="scope">
            <div class="el-link">{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column label="时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div class="el-link">{{ title }}</div>
          </template>
        </el-table-column>
        <el-table-column label="查看范围">
          <template slot-scope="scope">
            <span v-for="item in scope.row.throw_agent_level">{{roles[item]}},</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="shelves(scope.row)">{{ scope.row.is_show == 0 ? '已下架' : '已上架' }}</el-button>
            <p class="mb-0 mt-5" />
            <el-button type="primary" size="mini" round plain @click="$router.push({path: `/tutorial/edit?id=${scope.row.id}&type=${type}`})">编辑</el-button>
            <el-button type="primary" size="mini" round plain @click="deleteItem({id: scope.row.id, index: scope.$index})">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'tutorial',
    components: {
      Pagination
    },
    props: {
      type: {
        type: Number,
        default: 0
      },
      title: {
        type: String,
        default: '教程'
      }
    },
    data() {
      return {
        roles: ['全部', '总后台', '合伙人', '代理商', '业务员', '商家'],
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1
        }
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
            start: this.listQuery.page - 1,
            article_type: this.type
          }),
          url = 'agentapi/article/index'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 上架下架
       */
      shelves(row) {
        let agree = row.is_show == 1 ? 0 : 1
        this.$post('agentapi/article/is_show_switch', {
          id: row.id,
          agree: agree
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.is_show = agree
        })
      },

      /**
       * 删除文章
       */
      deleteItem(row){
        this.$alert('确定删除此文章吗？', '删除文章', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('agentapi/article/del', {
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
