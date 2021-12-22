<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <div class="flex fs-s4">
        <div class="flex1">
          <h4 class="mt-0">基础信息</h4>
          <div class="mb-10">商户名称：{{ info.store_info.name }}</div>
          <div>商户地址：{{ info.store_info.address }}</div>

          <h4>设备资费信息</h4>
          <div class="mb-10">计费模式：{{ info.bao_fee_plan.rent_desc_std }}</div>
          <div class="mb-10">计费单价：{{ info.bao_fee_plan.rent_fee_std }}</div>
          <div>封顶值：{{ info.bao_fee_plan.day_most_std }}</div>
        </div>
        <div class="flex1">
          <h4 class="mt-0">分润信息</h4>
          <div class="mb-10">分润金额：{{ info.profit_info.profit_money }}</div>
          <div class="mb-10">联系人：{{ info.profit_info.contact }}</div>
          <div class="mb-10">联系电话：{{ info.profit_info.phone }}</div>
          <div class="mb-10">分润比例：{{ info.profit_info.profit_percent }}</div>
          <div class="mb-10">提现手续费：{{ info.profit_info.withdraw_percent }}</div>
          <div>查看订单权限：{{ info.profit_info.check_order }}</div>
        </div>
      </div>
      <div class="mt-20">
        <el-table :data="info.device_info" stripe highlight-current-row>
          <el-table-column label="设备SN码">
            <template slot-scope="scope">
              {{ scope.row.goods_sn }}
            </template>
          </el-table-column>
          <el-table-column label="铺货日期">
            <template slot-scope="scope">
              {{ scope.row.distribute_time || "--" }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click='deleteEquip(scope.row)'>解绑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'shopDetail',
    components: {

    },
    data() {
      return {
        info: {
          store_info: {},
          bao_fee_plan: {},
          profit_info: {}
        }
      }
    },
    mounted(options) {
      this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('agentapi/my_merchant_detail', {
          store_id: this.$route.params.id
        }).then(res => {
          this.info = res
        }).catch(() => {
          this.listLoading = false
        })
      },

     /**
      * 解绑设备
      * @param {Object}
      */
      deleteEquip(row){
        let that = this
        this.$alert('确定解绑此商户的设备吗？', '解绑设备', {
          confirmButtonText: '确定',
          callback: action => {
            if(action == "confirm"){
              this.$post('agentapi/unset_binded_zuo', {
                zuo_sn: row.goods_sn
              }).then(res => {
                this.$message({
                  message: '解绑成功',
                  type: 'success'
                });
                this.getInfo();
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
</style>
