<template>
  <div>
    <div class="p-15 bg-white">
      <div class="mb-15" v-if="isSaas()">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="showDialog()">添加广告位置</el-button>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row>
        <el-table-column label="广告位置">
          <template slot-scope="scope">
            <div>{{ scope.row.position }}</div>
          </template>
        </el-table-column>
        <el-table-column label="广告位置名称">
          <template slot-scope="scope">
            <div>{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column label="广告类型">
          <template slot-scope="scope">
            <div>{{ scope.row.positionTypeName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showDialog(scope.row)" v-if="isSaas()">编辑</el-button>
            <el-button type="danger" size="mini" @click="del(scope.row, scope.$index)" v-if="isSaas()">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="编辑广告位置" :visible.sync="dialogStatus" :center="true" width="600px">
      <el-form label-width="130px">
        <el-form-item label="广告类型">
          <div>{{ advertTypeName }}</div>
        </el-form-item>
        <el-form-item label="广告位置">
          <el-input v-model="form.position" placeholder="如:PL001"/>
        </el-form-item>
        <el-form-item label="广告位置名称">
          <el-input v-model="form.title" placeholder=""/>
        </el-form-item>
        <el-form-item label="广告类型">
          <el-select v-model="form.positionType">
            <el-option :label="item" :value="index" v-for="(item, index) in positionType" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStatus = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit()" :disabled="clickSubmit">{{ clickSubmit ? '提交中' : '确 定'}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'weChatAdList',
    components: {

    },
    data() {
      return {
        category: this.$route.query.category,
        advertTypeCode: this.$route.query.advertTypeCode,
        advertTypeName: this.$route.query.advertTypeName,
        list: [],
        listLoading: true,
        positionType: {
          PICTURE: '图片广告'
        },
        dialogStatus: false,
        form: {},
        clickSubmit: false
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
        this.$get(`iot-saas-advert/admin/advert/position/find`, {
          category: this.category,
          advertTypeCode: this.advertTypeCode
        }).then(res => {
          this.listLoading = false
          this.list = res
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 显示dialog
       */
      showDialog(row = { positionType: 'PICTURE'}){
        this.row = row
        this.dialogStatus = true
        let obj = {
          category: this.category,
          advertTypeCode: this.advertTypeCode,
          title: row.title || '',
          position: row.position || '',
          positionType: row.positionType || ''
        }
        if(row.id) obj.id = row.id
        this.form = obj
      },

      /**
       * 提交编辑广告位置
       */
      onSubmit(row){
        let params = this.form, type = '$post'
        if(params.id) type = '$put'
        this.clickSubmit = true
        this[type]('iot-saas-advert/admin/advert/position', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.getList()
          this.dialogStatus = false
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      },

      /**
       * 删除
       */
      del(row, index){
        this.$alert('确定删除此广告位置吗？', '删除广告位置', {
          confirmButtonText: '确定',
          center: true,
          callback: action => {
            if (action == 'confirm') {
              this.$delete(`iot-saas-advert/admin/advert/position/${row.id}`).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
                this.list.splice(index, 1)
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
