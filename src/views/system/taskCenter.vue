<template>
  <div>
    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <el-button type="primary" size="small" @click="setRows(3, {}, 1)"><i class="el-icon-plus el-icon--left" />添加任务</el-button>
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
              <div class="text-danger">{{ scope.row.couponEndTime }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'createTime'">
            <template slot-scope="scope">
              <div>{{ scope.row.createTime }}</div>
              <div class="text-danger">{{ scope.row.updateTime }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.key == 'status'">
            <template slot-scope="scope">
              <div v-if="unixTime(scope.row.couponEndTime) <= currentTime()">已过期</div>
              <div v-else-if="scope.row.couponCount <= 0">已领完</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || ''" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="200">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <!-- <el-button type="text" @click="setRows(3, scope.row, 2, scope.$index)">{{ $t('public.edit') }}</el-button> -->
              <el-button type="text" @click="$router.push({path: `/userManage?couponId=${scope.row.id}`})" v-if="unixTime(scope.row.couponEndTime) > currentTime()">{{ $t('coupon.couponGrant') }}</el-button>
              <el-button type="text" @click="$router.push({path: `/system/couponUser?couponId=${scope.row.id}`})">{{ $t('coupon.couponGrantRecord') }}</el-button>
              <div style="color:'#ccc';margin-left:6px" v-if="unixTime(scope.row.couponEndTime) <= currentTime()">已禁用</div>
              <el-popconfirm v-else :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('coupon.couponDisableText')" @onConfirm="setRows(2, scope.row, 1, scope.$index)">
                <el-button type="text" class="text-danger" slot="reference">{{ $t('coupon.couponDisable') }}</el-button>
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
        <el-form class="custom-form pl-20 pr-20" ref="couponForm" :model="dform" :rules="formRules" @submit.native.prevent="dialogConfirm()" label-position="top" style="width: 600px;">
          <el-form-item :label="$t('taskCenter.name') || '任务名称'" prop="name">
            <el-input v-model="dform.name" :placeholder="$t('public.enter')"></el-input>
          </el-form-item>
          <!-- <el-form-item :label="$t('taskCenter.type') || '任务类型'" prop="type">
            <el-select v-model="dform.type">
              <el-option :label="item.distLable" :value="parseInt(item.distValue)" :key="index" v-for="(item, index) in couponDists" />
            </el-select>
          </el-form-item> -->
          <el-form-item :label="$t('taskCenter.triggerEvent') || '触发方式'">
            <el-select v-model="dform.triggerEvent">
              <el-option :label="item" :value="key" :key="key" v-for="(item, key) in triggerEvent" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('taskCenter.rewardJson') || '达成奖励'">
            <div class="pl-15 pr-15 pt-10 pb-10 radius-5" style="border: thin solid red;">
              <div class="pb-5 pt-5" v-for="item in rewardJson[dform.triggerEvent]">
                <div class="flex align-center" v-if="item.key == 'coupon'">
                  <div style="width: 80px;">优惠券</div>
                  <el-input placeholder="优惠券ID" v-model="item.val" class="flex-sub"></el-input>
                  <el-input placeholder="数量" v-model="item.extraParams.count" class="ml-20 flex-sub">
                    <template slot="append">张</template>
                  </el-input>
                </div>
                <div class="flex align-center" v-if="item.key == 'points'">
                  <div style="width: 80px;">积分</div>
                  <el-input placeholder="数量" v-model="item.val" class="flex-sub"></el-input>
                </div>
              </div>
            </div>
          </el-form-item>



          <el-form-item :label="$t('taskCenter.conditionJson') || '达成规则'" prop="triggerEvent">
            <el-select v-model="dform.conditionJson.idx">
              <el-option :label="index" :value="item.key" :key="index" v-for="(item, index) in conditionJson[dform.triggerEvent]" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('taskCenter.rewardJson') || '达成奖励'" prop="triggerEvent">
            <el-select v-model="dform.rewardJson">
              <el-option :label="item.distLable" :value="parseInt(item.distValue)" :key="index" v-for="(item, index) in couponDists" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('taskCenter.limitConfig') || '其他限制'" prop="triggerEvent">
            <el-select v-model="dform.rewardJson">
              <el-option :label="item.distLable" :value="parseInt(item.distValue)" :key="index" v-for="(item, index) in couponDists" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('coupon.couponGrantTime')" prop="startTime">
            <el-date-picker v-model="dform.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="`${$t('public.pleaseTime')}`" :picker-options="pickerOptionsStart" >
            </el-date-picker>
          </el-form-item>
          <el-form-item :label="$t('coupon.couponUseStart')" prop="endTime">
            <el-date-picker v-model="dform.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="`${$t('public.pleaseTime')}`" :picker-options="pickerOptionsStart">
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
import { arrayToObj, unixTime,currencySymbolposition } from '@/utils/index'
export default {
  name: 'coupon',
  components: {
    condition,
    selectSearch,
    Pagination,
    TableColumnSet,
    upload
  },
  data() {
    return {
      triggerEvent: {REGISTER: '注册', INVITE_REGISTER: '邀请注册'},
      conditionJson: {
        REGISTER: [
          {
            key: 'register_count',
            name: '数量',
            type: 'input',
            change: false,
            val: 1
          }
        ],
        INVITE_REGISTER: [
          {
            key: 'invite_register_count',
            name: '数量',
            type: 'input',
            change: false,
            val: 1
          }
        ]
      },
      rewardJson: {
        REGISTER: [
          {
            key: 'coupon',
            name: '优惠券',
            val: '',
            extraParams: {
              count: 1,
            }
          },
          {
            key: 'points',
            name: '积分',
            val: 0
          }
        ],
        INVITE_REGISTER: [
          {
            key: 'coupon',
            name: '优惠券',
            val: '',
            extraParams: {
              count: 1,
            }
          },
          {
            key: 'points',
            name: '积分',
            val: 0
          }
        ]
      },

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
      unixTime: unixTime,

      clickSubmit: false,
      form: {},
      list: [
        {
          name: '',
          triggerEvent: '注册',
          conditionJson: {"type": "register_count"},
          rewardJson: [{"type":"coupon","value":"1344632127680950272",extraParams:{"count":3}},{"type":"coupon","value":"1344632127680950272",extraParams:{"count":3,"isInvertUser":1}}],
          limitConfig: [{"type":"total_limit","value":8000,"name":"任务最大数量"}],
          limitConfig: [{"type":"total_limit","value":8000,"name":"任务最大数量"}],
        }
      ],
      tableMaxH: '250',
      listLoading: false,
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
        1: this.$t('coupon.couponAdd'),
        2: this.$t('coupon.couponAdd')
      },
      curRow: {},
      curIdx: 0,
      dform: {
        triggerEvent: 'REGISTER',
        conditionJson: {

        },
        rewardJson: {

        },
        limitConfig: {

        }
      },
      formRules: {

      },

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: []
    }
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  activated() {
    if (this.$route.meta.reload) {
      //this.getConfig()
      //this.toQuery()
    } else if (!this.list || this.list.length == 0) {
      //this.getConfig()
      //this.toQuery()
    }
  },
  computed: {
    siteInfo() {
      return this.$store.getters.siteInfo
    },
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
          key: 'name',
          val: true,
          name: this.$t('taskCenter.name') || '任务名称'
        },
        {
          key: 'triggerEvent',
          val: true,
          name: this.$t('taskCenter.triggerEvent') || '触发方式'
        },
        {
          key: 'conditionJson',
          val: true,
          name: this.$t('taskCenter.conditionJson') || '达成规则'
        },
        {
          key: 'rewardJson',
          val: true,
          name: this.$t('taskCenter.rewardJson') || '达成奖励'
        },
        {
          key: 'limitConfig',
          val: true,
          name: this.$t('taskCenter.limitConfig') || '其他限制'
        },
        {
          key: 'startTime',
          val: true,
          name: '开始时间',
          width: 200
        },
        {
          key: 'endTime',
          val: true,
          name: '结束时间',
          width: 200
        },
        {
          key: 'status',
          val: true,
          name: this.$t('public.status')
        }
      ]
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 获取类型和模板
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
     * 列表数据
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
     * @param {Object} type 1 dialog类型  2 删除  3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '添加' 2: '修改'
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      let that = this;
      switch (type) {
        case 1:

          break
        case 2:
          this.$get('iot-saas-basic/admin/couponManage/stop', {
            id: row.id
          }).then(res => {
            this.getList()
            row.status = 2
          })
          break
        case 3:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
          /* this.dform = {}
          if (dialogType == 1) {
            this.dform = {
              couponDiscountType: 1,
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
          } */
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
          this.$refs['couponForm'].validate((valid) => {
            if (valid) {
              params.couponDiscountDetail = JSON.stringify(params.couponDiscountDetail)
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
            } else {
              this.clickSubmit = false
            }
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
