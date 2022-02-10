<template>
  <div>
		<!-- <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-date-picker
          class="range-day flex align-center"
          v-model="form.day"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
        <el-select v-model="form.withdraw_type" placeholder="提现方式" @change="toQuery()">
          <el-option :label="item" :value="index" v-for="(item, index) in config.withdraw_way"/>
        </el-select>
        <el-input v-model="form.name" placeholder="代理姓名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
		  </template>
		</condition> -->

    <div class="pt-15 pl-15 pr-15 pb-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="小程序" align="center">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.appName || '小程序名称' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="APPID" align="center">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.appId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="最新版本" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="当前版本" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            {{ scope.row.charge_county || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center">
          <template slot-scope="scope">
            {{ parseTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">上传代码</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="$router.push({path: `/systemSet/wechatEdit?app_id=${scope.row.appId}`})">修改信息</div>
            <!-- <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 1)">服务域名</div>
            <div class="inline pl-10 pr-10 cursor text-primary" @click="setRows(1, scope.row, 2)">业务域名</div> -->
          </template>
        </el-table-column>
      </el-table>

      <div class="pt-20 text-center text-primary cursor" @click="$router.push({path: `/systemSet/wechatEdit`})" v-if="list.length == 0">绑定小程序</div>
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
    name: 'wechat',
    components: {},
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,

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
        this.form = {
          activated_status: 1
        }
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form)
        this.$get('iot-saas-pay/admin/pay/config/wechat/list', params).then(res => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
        }).catch(err => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '上传代码'
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
            this.$post('agentapi/upper_review_apply', {
              apply_id: curRow.id,
              agree: 1
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              row.withdraw_status = 2
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
