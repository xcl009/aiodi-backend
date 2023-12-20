<template>
  <div class="upload-container">
    <el-button :style="{ background: color, borderColor: color }" icon="el-icon-upload" size="mini" type="primary"
      @click="dialogVisible = true">
      {{ $t('components.uploadImg') }}
    </el-button>
    <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false">
      <el-upload :multiple="true" :file-list="fileList" :show-file-list="true" :on-remove="handleRemove"
        :on-success="handleSuccess" :before-upload="beforeUpload" :data="upObj"
        :action="`${baseURL}iot-saas-basic/open/aliyun/upload`" class="editor-slide-upload" list-type="picture-card">
        <el-button size="small" type="primary">
          {{ $t('components.selectImg') }}
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        {{ $t('public.cancel') }}
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ $t('public.confirm') }}
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
export default {
  name: 'EditorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data() {
    return {
      baseURL: this.config.BASE_URL,
      dialogVisible: false,
      listObj: {},
      fileList: [],
      upObj: {
        fileType: 'userAvatar',
        token: getToken()
      }
    }
  },
  methods: {
    checkAllSuccess() {
      return Object.keys(this.listObj).every(item => this.listObj[item].hasSuccess)
    },
    handleSubmit() {
      let that = this;
      const arr = Object.keys(this.listObj).map(v => this.listObj[v])
      if (!this.checkAllSuccess()) {
        this.$message(that.$t('components.message3'))
        return
      }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.dialogVisible = false
    },
    handleSuccess(response, file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.data.url
          this.listObj[objKeyArr[i]].hasSuccess = true
          return
        }
      }
    },
    handleRemove(file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]]
          return
        }
      }
    },
    beforeUpload(file) {
      const _self = this
      const _URL = window.URL || window.webkitURL
      const fileName = file.uid
      this.listObj[fileName] = {}
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = _URL.createObjectURL(file)
        img.onload = function () {
          _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
        }
        resolve(true)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;

  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>
