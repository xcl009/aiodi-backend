<template>
  <div class="uploader-box">
    <el-upload class="avatar-uploader" :action="`${baseURL}${action}`" :before-upload="beforeUpload" :on-remove="handleRemove" :on-success="handleSuccess" :on-error="handleError" :data="upObj" :headers="headers" :accept="accept" :show-file-list="false" :name="name" :multiple="multiple" v-if="limit == 1">
      <template v-if="uploadText">
        <el-button type="primary" :size="btnSize">{{ uploadText }}<i class="el-icon-upload2 el-icon--right"></i></el-button>
      </template>
      <template v-else>
        <el-image class="abs el-avatar_up" shape="square" fit="cover" :src="value" v-if="value"></el-image>
        <i class="rel el-icon-plus avatar-uploader-icon"></i>
      </template>
    </el-upload>
    <el-upload class="avatar-uploader" list-type="picture-card" :action="`${baseURL}${action}`" :before-upload="beforeUpload" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :on-success="handleSuccess" :on-error="handleError" :data="upObj" :headers="headers" :accept="accept" :file-list="value" :name="name" :limit="limit" :multiple="multiple" :on-exceed="exceed" v-else>
      <i class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <div class="el-upload__tip" v-if="ratio">尺寸比例：{{ ratio }}</div>
  </div>
</template>

<script>
  import { getToken } from '@/utils/auth'
  export default {
    name: 'upload',
    props: {
      value: '',

      limit: {
        type: Number,
        default: 1
      },

      multiple: {
        type: Boolean,
        default: false
      },

      action: {
        type: String,
        default: 'iot-saas-admin/open/aliyun/upload'
      },

      ratio: {
        type: String,
        default: ''
      },

      raw: {
        type: Boolean,
        default: false
      },

      uploadText: {
        type: String,
        default: ''
      },

      name: {
        type: String,
        default: 'file'
      },

      accept: {
        type: String,
        default: '.jpg,jpeg,.png,.gif,.tif,.eps,.bmp,.webp,.pcx,.svg'
      },

      btnSize: {
        type: String,
        default: 'small'
      },

      upObj: {
        type: Object,
        default (){
          return {
            fileType: 'userAvatar'
          }
        }
      }
    },
    data() {
      return {
        baseURL: this.config.BASE_URL,
        dialogImageUrl: '',
        dialogVisible: false,
        percentage: 1,
        rawUrl: '',
        headers: {
          Authorization: getToken()
        }
      }
    },
    mounted(){
    },
    methods: {
      /**
       * 图片上传之前
       */
      beforeUpload(file){
        const isLt8M = file.size / 1024 / 1024 < 9
        if(!isLt8M) {
          this.$message({
            message: '上传文件大小不能超过8M!',
            type: 'error'
          })
          return false
        }
        if(this.raw){
          let rawUrl = null
          if (window.createObjectURL != undefined) {
            // basic
            rawUrl = window.createObjectURL(file)
          } else if (window.URL != undefined) {
            // mozilla(firefox)
            rawUrl = window.URL.createObjectURL(file)
          } else if (window.webkitURL != undefined) {
            // webkit or chrome
            rawUrl = window.webkitURL.createObjectURL(file)
          }
          this.rawUrl = rawUrl
          this.$emit('getFile', file)
          return false
        }
      },

      /**
       * 图片上传调用接口成功 但上传不一定成功
       */
      handleSuccess(res, file, fileList){
        if(res.code != 200){
          file.status = 'error'
          this.$message.error(`图片上传失败:${res.data.message}, 请删除失败的图片重新上传`)
        } else {
          if(this.$listeners['onSuccess']){
            this.$emit('onSuccess', res)
          }else if(res.data){
            if(res.data.url) fileList[fileList.length - 1].url = res.data.url
            if(res.data.ossFileKey) fileList[fileList.length - 1].ossFileKey = res.data.ossFileKey
            this.update(fileList)
          } else {
            this.$message({
              message: '上传成功但data为空!',
              type: 'success'
            })
          }
        }
      },

      /**
       * 上传失败
       */
      handleError(error){
        let err = JSON.parse(error.message)
        this.$message({
          message: err.message || '上传失败',
          type: 'error'
        })
      },

      /**
       * 移除图片
       * @param {Object} file
       * @param {Object} fileList
       */
      handleRemove(file, fileList) {
        if(file.status == 'success'){
          this.update(fileList)
        }
      },

      /**
       * 预览图片
       * @param {Object} file
       */
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      },

      /**
       * 文件超出限制
       */
      exceed(files, fileList){
        this.$message.error(`最多可上传${this.limit}个文件`)
      },

      update(fileList){
        if(this.limit == 1){
          let l = fileList.length - 1
          this.$emit('input', fileList[l] ? fileList[l].url : fileList[0].url)
        } else {
          this.$emit('input', fileList)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  .avatar-uploader {
    /deep/ .el-upload{
      cursor: pointer;
      position: relative;
      background: #F2F3F5;
      .el-image{
        border-radius: 6px;
      }
    }
    .avatar-uploader-icon {
      width: 100px;
      height: 100px;
      line-height: 100px;
      border: 1px dashed #E5E6EB;
      border-radius: 6px;
      font-size: 28px;
      color: #8c939d;
      text-align: center;
      &:hover {
        border-color: var(--olive);
      }
    }
    .el-avatar_up{
      width: 100%;
      height: 100%;
    }
    .el-avatar{
      background: none;
    }
    /deep/ .el-upload--picture-card{
      width: 100px;
      height: 100px;
      line-height: inherit;}
    /deep/ .el-upload-list__item{
      width: 100px;
      height: 100px;
    }
  }
  .el-upload__tip{
    line-height: initial;
  }
</style>
