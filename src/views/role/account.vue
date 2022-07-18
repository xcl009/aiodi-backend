<template>
  <div>
    <div class="p-20 bg-white">
      <el-button type="primary" size="small" class="mr-10" @click="setRows(1, {}, 2)">添加账号</el-button>
      <div class="pt-15">
        <el-table id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row>
          <el-table-column label="角色名称">
            <template slot-scope="scope">
              {{ scope.row.roleName || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="登录账号">
            <template slot-scope="scope">
              {{ scope.row.username || '--' }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="登录密码">
            <template slot-scope="scope">
              {{ scope.row.password || '--' }}
            </template>
          </el-table-column> -->
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span class="pl-20 pr-20 cursor text-primary" @click="setRows(1, scope.row, 2)">修改</span>
              <span class="pl-20 pr-20 cursor text-danger" @click="setRows(1, scope.row, 1, scope.$index)">删除</span>
            </template>
          </el-table-column>
        </el-table>
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
            <el-input v-model="dform.nickname" placeholder="请输入用户名称"></el-input>
          </el-form-item>
          <el-form-item label="登录账号">
            <el-input v-model="dform.username" placeholder="请输入登录账号"></el-input>
          </el-form-item>
          <el-form-item label="登录密码">
            <el-input v-model="dform.password" placeholder="请输入登录密码" type="password"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
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
        form: {},
        listTotal: 0,
        list: [],
        listLoading: false,

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '删除账号',
          2: '添加账号',
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        roleId: this.$route.query.roleId
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
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        this.$get('iot-saas-user/auth/user', {
          roleId: this.roleId
        }).then(res => {
          this.listLoading = false
          this.list = res
          this.clickSubmit = false
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择数据
       * @param {Object} dialogType dialog内容显示类型 1: '删除角色'
       * @param {Object} idx 当前位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            this.dform = {}
            if(dialogType == 2 && row.userId){
              this.dform = {
                nickname: row.roleName,
                username: row.username,
                userId: row.userId
              }
            }
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            this.$delete(`iot-saas-user/auth/user/${curRow.userId}`, params).then(res => {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.list.splice(curIdx, 1)
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(() => {
              this.clickSubmit = false
            })
            break
          case 2:
            let type = '$post'
            if(params.userId) type = '$put'
            params.roleId = this.roleId
            this[type](`iot-saas-user/auth/user`, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.getList()
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(() => {
              this.clickSubmit = false
            })
            break
        }
      },
	  }
  }
</script>

<style lang="scss" scoped>

</style>
