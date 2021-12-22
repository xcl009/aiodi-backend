<template>
  <div class="p-10">
    <div class="pl-10 pr-10 bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="总后台">
          <template slot-scope="scope">
            {{ scope.row.agent_id }}
          </template>
        </el-table-column>
        <el-table-column label="名称">
          <template slot-scope="scope">
            {{ scope.row.account_name }}
          </template>
        </el-table-column>
        <el-table-column label="appId">
          <template slot-scope="scope">
            {{ scope.row.account_appid || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="是否开启关注">
          <template slot-scope="scope">
            <div>{{ scope.row.follow_open == 1 ? '是' : '否' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            <div>{{ parseTime(scope.row.created) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <router-link class="mr-10" :to="`/wx/public?mine_id=${scope.row.agent_id}`">
              <el-button type="primary" size="mini" icon="el-icon-edit" circle />
            </router-link>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.total > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          :page-count="listQuery.total"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'Wxpublc',
  components: {
    Pagination
  },
  data() {
    return {
      list: [],
      listLoading: true,
      listQuery: {
        type: 1,
        page: 1,
        total: 10
      }
    }
  },
  computed: {
    agentInfo() {
      return this.$store.state.user.agentInfo
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
      const url = 'MpWeixin/getWxCfgList'
      const listQuery = Object.assign({}, this.listQuery, {
        page: this.listQuery.page - 1
      })
      this.$get(url, this.listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.total = res.total
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
       * 上传代码
       */
    uploadCode(row) {
      const that = this
      this.$alert('确定将代码到该小程序吗？', '上传代码', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.loadObj = this.$loading({
              lock: true,
              text: '正在提交~~~',
              spinner: 'el-icon-loading'
            })
            this.$post('WxOpen/uploadMiniCode', {
              wxmini_appid: row.app_id
            }).then(res => {
              row.mini_info.option_status = 2
              this.$message({
                message: '上传成功,正在获取类目',
                type: 'success'
              })
              that.getMiniCategoryList(row, 2)
            }).catch(err => {
              this.loadObj.close()
            })
          }
        }
      })
    },

    /**
       * 获取小程序类目
       */
    getMiniCategoryList(row, type = 1) {
      const that = this; let params = {}
      this.$post('WxOpen/getMiniCategoryList', {
        wxmini_appid: row.app_id
      }).then(res => {
        if (res[0]) {
          if (type == 1) {
            this.loadObj = this.$loading({
              lock: true,
              text: '正在提交~~~',
              spinner: 'el-icon-loading'
            })
          }
          this.$message({
            message: '获取类目成功',
            type: 'success'
          })
          params[0] = res[0]
          params[0]['address'] = 'pages/index/index'
          params[0]['title'] = this.config.project_name
          params[0]['tag'] = 'pages'
          params = JSON.stringify(params)
          this.auditMiniCode(row, params)
        } else {
          this.$message({
            message: '获取类目为空',
            type: 'error'
          })
        }
      }).catch(err => {
        this.loadObj.close()
      })
    },

    /**
       * 提交代码审核
       */
    auditMiniCode(row, params) {
      this.$post('WxOpen/auditMiniCode', {
        wxmini_appid: row.app_id,
        audit_items: params
      }).then(res => {
        this.loadObj.close()
        this.$message({
          message: '提交审核成功',
          type: 'success'
        })
        row.mini_info.audit_status = 2
        row.mini_info.option_status = 3
      }).catch(err => {
        this.loadObj.close()
      })
    },

    /**
      * 刷新审核状态
      */
    refreshAudit(row) {
      this.$post('WxOpen/refreshMiniCodeAuditResult', {
        wxmini_appid: row.app_id,
        audit_id: row.mini_info.audit_id
      }).then(res => {
        row.mini_info.audit_status = res.audit_status
        if (res.audit_status == 0) row.mini_info.option_status = 4
        this.$message({
          message: '刷新状态成功',
          type: 'success'
        })
      })
    },

    /**
       * 发布代码
       */
    releaseCode(row) {
      this.$post('WxOpen/releaseMiniCode', {
        wxmini_appid: row.app_id
      }).then(res => {
        row.mini_info.option_status = 6
        this.$message({
          message: '发布成功',
          type: 'success'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  /deep/ .el-button+.el-button.e-btn{
    margin-left: 0;
  }
  /deep/ .el-button-group .el-button--primary:first-child{
    border-right-color: #b3d8ff;
  }
  /deep/ .el-button-group>.el-button:not(:last-child){
    margin-right: 0;
  }
</style>
