<template>
    <div>
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
        @saveXlsx="saveXlsx">
        <template v-slot:defult>
          <el-form-item :label="$t('public.chenghu')">
            <el-input :placeholder="$t('public.enter')" v-model="form.name" />
          </el-form-item>
          <el-form-item :label="$t('userManage.telephone')">
            <el-input :placeholder="$t('public.enter')" v-model="form.telephone" />
          </el-form-item>
        </template>
      </condition>
  
      <div class="pl-15 pr-15 pb-5 bg-white">
        <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
          <el-table-column :label="$t('public.chenghu')" width="150">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('userManage.telephone')" width="150">
            <template slot-scope="scope">
              {{ scope.row.telephone }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.address')" min-width="250">
            <template slot-scope="scope">
              {{ scope.row.quotationContent }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.submitTime')" width="170">
            <template slot-scope="scope">
              {{ scope.row.createTime }}
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
            @pagination="getList" />
        </div>
      </div>
  
      <xlsx ref="toXlsx" :fileName="$t('public.zsuserinfo')"></xlsx>
  
      <!-- <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
        <template v-if="dialogType == 1">
          <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
            <el-form-item label="负责人">
              <el-input v-model="dform.contactPerson"></el-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogType == 2">
          <el-form class="custom-form pl-20 pr-20">
            <el-form-item label="状态">
              <el-select :placeholder="$t('public.pleaseSelect')" v-model="dform.status">
                <el-option :label="i" :value="k" v-for="(i, k) in statusObj" />
              </el-select>
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
      </el-drawer> -->
    </div>
  </template>
  
  <script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import xlsx from '@/components/xlsx/'
  export default {
    name: 'quotation',
    components: {
      Pagination,
      condition,
      xlsx
    },
    data() {
      return {
        clickSubmit: false,
        tabs: [],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        cooperationMode: {
          1: '独立品牌',
          2: '代理加盟',
          3: '合伙经营'
        },
        statusObj: {
          1: '待沟通',
          2: '有意向',
          3: '已接入',
          4: '已放弃'
        },
  
        // 弹出相关
        dialogType: 1,
        drawerStatus: false,
        dialogTitle: {
          1: '修改负责人',
          2: '修改状态'
        },
        curRow: {},
        curIdx: 0,
        dform: {},
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == '') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      if (this.$route.meta.reload) {
        this.getList()
      } else if (!this.list || this.list.length == 0) {
        this.toQuery()
      }
    },
    computed: {
      agentInfo() {
      return this.$store.getters.agentInfo
    },
    },
    mounted() {
  
    },
    methods: {
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
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        if(this.agentInfo.userType !='admin'){
          params.brandId = this.agentInfo.brandId;
        }
        
        this.$post('iot-saas-basic/admin/brand/quotation/query', params).then(res => {
          if (this.outStatus) {
            this.list = res ? res.rows : []
            let end = false
            if (params.size > this.list.length) end = true
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(end, Math.ceil(res.total / params.size), () => {
                if (end) {
                  this.outStatus = false
                  this.toQuery()
                } else {
                  this.listQuery.page += 1
                  this.getList()
                }
              })
            })
          } else {
            this.listLoading = false
            this.list = res ? res.rows : []
            this.clickSubmit = false
            if (params.page == 0) {
              this.listTotal = res ? res.total : 0
              this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 65
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
       * 操作商户
       * @param {Object} type 1 dialog类型  2  3 drawer类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 3:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            switch (dialogType) {
              case 1:
                this.dform = {
                  contactPerson: row.contactPerson
                }
              break
              case 2:
                this.dform = {
                  status: row.status
                }
              break
              default:
                this.dform = {}
              break
            }
            this.drawerStatus = true
            break
        }
      },
  
      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if (this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1: case 2:
            params.id = curRow.id
            this.$post('iot-saas-basic/admin/brand/quotation/updateStatus', params).then(res => {
              this.$message({
                message: this.$t('public.operationSuccessful'),
                type: 'success'
              })
              if(this.dialogType == 1){
                curRow.contactPerson = params.contactPerson
              }else{
                curRow.status = params.status
              }
              this.drawerStatus = false
              this.clickSubmit = false
            }).catch(err => {
              console.log(err)
              this.clickSubmit = false
            })
            break
        }
      },
    }
  }
  </script>
  
  <style lang="scss" scoped></style>
  