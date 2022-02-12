<template>
  <div class="p-10">
    <el-row class="pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :rules="rules" :model="form" label-width="auto">
          <h4>商品信息</h4>
          <el-form-item label="商品图片：">
            <upload v-model="form.img_url" ratio="1:1"/>
          </el-form-item>
          <el-form-item ref="product_name" label="商品标题：" prop="product_name">
            <el-input v-model="form.product_name" placeholder="请填写商品标题" />
          </el-form-item>
          <el-form-item ref="product_title" label="副标题：" prop="product_title">
            <el-input v-model="form.product_title" placeholder="请填写副标题" />
          </el-form-item>
          <el-form-item ref="cost_price" label="成本价：" prop="cost_price">
            <el-input v-model="form.cost_price" placeholder="请填写成本价" />
          </el-form-item>
          <el-form-item ref="market_price" label="零售价：" prop="market_price">
            <el-input v-model="form.market_price" placeholder="请填写零售价" />
          </el-form-item>
          <el-form-item ref="stock_count" label="库存：" prop="stock_count">
            <el-input v-model="form.stock_count" placeholder="请填写库存" />
          </el-form-item>
          <el-form-item label="已售：">
            <el-input v-model="form.sold_count" placeholder="虚假的已售数量" />
          </el-form-item>
          <el-form-item label="状态:">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">注：开启表示上架，设备可关联此商品。</div>
          </el-form-item>
          <el-form-item label="商品详情：">
            <tinymce v-model="form.product_introduce" :height="300" />
          </el-form-item>

          <el-form-item>
            <el-button class="mt-10 mb-10" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">立即提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload/'
import Tinymce from '@/components/Tinymce'
export default {
  name: 'ShopCreate',
  components: {
    upload,
    Tinymce
  },
  data() {
    return {
      clickSubmit: false,
      form: {
        status: 1,
        product_title: '私密购买，非正品包退'
      },

      rules: {
        product_name: [{
          required: true,
          message: '请填写商品标题',
          trigger: 'blur'
        }],
        product_title: [{
          required: true,
          message: '请填写商品副标题',
          trigger: 'blur'
        }],
        cost_price: [{
          required: true,
          message: '请填写商品成本价',
          trigger: 'blur'
        }],
        market_price: [{
          required: true,
          message: '请填写商品零售价',
          trigger: 'blur'
        }],
        stock_count: [{
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
    if(this.id > 0) this.getInfo()
  },
  methods: {
    /**
     * 获取详情
     */
    getInfo() {
      this.$get('agentapi/product/sample_detail', {
        id: this.id
      }).then(res => {
        this.form = res
      })
    },

    /**
     * 提交资料
     * @param {String} formName
     */
    onSubmit(formName) {
      let url = 'agentapi/product/sample_save'
      this.clickSubmit = true
      this.$refs[formName].validate((valid, object) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          this.$post(url, params).then(res => {
            this.$message({
              message: '提交成功',
              type: 'success'
            })
            this.$router.push({
              path: '/condom/goods'
            })
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
  }
}
</script>

<style scoped>
</style>
