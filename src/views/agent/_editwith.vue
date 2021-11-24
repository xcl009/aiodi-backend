<template>
  <div>
    <el-dialog :title="moneyType == 2 ? '修改总收益' : '修改可提现金额'" :visible.sync="editWithDialog" width="700px">
      <el-form label-width="100px" >
        <el-form-item label="修改金额：" v-if="moneyType == 1">
          <el-input v-model="editWith.money" placeholder="正数为加，负数为减">
            <template slot="append">元</template>
          </el-input>
          <div class="fs-s2 text-gray">提示：正数为加，负数为减</div>
        </el-form-item>
        <el-form-item label="修改金额：" v-if="moneyType == 2">
          <el-input v-model="editWith.chang_income" placeholder="正数为加，负数为减">
            <template slot="append">元</template>
          </el-input>
          <div class="fs-s2 text-gray">提示：正数为加，负数为减</div>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input v-model="editWith.remark"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit()">确定</el-button>
        </el-form-item>
      </el-form>

      <el-table class="ptd-5" :data="withList" v-if="withList.length > 0">
        <el-table-column label="修改时间">
          <template slot-scope="{row}">
            {{ parseTime(row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
        <el-table-column label="当前余额" width="100">
          <template slot-scope="{row}">
            {{ row.old_money }}
          </template>
        </el-table-column>
        <el-table-column label="修改金额" width="100">
          <template slot-scope="{row}">
            <span :class="row.modify_type == 2 ? 'text-danger' : 'text-blue'">{{ row.modify_type == 2 ? '-' : '+' }}{{ row.deal_money }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成余额" width="100">
          <template slot-scope="{row}">
            {{ row.new_money }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="180">
          <template slot-scope="{row}">
            {{ row.remark }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { accAdd } from '@/utils/index'
/**
 * 修改可提现金额
 */
export default {
  props: {
    // 1 代理 2 商户
    type: {
      type: Number,
      default: 1
    },
    // 1 可提现金额 2 总收益
    moneyType: {
      type: Number,
      default: 1
    }
  },
  data(){
    return {
      //可提现金额
      editWithDialog: false,
      withList: [],
      editWith: {},
      setRow: {}
    }
  },
  mounted(){
    
  },
  methods: {
    /**
     * 显示dialog
     */
    showDialog(row){
      this.editWithDialog = true
      this.setRow = row
      this.editWith.son_id = row.aid ? row.aid : row.id
      this.getList(this.editWith.son_id)
    },

    /**
     * 获取修改记录
     */
    getList(id){
      let url = 'agentapi/business/modify_agent_accout'
      if(this.moneyType == 2) url = 'agentapi/business/modify_agent_income'
      this.$get(url, {
        son_id: id
      }).then(res => {
        this.withList = res.list
      })
    },

    /**
     * 获取修改记录
     */
    onSubmit(){
      let url = 'agentapi/business/modify_agent_accout'
      if(this.moneyType == 2) url = 'agentapi/business/modify_agent_income'
      this.loadObj = this.$loading({
        lock: true,
        text: '正在提交',
        spinner: 'el-icon-loading'
      })
      this.$post(url, this.editWith).then(res => {
        if(this.moneyType == 2){
          if(this.type == 2){
            this.setRow.profit = accAdd(this.setRow.profit, this.editWith.chang_income)
            this.setRow.available_withdraw_money = accAdd(this.setRow.available_withdraw_money, this.editWith.chang_income)
          } else {
            this.setRow.income = accAdd(this.setRow.income, this.editWith.chang_income)
            this.setRow.money = accAdd(this.setRow.money, this.editWith.chang_income)
          }
        } else {
          if(this.type == 2){
            this.setRow.available_withdraw_money = accAdd(this.setRow.available_withdraw_money, this.editWith.money)
          } else {
            this.setRow.money = accAdd(this.setRow.money, this.editWith.money)
          }
        }
        this.editWithDialog = false
        this.editWith = {}
        this.loadObj.close()
        this.$message({
          message: '修改成功',
          type: 'success'
        })
      }).catch(err => {
        this.loadObj.close()
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
