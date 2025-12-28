<template>
  <div>
    <div class="p-15 bg-white">
      <div class="mb-15" v-if="isSaas()">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="showDialog()">{{ $t('advert.addAdsLotion')
        }}</el-button>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('advert.advertisingPosition')">
          <template slot-scope="scope">
            <div>{{ scope.row.position }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('advert.adsLotionName')">
          <template slot-scope="scope">
            <div>{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('advert.adsType')">
          <template slot-scope="scope">
            <div>{{ scope.row.positionTypeName }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="showDialog(scope.row)" v-if="isSaas()">{{ $t('public.edit')
            }}</el-button>
            <el-button type="danger" size="mini" @click="del(scope.row, scope.$index)" v-if="isSaas()">{{
              $t('public.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="$t('advert.editAdsLotion')" :visible.sync="dialogStatus" :center="true" width="600px">
      <el-form label-width="130px">
        <el-form-item :label="$t('advert.adsType')">
          <div>{{ advertTypeName }}</div>
        </el-form-item>
        <el-form-item :label="$t('advert.advertisingPosition')">
          <el-input v-model="form.position" :placeholder="$t('advert.advertisingPositionText')" />
        </el-form-item>
        <el-form-item :label="$t('advert.adsLotionName')">
          <el-input v-model="form.title" placeholder="" />
        </el-form-item>
        <el-form-item :label="$t('advert.adsType')">
          <el-select v-model="form.positionType">
            <el-option :label="item" :value="index" v-for="(item, index) in positionType" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button type="primary" @click="onSubmit()" :disabled="clickSubmit">{{ clickSubmit ? $t('public.submitting') :
          $t('public.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'weChatAdList',
  components: {

  },
  computed: {
    positionType() {
      return {
        PICTURE: this.$t('advert.imgAds')
      }
    }
  },
  data() {
    return {
      category: this.$route.query.category,
      advertTypeCode: this.$route.query.advertTypeCode,
      advertTypeName: this.$route.query.advertTypeName,
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
    showDialog(row = { positionType: 'PICTURE' }) {
      this.row = row
      this.dialogStatus = true
      let obj = {
        category: this.category,
        advertTypeCode: this.advertTypeCode,
        title: row.title || '',
        position: row.position || '',
        positionType: row.positionType || ''
      }
      if (row.id) obj.id = row.id
      this.form = obj
    },

    /**
     * 提交编辑广告位置
     */
    onSubmit(row) {
      let that = this;
      let params = this.form, type = '$post'
      if (params.id) type = '$put'
      this.clickSubmit = true
      this[type]('iot-saas-advert/admin/advert/position', params).then(res => {
        this.$message({
          message: that.$t('public.submittedSuccess'),
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
    del(row, index) {
      let that = this;
      this.$alert(that.$t('advert.message1'), that.$t('advert.message2'), {
        confirmButtonText: that.$t('public.confirm'),
        center: true,
        callback: action => {
          if (action == 'confirm') {
            this.$delete(`iot-saas-advert/admin/advert/position/${row.id}`).then(res => {
              this.$message({
                message: that.$t('public.deleteSuccess'),
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

<style lang="scss" scoped></style>
