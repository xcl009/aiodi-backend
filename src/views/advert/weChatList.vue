<template>
  <div>
    <div class="p-15 bg-white">
      <div class="mb-15" v-if="isSaas()">
        <el-button type="primary" size="small" @click="showDialog()">添加广告位置</el-button>
      </div>

      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
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
        <el-table-column label="微信广告ID" v-if="isBrand()">
          <template slot-scope="scope">
            <div>{{ scope.row.weChatAdvertPositionId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" :plain="scope.row.statusCode != 'ENABLE'" @click="setStatus(scope.row)" v-if="isBrand() && scope.row.weChatAdvertPositionId">{{ scope.row.statusCode == 'ENABLE' ? '已开启' : '已关闭' }}</el-button>
            <el-button type="primary" size="mini" @click="adUnitId(scope.row)" v-if="isBrand()">设置广告ID</el-button>
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
          <el-input v-model="form.title" placeholder="如:首页插屏广告"/>
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
        positionType: {
          'BANNER': 'Banner广告',
          'ENCOURAGE_VIDEO': '激励视频广告',
          'TABLE_SCREEN': '插屏广告',
          'VIDEO': '视频广告',
          'VIDEO_BEFORE': '视频前贴广告',
          'TEMPLATE': '原生模板广告'
        },
        list: [],
        listLoading: true,
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
       * 获取广告位列表
       */
      getList() {
        let url = 'iot-saas-advert/admin/advert/position/find'
        if(this.isBrand()) url = 'iot-saas-advert/admin/advert/findBrandTraffic'
        this.$get(url, {
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
      showDialog(row = { positionType: 'BANNER'}){
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
       * 设置是否显示
       */
      setStatus(row){
        let statusCode = row.statusCode == 'ENABLE' ? 'CLOSE' : 'ENABLE'
        this.$put(`iot-saas-advert/admin/advert/settingStatus`, {
          advertPositionId: row.advertPositionId,
          status: statusCode
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.$set(row, 'statusCode', statusCode)
        })
      },

      /**
       * 设置广告ID
       */
      adUnitId(row){
        this.$prompt(`请输入微信${row.positionTypeName}ID`, '设置微信广告ID', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          inputValue: row.wx_ad_id,
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              const value = instance.inputValue
              this.$put('iot-saas-advert/admin/advert/settingPositionId', {
                advertPositionId: row.advertPositionId,
                weChatAdvertPositionId: value.trim()
              }).then(res => {
                this.$message({
                  message: '设置成功',
                  type: 'success'
                })
                this.$set(row, 'weChatAdvertPositionId', value)
                done()
              })
            } else {
              done()
            }
          }
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
