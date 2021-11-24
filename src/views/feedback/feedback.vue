<template>
  <div class="p-10">
    <div class="p-10 bg-white">
      <div class="mb-10 flex align-center">
       <el-button size="medium" type="primary" @click="$router.push({path: `/home/feedbackEdit`})">提交工单</el-button>
      </div>
      <el-table id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="问题类型" width="80">
          <template slot-scope="scope">
            {{ issueArr[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column label="反馈内容">
          <template slot-scope="scope">
            {{ scope.row.content }}
          </template>
        </el-table-column>
        <el-table-column label="错误截图" width="220">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-image class="mr-5" v-for="item in scope.row.img_url"
                style="width: 50px; height: 50px"
                :src="item"
                :preview-src-list="scope.row.img_url">
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="反馈时间" width="100">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date, '{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column label="回复">
          <template slot-scope="scope">
            <div class="fs-s1 text-gray">
              <div v-for="item in scope.row.reply_list">
                {{ parseTime(item.add_date, '{m}-{d} {h}:{i}') }}回复：{{ item.content }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num" @pagination="getList"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'userList',
    components: {
      Pagination
    },
    data() {
      return {
        issueArr: {1: '订单问题', 2: '系统bug', 3: '其他问题'},
        statusObj: {
          0: '未处理',
          1: '处理中',
          2: '已处理'
        },
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
        let listQuery = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'commonapi/feedback/index'
        this.$get(url, listQuery).then(res => {
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
  /deep/ .el-icon-circle-close{
    color: #fff;
  }
</style>
