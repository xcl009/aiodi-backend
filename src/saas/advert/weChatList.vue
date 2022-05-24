<template>
  <div>
    <div class="p-15 bg-white">
      <div class="mb-15" v-if="isSaas()">
        <el-button type="primary" size="small" @click="setDialog()">添加广告位置</el-button>
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
            <div>{{ positionType[scope.row.positionType] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="微信广告ID" v-if="isBrand()">
          <template slot-scope="scope">
            <div>{{ scope.row.wx_ad_id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="setShow(scope.row)" v-if="isBrand()">{{ scope.row.is_show == 1 ? '已开启' : '已关闭' }}</el-button>
            <el-button type="primary" size="mini" @click="adUnitId(scope.row)" v-if="isBrand()">设置广告ID</el-button>
            <el-button type="primary" size="mini" @click="setDialog(scope.row)" v-if="isSaas()">编辑</el-button>
            <el-button type="danger" size="mini" @click="del(scope.row, scope.$index)" v-if="isSaas()">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="编辑广告位置" :visible.sync="adDialog" :center="true" width="750px">
      <el-form label-width="130px">
        <el-form-item label="广告类型">
          <div>{{ name }}</div>
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
        <el-button @click="adDialog = false">取 消</el-button>
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
        list: [],
        listLoading: true,
        advertTypeCode: this.$route.query.advertTypeCode,
        name: this.$route.query.name,
        positionType: {
          1: 'Banner广告',
          2: '激励视频广告',
          3: '插屏广告',
          4: '视频广告',
          5: '视频前贴广告',
          6: '封面广告',
          7: '原生模板广告'
        },
        adDialog: false,
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
      setDialog(row = { positionType: 1}){
        this.row = row
        this.adDialog = true
        let obj = {
          title: row.title || '',
          position: row.position || '',
          positionType: row.positionType.toString(),
          adTypeId: this.id,
          category: 2
        }
        if(row.id) obj.id = row.id
        this.form = obj
      },

      /**
       * 提交编辑广告位置
       */
      onSubmit(row){
        let params = this.form
        this.clickSubmit = true
        this.$post('iot-saas-advert/admin/ad/save/position', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.getList()
          this.adDialog = false
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      },

      /**
       * 设置是否显示
       */
      setShow(row){
        let status = row.status == 1 ? 0 : 1
        this.$post(`iot-saas-advert/set/${row.id}/status/${status}`).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.status = status
        })
      },

      /**
       * 设置广告ID
       */
      adUnitId(row){
        this.$prompt(`请输入微信${this.adType[row.ad_type]}位ID`, '设置微信广告ID', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'text',
          inputValue: row.wx_ad_id,
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              const value = instance.inputValue
              this.$post('agentapi/ad/save_wx_ad_positions_detail_permission', {
                position_id: row.position_id,
                wx_ad_id: value.trim()
              }).then(res => {
                this.$message({
                  message: '设置成功',
                  type: 'success'
                })
                row.wx_ad_id = value
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
              this.$delete(`iot-saas-advert/admin/ad/position/${row.id}`).then(res => {
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
