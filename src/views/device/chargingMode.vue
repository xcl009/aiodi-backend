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
          <el-table-column :label="item.name" :width="item.width || 110" v-if="item.key == 'method'">
            <template slot-scope="scope">
              {{ method[scope.row.method] }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'desc'">
            <template slot-scope="scope">
              {{ getMethodDesc(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'state'">
            <template slot-scope="scope">
              {{ scope.row.state ? '禁用' : '正常' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :width="item.width || 110" v-else-if="item.key == 'operate'">
            <template slot-scope="scope">
              <div class="flex flex-wrap operate">
                <template>
                  <el-button type="text" @click="setRows(1, scope.row, 2)">{{ $t('public.edit') }}</el-button>
                  <!-- <el-popconfirm
                    class="pop"
                    cancel-button-type=""
                    icon="el-icon-info"
                    icon-color="#FF7D00"
                    :title="'确定删除此规格吗？'"
                    @onConfirm="setRows(2, scope.row, 1, scope.$index)"
                  >
                    <el-button type="text" slot="reference"><span class="text-danger">{{ $t('public.delete') }}</span></el-button>
                  </el-popconfirm> -->
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
            <el-radio-group v-model="dform.method" size="medium">
              <el-radio-button :label="v" v-for="(i, v) in method">{{ i }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <template v-if="dform.method == '1'">
            <el-form-item :label="'计费金额'" prop="billingAmount" key="billingAmount1">
              <el-input type="number" v-model="dform.billingAmount"><template slot="append">{{ siteInfo.currencySymbol }}</template></el-input>
            </el-form-item>
          </template>
          <template v-if="['2', '3'].indexOf(dform.method) > -1">
            <el-form-item :label="'预付模式'">
              <el-switch v-model="dform.prepaidAmountSwitch" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item type="number" :label="'预付金额'" prop="prepaidAmount" v-if="dform.prepaidAmountSwitch == 1">
              <el-input v-model="dform.prepaidAmount"><template slot="append">{{ siteInfo.currencySymbol }}</template></el-input>
            </el-form-item>
            <el-form-item :label="'免费时长'" prop="freeDuration">
              <el-input v-model="dform.freeDuration" type="number" class="input-select">
                <el-select v-model="dform.freeDurationType" slot="append">
                  <el-option :label="v" :value="parseInt(i)" v-for="(v, i) in timeList" :key="i"></el-option>
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
                    <el-input type="number" v-model="dform.initialDuration" class="ml-10 input-select">
                      <el-select v-model="dform.initialDurationType" slot="append">
                        <el-option :label="v" :value="parseInt(i)" v-for="(v, i) in timeList" :key="i"></el-option>
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
                    <el-option :label="v" :value="parseInt(i)" v-for="(v, i) in timeList" :key="i"></el-option>
                  </el-select>
                </el-input>
                </div>
              </div>
            </el-form-item>
            <el-form-item type="number" :label="'封顶金额'" prop="capAmount">
              <el-input type="number" v-model="dform.capAmount">
                <template slot="append">
                  {{ siteInfo.currencySymbol }}
                </template>
              </el-input>
            </el-form-item>
            <el-form-item :label="'状态'">
              <el-switch v-model="dform.state" :active-value="0" :inactive-value="1" />
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
            key: 'method',
            val: true,
            name: '计费方式',
          },
          {
            key: 'name',
            val: true,
            name: '模式名称',
            width: 180,
          },
          {
            key: 'desc',
            val: true,
            name: '说明',
            width: 'auto',
          },
          {
            key: 'updateTime',
            val: true,
            name: '修改时间',
            width: 180,
          },
          {
            key: 'state',
            val: true,
            name: '状态',
          },
          // {
          //   key: 'startTime',
          //   val: true,
          //   name: '默认规格',
          //   width: 150
          // },
          {
            key: 'operate',
            val: true,
            name: '操作',
            width: 110
          }
        ]
      },
      timeList() {
        return {
          1: this.$t('public.minute'),
          2: this.$t('public.huor'),
          3: this.$t('public.day'),
        }
      },
      method(){
        return {
          1: '按次收费',
          2: '计时收费',
          3: '首期差异收费',
        }
      },
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {},
        form: {},

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
      this.getList()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        this.$get('iot-saas-device/admin/locker/spec/loadAll').then((res) => {
          this.list = res
          if (this.outStatus) {
            this.$nextTick(() => {
              this.$refs['toXlsx'].saveTableXlsx(true, 1,  () => {
                this.outStatus = false
                this.toQuery()
              })
            })
          }else{
            this.listLoading = false
            this.clickSubmit = false
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
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
                  freeDurationType: 1,
                  billingCycleType: 1,
                  initialDurationType: 1,
                  prepaidAmountSwitch: 1,
                  freeDuration: 0,
                  state: 0
                }
              break
              case 2:
                let timeKey = ['freeDuration','billingCycle','initialDuration']
                timeKey.map(key => {
                  if(row[key]){
                    row[`${key}Type`] = this.getTimeUnit(row[key], 1)
                    row[key] = this.getTimeUnit(row[key], 2)
                  }
                })
                this.dform = JSON.parse(JSON.stringify(row))
                console.log(this.dform)
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
            this.$refs['dform'].validate((valid, object) => {
              if (valid) {
                params.brandId = this.agentInfo.brandId
                let timeKey = ['freeDuration','billingCycle','initialDuration']
                timeKey.map(key => {
                  if(params[key]){
                    params[key] = parseInt(params[key]) * (params[`${key}Type`] == 3 ? 1440 : params[`${key}Type`] == 2 ? 60 : 1)
                  }
                })
                console.log(params)
                this.$post(`iot-saas-device/admin/locker/spec/${this.drawerType == 1 ? 'save' : 'update'}`, params).then(res => {
                  this.$message({
                    message: this.$t('public.operationSuccessful'),
                    type: 'success'
                  })
                  this.$set(curRow, 'remark', params.remark)
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

      /**
       * 展示计费
       */
      getMethodDesc(row){
        let desc = ''
        switch(parseInt(row.method)){
          case 1:
            desc = `单次收费${this.formatCurrency(row.billingAmount)}`
          break
          case 2:
            desc = `免费${this.getTimeUnit(row.freeDuration)},${this.getTimeUnit(row.billingCycle)}${this.formatCurrency(row.billingAmount)},封顶${this.formatCurrency(row.capAmount)}`
          break
          case 3:
            desc = `免费${this.getTimeUnit(row.freeDuration)},前${this.getTimeUnit(row.initialDuration)}${this.formatCurrency(row.initialAmount)},${this.getTimeUnit(row.billingCycle)}${this.formatCurrency(row.billingAmount)},封顶${this.formatCurrency(row.capAmount)}`
          break
        }
        return desc
      },

      /**
       * 根据分钟数判断单位
       */
      getTimeUnit(num, type = 0){
        num = parseInt(num)
        let timeMinute = {1: 1, 2: 60, 3: 1440}, timeType = (num == 0 ? 1 : num % 1440 == 0 ? 3 : num % 60 == 0 ? 2 : 1)
        num = num / timeMinute[timeType]
        return type == 2 ? num : type == 1 ? timeType : num + this.timeList[timeType]
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
