<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('brand.brandName')">
          <el-input v-model="form.name" :placeholder="$t('brand.brandName')" />
        </el-form-item>
        <el-form-item :label="$t('public.phone')">
          <el-input v-model="form.mobile" :placeholder="$t('public.phone')" />
        </el-form-item>
        <el-form-item :label="$t('public.status')">
          <el-select :placeholder="$t('public.status')" v-model="form.status" @change="toQuery()">
            <el-option :label="$t('brand.effective')" :value="1" />
            <el-option :label="$t('brand.invalid')" :value="2" />
          </el-select>
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="$router.push({ path: `/brand/addBrand` })"><i
            class="el-icon-circle-plus-outline el-icon--left" />{{ $t('brand.addBrand') }}</el-button>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <table-column-set storageKey="brandTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column :label="$t('brand.brandInfo')" width="150" v-if="item.key == 'name'">
            <template slot-scope="scope">
              <div class="mb-5 cursor" @click="copyText(scope.row.id)">{{ scope.row.name || $t('brand.brandName') }}</div>
              <el-tooltip class="item" effect="dark" :content="scope.row.brandUser.mobile" placement="top"
                v-if="scope.row.brandUser">
                <div>{{ dealPhone(scope.row.brandUser.mobile) }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('brand.brandInfo')" min-width="160" v-else-if="item.key == 'companyName'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar shape="square" :size="35" fit="cover" :src="scope.row.logo"></el-avatar>
                <div class="pl-5 flex-sub">{{ scope.row.companyName || '--' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('brand.timeOfEntry')" width="130" v-else-if="item.key == 'createTime'">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('brand.regimentalCommander')" width="100" v-else-if="item.key == 'isLeader'">
            <template slot-scope="scope">
              <div class="text-primary cursor" v-if="scope.row.isLeader == 1">{{ $t('brand.regimentalCommander') }}</div>
              <div class="text-primary cursor" @click="setRow(3, scope.row)"
                v-else-if="scope.row.isLeader == 0 && scope.row.leaderBrandId == 0">{{ $t('brand.setAsTeamLeader') }}
              </div>
              <div class="mb-5" v-else>{{ scope.row.leaderBrandName || '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('brand.category')" width="200" v-else-if="item.key == 'brandDeviceType'">
            <template slot-scope="scope">
              <div>
                <span class="mr-20 inline" v-for="item in scope.row.brandDeviceType">
                  {{ item.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('brand.numberOfDevices')" min-width="100" v-else-if="item.key == 'deviceCount'">
            <template slot-scope="scope">
              <div class="inline text-left" @click="$router.push({ path: `/device?brandId=${scope.row.id}` })">
                <div>{{ $t('public.all') }}：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}
                </div>
                <div>{{ $t('public.shipped') }}：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].bindStoreNumber :
                  '0' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.orderNum')" width="120" v-else-if="item.key == 'orderCount'">
            <template slot-scope="scope">
              <div class="inline text-left">
                <div>{{ $t('payType.wx') }}：<el-link type="primary"
                    @click="$router.push({ path: `/order?brandId=${scope.row.id}&sourceType=1` })">
                    {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx : 0 }}
                  </el-link>
                </div>
                <div>{{ $t('payType.zfb') }}：<el-link type="primary"
                    @click="$router.push({ path: `/order?brandId=${scope.row.id}&sourceType=2` })">
                    {{ orderCount[scope.row.id] ? orderCount[scope.row.id].ali : 0 }}
                  </el-link>
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="下级总数" width="150">
            <template slot-scope="scope">
              <div class="inline text-left">
                <div class="mb-5">直属下级：{{ scope.row.child_agent_num || 0}}</div>
                <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column :label="`${$t('public.aTurnover')}(${$t('public.element')})`" width="120"
            v-else-if="item.key == 'amount'">
            <template slot-scope="scope">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 120" v-else></el-table-column>
        </template>
        <el-table-column :label="$t('public.operate')" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({ path: `/order?brandId=${scope.row.id}` })">{{
                $t('brand.orderList') }}</el-button>
              <el-button type="primary" size="mini" @click="$router.push({ path: `/store?brandId=${scope.row.id}` })">{{
                $t('brand.storeList') }}</el-button>
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 2)">{{ $t('brand.contractManagement')
              }}</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/market/appManage?brandId=${scope.row.id}` })">{{ $t('public.giftService')
                }}</el-button>
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/brand/addBrand?brandId=${scope.row.id}` })">{{
                  $t('public.modifyingInformation') }}</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini" class="" @click="">{{ $t('public.adds') }}<i
                    class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="$router.push({ path: `/market?brandName=${scope.row.name}` })">{{
                    $t('brand.addedService') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="toLogin(scope.row)">{{ $t('brand.branding') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 1)">{{ $t('brand.deductionVoucher')
                  }}</el-dropdown-item>
                  <el-dropdown-item @click.native="copyloginUrl(scope.row)">{{ $t('brand.loginAddress')
                  }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 3)">{{ $t('brand.toMiniProgram')
                  }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(5, scope.row)">{{ $t('brand.cache') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 11)">{{ $t('public.setLoginPassword')
                  }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(1, scope.row, scope.$index)" v-if="scope.row.status == 1">{{
                    $t('brand.deleteBrand') }}</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(2, scope.row, scope.$index)" v-else>{{
                    $t('brand.accountRecovery') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('brand.voucherAmount')">
            <el-input v-model="dform.amount">
              <template slot="append">{{ $t('public.element') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="text-danger" style="width: 400px; max-width: 100%;">{{ $t('public.tips') }}：{{
              $t('brand.renewText') }}{{ dform.amount || 0
  }}{{ $t('public.element') }}，{{ $t('brand.renewText1') }}{{ (dform.amount || 0) * 3 }}{{
  $t('public.element') }}，{{ $t('brand.renewText2') }}。</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="flex flexv pl-20 pr-20 pb-20" style="width: 600px; height: 100%;">
          <upload :uploadText="$t('brand.uploadContract')" accept=".pdf,.PDF" :upObj="{ fileType: 'pdfFile' }"
            @onSuccess="uploadPdf" />
          <div class="mt-20 mb-15 text-black">{{ $t('brand.contractInformation') }}</div>
          <div class="text-gray" v-if="!dform.pdfUrl">{{ $t('brand.contractNotUploaded') }}</div>
          <div class="flex1">
            <iframe ref="pdfCotainer" :src="dform.pdfUrl" width="100%" height="100%" style="min-height: 600px;"></iframe>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()"
          v-if="dform.jumpDetail && dform.jumpDetail.wx">
          <h4>{{ $t('payType.wx') }}</h4>
          <template v-for="item in curRow.brandDeviceType">
            <el-form-item :label="item.name">
              <el-input v-model="dform.jumpDetail.wx[`${item.code}`]" :placeholder="$t('brand.appidText')"></el-input>
            </el-form-item>
          </template>
          <h4>{{ $t('payType.zfb') }}</h4>
          <template v-for="item in curRow.brandDeviceType">
            <el-form-item :label="item.name">
              <el-input v-model="dform.jumpDetail.ali[`${item.code}`]" :placeholder="$t('brand.appidText')"></el-input>
            </el-form-item>
          </template>
          <el-form-item>
            <div class="text-danger" style="width: 400px; max-width: 100%;">
              {{ $t('brand.message') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 11">
        <el-form class="pl-20 pr-20 custom-form">
          <el-form-item :label="$t('public.loginPassword')">
            <el-switch v-model="dform.password" />
          </el-form-item>
          <el-form-item :label="$t('public.operationPassword')">
            <el-switch v-model="dform.twoPassword" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1,3,11].indexOf(dialogType) > -1">
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
import upload from '@/components/upload'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import { copyText } from '@/utils/index'
import { getToken, setToken, removeToken } from '@/utils/auth'
import TableColumnSet from '@/components/TableColumnSet/index'

export default {
  name: 'brand',
  components: {
    upload,
    TableColumnSet,
    Pagination,
    condition
  },
  data() {
    return {
      copyText: copyText,
      clickSubmit: false,
      form: {},
      tableMaxH: '250',
      list: [],
      listLoading: true,
      listTotal: 0,
      listQuery: {
        page: 1,
        size: 20
      },
      orderCount: {},
      deviceCount: {},

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],

      // 弹出相关
      dialogType: 1,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from.name == 'addBrand') {
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
      this.toQuery(1)
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    defaultColumn() {
      return [
        {
          key: 'name',
          val: true,
          name: this.$t('brand.brandInfo')
        },
        {
          key: 'companyName',
          val: false,
          name: this.$t('brand.corporateName')
        },
        {
          key: 'createTime',
          val: true,
          name: this.$t('brand.timeOfEntry'),
          width: 260
        },
        {
          key: 'isLeader',
          val: true,
          name: this.$t('brand.regimentalCommander')
        },
        {
          key: 'fatherBrandName',
          val: true,
          name: this.$t('brand.inviter')
        },
        {
          key: 'brandDeviceType',
          val: true,
          name: this.$t('brand.category')
        },
        {
          key: 'deviceCount',
          val: true,
          name: this.$t('brand.numberOfDevices')
        },
        {
          key: 'orderCount',
          val: true,
          name: this.$t('public.orderNum')
        },
        {
          key: 'amount',
          val: true,
          name: `${this.$t('public.aTurnover')}(${this.$t('public.element')})`
        }
      ]
    },
    dialogTitle() {
      return {
        1: this.$t('brand.giftOfDeductionVouchers'),
        2: this.$t('brand.contractManagement'),
        3: this.$t('brand.toMiniProgram'),
        11: this.$t('public.setLoginPassword'),
      }
    },
    sort_type() {
      return [{
        name: this.$t('brand.comprehensiveSorting'),
        value: 0
      },
      {
        name: this.$t('brand.highToLow'),
        value: 1
      },
      {
        name: this.$t('brand.lowToHogh'),
        value: 2
      },
      {
        name: this.$t('brand.nearToFar'),
        value: 3
      },
      {
        name: this.$t('brand.farToNear'),
        value: 4
      }
      ]
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
      this.form = {
        status: 1
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
      this.$get('iot-saas-basic/admin/brand/findPage', params).then(res => {
        this.listLoading = false
        this.list = res.rows
        this.clickSubmit = false
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
        }
        this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
        this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 设备数量统计查询
     */
    queryDeviceCount(ids){
      if(ids.length == 0){
        this.deviceCount = {}
        return
      }
      this.$get('iot-saas-device/admin/device/count/queryGroupCountV2', {
        countType: 'BRAND',
        groupIds: ids.join(',')
      }).then(res => {
        this.deviceCount = res
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前行
     * @param {Object} dialogType dialog内容显示类型 1: '赠送券' 2: '合同'
     * @param {Object} idx 当前行所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dform = {}
          if (dialogType == 2) {
            this.$get('iot-saas-basic/admin/platform/getFileInfo', {
              bussinessId: row.id,
              type: 1
            }).then(res => {
              this.dform = {
                pdfUrl: res.url
              }
            })
          } else if (dialogType == 1) {
            this.$get('iot-saas-basic/admin/settings/find', {
              brandId: row.id,
              code: 'VIP_COUPON'
            }).then(res => {
              if (res && res.setting) {
                let coupon = JSON.parse(res.setting)
                this.dform = {
                  amount: coupon.amount || 0
                }
              }
            })
          } else if (dialogType == 3) {
            this.$get('iot-saas-basic/admin/settings/find', {
              brandId: row.id,
              code: 'BRAND_JUMP_MINI'
            }).then(res => {
              if (res && res.setting) {
                let info = JSON.parse(res.setting)
                console.log(info)
                this.dform = {
                  jumpDetail: {
                    wx: JSON.parse(info.wx),
                    ali: JSON.parse(info.ali),
                  }
                }
              } else {
                this.dform = {
                  jumpDetail: {
                    wx: {},
                    ali: {}
                  }
                }
              }
            })
          }
          this.drawerStatus = true
          break
      }
    },

    /**
     * 操作行
     * @param {Object} type 1 删除品牌 2 账号恢复 3 设为团长 4 设备统计数量  5 代理层级缓存  6 重置登录密码
     * @param {Object} row
     * @param {Object} index
     */
    setRow(type, row, index) {
      let that = this;
      switch (type) {
        case 1:
          this.$alert(that.$t('brand.areYouDeleteBrand'), that.$t('brand.deleteBrand'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-basic/admin/brand/updateStatusById', {
                  id: row.id,
                  status: 0
                }).then(res => {
                  this.$message({
                    message: that.$t('public.deleteSuccess'),
                    type: 'success'
                  })
                  this.list.splice(index, 1)
                })
              }
            }
          })
          break
        case 2:
          this.$alert(that.$t('brand.accountToNormal'), that.$t('brand.accountRecovery'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-basic/admin/brand/updateStatusById', {
                  id: row.id,
                  status: 0
                }).then(res => {
                  this.$message({
                    message: that.$t('brand.recoveryWasSuccess'),
                    type: 'success'
                  })
                  this.list.splice(index, 1)
                })
              }
            }
          })
          break
        case 3:
          this.$alert(that.$t('brand.areYouSetAsTeamLeader'), that.$t('brand.regimentalCommander'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-basic/admin/brand/setLeader', {
                  brandId: row.id
                }).then(res => {
                  this.$message({
                    message: that.$t('public.setSuccess'),
                    type: 'success'
                  })
                })
              }
            }
          })
          break
        case 5:
          this.$alert(that.$t('brand.agentLevel'), that.$t('brand.levelRefresh'), {
            confirmButtonText: that.$t('public.confirm'),
            center: true,
            callback: action => {
              if (action == 'confirm') {
                this.$get('iot-saas-basic/admin/agent/initAgentCache', {
                  brandId: row.id
                }).then(res => {
                  this.$message({
                    message: that.$t('public.refreshSuccessful'),
                    type: 'success'
                  })
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
    dialogConfirm(row = {}) {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          params.brandId = curRow.id
          this.$post('iot-saas-basic/admin/settings/saveCoupon', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 3:
          params.brandId = curRow.id
          if (params.jumpDetail.wx) params.jumpDetail.wx = JSON.stringify(params.jumpDetail.wx)
          if (params.jumpDetail.ali) params.jumpDetail.ali = JSON.stringify(params.jumpDetail.ali)
          this.$post('iot-saas-basic/admin/settings/saveJump', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 11:
          params.userId = curRow.userId
          if(params.password) params.password = '123456'
          this.$post('iot-saas-user/admin/user/password/reset', params).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        }
      },

    /**
     * 登录代理后台
     * @param {Object} row
     */
    toLogin(row) {
      let that = this;
      this.loadObj = this.$loading({
        lock: true,
        text: that.$t('public.loggingIn'),
        spinner: 'el-icon-loading'
      })
      this.$post('iot-saas-user/admin/login', {
        userType: 'brand',
        id: row.id
      }).then(res => {
        setToken(getToken(), 'token1')
        setToken(res.loginToken.accessToken)
        setTimeout(() => {
          location.href = '/home'
          this.loadObj.close()
        }, 500)
      }).catch(err => {
        this.loadObj.close()
      })
    },

    /**
     * 复制贴牌登录地址
     * @param {Object} row
     */
    copyloginUrl(row) {
      let that = this;
      copyText(`${location.origin}/login/${row.id}`)
      this.$message({
        message: that.$t('public.copySuccess'),
        type: 'success'
      })
    },

    /**
     * 上传合同
     */
    uploadPdf(res) {
      let that = this;
      this.$post('iot-saas-basic/admin/platform/saveFileInfo', {
        type: 1,
        businessId: this.curRow.id,
        url: res.data.url
      }).then(ares => {
        this.dform = {
          pdfUrl: res.data.url
        }
        this.$message({
          message: that.$t('public.uploadSuccess'),
          type: 'success'
        })
      })
    }
  },
}
</script>

<style lang="scss" scoped></style>
