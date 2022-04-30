<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="130px">
          <h4>基础信息</h4>
          <el-form-item label="门头照" class="up-img">
            <upload v-model="form.avatar" :upObj="{fileType: 'storePhoto'}"/>
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
          <el-form-item ref="lng" label="定位地址" prop="lng">
            <maps v-if="form.lng" :center="{ lng: form.lng, lat: form.lat }" @locationOk="locationOk" :zooms="18" />
            <maps v-else @locationOk="locationOk" :zooms="18"/>
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
            <el-input v-model="form.introduce" placeholder="商户介绍" type="textarea" :rows="3"/>
          </el-form-item>

          <template>
            <h4>分润信息</h4>
            <el-form-item label="分成方式">
              <el-radio-group v-model="form.divisionMode">
                <el-radio-button :label="1">比例分成</el-radio-button>
                <el-radio-button :label="2">不给分成</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <div v-if="form.divisionMode != 2">
              <el-form-item ref="userNickName" label="联系人" prop="userNickName">
                <el-input v-model="form.userNickName" placeholder="请填写联系人姓名" />
              </el-form-item>
              <el-form-item ref="userMobile" label="手机号码" prop="userMobile">
                <el-input v-model="form.userMobile" placeholder="此手机号码会作为登录账户" />
              </el-form-item>
              <el-form-item v-if="!store_id" label="登录密码">
                <el-input v-model="form.loginPassword" placeholder="请填写登录密码" />
              </el-form-item>
            </div>
          </template>

          <h4 class="pt-20">运营产品</h4>
          <el-checkbox-group v-model="selDevice" @change="changeDevice" class="pl-10">
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <div>
            <template v-for="(item, index) in deviceDataArr" v-if="item.status == 1">
              <h4 class="pt-20">{{ myDeviceId[item.deviceTypeCode] }}设置</h4>

              <template v-if="form.divisionMode != 2">
                <el-form-item label="分成模式">
                  <el-radio-group v-model="item.closeType">
                    <el-radio-button :label="cti" v-for="(ct, cti) in config.closeType" :disabled="cti != 1">{{ ct }}</el-radio-button>
                  </el-radio-group>
                  <el-popover
                    placement="right"
                    title=""
                    width="400"
                    trigger="hover">
                    <div>
                      <div class="mb-15 text-bold text-black">分成注释</div>

                      <div class="mb-5 text-black">真实分成</div>
                      真实分成：若真实分成设置为50%，则10元订单商户可分润10×50%=5元<br><br>

                      <div class="mb-5 text-black">相对分成</div>
                      相对分成：若相对分成设置为50%，您的分成为50%，则10元订单商户可分润10×50%×50%=2.5元<br><br>

                      <div>
                        <div class="mb-5 text-black">分成不一致</div>
                        承诺分成：商户后台显示此分成比例。<span>若您的分成为50%，设置承诺分成为90%，则10元订单商户可分润10×50%×90%=4.5元。注：每天只有第1笔订单按照承诺分成比例分润。</span><br>
                        实际分成：若自身的分成为50%，设置实际分成为50%，则10元订单商户可分润10×50%×50%=2.5元。注：每天从第2笔订单开始就按照实际分成比例分润。<br>
                      </div>

                      <div class="mt-20">需设置分成不一致？<el-link type="primary" :underline="false">点此去购买</el-link></div>
                    </div>
                    <el-link type="danger" slot="reference" :underline="false" class="ml-10 el-icon-question fs-c1"></el-link>
                  </el-popover>
                </el-form-item>
                <template v-if="item.closeType == 3">
                  <el-form-item label="承诺分成">
                    <el-input v-model="item.promised" placeholder="最高不能超过100%">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="相对分成">
                    <el-input v-model="item.relative" placeholder="最高不能超过100%">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-else-if="item.closeType == 2">
                  <el-form-item label="相对分成">
                    <el-input v-model="item.relative" placeholder="最高不能超过100%">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-else>
                  <el-form-item label="分成比例">
                    <el-input class="input-with" v-model="item.live" :placeholder="`最高不能超过${myProfitRatio[item.deviceTypeCode]}%`">
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

              <template v-for="(name, xcx) in config.xcx_pay.default">
                <div class="mt-30 mb-10 text-dfs">{{ name }}付费设置</div>
                <el-form-item :label="`付费模式`">
                  <el-radio-group v-model="item[`${xcx}PayMode`].modeType" size="medium">
                    <el-radio-button :label="item" v-for="(item, key) in (config.mode_way[item.deviceTypeCode] ? config.mode_way[item.deviceTypeCode] : config.mode_way.default)">{{ key }}</el-radio-button>
                  </el-radio-group>
                  <el-popover
                    placement="right"
                    title=""
                    width="400"
                    trigger="hover">
                    <div>
                      需了解和设置预存+先充后付？<el-link type="primary" :underline="false">点此去购买</el-link>
                    </div>
                    <el-link type="danger" :underline="false" slot="reference" class="ml-10 el-icon-question fs-c1"></el-link>
                  </el-popover>
                </el-form-item>

                <template v-if="item[`${xcx}PayMode`].modeType == 'PACKAGE'">
                  <el-form-item :label="`套餐设置`">
                    <div class="flex align-center flex-wrap" v-for="(plan, index) in item[`${xcx}PayMode`].payModeDetail">
                      <el-select v-model="plan.time">
                        <el-option :label="`${time / 60}小时`" :value="time" v-for="time in config[`plan_time`]"></el-option>
                      </el-select>
                      <el-input v-model="plan.money" class="flex1 ml-10 mr-10">
                        <template slot="append">元</template>
                      </el-input>
                      <el-button type="text" size="small" :disabled="item[`${xcx}PayMode`].payModeDetail.length == 4" v-if="index == 0"
                        @click="item[`${xcx}PayMode`].payModeDetail.push({time: 60, money: 2, tag: index + 1})">添加</el-button>
                      <el-button type="text" size="small" v-else
                        @click="item[`${xcx}PayMode`].payModeDetail.splice(index, 1)" class="text-danger">删除</el-button>
                    </div>
                  </el-form-item>
                </template>

                <template v-else>
                  <el-form-item label="前">
                    <div class="flex">
                      <div class="flex1">
                        <el-input v-model="item[`${xcx}PayMode`].payModeDetails.startingTime">
                          <template slot="append">分钟</template>
                        </el-input>
                      </div>
                      <div class="pl-10 flex1">
                        <el-input v-model="item[`${xcx}PayMode`].payModeDetails.startingAmount">
                          <template slot="append">元</template>
                        </el-input>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="超过后">
                    <div class="flex">
                      <div class="flex1">
                        <el-input v-model="item[`${xcx}PayMode`].payModeDetails.overBillingUnit">
                          <template slot="append">分钟</template>
                        </el-input>
                      </div>
                      <div class="pl-10 flex1">
                        <el-input v-model="item[`${xcx}PayMode`].payModeDetails.unitPrice">
                          <template slot="append">元</template>
                        </el-input>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="封顶">
                    <div class="flex">
                      <div>
                        <el-select v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimeUnit">
                          <el-option :label="`${item / 60}小时封顶`" :value="item" v-for="item in config.day_unit"></el-option>
                        </el-select>
                      </div>
                      <div class="pl-10 flex1">
                        <el-input v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimePrice">
                          <template slot="append">元</template>
                        </el-input>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="总封顶">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.maxAmount">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="押金">
                    <el-input v-model="item[`${xcx}PayMode`].payModeDetails.depositAmount">
                      <template slot="append">元</template>
                    </el-input>
                  </el-form-item>
                </template>
              </template>
            </template>
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
import { defaultFee, bMapTransQQMap, qqMapTransBMap, arrayToObj } from '@/utils/index'
import upload from '@/components/upload'
import maps from '@/components/map'
export default {
  name: 'shopCreate',
  components: {
    upload,
    maps
  },
  computed: {
    agentInfo() {
      let agentInfo = this.$store.getters.agentInfo
      return agentInfo
    },
    myDevice() {
      let myDevice = this.$store.getters.myDevice
      return myDevice
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    siteInfo() {
      let siteInfo = this.$store.getters.siteInfo
      return siteInfo
    },
    myProfitRatio() {
      return this.$store.getters.myProfitRatio
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
      store_id: this.$route.params.store_id || '',
      store_aid: this.$route.query.store_aid || '',
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
      powerInfo: {},

      selDevice: [],
      deviceDataArr: [],
      defaultDevice: defaultFee(),
      subShop: false
    }
  },
  mounted() {
    this.getOldCat()
    this.getCity()
    if (this.store_id > 0) {
      this.getInfo()
    } else {
      this.selDevice.push(Object.keys(this.myDeviceId)[0])
      this.defaultDevice.deviceTypeCode = Object.keys(this.myDeviceId)[0]
      this.deviceDataArr.push(this.defaultDevice)
    }
  },
  methods: {
    /**
     * 类型选择
     */
    changeDevice(selCode){
      let deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr)), idArr = [], deviceObj = {}
      deviceDataArr.map(item => {
        if(selCode.indexOf(item.deviceTypeCode) == -1){
          return item.status = 0
        }
      })
      selCode.map(code => {
        let idxs = -1
        deviceDataArr.map((item, idx) => {
          if(item.deviceTypeCode == code){
            idxs = idx
            item.status = 1
          }
        })
        if(idxs == -1){
          let device = this.defaultDevice
          device.deviceTypeCode = code
          if(code == 'PA'){
            device.weixinPayMode.modeType = Object.values(this.config.mode_way.PA)[0]
            device.alipayPayMode.modeType = Object.values(this.config.mode_way.PA)[0]
          }
          deviceDataArr.push(this.defaultDevice)
        }
      })
      this.deviceDataArr = deviceDataArr
    },

    /**
     * 获取上一个商户的分类类型
     */
    getOldCat(){
      // this.$get('agentapi/store/get_my_new_params', {
      //   get_key: 'catId'
      // }).then(res => {
        //this.catId = res.catId
        this.getCategory()
      // })
    },

    /**
     * 获取类别
     */
    getCategory() {
      this.$get('iot-saas-basic/admin/store/category').then(res => {
        let list = {}, catId = ''
        res.map(item => {
          if(item.level == 1){
            list[item.catId] = {
              value: item.catId,
              label: item.catName,
              children: []
            }
          }else if(item.level == 2){
            catId = catId || item.catId
            list[item.parentId].children.push({
              value: item.catId,
              label: item.catName
            })
          }
        })
        this.catList = Object.values(list)
        if(!this.store_id){
          this.$set(this.form, 'catId', catId)
        }
      })
    },

    /**
     * 获取城市
     */
    getCity(){
      this.$store.dispatch('api/getRegions').then(res => {
        let list = {}
        res.map(item => {
          if(item.level == 1){
            list[item.tag] = {
              value: item.title,
              label: item.title,
              children: {}
            }
          }else if(item.level == 2){
            let tag = item.tag.substring(0, 3)
            list[tag].children[item.tag] = {
              value: item.title,
              label: item.title,
              children: []
            }
          }else if(item.level == 3){
            let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
            list[tag1].children[tag2].children.push({
              value: item.title,
              label: item.title
            })
          }
        })
        list = Object.values(list)
        list.map(item => {
          if(JSON.stringify(item.children) == '{}'){
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
        id: this.store_id
      }).then(res => {
        let info = res, deviceDataArr = [], storePayConfig = {}, payConfigId = {}
        res.storePayConfig.map(item => {
          let payArr = []
          for(var i in this.config.pay_way){
            if(item[i] == 1) payArr.push(i)
          }
          storePayConfig[item.deviceTypeCode] = payArr
          payConfigId[item.deviceTypeCode] = item.id
        })
        res.storeDivisionConfig.map(item => {
          if (item.alipayPayMode) {
            if(item.weixinPayMode.modeType == 'PACKAGE'){
              item.alipayPayMode.payModeDetail = JSON.parse(item.alipayPayMode.payModeDetail)
              item.alipayPayMode.payModeDetails = this.defaultDevice.alipayPayMode.payModeDetails
            } else {
              item.alipayPayMode.payModeDetails = JSON.parse(item.alipayPayMode.payModeDetail)
              item.alipayPayMode.payModeDetail = this.defaultDevice.alipayPayMode.payModeDetail
            }
          }
          if (item.weixinPayMode) {
            if(item.weixinPayMode.modeType == 'PACKAGE'){
              item.weixinPayMode.payModeDetail = JSON.parse(item.weixinPayMode.payModeDetail)
              item.weixinPayMode.payModeDetails = this.defaultDevice.weixinPayMode.payModeDetails
            } else {
              item.weixinPayMode.payModeDetails = JSON.parse(item.weixinPayMode.payModeDetail)
              item.weixinPayMode.payModeDetail = this.defaultDevice.weixinPayMode.payModeDetail
            }
          }
          item.alipayPayMode = (item.alipayPayMode ? item.alipayPayMode : item.weixinPayMode ? item.weixinPayMode : this.defaultDevice.alipayPayMode)
          item.weixinPayMode = (item.weixinPayMode ? item.weixinPayMode : item.alipayPayMode ? item.alipayPayMode : this.defaultDevice.weixinPayMode)
          item.alipayPayMode = JSON.parse(JSON.stringify(item.alipayPayMode))
          item.weixinPayMode = JSON.parse(JSON.stringify(item.weixinPayMode))
          item.storePayConfig = storePayConfig[item.deviceTypeCode]
          item.status = 1
          item.payConfigId = payConfigId[item.deviceTypeCode]
          this.selDevice.push(item.deviceTypeCode)
          deviceDataArr.push(item)
        })
        console.log(deviceDataArr)
        this.deviceDataArr = deviceDataArr
        info.userNickName = res.user.bindUserName
        info.userMobile = res.user.mobile
        info.province = [res.province, res.city, res.district]
        delete info.city
        delete info.district
        delete info.storeDivisionConfig
        delete info.storePayConfig
        delete info.user
        this.form = info
      })
    },

    /**
     * 提交
     * @param {Object} formName
     */
    onSubmit(formName) {
      let url = 'iot-saas-basic/admin/store/save', deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr))
      if (this.store_id > 0) {
        url = 'iot-saas-basic/admin/store/updateById'
      }
      if(this.selDevice.length == 0){
      	uni.showToast({
      		title: '最少选择一个运营产品',
      		icon: 'none'
      	})
        return
      }
      this.clickSubmit = true
      this.$refs[formName].validate((valid, object) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          if(params.lat > 0 && params.lng > 0){
            let lng_lat = bMapTransQQMap(params.lng, params.lat)
            params.lng = lng_lat.lng
            params.lat = lng_lat.lat
          }
          if(params.catId && typeof params.catId == 'object'){
            params.catId = params.catId[params.catId.length - 1]
          }
          if(Array.isArray(params.province) && params.province.length > 0){
            params.district = params.province[2]
            params.city = params.province[1]
            params.province = params.province[0]
          }
          params.storePayConfig = []
          params.storeDivisionConfig = []
          deviceDataArr.map(item => {
            if(item.status == 1){
              let payConfig = {
                deviceTypeCode: item.deviceTypeCode
              }
              item.storePayConfig.map(item => {
                payConfig[item] = 1
              })
              if(item.payConfigId) payConfig.id = item.payConfigId
              params.storePayConfig.push(payConfig)
              if(item.alipayPayMode.payModeDetail){
                if(item.alipayPayMode.modeType == 'PACKAGE'){
                  item.alipayPayMode.payModeDetail.map((packItem, packI) => {
                    return packItem.tag = packI + 1
                  })
                  item.alipayPayMode.payModeDetail = JSON.stringify(item.alipayPayMode.payModeDetail)
                }else{
                  item.alipayPayMode.payModeDetail = JSON.stringify(item.alipayPayMode.payModeDetails)
                }
              }
              if(item.weixinPayMode.payModeDetail){
                if(item.weixinPayMode.modeType == 'PACKAGE'){
                  item.weixinPayMode.payModeDetail.map((packItem, packI) => {
                    return packItem.tag = packI + 1
                  })
                  item.weixinPayMode.payModeDetail = JSON.stringify(item.weixinPayMode.payModeDetail)
                } else {
                  item.weixinPayMode.payModeDetail = JSON.stringify(item.weixinPayMode.payModeDetails)
                }
              }
              let division = {
                closeType: item.closeType,
                deviceTypeCode: item.deviceTypeCode,
                alipayPayMode: item.alipayPayMode,
                weixinPayMode: item.weixinPayMode
              }
              if(item.id) division.id = item.id
              if(item.live >= 0) division.live = item.live
              if(item.relative >= 0) division.relative = item.relative
              if(item.promised >= 0) division.promised = item.promised
              params.storeDivisionConfig.push(division)
            }
          })
          this.$post(url, params).then(res => {
            this.$message({
              message: '提交成功',
              type: 'success'
            })
            if(this.subShop){
              this.$router.push({
                path: '/store/subStore'
              })
            } else {
              this.$router.push({
                path: '/store/meStore'
              })
            }
            this.clickSubmit = false
          }).catch( err => {
            this.clickSubmit = false
          })
        } else {
          this.clickSubmit = false
        }
      })
    },

    /**
     * 商户经纬度
     */
    locationOk(center) {
      this.form.lat = center.lat
      this.form.lng = center.lng
      if(!this.store_id || this.onLoad){
        this.form.address = center.address
        //this.getLatCity(center.lng, center.lat)
      }else if(this.store_id){
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
        let regionTag = []
        res.tag.map(tag => {
          regionTag.push(tag)
        })
        if(regionTag.length > 0) this.form.regionTag = regionTag
      })
    }
  }
}
</script>

<style scoped>
  /deep/ .el-cascader{
    width: 100%;
  }
  /deep/ .input-with .el-input-group__prepend {
    padding: 0 0 0 5px;
  }
</style>
