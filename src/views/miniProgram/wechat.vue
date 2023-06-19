<template>
  <div>
    <div class="pt-10 pl-10 pr-10 bg-white">
      <el-button class="mb-10" type="primary" size="medium" @click="refreshOpenToken" v-if="isSaas()">刷新第三方平台token</el-button>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="小程序">
          <template slot-scope="scope">
            {{ scope.row.appName || '小程序名称' }}
          </template>
        </el-table-column>
        <el-table-column label="APPID">
          <template slot-scope="scope">
            {{ scope.row.appId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="最新模板">
          <template slot-scope="scope">
            {{ scope.row.latestTemplateId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="当前模板">
          <template slot-scope="scope">
            {{ scope.row.appTemplate || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            {{ appAuditStatus[scope.row.appAuditStatus] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">
            {{ scope.row.appAuditResult || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间">
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1)">上传代码</el-button>
              <el-button type="primary" size="mini" @click="setRows(2, scope.row, 1)" v-if="scope.row.appAuditStatus == 1 || scope.row.appAuditStatus == 4">提交审核</el-button>
              <el-button type="primary" size="mini" @click="setRows(3, scope.row, 1)" v-if="scope.row.appAuditStatus == 2">审核状态</el-button>
              <el-button type="primary" size="mini" @click="setRows(4, scope.row, 1)" v-if="scope.row.appAuditStatus == 3">发布代码</el-button>
              <el-button type="primary" size="mini" @click="setRows(5, scope.row)">隐私设置</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/system/wechatEdit?app_id=${scope.row.appId}`})" v-if="isBrand()">修改信息</el-button>
              <el-button type="primary" size="mini" @click="setRows(6, scope.row, 1)">刷新token</el-button>
            </div>
            <!-- <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">服务域名</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 2)">业务域名</div> -->
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination
      		v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>

      <div class="pt-20 text-center text-primary cursor" @click="$router.push({path: `/system/wechatEdit`})" v-if="list.length == 0">绑定小程序</div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定上传代码到此小程序吗？</div>
        </div>
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
    name: 'wechat',
    components: {
      Pagination
    },
    props: {

    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        listQuery: {
          page: 1,
          size: 20
        },
        listTotal: 0,
        list: [],
        listLoading: false,

        appAuditStatus: {
          0: '待上传',
          1: '待审核',
          2: '审核中',
          3: '待发布',
          4: '审核失败',
          5: '已发布'
        },
        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '上传代码'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "wechatEdit") {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      if(this.$route.meta.reload){
        this.toQuery()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery()
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    mounted() {

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
        var params = Object.assign({}, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-pay/admin/pay/config/wechat/list', params).then(res => {
          this.list = res.rows || []
          this.listTotal = res.total
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
          }
        }).catch(err => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '上传代码' 2: '提交审核' 3: '查询审核状态' 4: '发布代码' 5: '隐私设置' 6: '刷新token'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            break
          case 2:
            this.$post(`iot-saas-pay/wechat/${row.appId}/submit/audit`).then(res => {
              this.$message({
                message: '提交审核成功',
                type: 'success'
              })
              row.appAuditStatus = 2
            })
            break
          case 3:
            this.$get(`iot-saas-pay/wechat/${row.appId}/latest/audit/status`).then(res => {
              this.$message({
                message: '查询成功',
                type: 'success'
              })
              row.appAuditStatus = (res.status == 0 ? 3 : res.status == 1 ? 4 : res.status)
            })
            break
          case 4:
            this.$post(`iot-saas-pay/wechat/${row.appId}/push/release`).then(res => {
              this.$message({
                message: '发布成功',
                type: 'success'
              })
              row.appAuditStatus = 5
            })
            break
          case 5:
            this.$get(`iot-saas-pay/wechat/${row.appId}/get/privacy?privacy_ver=2`).then(res => {
              let title = '用户隐私保护未设置'
              if(res.owner_setting.contact_email != '' || res.owner_setting.contact_phone != '' || res.owner_setting.contact_qq != '' || res.owner_setting.contact_weixin != ''){
                title = '用户隐私保护已设置'
              }
              this.$alert(title + '，确定提交小程序用户隐私保护设置吗？', '用户隐私保护设置', {
                confirmButtonText: '确定',
                center: true,
                callback: action => {
                  if (action == "confirm") {
                    this.$post(`iot-saas-pay/wechat/${row.appId}/set/privacy`, {

                    }).then(res => {
                      this.$message({
                        message: '设置成功',
                        type: 'success'
                      })
                    })
                  }
                }
              })
            })
            break
          case 6:
            this.$get(`iot-saas-pay/open/pay/init/refreshAuthorizerToken?appId=${row.appId}`).then(res => {
              this.$message({
                message: '刷新成功',
                type: 'success'
              })
            })
            break
        }
      },

      /**
       * 第三方平台token
       */
      refreshOpenToken(){
        this.$get(`iot-saas-pay/open/pay/init/refreshComonentToken`).then(res => {
          this.$message({
            message: '刷新成功',
            type: 'success'
          })
        })
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
            this.$post('iot-saas-pay/wechat/upload/code', {
              appId: curRow.appId,
              ext: {
                appId: curRow.appId,
              },
              directCommit: false,
              extEnable: true,
              extAppid: curRow.appId
            }).then(res => {
              this.$message({
                message: '上传成功',
                type: 'success'
              })
              curRow.appAuditStatus = 1
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
