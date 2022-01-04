<template>
  <div class="p-5">
    <div class="p-5 bg-white">
      <el-button type="primary" size="small" @click="editDialog = true; editForm = editInfo" v-if="this.config.edit_goods_type">添加设备类型</el-button>

      <el-table ref="list_table" :data="list" stripe highlight-current-row :max-height="tableMaxH">
        <el-table-column label="一级设备类型">
          <template slot-scope="scope">
            {{ myDeviceId[scope.row.depend_type] ? myDeviceId[scope.row.depend_type] : '' }}
          </template>
        </el-table-column>
        <el-table-column label="类型名称">
          <template slot-scope="scope">
            {{ scope.row.type_name }}
          </template>
        </el-table-column>
        <el-table-column label="支持蓝牙连接">
          <template slot-scope="scope">
            {{ scope.row.support_buletooth == 1 ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="类型标识">
          <template slot-scope="scope">
            {{ scope.row.code_tag }}
          </template>
        </el-table-column>
        <el-table-column label="二维码域名跳转标识">
          <template slot-scope="scope">
            {{ scope.row.code_type }}
          </template>
        </el-table-column>
        <el-table-column label="二维码结尾字母标识">
          <template slot-scope="scope">
            {{ scope.row.code_letter }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="音乐链接">
          <template slot-scope="scope">
            <div>微信：{{ scope.row.music_link }}</div>
            <div>支付宝：{{ scope.row.zfb_music_link || '--' }}</div>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" v-if="this.config.edit_goods_type">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="editDialog = true; editForm = JSON.parse(JSON.stringify(scope.row));">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.limit" :page-count="listQuery.page_num"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog title="编辑设备类型" :visible.sync="editDialog">
      <el-form label-width="auto">
        <el-form-item label="一级设备类型：">
          <el-select v-model="editForm.depend_type">
            <el-option :label="index" :value="item" v-for="(item, index) in myDeviceName"/>
          </el-select>
        </el-form-item>
        <el-form-item label="类型名称：">
          <el-input v-model="editForm.type_name" />
        </el-form-item>
        <el-form-item label="蓝牙连接：">
          <el-switch v-model="editForm.support_buletooth" :active-value="1" :inactive-value="0"/>
        </el-form-item>
        <el-form-item label="类型标识：">
          <el-input v-model="editForm.code_tag" placeholder="可不填写,会自动生成"/>
        </el-form-item>
        <el-form-item label="二维码域名跳转标识：" placeholder="" >
          <el-input v-model="editForm.code_type" />
          <div class="fs-s2 text-gray">例：充电宝二维码域名(https://xxx.com/scan/battery/编号)，battery就是二维码域名跳转标识。便于添加小程序二维码跳转域名支持多种设备。</div>
        </el-form-item>
        <el-form-item label="二维码结尾字母标识：" placeholder="可不填写" >
          <el-input v-model="editForm.code_letter" />
           <div class="fs-s2 text-gray">例：充电宝二维码SN(0000001A)，SN中的A表示充电宝；密码线二维码SN(0000001B)，SN中的B表示是密码线；便于区分二维码设备类型。</div>
        </el-form-item>
         <!-- <el-form-item label="支付宝音频链接：">
          <el-input v-model="editForm.zfb_music_link" />
        </el-form-item>
        <el-form-item label="微信音频文件：">
          <upload v-model="editForm.music_link" uploadText="上传音乐"/>
          <span>{{ editForm.music_link }}</span>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="editGoods()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import upload from '@/components/upload/two.vue'
  import Pagination from '@/components/Pagination'
  export default {
    name: 'deviceTypes',
    components: {
      upload,
      Pagination
    },
    data() {
      return {
        tableMaxH: '250px',
        list: [],
        listQuery: {
          start: 1,
          page: 1,
          page_num: 1,
          limit: 20
        },

        editDialog: false,
        editForm: {},
        editInfo: {
          support_buletooth: 0
        }
      }
    },
    computed: {
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      myDeviceId(){
        return this.$store.state.user.myDeviceId
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
        let params = Object.assign({}, this.form, this.listQuery, {
          start: this.listQuery.page - 1
        })
        this.$get('agentapi/goods/goods_detail_types', params).then(res => {
          this.list = res.list
          this.listQuery.page_num = res.page_num
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 88
        })
      },

      /**
       * 信息
       */
      editGoods(){
        let params = JSON.parse(JSON.stringify(this.editForm))
        this.$post('agentapi/goods/save_goods_detail_type', params).then(res => {
          this.editDialog = false
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.getList()
        })
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
