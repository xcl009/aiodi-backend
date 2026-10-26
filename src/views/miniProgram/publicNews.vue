<template>
  <div>
    <div class="p-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading">
        <el-table-column :label="$t('public.type')">
          <template slot-scope="scope">
            {{ scope.row.templateType }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('miniProgram.templateTitle')">
          <template slot-scope="scope">
            {{ scope.row.templateType }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('miniProgram.templateId')">
          <template slot-scope="scope">
            <div v-if="scope.row.templateId" class="text-primary cursor" @click="setRows(1, scope.row, 1)">{{
              scope.row.templateId }}</div>
            <div v-else class="text-primary cursor" @click="setRows(1, scope.row, 1)">{{ $t('miniProgram.clickBind') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('miniProgram.appId')">
          <template slot-scope="scope">
            <div v-if="scope.row.appId" class="text-primary cursor" @click="setRows(1, scope.row, 1)">{{ scope.row.appId
            }}</div>
            <div v-else class="text-primary cursor" @click="setRows(1, scope.row, 1)">{{ $t('miniProgram.clickBind') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')" width="150">
          <template slot-scope="scope">
            <el-button class="ml-0" type="primary" size="mini" @click="setRows(1, scope.row, 2)">{{
              $t('miniProgram.bindWxUser') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" width="650px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="mb-20 text-center">*{{ $t('miniProgram.text2') }}</div>
        <el-form class="pt-5 custom-form" label-width="auto">
          <el-form-item label="APPID">
            <el-input v-model="dform.appId" :placeholder="$t('miniProgram.appId')" />
          </el-form-item>
          <el-form-item :label="$t('miniProgram.templateId')">
            <el-input v-model="dform.templateId" :placeholder="$t('miniProgram.templateIdText')" />
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="flex justify-center align-center mb-15">
          <condition ref="condition" :clickSubmit="clickSubmit" :resetStatus="false" @query="searchUser">
            <template v-slot:defult>
              <el-input :placeholder="$t('public.userNickName')" v-model="form.nickname" />
              <el-input :placeholder="$t('public.phone')" v-model="form.mobile" />
            </template>
          </condition>
          <div class="ml-10 fs-s4 text-primary">{{ $t('miniProgram.serchUserBind') }}</div>
        </div>
        <el-table :data="userList" v-if="userList.length > 0">
          <el-table-column :label="$t('public.user')">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.avatar" />
                <div class="flex1 pl-10">{{ scope.row.nickname || "--" }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.phone')">
            <template slot-scope="scope">
              {{ scope.row.mobile || '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('steal.createTime')">
            <template slot-scope="scope">
              {{ parseTime(scope.row.registeredTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.actions')" width="100">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="bindUser(scope.row)">{{ $t('factory.bindTa') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-table :data="bindUserList" v-else>
          <el-table-column :label="$t('public.nickname')">
            <template slot-scope="scope">
              {{ scope.row.nickname }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.phone')">
            <template slot-scope="scope">
              {{ scope.row.mobile }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('miniProgram.bindTime')">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.actions')" width="100">
            <template slot-scope="scope">
              <el-button class="ml-0" type="primary" size="mini" @click="delUser(scope.row, scope.$index)">{{
                $t('public.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <div class="mt-30 text-center" v-if="userList.length > 0">
        <el-button size="medium" class="bg-body" @click="userList = []">{{ $t('public.return') }}</el-button>
      </div>
      <div class="mt-30 text-center" v-if="dialogType != 2">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { arrayToObj } from '@/utils/index'
import condition from '@/components/condition/'
export default {
  name: 'publcNews',
  components: {
    condition
  },
  data() {
    return {
      clickSubmit: false,
      list: [],
      listLoading: false,

      /**
       * 绑定用户
       */
      bindUserList: [],
      userList: [],
      form: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
    }
  },
  computed: {
    agentInfo() {
      return this.$store.state.user.agentInfo
    },
    dialogTitle() {
      return {
        1: this.$t('miniProgram.bindTemplateId'),
        2: this.$t('miniProgram.bindWxUser')
      }
    }
  },
  mounted() {
    this.getType()
  },
  methods: {
    /**
     * 获取类型
     */
    getType() {
      const url = 'iot-saas-basic/admin/weixin/message/template/queryType'
      this.$get(url).then(res => {
        this.getList(arrayToObj(res, 'templateType'))
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 获取列表
     */
    getList(types) {
      const url = 'iot-saas-basic/admin/weixin/message/template/query'
      this.$get(url).then(res => {
        if (res && res.length > 0) {
          res.map(item => {
            types[item.templateType] = Object.assign(types[item.templateType], item)
          })
        }
        this.list = Object.values(types)
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 操作
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前
     * @param {Object} dialogType dialog内容显示类型 1: '模板ID设置'   2: '查看绑定微信用户'
     * @param {Object} idx 所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          if (dialogType == 1) {
            this.dform = {
              templateType: row.templateType,
              appId: row.appId || '',
              templateId: row.templateId || ''
            }
          } else if (dialogType == 2) {
            this.queryBindUser(row.templateType)
          }
          this.dialogStatus = true
          break
      }
    },

    /**
     * 查询已绑定用户
     */
    queryBindUser(templateType) {
      this.$get('iot-saas-basic/admin/weixin/message/template/queryBindUser', {
        templateType: templateType
      }).then(res => {
        this.bindUserList = res
      })
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      switch (this.dialogType) {
        case 1:
          this.$post('iot-saas-basic/admin/weixin/message/template/create', params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.getType()
            this.dialogStatus = false
          })
          break
      }
    },

    /**
     * 搜索查询
     */
    searchUser() {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form))
      if (!params.nickname && !params.mobile) {
        this.$message({
          message: that.$t('miniProgram.message7'),
          type: 'error'
        })
        return
      }
      if (this.clickSubmit) return
      this.clickSubmit = true
      params.page = 0
      params.size = 5
      this.$get('iot-saas-user/user/relation/findUserByAdmin', params).then(res => {
        if (res.rows.length == 0) {
          this.$message({
            message: that.$t('miniProgram.message8'),
            type: 'error'
          })
        }
        this.userList = res.rows
        this.clickSubmit = false
      }).catch(err => {
        this.clickSubmit = false
      })
    },

    /**
     * 绑定用户
     */
    bindUser(row) {
      let that = this;
      this.$post('iot-saas-basic/admin/weixin/message/template/bindUser', {
        templateType: this.curRow.templateType,
        userId: row.id
      }).then(res => {
        this.$message({
          message: that.$t('public.operationSuccessful'),
          type: 'success'
        })
        this.userList = []
        this.queryBindUser(this.curRow.templateType)
      })
    },

    /**
     * 删除用户
     */
    delUser(row, idx) {
      let that = this;
      this.$alert(that.$t('miniProgram.message9'), that.$t('miniProgram.deleteUser'), {
        confirmButtonText: that.$t('public.confirm'),
        center: true,
        callback: action => {
          if (action == 'confirm') {
            this.$post('iot-saas-basic/admin/weixin/message/template/deleteBindUser', {
              id: row.id
            }).then(res => {
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              this.bindUserList.splice(idx, 1)
            })
          }
        }
      })

    }
  }
}
</script>

<style lang="scss" scoped></style>
