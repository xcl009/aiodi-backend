<template>
  <div class="p-5">
    <div class="bg-white">
      <div class="p-5" v-if="checkRoles(['terminal'])">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="setDialog()">添加广告位置</el-button>
      </div>
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="广告位置">
          <template slot-scope="scope">
            <div>{{ scope.row.position_type }}</div>
          </template>
        </el-table-column>
        <el-table-column label="广告位置名称">
          <template slot-scope="scope">
            <div>{{ scope.row.ad_des }}</div>
          </template>
        </el-table-column>
        <el-table-column label="广告类型">
          <template slot-scope="scope">
            <div>{{ adType[scope.row.ad_type] }}</div>
          </template>
        </el-table-column>
        <el-table-column label="微信广告ID" v-if="checkRoles(['partner'])">
          <template slot-scope="scope">
            <div>{{ scope.row.wx_ad_id || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="setShow(scope.row)" v-if="checkRoles(['partner'])">{{ scope.row.is_show == 1 ? '已开启' : '已关闭' }}</el-button>
            <el-button type="primary" size="mini" round plain @click="adUnitId(scope.row)" v-if="checkRoles(['partner'])">设置广告ID</el-button>
            <el-button type="primary" size="mini" round plain @click="setDialog(scope.row)" v-if="checkRoles(['terminal'])">编辑</el-button>
            <el-button type="primary" size="mini" round plain @click="delAd(scope.row, scope.$index)" v-if="checkRoles(['terminal'])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="编辑广告位置" :visible.sync="adDialog">
      <el-form label-width="130px">
        <el-form-item label="广告类型:">
          <div>{{ business_des }}</div>
        </el-form-item>
        <el-form-item label="广告位置:">
          <el-input v-model="form.position_type" placeholder="如:1"/>
        </el-form-item>
        <el-form-item label="广告位置名称:">
          <el-input v-model="form.ad_des" placeholder="如:首页插屏广告"/>
        </el-form-item>
        <el-form-item label="广告类型:">
          <el-select v-model="form.ad_type">
            <el-option :label="item" :value="index" v-for="(item, index) in adType" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="adDialog = false">取 消</el-button>
        <el-button type="primary" @click="postAdd()" :disabled="clickSubmit">{{ clickSubmit ? '提交中' : '确 定'}}</el-button>
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
        list: [],
        listLoading: true,
        business_type: this.$route.query.business_type || '',
        business_des: '',
        adType: {
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
      getList() {
        let url = 'agentapi/ad/get_wx_ad_positions_detail'
        this.$get(url, {
          business_type: this.business_type
        }).then(res => {
          this.listLoading = false
          this.list = res.list
          this.business_des = res.business_des
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 显示dialog
       */
      setDialog(row = { ad_type: 1}){
        this.row = row
        this.adDialog = true
        let obj = {
          business_type: row.business_type || this.business_type,
          position_type: row.position_type,
          ad_des: row.ad_des,
          ad_type: row.ad_type.toString(),
          ad_des: row.ad_des
        }
        this.form = obj
      },

      /**
       * 提交编辑广告位置
       */
      postAdd(row){
        let params = this.form
        this.clickSubmit = true
        this.$post('agentapi/ad/save_wx_ad_positions', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.getList()
          this.adDialog = false
          this.clickSubmit = false
        })
      },

      /**
       * 设置是否显示
       */
      setShow(row){
        let is_show = row.is_show == 1 ? 0 : 1
        this.$post('agentapi/ad/save_wx_ad_positions_detail_permission', {
          position_id: row.position_id,
          is_show: is_show
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.is_show = is_show
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
       * 删除广告位置
       */
      delAd(row, index){
        this.$alert('确定删除此广告位置吗？', '删除广告位置', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('agentapi/ad/del_wx_ad_positions', {
                position_id: row.position_id
              }).then(res => {
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
