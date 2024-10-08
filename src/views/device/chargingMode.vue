<template>
  <div>
    <div class="pl-10 pr-10 pt-10 bg-white">
      <el-button type="primary" size="small" class="mb-10" @click="setRows(1, {}, 1)"><i class="el-icon-plus el-icon--left" />{{ $t('public.add') }}</el-button>

      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="doorTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="item.name" :width="item.width || 110" v-if="item.key == 'specId'">
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
          <el-form-item :label="'模式名称'" prop="name">
            <el-input v-model="dform.name"></el-input>
          </el-form-item>
          <el-form-item :label="'计费方式'">
            <el-radio-group v-model="dform.method" size="medium" :disabled="drawerType == 2">
              <el-radio-button :label="1">{{ '按次收费' }}</el-radio-button>
              <el-radio-button :label="2">{{ '计时收费' }}</el-radio-button>
              <el-radio-button :label="3">{{ '首期差异收费' }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <template v-if="dform.method == 1">
            <el-form-item :label="'计费金额'" prop="billingAmount" key="billingAmount1">
              <el-input v-model="dform.billingAmount"><template slot="append">{{ siteInfo.currencySymbol }}</template></el-input>
            </el-form-item>
          </template>
          <template v-if="[2, 3].indexOf(dform.method) > -1">
            <el-form-item :label="'预付模式'">
              <el-switch v-model="dform.prepaidAmountSwitch" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="'预付金额'" prop="prepaidAmount" v-if="dform.prepaidAmountSwitch == 1">
              <el-input v-model="dform.prepaidAmount"><template slot="append">{{ siteInfo.currencySymbol }}</template></el-input>
            </el-form-item>
            <el-form-item :label="'免费时长'" prop="freeDuration">
              <el-input v-model="dform.freeDuration"class="input-select">
                <el-select v-model="dform.freeDurationType" slot="append">
                  <el-option :label="`${wp.title}`" :value="wp.value" v-for="(wp, index) in timeList" :key="index"></el-option>
                </el-select>
              </el-input>
            </el-form-item>
            <template v-if="dform.method == 3">
              <el-form-item :label="'首期金额'" prop="initialAmount">
                <div class="flex">
                  <div>
                    <el-input type="number" v-model="dform.initialAmount">
                      <template slot="append">
                        {{ siteInfo.currencySymbol }}
                      </template>
                    </el-input>
                  </div>
                  <div>
                    <el-input v-model="dform.initialDuration" class="ml-10 input-select">
                      <el-select v-model="dform.initialDurationType" slot="append">
                        <el-option :label="`${wp.title}`" :value="wp.value" v-for="(wp, index) in timeList" :key="index"></el-option>
                      </el-select>
                    </el-input>
                  </div>
                </div>
              </el-form-item>
            </template>
            <el-form-item :label="'计费金额'" prop="billingAmount" key="billingAmount2">
              <div class='flex'>
                <div>
                  <el-input type="number" v-model="dform.billingAmount">
                    <template slot="append">
                      {{ siteInfo.currencySymbol }}
                    </template>
                  </el-input>
                </div>
                <div>
                <el-input type="number" v-model="dform.billingCycle" class="ml-10 input-select">
                  <el-select v-model="dform.billingCycleType" slot="append">
                    <el-option :label="`${wp.title}`" :value="wp.value" v-for="(wp, index) in timeList" :key="index"></el-option>
                  </el-select>
                </el-input>
                </div>
              </div>
            </el-form-item>
            <el-form-item :label="'封顶金额'" prop="capAmount">
              <el-input type="number" v-model="dform.capAmount">
                <template slot="append">
                  {{ siteInfo.currencySymbol }}
                </template>
              </el-input>
            </el-form-item>
          </template>
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

    <xlsx ref="toXlsx" :fileName="$t('moeny.revenueRecords')"></xlsx>
  </div>
</template>

<script>
  import xlsx from '@/components/xlsx/'
  import TableColumnSet from '@/components/TableColumnSet/index'
  export default {
    name: 'income',
    components: {
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
            name: '模式名称',
            width: 'auto',
          },
          {
            key: 'modeId',
            val: true,
            name: '计费方式',
          },
          {
            key: 'status',
            val: true,
            name: '描述',
          },
          {
            key: 'specId',
            val: true,
            name: '修改时间',
          },
          {
            key: 'userId',
            val: true,
            name: '状态',
          },
          {
            key: 'startTime',
            val: true,
            name: '默认规格',
            width: 150
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
        listQuery: {},
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
          1: '添加收费模式',
          2: '收费模式'
        },
        curRow: {},
        curIdx: 0,
        dform: {},
        rules: {
          name: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          billingAmount: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          freeDuration: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          initialAmount: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          initialDuration: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          prepaidAmount: [
            { required: true, message: '此项必填', trigger: 'blur' }
          ],
          capAmount: [
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
      //this.toQuery()
      //this.getSpec()
    },
    methods: {
      getSpec(){
        this.$get('iot-saas-device/admin/locker/spec/findPage', {
          page: 0,
          size: 20,
        }).then((res = {}) => {

        })
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
        this.$get('iot-saas-device/admin/locker/spec/loadAll').then((res = {}) => {
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
              case 1:
                this.dform = {
                  method: 1,
                  prepaidAmountSwitch: 1,
                  freeDurationType: '1',
                  billingCycleType: '1',
                  initialDurationType: '1',
                  freeDuration: 0
                }
              break
            }
            break
          case 2:
            this.$post('iot-saas-device/admin/locker/spec/remove', {
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
            console.log(params)
            this.$refs['dform'].validate((valid, object) => {
              if (valid) {
                this.$post(`iot-saas-device/admin/locker/spec/${this.drawerType == 1 ? 'save' : 'update'}`, params).then(res => {
                  this.$message({
                    message: that.$t('public.operationSuccessful'),
                    type: 'success'
                  })
                  this.$set(curRow, 'remark', params.remark)
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
