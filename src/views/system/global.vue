<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <!-- <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('system.langType') }}</div>
          <el-tabs class="flex-1" v-model="form.lanType" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.all')" name="0" />
            <el-tab-pane :label="item" :name="index" v-for="(item, index) in dists" />
          </el-tabs>
        </div> -->
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('system.module') }}</div>
          <el-tabs class="flex-1" v-model="form.sysModel" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.all')" :name="''" />
            <el-tab-pane :label="item.distLable" :name="item.distValue" v-for="item in modules" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item :label="$t('system.key')">
          <el-input v-model="form.key" />
        </el-form-item>
        <el-form-item :label="$t('system.languageContent')">
          <el-input v-model="form.lanValue" />
        </el-form-item>
        <el-form-item :label="$t('system.languageEncoding')">
          <el-input v-model="form.lanLable" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="setRows(3, {}, 1)"><i
            class="el-icon-plus el-icon--left" />{{ $t('system.addDictionary') }}</el-button>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="globalTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" v-if="item.key == 'type'">
            <template slot-scope="scope">
              <!-- 123123 -->
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'lan'">
            <template slot-scope="scope">
              <!-- {{ dists[scope.row.lan].value }} -->
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'module'">
            <template slot-scope="scope">
              <!-- {{ modules[scope.row.module].value }} -->
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || ''" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="110">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(3, scope.row, 2, scope.$index)">{{ $t('public.edit') }}</el-button>
              <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('system.deleteDictionary')" @onConfirm="setRows(2, scope.row, 1, scope.$index)">
                <el-button type="text" class="text-danger" slot="reference">{{ $t('public.delete') }}</el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
      <template v-if="dialogType == 1 || dialogType == 2">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('system.module')">
            <el-select v-model="dform.sysMod">
              <el-option :label="item.distLable" :value="item.distValue" :key="index" v-for="(item, index) in modules" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('system.contextCode')">
            <el-select v-model="dform.contextCode">
              <el-option :label="item" :value="idx + 1" :key="idx" v-for="(item, idx) in ['exception', 'detail', 'body', 'open_front' , 'front']" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('system.languageEncoding')">
            <el-input v-model="dform.lanLable" :placeholder="$t('system.languageEncoding')"></el-input>
          </el-form-item>
          <!-- <el-form-item :label="$t('system.memo')">
            <el-input v-model="dform.remark" :placeholder="$t('system.memo')" type="textarea" :rows="2" />
          </el-form-item> -->
          <template v-if="!dform.id">
            <h4>{{ $t('system.languageContent') }}</h4>
            <template v-for="(item, index) in dists">
              <el-form-item :label="`${item.distLable}${item.remark ? '('+item.remark+')' : ''}`">
                <el-input v-model="langForm[item.distValue]" :placeholder="item.distLable" type="textarea" :rows="2" style="width: 500px;"></el-input>
              </el-form-item>
            </template>
          </template>
          <el-form-item :label="$t('system.languageContent')" v-if="dform.id">
            <el-input v-model="dform.lanValue" :placeholder="$t('public.content')" type="textarea" :rows="2" style="width: 500px;"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1, 2].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import Pagination from '@/components/Pagination'
import upload from '@/components/upload'
import TableColumnSet from '@/components/TableColumnSet/index'
import { arrayToObj } from '@/utils/index'
export default {
  name: 'useGuide',
  components: {
    condition,
    selectSearch,
    Pagination,
    TableColumnSet,
    upload
  },
  data() {
    return {
      clickSubmit: false,
      form: {},
      list: [],
      tableMaxH: '250',
      listLoading: true,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20
      },

      dists: {}, // 语言
      modules: {}, // 模块

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      dialogTitle: {
        1: this.$t('system.addDictionary')
      },
      curRow: {},
      curIdx: 0,
      dform: {},
      langForm: {},


      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
    }
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  activated() {
    if (this.$route.meta.reload) {
      this.getConfig()
      this.toQuery()
    } else if (!this.list || this.list.length == 0) {
      this.getConfig()
      this.toQuery()
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    Ability() {
      return this.$store.getters.Ability
    },
    defaultColumn() {
      return [
        {
          key: 'sysMod',
          val: true,
          name: this.$t('system.module')
        },
        {
          key: 'lanTypeName',
          val: true,
          name: this.$t('system.langType')
        },
        {
          key: 'lanLable',
          val: true,
          name: this.$t('system.languageEncoding')
        },
        {
          key: 'contextCode',
          val: true,
          name: this.$t('system.contextCode')
        },
        {
          key: 'lanValue',
          val: true,
          name: this.$t('public.content')
        },
        {
          key: 'contentType',
          val: true,
          name: 'contentType'
        },
        {
          key: 'remark',
          val: true,
          name: this.$t('public.remark')
        }
      ]
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 获取语言类型和模板
     */
    getConfig() {
      this.$post('iot-saas-basic/admin/sys/dict/query', {
        key: 'SYSTEM_INTERNATION_LAN'
      }).then(res => {
        this.dists = arrayToObj(res, 'distValue')
      })

      this.$post('iot-saas-basic/admin/sys/dict/query', {
        key: 'SYSTEM_MODULE'
      }).then(res => {
        this.modules = arrayToObj(res, 'distValue')
      })
    },

    /**
     * 显示dialog
     */
    showDialog(row) {
      this.drawerStatus = true
      this.dform = Object.assign({}, row)
    },

    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      this.form = {}
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    /**
     * 国际化列表数据
     */
    getList() {
      let url = 'iot-saas-basic/admin/lan/query'
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (!params.sysModel || params.sysModel == 0) {
        delete params.sysModel
        this.form.sysModel = '0'
      }
      this.$post(url, params).then(res => {
        this.list = res.rows
        this.listLoading = false
        this.clickSubmit = false
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
        }
      }).catch(() => {
        this.listLoading = false
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型  2 删除字典 3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '添加字典' 2: '修改字典'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      let that = this;
      switch (type) {
        case 1:

          break
        case 2:
          this.$post('iot-saas-basic/admin/lan/del', {
            id: row.id
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.list.splice(idx, 1)
          })
          break
        case 3:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
          this.dform = {}
          this.langForm = {}
          if (dialogType == 2) {
            this.dform = JSON.parse(JSON.stringify(row))
          }
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm(row = {}) {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform)),
        langForm = JSON.parse(JSON.stringify(this.langForm))
      switch (this.dialogType) {
        case 1:
          let url = 'iot-saas-basic/admin/lan/save', endKey = Object.keys(this.dists)[Object.keys(this.dists).length - 1]
          for (var key in this.dists) {
            if(langForm[key]){
              params.lanValue = langForm[key]
              params.lanType = this.dists[key].id
              params.lanTypeName = key
              this.$post(url, params).then(res => {
                if(endKey == key){
                  this.$message({
                    message: that.$t('public.operationSuccessful'),
                    type: 'success'
                  })
                  this.toQuery()
                  this.drawerStatus = false
                  this.clickSubmit = false
                }
              }).catch(err => {
                if(endKey == key){
                  this.clickSubmit = false
                }
              })
            }else if(endKey == key){
              this.$message({
                message: that.$t('public.operationSuccessful'),
                type: 'success'
              })
              this.toQuery()
              this.drawerStatus = false
              this.clickSubmit = false
            }
          }
          break
        case 2:
          this.$post('iot-saas-basic/admin/lan/update', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.list[curIdx] = params
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
