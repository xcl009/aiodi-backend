<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('coupon.coupon')">
          <el-input v-model="form.couponName" />
        </el-form-item>
      </template>
      <template v-slot:endButton>

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
          <el-table-column :label="item.name" v-else-if="item.key == 'userName'">
            <template slot-scope="scope">
              {{ scope.row.user.nickname }}
              <div>{{ dealPhone(scope.row.user.mobile) }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'obtainType'">
            <template slot-scope="scope">
              {{ obtainType[scope.row.obtainType] }}
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
          <el-table-column :label="item.name" v-else-if="item.key == 'couponState'">
            <template slot-scope="scope">
              {{ couponState[scope.row.couponState] }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || ''" v-else></el-table-column>
        </template>
        <!-- <el-table-column :label="$t('public.operate')" width="110">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">

            </div>
          </template>
        </el-table-column> -->
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">
      <template v-if="dialogType == 1 || dialogType == 2">

      </template>
      <template v-if="[1, 2].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
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
  name: 'couponUser',
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

      couponDists: {}, // 券类型

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      dialogTitle: {
        1: ''
      },
      curRow: {},
      curIdx: 0,
      dform: {},
      langForm: {},
      obtainType: {
        1: this.$t('coupon.grantType1'),
        2: this.$t('coupon.grantType2')
      },
      couponState: {
        1: this.$t('coupon.couponState1'),
        2: this.$t('coupon.couponState2'),
        3: this.$t('coupon.couponState3')
      },


      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    next()
  },
  activated() {
    let query = this.$route.query, queryKey = ['couponId']
    for (var i in queryKey) {
      if (query[queryKey[i]]) {
        this.form[queryKey[i]] = query[queryKey[i]]
      } else {
        delete this.form[queryKey[i]]
      }
    }
    if (this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery()
    }else if (this.$route.meta.reload) {
      this.getList()
    } else if (!this.list || this.list.length == 0) {
      this.toQuery()
    } else {
      this.getConfig()
      this.toQuery()
    }
    this.urlQuery = this.$route.meta.urlQuery
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
          key: 'userName',
          val: true,
          name: this.$t('public.user')
        },
        {
          key: 'obtainType',
          val: true,
          name: this.$t('coupon.grantTypeName')
        },
        {
          key: 'couponName',
          val: true,
          name: this.$t('coupon.coupon')
        },
        {
          key: 'couponReceiveTime',
          val: true,
          name: this.$t('role.operateTime')
        },
        {
          key: 'couponUseTime',
          val: true,
          name: this.$t('public.usageTime')
        },
        {
          key: 'couponUseOrderNo',
          val: true,
          name: this.$t('public.orderNo')
        },
        {
          key: 'couponState',
          val: true,
          name: this.$t('public.status')
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
     * 获取其他信息
     */
    getOtherData(url, params) {
      return new Promise((resolve) => {
        this.$post(url, params).then(res => {
          resolve(res)
        })
      })
    },

    /**
     * 列表数据
     */
    getList() {
      let url = 'iot-saas-basic/admin/couponUserManage/findPage'
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      this.$post(url, params).then(async (res = {}) => {
        let list = res.rows || []
        if(list.length > 0){
          let uList = this.arrayKeys(list, 'userId')
          await this.getOtherData('iot-saas-user/admin/user/findByUserIds', {
            userIds: uList.join(',')
          }).then(ares => {
            list.map(item => {
              item.user = ares[item.userId]
              return item
            })
          })
        }
        this.list = list
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
     * @param {Object} type 1 dialog类型 2  3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型
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
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
