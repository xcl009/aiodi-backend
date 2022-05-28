<template>
  <div>
    <div class="pt-5 pl-15 pr-15 pb-5 bg-white">
      <h4 class="mt-10">购买服务</h4>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">服务类型</div>
        <div class="text-black">{{ serviceType[info.serviceTypeCode] }}</div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">服务名称</div>
        <div class="text-black">{{ info.name }}</div>
      </div>
      <div class="flex align-center mb-20 pb-5" v-if="info.priceSettings && Object.values(info.priceSettings).length > 1">
        <div class="mr-15 w-60">模式</div>
        <div>
          <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" effect="plain" v-for="item in info.priceSettings" @click="form.priceCode = item.priceCode">
            {{ item.priceName }}
          </el-tag>
        </div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">周期</div>
        <div v-if="info.priceSettings && info.priceSettings[form.priceCode]">
          <template v-for="item in cycle">
            <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor" effect="plain" v-if="!item.key || info.priceSettings[form.priceCode][item.key] > 0" :type="cycleKey == item.key ? '' : 'info'" @click="cycleKey = item.key; form.cycle = item.code">
              {{ item.label }}
            </el-tag>
          </template>
        </div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">价格</div>
        <div class="fs-c1 text-danger" v-if="info.priceSettings">{{ info.priceSettings[form.priceCode][cycleKey] || 0 }}</div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60">支付方式</div>
        <div>
          <el-tag class="mr-10 pl-15 pr-15 fs-s4 cursor text-primary" key="1" type="info"
            effect="plain">
            <svg-icon class="mr-5" icon-class="KHB"></svg-icon> 快活币
          </el-tag>
        </div>
      </div>
      <div class="flex align-center mb-20 pb-5">
        <div class="mr-15 w-60"></div>
        <el-button type="primary" :disabled="clickSubmit" @click="setRows(1, {}, 1)">立即支付</el-button>
      </div>

      <div>
        <el-tabs v-model="activeName">
          <el-tab-pane label="服务详情" name="first">
            <div v-html="info.description"></div>
          </el-tab-pane>
          <el-tab-pane label="服务案例" name="second" v-if="info.successfulCase">
            <div v-html="info.successfulCase"></div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="pb-20 text-center">
          <div class="fs-a1 text-black">确定购买当前服务吗？</div>
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
  import { arrayToObj } from '@/utils/index'
  import Pagination from '@/components/Pagination'
  export default {
    name: 'buyService',
    components: {
      Pagination
    },
    data() {
      return {
        clickSubmit: false,
        serviceType: {},
        cycle: [
          {
            code: '',
            key: '',
            label: '免费试用七天'
          },
          {
            code: 'MONTH',
            key: 'monthAmount',
            label: '一个月'
          },
          {
            code: 'YEAR',
            key: 'yearAmount',
            label: '一年'
          },
          {
            code: 'PERMANENT',
            key: 'permanentAmount',
            label: '永久'
          }
        ],

        activeName: 'first',
        pay_types: 1,
        pay_type: 1,
        info: {},
        form: {
          cycle: 'MONTH',
          priceCode: ''
        },
        cycleKey: 'monthAmount',

        id: this.$route.query.id,

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '购买服务'
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
      this.$store.dispatch('api/getServiceType').then(res => {
        this.serviceType = arrayToObj(res, 'code', 'name')
      })
      this.getInfo()
    },
    methods: {
      /**
       * 获取详情
       */
      getInfo() {
        this.$get(`iot-saas-basic/admin/service/market/${this.id}`).then(res => {
          this.form.priceCode = res.priceSettings[0].priceCode
          res.priceSettings = arrayToObj(res.priceSettings, 'priceCode')
          this.info = res
          console.log(this.info)
          console.log(this.form)
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '购买服务'
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
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            let payParams = JSON.parse(JSON.stringify(this.form))
            payParams.payTypeCode = 'HAPPY_MONEY'
            payParams.serviceId = this.id
            this.$post('iot-saas-basic/client/service/market/buy', payParams).then(res => {
              this.$message({
                message: '购买成功',
                type: 'success'
              })
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
