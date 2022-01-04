<template>
  <div>
    <div class="pt-5 pl-15 pr-15 pb-5 bg-white">
      <h4 class="mt-10">购买服务</h4>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">服务类型</div>
        <div class="text-black">系统服务</div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">服务名称</div>
        <div class="text-black">付费套餐模式</div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">模式</div>
        <div>
          <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" :class="{'text-green': pay_types == 2}" v-for="item in types"
            :key="item.label" :type="item.type" effect="plain">
            {{ item.label }}
          </el-tag>
        </div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">周期</div>
        <div>
          <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" :class="{'text-green': pay_types == 2}" v-for="item in typesday"
            :key="item.label" :type="item.type" effect="plain">
            {{ item.label }}
          </el-tag>
        </div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">服务价格</div>
        <div class="fs-c1 text-danger">¥10000.00</div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">支付方式</div>
        <div>
          <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" :class="{'text-primary': pay_type == 1}" key="1" type="info"
            effect="plain" @click="pay_type = 1">
            <svg-icon class="mr-5" icon-class="alipay"></svg-icon> 支付宝
          </el-tag>
          <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" :class="{'text-green': pay_type == 2}" key="2" type="info"
            effect="plain" @click="pay_type = 2">
            <svg-icon class="mr-5" icon-class="wxpay"></svg-icon> 微信
          </el-tag>
        </div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60"></div>
        <el-button type="primary" :disabled="clickSubmit" @click="postEdit()">立即支付</el-button>
      </div>

      <div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="服务详情" name="first">
            <div>
              <h4>服务详情</h4>
              <h4>服务详情</h4>
              <h4>服务详情</h4>
            </div>
          </el-tab-pane>
          <el-tab-pane label="服务亮点" name="second">
            <div>
              <h4>服务亮点</h4>
              <h4>服务亮点</h4>
              <h4>服务亮点</h4>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="text-center">
          <div class="text-black">确定该笔提现申请通过审核吗？</div>
        </div>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-black">确定该笔提现申请拒绝通过吗？</div>
        <el-form class="custom-form">
          <el-input v-model="dform.note" placeholder="请输入备注内容" type="textarea" :rows="5" />
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
    name: 'buyService',
    components: {
      Pagination
    },
    data() {
      return {
        clickSubmit: false,
        types: [{
            type: 'primary',
            label: '免押'
          },
          {
            type: 'info',
            label: '预付'
          },
          {
            type: 'info',
            label: '预付+免押'
          },
        ],
        typesday: [{
            type: 'info',
            label: '免费试用七天'
          },
          {
            type: 'primary',
            label: '一个月'
          },
          {
            type: 'info',
            label: '一年'
          },
          {
            type: 'info',
            label: '永久'
          }
        ],

        activeName: 'first',
        pay_types: 1,
        pay_type: 1,
        info: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '通过提现'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {
      //this.getInfo()
    },
    methods: {
      /**
       * 获取详情
       */
      getInfo() {
        this.$get('iot-saas-basic/admin/agent/findPage', {}).then(res => {

        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '提现通过', 2: '提现拒绝'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (row.type) {
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
          case 2:
            this.$post('agentapi/upper_review_apply', {
              apply_id: curRow.id,
              note: params.note,
              agree: 2
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              row.withdraw_status = 3
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .el-tag {
    border-radius: 2px;

    .svg-icon {
      vertical-align: -5px;
    }

    &.text-primary {
      color: #3CA1FE;
      border-color: #3CA1FE;
    }

    &.text-green {
      color: #07C160;
      border-color: #07C160;
    }
  }

  .w-60 {
    width: 60px;
  }
</style>
