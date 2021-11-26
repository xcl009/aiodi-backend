<template>
  <div>
    <div v-show="form.divide_type_1 == 0">
      <h5 class="pl-20" v-if="name == config.goods_key[7] && false">充电线订单分润比例</h5>
      <el-form-item label="分成模式：">
        <el-radio-group v-model="form[name + '_virtual_divide']" @change="virtualChange">
          <el-radio-button :label="0">分成一致</el-radio-button>
          <el-radio-button :label="1" v-if="form[name + 'old_virtual_divide'] == 1 || agentInfo.virtual_divide_status == 1">分成不一致</el-radio-button>
        </el-radio-group>
        <el-popover
          placement="right"
          title="分成注释"
          width="400"
          trigger="hover">
          <div>
            分成一致<br>
            真实分成：若真实分成设置为60%，则10元订单商户可分润10×60%=6元<br>
            相对分成：若相对分成设置为90%，自己本身的分成为50%，则10元订单商户可分润10×50%×90%=4.5元<br><br>
            <div v-if="agentInfo.virtual_divide_status == 1">
              分成不一致<br>
              承诺分成：商户后台显示此分成比例。<span v-if="agentInfo.virtual_divide_order_num > 0">若自身的分成为50%，设置承诺分成为90%，则10元订单商户可分润10×50%×90%=4.5元。注：每天只有第{{ agentInfo.virtual_divide_order_num }}笔订单按照承诺分成比例分润。</span><br>
              实际分成：若自身的分成为50%，设置实际分成为20%，则10元订单商户可分润10×50%×20%=1元。注：每天从第{{ agentInfo.virtual_divide_order_num + 1 }}笔订单开始就按照实际分成比例分润。<br>
            </div>
          </div>
          <el-link type="danger" slot="reference" class="ml-10 el-icon-question"></el-link>
        </el-popover>
      </el-form-item>
      <template v-if="form[name + '_virtual_divide'] == 0">
        <el-form-item label="真实分成：">
          <el-input class="input-with" v-model="form[name + '_percent']" :placeholder="`最高不能超过${powerInfo[name + '_percent']}%`">
            <template slot="prepend"><el-radio class="pl-10" v-model="form[name + '_relative_divide']" :label="0">&nbsp;</el-radio></template>
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="相对分成：">
          <el-input class="input-with" v-model="form[name + '_relative_percent']" placeholder="最高不能超过100%" @blur="countPercent()">
            <template slot="prepend"><el-radio class="pl-10" v-model="form[name + '_relative_divide']" :label="1">&nbsp;</el-radio></template>
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="商户相对真实分成：">
          <el-input v-model="form[name + '_relative_zs']" disabled>
            <template slot="append">%</template>
          </el-input>
        </el-form-item> -->
      </template>
      <template v-if="form[name + '_virtual_divide'] == 1">
        <el-form-item label="承诺分成：">
          <el-input v-model="form[name + '_virtual_relative_percent']" placeholder="最高不能超过100%">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="实际分成：">
          <el-input v-model="form[name + '_relative_percent']" placeholder="最高不能超过100%" @blur="countPercent()">
            <template slot="append">%</template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="商户承诺相对真实分成：">
          <el-input v-model="form[name + '_relative_zs']" disabled>
            <template slot="append">%</template>
          </el-input>
        </el-form-item> -->
      </template>

      <div v-if="name == config.goods_key[7]">
        <h5 class="pl-20">商品订单分润比例</h5>
        <el-form-item label="分成模式：">
          <el-radio-group v-model="form[name + '_product_virtual_divide']" @change="virtualChange">
            <el-radio-button :label="0">分成一致</el-radio-button>
            <el-radio-button :label="1" v-if="form[name + 'old_virtual_divide'] == 1 || agentInfo.virtual_divide_status == 1">分成不一致</el-radio-button>
          </el-radio-group>
          <el-popover
            placement="right"
            title="分成注释"
            width="400"
            trigger="hover">
            <div>
              分成一致<br>
              真实分成：若真实分成设置为60%，则10元订单商户可分润10×60%=6元<br>
              相对分成：若相对分成设置为90%，自己本身的分成为50%，则10元订单商户可分润10×50%×90%=4.5元<br><br>
              <div v-if="form[name + 'old_virtual_divide'] == 1 || agentInfo.virtual_divide_status == 1">
                分成不一致<br>
                承诺分成：商户后台显示此分成比例。<span v-if="siteInfo.virtual_divide_order_num > 0">若自身的分成为50%，设置承诺分成为90%，则10元订单商户可分润10×50%×90%=4.5元。注：每天只有第{{ siteInfo.virtual_divide_order_num }}笔订单按照承诺分成比例分润。</span><br>
                实际分成：若自身的分成为50%，设置实际分成为20%，则10元订单商户可分润10×50%×20%=1元。注：每天从第{{ siteInfo.virtual_divide_order_num + 1 }}笔订单开始就按照实际分成比例分润。<br>
              </div>
            </div>
            <el-link type="danger" slot="reference" class="ml-10 el-icon-question"></el-link>
          </el-popover>
        </el-form-item>
        <template v-if="form[name + '_product_virtual_divide'] == 0">
          <el-form-item label="真实分成：">
            <el-input class="input-with" v-model="form[name + '_product_percent']" :placeholder="`最高不能超过${powerInfo[name + '_product_percent']}%`">
              <template slot="prepend"><el-radio class="pl-10" v-model="form[name + '_product_relative_divide']" :label="0">&nbsp;</el-radio></template>
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="相对分成：">
            <el-input class="input-with" v-model="form[name + '_product_relative_percent']" placeholder="最高不能超过100%" @blur="countPercent('_product')">
              <template slot="prepend"><el-radio class="pl-10" v-model="form[name + '_product_relative_divide']" :label="1">&nbsp;</el-radio></template>
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <!-- <el-form-item label="商户相对真实分成：">
            <el-input v-model="form[name + '_product_relative_zs']" disabled>
              <template slot="append">%</template>
            </el-input>
          </el-form-item> -->
        </template>
        <template v-if="form[name + '_product_virtual_divide'] == 1">
          <el-form-item label="承诺分成：">
            <el-input v-model="form[name + '_product_virtual_relative_percent']" placeholder="最高不能超过100%">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="实际分成：">
            <el-input v-model="form[name + '_product_relative_percent']" placeholder="最高不能超过100%" @blur="countPercent('_product')">
              <template slot="append">%</template>
            </el-input>
          </el-form-item>
          <!-- <el-form-item label="商户承诺相对真实分成：">
            <el-input v-model="form[name + '_product_relative_zs']" disabled>
              <template slot="append">%</template>
            </el-input>
          </el-form-item> -->
        </template>
      </div>
    </div>

    <el-form label-width="auto" v-show="(checkRoles(config.system_other.modify_fee_role) || siteInfo.modify_fee_right == 1) && agentInfo.business_type != 1">
    <template v-if="form.business_mode">
      <template v-for="(item, key) in config.fee_xcx[name] || config.fee_xcx.default">
        <template v-if="form[`${name}_fund_fee_plan${key}`] && form.business_mode[`std_${name}${key}`]">
          <el-form-item :label="`${item}付费模式：`">
            <el-radio-group v-model="form.business_mode[`std_${name}${key}`].business_mode_type">
            <template v-if="config.mode_way[name]">
              <el-radio-button :label="item" v-for="(item, key) in config.mode_way[name]">{{ key }}</el-radio-button>
            </template>
            <template v-else>
              <el-radio-button :label="item" v-for="(item, key) in config.mode_way.default">{{ key }}</el-radio-button>
            </template>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="付费方式：">
            <el-checkbox-group v-model="form.business_mode[`std_${name}${key}`].pay_type" :min="1">
              <el-checkbox :label="key" v-for="(item, key) in config.pay_way">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item class="mr-20" :label="form.business_mode[`std_${name}${key}`].business_mode_type >= 2 ? '押金：' : '预付款金额：'" v-if="form.business_mode[`std_${name}${key}`].business_mode_type > 0 || ['thread', 'humidifier'].indexOf(name) == -1">
            <el-input v-model="form.business_mode[`std_${name}${key}`].advance_price" :placeholder="`${ siteInfo['default_' + name +'_limit_setting'] ? '最低' + siteInfo['default_' + name +'_limit_setting'].limit_deposit_min + '元，最高' + siteInfo['default_' + name +'_limit_setting'].limit_deposit_max + '元' : ''}`">
            <template slot="append">元</template>
            </el-input>
          </el-form-item>

          <template v-if="form.business_mode[`std_${name}${key}`].business_mode_type >= 2 && name != 'zhuang'">
            <el-form-item label="前：">
            <div class="flex">
              <div>
              <el-input v-model="form[`${name}_fund_fee_plan${key}`].fund_once_minute" class="mr-10">
                <template slot="append">{{ SITE_INFO.time_unit }}</template>
              </el-input>
              </div>
              <div>
              <el-input v-model="form[`${name}_fund_fee_plan${key}`].fund_once_fee" class="ml-10">
                <template slot="append">元</template>
              </el-input>
              </div>
            </div>
            </el-form-item>
            <el-form-item label="超过后：">
            <div class="flex">
              <div>
              <el-input v-model="form[`${name}_fund_fee_plan${key}`].fund_rent_minute" class="mr-10">
                <template slot="append">{{ SITE_INFO.time_unit }}</template>
              </el-input>
              </div>
              <div>
              <el-input v-model="form[`${name}_fund_fee_plan${key}`].fund_rent_fee" class="ml-10">
                <template slot="append">元</template>
              </el-input>
              </div>
            </div>
            </el-form-item>
            <div class="flex">
              <el-form-item label="封顶：" v-if="['thread'].indexOf(name) > -1">
                <div class="flex">
                  <el-select v-model="form[`${name}_fund_fee_plan${key}`].fund_day_unit_hour">
                    <el-option :label="`${item}小时封顶`" :value="item" v-for="item in config.day_unit"></el-option>
                  </el-select>
                  <el-input class="ml-10" v-model="form[`${name}_fund_fee_plan${key}`].fund_day_most" :placeholder="`${ siteInfo['default_' + name +'_limit_setting'] ? '最低' + siteInfo['default_' + name +'_limit_setting'].limit_day_most_min + '元，最高' + siteInfo['default_' + name +'_limit_setting'].limit_day_most_max + '元' : ''}`">
                    <template slot="append">元</template>
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item label="每天封顶：" v-else>
                <el-input v-model="form[`${name}_fund_fee_plan${key}`].fund_day_most" :placeholder="`${ siteInfo['default_' + name +'_limit_setting'] ? '最低' + siteInfo['default_' + name +'_limit_setting'].limit_day_most_min + '元，最高' + siteInfo['default_' + name +'_limit_setting'].limit_day_most_max + '元' : ''}`">
                <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item label="总封顶：">
                <el-input v-model="form[`${name}_fund_fee_plan${key}`].fund_deposit_amount" :placeholder="`${ siteInfo['default_' + name +'_limit_setting'] ? '最低' + siteInfo['default_' + name +'_limit_setting'].limit_amount_min + '元，最高' + siteInfo['default_' + name +'_limit_setting'].limit_amount_max + '元' : ''}`">
                <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </div>

            <el-form-item class="mr-20" label="购买免费充电：" v-if="name == 'condom'">
            <el-switch :active-value="1" :inactive-value="0" v-model="form.business_mode[`std_${name}${key}`].order_type"/>
            </el-form-item>
          </template>
        </template>

        <template v-if="['thread', 'humidifier'].indexOf(name) > -1 && form.business_mode[`std_${name}${key}`] && form.business_mode[`std_${name}${key}`].business_mode_type < 2">
          <el-form-item :label="`套餐${item.value}:`" v-for="item in form[`${name}_fee_plan${key}`]">
            <div class="flex align-start">
              <el-select v-model="item.rent_unit_hour">
                <el-option :label="`${time}小时`" :value="time" v-for="time in config[`${name}_time`]"></el-option>
              </el-select>
              <el-input v-model="item.rent_unit_fee" class="mr-10">
                <template slot="append">元</template>
              </el-input>
              <el-button type="primary" plain @click="checkFeeShow(form[`${name}_fee_plan${key}`], item, 'rent_unit_show')">{{ item.rent_unit_show == 1 ? '隐藏' : '显示' }}</el-button>
            </div>
          </el-form-item>
        </template>
      </template>

    </template>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      default: {}
    },
    powerInfo: {
      type: Object,
      default: {}
    },
    name: {
      type: String,
      default: 'bao'
    }
  },
  data(){
    return {

    }
  },
  watch: {
    'form.store_id': {
      immediate: true,
      handler() {
        if(this.form[this.name + '_relative_percent'] > 0) this.countPercent()
        if(this.form[this.name + '_product_percent'] > 0) this.countPercent('_product')
        if(this.form[this.name + '_virtual_divide'] == undefined){
          let percent = {}
          percent[this.name + '_virtual_divide'] = 0
          percent[this.name + '_relative_percent'] = 0
          percent[this.name + '_relative_divide'] = 1
          if(this.name == 'condom'){
            percent[this.name + '_product_virtual_divide'] = 0
            percent[this.name + '_product_relative_percent'] = 0
            percent[this.name + '_product_relative_divide'] = 1
          }
          this.$emit('setDefaultPercent', percent)
        } else {
          this.form[this.name + 'old_virtual_divide'] = this.form[this.name + '_virtual_divide']
        }
      }
    }
  },
  computed: {
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    }
  },
  mounted(){

  },
  methods: {
    /**
     * 计算真实分成比例
     */
    countPercent(key = ''){
      let form = this.form
      let value = parseFloat(form[this.name + key +'_relative_percent'])
      if (!value || value > 100 || value < 0) {
        this.$message({
          message: '分成数值须在0-100之间',
          type: 'error'
        })
        return
      }
      let v = (value * this.powerInfo[`${this.name}${key}_percent`]) / 100
      this.$set(this.form, `${this.name}${key}_relative_zs`, v.toFixed(2))
    },

    virtualChange(v){
      if(v == 1) this.$set(this.form, `${this.name}_relative_divide`, 1)
    },

    /**
     * 检测套餐是否隐藏了几个，限制不能全部隐藏
     * @param {Object} arr
     * @param {Object} item
     */
    checkFeeShow(arr, item, key = 'rent_unit_show'){
      let feeShowNum = 0
      let v = item[key] == 0 ? 1 : 0
      arr.map( i => {
        if(i[key] == 1) feeShowNum++
      })
      if(feeShowNum < 2 && v == 0){
        this.$message({
          message: '最少显示一个套餐',
          type: 'error'
        })
      } else {
        return item[key] = v
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
