<template>
  <div>
    <div class="pl-20 pr-20 pb-5 custom-form bg-white">
      <el-tabs class="mb-10" v-model="deviceTypeCode" @tab-click="getInfo">
        <el-tab-pane :label="item" :name="name" v-for="(item, name) in myDeviceId" />
      </el-tabs>

      <template v-if="code == 'DIVIDE_ACCOUNTS' && (checkAbility([`${deviceTypeCode}_DIVIDE_ACCOUNTS`], 3) || true)">
        <el-form class="custom-form" label-width="100px" label-position="left">
          <el-form-item label="状态">
            <div class="flex align-center">
              <el-switch v-model="dform.enable" :active-value="1" :inactive-value="2" />
              <span class="ml-10 fs-s3">开启表示设置有效，设置后5分钟内生效</span>
            </div>
          </el-form-item>
          <el-form-item label="接收方类型">
            <el-radio-group v-model="dform.type">
              <el-radio label="MERCHANT_ID">商户</el-radio>
              <el-radio label="PERSONAL_OPENID">个人</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="接收方姓名">
            <el-input v-model="dform.realname"></el-input>
          </el-form-item>
          <el-form-item label="接收方关系">
            <el-select v-model="dform.reType" placeholder="请选择">
              <el-option
                v-for="(name, val) in reType"
                :label="name"
                :value="val">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分账关系名称" v-if="dform.reType == 'CUSTOM'">
            <el-input v-model="dform.text"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" :disabled="clickSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-else>
        <div class="pb-20 cursor" @click="$router.push({path: `/market/appList`})">暂未购买此功能服务，<span class="text-primary">去购买</span></div>
      </template>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false" width="700px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">

      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'toolsConfig',
    data() {
      return {
        clickSubmit: false,
        id: this.$route.query.id || '',
        userKey: this.$route.query.userKey || '',
        code: this.$route.query.code || '',
        deviceTypeCode: '',

        // 分账接收方
        reList: [{},{},{}],
        reType: {
          STORE: '门店',
          STAFF: '员工',
          STORE_OWNER: '店主',
          PARTNER: '合作伙伴',
          HEADQUARTER: '总部',
          BRAND: '品牌方',
          DISTRIBUTOR: '分销商',
          USER: '用户',
          SUPPLIER: '供应商',
          CUSTOM: '自定义',
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: ''
        },
        curRow: {},
        curIdx: 0,
        dform: {},
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {
      this.deviceTypeCode = Object.keys(this.myDeviceId)[0]
      if(this.code == '55555'){
        this.form = {}
        this.getInfo()
      }
    },
    methods: {
      /**
       * 获取详情
       */
      getInfo() {
        this.$get(``, {
          deviceTypeCode: this.deviceTypeCode
        }).then((res = {}) => {

        })
      },

      /**
       * 提交保存
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        params.deviceTypeCode = this.deviceTypeCode
        this.$post(``, params).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      },

      /**
       * 操作数据
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '编辑分账接收方'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            if(dialogType == 1){
              // this.$get('iot-saas-basic/admin/settings/find', {
              //   code: row.code
              // }).then(res => {
              //   if(res && res.code){
              //     this.dform = JSON.parse(res.setting)
              //   } else {
              //     this.dform = {
              //       wx_phone: 0,
              //       ali_phone: 0
              //     }
              //   }
              // })
            } else {
              this.dform = {}
            }
            this.dialogStatus = true
            break
        }
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
            this.$post('iot-saas-basic/admin/settings/save', {
              code: curRow.code,
              setting: JSON.stringify(params)
            }).then(res => {
              this.$message({
                message: '提交成功',
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

<style scoped lang="scss">
  /deep/ .el-tabs__item{
    height: 50px;
    line-height: 50px;
    font-size: 16px;
  }
</style>
