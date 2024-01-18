<template>
  <el-drawer :title="$t('components.editWdMoney')" :visible.sync="drawerStatus">
    <el-form class="pl-20 pr-20 custom-form" @submit.native.prevent="dialogConfirm()">
      <el-form-item :label="$t('components.editMoney')" v-if="isBrand()">
        <el-switch
          v-model="dform.deduction"
          :active-text="$t('components.deduction')"
          :inactive-text="$t('components.augment')" />
        <el-input type="number" v-model="dform.amount" :placeholder="$t('public.enter')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('components.deductionMoney')" v-if="isAgent()">
        <el-input type="number" v-model="dform.amount" :placeholder="$t('public.enter')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('components.remark')">
        <el-input type="text" v-model="dform.remark" :placeholder="$t('public.enter')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('components.recordStatus')" v-if="isBrand()">
        <el-switch v-model="dform.visible"/>
        <div class="fs-s3 color mt-5 line-1">
          {{ $t('components.editMoneyText') }}<span v-if="userType != 'user'">{{ $t('components.editMoneyText2') }}</span>
          <el-popover placement="right" title="" trigger="hover" v-if="userType != 'user'">
            <div>
              <img :src="require('@/assets/income.png')" width="300">
            </div>
            <el-link type="danger" :underline="false" slot="reference" class="el-icon-question fs-c1"></el-link>
          </el-popover>
        </div>
      </el-form-item>
    </el-form>
    <div style="height: 66px;"></div>
    <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
      <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
      <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
    </div>
  </el-drawer>
</template>

<script>
  import { accSub, accAdd } from '@/utils/index'
  export default {
    name: 'UpdateBlance',
    data() {
      return {
        clickSubmit: false,
        drawerStatus: false,
        curRow: {},
        dform: {},
      }
    },
    props: {
      userType: {
        type: String,
        default: 'store'
      }
    },
    methods: {
      /**
       * @param {Object} row
       */
      setRows(row){
        this.dform = {
          deduction: this.userType == 'user' || this.isAgent(),
          visible: this.userType != 'user'
        }
        this.curRow = row
        this.drawerStatus = true
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let params = JSON.parse(JSON.stringify(this.dform))
        if (isNaN(params.amount)) {
          this.$message({
            message: this.$t('components.checkMoney'),
            type: 'error'
          })
          return
        }
        if(this.clickSubmit) return
        this.clickSubmit = true
        params.ownerId = this.curRow.ownerId || this.curRow.id
        this.$post('iot-saas-pay/admin/pay/withdraw/saasUpdateBlance', params).then(res => {
          this.$message({
            message: this.$t('public.operationSuccessful'),
            type: 'success'
          })
          if(this.userType == 'store'){
            this.curRow.balance = params.deduction ? accSub(this.curRow.balance, params.amount) : accAdd(this.curRow.balance, params.amount)
          }else if(this.userType == 'user'){
            this.curRow.accountBalance = params.deduction ? accSub(this.curRow.accountBalance, params.amount) : accAdd(this.curRow.accountBalance, params.amount)
          }
          this.drawerStatus = false
          this.clickSubmit = false
        }).catch(err => {
          console.log(err)
          this.clickSubmit = false
        })
      }
    }
  }
</script>
<style scoped lang="scss">

</style>
