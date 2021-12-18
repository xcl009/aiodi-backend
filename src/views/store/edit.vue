<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>运营产品：</h4>
          <el-form-item label="产品类型：">
            <el-checkbox-group v-model="selType" :min="1">
              <el-checkbox v-for="item in myDevice" v-if="item.taked == 1" :label="item.depend_type">{{ item.depend_name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <h4>基础信息</h4>
          <el-form-item label="门头照：">
            <upload v-model="form.avatar"/>
          </el-form-item>
          <el-form-item ref="store_name" label="商户名称：" prop="store_name">
            <el-input v-model="form.store_name" placeholder="请填写商户名称" />
          </el-form-item>
          <el-form-item ref="mobile" label="商家电话：" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请填写商家电话" />
          </el-form-item>
          <el-form-item ref="cat_id" label="行业分类：" prop="cat_id">
            <el-cascader v-model="form.cat_id" :options="categoryList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="longitude" label="定位地址：" prop="longitude">
            <maps v-if="form.lng" :center="{ lng: form.lng, lat: form.lat }" @locationOk="locationOk" :zooms="18" />
            <maps v-else @locationOk="locationOk" :zooms="18"/>
          </el-form-item>
          <el-form-item ref="region_tag" label="所在地区：" prop="region_tag">
            <el-cascader v-model="form.region_tag" :options="areaList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="address" label="商户地址：" prop="address">
            <el-input v-model="form.address" placeholder="请填写商户地址" />
          </el-form-item>
          <el-form-item label="商户介绍：">
            <tinymce v-model="form.introduce" :height="300" />
          </el-form-item>

          <template v-if="(id && form.is_major == 1) || (!id && !fid)">
            <h4>分润信息</h4>
            <el-form-item label="分成方式：">
              <el-radio-group v-model="form.divide_type_1">
                <el-radio-button :label="0">比例分成</el-radio-button>
                <el-radio-button :label="1">不给分成</el-radio-button>
                <el-radio-button :label="2">入场费</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <div v-if="form.divide_type_1 != 1">
              <el-form-item ref="name" label="联系人：" prop="name">
                <el-input v-model="form.name" placeholder="请填写联系人姓名" />
              </el-form-item>
              <el-form-item ref="phone" label="手机号码：" prop="phone">
                <el-input v-model="form.phone" placeholder="请填写联系人手机号码" />
                <div class="fs-s2 text-gray">此手机号码会作为登录账户</div>
              </el-form-item>
              <el-form-item v-if="!id" label="登录密码：">
                <el-input v-model="form.password" placeholder="请填写登录密码" />
              </el-form-item>
            </div>
          </template>
          <div v-for="(item, key) in deviceNameObj" v-if="selType.indexOf(item) > -1" v-show="(agentInfo.business_type != 1) || (agentInfo.business_type == 1 && !checkRoles(['salesman']))">
            <h4>{{ key }}设置</h4>
            <percent :form="form" :power-info="powerInfo" :name="config.goods_key[item]" @setDefaultPercent="setDefaultPercent"/>

            <div v-show="(checkRoles(config.system_other.modify_fee_role) || siteInfo.modify_fee_right == 1) && agentInfo.business_type != 1">
            <template v-if="item == 0">
              <el-form-item label="租借金额：">
                <div class="flex">
                  <el-input v-model="form.bao_fee_plan.rent_fee_std" class="mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-input v-model="form.bao_fee_plan.rent_unit_minute_std" class="ml-10">
                    <template slot="append">分钟</template>
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item label="每天最高：">
                <el-input v-model="form.bao_fee_plan.day_most_std">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
              <el-form-item label="是否需要押金：">
                <el-switch v-model="form.bao_fee_plan.is_deposit_wx" class="mr-20" :active-value="1" :inactive-value="0" inactive-text="微信:" />
                <el-switch v-model="form.bao_fee_plan.is_deposit_zfb" :active-value="1" :inactive-value="0" inactive-text="支付宝:" />
              </el-form-item>
              <el-form-item label="押金：">
                <el-input v-model="form.bao_fee_plan.deposit_amount_std" :placeholder="`${siteInfo.limit_deposit_amount_min || 0}-${siteInfo.limit_deposit_amount_max || 99}元之间`">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </template>

            <template v-if="item == 4">
              <el-form-item v-for="item in form.wash_fee_plan" :label="item.name + '：'" v-if="">
                <div class="flex align-start">
                  <el-input v-model="item.money" class="mr-10">
                    <template slot="append">元（{{ item.unit_value }}分钟）</template>
                  </el-input>
                  <el-button type="primary" plain @click="checkFeeShow(form.wash_fee_plan, item, 'is_show')">{{ item.is_show == 1 ? '隐藏' : '显示' }}</el-button>
                </div>
              </el-form-item>
              <el-form-item label="洗衣液设置：" v-if="form.wash_laundry_fee_plan.length > 0">
                <div class="flex">
                  <template v-for="(item, index) in form.wash_laundry_fee_plan">
                    <el-input v-model="item.money" class="mr-5">
                      <template slot="append">元 {{ item.name }}</template>
                    </el-input>
                    <el-button :class="index + 1 == form.wash_laundry_fee_plan.length ? '' : 'mr-20'" type="primary" plain @click="item.is_show = item.is_show == 0 ? 1 : 0">{{ item.is_show == 1 ? '隐藏' : '显示' }}</el-button>
                  </template>
                </div>
              </el-form-item>
            </template>

            <template v-if="item == 7 && form.business_mode && form.business_mode.std_condom && form.business_mode.std_condom.business_mode_type < 2">
              <el-form-item :label="`套餐${item.value}:`" v-for="item in form.condom_fee_plan">
                <div class="flex align-start">
                  <el-select v-model="item.rent_unit_hour">
                    <el-option :label="`${time}小时`" :value="time" v-for="time in config.condom_time"></el-option>
                  </el-select>
                  <el-input v-model="item.rent_unit_fee" class="mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-button type="primary" plain @click="checkFeeShow(form.condom_fee_plan, item, 'rent_unit_show')">{{ item.rent_unit_show == 1 ? '隐藏' : '显示' }}</el-button>
                </div>
              </el-form-item>
            </template>

            <template v-if="item == 6">
              <el-form-item :label="`套餐${item.value}:`" v-for="item in form.blower_fee_plan">
                <div class="flex align-start">
                  <el-select v-model="item.rent_blower_unit_minute">
                    <el-option :label="`${time}分钟`" :value="time" v-for="time in config.blower_time"></el-option>
                  </el-select>
                  <el-input v-model="item.rent_blower_unit_fee" class="mr-10">
                    <template slot="append">元</template>
                  </el-input>
                  <el-button type="primary" plain @click="checkFeeShow(form.blower_fee_plan, item, 'rent_blower_unit_show')">{{ item.rent_blower_unit_show == 1 ? '隐藏' : '显示' }}</el-button>
                </div>
              </el-form-item>
            </template>

            <template v-if="item == 3">
              <div class="flex flex-wrap">
                <el-form-item class="mr-20" label="最高封顶：">
                  <el-input v-model="form.zhuang_fee_plan.rent_zhuang_daymost">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="充电电费：">
                  <el-input v-model="form.zhuang_fee_plan.rent_zhuang_electrcity_fee">
                    <template slot="append">元/度</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="服务费：">
                  <el-input v-model="form.zhuang_fee_plan.rent_zhuang_service_fee">
                    <template slot="append">元/{{form.zhuang_fee_plan.rent_zhuang_unit_hour}}小时</template>
                  </el-input>
                </el-form-item>
                <el-form-item class="mr-20" label="计费单位：">
                  <el-select v-model="form.zhuang_fee_plan.rent_zhuang_unit_hour" placeholder="请选择">
                    <el-option value="0.5" label="0.5小时"></el-option>
                    <el-option value="1" label="1小时"></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="flex" v-for="(item, index) in form.zhuang_fee_plan.plan">
                <el-form-item class="mr-20" :label="`功率：`">
                  <div class="flex align-center">
                    <el-input :value="item.rent_zhuang_unit_power_min" disabled>
                      <template slot="append">W</template>
                    </el-input>
                    <span class="pl-10 pr-10">—</span>
                    <el-input v-model="item.rent_zhuang_unit_power_max" :disabled="index == 4" @input="setPowerMax(item)">
                      <template slot="append">W</template>
                    </el-input>
                  </div>
                </el-form-item>
                <el-form-item class="mr-20" label="金额：">
                  <el-input v-model="item.rent_zhuang_unit_fee">
                    <template slot="append">元/{{form.zhuang_fee_plan.rent_zhuang_unit_hour}}小时</template>
                  </el-input>
                </el-form-item>
              </div>
            </template>

            <template v-if="item == 2">
              <el-form-item v-for="item in form.zhen_fee_plan" :label="item.rent_major_title + '：'">
                <div class="flex align-start flex-wrap">
                  <el-form-item class="mr-20" label="套餐价：">
                    <el-input v-model="item.rent_major_fee">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="按摩时长：">
                    <el-input v-model="item.rent_major_unit">
                      <template slot="append">分钟</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item class="mr-20" label="充电时长：">
                    <el-input v-model="item.rent_attach_unit">
                      <template slot="append">分钟</template>
                    </el-input>
                  </el-form-item>
                  <el-button type="primary" plain @click="checkFeeShow(form.zhen_fee_plan, item, 'rent_is_show')">{{ item.rent_is_show == 1 ? '隐藏' : '显示' }}</el-button>
                </div>
              </el-form-item>
            </template>
            </div>
          </div>

          <div v-show="agentInfo.business_type != 1">
            <h4>商户权限</h4>
            <el-form-item label="基本权限：">
              <el-checkbox :true-label="1" :false-label="0" v-model="form.check_order" v-show="powerInfo.check_order == 1">查看订单</el-checkbox>
              <el-checkbox :true-label="1" :false-label="0" v-model="form.withdraw_right" v-show="powerInfo.withdraw_right == 1 || checkRoles(['partner'])">提现</el-checkbox>
              <!-- <el-checkbox :true-label="1" :false-label="0" v-model="form.advance_buletooth">下单先匹配蓝牙</el-checkbox> -->
              <el-checkbox :true-label="1" :false-label="0" v-model="form.take_my_product" v-if="powerInfo.take_my_product == 1 && selType.indexOf(7) > -1">添加商品</el-checkbox>
              <el-checkbox :true-label="1" :false-label="0" v-model="form.replenish_my_product" v-if="selType.indexOf(7) > -1">设备补货</el-checkbox>
            </el-form-item>
          </div>

          <template v-if="(form.take_my_product) || (form.condom_manager_fee > 0)">
            <h4>售货机</h4>
            <el-form-item label="商品管理费：">
              <el-input v-model="form.condom_manager_fee" placeholder="商品管理费">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template>

          <div v-show="false">
            <h4>提现手续费</h4>
            <el-form-item label="模式：">
              <el-radio v-model="form.agent_withdraw_fee_type" :label="0" :disabled="siteInfo.merchant_withdraw_fee_type != 2">税点</el-radio>
              <el-radio v-model="form.agent_withdraw_fee_type" :label="1" :disabled="siteInfo.merchant_withdraw_fee_type != 2">手续费</el-radio>
              <el-radio v-model="form.agent_withdraw_fee_type" :label="2" :disabled="siteInfo.merchant_withdraw_fee_type != 2">税点+手续费</el-radio>
            </el-form-item>
            <div class="flex">
              <el-form-item class="mr-20" label="税点：">
                <el-input v-model="form.withdraw_percent" oninput="value=value.replace(/[^\d.]/g,'')">
                  <template slot="append">%</template>
                </el-input>
              </el-form-item>
              <el-form-item class="mr-20" label="手续费：">
                <el-input v-model="form.withdraw_fee" oninput="value=value.replace(/[^\d.]/g,'')">
                  <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </div>
          </div>

          <el-form-item>
            <el-button class="mt-10 mb-10" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { bMapTransQQMap, qqMapTransBMap } from '@/utils/index'
import upload from '@/components/upload'
import Tinymce from '@/components/Tinymce'
import maps from '@/components/map'
import area from '@/components/area.json'
import percent from './_percent'
export default {
  name: 'ShopCreate',
  components: {
    upload,
    maps,
    Tinymce,
    percent
  },
  data() {
    return {
      clickSubmit: false,
      categoryList: [],
      areaList: [],
      wash_type: 0,
      form: {
        agent_withdraw_fee_type: 0,
        cat_id: [],
        region_tag: [],
        avatar: '',
        password: '123456',
        withdraw_percent: 0,
        withdraw_fee: 0,
        longitude: '',
        check_order: 0,
        withdraw_right: 0,
        divide_type_1: 0,
        address: '',
        // advance_buletooth: 1,

        // 充电宝
        bao_fee_plan: {
          rent_fee_std: 2,
          rent_unit_minute_std: 60,
          day_most_std: 15,
          deposit_amount_std: 99
        },

        zhuang_fee_plan: {},
        wash_laundry_fee_plan: []
      },

      rules: {
        store_name: [{
          required: true,
          message: '请填写商户名称',
          trigger: 'blur'
        }],
        mobile: [{
          required: true,
          message: '请填写商家电话',
          trigger: 'blur'
        }],
        address: [{
          required: true,
          message: '请填写商家地址',
          trigger: 'blur'
        }],
        name: [{
          required: true,
          message: '请填写联系人姓名',
          trigger: 'blur'
        }],
        phone: [{
          required: true,
          message: '请填写手机号码作为登录账户',
          trigger: 'blur'
        }],
        cat_id: [{
          required: true,
          message: '请选择行业分类',
          trigger: 'blur'
        }],
        region_tag: [{
          required: true,
          message: '请选择城市区域',
          trigger: 'blur'
        }],
        longitude: [{
          required: true,
          message: '请选择地图定位'
        }]
      },
      powerInfo: {},
      fileList: [],
      id: this.$route.params.id || '',
      fid: this.$route.query.fid || '',
      divide_type_1: this.$route.query.divide_type || 0,
      user_type: this.$route.query.user_type || 0,

      myDevice: [],
      selType: []
    }
  },
  computed: {
    agentInfo() {
      let agentInfo = this.$store.getters.agentInfo
      if(agentInfo.business_type == 1){
        this.form.check_order = 1
        this.form.withdraw_right = 1
      }
      return agentInfo
    },
    deviceNameObj() {
      return this.$store.getters.deviceNameObj
    },
    siteInfo() {
      const siteInfo = this.$store.getters.siteInfo
      this.form.agent_withdraw_fee_type = siteInfo.merchant_withdraw_fee_type
      return this.$store.getters.siteInfo
    }
  },
  mounted() {
    this.getDefaultConfig()
    if (this.id > 0) {

    } else {
      this.getPower()
      this.getDeviceType()
      this.getOldCat()
      this.getArea()
      this.form.divide_type_1 = this.divide_type_1
      this.form.bao_fee_plan.deposit_amount_std = this.siteInfo.limit_deposit_amount_max
    }
  },
  methods: {
    /**
     * 获取上一个商户的分类类型
     */
    getOldCat(){
      this.$get('agentapi/store/get_my_new_params', {
        get_key: 'cat_id'
      }).then(res => {
        this.cat_id = res.cat_id
        this.getCategory()
      })
    },

    /**
     * 获取信息
     */
    getDefaultConfig() {
      this.$get('agentapi/get_partner_config', {}).then(res => {
        let fee_plan = {}, goods_key = this.config.goods_key, fee_xcx = this.config.fee_xcx
        for(var i in goods_key){
          let goods_key_fee = fee_xcx[goods_key[i]] || fee_xcx.default
          for(var key in goods_key_fee){
            if(res[`${goods_key[i]}_fund_fee_plan${key}`]){
              fee_plan[ `${goods_key[i]}_fund_fee_plan${key}`] = res[`${goods_key[i]}_fund_fee_plan${key}`]
            }
            if(res[`${goods_key[i]}_fee_plan${key}`]){
              fee_plan[`${goods_key[i]}_fee_plan${key}`] = res[`${goods_key[i]}_fee_plan${key}`]
            }
            if(this.SITE_INFO.fund_fee_time_unit == 1 && ['thread', 'condom', 'humidifier'].indexOf(goods_key[i]) > -1 && fee_plan[`${goods_key[i]}_fund_fee_plan${key}`]){
              fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute = this.division(fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute, 60)
              fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute = this.division(fee_plan[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute, 60)
            }
          }
        }
        if(this.id > 0){
          this.getInfo(fee_plan)
        } else {
          fee_plan.business_mode = res.business_mode
          if(res.wash_laundry_fee_plan) fee_plan.wash_laundry_fee_plan = res.wash_laundry_fee_plan
          this.form = Object.assign({}, this.form, fee_plan)
        }
      })
    },

    /**
     * 获取权限
     */
    getPower(son_id = '') {
      return new Promise((resolve, reject) => {
        let params = {}
        if(son_id) {
          params.son_id = son_id
        }
        this.$get('agentapi/add_merchant', params).then(res => {
          res.bao_percent = res.percent
          this.powerInfo = res
          resolve()
        }).catch(err=>{
          resolve()
        })
      })
    },

    /**
     * 获取设备
     */
    getDeviceType(id = '') {
      this.$get('agentapi/sttuf/son_device_type', {
        son_id: id
      }).then(res => {
        let selType = []
        for (var i in res) {
          if (this.id) {
            if (res[i].son_taked > 0) {
              selType.push(res[i].depend_type)
            }
          } else if (res[i].taked > 0) {
            selType.push(res[i].depend_type)
            break
          }
        }
        this.selType = JSON.parse(JSON.stringify(selType))
        this.myDevice = res
      })
    },

    /**
     * 获取商户类别
     */
    getCategory() {
      this.$get('agentapi/store/store_cat_list').then(res => {
        for (var i in res) {
          const obj = {
            value: res[i].cat_id,
            label: res[i].cat_name,
            children: []
          }
          if (this.cat_id == obj.value) {
            if (res[i].son_cat_list.length > 0) {
              this.form.cat_id = [obj.value, res[i].son_cat_list[0].cat_id]
            } else {
              this.form.cat_id = [obj.value]
            }
          }
          if (res[i].son_cat_list.length > 0) {
            for (var s in res[i].son_cat_list) {
              const child = res[i].son_cat_list[s]
              if (this.cat_id == child.cat_id) this.form.cat_id = [obj.value, child.cat_id]
              obj.children.push({
                value: child.cat_id,
                label: child.cat_name
              })
            }
          } else {
            obj.children = undefined
          }
          this.categoryList.push(obj)
        }
        if (!this.id && !this.cat_id) {
          const first = this.categoryList[0]
          this.form.cat_id = [first.value, first.children.length > 0 ? first.children[0].value : '']
        }
      })
    },

    /**
     * 获取区域
     */
    getArea() {
      this.getCity()
    },

    /**
     * 获取城市
     */
    getCity(){
      this.$get('commonapi/tool/get_address_list').then(res => {
        for (var i in res) {
          const firstLevel = res[i]
          const obj = {
            value: firstLevel.tag,
            label: firstLevel.title,
            children: []
          }
          if (firstLevel.son_list.length > 0) {
            const secondLevel = firstLevel.son_list
            for (var s in secondLevel) {
              const secondItem = secondLevel[s]
              if (this.region_tag == secondItem.tag) this.form.region_tag = [obj.value, secondItem.tag]
              obj.children.push({
                value: secondItem.tag,
                label: secondItem.title,
                children: []
              })
              if (secondItem.son_list.length > 0) {
                const thirdLevel = secondItem.son_list
                for (var t in thirdLevel) {
                  const thirdItem = thirdLevel[t]
                  if (this.region_tag == thirdItem.tag) this.form.region_tag = [obj.value, secondItem.tag, thirdItem.tag]
                  obj.children[s].children.push({
                    value: thirdItem.tag,
                    label: thirdItem.title
                  })
                }
              } else {
                obj.children = undefined
              }
            }
          } else {
            obj.children = undefined
          }
          this.areaList.push(obj)
        }
        if (!this.id) {
          const first = this.areaList[0]
          this.form.region_tag = [first.value, first.children[0].value, first.children[0].children[0].value]
        }
      })
    },

    /**
     * 获取商户信息
     */
    getInfo(fee_plan) {
      this.$get('agentapi/my_merchant_detail', {
        store_id: this.id
      }).then(res => {
          this.getPower(res.son_id).then(()=>{
          let info = {
            son_id: res.son_id,
            store_id: res.store_id,
            is_major: res.is_major,
            avatar: res.store_info.avatar,
            store_name: res.store_info.name,
            mobile: res.store_info.mobile,
            address: res.store_info.address,
            lat: res.store_info.lat,
            lng: res.store_info.lng,
            longitude: res.store_info.lng,
            introduce: res.store_info.introduce,
            divide_type_1: res.store_info.divide_type_1,
            //advance_buletooth: res.store_info.advance_buletooth,
            take_my_product: res.store_info.take_my_product,
            name: res.profit_info.contact,
            user_name: res.user_name,
            business_mode: res.business_mode,
            wash_laundry_fee_plan: res.wash_laundry_fee_plan || []
          }
          if(info.lng > 0 && info.lat > 0){
            let lng_lat = qqMapTransBMap(info.lng, info.lat)
            info.lng = lng_lat.lng
            info.lat = lng_lat.lat
          }
          let goods_key = this.config.goods_key, fee_xcx = this.config.fee_xcx
          for(var i in goods_key){
            let goods_key_fee = fee_xcx[goods_key[i]] || fee_xcx.default
            for(var key in goods_key_fee){
              if(res[`${goods_key[i]}_fund_fee_plan${key}`]){
                info[ `${goods_key[i]}_fund_fee_plan${key}`] = res[`${goods_key[i]}_fund_fee_plan${key}`]
              }
              if(res[`${goods_key[i]}_fee_plan${key}`]){
                info[`${goods_key[i]}_fee_plan${key}`] = res[`${goods_key[i]}_fee_plan${key}`]
              }
              if(this.SITE_INFO.fund_fee_time_unit == 1 && ['thread', 'condom', 'humidifier'].indexOf(goods_key[i]) > -1 && info[`${goods_key[i]}_fund_fee_plan${key}`]){
                info[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute = this.division(info[`${goods_key[i]}_fund_fee_plan${key}`].fund_once_minute, 60)
                info[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute = this.division(info[`${goods_key[i]}_fund_fee_plan${key}`].fund_rent_minute, 60)
              }
            }
          }
          if(info.zhuang_fee_plan){
            Object.values(info.zhuang_fee_plan.plan).map(item => {
              let n = parseInt(item.value) + 1
              return item.rent_zhuang_unit_power_max = info.zhuang_fee_plan.plan[n] ? parseInt(info.zhuang_fee_plan.plan[n].rent_zhuang_unit_power_min) - 1 : this.config.zhuang_power_max
            })
          }
          this.fileList = [{
            url: res.store_info.avatar
          }]
          info = Object.assign(fee_plan, info, res.profit_info)
          if(this.siteInfo.merchant_withdraw_fee_type != 2) info.agent_withdraw_fee_type = this.siteInfo.agent_withdraw_fee_type
          this.form = info
          this.oldPhone = info.phone
          this.cat_id = res.store_info.cat_id
          this.region_tag = res.store_info.region_tag
          this.getDeviceType(res.son_id)
          this.getCategory()
          this.getArea()
        })
      })
    },

    onSubmit(formName) {
      let url = 'agentapi/add_store'
      this.clickSubmit = true
      this.$refs[formName].validate((valid, object) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          if(this.form.cat_id) params.cat_id = this.form.cat_id[1] ? this.form.cat_id[1] : this.form.cat_id[0]
          params.region_tag = this.form.region_tag[2]
          if(params.latitude > 0 && params.longitude > 0){
            let lng_lat = bMapTransQQMap(params.longitude, params.latitude)
            params.longitude = lng_lat.lng
            params.latitude = lng_lat.lat
          }
          if (this.fid) {
            url = 'agentapi/store/fen_dian_add'
            params.son_id = this.fid
          } else if (params.is_major == 0) {
            url = 'agentapi/store/fen_dian_edit'
          } else if (this.id > 0) {
            url = 'agentapi/edit_store'
          }
          params.user_name = params.phone
          if(params.divide_type_1 == 1 && this.oldPhone){
            params.phone = this.oldPhone
            params.user_name = this.oldPhone
          }
          for (var i in this.selType) {
            params['depend_type_' + this.selType[i]] = 1
            if(params.divide_type_1 == 1){
              delete params[this.config.goods_key[this.selType[i]] + '_percent']
            }
          }
          if(this.update_fee_error && this.add_store_id){
            this.update_fee_plane(this.add_store_id)
            return
          }
          this.$post(url, params).then(res => {
            this.add_store_id = res.store_id
            this.update_fee_plane(res.store_id)
          }).catch( err => {
            setTimeout(() => {
              this.clickSubmit = false
            }, 1000)
          })
        } else {
          this.formErrow(object)
          this.clickSubmit = false
        }
      })
    },

    update_fee_plane(id) {
      let params = {}, form = JSON.parse(JSON.stringify(this.form)), goods_key = this.config.goods_key, fee_xcx = this.config.fee_xcx, url = 'agentapi/store/update_fee_plane'
      for (var s in this.selType) {
        const si = this.selType[s]
        if (si == 0) {
          params = Object.assign({}, params, form.bao_fee_plan)
        } else if (si == 2) {
          const list = form.zhen_fee_plan
          for (var i in list) {
            const plan = list[i]
            params[`rent_major_title_${plan.value}`] = plan.rent_major_title
            params[`rent_is_show_${plan.value}`] = plan.rent_is_show
            params[`rent_major_fee_${plan.value}`] = plan.rent_major_fee
            params[`rent_major_unit_${plan.value}`] = plan.rent_major_unit
            params[`rent_attach_unit_${plan.value}`] = plan.rent_attach_unit
          }
        } else if (si == 1) {
          //const list = form.thread_fee_plan
          // for (var i in list) {
          //   const plan = list[i]
          //   params[`rent_unit_hour_${plan.value}`] = plan.rent_unit_hour
          //   params[`rent_unit_fee_${plan.value}`] = plan.rent_unit_fee
          //   params[`rent_unit_show_${plan.value}`] = plan.rent_unit_show
          // }
        } else if (si == 3){
          params = Object.assign({}, params, form.zhuang_fee_plan)
          for(var i in params.plan){
            let plan = params.plan[i]
            params[`rent_zhuang_unit_fee_${plan.value}`] = plan.rent_zhuang_unit_fee
            params[`rent_zhuang_unit_power_min_${plan.value}`] = plan.rent_zhuang_unit_power_min
          }
          delete params.plan
        } else if (si == 4) {
          const list = form.wash_fee_plan, wash_laundy = form.wash_laundry_fee_plan
          for (var i in list) {
            const plan = list[i]
            params[`rent_wash_unit_show_${plan.value}`] = plan.is_show
            params[`rent_wash_unit_fee_${plan.value}`] = plan.money
          }
          for (var i in wash_laundy) {
            const laundy = wash_laundy[i]
            params[`rent_laundry_unit_show_${laundy.value}`] = laundy.is_show
            params[`rent_laundry_unit_fee_${laundy.value}`] = laundy.money
          }
        } else if (si == 6) {
          const list = form.blower_fee_plan
          for (var i in list) {
            const plan = list[i]
            params[`rent_blower_unit_minute_${plan.value}`] = plan.rent_blower_unit_minute
            params[`rent_blower_unit_fee_${plan.value}`] = plan.rent_blower_unit_fee
            params[`rent_blower_unit_show_${plan.value}`] = plan.rent_blower_unit_show
          }
        } else if (si == 7) {
          const list = form.condom_fee_plan
          for (var i in list) {
            const plan = list[i]
            params[`condom_rent_unit_hour_${plan.value}`] = plan.rent_unit_hour
            params[`condom_rent_unit_fee_${plan.value}`] = plan.rent_unit_fee
            params[`condom_rent_unit_show_${plan.value}`] = plan.rent_unit_show
          }
        }
        let goods_key_fee = fee_xcx[goods_key[si]] || fee_xcx.default
        for(var key in goods_key_fee){
          if(form[`${goods_key[si]}_fund_fee_plan${key}`]){
            params[ `${goods_key[si]}_fund_fee_plan${key}`] = form[`${goods_key[si]}_fund_fee_plan${key}`]
          }
          if(form[`${goods_key[si]}_fee_plan${key}`]){
            params[`${goods_key[si]}_fee_plan${key}`] = form[`${goods_key[si]}_fee_plan${key}`]
          }
          if(key && form.business_mode[`std_${goods_key[si]}${key}`]){
            params[`${goods_key[si]}_business_mode${key}`] = form.business_mode[`std_${goods_key[si]}${key}`]
          }
          if(this.SITE_INFO.fund_fee_time_unit == 1 && ['thread', 'condom', 'humidifier'].indexOf(goods_key[si]) > -1 && params[`${goods_key[si]}_fund_fee_plan${key}`]){
            params[`${goods_key[si]}_fund_fee_plan${key}`].fund_once_minute = this.mul(params[`${goods_key[si]}_fund_fee_plan${key}`].fund_once_minute, 60)
            params[`${goods_key[si]}_fund_fee_plan${key}`].fund_rent_minute = this.mul(params[`${goods_key[si]}_fund_fee_plan${key}`].fund_rent_minute, 60)
          }
        }
        if(form.business_mode[`std_${goods_key[si]}`] && !fee_xcx[goods_key[si]]){
          params[`${goods_key[si]}_business_mode_type`] = form.business_mode[`std_${goods_key[si]}`].business_mode_type
          params[`${goods_key[si]}_pay_type`] = form.business_mode[`std_${goods_key[si]}`].pay_type
          params[`${goods_key[si]}_advance_price`] = form.business_mode[`std_${goods_key[si]}`].advance_price
          params[`${goods_key[si]}_order_type`] = form.business_mode[`std_${goods_key[si]}`].order_type
        }
      }
      params.type = this.selType
      params.store_id = id || this.id
      this.$post(url, params).then(res => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        if(this.user_type == 1){
          this.$router.push({
            path: '/shop/subShop'
          })
        }else{
          this.$router.push({
            path: '/shop/index'
          })
        }
      }).catch( err => {
        this.update_fee_error = true
        setTimeout(() => {
          this.clickSubmit = false
        }, 1000)
      })
    },

    /**
     * 设置设备计费默认值
     */
    setDefaultPercent(percent){
      this.form = Object.assign({}, this.form, percent)
    },

    /**
     * 商户经纬度
     */
    locationOk(center) {
      this.form.latitude = center.lat
      this.form.longitude = center.lng
      if(!this.id || this.onLoad){
        this.form.address = center.address
        this.getLatCity(center.lng, center.lat)
      }else if(this.id){
        setTimeout(() => {
          this.onLoad = true
        }, 3000)
      }
    },

    /**
     * 经纬度获取省市区标识
     */
    getLatCity(lng, lat){
      this.$get('Place/getLatLookup', {
        lng: lng,
        lat: lat
      }).then(res => {
        let region_tag = []
        res.tag.map(tag => {
          region_tag.push(tag)
        })
        if(region_tag.length > 0) this.form.region_tag = region_tag
      })
    },

    /**
     * 计算真实分成比例
     */
    countPercent(value, k) {
      const form = this.form
      value = parseFloat(value)
      if (!value || value > 100 || value < 0) {
        this.$message({
          message: '分成数值须在0-100之间',
          type: 'error'
        })
        return
      }
      let v = (value * this.powerInfo[`${k}_percent`]) / 100
      if (k == 'bao') v = (value * parseFloat(this.powerInfo.percent)) / 100
      this.$set(this.form, `${k}_percent`, v.toFixed(2))
    },

    /**
     * 输入最大功率
     */
    setPowerMax(item){
      let n = parseInt(item.value) + 1
      this.form.zhuang_fee_plan.plan[n].rent_zhuang_unit_power_min = parseInt(item.rent_zhuang_unit_power_max) + 1
    },

    /**
     * 检测套餐是否隐藏了几个，限制不能全部隐藏
     * @param {Object} arr
     * @param {Object} item
     */
    checkFeeShow(arr, item, key = 'is_show'){
      let feeShowNum = 0, v = item[key] == 0 ? 1 : 0
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

<style scoped>
  .line {
    text-align: center;
  }
  /deep/ .el-cascader{
    width: 100%;
  }
  /deep/ .input-with .el-input-group__prepend {
    padding: 0 0 0 5px;
  }

  /* /deep/ .el-form-item{
    margin-bottom: 10px;
  } */
</style>
