<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :xs="24" :sm="18" :md="16" :lg="12" :xl="10">
        <el-form ref="form" :rules="rules" :model="form" label-width="130px" label-position="left">
          <h4>商品信息</h4>
          <el-form-item ref="pictures" label="商品图片" prop="pictures">
            <upload v-model="form.pictures" :limit="5" />
          </el-form-item>
          <el-form-item ref="title" label="商品标题" prop="title">
            <el-input v-model="form.title" placeholder="请填写商品标题" />
          </el-form-item>
          <el-form-item ref="subhead" label="副标题" prop="subhead">
            <el-input v-model="form.subhead" placeholder="请填写副标题" />
          </el-form-item>
          <el-form-item ref="costPrice" label="成本价" prop="costPrice">
            <el-input v-model="form.costPrice" placeholder="请填写成本价" />
          </el-form-item>
          <el-form-item ref="retailPrice" label="零售价" prop="retailPrice">
            <el-input v-model="form.retailPrice" placeholder="请填写零售价" />
          </el-form-item>
          <el-form-item ref="stock" label="库存" prop="stock">
            <el-input v-model="form.stock" placeholder="请填写库存" />
          </el-form-item>
          <el-form-item label="已售">
            <el-input v-model="form.saleNum" placeholder="虚假的已售数量" />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch v-model="form.status" active-value="ENABLE" inactive-value="CLOSE" />
            <div class="fs-s2 text-gray">注：开启表示上架。</div>
          </el-form-item>
          <el-form-item label="商品详情">
            <tinymce v-model="form.description" :height="300" />
          </el-form-item>
          <el-form-item>
            <el-button class="mt-10 mb-10" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交
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
        form: {
          pictures: [],
          subhead: '私密购买，非正品包退',
          status: 'ENABLE'
        },
        rules: {
          // pictures: [{
          //   required: true,
          //   message: '请最少上传一张商品图片',
          //   trigger: 'blur'
          // }],
          title: [{
            required: true,
            message: '请填写商品标题',
            trigger: 'blur'
          }],
          subhead: [{
            required: true,
            message: '请填写商品副标题',
            trigger: 'blur'
          }],
          costPrice: [{
            required: true,
            message: '请填写商品成本价',
            trigger: 'blur'
          }],
          retailPrice: [{
            required: true,
            message: '请填写商品零售价',
            trigger: 'blur'
          }],
          stock: [{
            required: true,
            message: '请填写商品库存',
            trigger: 'blur'
          }]
        },
        id: this.$route.query.id || ''
      }
    },
    computed: {
      siteInfo() {
        const siteInfo = this.$store.getters.siteInfo
        return siteInfo
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
                message: '提交成功',
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
            this.formErrow(object)
            this.clickSubmit = false
          }
        })
      },
    }
  }
</script>

<style scoped>
</style>
