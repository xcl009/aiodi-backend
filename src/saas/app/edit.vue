<template>
  <el-row class="pt-30 pl-30 pr-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="12" :lg="10">
      <el-form ref="form" :rules="rules" :model="form" label-width="auto">
        <el-form-item label="服务类型">
          <el-select placeholder="选择服务类型" v-model="form.iotServiceTypeId">
            <el-option label="品类" value="1" />
            <el-option label="系统服务" value="2" />
            <el-option label="定制服务" value="951819034354622467" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select placeholder="选择设备类型" v-model="form.deviceTypeId">
            <el-option v-for="item in myDevice" :label="item.name" :value="item.id">{{ item.name }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input v-model="form.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="服务详情">
          <tinymce v-model="form.description" :height="300" />
        </el-form-item>
        <el-form-item label="服务案例">
          <tinymce v-model="form.successfulCase" :height="300" />
        </el-form-item>
        <el-form-item label="图片详情" class="up-img">
          <upload v-model="form.picRefIds" :limit="5" />
        </el-form-item>
        <el-form-item label="教程链接">
          <el-input v-model="form.link" placeholder="请输入教程链接" />
        </el-form-item>
        <el-form-item label="需求来源">
          <el-input v-model="form.source" placeholder="请输入需求来源" />
        </el-form-item>
        <el-form-item label="价格设置">
          <div class="mb-10 flex align-center" v-for="(item, index) in form.priceSettings">
            <el-input v-model="item.priceType" class="mr-10" placeholder="套餐名称"></el-input>
            <el-input v-model="item.monthAmount" class="mr-10">
              <template slot="append">元/月</template>
            </el-input>
            <el-input v-model="item.yearAmount" class="mr-10">
              <template slot="append">元/年</template>
            </el-input>
            <el-input v-model="item.permanentAmout" class="mr-10">
              <template slot="append">元/永久</template>
            </el-input>
            <el-button type="text" size="small" :disabled="form.priceSettings.length == 4" v-if="index == 0"
              @click="form.priceSettings.push({})">添加</el-button>
            <el-button type="text" size="small" v-else
              @click="form.priceSettings.splice(index, 1)" class="text-danger">删除</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import upload from '@/components/upload'
  import Tinymce from '@/components/Tinymce'
  export default {
    components: {
      upload,
      Tinymce
    },
    data() {
      return {
        clickSubmit: false,
        form: {
          priceSettings: [
            {}
          ],
          picRefIds: []
        },
        rules: {
          iotServiceTypeId: [
            { required: true, message: '请选择服务类型', trigger: 'change' }
          ]
        },
        powerInfo: {},
        role: [],
        id: '',

        id: this.$route.params.id
      }
    },
    computed: {
      myDevice() {
        return this.$store.getters.myDevice
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 获取商户信息
       */
      getInfo() {
        this.$get('agentapi/edit_agent', {
          son_id: this.id
        }).then(res => {
          let info = res.agent_info
          delete info.password
          if(this.siteInfo.agent_withdraw_fee_type != 2) info.agent_withdraw_fee_type = this.siteInfo.agent_withdraw_fee_type
          info.old_steal_order_right = info.steal_order_right
          if(this.powerInfo.steal_order_right == 0) info.steal_order_right = 0
          this.form = info
        })
      },

      onSubmit(formName) {
        let params = JSON.parse(JSON.stringify(this.form)), url = 'iot-saas-basic/admin/iotservice', profit_key = this.config.profit_key
        this.clickSubmit = true
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(params.picRefIds && params.picRefIds.length > 0){
              let picRefIds = []
              params.picRefIds.map(item => {
                picRefIds.push(item.url)
              })
              params.picRefIds = picRefIds.join(',')
            }
            if(this.id > 0){
              url = 'admin/iotservice/updateById'
            }
            this.$post(url, params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.$router.push({
                path: '/app/market'
              })
            }).catch( err => {
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
       * 选择区域
       */
      selectCity(e){
        this.form.province = e.province.value
        this.form.city = e.city.value
        this.form.county = e.area.value
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
