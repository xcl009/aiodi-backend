<template>
  <div>
    <div class="p-20 bg-white">
      <el-button type="primary" size="small" class="mr-10" @click="setRows(1, {}, 2)">添加账号</el-button>
      <div class="pt-15">
        <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="角色名称">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="登录账号">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="登录密码">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span class="pl-20 pr-20 cursor text-primary" @click="setRows(1, scope.row, 2)">修改</span>
              <span class="pl-20 pr-20 cursor text-danger" @click="setRows(1, scope.row, 1, scope.$index)">删除</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
            :total="parseInt(listTotal)" @pagination="getList" />
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定删除此账号吗？</div>
        </div>
      </template>
      <template v-if="dialogType == 2">
        <el-form class="custom-form" label-width="auto">
          <el-form-item label="用户名称">
            <el-input v-model="dform.amount" placeholder="请输入用户名称"></el-input>
          </el-form-item>
          <el-form-item label="登录账号">
            <el-input v-model="dform.amount" placeholder="请输入登录账号"></el-input>
          </el-form-item>
          <el-form-item label="登录密码">
            <el-input v-model="dform.amount" placeholder="请输入登录密码"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'roleAccount',
    components: {
      Pagination
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        listTotal: 0,
        list: [{}],
        listLoading: false,
        listQuery: {
          page: 1,
          size: 20,
          count: 10
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '删除账号',
          2: '添加账号',
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {

    },
    mounted() {
      this.toQuery(1)
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('/brand/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.clickSubmit = false
          if(params.page == 1){
            this.count = res.count
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择数据
       * @param {Object} dialogType dialog内容显示类型 1: '删除角色',
       * @param {Object} idx 当前位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfim() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            this.$message({
              message: '删除成功',
              type: 'success'
            })
            this.list.splice(curIdx, 1)
            this.dialogStatus = false
            this.clickSubmit = false
            break
        }
      },
	  }
  }
</script>

<style lang="scss" scoped>
  
</style>
