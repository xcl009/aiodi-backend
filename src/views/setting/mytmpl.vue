<template>
  <div class="p-10">
    <div class="p-10 bg-white">
      <el-table :data="list" stripe highlight-current-row :row-style="tableStyle">
        <el-table-column label="标题" width="200">
          <template slot-scope="scope">
            {{ scope.row.mould_name }}
          </template>
        </el-table-column>
        <el-table-column label="使用详情">
          <template slot-scope="scope">
            {{ scope.row.mould_desc }}
          </template>
        </el-table-column>
        <el-table-column label="关键词">
          <template slot-scope="scope">
            <span v-for="item in scope.row.filed_data">{{ item.field_title }}，</span>
          </template>
        </el-table-column>
        <el-table-column label="模板ID">
          <template slot-scope="scope">
            {{ scope.row.template_id }}
          </template>
        </el-table-column>
        <el-table-column label="appid">
          <template slot-scope="scope">
            {{ scope.row.appid }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template slot-scope="scope">
            {{ scope.row.type == 0 ? '一次性订阅' : scope.row.type == 1 ? '公众号模板消息' : ''}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="tempDialog = true; tempInfo = scope.row; appid =  scope.row.appid; template_id = scope.row.template_id">设置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="模板消息" :visible.sync="tempDialog">
      <el-form label-width="auto">
        <el-form-item :label="`${tempInfo.mould_name}模板ID：`">
          <el-input v-model="template_id" />
        </el-form-item>
        <el-form-item :label="`${tempInfo.mould_name}appid：`">
          <el-input v-model="appid" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="tempDialog = false">取 消</el-button>
        <el-button type="primary" @click="editID()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'mytempl',
    data() {
      return {
        list: [],
        tempDialog: false,
        tempInfo: {},
        template_id: '',
        appid: ''
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
        this.$get('agentapi/system/news_mould').then(res => {
          this.list = res
        })
      },

      /**
       * 是否隐藏洗衣机分享设置
       */
      tableStyle(row){
        if(row.row.mould_type < 20 && this.deviceNameObj.indexOf(row.row.mould_type) == -1){
          return { 'display' : 'none' }
        }
      },

      /**
       * 修改模板ID
       */
      editID(){
        let params = {}, tempInfo = this.tempInfo
        params[`mould_template_id_${tempInfo.mould_id}`] = this.template_id
        params.appid = this.appid
        this.$post('agentapi/system/news_mould', params).then(res => {
          this.tempDialog = false
          this.tempInfo.template_id = this.template_id
          this.tempInfo.appid = this.appid
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
