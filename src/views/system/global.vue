<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('system.langType') }}</div>
          <el-tabs class="flex-1" v-model="form.lan" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.all')" name="0" />
            <el-tab-pane :label="item.value" :name="item.code" v-for="(item, index) in dists" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('system.module') }}</div>
          <el-tabs class="flex-1" v-model="form.module" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.all')" name="0" />
            <el-tab-pane :label="item.value" :name="item.code" v-for="item in modules" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item :label="$t('system.key')">
          <el-input v-model="form.key" />
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
              {{ types[scope.row.type].value }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'lan'">
            <template slot-scope="scope">
              {{ dists[scope.row.lan].value }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'module'">
            <template slot-scope="scope">
              {{ modules[scope.row.module].value }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || ''" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="110">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(3, scope.row, 2)">{{ $t('public.edit') }}</el-button>
              <el-popconfirm class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
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
          <el-form-item :label="$t('system.type')">
            <el-select v-model="dform.type">
              <el-option :label="`${item.value}`" :value="item.code" :key="index"
                v-for="(item, index) in types"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('system.langType')">
            <el-select v-model="dform.lan">
              <el-option :label="`${item.value}`" :value="item.code" :key="index"
                v-for="(item, index) in dists"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('system.module')">
            <el-select v-model="dform.module">
              <el-option :label="item.value" :value="item.code" :key="index" v-for="(item, index) in modules" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('system.languageTags')">
            <el-input v-model="dform.lab" :placeholder="$t('system.languageTags')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('system.languageEncoding')">
            <el-input v-model="dform.code" placeholder="$t('system.languageEncoding')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('system.key')">
            <el-input v-model="dform.keyes" :placeholder="$t('system.key')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('system.languageContent')">
            <el-input v-model="dform.val" :placeholder="$t('public.content')" style="width: 600px;"></el-input>
          </el-form-item>
          <el-form-item :label="$t('system.memo')">
            <el-input v-model="dform.remark" :placeholder="$t('system.memo')" type="textarea" :rows="4" />
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

      types: {},
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

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
      defaultColumn: [
        {
          key: 'type',
          val: true,
          name: this.$t('public.type')
        },
        {
          key: 'lan',
          val: true,
          name: this.$t('system.langType')
        },
        {
          key: 'lab',
          val: true,
          name: this.$t('system.tag')
        },
        {
          key: 'code',
          val: true,
          name: 'code'
        },
        {
          key: 'keyes',
          val: true,
          name: this.$t('system.identifying')
        },
        {
          key: 'val',
          val: true,
          name: this.$t('public.content')
        },
        {
          key: 'module',
          val: true,
          name: this.$t('system.module')
        },
        {
          key: 'remark',
          val: true,
          name: this.$t('public.module')
        }
      ]
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
    }
  },
  mounted() {
    this.getConfig()
  },
  methods: {
    /**
     * 获取语言类型和模板
     */
    getConfig() {
      this.$get('iot-saas-basic/admin/internation/config/getConfig').then(res => {
        this.dists = arrayToObj(res.dists, 'code')
        this.modules = arrayToObj(res.modules, 'code')
        this.types = arrayToObj(res.types, 'code')
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
     * 获取问题指南列表
     */
    getList() {
      let url = 'iot-saas-basic/admin/internation/config/findPage'
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.lan == 0) {
        delete params.lan
      }
      if (params.module == 0) {
        delete params.module
      }
      this.$get(url, params).then(res => {
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
          this.$post('iot-saas-basic/admin/internation/config/delete', {
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
          if (dialogType == 2) {
            this.dform = row
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
        params = JSON.parse(JSON.stringify(this.dform))
      switch (this.dialogType) {
        case 1: case 2:
          let url = 'iot-saas-basic/admin/internation/config/save'
          if (this.dialogType == 2) {
            url = 'iot-saas-basic/admin/internation/config/update'
          }
          this.$post(url, params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            if (this.dialogType == 2) {
              curRow = params
            } else {
              this.toQuery()
            }
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
