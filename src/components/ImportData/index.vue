<template>
  <upload :uploadText="uploadText" :name="name" :btnSize="btnSize" accept=".xls,.xlsx" :action="action[type]"
    @onSuccess="onSuccess" />
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
      default: ''
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
  mounted() {

  },
  methods: {
    /**
     * 监听成功
     */
    onSuccess(res) {
      this.$message({
        message: this.$t('components.importSuccessful'),
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.uploader-box {
  display: inline-block;
}
</style>
