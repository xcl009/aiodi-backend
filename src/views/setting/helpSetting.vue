<template>
  <div class="p-5">
    <div class="flex bg-white">
      <div class="flex1">
        <el-tabs v-model="listQuery.cate_id" type="card" @tab-click="typeClick">
          <el-tab-pane :key="index" :label="item.cate_name" :name="''+item.cate_id+''" v-for="(item, index) in tab" />
        </el-tabs>
      </div>
      <div class="scan-code_btn">
        <el-button type="primary" size="small" @click="editForm = { cate_id: parseInt(listQuery.cate_id) }; editDialog = true">添加问题</el-button>
      </div>
    </div>

    <div class="bg-white">
      <el-table
        id="list_table"
        ref="list_table"
        stripe
        highlight-current-row
        element-loading-text="Loading"
        v-loading="listLoading"
        :data="list"
        :max-height="tableMaxH"
      >
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">
            {{ tabName[scope.row.cate_id] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="标题">
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="描述">
          <template slot-scope="scope">
            <div class="info-box fs-s4">
              {{ scope.row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="editForm = JSON.parse(JSON.stringify(scope.row)), editDialog = true">修改</el-button>
            <el-button type="danger" size="mini" round plain  @click="del(scope.row, scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.page_num > 0"
          :page.sync="listQuery.start"
          :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num"
          layout='sizes, prev, pager, next, jumper'
          @pagination="getList"
        />
      </div>
    </div>

    <el-dialog title="编辑问题" :visible.sync="editDialog" :close-on-click-modal="false" >
      <el-form label-width="auto">
        <el-form-item label="类型：">
          <el-select v-model="editForm.cate_id" placeholder="请选择">
            <el-option
              v-for="(item, index) in tab"
              :key="item.cate_id"
              :label="item.cate_name"
              :value="item.cate_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标题：">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="描述：">
          <el-input v-model="editForm.content" :autosize="{ minRows: 3, maxRows: 6}" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="save()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    components: {
      Pagination,
    },
    data() {
      return {
        tabName: {},
        tab: [],
        listLoading: false,
        listQuery: {
          cate_id: '1',
          start: 1,
          limit: 20,
          page_num: 1
        },
        tableMaxH: '250',
        editDialog: false,
        editForm: {},
        form: {},
        list: [
          {
            0: 0
          }
        ],
      }
    },
    mounted() {
      this.getCates()
    },
    methods: {
      /**
       * 获取类别
       */
      getCates() {
        this.$get('agentapi/article/helping_thread_cates').then(res => {
          let tabName = {}
          res.map( item => {
            tabName[item.cate_id] = item.cate_name
          })
          this.tab = res
          this.tabName = tabName
          if (res.length > 0) this.listQuery.cate_id = res[0].cate_id.toString()
          this.getList()
        })
      },

      /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
      typeClick(tab, event) {
        this.listQuery.order_type = tab.name
        this.listQuery.start = 1
        this.getList()
      },

      /**
         * 搜索查询
         */
      toQuery(type = 0) {
        this.$refs.filterDrawer.hide()
        if (type == 1) {
          this.form = {}
          this.listQuery.start = 1
          this.listQuery.limit = 10
        } else {
          if (this.cat_id && this.cat_id.length > 0) {
            this.form.cat_id = this.cat_id[this.cat_id.length - 1]
          }
          this.listQuery.start = 1
        }
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1,
          page: 1
        })
        this.$get('agentapi/article/helping_thread_list', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 85
        }).catch(() => {
          this.listLoading = false
        })
      },

      onSubmit(formName) {
        let url = 'agentapi/system/save_articles',
          form = JSON.parse(JSON.stringify(this.form)),
          params = {
            articel_type: this.articel_type
          }
        for (var i in form) {
          params[`content_${this.articel_type}_${form[i].cat_id}`] = form[i].content
        }
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      },

      /**
       * 删除文章
       */
      del(row, index){
        this.$alert('确定删除吗？', '删除文章', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('agentapi/article/helping_thread_del', {
                id: row.id
              }).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
                this.list.splice(index, 1)
              })
            }
          }
        })
      },

      /**
       * 提交保存文章
       */
      save(){
        let params = {}, editForm = this.editForm
        params.title = editForm.title
        params.content = editForm.content
        params.cate_id = editForm.cate_id
        if(editForm.id) params.id = editForm.id
        this.$post('agentapi/article/helping_thread_save', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.editDialog = false
          this.getList()
        })
      }
    }
  }
</script>

<style scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  .info-box{
    max-height: 80px;
  }
  .scan-code_btn{
    padding: 4px 4px 0 0;
    border-bottom: 1px solid #E4E7ED;
  }
</style>
