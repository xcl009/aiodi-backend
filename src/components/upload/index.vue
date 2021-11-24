<template>
  <div>
    <el-upload :action="`${baseURL}Image/uploadImage`" list-type="picture-card" :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove" :on-success="handleSuccess" :data="upObj" :file-list="fileList" name="file" :limit="limit" :multiple="multiple" :on-exceed="exceed">
      <i class="el-icon-plus"></i>
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
      limit: {
        type: Number,
        default: 1
      },

      multiple: {
        type: Boolean,
        default: false
      },

      fileList: {
        type: Array,
        default: []
      },

      ratio: {
        type: String,
        default: ''
      },
    },
    data() {
      return {
        baseURL: this.config.BASE_URL,
        dialogImageUrl: '',
        dialogVisible: false,
        percentage: 1,
        upObj: {
          token: getToken()
        },
        fileOk: {}
      }
    },
    methods: {
      /**
       * 图片上传调用接口成功 但上传不一定成功
       */
      handleSuccess(res, file, fileList){
        if(res.data.code > 0){
          file.status = 'error'
          this.$message.error(`图片上传失败:${res.data.message}, 请删除失败的图片重新上传`)
        } else {
          this.fileOk[file.uid] = res.data.file_url
          this.update()
        }
      },

      /**
       * 移除图片
       * @param {Object} file
       * @param {Object} fileList
       */
      handleRemove(file, fileList) {
        if(file.status == 'success'){
          delete this.fileOk[file.uid]
          this.update()
        }
      },

      /**
       * 预览图片
       * @param {Object} file
       */
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },

      /**
       * 文件超出限制
       */
      exceed(files, fileList){
        this.$message.error(`最多可上传${this.limit}个文件`)
      },

      update(){
        let fileOk = JSON.parse(JSON.stringify(this.fileOk))
        this.$emit('fileOk', Object.values(fileOk))
      }
    }
  }
</script>

<style scoped>
  .el-upload__tip{
    margin: 0 0 10px;
    line-height: initial;
  }
</style>
