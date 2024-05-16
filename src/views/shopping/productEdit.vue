<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="12" :lg="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="120px" label-position="left">
          <h4>{{ $t('public.basicInformation') }}</h4>
          <el-form-item :label="$t('public.deviceType')" prop="deviceTypeCode">
            <el-radio-group v-model="form.deviceTypeCode" prop="deviceTypeCode" class="pl-10">
              <el-radio v-for="(name, code) in myDeviceId" :label="code" class="raiod_margin">{{ name
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item ref="pictures" :label="$t('shopping.commodityPicture')" prop="productUrlList">
            <upload v-model="form.productUrlList" :limit="1" />
          </el-form-item>
          <el-form-item :label="$t('shopping.productName')" prop="productName">
            <el-input v-model="form.productName" :placeholder="$t('shopping.productNameText')" />
          </el-form-item>
          <el-form-item :label="$t('shopping.characteristics')" prop="productContent">
            <el-input v-model="form.productContent" :placeholder="$t('shopping.characteristicsText')" />
            <div class="message ">{{ $t('shopping.characteristicsMessage') }}</div>
          </el-form-item>
          <el-form-item :label="$t('shopping.factorySelection')" prop="factoryId">
            <el-select v-model="form.factoryId" :placeholder="$t('public.pleaseSelect')">
              <el-option v-for="(item, index) in plantList" :key="index" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="品牌商" prop="brandId">
                        <el-select v-model="form.brandId" placeholder="请选择">
                            <el-option v-for="(item, index) in brandList" :key="index" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item> -->
          <el-form-item :label="$t('shopping.productDetails')">
            <tinymce ref="rContent" v-model="form.productDetail" :height="300" />
          </el-form-item>
          <el-form-item :label="$t('shopping.detailedIntroduction')" prop="productRemark">
            <div v-for="(item, index) in form.productRemark" class="flex_j mark_box">
              <el-input v-model="item.text" :placeholder="$t('shopping.warrantyPeriod')" />
              <el-input v-model="item.text1" :placeholder="$t('shopping.oneYear')" class="ml-10" />
              <div class="m_l_a right_add" @click="addmarkChange()" v-if="index == 0">
                {{ $t('public.newlyAdded') }}
              </div>
              <div class="m_l_a right_add delete" @click="deleteChange(index, 1)" v-if="index > 0">
                {{ $t('public.delete') }}
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="$t('shopping.prices')" prop="productStandardList">
            <div v-for="(item, index) in form.productStandardList" class="flex_j mark_box">
              <el-input v-model="item.number" :placeholder="$t('shopping.pricesText')" />
              <el-input v-model="item.price" :placeholder="$t('shopping.pricesText1')" class="ml-10" />
              <span>{{ siteInfo.currencySymbol }}/{{ $t('public.tower') }}</span>
              <span>{{ $t('shopping.minimumPurchase') }}</span>
              <el-input v-model="item.min" :placeholder="$t('shopping.minimumPurchaseText')" class="ml-10" />
              <span>{{ $t('public.tower') }}，{{ $t('shopping.highestPurchase') }}</span>
              <el-input v-model="item.max" :placeholder="$t('shopping.highestPurchaseText')" class="ml-10" />
              <span>{{ $t('public.tower') }}</span>
              <el-input v-model="item.positionQty" :placeholder="$t('shopping.bankPorts')" class="ml-10"
                v-if="['PA'].indexOf(form.deviceTypeCode) > -1" />
              <el-input v-model="item.positionQty" :placeholder="$t('shopping.numberOfWarehouses')" class="ml-10"
                v-if="['VM'].indexOf(form.deviceTypeCode) > -1" />
              <el-input v-model="item.merchandiseQty" :placeholder="$t('shopping.numberOfProductsPerUnit')" class="ml-10"
                v-if="['VM'].indexOf(form.deviceTypeCode) > -1" />
              <div class="m_l_a right_add" @click="addsizeChange()" v-if="index == 0">
                {{ $t('public.newlyAdded') }}
              </div>
              <div class="m_l_a right_add delete" @click="deleteChange(index, 2)" v-if="index > 0">
                {{ $t('public.delete') }}
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submit')
            }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload'
import {
  pickKeys,
  currentTime
} from '@/utils/index'
import Tinymce from '@/components/Tinymce/'
export default {
  components: {
    upload,
    Tinymce
  },
  data() {
    return {
      tinymceDescID: `app_desc_${currentTime()}`,
      tinymceFulID: `app_ful_${currentTime()}`,
      clickSubmit: false,
      form: {
        deviceTypeCode: '',
        productName: '',
        productUrlList: '',
        productContent: '',
        factoryId: '',
        productRemark: [{
          text: '',
          text1: ''
        }],
        productStandardList: [{
          number: '',
          price: '',
        }],
        productDetail: '',
      },
      plantList: [],
      brandList: [],
    }
  },
  computed: {
    myDeviceId() {
      return this.$store.getters.myDeviceId
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    rules() {
      return {
        deviceTypeCode: [{
          required: true,
          message: this.$t('shopping.pleaseDeviceType'),
          trigger: 'change'
        }],
        productName: [{
          required: true,
          message: this.$t('shopping.pleaseStoreName'),
          trigger: 'blur'
        }],
        productUrlList: [{
          required: true,
          message: this.$t('shopping.pleaseStoreImg'),
          trigger: 'blur'
        }],
        productContent: [{
          required: true,
          message: this.$t('shopping.pleaseDeviceCharacteristic'),
          trigger: 'blur'
        }],
        factoryId: [{
          required: true,
          message: this.$t('shopping.pleaseSelectFactory'),
          trigger: 'blur'
        }],
        productRemark: [{
          required: true,
          message: this.$t('shopping.pleaseDetailed'),
          trigger: 'blur'
        }],
        productStandardList: [{
          required: true,
          message: this.$t('shopping.pleasePrice'),
          trigger: 'blur'
        }],
      }
    }
  },
  mounted() {
    this.getplantList()
    //this.getbrandList()
    let id = this.$route.query.id
    if (id) this.getList(id)
  },
  methods: {
    deleteChange(index, type) {
      if (type == 2) {
        this.form.productStandardList.splice(index, 1);
      } else {
        this.form.productRemark.splice(index, 1);
      }

    },

    // 获取详情数据
    getList(id) {
      this.$get(`iot-saas-order/admin/product/detail/${id}`, {
        id: id
      }).then(res => {
        this.form = res;
        this.form.productUrlList = res.productUrlList.join(',');
        this.plantList.forEach(list => {
          console.log(list.id, res.factoryCode)
          if (list.factoryCode == res.factoryCode) {
            this.form.factoryId = list.name;
          }
        })
        this.form.productRemark = JSON.parse(this.form.productRemark);
        this.$nextTick(() => {
          this.$refs['rContent'].setContent(this.form.productDetail);
        })

      }).catch(() => { })
    },
    addmarkChange() {
      let obj = {
        text: '',
        text1: '',
      }
      this.form.productRemark.push(obj);
    },
    addsizeChange() {
      let obj = {
        number: '',
        price: '',
      }
      this.form.productStandardList.push(obj);
      console.log()
    },
    /**
     * 提交
     * @param {Object} formName
     */
    onSubmit(formName) {
      let that = this;
      let params = JSON.parse(JSON.stringify(this.form)),
        url = 'iot-saas-order/admin/product/save'
      if (Array.isArray(params.province) && params.province.length > 0) {
        params.district = params.province[2]
        params.city = params.province[1]
        params.province = params.province[0]
      }
      params.productRemark = JSON.stringify(params.productRemark);
      this.plantList.forEach(res => {
        if (this.form.factoryId == res.id) {
          params.factoryCode = res.code;
        }
      })
      this.clickSubmit = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (params.id > 0) {
            url = `iot-saas-order/admin/product/update/${params.id}`
            // params.factoryId = params.id;
            // params.productUrlList = params.productUrlList.join(',')
          }
          this.$post(url, params).then(res => {
            this.$message({
              message: that.$t('public.submittedSuccess'),
              type: 'success'
            })
            this.$router.push({
              path: '/shopping/product'
            })
          }).catch(err => {
            setTimeout(() => {
              this.clickSubmit = false
            }, 1000)
          })
        } else {
          this.clickSubmit = false
        }
      })
    },

    /**
     * 获取工厂列表
     */
    getplantList() {
      const params = {};
      this.$get('iot-saas-basic/admin/factory/list', params).then(res => {
        this.plantList = res;
      }).catch(() => { })
    },
    /**
     * 获取品牌列表
     */
    getbrandList() {
      let params = {
        page: 0,
        size: 100,
      }
      this.$get('iot-saas-basic/admin/brand/findPage', params).then(res => {
        this.brandList = res.rows
      }).catch(() => { })
    },
  }
}
</script>

<style scoped>
.el-radio {
  margin-top: 10px;
}

.message {
  color: #ccc;
  font-size: 12px;
  line-height: 20px;
}

.mark_box {
  position: relative;
}

.mark_box span {
  flex-shrink: 0;
  margin-left: 10px;
}

.right_add {
  position: absolute;
  right: -48px;
  top: 0;
  margin-left: 10px;
  flex-shrink: 0;
  color: #165DFF;
}

.delete {
  color: #e54d42;
}
</style>
