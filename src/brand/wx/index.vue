<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="合伙人">
          <template slot-scope="scope">
            <!-- ID：{{ scope.row.agent_id }} -->
            <div>昵称：{{ scope.row.agent_info.nick_name }}</div>
            <div>账号：{{ scope.row.agent_info.title }}</div>
            <div>手机：{{ scope.row.agent_info.link_tel }}</div>
          </template>
        </el-table-column>
        <el-table-column label="小程序">
          <template slot-scope="scope">
            <div>名称：{{ scope.row.app_name || '--' }}</div>
            <div>APPID：{{ scope.row.app_id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="最新模板" :render-header="renderHeader" v-if="siteInfo.wx_third_api_switch">
          <template slot-scope="scope">
            <div>{{ new_template_version }}</div>
            <a class="text-blue" @click="$router.push({path: `/home/updateRecord`})">更新明细</a>
          </template>
        </el-table-column>
        <el-table-column label="当前模板" width="180" v-if="siteInfo.wx_third_api_switch">
          <template slot-scope="scope">
            <template v-if="scope.row.mini_info.latest_code">
              <el-button-group>
                <el-button type="primary" plain round size="mini">{{ scope.row.mini_info.latest_code }}</el-button>
                <el-button type="primary" plain round size="mini">{{ scope.row.mini_info.option_status == 6 ? "已发布" : (total_auditstatus[scope.row.mini_info.audit_status] || '未提交') }}</el-button>
              </el-button-group>
              <div v-if="scope.row.mini_info.audit_desc" v-text="scope.row.mini_info.audit_desc"></div>
            </template>
            <template v-else>--</template>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180" v-if="siteInfo.wx_third_api_switch">
          <template slot-scope="scope">
            <div>{{ parseTime(scope.row.updated) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="域名" width="100" v-if="siteInfo.wx_third_api_switch">
          <template slot-scope="scope">
            <router-link class="el-button--text" :to="`/wx/domain?type=1&app_id=${scope.row.app_id}`">服务域名</router-link><br>
            <router-link class="el-button--text" :to="`/wx/domain?type=2&app_id=${scope.row.app_id}`">业务域名</router-link>
          </template>
        </el-table-column>
        <el-table-column label="代码" width="200" v-if="siteInfo.wx_third_api_switch">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="uploadCode(scope.row)">上传代码</el-button>
            <template v-if="scope.row.mini_info">
              <el-button class="e-btn mt-10" type="primary" size="mini" @click="getMiniCategoryList(scope.row)" v-if="scope.row.mini_info.option_status == 2 || scope.row.mini_info.option_status == 5">提交审核</el-button>
              <el-button class="e-btn mt-10" type="success" size="mini" @click="refreshAudit(scope.row)" v-if="scope.row.mini_info.option_status == 3">审核状态</el-button>
              <el-button class="e-btn mt-10" type="danger" size="mini" @click="releaseCode(scope.row)" v-if="scope.row.mini_info.option_status == 4">发布代码</el-button>
              <el-button class="e-btn mt-10" type="danger" size="mini" @click="revertCode(scope.row)" v-if="checkRoles(['terminal']) && scope.row.mini_info.option_status == 6">版本回退</el-button>
            </template>
            <el-button class="e-btn mt-10" type="primary" size="mini" @click="getPrivacySetting(scope.row)" v-if="checkRoles(['terminal'])">用户隐私保护</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <router-link class="mr-10" :to="`/wx/edit/${scope.row.id}`">
              <el-button type="primary" size="mini" icon="el-icon-edit" circle></el-button>
            </router-link>
            <!-- <el-button type="danger" size="mini" icon="el-icon-delete" circle></el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <div class="p-30 flex justify-center" v-if="list.length == 0 && agentInfo.agent_level == 1">
        <router-link :to="`/wx/create`">
          <el-button type="primary" round>绑定小程序</el-button>
        </router-link>
      </div>
      <div class="flex justify-center">
        <pagination v-show="listQuery.total > 0" :page.sync="listQuery.page" :limit.sync="listQuery.limit" :page-count="listQuery.total"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog title="选择类目" :visible.sync="dialogCategory">
      <el-form>
        <el-form-item label="类目:">
           <!-- <el-select v-model="value1" multiple placeholder="请选择">
              <el-option
                v-for="item in category"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>

            <el-select
              v-model="value2"
              multiple
              collapse-tags
              style="margin-left: 20px;"
              placeholder="请选择">
              <el-option
                v-for="item in category"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select> -->
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCategory = false">取 消</el-button>
        <el-button type="primary" @click="dialogCategory = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'wxcxc',
    components: {
      Pagination
    },
    data() {
      return {
        dialogCategory: false,
        category: [],
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
        new_template_version: 0
      }
    },
    computed: {
      agentInfo(){
        return this.$store.state.user.agentInfo
      },
      siteInfo(){
        return this.$store.state.user.siteInfo
      }
    },
    mounted() {
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
          tag: 'wm010001'
        }).then(res => {
          this.new_template_version = res
        })
      },

      /**
       * 获取列表
       */
      getList() {
        let url = '/admin/pay/config/wechat/list'
        let listQuery = Object.assign({}, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get(url, this.listQuery).then(res => {
          this.total_auditstatus = res.total_auditstatus
          this.total_optionstatus = res.total_optionstatus
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
      getMiniCategoryList(row, type = 1){
        let that = this, params = {}
        this.$post('WxOpen/getMiniCategoryList', {
          wxmini_appid: row.app_id
        }).then(res => {
          if(res[0]){
            if(type == 1){
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
          }else{
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
      auditMiniCode(row, params){
        this.$post('WxOpen/auditMiniCode', {
          wxmini_appid: row.app_id,
          audit_items: params
        }).then(res => {
          this.loadObj.close()
          this.$message({
            message: '提交审核成功',
            type: 'success'
          })
          this.getList()
        }).catch(err => {
          this.loadObj.close()
        })
      },

     /**
      * 刷新审核状态
      */
      refreshAudit(row){
        this.$post('WxOpen/refreshMiniCodeAuditResult', {
          wxmini_appid: row.app_id,
          audit_id: row.mini_info.audit_id
        }).then(res => {
          row.mini_info.audit_status = res.audit_status
          if(res.audit_status == 0) row.mini_info.option_status = 4
          this.$message({
            message: '刷新状态成功',
            type: 'success'
          })
        })
      },

      /**
       * 发布代码
       */
      releaseCode(row){
        this.$post('WxOpen/releaseMiniCode', {
          wxmini_appid: row.app_id
        }).then(res => {
          row.mini_info.option_status = 6
          this.$message({
            message: '发布成功',
            type: 'success'
          })
        })
      },

      /**
       * 小程序版本回退
       */
      revertCode(row){
        this.$alert('确定回退到上一个版本吗？', '小程序版本回退', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == "confirm") {
              this.$get('WxOpen/revertMiniCode', {
                wxmini_appid: row.app_id
              }).then(res => {
                this.$message({
                  message: '回退成功',
                  type: 'success'
                })
              })
            }
          },
        })
      },

      /**
       * 获取用户隐私保护
       */
      getPrivacySetting(row){
        this.$post('UserPrivacyProtection/getPrivacySetting', {
          appid: row.app_id
        }).then(res => {
          let title = '用户隐私保护未设置'
          if(res.owner_setting.contact_email != '' || res.owner_setting.contact_phone != '' || res.owner_setting.contact_qq != '' || res.owner_setting.contact_weixin != ''){
            title = '用户隐私保护已设置'
          }
          this.$alert(title + '，确定提交小程序用户隐私保护设置吗？', '用户隐私保护设置', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == "confirm") {
                this.setPrivacySetting(row)
              }
            }
          })
        })
      },

      /**
       * 用户隐私保护设置
       */
      setPrivacySetting(row){
        this.$post('UserPrivacyProtection/setPrivacySetting', {
          appid: row.app_id
        }).then(res => {
          this.$message({
            message: '设置成功',
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
