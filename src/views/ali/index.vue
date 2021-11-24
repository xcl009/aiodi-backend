<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="合伙人" width="100">
          <template slot-scope="scope">
            ID：{{ scope.row.agent_id }}
            <!-- <div>昵称：{{ scope.row.agent_info.nick_name }}</div>
            <div>账号：{{ scope.row.agent_info.title }}</div>
            <div>手机：{{ scope.row.agent_info.link_tel }}</div> -->
          </template>
        </el-table-column>
        <el-table-column label="小程序">
          <template slot-scope="scope">
            <div>名称：{{ scope.row.app_name || '--' }}</div>
            <div>APPID：{{ scope.row.appId }}</div>
          </template>
        </el-table-column>
        <el-table-column label="信用服务ID" width="140">
          <template slot-scope="scope">
            {{ scope.row.service_id }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template slot-scope="scope">
            <div>{{ parseTime(scope.row.updated) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="最新模板" :render-header="renderHeader" v-if="siteInfo.zfb_third_api_switch">
          <template slot-scope="scope">
            <template v-if="scope.row.templateInfo.template_id">
              <div>ID：{{ scope.row.templateInfo.template_id }}</div>
              <div>版本：{{ new_template_version }}</div>
            </template>
            <a class="text-blue" @click="$router.push({path: `/home/updateRecord`})">更新明细</a>
          </template>
        </el-table-column>
        <el-table-column label="当前模板版本" v-if="siteInfo.zfb_third_api_switch">
          <template slot-scope="scope">
            <template v-if="scope.row.templateInfo.template_version">
              <div>{{ scope.row.templateInfo.template_version }}</div>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column label="小程序版本" v-if="siteInfo.zfb_third_api_switch">
          <template slot-scope="scope">
            <template v-if="scope.row.templateInfo.app_version">
              <div>{{ scope.row.templateInfo.app_version }}</div>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="180" v-if="siteInfo.zfb_third_api_switch">
          <template slot-scope="scope">
            <template v-if="scope.row.templateInfo.template_version">
              <div>{{ small_version_status[scope.row.templateInfo.status] }}</div>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <!-- <el-table-column label="域名" width="100">
          <template slot-scope="scope">
            <router-link class="el-button--text" :to="`/ali/domain?type=1&app_id=${scope.row.appId}`">服务域名</router-link><br>
            <router-link class="el-button--text" :to="`/ali/domain?type=2&app_id=${scope.row.appId}`">业务域名</router-link>
          </template>
        </el-table-column> -->
        <el-table-column label="代码" width="100" v-if="siteInfo.zfb_third_api_switch">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="uploadCode(scope.row)" v-if="scope.row.templateInfo.status == 'RELEASE' || !scope.row.templateInfo.status">上传代码</el-button>
            <template v-if="scope.row.templateInfo">
              <el-button class="e-btn mt-10" type="primary" size="mini" @click="miniVersion(scope.row)" v-if="scope.row.templateInfo.status == 'BUILD'">版本状态</el-button>
              <el-button class="e-btn mt-10" type="primary" size="mini" @click="auditMiniCode(scope.row)" v-if="scope.row.templateInfo.status == 'INIT'">提交审核</el-button>
              <el-button class="e-btn mt-10" type="success" size="mini" @click="refreshAudit(scope.row)" v-if="scope.row.templateInfo.status == 'AUDITING'">审核状态</el-button>
              <el-button class="e-btn mt-10" type="success" size="mini" @click="backAudit(scope.row)" v-if="scope.row.templateInfo.status == 'AUDITING'">撤销审核</el-button>
              <el-button class="e-btn mt-10" type="success" size="mini" @click="backCode(scope.row)" v-if="scope.row.templateInfo.status == 'AUDIT_REJECT'">退回开发</el-button>
              <el-button class="e-btn mt-10" type="success" size="mini" @click="releaseCode(scope.row)" v-if="scope.row.templateInfo.status == 'WAIT_RELEASE' || scope.row.templateInfo.status == 'GRAY'">发布代码</el-button>
              <el-button class="e-btn mt-10" type="success" size="mini" @click="viewEx(scope.row)" v-if="scope.row.templateInfo.status == 'INIT' || scope.row.templateInfo.status == 'AUDITING'">体验版</el-button>
            </template>
            <el-button class="e-btn mt-10" type="danger" size="mini" @click="delVersion(scope.row)" v-if="checkRoles(['terminal'])">删除版本</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <router-link class="mr-10" :to="`/ali/edit/${scope.row.appId}`">
              <el-button type="primary" size="mini" icon="el-icon-edit" circle></el-button>
            </router-link>
            <!-- <el-button type="danger" size="mini" icon="el-icon-delete" circle></el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <div class="p-30 flex justify-center" v-if="list.length == 0 && agentInfo.agent_level == 1">
        <router-link :to="`/ali/create`">
          <el-button type="primary" round>绑定小程序</el-button>
        </router-link>
      </div>
      <div class="flex justify-center">
        <pagination v-show="listQuery.total > 0" :page.sync="listQuery.page" :limit.sync="listQuery.limit" :page-count="listQuery.total"
          @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'alixcx',
    components: {
      Pagination
    },
    data() {
      return {
        agentInfo: {},
        total_auditstatus: {},
        total_optionstatus: {},
        list: [],
        listLoading: true,
        listQuery: {
          type: 1,
          page: 1,
          total: 10,
          wx_status: 1
        },
        small_version_status: {}
      }
    },
    computed: {
      siteInfo(){
        return this.$store.state.user.siteInfo
      }
    },
    mounted() {
      this.agentInfo = window.agentInfo
      this.getConfigs()
      this.getList()
    },
    methods: {
      /**
       * 模板注解
       */
      renderHeader(h, { column, $index }) {
        return [column.label, h(
          'el-tooltip',
          {
            props: {
                content: '小程序版本过旧可能会导致出错噢,请尽快更新至最新版本',
                placement: 'top'
            }
          },
          [h('span', { class: {'el-icon-question': true} })]
        )]
      },

      /**
       * 获取列表
       */
      getConfigs() {
        this.$get('WxOpen/getConfigs', {
          tag: 'wm010006'
        }).then(res => {
          this.new_template_version = res
        })
      },

      /**
       * 获取列表
       */
      getList() {
        let url = 'AlipayMini/getConfigList'
        let listQuery = Object.assign({}, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get(url, this.listQuery).then(res => {
          this.small_version_status = res.small_version_status
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
      uploadCode(row){
        let that = this
        this.$alert('确定将代码到该小程序吗？', '上传代码', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == "confirm") {
              this.showLoad()
              this.$post('AlipayMini/openMiniVersionUploadRequest', {
                app_id: row.appId,
                mini_agent_id: row.agent_id,
                template_id: row.template_id,
                template_version: this.new_template_version
              }).then(res => {
                row.templateInfo.status = 'BUILD'
                row.templateInfo.app_version = res.app_version
                this.loadObj.close()
              }).catch(err => {
                this.loadObj.close()
              })
            }
          }
        })
      },

      showLoad(text = '正在提交~~~'){
        this.loadObj = this.$loading({
          lock: true,
          text: '',
          spinner: 'el-icon-loading'
        })
      },

      /**
       * 查询小程序构建版本
       */
      miniVersion(row){
        this.$get('AlipayMini/openMiniVersionBuildQueryRequest', {
          app_id: row.appId,
          app_version: row.templateInfo.app_version
        }).then(res => {
          if(res.create_status == 6){
            row.templateInfo.status = 'INIT'
          } else {
            this.$message({
              message: '版本还在构建中',
              type: 'error'
            })
          }
        })
      },

      /**
       * 提交代码审核
       */
      auditMiniCode(row){
        this.$message({
          message: '正在提交审核',
          type: 'success'
        })
        this.$post('AlipayMini/openMiniVersionAuditApplyRequest', {
          app_id: row.appId
        }).then(res => {
          this.$message({
            message: '提交审核成功',
            type: 'success'
          })
          row.templateInfo.status = 'AUDITING'
        })
      },

     /**
      * 刷新审核状态
      */
      refreshAudit(row){
        this.$get('AlipayMini/openMiniVersionDetailQueryRequest', {
          app_id: row.appId
        }).then(res => {
          row.templateInfo.status = res.status
          if(res.status == 'AUDIT_REJECT'){
            this.$message({
              message: `审核被驳回了，(${ res.reject_reason })`,
              type: 'error'
            })
          } else {
            this.$message({
              message: '刷新状态成功',
              type: 'success'
            })
          }
        })
      },

      /**
       * 生成体验版
       */
      releaseEx(row){
        this.$post('AlipayMini/openMiniExperienceCreateRequest', {
          app_id: row.appId
        }).then(res => {
          this.viewEx(row)
        })
      },

      /**
       * 查看体验版
       */
      viewEx(row){
        this.$get('AlipayMini/openMiniExperienceQueryRequest', {
          app_id: row.appId
        }).then(res => {
          if(res.status == 'expVersionPackged'){
            this.$alert('<div class="text-center"><img src="'+ res.exp_qr_code_url +'" width="250"/></div>', '体验二维码', {
              dangerouslyUseHTMLString: true
            })
          } else if(res.status == 'expVersionPackaging'){
            this.$message({
              message: '体验版生成中，请稍等~',
              type: 'success'
            })
          } else {
            this.releaseEx(row)
          }
        }).catch(err => {
          this.releaseEx(row)
        })
      },

      /**
       * 发布代码
       */
      releaseCode(row){
        this.$post('AlipayMini/openMiniVersionOnlineRequest', {
          app_id: row.appId
        }).then(res => {
          row.templateInfo.status = 'RELEASE'
          this.$message({
            message: '发布成功',
            type: 'success'
          })
        })
      },

      /**
       * 退回开发
       */
      backCode(row){
        this.$post('AlipayMini/openMiniVersionAuditedCancelRequest', {
          app_id: row.appId
        }).then(res => {
          row.templateInfo.status = 'NOT_UPLOAD'
          this.$message({
            message: '退回成功',
            type: 'success'
          })
        })
      },

      /**
       * 撤销审核
       */
      backAudit(row){
        this.$alert('确定撤销审核吗？', '撤销审核', {
          confirmButtonText: '确定',
          callback: action => {
            this.$post('AlipayMini/openMiniVersionAuditCancelRequest', {
              app_id: row.appId
            }).then(res => {
              row.templateInfo.status = 'INIT'
              this.$message({
                message: '撤销成功',
                type: 'success'
              })
            })
          }
        })
      },

      /**
       * 删除开发中的版本
       */
      delVersion(row){
        this.$prompt('请输入小程序开发版本号', '删除版本', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              const value = instance.inputValue
              this.$post('AlipayMini/openMiniVersionDeleteRequest', {
                app_id: row.appId,
                app_version: value
              }).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
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
