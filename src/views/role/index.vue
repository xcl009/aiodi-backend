<template>
  <div>
    <div class="p-20 bg-white">
      <!-- <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/role/oplog`})">操作日志</el-button> -->
      <el-row class="mt-25" :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :lg="6" class="mb-20 cursor">
          <div class="flex justify-center align-center role-item text-center"
            @click="$router.push({ path: `/role/addRole` })">
            <div>
              <div><i class="el-icon-plus fs-b2"></i></div>
              <div class="mt-10 text-grey">{{ $t('role.addRole') }}</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12" :md="8" :lg="6" v-for="(item, index) in list" class="mb-20 cursor">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <el-image :src="require('@/assets/role_avatar.png')"></el-image>
              <div class="flex-sub pl-20">
                <div class="flex align-center">
                  <div class="flex-sub fs-c1">{{ item.roleName }}</div>
                  <div class="text-primary" @click="$router.push({ path: `/role/addRole?roleId=${item.roleId}` })">{{
                    $t('public.edit') }}</div>
                </div>
                <div class="mt-10 text-grey">{{ item.remark }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button size="small" class="btn-body" @click="setRows(1, item, 1, index)">{{ $t('public.delete')
              }}</el-button>
              <el-button type="primary" size="small"
                @click="$router.push({ path: `/role/roleAccount?roleId=${item.roleId}` })">{{ $t('public.viewAccount')
                }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">{{ $t('role.message') }}</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left">{{ $t('role.message1') }}</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'roleManage',
  components: {

  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      list: [],

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {}
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from.name == "addRole") {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    if (this.$route.meta.reload) {
      this.getList()
    } else if (!this.list || this.list.length == 0) {
      this.toQuery(1)
    }
  },
  computed: {
    dialogTitle() {
      return {
        1: this.$t('role.deleteRole')
      }
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      this.form = {}
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form)
      this.$get('iot-saas-user/auth/role', params).then(res => {
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
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          this.$message({
            message: that.$t('public.deleteSuccess'),
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
.role-item {
  padding: 20px 16px;
  height: 184px;
  border-radius: 2px;
  border: 1px solid #E5E6EB;

  .el-image {
    width: 64px;
    height: 64px;
  }
}
</style>
