<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-10 fs-b2 bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery">
          <el-tab-pane :label="item" :name="name" v-for="(item, name) in deviceTab" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-form-item :label="$t('public.userNickName')">
          <el-input :placeholder="$t('public.userNickName')" v-model="form.nickname" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input :placeholder="$t('public.phone')" v-model="form.mobile" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="setRows(1, {}, 1)"><i class="el-icon-plus el-icon--left" />{{
          $t('public.add') }}</el-button>
        <el-button type="primary" size="small" class="mr-10" @click="setRows(1, {}, 3)" v-if="isBrand()">{{
          $t('public.vipCode') }}</el-button>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-15 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('public.img')" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"
              class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.nickname')" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nickname || $t('public.noNickname') }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.phone')">
          <template slot-scope="scope">
            <div>{{ dealPhone(scope.row.mobile) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('steal.timeNum')">
          <template slot-scope="scope">
            <div v-if="scope.row.feeType == 1">
              {{ parseInt(scope.row.freeTime) / 60 }}{{ $t('public.huor') }}/{{ `${scope.row.feeCycle == 1 ? $t('public.day') : scope.row.feeCycle == 7 ? $t('public.circumference') : $t('public.month')}` }}
              <span v-if="scope.row.useTime">{{ $t('steal.useOk') }}{{ unixTime(scope.row.today) + 86400 > currentTime() ? scope.row.useTime : 0 }}{{ $t('public.minute') }}</span>
            </div>
            <div v-else>
              {{ parseInt(scope.row.freeTime) / 60 }}{{ $t('public.huor') }}/{{ $t('public.few') }}
              {{ $t('steal.useOk') }}{{ unixTime(scope.row.today) + 86400 > currentTime() ? scope.row.haveUseTimes : 0 }}{{ $t('public.few') }}/{{ scope.row.freeTimes }}{{ $t('public.few') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" class="ml-0" @click="setRows(1, scope.row, 2)">{{ $t('steal.timeNum')
            }}</el-button>
            <el-button type="danger" size="mini" class="ml-0" @click="setRows(2, scope.row, 1, scope.$index)">{{
              $t('public.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false"
      width="700px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="flex align-center">
          <el-input :placeholder="$t('steal.userNameandId')" v-model="dform.nickname" class="flex-sub"
            @keyup.enter.native="searchUser" />
          <el-input :placeholder="$t('public.phone')" v-model="dform.mobile" class="flex-sub ml-15 mr-15"
            @keyup.enter.native="searchUser" />
          <el-button type="primary" @click="searchUser" :disabled="clickSubmit">{{ $t('steal.findUsers') }}</el-button>
        </div>

        <el-table class="mt-30 custom" :data="userList" :empty-text="$t('steal.notFound')" highlight-current-row
          v-if="userList.length > 0 || searchStatus">
          <el-table-column :label="$t('public.img')" width="60">
            <template slot-scope="scope">
              <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"
                class="m-auto block"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.nickname')" width="120">
            <template slot-scope="scope">
              <el-link class="cursor">{{ scope.row.nickname || $t('public.noNickname') }}</el-link>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.phone')">
            <template slot-scope="scope">
              <div>{{ dealPhone(scope.row.mobile) }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('home.source')">
            <template slot-scope="scope">
              {{ scope.row.userType == 'wechat' ? $t('payType.wx') : $t('payType.zfb') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('steal.createTime')" width="90">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.operate')">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" class="ml-0" @click="curRow = scope.row; dialogConfirm()">{{
                $t('public.add') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="dialogType == 2">
        <el-form class="custom-form pl-20 pr-20" label-width="100px" label-position="left">
          <el-form-item :label="$t('public.billingRules')">
            <el-radio-group v-model="dform.feeType">
              <el-radio-button :label="0">{{ $t('steal.nonFixed') }}</el-radio-button>
              <el-radio-button :label="1">{{ $t('steal.immobilization') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('steal.durationPerSession')" v-if="dform.feeType == 0">
            <el-input type="number" v-model="dform.freeTime">
              <span slot="append">{{ $t('public.huor') }}</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('steal.freeNum')" v-if="dform.feeType == 0">
            <div class="flex align-center">
              <el-select v-model="dform.feeCycle">
                <el-option :label=" $t('public.everyDay')" :value="1" />
                <el-option :label=" $t('public.weekly')" :value="7" />
                <el-option :label=" $t('public.monthly')" :value="30" />
              </el-select>
              <el-input type="number" v-model="dform.freeTimes" class="flex-1">
                <span slot="append">{{ $t('public.few') }}</span>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item :label="$t('steal.freeNum')" v-if="dform.feeType == 1">
            <div class="flex align-center">
              <el-select v-model="dform.feeCycle">
                <el-option :label=" $t('public.everyDay')" :value="1" />
                <el-option :label=" $t('public.weekly')" :value="7" />
                <el-option :label=" $t('public.monthly')" :value="30" />
              </el-select>
              <el-input type="number" v-model="dform.freeTime" class="flex-1">
                <span slot="append">{{ $t('public.huor') }}</span>
              </el-input>
            </div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" label-width="100px" label-position="left">
          <el-form-item :label="$t('public.applet')" v-if="wechatList.length > 1">
            <el-select v-model="dform.appId" :placeholder="$t('public.applet')" @change="toQuery()">
              <el-option :label="item.appName" :value="item.appId" v-for="(item, key) in wechatList" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.deviceType')">
            <el-radio-group v-model="dform.deviceTypeCode" class="pl-10">
              <el-radio v-for="(item, name) in deviceTab" :label="name">{{ item }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('steal.vipNum')">
            <el-input type="number" v-model="dform.userNumber">
              <span slot="append">{{ $t('steal.people') }}</span>
            </el-input>
            <div class="pt-5 line-default">{{ $t('steal.vipNumText') }}<span class="text-danger">{{
              $t('steal.vipNumText1') }}</span></div>
          </el-form-item>
          <el-form-item :label="$t('public.freeTime')">
            <el-input type="number" v-model="dform.freeTime">
              <span slot="append">{{ $t('public.huor') }}</span>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('steal.dailyUsageFrequency')">
            <el-input type="number" v-model="dform.freeTimes">
              <span slot="append">{{ $t('public.few') }}</span>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 4">
        <div class="text-center">
          <img :src="codeImg" width="150px" height="150px" alt="" @click="saveImg">
          <div class="mt-20">{{ $t('steal.text17') }}<span class="text-danger">{{ $t('steal.text18') }}</span></div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false" v-if="dialogType != 4">{{
          $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogStatus = false" v-if="dialogType == 4">{{ $t('steal.gotIt')
        }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm" :disabled="clickSubmit"
          v-else-if="dialogType != 1">{{ $t('public.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import {
  dealPhone,
  unixTime
} from '@/utils/index'
export default {
  name: 'freeQuota',
  components: {
    condition,
    selectSearch
  },
  computed: {
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    dialogTitle() {
      return {
        1: this.$t('steal.addFreeVip'),
        2: this.$t('steal.editVipTime'),
        3: this.$t('steal.vipCode'),
        4: this.$t('public.vipCode')
      }
    },
  },
  data() {
    return {
      unixTime: unixTime,
      dealPhone: dealPhone,
      clickSubmit: false,
      deviceTab: {},
      tableMaxH: '250',
      list: [],
      listLoading: false,
      listQuery: {
        storeId: this.$route.query.id,
        deviceTypeCode: ''
      },
      form: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
      codeImg: '',
      wechatList: [],
      userList: [],
      searchStatus: false
    }
  },
  mounted(options) {
    let deviceTab = {}
    for (var i in this.myDeviceId) {
      if (this.checkAbility([`${i}_FREEQUOTA`], 3)) {
        deviceTab[i] = this.myDeviceId[i]
      }
    }
    this.listQuery.deviceTypeCode = Object.keys(deviceTab)[0]
    this.deviceTab = deviceTab
    this.toQuery()
    if (this.isBrand()) {
      this.getWechatList()
    }
  },
  methods: {
    /**
     * 获取列表
     */
    getWechatList() {
      this.$get('iot-saas-pay/admin/pay/config/wechat/list', {
        page: 0,
        size: 20
      }).then((res = {}) => {
        if (res.rows && res.rows.length > 0) {
          this.wechatList = res.rows
        }
      })
    },

    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.form = {}
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery)
      this.$get('iot-saas-order/admin/free/quota/user/list', params).then(res => {
        this.list = res
        this.listLoading = false
        this.clickSubmit = false
        this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 搜索用户
     */
    searchUser() {
      let that = this;
      var params = {
        nickname: this.dform.nickname,
        mobile: this.dform.mobile,
        page: 0,
        size: 5
      }
      if (!params.nickname && !params.mobile) {
        this.$message({
          message: that.$t('steal.serchMessage'),
          type: 'error'
        })
        return
      }
      if (params.nickname && !isNaN(params.nickname)) {
        params.idLastNine = params.nickname
        delete params.nickname
      }
      this.searchStatus = false
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.$get('iot-saas-user/api/user/query', params).then(res => {
        this.userList = res.rows
        this.searchStatus = true
        this.clickSubmit = false
      }).catch(err => {
        this.clickSubmit = false
      })
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前商户
     * @param {Object} dialogType dialog内容显示类型 1: '添加免费用户', 2: ''
     * @param {Object} idx 当前商户所在位置
     */
    setRows(type, row, dialogType, idx) {
      let that = this;
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dform = {}
          if (dialogType == 2) {
            this.dform = {
              freeTime: parseInt(row.freeTime) / 60,
              freeTimes: row.freeTimes,
              feeType: row.feeType,
              feeCycle: row.feeCycle,
              userId: row.userId
            }
          } else if (dialogType == 3) {
            if (this.wechatList.length == 0) {
              this.$message({
                message: that.$t('steal.notConfigured'),
                type: 'success'
              })
              return
            }
            this.dform = {
              appId: this.wechatList[0].appId,
              deviceTypeCode: this.listQuery.deviceTypeCode
            }
          }
          this.dialogStatus = true
          break
        case 2:
          this.$alert(that.$t('steal.message'), that.$t('steal.message1'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                let params = JSON.parse(JSON.stringify(this.listQuery))
                params.userId = row.userId
                this.$post('iot-saas-order/admin/free/quota/user/delete', params).then(res => {
                  this.dialogStatus = false
                  this.$message({
                    message: that.$t('public.deleteSuccess'),
                    type: 'success'
                  })
                  this.list.splice(idx, 1)
                  this.clickSubmit = false
                })
              }
            }
          })
          break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm() {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          params = JSON.parse(JSON.stringify(this.listQuery))
          params.userId = curRow.id
          this.$post('iot-saas-order/admin/free/quota/user/add', params).then(res => {
            this.$message({
              type: 'success',
              message: that.$t('public.addSuccess')
            })
            this.getList()
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 2:
          params = Object.assign({}, params, this.listQuery)
          params.freeTime = parseFloat(params.freeTime) * 60
          this.$post('iot-saas-order/admin/free/quota/user/update', params).then(res => {
            this.$message({
              type: 'success',
              message: that.$t('public.editSuccess')
            })
            curRow.freeTime = params.freeTime
            curRow.freeTimes = params.freeTimes
            curRow.feeType = params.feeType
            curRow.feeCycle = params.feeCycle
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 3:
          params.storeId = this.listQuery.storeId
          params.freeTime = parseFloat(params.freeTime) * 60
          if (isNaN(params.userNumber) || params.userNumber <= 0) {
            this.$message({
              type: 'error',
              message: that.$t('steal.message2')
            })
            return
          } else if (isNaN(params.freeTime) || params.freeTime <= 0) {
            this.$message({
              type: 'error',
              message: that.$t('steal.message3')
            })
            return
          } else if (isNaN(params.freeTimes) || params.freeTimes <= 0) {
            this.$message({
              type: 'error',
              message: that.$t('steal.message4')
            })
            return
          } else if (!params.appId) {
            this.$message({
              type: 'error',
              message: that.$t('steal.message5')
            })
            return
          }
          this.$post('iot-saas-order/admin/free/quota/user/secene', params).then(res => {
            this.$post('iot-saas-pay/wechat/user/vipCode', {
              sence: res,
              appId: params.appId
            }).then(codeRes => {
              this.codeImg = `data:image/jpg;base64,${codeRes}`
              this.dialogType = 4
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },

    /**
     * 保存会员码
     */
    saveImg() {
      const a = document.createElement('a')
      a.href = this.codeImg
      a.setAttribute('download', '会员码.png')
      a.click()
    }
  }
}
</script>

<style lang="scss" scoped></style>
