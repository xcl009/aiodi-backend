<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <el-row class="fs-s4">
        <el-col :xs="{span: 24}" :sm="{span: 12}">
          <h4 class="mt-0">基础信息</h4>
          <div class="mb-10">商户名称：{{ info.store_info.name }}</div>
          <div class="mb-10">商户地址：{{ info.store_info.address }}</div>
          <div>商户链接：pages/packageB/store/detail?shop_id={{ info.store_id }}</div>

          <!-- <template v-if="selType[0]">
            <h4>充电宝设备资费</h4>
            <div class="mb-10">计费单价：{{ info.bao_fee_plan.rent_fee_std }}元</div>
            <div class="mb-10">计费单位：{{ info.bao_fee_plan.rent_unit_minute_std }}分钟</div>
            <div>封顶值：{{ info.bao_fee_plan.day_most_std }}元</div>
          </template> -->
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 12}">
          <h4 class="mt-0">分润信息</h4>
          <div class="mb-10" v-if="agentInfo.business_type != 1">可提现金额：{{ info.profit_info.profit_money }}元</div>
          <div class="mb-10">联系人：{{ info.profit_info.contact }}</div>
          <div class="mb-10">联系电话：{{ info.profit_info.phone }}</div>
          <div class="mb-10" v-if="info.store_info.divide_type_1 > 0">分成方式：{{ info.store_info.divide_type_1 == 1 ? '不分成' : '入场费' }}</div>
          <div v-for="(item, key) in selType" v-else>
            <div class="mb-10">{{ myDeviceId[key] }}分润：</div>
            <div class="mb-10" v-if="info.profit_info[config.goods_key[key] + '_product_percent'] >= 0">{{ myDeviceId[key] }}商品分润：</div>
          </div>
          <!-- <div class="mb-10" v-if="info.profit_info.withdraw_right == 1">提现费率：{{ info.profit_info.withdraw_percent }}%</div>
          <div class="mb-10" v-if="info.profit_info.withdraw_right == 1">提现单笔手续费：{{ info.profit_info.withdraw_fee }}元</div> -->
          <div>查看订单权限：{{ info.profit_info.check_order == 1 ? '是' : '否' }}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col class="pr-20" :xs="{span: 24}" :sm="{span: 12}">
          <h4>商户归属</h4>
          <el-table :data="info.belong" stripe highlight-current-row border>
            <el-table-column label="角色">
              <template slot-scope="scope">
                {{ scope.row.role_name }}
              </template>
            </el-table-column>
            <el-table-column label="姓名">
              <template slot-scope="scope">
                {{ scope.row.name || "--" }}
              </template>
            </el-table-column>
            <el-table-column label="手机号码" v-if="checkRoles(['terminal','partner'])"">
              <template slot-scope="scope">
                {{ scope.row.phone || "--" }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col class="pr-20" :xs="{span: 24}" :sm="{span: 12}">
          <h4>设备信息 <el-link class="pl-15" type="primary" v-if="selSnArr.length > 0" @click='deleteEquip()'>解绑设备</el-link></h4>
          <el-table :data="info.device_info" stripe highlight-current-row @selection-change="selSb">
            <el-table-column type="selection" width="50" />
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
                <span class="text-primary" @click='deleteEquip(scope.row)'>解绑</span>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import {
    showPercent
  } from '@/utils/index'
  export default {
    name: 'shopDetail',
    components: {

    },
    data() {
      return {
        showPercent: showPercent,
        info: {
          store_info: {},
          bao_fee_plan: {},
          profit_info: {}
        },
        selSnArr: [],
        selType: {}
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      agentInfo() {
        return this.$store.state.user.agentInfo
      },
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
          this.getDeviceType(res.son_id)
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 获取设备类型
       */
      getDeviceType(id){
        this.$get('agentapi/sttuf/son_device_type', {
          son_id: id
        }).then(res => {
          let selType = {}
          for (var i in res) {
            if (res[i].son_taked > 0) {
              selType[res[i].depend_type] = true
            }
          }
          this.selType = selType
        })
      },

      /**
         * 选择设备
         * @param {Object} res
         */
      selSb(list) {
        let selSnArr = [], selID = []
        for (var i in list) {
          selSnArr.push(list[i].goods_sn)
          selID.push(list[i].id)
        }
        this.selSnArr = selSnArr
        this.selID = selID
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
                zuo_sn: row ? row.goods_sn : this.selSnArr
              }).then(res => {
                this.$message({
                  message: '解绑成功',
                  type: 'success'
                })
                this.getInfo()
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
