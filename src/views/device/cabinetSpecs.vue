<template>
  <div>
    <div class="pl-10 pr-10 pt-10 bg-white">
      <el-button type="primary" size="small" class="mb-10" @click="setRows(1, {}, 1)"><i class="el-icon-plus el-icon--left" />{{ $t('public.add') }}</el-button>

      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="specsTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" :width="item.width || 110" v-if="item.key == 'slotNo'">
            <template slot-scope="scope">
              fdsfdsfs
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'operate'">
            <template slot-scope="scope">
              <div class="flex flex-wrap operate">
                <template>
                  <el-button type="text" @click="setRows(1, scope.row, 2)">{{ $t('public.edit') }}</el-button>
                  <el-popconfirm
                    class="pop"
                    cancel-button-type=""
                    icon="el-icon-info"
                    icon-color="#FF7D00"
                    :title="'确定删除此规格吗？'"
                    @onConfirm="setRows(2, scope.row, 1, scope.$index)"
                  >
                    <el-button type="text" slot="reference"><span class="text-danger">{{ $t('public.delete') }}</span></el-button>
                  </el-popconfirm>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 110" v-else></el-table-column>
        </template>
      </el-table>
    </div>

    <el-drawer :title="drawerTitle[drawerType]" :visible.sync="drawerStatus" :close-on-press-escape="[0].indexOf(drawerType) > -1" :wrapperClosable="[0].indexOf(drawerType) > -1">
      <template v-if="drawerType == 1 || drawerType == 2">
        <el-form class="pl-20 pr-20 custom-form" label-width="auto" ref="dform" :model="dform" :rules="rules" @submit.native.prevent>
          <el-form-item :label="'名称'" prop="name">
            <el-input v-model="dform.name"></el-input>
          </el-form-item>
          <el-form-item :label="'标识'" prop="code">
            <el-input v-model="dform.code"></el-input>
            <div>一位大写字母</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1, 2].indexOf(drawerType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="drawerConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
  import TableColumnSet from '@/components/TableColumnSet/index'
  export default {
    name: 'income',
    components: {
      TableColumnSet
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      defaultColumn(){
         return [
          {
            key: 'name',
            val: true,
            name: '名称',
            width: 'auto',
          },
          {
            key: 'code',
            val: true,
            name: '标识',
            width: 'auto',
          },
          {
            key: 'state',
            val: true,
            name: '状态',
          },
          {
            key: 'operate',
            val: true,
            name: '操作',
            width: 110
          }
        ]
      },
      timeList() {
        return [
          {
            title: this.$t('public.minute'),
            value: '1'
          },
          {
            title: this.$t('public.huor'),
            value: '60'
          },
          {
            title: this.$t('public.day'),
            value: '1440'
          }
        ]
      },
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [

        ],
        listLoading: false,
        listQuery: {
          page: 1,
          size: 100
        },
        form: {},

        // 弹出相关
        drawerType: 1,
        drawerStatus: false,
        drawerTitle: {
          1: '添加规格',
          2: '编辑规格'
        },
        curRow: {},
        curIdx: 0,
        dform: {},
        rules: {
          name: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          code: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ]
        },

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        this.$get('iot-saas-device/admin/locker/mode/loadAll').then((res = []) => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 操作
       * @param {Object} type 1 drawer类型
       * @param {Object} row 选择当前数据
       * @param {Object} drawerType drawer内容显示类型
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, drawerType, idx) {
        switch (type) {
          case 1:
            this.drawerType = drawerType
            this.curRow = row
            this.curIdx = idx
            this.drawerStatus = true
            this.dform = {}
            switch (drawerType) {
              case 2:
                this.dform = {
                  id: row.id,
                  name: row.name,
                  code: row.code
                }
              break
            }
            break
          case 2:
            this.$post('iot-saas-device/admin/locker/mode/remove', {
              id: row.id
            }).then(res => {
              this.$message({
                message: this.$t('public.operationSuccessful'),
                type: 'success'
              })
              this.list.splice(idx, 1)
            })
          break
        }
      },

      /**
       * 弹窗确认
       */
      drawerConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if (this.clickSubmit) return
        this.clickSubmit = true
        switch (this.drawerType) {
          case 1: case 2:
            this.$refs['dform'].validate((valid, object) => {
              if (valid) {
                this.$post(`iot-saas-device/admin/locker/mode/${this.drawerType == 1 ? 'save' : 'update'}`, params).then(res => {
                  this.$message({
                    message: this.$t('public.operationSuccessful'),
                    type: 'success'
                  })
                  this.getList()
                  this.drawerStatus = false
                  this.clickSubmit = false
                }).catch(err => {
                  this.clickSubmit = false
                })
              } else {
                this.clickSubmit = false
              }
            })
            break
        }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
