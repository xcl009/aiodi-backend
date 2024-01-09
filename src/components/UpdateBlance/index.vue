<template>
  <el-drawer title="修改可提现金额" :visible.sync="drawerStatus">
    <el-form class="pl-20 pr-20 custom-form" @submit.native.prevent="dialogConfirm()">
      <el-form-item label="修改金额" v-if="isBrand()">
        <el-switch
          v-model="dform.deduction"
          active-text="扣减"
          inactive-text="增加" />
        <el-input type="number" v-model="dform.amount" placeholder="请输入修改金额"></el-input>
      </el-form-item>
      <el-form-item label="扣减金额" v-if="isAgent()">
        <el-input type="number" v-model="dform.amount" placeholder="请输入扣减金额"></el-input>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input type="text" v-model="dform.remark" placeholder="请输入备注信息"></el-input>
      </el-form-item>
      <el-form-item label="记录状态" v-if="isBrand()">
        <el-switch v-model="dform.visible"/>
        <div class="fs-s3 color mt-5 line-1">
          关闭表示该账户无法看到本次修改记录<span v-if="userType != 'user'">且查看收益明细列表将无法查看到记录余额和收益总额</span>
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
      <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
      <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
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
        if(!row.id){
          this.$message({
            message: '账户异常',
            type: 'error'
          })
          return
        }
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
            message: '请输入正确的金额',
            type: 'error'
          })
          return
        }
        if(this.clickSubmit) return
        this.clickSubmit = true
        params.ownerId = this.curRow.ownerId || this.curRow.id
        this.$post('iot-saas-pay/admin/pay/withdraw/saasUpdateBlance', params).then(res => {
          this.$message({
            message: '操作成功',
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
