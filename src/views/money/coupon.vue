<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="'券名称'">
          <el-input v-model="form.couponName" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="setRows(3, {}, 1)"><i class="el-icon-plus el-icon--left" />{{ '添加优惠券' }}</el-button>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/money/couponUser`})">{{ '领取记录' }}</el-button>
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
          <el-table-column :label="item.name" v-if="item.key == 'couponDeviceType'">
            <template slot-scope="scope">
              {{ myDeviceId[scope.row.couponDeviceType] || '' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'couponDiscountType'">
            <template slot-scope="scope">
              {{ couponDists[scope.row.couponDiscountType] ? couponDists[scope.row.couponDiscountType].distLable : '' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'couponStartTime'">
            <template slot-scope="scope">
              <div>{{ scope.row.couponStartTime }}</div>
              <div class="text-danger">{{ scope.row.conponEndTime }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'createTime'">
            <template slot-scope="scope">
              <div>{{ scope.row.createTime }}</div>
              <div class="text-danger">{{ scope.row.updateTime }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || ''" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="110">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <!-- <el-button type="text" @click="setRows(3, scope.row, 2, scope.$index)">{{ $t('public.edit') }}</el-button>
              <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('system.deleteDictionary')" @onConfirm="setRows(2, scope.row, 1, scope.$index)">
                <el-button type="text" class="text-danger" slot="reference">{{ $t('public.delete') }}</el-button>
              </el-popconfirm> -->
              <el-button type="text" @click="$router.push({path: `/userManage?couponId=${scope.row.id}`})">赠送</el-button>
              <el-button type="text" @click="$router.push({path: `/money/couponUser?couponId=${scope.row.id}`})">领取记录</el-button>
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
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()" label-position="left" label-width="100px" style="width: 500px;">
          <el-form-item :label="'优惠方式'">
            <el-select v-model="dform.couponDiscountType">
              <el-option :label="item.distLable" :value="parseInt(item.distValue)" :key="index" v-for="(item, index) in couponDists" />
            </el-select>
          </el-form-item>
          <template v-if="dform.couponDiscountType == 1">
            <el-form-item :label="'优惠时长'">
              <el-input v-model="dform.couponDiscountDetail.timeDedution" :placeholder="$t('public.enter')">
                <template slot="append">{{ $t('public.minute') }}</template>
              </el-input>
            </el-form-item>
          </template>
          <template v-if="dform.couponDiscountType == 2">
            <el-form-item :label="'满'">
              <div class="flex">
                <el-input v-model="dform.couponDiscountDetail.maxMoney" :placeholder="$t('public.enter')">
                  <template slot="append">元减</template>
                </el-input>
                <el-input v-model="dform.couponDiscountDetail.reduceMoney" :placeholder="$t('public.enter')" class="ml-10">
                  <template slot="append">元</template>
                </el-input>
              </div>
            </el-form-item>
          </template>
          <template v-if="dform.couponDiscountType == 3">
            <el-form-item :label="'优惠折扣'">
              <el-input v-model="dform.couponDiscountDetail.discount" :placeholder="$t('public.enter')">
                <template slot="append">折</template>
              </el-input>
            </el-form-item>
          </template>
          <el-form-item :label="'可用设备'">
            <el-select v-model="dform.couponDeviceType">
              <el-option :label="item" :value="idx" :key="idx" v-for="(item, idx) in myDeviceId" />
            </el-select>
          </el-form-item>
          <el-form-item :label="'名称'">
            <el-input v-model="dform.couponName" :placeholder="$t('public.enter')"></el-input>
          </el-form-item>
          <el-form-item :label="'描述'">
            <el-input v-model="dform.couponDescription" :placeholder="$t('public.enter')"></el-input>
          </el-form-item>
          <el-form-item :label="'总份数'">
            <el-input v-model="dform.couponMaxCount" :placeholder="$t('public.enter')"></el-input>
          </el-form-item>
          <el-form-item :label="'领取开始时间'">
            <el-date-picker v-model="dform.couponReceiveStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="`${$t('public.pleaseTime')}`" :picker-options="pickerOptionsStart" >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="'使用开始时间'">
            <el-date-picker v-model="dform.couponStartTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="`${$t('public.pleaseTime')}`" :picker-options="pickerOptionsStart">
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="'使用结束时间'">
            <el-date-picker v-model="dform.conponEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="`${$t('public.pleaseTime')}`" :picker-options="pickerOptionsStart">
            </el-date-picker>
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
      pickerOptionsStart: {
        disabledDate: (time) => {
          return time.getTime() < Date.now()
        },
        onPick: (time) => {
          //当第一时间选中才设置禁用
          if (time.minDate && !time.maxDate) {
            this.timeOptionRange = time.minDate
          }
          if (time.maxDate) {
            this.timeOptionRange = null
          }
        }
      },

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

      couponDists: {}, // 语言
      modules: {}, // 模块

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      dialogTitle: {
        1: '添加优惠券',
        2: '编辑优惠券'
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
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    Ability() {
      return this.$store.getters.Ability
    },
    defaultColumn() {
      return [
        {
          key: 'couponName',
          val: true,
          name: '名称'
        },
        // {
        //   key: 'couponOrderType',
        //   val: true,
        //   name: '使用订单类型'
        // },
        {
          key: 'couponDeviceType',
          val: true,
          name: '可使用设备'
        },
        {
          key: 'couponDiscountType',
          val: true,
          name: '优惠方式'
        },
        {
          key: 'couponDiscountDetail',
          val: true,
          name: '优惠详情'
        },
        {
          key: 'couponDescription',
          val: true,
          name: '描述'
        },
        {
          key: 'couponMaxCount',
          val: true,
          name: '总份数'
        },
        {
          key: 'couponCount',
          val: true,
          name: '剩余份数'
        },
        {
          key: 'couponReceiveStartTime',
          val: true,
          name: '开始领取时间',
          width: 200
        },
        {
          key: 'couponStartTime',
          val: true,
          name: '使用时间',
          width: 200
        },
        {
          key: 'createTime',
          val: true,
          name: '操作时间',
          width: 200
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
        key: 'COUPON_DISCOUNT_TYPE'
      }).then(res => {
        this.couponDists = arrayToObj(res, 'distValue')
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
      let url = 'iot-saas-basic/admin/couponManage/list'
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
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
          if (dialogType == 1) {
            this.dform = {
              couponDiscountDetail: {}
            }
          }else if (dialogType == 2) {
            let json = JSON.parse(JSON.stringify(row))
            if(json.couponDiscountDetail){
              json.couponDiscountDetail = JSON.parse(json.couponDiscountDetail)
            } else {
              json.couponDiscountDetail = {}
            }
            this.dform = json
          }
          break
      }
    },

    /**
     * 弹窗确认
     */
    async dialogConfirm(row = {}) {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      switch (this.dialogType) {
        case 1:
          this.$post('iot-saas-basic/admin/couponManage/save', params).then(res => {
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
