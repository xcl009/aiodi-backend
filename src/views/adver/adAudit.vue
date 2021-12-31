<template>
  <div class="p-5">
    <el-tabs class="mb-0 bg-white" type="card" v-model="listQuery.review_status" @tab-click="typeClick">
      <el-tab-pane label="全部" name="-1"></el-tab-pane>
      <el-tab-pane label="未审核" name="1"></el-tab-pane>
      <el-tab-pane label="已审核" name="2"></el-tab-pane>
      <el-tab-pane label="已驳回" name="3"></el-tab-pane>
    </el-tabs>
    <div class="bg-white">
      <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="ID" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="160">
          <template slot-scope="scope">
            <div><img :src="scope.row.img_url" width="140" alt=""></div>
          </template>
        </el-table-column>
        <el-table-column label="名称" width="160">
          <template slot-scope="scope">
            {{ scope.row.ad_name }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template slot-scope="scope">
            <div>{{ parseTime(scope.row.start_date, '{y}-{m}-{d} {h}:{i}') }}
              <el-link type="primary">起</el-link>
            </div>
            <div>{{ parseTime(scope.row.end_date, '{y}-{m}-{d} {h}:{i}') }}
              <el-link type="danger">止</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="定向地址">
          <template slot-scope="scope">
            <el-link type="primary" :href="scope.row.ad_link">{{ scope.row.ad_link }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="160">
          <template slot-scope="scope">
            <div>{{ statusObj[scope.row.review_status] }}</div>
            <div v-if="scope.row.refuse_reason">失败原因：{{ scope.row.refuse_reason }}</div>
          </template>
        </el-table-column>
        <el-table-column label="代理商" width="160">
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain v-if="scope.row.review_status == 1" @click="auditOk(scope.row)">通过</el-button>
            <el-button type="danger" size="mini" round plain v-if="scope.row.review_status == 1" @click="auditNo(scope.row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num"
          @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'photo',
    components: {
      Pagination
    },
    data() {
      return {
        statusObj: {
          0: '未审核',
          1: '审核中',
          2: '审核通过',
          3: '审核不通过'
        },
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listQuery: {
          review_status: '-1',
          type: 1,
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
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.listQuery.page = 1
        this.getList()
      },

      /**
       * 获取数据
       */
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
            start: this.listQuery.page - 1
          }),
          url = 'agentapi/my_reviewe_ads'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 广告审核通过
       */
      auditOk(row) {
        this.$alert('确定该广告通过审核吗？', '广告审核-通过', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == "confirm") {
              this.$post('agentapi/review_ad', {
                id: row.id,
                agree: 1
              }).then(res => {
                row.review_status = 2
                this.$message({
                  message: '设置成功',
                  type: 'success'
                })
              })
            }
          }
        });
      },

      /**
       * 驳回广告
       */
      auditNo(row) {
        this.$prompt('请填写驳回理由', '广告审核-驳回', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              let value = instance.inputValue
              if (!value) {
                this.$message({
                  message: '驳回原因必须填写噢!',
                  type: 'warning'
                })
                return
              }
              this.$post('agentapi/review_ad', {
                id: row.id,
                agree: 0,
                refuse_reason: value
              }).then(res => {
                this.$message({
                  message: '设置成功',
                  type: 'success'
                })
                row.review_status = 3
                row.refuse_reason = value
                done()
              })
            } else {
              done()
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
