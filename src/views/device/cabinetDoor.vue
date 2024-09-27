<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :filterForm="false" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">规格</div>
          <el-tabs class="flex-1" v-model="listQuery.modeId" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.all')" :name="''" />
            <el-tab-pane :label="`${item.name}`" :name="'' + item.val + ''" v-for="item in modeIds" />
          </el-tabs>
        </div>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 cursor line-1" :class="[selArr.length > 0 ? 'text-primary': 'text-gray']" @click="setRows(1, {}, 1)">批量设置规格</div>
        <div class="ml-20 cursor line-1" :class="[selArr.length > 0 ? 'text-primary': 'text-gray']" @click="setRows(1, {}, 2)">批量设置收费模式</div>
        <table-column-set storageKey="doorTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" @selection-change="selList" element-loading-text="Loading">
        <el-table-column type="selection" :selectable="checkSel" width="50" />
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" :width="item.width || 110" v-if="item.key == 'slotNo'">
            <template slot-scope="scope">
              fdsfdsfs
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'modeId'">
            <template slot-scope="scope">
              <el-dropdown trigger="click">
                <span class="cursor text-primary">{{ scope.row.modeId || 'S' }}</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="item in modeIds" @click.native="command('modeId', scope.row, item.val)">{{ item.val }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'specId'">
            <template slot-scope="scope">
              <el-dropdown trigger="click">
                <span class="cursor text-primary">{{ scope.row.specId }}</span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>S</el-dropdown-item>
                  <el-dropdown-item>M</el-dropdown-item>
                  <el-dropdown-item>L</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 110" v-else></el-table-column>
        </template>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="drawerTitle[drawerType]" :visible.sync="drawerStatus">
      <template v-if="drawerType == 1">
        <div class="flex pl-20 pr-20">
          <div class="mr-20">规格</div>
          <div>
            <el-dropdown trigger="click">
              <span class="cursor text-primary">{{ curRow.modeId || 'S' }}<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in modeIds" @click.native="command('modeId', curRow, item.val)">{{ item.val }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </template>
      <template v-if="drawerType == 2">
        <div class="flex pl-20 pr-20">
          <div class="mr-20">收费模式</div>
          <div>
            <el-dropdown trigger="click">
              <span class="cursor text-primary">{{ curRow.modeId || 'S' }}<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in modeIds" @click.native="command('modeId', curRow, item.val)">{{ item.val }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </template>
      <template v-if="[1, 2].indexOf(drawerType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="drawerConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
        </div>
      </template>
    </el-drawer>

    <xlsx ref="toXlsx" :fileName="$t('moeny.revenueRecords')"></xlsx>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/index'
  import xlsx from '@/components/xlsx/'
  import TableColumnSet from '@/components/TableColumnSet/index'
  export default {
    name: 'income',
    components: {
      Pagination,
      condition,
      xlsx,
      TableColumnSet
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId || {}
      },
      defaultColumn(){
         return [
          {
            key: 'slotNo',
            val: true,
            name: '柜门号',
            width: 'auto',
          },
          {
            key: 'modeId',
            val: true,
            name: '规格',
          },
          {
            key: 'status',
            val: true,
            name: '柜门状态',
          },
          {
            key: 'specId',
            val: true,
            name: '收费模式',
          },
          {
            key: 'userId',
            val: true,
            name: '当前用户',
          },
          {
            key: 'startTime',
            val: true,
            name: '开始时间',
            width: 150
          },
          {
            key: 'remark',
            val: true,
            name: '备注',
            width: 180
          }
        ]
      }
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [
          {
            aaaa: 66666,
            modeId: 'S',
          },
          {
            aaaa: 66666
          },
          {
            aaaa: 66666
          },
        ],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20,
          deviceSn: this.$route.query.deviceSn || '',
        },
        modeIds: [
          {
            val: 'S',
            name: '小柜门'
          },
          {
            val: 'M',
            name: '中柜门'
          },
          {
            val: 'L',
            name: '大柜门'
          }
        ],
        form: {},
        selArr: [],

        // 弹出相关
        drawerType: 1,
        drawerStatus: false,
        drawerTitle: {
          1: '规格',
          2: '收费模式'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
      }
    },
    mounted(options) {
      //this.toQuery()
    },
    methods: {
      /**
       * 校验是否可选
       */
      checkSel(row) {
        return !row.distribute
      },

      /**
       * 选择设备
       * @param {Array} list
       */
      selList(list) {
        let selArr = []
        for (var i in list) {
          selArr.push(1)
        }
        this.selArr = selArr
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
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.form = {

        }
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-device/admin/locker/stock/findPage', params).then((res = {}) => {
          this.list = res.rows || []
          if (this.outStatus) {
            let end = false
            if (params.size > this.list.length) end = true
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size),  () => {
                if(end){
                  this.outStatus = false
                  this.toQuery()
                }else{
                  this.listQuery.page += 1
                  this.getList()
                }
              })
            })
          }else{
            this.listLoading = false
            this.clickSubmit = false
            if (params.page == 0) {
              this.listTotal = res.total
              this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
            }
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 导出
       */
      saveXlsx() {
        this.outStatus = true
        this.listLoading = true
        this.listQuery.size = 100
        this.list = []
        this.$refs['toXlsx'].clearData()
        this.getList()
      },

      /**
       * 表格选择设置内容
       * @param {String} key
       * @param {Object|String|Number} val
       * @param {Object} row
       */
      command(key, row, val){
        this.$set(row, key, val)
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
          case 1:
          
            break
        }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
