<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" :filterForm="false" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">规格</div>
          <el-tabs class="flex-1" v-model="listQuery.modeId" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.all')" :name="''" />
            <el-tab-pane :label="`${i.name}`" :name="'' + k + ''" v-for="(i, k) in modeIds" v-if="i.state == 0"/>
          </el-tabs>
          <el-button type="primary" size="small" @click="setRows(1, {}, 1)"><i class="el-icon-plus el-icon--left" />{{ $t('public.add') }}</el-button>
        </div>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 cursor line-1" :class="[selArr.length > 0 ? 'text-primary': 'text-gray']" @click="setRows(1, {modeId: ''}, 2)">批量设置规格</div>
        <div class="ml-20 cursor line-1" :class="[selArr.length > 0 ? 'text-primary': 'text-gray']" @click="setRows(1, {specId: ''}, 3)">批量设置收费模式</div>
        <table-column-set storageKey="doorTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" @selection-change="selList" element-loading-text="Loading">
        <el-table-column type="selection" :selectable="checkSel" width="50" />
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" :width="item.width || 110" v-if="item.key == 'status'">
            <template slot-scope="scope">
              {{ statusArr[scope.row.status] }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'modeId'">
            <template slot-scope="scope">
              <el-dropdown trigger="click">
                <span class="cursor text-primary">{{ scope.row.mode.name }}<i class="el-icon-arrow-down el-icon--right"></i></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(i, k) in modeIds" @click.native="command('mode', scope.row, i)" v-if="i.state == 0">{{ i.name }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'specId'">
            <template slot-scope="scope">
              <el-dropdown trigger="click">
                <span class="cursor text-primary">{{ scope.row.spec.name }}<i class="el-icon-arrow-down el-icon--right"></i></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(i, k) in specIds" @click.native="command('spec', scope.row, i)">{{ i.name }}</el-dropdown-item>
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

    <el-drawer :title="drawerTitle[drawerType]" :visible.sync="drawerStatus" :close-on-press-escape="[1].indexOf(drawerType) > -1" :wrapperClosable="[1].indexOf(drawerType) > -1">
      <template v-if="drawerType == 1">
        <el-form class="pl-20 pr-20 custom-form" label-width="auto" ref="dform" :model="dform" :rules="rules" @submit.native.prevent>
          <el-form-item :label="'柜门数量'" prop="doorNum">
            <el-input v-model="dform.doorNum" type="number"></el-input>
          </el-form-item>
          <el-form-item :label="'柜门规格'" prop="modeId">
            <el-select v-model="dform.modeId">
              <el-option :label="`${i.name}`" :value="k" :key="k" v-for="(i, k) in modeIds" v-if="i.state == 0"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="'收费模式'" prop="specId">
            <el-select v-model="dform.specId">
              <el-option :label="`${i.name}`" :value="k" :key="k" v-for="(i, k) in specIds"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="'柜门状态'">
            <el-radio-group v-model="dform.status" size="medium">
              <el-radio-button :label="0">{{ '启用' }}</el-radio-button>
              <el-radio-button :label="1">{{ '禁用' }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="drawerType == 2">
        <div class="flex pl-20 pr-20">
          <div class="mr-20">规格</div>
          <div>
            <el-dropdown trigger="click">
              <span class="cursor text-primary">{{ modeIds[curRow.modeId] ? modeIds[curRow.modeId].name : '请选择' }}<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(i, k) in modeIds" @click.native="curRow.modeId = i.id">{{ i.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </template>
      <template v-if="drawerType == 3">
        <div class="flex pl-20 pr-20">
          <div class="mr-20">收费模式</div>
          <div>
            <el-dropdown trigger="click">
              <span class="cursor text-primary">{{ specIds[curRow.specId] ? specIds[curRow.specId].name : '请选择' }}<i class="el-icon-arrow-down el-icon--right"></i></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(i, k) in specIds" @click.native="curRow.specId = i.id">{{ i.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </template>
      <template v-if="[1, 2, 3].indexOf(drawerType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="drawerConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
        </div>
      </template>
    </el-drawer>

    <xlsx ref="toXlsx" :fileName="$t('money.revenueRecords')"></xlsx>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/index'
  import xlsx from '@/components/xlsx/'
  import TableColumnSet from '@/components/TableColumnSet/index'
  import { arrayToObj } from '@/utils/index'
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
      },
      statusArr(){
        return {
          0: '未使用',
          1: '已使用',
          2: '已禁用'
        }
      }
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        modeIds: {},
        specIds: {},
        form: {},
        selArr: [],

        // 弹出相关
        drawerType: 1,
        drawerStatus: false,
        drawerTitle: {
          1: '添加柜门',
          2: '规格',
          3: '收费模式'
        },
        curRow: {},
        curIdx: 0,
        dform: {},
        rules: {
          doorNum: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          modeId: [
            { required: true, message: '此项必选', trigger: 'blur' }
          ],
          specId: [
            { required: true, message: '此项必选', trigger: 'blur' }
          ]
        },

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
      }
    },
    beforeRouteEnter(to, from, next) {
      to.meta.urlQuery = JSON.stringify(to.query)
      if (from.name == '') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      let query = this.$route.query
      this.queryKey = ['deviceSn']
      console.log(query, this.queryKey)
      for (var i in this.queryKey) {
        if (query[this.queryKey[i]]) {
          this.form[this.queryKey[i]] = query[this.queryKey[i]]
        } else {
          delete this.form[this.queryKey[i]]
        }
      }
      console.log(this.form)
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery()
      }
      this.urlQuery = this.$route.meta.urlQuery
    },
    mounted(options) {
      this.getModes()
      this.getSpecs()
    },
    methods: {
      /**
       * 获取规格
       */
      getModes() {
        this.$get('iot-saas-device/admin/locker/mode/loadAll').then((res) => {
          this.modeIds = arrayToObj(res, 'id')
        })
      },

      /**
       * 获取收费模式
       */
      getSpecs() {
        this.$get('iot-saas-device/admin/locker/spec/loadAll').then((res) => {
          this.specIds = arrayToObj(res, 'id')
        })
      },

      /**
       * 校验是否可选
       */
      checkSel(row) {
        return !row.distribute
      },

      /**
       * 选择数据
       * @param {Array} list
       */
      selList(list) {
        let selArr = []
        list.map(item => {
          selArr.push(item)
        })
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
        this.form = {}
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
        if(params.modeId <= 0) delete params.modeId
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
              if(!params.modeId) this.firstTotal = res.total
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
      command(key, row, vrow){
        let params = {}
        params[`${key}Id`] = vrow.id
        this.updateDoor(params, [row])
        this.$set(row, key, vrow)
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
            this.$refs['dform'].validate((valid, object) => {
              if (valid) {
                this.loadObj = this.$loading({
                  lock: true,
                  text: '提交中',
                  spinner: 'el-icon-loading'
                })
                let doorNum = parseInt(params.doorNum) + parseInt(this.firstTotal) + 1
                delete params.doorNum
                params.deviceSn = this.form.deviceSn
                this.saveDoor(params, doorNum, parseInt(this.firstTotal) + 1)
              } else {
                this.clickSubmit = false
              }
            })
            break
          case 2:
            if(!this.curRow.modeId){
              this.$message({
                message: '请选择规格',
                type: 'error'
              })
              return
            }
            this.loadObj = this.$loading({
              lock: true,
              text: '提交中',
              spinner: 'el-icon-loading'
            })
            this.updateDoor({ modeId: this.curRow.modeId }, this.selArr, 0, 1)
            break
          case 3:
            if(!this.curRow.specId){
              this.$message({
                message: '请选择收费模式',
                type: 'error'
              })
              return
            }
            this.loadObj = this.$loading({
              lock: true,
              text: '提交中',
              spinner: 'el-icon-loading'
            })
            this.updateDoor({ specId: this.curRow.specId }, this.selArr, 0, 1)
            break
        }
      },

      /**
       * 新增柜门
       */
      saveDoor(params, doorNum, idx = 1) {
        if (doorNum <= idx) {
          this.loadObj.close()
          this.$message({
            message: '添加成功',
            type: 'success'
          })
          this.clickSubmit = false
          this.toQuery()
          this.drawerStatus = false
          return
        }
        params.slotNo = idx
        this.$post('iot-saas-device/admin/locker/stock/save', params).then(res => {
          idx++
          this.saveDoor(params, doorNum, idx)
        }).catch(err => {
          this.clickSubmit = false
          this.loadObj.close()
        })
      },

      /**
       * 更新柜门
       */
      updateDoor(params, ids, idx = 0, type = 0) {
        if (ids.length == idx) {
          if(type == 1){
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.clickSubmit = false
            this.drawerStatus = false
            this.getList()
            this.loadObj.close()
          }
          return
        }
        let nparams = {
          deviceSn: ids[idx].deviceSn,
          slotNo: ids[idx].slotNo,
          id: ids[idx].id,
          status: ids[idx].status
        }
        if(params.modeId){
          nparams.specId = ids[idx].specId
          nparams.modeId = params.modeId
        }else if(params.specId){
          nparams.modeId = ids[idx].modeId
          nparams.specId = params.specId
        }
        this.$post('iot-saas-device/admin/locker/stock/update', nparams).then(res => {
          idx++
          this.updateDoor(params, ids, idx, type)
        }).catch(err => {
          if(type == 1){
            this.clickSubmit = false
            this.loadObj.close()
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
