<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="130px" label-position="left">
          <h4>{{ $t('goods.commodityInformation') }}</h4>
          <el-form-item ref="pictures" :label="$t('shopping.commodityPicture')" prop="pictures">
            <upload v-model="form.pictures" :limit="5" />
          </el-form-item>
          <el-form-item ref="title" :label="$t('goods.productTitle')" prop="title">
            <el-input v-model="form.title" :placeholder="$t('goods.productTitleText')" />
          </el-form-item>
          <el-form-item ref="subhead" :label="$t('goods.subtitle')" prop="subhead">
            <el-input v-model="form.subhead" :placeholder="$t('goods.subtitleText')" />
          </el-form-item>
          <el-form-item ref="costPrice" :label="$t('goods.costPrice')" prop="costPrice">
            <el-input type="number" v-model="form.costPrice" :placeholder="$t('goods.costPriceText')" />
          </el-form-item>
          <el-form-item ref="retailPrice" :label="$t('goods.retailPrice')" prop="retailPrice">
            <el-input type="number" v-model="form.retailPrice" :placeholder="$t('goods.retailPriceText')" />
          </el-form-item>
          <el-form-item ref="stock" :label="$t('public.inventory')" prop="stock">
            <el-input type="number" v-model="form.stock" :placeholder="$t('shopping.pleaseInventory')" />
          </el-form-item>
          <el-form-item :label="$t('goods.saleNum')">
            <el-input type="number" v-model="form.saleNum" :placeholder="$t('goods.saleNumText')" />
          </el-form-item>
          <el-form-item :label="$t('public.status')">
            <el-switch v-model="form.status" active-value="ENABLE" inactive-value="CLOSE" />
            <div class="fs-s2 text-gray">{{ $t('goods.text2') }}</div>
          </el-form-item>
          <el-form-item :label="$t('shopping.productDetails')">
            <tinymce v-model="form.description" :height="300" />
          </el-form-item>
          <el-form-item>
            <el-button class="mt-10 mb-10" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{ $t('public.submitNow') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload'
  import Tinymce from '@/components/Tinymce'
  export default {
    name: 'addGoods',
    components: {
      upload,
      Tinymce
    },
    data() {
      return {
        clickSubmit: false,
        id: this.$route.query.id || '',
        form: {
          pictures: [],
          subhead: this.$t('goods.dataText'),
          status: 'ENABLE'
        },
      }
    },
    computed: {
      siteInfo() {
        const siteInfo = this.$store.getters.siteInfo
        return siteInfo
      },
      rules(){
        return {
          // pictures: [{
          //   required: true,
          //   message: '请最少上传一张商品图片',
          //   trigger: 'blur'
          // }],
          title: [{
            required: true,
            message: this.$t('goods.productTitleText'),
            trigger: 'blur'
          }],
          subhead: [{
            required: true,
            message: this.$t('goods.subtitleText'),
            trigger: 'blur'
          }],
          costPrice: [{
            required: true,
            message: this.$t('goods.costPriceText'),
            trigger: 'blur'
          }],
          retailPrice: [{
            required: true,
            message: this.$t('goods.retailPriceText'),
            trigger: 'blur'
          }],
          stock: [{
            required: true,
            message: this.$t('goods.dataText1'),
            trigger: 'blur'
          }]
        }
      }
    },
    mounted() {
      if (this.id) this.getInfo()
    },
    methods: {
      /**
       * 获取详情
       */
      getInfo() {
        this.$get(`iot-saas-device/admin/merchandise/${this.id}`).then(res => {
          let pictures = []
          res.pictures = res.pictures || []
          res.pictures.map((item, idx) => {
            pictures.push({
              name: `${idx}.jpg`,
              url: item,
            })
          })
          res.pictures = pictures
          this.form = res
        })
      },

      /**
       * 提交资料
       * @param {String} formName
       */
      onSubmit(formName) {
        let that = this;
        let type = '$post'
        this.clickSubmit = true
        this.$refs[formName].validate((valid, object) => {
          if (valid) {
            const params = JSON.parse(JSON.stringify(this.form))
            let pictures = []
            if(params.pictures.length > 0){
              params.pictures.map(item => {
                pictures.push(item.url)
              })
              params.pictures = pictures
            }
            if (this.id) {
              params.id = this.id
              type = '$put'
            }
            this[type]('iot-saas-device/admin/merchandise', params).then(res => {
              this.$message({
                message: that.$t('public.submittedSuccess'),
                type: 'success'
              })
              this.$router.push({
                path: '/goods'
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
    }
  }
</script>

<style scoped>
</style>
