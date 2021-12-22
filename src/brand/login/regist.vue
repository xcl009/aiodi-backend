<template>
  <div class="regist-content flex align-center justify-center bg-white">
    <div class="pb-30 text-center" v-if="step == 1">
      <h3 class="mb-10">选择您运营的项目</h3>
      <div class="mb-30 fs-s3">至少选择一个，可以多选</div>
      <div class="mb-30 flex flex-wrap">
        <div class="pl-20 pr-20 cursor" v-for="item in platform.device_type" @click="selDevice(item)">
          <div class="rel text-grey">
            <el-avatar :size="150" fit="cover" shape="square" :src="`/product/${item.depend_type}.jpg`"></el-avatar>
            <i class="abs el-icon-success fs-b3" v-bind:class="{'text-primary': selType.indexOf(item.depend_type) > -1}"></i>
          </div>
          <div class="mt-10">{{ item.depend_name }}</div>
        </div>
      </div>
      <el-button type="primary" round class="mb-40 mt-30 fs-b1" v-if="selType.length == 0">&nbsp;&nbsp;&nbsp;&nbsp;请选择运营项目&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
      <el-button type="primary" round class="mb-40 mt-30 fs-b1" v-else @click="step = 2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;下一步<i class="ml-5 el-icon-right fs-b1"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</el-button>

      <h4 class="mb-30">即将上线</h4>
      <div class="mb-30 flex flex-wrap justify-center">
        <div class="pl-20 pr-20 cursor" v-for="item in soon" @click="selDevice(item)">
          <div class="rel text-grey">
            <el-avatar :size="100" fit="cover" shape="square" :src="`/product/${item.depend_type}.jpg`"></el-avatar>
          </div>
          <div class="mt-10 fs-s3">{{ item.depend_name }}</div>
        </div>
      </div>
    </div>
    <div class="info-content pb-30 text-center" v-if="step == 2">
      <h3 class="mb-10">完善您的个人资料</h3>
      <div class="mb-30 fs-s3">方便我们进行更深入的合作</div>
      <div>
        <el-form ref="form" :model="form" label-width="0">
          <upload class="mb-20" v-model="form.avatar" />
          <el-form-item>
            <el-input v-model="form.company_name" placeholder="公司名称"/>
          </el-form-item>
          <el-form-item>
            <v-distpicker class="flex" :province="form.charge_province" :city="form.charge_city" :area="form.charge_county" @selected="selectCity"></v-distpicker>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.company_address" placeholder="公司地址"/>
          </el-form-item>

          <h4 class="pt-10 text-left">个人信息</h4>
          <el-form-item>
            <el-input v-model="form.name" placeholder="您的姓名"/>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.id_card" placeholder="您的身份证号码"/>
          </el-form-item>
        </el-form>
      </div>
      <div class="flex justify-center">
        <el-button type="info" round class="mb-30 mt-40 fs-b1" @click="step = 1"><i class="ml-5 el-icon-back fs-b1"></i>上一步</el-button>
        <el-button type="primary" round class="mb-30 mt-40 fs-b1" @click="editInfo()" :disabled="clickSubmit">&nbsp;&nbsp;&nbsp;&nbsp;开始试用&nbsp;&nbsp;&nbsp;&nbsp;</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import upload from '@/components/upload/two'
  import VDistpicker from '@/components/Distpicker'
  export default {
    name: 'regist',
    components: {
      upload,
      VDistpicker
    },
    data() {
      return {
        clickSubmit: false,
        platform: {},
        selType: [],
        step: 1,
        form: {},
        gid: this.$route.query.gid || '',

        soon: [
          {
            depend_type: 7,
            depend_name: '汽车充电桩',
          },
          {
            depend_type: 8,
            depend_name: '售卖机',
          },
          {
            depend_type: 9,
            depend_name: '洗车机',
          },
          {
            depend_type: 10,
            depend_name: '摇摇车',
          }
        ]
      }
    },
    mounted() {
      this.get_platform_config()
    },
    methods: {
      /**
       * 获取站点配置
       */
      get_platform_config(){
        let params = {
          'agent_id': this.gid || this.config.default_agent_id
        }
        this.$get('commonapi/get_platform_config', params).then(res => {
          this.platform = res
        })
      },

      /**
       * 选择设备类型
       */
      selDevice(item){
        if(this.selType.indexOf(item.depend_type) > -1){
          this.selType.splice(this.selType.indexOf(item.depend_type), 1)
        }else{
          this.selType.push(item.depend_type)
        }
      },

      /**
       * 选择区域
       */
      selectCity(e){
        this.form.province = e.province.value
        this.form.city = e.city.value
        this.form.county = e.area.value
      },

      /**
       * 提交资料
       */
      editInfo(){
        let params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        for(var i in this.selType){
          params['depend_type_' + this.selType[i]] = 1
        }
        this.loadObj = this.$loading({
          lock: true,
          text: '正在提交',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/ucenter/save_agent_self', params).then(res => {
          this.loadObj.close()
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          setTimeout(() => {
            location.href = '/home'
          }, 1000)
        }).catch( err => {
          this.clickSubmit = false
          this.loadObj.close()
        })
      }
    }
  }
</script>

<style lang="scss">
  .el-input__inner::-webkit-input-placeholder { /* WebKit browsers */
    color: #666;
  }
  .el-input__inner::-moz-placeholder { /* Mozilla Firefox 19+ */
    color: #666;
  }
  .el-input__inner::-ms-input-placeholder { /* Internet Explorer 10+ */
    color: #666;
  }
  .regist-content{
    width: 100vw;
    min-height: 100vh;

    .el-icon-success{
      bottom: 15px;
      right: 0;
    }

    .info-content{
      max-width: 500px;
      width: 100%;
    }

    .distpicker-address-wrapper{
      select{
        min-width: initial;
        flex: 1;
      }
    }
  }
</style>
