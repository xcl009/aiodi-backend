<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table :data="list" stripe highlight-current-row>
        <el-table-column label="标题">
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="标识">
          <template slot-scope="scope">
            {{ scope.row.tag }}
          </template>
        </el-table-column>
        <el-table-column label="内容">
          <template slot-scope="scope">
            {{ scope.row.tval }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="editDialog = true, editObj = JSON.parse(JSON.stringify(scope.row))">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="编辑配置" :visible.sync="editDialog">
      <el-form label-width="130px">
        <el-form-item label="标题：">
          <el-input v-model="editObj.title"></el-input>
        </el-form-item>
        <el-form-item label="内容：">
          <el-input v-model="editObj.tval" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="postEdit()" :disabled="clickSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'alink',
    components: {

    },
    data() {
      return {
        list: [

        ],
        clickSubmit: false,
        editDialog: false,
        editObj: {}
      }
    },
    computed: {

    },
    mounted() {
      this.getConfig()
    },
    methods: {
      /**
       * 获取配置
       */
      getConfig(){
        this.$get('WxOpen/getConfigs').then(res => {
          this.list = Object.values(res)
        })
      },

      /**
       * 提交修改
       */
      postEdit(){
        if(this.clickSubmit) return
        this.clickSubmit = false
        this.$post('WxOpen/editConfig', this.editObj).then(res => {
          this.editDialog = false
          this.getConfig()
          this.$message({
            message: '修改成功',
            type: 'success'
          })
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
