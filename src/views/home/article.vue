<template>
  <div class="p-10">
    <el-tabs v-model="listQuery.article_type" class="mb-0 bg-white" type="card" @tab-click="typeClick">
      <el-tab-pane label="最新公告" name="1" />
      <el-tab-pane label="头条新闻" name="2" />
      <el-tab-pane label="学习教程" name="3" />
    </el-tabs>
    <div class="p-10 bg-white">
      <el-table id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="封面图">
          <template slot-scope="scope">
            <el-image
                  style="width: 60px; height: 60px"
                  :src="scope.row.img_url"
                  fit="cover"></el-image>
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
        <el-table-column label="操作" width="200">
            <template slot-scope="scope">
                <el-button type="primary" size="mini" round plain @click="getDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-table>
      <div class="p-20 flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit" :page-count="listQuery.page_num"
@pagination="getList"/>
      </div>
    </div>

    <el-dialog
      :title="info.title"
      :visible.sync="detailVisible">
      <div class="max-w bg-gray" v-html="info.content"></div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'articlePublic',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        listLoading: true,
        listQuery: {
          article_type: this.$route.query.type || 1,
          start: 1,
          total: 10,
          page_num: 1
        },
        info: {},
        detailVisible: false
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.listQuery.article_type = tab.name
        this.listQuery.start = 1
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'agentapi/article/public_list'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 文章详情
       */
      getDetail(row){
        this.$get('agentapi/article/detail', {
          id: row.id
        }).then(res => {
          this.info = res.info
          this.detailVisible = true
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
