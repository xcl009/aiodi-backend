<template>
  <div class="p-10">
    <div class="p-10 bg-white">
      <el-table :data="list" stripe highlight-current-row :row-style="tableStyle">
        <el-table-column label="分享名称">
          <template slot-scope="scope">
            {{ scope.row.share_name }}
          </template>
        </el-table-column>
        <el-table-column label="分享标题">
          <template slot-scope="scope">
            {{ scope.row.share_title }}
          </template>
        </el-table-column>
        <el-table-column label="分享图片">
          <template slot-scope="scope">
            <el-image style="width: 75px; height: 60px" :src="scope.row.img_url" fit="fill" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="showDialog(scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="`${shareInfo.share_name}分享设置`" :visible.sync="shareDialog">
      <el-form label-width="auto">
        <el-form-item label="分享图片：">
          <upload :file-list="fileList" ratio="5:4" @fileOk="fileOk" />
          <el-input class="abs" v-model="img_url" type="hidden"/>
        </el-form-item>
        <el-form-item label="分享标题：">
          <el-input v-model="share_title" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shareDialog = false">取 消</el-button>
        <el-button type="primary" @click="postEdit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import upload from '@/components/upload'
  export default {
    components: {
      upload
    },
    name: 'share',
    data() {
      return {
        list: [],
        shareDialog: false,
        shareInfo: {},
        fileList: [],
        share_title: '',
        img_url: '',
        share_id: ''
      }
    },
    computed: {
      deviceNameObj(){
        return Object.values(this.$store.state.user.deviceNameObj)
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        this.$get('agentapi/system/mini_share').then(res => {
          this.list = res
        })
      },

      /**
       * 是否隐藏洗衣机分享设置
       */
      tableStyle(row){
        if(this.deviceNameObj.indexOf(4) == -1 && row.row.id == 3){
          return { 'display' : 'none' }
        }
      },

      showDialog(row){
        this.shareDialog = true
        this.share_id = row.id
        this.share_title = row.share_title
        this.img_url = row.img_url
        this.fileList = [{
          url: row.img_url
        }]
        this.shareInfo = row
      },

      /**
       * 修改分享信息
       */
      postEdit(){
        let params = {}, shareInfo = this.shareInfo
        params[`share_title_${this.share_id}`] = this.share_title
        params[`share_imgurl_${this.share_id}`] = this.img_url
        this.$post('agentapi/system/mini_share', params).then(res => {
          this.shareDialog = false
          this.shareInfo.share_title = this.share_title
          this.shareInfo.img_url = this.img_url
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      },

      /**
       * 上传文件成功通知
       */
      fileOk(arr){
        this.img_url = arr[0] || ''
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
