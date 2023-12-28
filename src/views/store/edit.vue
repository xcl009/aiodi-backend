<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :sm="24" :xl="16">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="130px">
          <h3>基础信息</h3>
          <el-form-item label="门头照" class="up-img">
            <upload v-model="form.avatar" :upObj="{fileType: 'storePhoto'}" />
          </el-form-item>
          <el-form-item ref="name" label="商户名称" prop="name">
            <el-input v-model="form.name" placeholder="请填写商户名称" />
          </el-form-item>
          <el-form-item ref="mobile" label="商家电话" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请填写商家电话" />
          </el-form-item>
          <el-form-item ref="catId" label="行业分类" prop="catId">
            <el-cascader v-model="form.catId" :options="catList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="lng" label="定位地址" prop="lng" v-if="mapTrue">
            <maps v-if="form.lng" :center="{ lng: form.lng, lat: form.lat }" @locationOk="locationOk" :zooms="18" />
            <maps v-else @locationOk="locationOk" :zooms="18" />
          </el-form-item>
          <el-form-item ref="province" label="所在地区" prop="province">
            <el-cascader v-model="form.province" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="address" label="商户地址" prop="address">
            <el-input v-model="form.address" placeholder="请填写商户地址" />
          </el-form-item>
          <el-form-item label="营业时间">
            <el-input v-model="form.businessTimeDes" placeholder="如:09:00-21:00" />
          </el-form-item>
          <el-form-item label="商户介绍">
            <el-input v-model="form.introduce" placeholder="商户介绍" type="textarea" :rows="3" />
          </el-form-item>

          <template>
            <h3>分润信息</h3>
            <el-form-item label="分成方式">
              <el-radio-group v-model="form.divisionMode">
                <el-radio-button :label="1">比例分成</el-radio-button>
                <el-radio-button :label="2">不给分成</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <div v-if="form.divisionMode != 2 && !parentId && (!form.parentId || form.parentId == '0')">
              <el-form-item ref="userNickName" label="联系人" prop="userNickName">
                <el-input v-model="form.userNickName" placeholder="请填写联系人姓名" />
              </el-form-item>
              <el-form-item ref="userMobile" label="手机号码" prop="userMobile">
                <el-input type="number" v-model="form.userMobile" placeholder="此手机号码会作为登录账户" />
              </el-form-item>
              <el-form-item v-if="!storeId" label="登录密码">
                <el-input v-model="form.loginPassword" placeholder="请填写登录密码" />
              </el-form-item>
            </div>
          </template>

          <h3 class="pt-20">运营产品</h3>
          <el-checkbox-group v-model="selDevice" @change="changeDevice" class="pl-10">
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <div>
            <div class="mt-15 p-10 radius-10 shadow-light" v-for="(item, index) in deviceDataArr"
              v-if="item.status == 1">
              <h3 class="mt-0">{{ myDeviceId[item.deviceTypeCode] }}设置</h3>

              <template v-if="form.divisionMode != 2">
                <el-form-item label="分成模式">
                  <el-radio-group v-model="item.closeType" @change="setCloseType">
                    <el-radio-button :label="cti" v-for="(ct, cti) in config.closeType"
                      :disabled="!Ability[`${item.deviceTypeCode}_CLOSETYPE_${cti}`] && cti != 1">{{ ct }}{{ cti == 3 ? '(分成不一致)' : ''}}</el-radio-button>
                  </el-radio-group>
                  <el-popover placement="right" title="" width="400" trigger="hover">
                    <div>
                      <div class="mb-15 text-bold text-black">分成注释</div>
                      <div class="mb-5 text-black">真实分成</div>
                      真实分成：若真实分成设置为50%，则10元订单商户可分润10×50%=5元<br><br>
                      <div class="mb-5 text-black">相对分成</div>
                       摊销分成：若真实分成设置为80%，摊销分成30%，则10元订单商户可分润10×50%=5元。摊销金额：10×30%=3元，归商户上级所有<br><br>
                      <div>
                        <div class="mb-5 text-black">分摊(分成不一致)</div>
                        承诺分成：商户后台显示此分成比例。<span>若您的分成为50%，设置承诺分成为90%，则10元订单商户可分润10×50%×90%=4.5元。</span><br>
                        相对分成：若自身的分成为50%，设置相对分成为50%，则10元订单商户可分润10×50%×50%=2.5元。注：每天从第{{ item.promisedDeal ? parseInt(item.promisedDeal) + 1 : 1 }}笔完结的订单开始就按照相对分成比例分润。<br>
                        温馨提示：分成模式设置为分摊(分成不一致)时，记得关闭商户查看订单权限噢！
                      </div>
                      <div class="mt-20">需了解或设置其他分成模式？<el-link type="primary" :underline="false"
                          @click="$router.push({path: `/market/appList?deviceTypeCode=${item.deviceTypeCode}&serviceName=分成方式`})">点此去了解</el-link>
                      </div>
                    </div>
                    <el-link type="danger" slot="reference" :underline="false"
                      class="ml-10 el-icon-question fs-c1"></el-link>
                  </el-popover>
                </el-form-item>
                <template v-if="item.closeType == 3">
                  <el-form-item label="承诺分成" :error="ferror.promised">
                    <el-input type="number" v-model="item.promised" placeholder="最高不能超过100%" @input="(v) => (ferror.promised = checkDigit(v))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="相对分成" :error="ferror.relative">
                    <el-input type="number" v-model="item.relative" placeholder="最高不能超过100%" @input="(v) => (ferror.relative = checkDigit(v))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="每天前" :error="ferror.promisedDeal">
                    <el-input type="number" v-model="item.promisedDeal" placeholder="0" @input="(v) => (ferror.promisedDeal = checkDigit(v))">
                      <template slot="append">笔完结的订单按承诺分成比例分润</template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-else-if="item.closeType == 2">
                  <el-form-item label="真实分成" :error="ferror.live">
                    <el-input type="number" v-model="item.live" :placeholder="`最高不能超过${myProfitRatio[item.deviceTypeCode]}%`"
                      @input="(v) => (ferror.live = checkDigit(v))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="摊销分成" :error="ferror.relative">
                    <el-input type="number" v-model="item.relative" :placeholder="`最高不能超过${item.live || 100}%`"
                      @input="(v) => (ferror.relative = checkDigit(v, 0, item.live))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-else>
                  <el-form-item label="分成比例" :error="ferror.live">
                    <el-input class="input-with" type="number" v-model="item.live" :placeholder="`最高不能超过${myProfitRatio[item.deviceTypeCode]}%`"
                    @input="(v) => (ferror.live = checkDigit(v, 0, myProfitRatio[item.deviceTypeCode]))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                </template>
              </template>

              <el-form-item label="支付方式">
                <el-checkbox-group v-model="item.storePayConfig">
                  <el-checkbox :label="key" v-for="(item, key) in config.pay_way">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-row class="radius-10" :gutter="20">
                <el-col :sm="24" :lg="12" v-for="(name, xcx) in config.xcx_pay.default">
                  <div>
                    <div class="mb-10 text-dfs text-bold text-black">
                      {{ name }}计费设置
                      <span class="ml-10 text-primary cursor" v-if="xcx == 'alipay'" @click="setAlipayMode(item)">一键同步微信的计费设置</span>
                    </div>

                    <el-form-item :label="`付费模式`">
                      <el-radio-group v-model="item[`${xcx}PayMode`].modeType" size="medium">
                        <el-radio-button :label="key" v-for="(key, name) in getModeType(item.deviceTypeCode)"
                          :disabled="!Ability[`${item.deviceTypeCode}_${key}`] && key != Object.values(getModeType(item.deviceTypeCode))[0]">{{ name }}</el-radio-button>
                      </el-radio-group>
                      <el-popover placement="right" title="" trigger="hover"
                        v-if="getModeType(item.deviceTypeCode)['DEPOSIT_FREE'] || getModeType(item.deviceTypeCode)['DEPOSIT']">
                        <div>
                          需了解和设置免押或余额？<el-link type="primary" :underline="false"
                            @click="$router.push({path: `/market/appList?deviceTypeCode=${item.deviceTypeCode}&serviceName=计费模式`})">点此去了解</el-link>
                        </div>
                        <el-link type="danger" :underline="false" slot="reference"
                          class="ml-10 el-icon-question fs-c1"></el-link>
                      </el-popover>
                    </el-form-item>

                    <template v-if="item[`${xcx}PayMode`].modeType == 'PACKAGE'">
                      <el-form-item :label="`套餐设置`">
                        <div class="mb-5 flex align-center flex-wrap"
                          v-for="(plan, index) in item[`${xcx}PayMode`].payModeDetail">
                          <el-select v-model="plan.time" v-if="item.deviceTypeCode == 'WM'">
                            <el-option :label="`${wp.title}`" :value="wp.value"
                              v-for="wp in config[`washing_package`]"></el-option>
                          </el-select>
                          <el-select v-model="plan.time" v-else>
                            <el-option :label="`${time / 60}小时`" :value="time"
                              v-for="time in config[`plan_time`]"></el-option>
                          </el-select>
                          <el-input type="number" v-model="plan.money" class="flex1 ml-10 mr-10">
                            <template slot="append">元</template>
                          </el-input>
                          <el-button type="text" size="small"
                            :disabled="item[`${xcx}PayMode`].payModeDetail.length == 4" v-if="index == 0"
                            @click="item[`${xcx}PayMode`].payModeDetail.push({time: (item.deviceTypeCode == 'WM' ? '46' : 60), money: 2, tag: index + 1})">添加</el-button>
                          <el-button type="text" size="small" v-else
                            @click="item[`${xcx}PayMode`].payModeDetail.splice(index, 1)"
                            class="text-danger">删除</el-button>
                        </div>
                      </el-form-item>
                      <el-form-item :label="`洗衣液设置`" v-if="item.deviceTypeCode == 'WM'">
                        <template v-for="(laundry, lidx) in item[`${xcx}PayMode`].laundryMode">
                          <!-- <el-input v-model="laundry.title" class="flex1 mr-10" disabled></el-input> -->
                          <div class="text-black">{{ laundry.title }}</div>
                          <div class="mb-5 flex align-center flex-wrap" v-for="(lpi, lpidx) in laundry.package">
                            <el-input type="number" v-model="lpi.value" class="flex1 mr-10" disabled>
                              <template slot="append">ml</template>
                            </el-input>
                            <el-input type="number" v-model="lpi.money" class="flex1 mr-10">
                              <template slot="append">元</template>
                            </el-input>
                            <!-- <el-button type="text" size="small" :disabled="item[`${xcx}PayMode`].laundryMode[lidx].package.length == 3" v-if="lpidx == 0"
                              @click="item[`${xcx}PayMode`].laundryMode[lidx].package.push({tag: lpidx + 1})">添加</el-button>
                            <el-button type="text" size="small" v-else
                              @click="item[`${xcx}PayMode`].laundryMode[lidx].package.splice(lpidx, 1)" class="text-danger">删除</el-button> -->
                          </div>
                        </template>

                      </el-form-item>
                    </template>

                    <template v-else>
                      <el-form-item label="免费时长" :error="ferror[`${item.deviceTypeCode}_${xcx}_freeTime`]" v-if="item.deviceTypeCode == 'PA'">
                        <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.freeTime" placeholder="不填默认5分钟"
                          @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_freeTime`] = checkDigit(v, 1, 1440, 0, true))">
                          <template slot="append">分钟</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="前" :error="ferror[`${item.deviceTypeCode}_${xcx}_startingTime`]">
                        <div class="flex">
                          <div class="flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.startingTime" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 1440, 0))">
                              <template slot="append">分钟</template>
                            </el-input>
                          </div>
                          <div class="pl-10 flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.startingAmount" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 1000000))">
                              <template slot="append">元</template>
                            </el-input>
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item label="超过后" :error="ferror[`${item.deviceTypeCode}_${xcx}_overBillingUnit`]">
                        <div class="flex">
                          <div class="flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.overBillingUnit" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_overBillingUnit`] = checkDigit(v, 0, 1440, 0))">
                              <template slot="append">分钟</template>
                            </el-input>
                          </div>
                          <div class="pl-10 flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.unitPrice" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_overBillingUnit`] = checkDigit(v, 0, 1000000))">
                              <template slot="append">元</template>
                            </el-input>
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item label="封顶" :error="ferror[`${item.deviceTypeCode}_${xcx}_maxBillingTimePrice`]">
                        <div class="flex">
                          <div>
                            <el-select v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimeUnit">
                              <el-option :label="`${item / 60}小时封顶`" :value="item"
                                v-for="item in config.day_unit"></el-option>
                            </el-select>
                          </div>
                          <div class="pl-10 flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimePrice" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_maxBillingTimePrice`] = checkDigit(v, 0, 1000000))">
                              <template slot="append">元</template>
                            </el-input>
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item label="总封顶" :error="ferror[`${item.deviceTypeCode}_${xcx}_maxAmount`]">
                        <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.maxAmount" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_maxAmount`] = checkDigit(v, 0, 1000000))">
                          <template slot="append">元</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="押金"
                        v-if="item[`${xcx}PayMode`].modeType == 'DEPOSIT' || item[`${xcx}PayMode`].modeType == 'DEPOSIT_AND_FREE'" :error="ferror[`${item.deviceTypeCode}_${xcx}_depositAmount`]">
                        <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.depositAmount" @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_depositAmount`] = checkDigit(v, 0, 1000000))">
                          <template slot="append">元</template>
                        </el-input>
                      </el-form-item>
                    </template>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
          <el-form-item>
            <el-button class="mt-10 mb-10" type="primary" @click="onSubmit('form')"
              :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {
    defaultFee,
    bMapTransQQMap,
    qqMapTransBMap,
    arrayToObj
  } from '@/utils/index'
  import upload from '@/components/upload'
  import maps from '@/components/map'
  export default {
    name: 'addStore',
    components: {
      upload,
      maps
    },
    computed: {
      agentInfo() {
        let agentInfo = this.$store.getters.agentInfo
        return agentInfo
      },
      Ability() {
        console.log(this.$store.getters.Ability)
        return this.$store.getters.Ability
      },
      myDevice() {
        let myDevice = this.$store.getters.myDevice
        return myDevice
      },
      myDeviceId() {
        return this.$store.getters.myDeviceId || {PA: '充电宝'}
      },
      siteInfo() {
        let siteInfo = this.$store.getters.siteInfo
        return siteInfo
      },
      myProfitRatio() {
        return this.$store.getters.myProfitRatio || { PA: 100 }
      }
    },
    data() {
      return {
        rules: {
          name: [{
            required: true,
            message: '请填写商户名称',
            trigger: 'blur'
          }],
          address: [{
            required: true,
            message: '请填写商家地址',
            trigger: 'blur'
          }],
          userMobile: [{
            required: true,
            message: '请填写手机号码作为登录账户',
            trigger: 'blur'
          }],
          catId: [{
            required: true,
            message: '请选择行业分类',
            trigger: 'blur'
          }],
          province: [{
            required: true,
            message: '请选择城市区域',
            trigger: 'blur'
          }],
          lng: [{
            required: true,
            message: '请选择地图定位'
          }]
        },
        clickSubmit: false,
        storeId: this.$route.query.storeId || '',
        parentId: this.$route.query.parentId || '',
        lowerStore: this.$route.query.lowerStore || false,
        catList: [],
        cityList: [],
        form: {
          catId: [],
          province: [],
          divisionMode: 1,
          avatar: '',
          loginPassword: '123456',
          lng: '',
          address: ''
        },
        ferror: {},
        powerInfo: {},

        selDevice: [],
        deviceDataArr: [],
        defaultDevice: defaultFee(),

        // 地图加载
        mapTrue: false
      }
    },
    mounted() {
      this.storeDfKey = 'storeDfKey'
      let storeDefaultConfig = localStorage.getItem(this.storeDfKey)
      if (storeDefaultConfig) {
        storeDefaultConfig = JSON.parse(storeDefaultConfig)
        this.storeDefaultConfig = storeDefaultConfig
      }else{
				this.storeDefaultConfig = {}
			}
      this.getCategory()
      this.getCity()
      if (this.storeId > 0) {
        this.getInfo()
      } else {
        if (storeDefaultConfig) {
          if(storeDefaultConfig.lng){
            let ns = qqMapTransBMap(storeDefaultConfig.lng, storeDefaultConfig.lat)
            this.$set(this.form, 'lat', ns.lat)
            this.$set(this.form, 'lng', ns.lng)
          }
          if(storeDefaultConfig.province){
            this.$set(this.form, 'province', [storeDefaultConfig.province, storeDefaultConfig.city, storeDefaultConfig.district])
          }
        }
        this.mapTrue = true
        this.selDevice.push(Object.keys(this.myDeviceId)[0])
        this.getDefaultBilling(Object.keys(this.myDeviceId)[0]).then(info => {
          this.deviceDataArr.push(info)
        })
      }
    },
    methods: {
      /**
       * 类型选择
       */
      changeDevice(selCode) {
        let deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr)),
          idArr = [],
          deviceObj = {}
        deviceDataArr.map(item => {
          if (selCode.indexOf(item.deviceTypeCode) == -1) {
            return item.status = 0
          }
        })
        selCode.map(code => {
          let idxs = -1
          deviceDataArr.map((item, idx) => {
            if (item.deviceTypeCode == code) {
              idxs = idx
              item.status = 1
            }
          })
          if (idxs == -1) {
            this.getDefaultBilling(code).then(info => {
              deviceDataArr.push(info)
            })
          }
        })
        this.deviceDataArr = deviceDataArr
      },

      /**
       * 获取信息
       */
      getDefaultBilling(deviceTypeCode) {
        let defaultDevice = JSON.parse(JSON.stringify(this.defaultDevice)),
          mode_way = Object.values(this.config.mode_way[deviceTypeCode] || this.config.mode_way.default)
        defaultDevice.deviceTypeCode = deviceTypeCode
        defaultDevice.weixinPayMode.modeType = mode_way[0]
        defaultDevice.alipayPayMode.modeType = mode_way[0]
        return new Promise((resolve, reject) => {
          if (!this.Ability['defaultBilling']) {
            this.$get(`iot-saas-basic/admin/billing/configs/findMax`, {
              deviceTypeCode: deviceTypeCode
            }).then((res = {}) => {
              if (res.deviceTypeCode) {
                defaultDevice.weixinPayMode = JSON.parse(res.wechatJson)
                defaultDevice.alipayPayMode = JSON.parse(res.alipayJson)
                if (!this.Ability[`${deviceTypeCode}_${defaultDevice.weixinPayMode.modeType}`]) {
                  defaultDevice.weixinPayMode.modeType = mode_way[0]
                }
                if (!this.Ability[`${deviceTypeCode}_${defaultDevice.alipayPayMode.modeType}`]) {
                  defaultDevice.alipayPayMode.modeType = mode_way[0]
                }
                resolve(defaultDevice)
              } else {
                defaultDevice.weixinPayMode.payModeDetail = defaultFee(deviceTypeCode).weixinPayMode[
                  `payModeDetail`]
                defaultDevice.alipayPayMode.payModeDetail = defaultFee(deviceTypeCode).alipayPayMode[
                  `payModeDetail`]
                resolve(defaultDevice)
              }
            })
          } else {
            defaultDevice.weixinPayMode.payModeDetail = defaultFee(deviceTypeCode).weixinPayMode[`payModeDetail`]
            defaultDevice.alipayPayMode.payModeDetail = defaultFee(deviceTypeCode).alipayPayMode[`payModeDetail`]
            resolve(defaultDevice)
          }
        })
      },

      /**
       * 获取类别
       */
      getCategory() {
        this.$get('iot-saas-basic/admin/store/category').then(res => {
          let list = {},
            catId = ''
          res.map(item => {
            if (item.level == 1) {
              list[item.catId] = {
                value: item.catId,
                label: item.catName,
                children: []
              }
            } else if (item.level == 2) {
              catId = catId || item.catId
              list[item.parentId].children.push({
                value: item.catId,
                label: item.catName
              })
            }
          })
          this.catList = Object.values(list)
          if (!this.storeId) {
            this.$set(this.form, 'catId', this.storeDefaultConfig.catId || catId)
          }
        })
      },

      /**
       * 获取城市
       */
      getCity() {
        this.$store.dispatch('api/getRegions').then(res => {
          let list = {}
          res.map(item => {
            if (item.level == 1) {
              list[item.tag] = {
                value: item.title,
                label: item.title,
                children: {}
              }
            } else if (item.level == 2) {
              let tag = item.tag.substring(0, 3)
              list[tag].children[item.tag] = {
                value: item.title,
                label: item.title,
                children: []
              }
            } else if (item.level == 3) {
              let tag1 = item.tag.substring(0, 3),
                tag2 = item.tag.substring(0, 6)
              list[tag1].children[tag2].children.push({
                value: item.title,
                label: item.title
              })
            }
          })
          list = Object.values(list)
          list.map(item => {
            if (JSON.stringify(item.children) == '{}') {
              item.children = []
            } else {
              item.children = Object.values(item.children)
            }
            return item
          })
          this.cityList = list
        })
      },

      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get('iot-saas-basic/admin/store/findById', {
          id: this.storeId
        }).then(res => {
          if (res.lat > 0 && res.lng > 0) {
            let ns = qqMapTransBMap(res.lng, res.lat)
            res.lng = ns.lng
            res.lat = ns.lat
          }
          let info = res,
            deviceDataArr = [],
            storePayConfig = {},
            payConfigId = {}
          if (res.storePayConfig) {
            res.storePayConfig.map(item => {
              let payArr = []
              for (var i in this.config.pay_way) {
                if (item[i] == 1) payArr.push(i)
              }
              storePayConfig[item.deviceTypeCode] = payArr
              payConfigId[item.deviceTypeCode] = item.id
            })
          }
          if (res.storeDivisionConfig) {
            res.storeDivisionConfig.map(item => {
              if (item.alipayPayMode) {
                if (item.alipayPayMode.modeType == 'PACKAGE') {
                  item.alipayPayMode.payModeDetail = JSON.parse(item.alipayPayMode.payModeDetail)
                  item.alipayPayMode.payModeDetails = this.defaultDevice.alipayPayMode.payModeDetails
                } else {
                  item.alipayPayMode.payModeDetails = JSON.parse(item.alipayPayMode.payModeDetail)
                  item.alipayPayMode.payModeDetail = this.defaultDevice.alipayPayMode[`payModeDetail`]
                }
              }
              if (item.weixinPayMode) {
                if (item.weixinPayMode.modeType == 'PACKAGE') {
                  item.weixinPayMode.payModeDetail = JSON.parse(item.weixinPayMode.payModeDetail)
                  item.weixinPayMode.payModeDetails = this.defaultDevice.weixinPayMode.payModeDetails
                } else {
                  item.weixinPayMode.payModeDetails = JSON.parse(item.weixinPayMode.payModeDetail)
                  item.weixinPayMode.payModeDetail = this.defaultDevice.weixinPayMode[`payModeDetail`]
                }
              }
              item.alipayPayMode = (item.alipayPayMode ? item.alipayPayMode : item.weixinPayMode ? item
                .weixinPayMode : this.defaultDevice.alipayPayMode)
              item.weixinPayMode = (item.weixinPayMode ? item.weixinPayMode : item.alipayPayMode ? item
                .alipayPayMode : this.defaultDevice.weixinPayMode)
              item.alipayPayMode = JSON.parse(JSON.stringify(item.alipayPayMode))
              item.weixinPayMode = JSON.parse(JSON.stringify(item.weixinPayMode))
              item.storePayConfig = storePayConfig[item.deviceTypeCode]
              item.status = 1
              item.payConfigId = payConfigId[item.deviceTypeCode]
              this.selDevice.push(item.deviceTypeCode)
              deviceDataArr.push(item)
            })
          }
          this.deviceDataArr = deviceDataArr
          res.user = res.user || {}
          info.userNickName = res.user.bindUserName
          info.userMobile = res.user.mobile
          info.province = [res.province, res.city, res.district]
          delete info.city
          delete info.district
          delete info.storeDivisionConfig
          delete info.storePayConfig
          delete info.user
          this.form = info
          this.mapTrue = true
        })
      },

      /**
       * 提交
       * @param {Object} formName
       */
      onSubmit(formName) {
        let url = 'iot-saas-basic/admin/store/save',
          deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr))
        if (this.storeId > 0) {
          url = 'iot-saas-basic/admin/store/updateById'
        }
        if (this.selDevice.length == 0) {
          uni.showToast({
            title: '最少选择一个运营产品',
            icon: 'none'
          })
          return
        }
        let error = false
        for(var i in this.ferror){
          if(this.ferror[i]){
            error = true
            break
          }
        }
        if(error) return
        this.$refs[formName].validate((valid, object) => {
          if (valid) {
            const params = JSON.parse(JSON.stringify(this.form))
            if (this.parentId) params.parentId = this.parentId
            if (params.lat > 0 && params.lng > 0) {
              let lng_lat = bMapTransQQMap(params.lng, params.lat)
              params.lng = lng_lat.lng
              params.lat = lng_lat.lat
            }
            if (params.catId && typeof params.catId == 'object') {
              params.catId = params.catId[params.catId.length - 1]
            }
            if (Array.isArray(params.province) && params.province.length > 0) {
              params.district = params.province[2]
              params.city = params.province[1]
              params.province = params.province[0]
            }
            params.storePayConfig = []
            params.storeDivisionConfig = []
            for (var i in deviceDataArr) {
              let item = deviceDataArr[i]
              if (item.status == 1) {
                let payConfig = {
                  deviceTypeCode: item.deviceTypeCode
                }
                for (var i in this.config.pay_way) {
                  if (item.storePayConfig.indexOf(i) > -1) {
                    payConfig[i] = 1
                  } else {
                    payConfig[i] = 0
                  }
                }
                if (item.payConfigId) payConfig.id = item.payConfigId
                params.storePayConfig.push(payConfig)
                if (item.alipayPayMode.payModeDetail) {
                  if (item.alipayPayMode.modeType == 'PACKAGE') {
                    item.alipayPayMode.payModeDetail.map((packItem, packI) => {
                      return packItem.tag = packI + 1
                    })
                    item.alipayPayMode.payModeDetail = JSON.stringify(item.alipayPayMode.payModeDetail)
                  } else {
                    if(item.alipayPayMode.payModeDetails.maxAmount > item.alipayPayMode.payModeDetails.depositAmount && (item.alipayPayMode.modeType == 'DEPOSIT' || item.alipayPayMode.modeType == 'DEPOSIT_AND_FREE')){
                      error = `${this.myDeviceId[item.deviceTypeCode]}支付宝押金金额不可小于总封顶金额`
                      break
                    }
                    item.alipayPayMode.payModeDetail = JSON.stringify(item.alipayPayMode.payModeDetails)
                  }
                }
                if (item.weixinPayMode.payModeDetail) {
                  if (item.weixinPayMode.modeType == 'PACKAGE') {
                    item.weixinPayMode.payModeDetail.map((packItem, packI) => {
                      return packItem.tag = packI + 1
                    })
                    item.weixinPayMode.payModeDetail = JSON.stringify(item.weixinPayMode.payModeDetail)
                  } else {
                    if(item.weixinPayMode.payModeDetails.maxAmount > item.weixinPayMode.payModeDetails.depositAmount && (item.weixinPayMode.modeType == 'DEPOSIT' || item.weixinPayMode.modeType == 'DEPOSIT_AND_FREE')){
                      error = `${this.myDeviceId[item.deviceTypeCode]}微信押金金额不可小于总封顶金额`
                      break
                    }
                    item.weixinPayMode.payModeDetail = JSON.stringify(item.weixinPayMode.payModeDetails)
                  }
                }
                let division = {
                  closeType: item.closeType,
                  deviceTypeCode: item.deviceTypeCode,
                  alipayPayMode: item.alipayPayMode,
                  weixinPayMode: item.weixinPayMode
                }
                if (item.id) division.id = item.id
                division.live = item.live || 0
                division.relative = item.relative || 0
                division.promised = item.promised || 0
                division.promisedDeal = item.promisedDeal || 1
                params.storeDivisionConfig.push(division)
              }
            }
            if(error){
              this.$message({
                message: error,
                type: 'error'
              })
              return
            }
            this.clickSubmit = true
            this.$post(url, params).then(res => {
              if(!this.storeId){
                localStorage.setItem(this.storeDfKey, JSON.stringify({
                  lng: params.lng || '',
                  lat: params.lat || '',
                  catId: params.catId || '',
                  district: params.district,
                  city: params.city,
                  province: params.province
                }))
                this.setDefaultbilling()
              }
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              if (this.lowerStore > 0) {
                this.$router.push({
                  path: '/store/subStore'
                })
              } else {
                this.$router.push({
                  path: '/store'
                })
              }
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })

          }
        })
      },

      /**
       * @param {Object} type
       */
      setCloseType(type){
        if(type == 1){
          this.ferror.promised = ''
          this.ferror.relative = ''
          this.ferror.promisedDeal = ''
        }else if(type == 2){
          this.ferror.promisedDeal = ''
          this.ferror.promised = ''
        }else{
          this.ferror.live = ''
        }
      },

      /**
       * 商户经纬度
       */
      locationOk(center) {
        this.form.lat = center.lat
        this.form.lng = center.lng
        if (!this.storeId || this.onLoad) {
          this.form.address = center.address
          //this.getLatCity(center.lng, center.lat)
        } else if (this.storeId) {
          setTimeout(() => {
            this.onLoad = true
          }, 3000)
        }
      },

      /**
       * 经纬度获取省市区标识
       */
      getLatCity(lng, lat) {
        this.$get('Place/getLatLookup', {
          lng: lng,
          lat: lat
        }).then(res => {
          let regionTag = []
          res.tag.map(tag => {
            regionTag.push(tag)
          })
          if (regionTag.length > 0) this.form.regionTag = regionTag
        })
      },

      /**
       * 获取设备支持模式
       */
      getModeType(code) {
        return this.config.mode_way[code] ? this.config.mode_way[code] : this.config.mode_way.default
      },

      /**
       * 一键同步微信计费
       */
      setAlipayMode(item){
      	let errorMsg = false
      	for(var i in this.ferror){
      	  if(this.ferror[i] && i.indexOf('weixin') > -1){
      			errorMsg = this.ferror[i]
      	    break
      	  }
      	}
      	if(errorMsg){
          this.$message({
            message: '您填写的数据有误，请先检查',
            type: 'error'
          })
      		return
      	}
      	for(var i in this.ferror){
      	  if(this.ferror[i] && i.indexOf('alipay') > -1){
      			delete this.ferror[i]
      	  }
      	}
      	item.alipayPayMode = JSON.parse(JSON.stringify(item.weixinPayMode))
      },

      /**
       * 提交设置默认计费
       */
      setDefaultbilling() {
        let deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr))
        deviceDataArr.map(item => {
          if(item.status == 1){
            let params = {
              deviceTypeCode: item.deviceTypeCode,
              agentId: this.isBrand() ? 0 : this.agentInfo.agentId,
              wechatJson: JSON.stringify(item.weixinPayMode),
              alipayJson: JSON.stringify(item.alipayPayMode)
            }
            this.$post('iot-saas-basic/admin/billing/configs/save', params).then(res => {})
          }
        })
      }
    }
  }
</script>

<style scoped>
  /deep/ .el-cascader {
    width: 100%;
  }

  /deep/ .input-with .el-input-group__prepend {
    padding: 0 0 0 5px;
  }
</style>
