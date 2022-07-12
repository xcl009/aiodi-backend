<template>
  <upload :uploadText="uploadText" :name="name" :btnSize="btnSize" accept=".xls,.xlsx" :action="action[type]"/>
</template>
<script>
  import upload from '@/components/upload'
  export default {
    components: {
      upload
    },
    props: {
      /**
       * type 1 导入设备  2 导入代理  3 导入商户
       */
      type: {
        type: Number,
        default: 1
      },

      uploadText: {
        type: String,
        default: '导入设备'
      },

      name: {
        type: String,
        default: 'file'
      },

      btnSize: {
        type: String,
        default: 'small'
      }
    },
    data() {
      return {
        action: {
          1: 'iot-saas-device/admin/device/import',
          2: 'iot-saas-basic/admin/agent/upload',
          3: 'iot-saas-basic/admin/store/upload'
        },
        baseURL: this.config.BASE_URL,
      }
    },
    mounted(){
      
    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>
  .uploader-box{
    display: inline-block;
  }
</style>
