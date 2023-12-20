<template>
  <el-dialog :visible.sync="dialogStatus" :show-close="false" :modal-append-to-body="false" width="600px" :center="true"
    :title="$t('components.relatedTemplate')">
    <div>
      <el-table class="ptd-5" id="list_table" ref="list_table" :data="list" @selection-change="selList">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column :label="$t('components.templateName')" align="center">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('shopping.numberOfWarehouses')" width="80" align="center">
          <template slot-scope="scope">
            {{ scope.row.positionQty }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('components.goodsPerWarehouse')" width="110" align="center">
          <template slot-scope="scope">
            {{ scope.row.merchandiseQty }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="mt-30 text-center">
      <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
      <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'relatedTemplate',
  data() {
    return {
      clickSubmit: false,
      dialogStatus: false,
      list: []
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
      this.$get('iot-saas-device/admin/template').then(res => {
        this.list = res || []
      })
    },

    /**
     * 获取公司模板
     */
    getCompanyTemplate(companyId) {
      this.dialogStatus = true
      this.companyId = companyId
      this.$get('iot-saas-device/admin/template/company/findList', {
        companyId: companyId
      }).then(res => {
        if (this.list.length > 0 && res.templateId && res.templateId.length > 0) {
          this.list.map(item => {
            if (res.templateId.indexOf(item.id) > -1) {
              this.$refs.list_table.toggleRowSelection(item, true)
            }
          })
        }
      })
    },

    /**
     * 选择设备
     * @param {Object} res
     */
    selList(list) {
      let selID = []
      for (var i in list) {
        selID.push(list[i].id)
      }
      this.selID = selID
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.$post('iot-saas-device/admin/template/bindingCompany', {
        companyId: this.companyId,
        templateIds: this.selID
      }).then(res => {
        this.$message({
          message: that.$t('components.bindSuccess'),
          type: 'success'
        })
        this.dialogStatus = false
        this.clickSubmit = false
      }).catch(err => {
        this.clickSubmit = false
      })
    }
  }
}
</script>
<style scoped lang="scss"></style>
