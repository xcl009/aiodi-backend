<template>
  <div class="p-10">
    <el-form ref="form" label-width="150px">
      <el-tabs class="bg-white" type="border-card" v-model="type">
        <el-tab-pane label="充电桩包月会员设置" name="1" class="pl-30 pr-30">
          <el-form-item label="是否开启：">
            <el-switch :active-value="1" :inactive-value="0" v-model="card.member_card_switch"/>
          </el-form-item>
          <div class="flex" v-for="item in config.cardObj">
            <el-form-item :label="`${item.name}：`">
              <el-input class="mr-10" v-model="card[`${item.key}_card_fee`]">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="时长：">
              <el-input class="mr-10" v-model="card[`${item.key}_card_hours`]">
                <template slot="append">小时</template>
              </el-input>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" @click="postCard()">立即提交</el-button>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="成本价售价" name="2" class="pl-30 pr-30" v-if="checkRoles(['partner'])">
          <template v-for="(device, index) in myDeviceName">
            <template v-if="fee_plan[`${config.goods_key[device]}_buy_goods_fee`]">
              <div class="flex" v-for="item in fee_plan[`${config.goods_key[device]}_buy_goods_fee`]">
                <el-form-item class="mr-20" :label="`${item.type_name}成本价：`">
                  <el-input v-model="item.cost_price">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="售价：">
                  <el-input v-model="item.market_price">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </div>
            </template>
          </template>
          <el-form-item>
            <el-button type="primary" @click="editShopPart()">立即提交</el-button>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'pricing',
  data() {
    return {
      type: this.$route.query.type || '1',
      id: this.$route.params.id || '',
      card: {},
      info: {},
      fee_plan: {}
    }
  },
  computed: {
    myDeviceName(){
      let myDeviceName = this.$store.state.user.myDeviceName
      return myDeviceName
    }
  },
  mounted() {
    this.getMemberCard()
    this.getInfo()
  },
  methods: {
    /**
     * 获取信息
     */
    getInfo() {
      this.$get('agentapi/my_merchant_detail', {
        store_id: this.id
      }).then(res => {
        let goods_key = this.config.goods_key, fee_plan = {}
        for(var i in goods_key){
          if(res[`${goods_key[i]}_buy_goods_fee`]){
            fee_plan[ `${goods_key[i]}_buy_goods_fee` ] = res[`${goods_key[i]}_buy_goods_fee`]
          }
        }
        this.fee_plan = fee_plan
        this.info = res
      })
    },

    /**
     * 修改商户的部分
     */
    editShopPart(row){
      let params = {
          store_id: this.id,
          type: this.type
        },
        goods_key = this.config.goods_key
      for(var i in goods_key){
        if(this.fee_plan[`${goods_key[i]}_buy_goods_fee`]){
          params[ `${goods_key[i]}_buy_goods_fee` ] = this.fee_plan[`${goods_key[i]}_buy_goods_fee`]
        }
      }
      this.$post('agentapi/store/type_switch', params).then(res => {
        this.$message({
          type: 'success',
          message: '设置成功'
        })
      })
    },

    /**
     * 会员卡信息
     */
    getMemberCard(){
      let card = {}
      this.$get('agentapi/store/member_card', {
        store_id: this.id
      }).then(res => {
        card = res.store_memebr_card_info.std_zhuang
        card.member_card_switch = res.member_card_switch
        this.card = card
      })
    },

    /**
     * 提交会员卡信息
     */
    postCard(){
      let params = this.card
      params.store_id = this.id
      params.type = params.depend_type
      this.$post('agentapi/store/member_card', params).then(res => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
