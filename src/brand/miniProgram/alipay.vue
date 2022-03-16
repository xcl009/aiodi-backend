<template>
  <div>
    <div class="pt-15 pl-15 pr-15 pb-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border>
        <el-table-column label="小程序" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.appName || '小程序名称' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="APPID" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.appId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="最新版本" align="center">
          <template slot-scope="scope">
            {{ scope.row.latestTemplateId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="当前版本" align="center">
          <template slot-scope="scope">
            {{ scope.row.appTemplate || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            {{ appAuditStatus[scope.row.appAuditStatus] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center">
          <template slot-scope="scope">
            {{ scope.row.appAuditResut || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" width="100">
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">上传代码</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(2, scope.row, 1)" v-if="scope.row.appAuditStatus == 1">提交审核</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(3, scope.row, 1)" v-if="scope.row.appAuditStatus == 2">审核状态</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(4, scope.row, 1)" v-if="scope.row.appAuditStatus == 3">发布代码</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(4, scope.row, 1)" v-if="scope.row.appAuditStatus == 4">审核失败</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(5, scope.row, 1)" v-if="scope.row.appAuditStatus == 2">取消审核</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(6, scope.row, 1)" v-if="scope.row.appAuditStatus == 4">回退开发</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(7, scope.row, 1)" v-if="scope.row.appAuditStatus == 1">体验版本</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="$router.push({path: `/systemSet/alipayEdit?app_id=${scope.row.appId}`})">修改信息</div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pt-20 text-center text-primary cursor" @click="$router.push({path: `/systemSet/alipayEdit`})" v-if="list.length == 0">绑定小程序</div>
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
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'alipay',
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
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
      if (from.name == "alipayEdit") {
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
        this.form = {}
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form)
        this.$get('iot-saas-pay/admin/pay/config/alipay/list', params).then(res => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '上传代码' 2: '提交审核' 3: '查询审核状态' 4: '发布代码' 5: '取消审核' 6: '回退开发' 7: '体验版本'
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
            this.$post('iot-saas-pay/alipay/submit/audit', {
              regionType: 'CHINA',
              regionType: 'CHINA',
            }).then(res => {

            })
            break
          case 3:
            this.$get('iot-saas-pay/iot-saas-pay/alipay/build/status', {

            }).then(res => {

            })
            break
          case 4:
            this.$post('iot-saas-pay/alipay/push/release', {

            }).then(res => {

            })
            break
          case 5:
            this.$confirm('确定取消此次审核吗?', '取消审核', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.$post('iot-saas-pay/alipay/cancel/audit', {

              }).then(res => {

              })
            })
            break
          case 6:
            this.$confirm('确定回退到开发版本吗?', '回退开发版本', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.$post('iot-saas-pay/alipay/fallback/develop', {

              }).then(res => {

              })
            })
            break
          case 7:
            this.$post('iot-saas-pay/alipay/create/experience', {

            }).then(res => {

            })
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
        switch (this.dialogType) {
          case 1:
            this.$post('iot-saas-pay/alipay/upload/code', {
              appId: curRow.appId,
              directCommit: 1,
              enable: 1
            }).then(res => {

            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
