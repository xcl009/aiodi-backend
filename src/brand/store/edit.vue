<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="135px">
          <h4>基础信息</h4>
          <el-form-item label="门头照：" class="up-img">
            <upload v-model="form.avatar"/>
          </el-form-item>
          <el-form-item ref="shopName" label="商户名称：" prop="shopName">
            <el-input v-model="form.shopName" placeholder="请填写商户名称" />
          </el-form-item>
          <el-form-item ref="shopMobile" label="商家电话：" prop="shopMobile">
            <el-input v-model="form.shopMobile" placeholder="请填写商家电话" />
          </el-form-item>
          <el-form-item ref="catId" label="行业分类：" prop="catId">
            <el-cascader v-model="form.catId" :options="catList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="lng" label="定位地址：" prop="lng">
            <maps v-if="form.lng" :center="{ lng: form.lng, lat: form.lat }" @locationOk="locationOk" :zooms="18" />
            <maps v-else @locationOk="locationOk" :zooms="18"/>
          </el-form-item>
          <el-form-item ref="regionTag" label="所在地区：" prop="regionTag">
            <el-cascader v-model="form.regionTag" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="address" label="商户地址：" prop="address">
            <el-input v-model="form.address" placeholder="请填写商户地址" />
          </el-form-item>
          <el-form-item label="营业时间：">
            <el-input v-model="form.businessTimeDes" placeholder="如:09:00-21:00" />
          </el-form-item>
          <el-form-item label="商户介绍：">
            <el-input v-model="form.introduce" placeholder="商户介绍" type="textarea" :rows="3"/>
          </el-form-item>

          <template>
            <h4>分润信息</h4>
            <el-form-item label="分成方式：">
              <el-radio-group v-model="form.divisionMode">
                <el-radio-button :label="1">比例分成</el-radio-button>
                <el-radio-button :label="2">不给分成</el-radio-button>
                <!-- <el-radio-button :label="3">入场费</el-radio-button> -->
              </el-radio-group>
            </el-form-item>
            <div v-if="form.divisionMode != 2">
              <el-form-item ref="bindUserName" label="联系人：" prop="bindUserName">
                <el-input v-model="form.bindUserName" placeholder="请填写联系人姓名" />
              </el-form-item>
              <el-form-item ref="userBindMoblie" label="手机号码：" prop="userBindMoblie">
                <el-input v-model="form.userBindMoblie" placeholder="此手机号码会作为登录账户" />
              </el-form-item>
              <el-form-item v-if="!store_id" label="登录密码：">
                <el-input v-model="form.loginPassword" placeholder="请填写登录密码" />
              </el-form-item>
            </div>
          </template>

          <h4 class="pt-20">运营产品</h4>
          <el-checkbox-group v-model="selDevice" @change="changeDevice" class="pl-10">
            <el-checkbox v-for="item in myDevice" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>

          <div>
            <template v-for="(item, index) in deviceDataArr" v-if="item.status == 1">
              <h4 class="pt-20">{{ myDeviceId[item.deviceTypeId] }}设置</h4>

              <el-form-item label="分成模式：">
                <el-radio-group v-model="item.closeType">
                  <el-radio-button :label="cti" v-for="(ct, cti) in config.closeType">{{ ct }}</el-radio-button>
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
              <template v-if="item.closeType == 'disaccord'">
                <el-form-item label="承诺分成：">
                  <el-input v-model="item.promised" placeholder="最高不能超过100%">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
                <el-form-item label="相对分成：">
                  <el-input v-model="item.relative" placeholder="最高不能超过100%">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </template>
              <template v-else-if="item.closeType == 'f2f'">
                <el-form-item label="相对分成：">
                  <el-input v-model="item.relative" placeholder="最高不能超过100%">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item label="分成比例：">
                  <el-input class="input-with" v-model="item.live" :placeholder="`最高不能超过100%`">
                    <template slot="append">%</template>
                  </el-input>
                </el-form-item>
              </template>

              <el-form-item label="支付方式：">
                <el-checkbox-group v-model="item.storePayConfig">
                  <el-checkbox :label="key" v-for="(item, key) in config.pay_way">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <template v-for="(name, xcx) in config.xcx_pay.default">
                <view class="margin-top-lg margin-bottom-xs text-dfs">{{ name }}付费设置</view>
                <el-form-item :label="`${name}付费模式：`">
                  <el-radio-group v-model="item[`${xcx}PayMode`].modeType" size="medium">
                    <el-radio-button :label="item" v-for="(item, key) in config.mode_way.default" :disabled="key != 1">{{ key }}</el-radio-button>
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

                <el-form-item :label="`套餐设置：`" v-if="item[`${xcx}PayMode`]">
                  <div class="flex align-center flex-wrap" v-for="(plan, index) in item[`${xcx}PayMode`].list">
                    <el-select v-model="plan.time">
                      <el-option :label="`${time}小时`" :value="time" v-for="time in config[`plan_time`]"></el-option>
                    </el-select>
                    <el-input v-model="plan.money" class="flex1 ml-10 mr-10">
                      <template slot="append">元</template>
                    </el-input>
                    <el-button type="text" size="small" :disabled="item[`${xcx}PayMode`].list.length == 4" v-if="index == 0"
                      @click="item[`${xcx}PayMode`].list.push({time: 1, money: 2, tag: index + 1})">添加</el-button>
                    <el-button type="text" size="small" v-else
                      @click="item[`${xcx}PayMode`].list.splice(index, 1)" class="text-danger">删除</el-button>
                  </div>
                </el-form-item>
              </template>
            </template>
          </div>
          <el-form-item>
            <el-button class="mt-30 mb-10" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { bMapTransQQMap, qqMapTransBMap } from '@/utils/index'
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
    }
  },
  data() {
    return {
      rules: {
        shopName: [{
          required: true,
          message: '请填写商户名称',
          trigger: 'blur'
        }],
        address: [{
          required: true,
          message: '请填写商家地址',
          trigger: 'blur'
        }],
        userBindMoblie: [{
          required: true,
          message: '请填写手机号码作为登录账户',
          trigger: 'blur'
        }],
        catId: [{
          required: true,
          message: '请选择行业分类',
          trigger: 'blur'
        }],
        regionTag: [{
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
        regionTag: [],
        divisionMode: 1,
        avatar: '',
        loginPassword: '123456',
        lng: '',
        address: ''
      },
      powerInfo: {},
      fileList: [],
      selDevice: [],
      deviceDataArr: [],
      defaultDevice: {
        status: 1,
        closeType: 'real',
        storePayConfig: ['weixin', 'alipay'],
        weixinPayMode: {
          modeType: 'PACKAGE',
          list: [
            {
              time: 1,
              money: 2,
              tag: 1
            }
          ]
        },
        alipayPayMode: {
          modeType: 'PACKAGE',
          list: [
            {
              time: 1,
              money: 2,
              tag: 1
            }
          ]
        }
      },
      subShop: false
    }
  },
  mounted() {
    this.getOldCat()
    this.getCity()
    if (this.store_id > 0) {
      this.getInfo()
    } else {
      this.selDevice.push(this.myDevice[0].id)
      this.defaultDevice.deviceTypeId = this.myDevice[0].id
      this.deviceDataArr.push(this.defaultDevice)
    }
  },
  methods: {
    /**
     * 类型选择
     */
    changeDevice(selID){
      selID.map(id => {
        let idx = -1
        this.deviceDataArr.map((item, idx) => {
          if(item.id == id){
            idx = idx
            item.status = 1
          } else {
            item.status = 0
          }
        })
        if(idx == -1){
          this.defaultDevice.deviceTypeId = id
          this.deviceDataArr.push(this.defaultDevice)
        }
      })
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
      this.$get('iot-saas-basic/admin/regions').then(res => {
        let list = {}, regionTag = ''
        res.map(item => {
          if(item.level == 1){
            list[item.tag] = {
              value: item.tag,
              label: item.title,
              children: {}
            }
          }else if(item.level == 2){
            let tag = item.tag.substring(0, 3)
            list[tag].children[item.tag] = {
              value: item.tag,
              label: item.title,
              children: []
            }
          }else if(item.level == 3){
            regionTag = regionTag || item.tag
            let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
            list[tag1].children[tag2].children.push({
              value: item.tag,
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
        if(!this.store_id){
          this.$set(this.form, 'regionTag', regionTag)
        }
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
          storePayConfig[item.deviceTypeId] = payArr
          payConfigId[item.deviceTypeId] = item.id
        })
        res.storeDivisionFun.map(item => {
          item.alipayPayMode = item.alipayPayMode
          item.weixinPayMode = item.weixinPayMode
          item.storePayConfig = storePayConfig[item.deviceTypeId]
          item.status = 1
          item.payConfigId = payConfigId[item.deviceTypeId]
          deviceDataArr.push(item)
        })
        this.selDevice.push(deviceDataArr[0].deviceTypeId)
        this.deviceDataArr = deviceDataArr
        info.bindUserName = res.user.bindUserName
        info.userBindMoblie = res.user.mobile
        delete info.storeDivisionFun
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
      let url = 'iot-saas-basic/admin/store/save', deviceDataArr = this.deviceDataArr
      if (this.store_id > 0) {
        url = 'iot-saas-basic/admin/store/updateById'
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
          console.log(typeof params.catId)
          console.log(typeof params.regionTag)
          if(params.catId && typeof params.catId == 'array'){
            params.catId = params.catId[params.catId.length - 1]
          }
          if(params.regionTag && typeof params.regionTag == 'array'){
            params.regionTag = params.regionTag[params.regionTag.length - 1]
          }
          params.storePayConfig = []
          params.storeDivisionFun = []
          deviceDataArr.map(item => {
            let payConfig = {
              deviceTypeId: item.deviceTypeId
            }
            item.storePayConfig.map(item => {
              payConfig[item] = 1
            })
            if(item.payConfigId) payConfig.id = item.payConfigId
            params.storePayConfig.push(payConfig)
            let division = {
              closeType: item.closeType,
              deviceTypeId: item.deviceTypeId,
              alipayPayMode: item.alipayPayMode,
              weixinPayMode: item.weixinPayMode
            }
            if(item.id) division.id = item.id
            if(item.live >= 0) division.live = item.live
            if(item.relative >= 0) division.relative = item.relative
            if(item.live >= 0) division.promised = item.promised
            params.storeDivisionFun.push(division)
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
          this.formErrow(object)
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
