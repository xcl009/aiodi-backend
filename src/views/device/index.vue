<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-15 bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'0'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-tabs>
      </template>

      <template v-slot:defult>
        <el-input v-model="form.deviceSn" placeholder="二维码" />
        <el-input v-model="form.factorySn" placeholder="设备SN" />
        <el-input v-model="form.place" placeholder="位置备注" />
        <el-select v-model="form.haveAssociateDevice" @change="toQuery()" placeholder="设备关联">
          <el-option label="全部" :value="null" />
          <el-option label="已关联" :value="true" />
          <el-option label="未关联" :value="false" />
        </el-select>
        <selectSearch v-model="form.storeId" :type="3" name="name" placeholder="商户名称" @change="toQuery()" v-if="!isStore()"></selectSearch>
        <selectSearch v-model="form.agentId" :type="5" name="name" placeholder="代理名称" @change="toQuery()" v-if="lowerDevice && !isStore()"></selectSearch>
        <selectSearch v-model="form.brandId" :type="6" name="name" placeholder="品牌名称" @change="toQuery()" v-if="isSaas()"></selectSearch>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex" v-if="!isStore()">
        <div class="flex1">
          <el-button size="medium" :type="listQuery.haveBind === item.value ? 'primary' : ''"
            :class="{'btn-body': listQuery.haveBind !== item.value}" v-for="item in haveBind"
            @click="listQuery.haveBind = item.value;toQuery()">{{ item.title }}({{deviceCount[item.nkey] || onLineCount[item.nkey] || 0}})</el-button>
        </div>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row @selection-change="selList" :max-height="tableMaxH">
        <el-table-column type="selection" :selectable="checkSel" width="50" v-if="!isSaas()" />
        <el-table-column label="设备名称" width="80">
          <template slot-scope="scope">
            {{ scope.row.deviceType.name || '密码线' }}
          </template>
        </el-table-column>
        <el-table-column label="设备归属" width="180" v-if="lowerDevice">
          <template slot-scope="scope">
            <template v-if="scope.row.agent">
              <div>{{ scope.row.agent.name }}</div>
              <div>{{ dealPhone(scope.row.agent.mobile) }}</div>
            </template>
            <template v-else>
              <div>{{ scope.row.brand.name }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="设备SN码" min-width="150">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>二维码：{{ scope.row.deviceSn || "--" }}</div>
              <div class="text-cut">设备SN：{{ scope.row.factorySn || "--" }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可借|可还" v-if="myDeviceId['PA']" width="100">
          <template slot-scope="scope">
            <div v-if="scope.row.onlineStatus && scope.row.deviceType.code.indexOf('PA') > -1">
              {{ scope.row.tenantNumber }}|{{ scope.row.restoreNumber }}
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" min-width="95">
          <template slot-scope="scope">
            <div v-if="scope.row.onlineStatus && checkAbility(['PA', 'VG', 'AV', 'BD'], 2, [scope.row.deviceType])">
              <div :class="scope.row.onlineStatus == 'ONLINE' ? 'text-primary' : 'text-danger'">{{ scope.row.onlineStatus == 'ONLINE' ? '在线' : '离线'}}</div>
              <div>{{ parseTime(scope.row.updateTime) }}</div>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="设备属性" width="150">
          <template slot-scope="scope">
            工厂：{{ scope.row.deviceFactory.name }}
          </template>
        </el-table-column>
        <el-table-column label="是否铺货" width="150" v-if="!isStore()">
          <template slot-scope="scope">
            <div>{{ scope.row.distribute ? "是" : "否" }}</div>
            <div v-if="scope.row.distribute">{{ scope.row.bindStoreTime }}</div>
          </template>
        </el-table-column>
        <el-table-column label="商户名称" width="150" v-if="!isStore()">
          <template slot-scope="scope">
            <div v-if="scope.row.store">
              <div class="text-cut_two">{{ scope.row.store.name }}</div>
            </div>
            <div v-else>--</div>
          </template>
        </el-table-column>
        <el-table-column label="位置备注" width="100">
          <template slot-scope="scope">
            <div class="cursor text-primary" @click="setRows(1, scope.row, 3)">
              {{ scope.row.place || '未设置' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="120" v-if="Ability['order']">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary"
                  @click="$router.push({path: (lowerDevice ? `/order/subOrder?deviceSn=${scope.row.deviceSn}&sourceType=2` : `/order?deviceSn=${scope.row.deviceSn}&sourceType=1`)})">
                  {{ orderCount[scope.row.deviceSn] ? orderCount[scope.row.deviceSn].wx : 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: (lowerDevice ? `/order/subOrder?deviceSn=${scope.row.deviceSn}&sourceType=2` : `/order?deviceSn=${scope.row.deviceSn}&sourceType=2`)})">
                  {{ orderCount[scope.row.deviceSn] ? orderCount[scope.row.deviceSn].ali : 0 }}
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" width="90">
          <template slot-scope="scope">
            {{ orderCount[scope.row.deviceSn] ? orderCount[scope.row.deviceSn].amount : '0.00' }}
          </template>
        </el-table-column>

        <!-- 商户 -->
        <el-table-column label="关联的设备" width="260" v-if="Ability['RELATION_DEVICE'] && isStore()">
          <template slot-scope="scope">
            <template v-if="scope.row.fatherDeviceSn == 'FATHER' && fatherSn[scope.row.deviceSn]">
              <div v-for="(item, idx) in fatherSn[scope.row.deviceSn]">
                <div class="cursor text-primary" v-if="checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                  <el-dropdown trigger="click">
                    <el-link :underline="false" v-if="checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                      <span class="inline relation-label">{{ item.deviceTypeName }}</span>{{ item.deviceSn }}<i class="el-icon-arrow-down"></i>
                    </el-link>
                    <el-dropdown-menu slot="dropdown" class="dropdown">
                      <el-dropdown-item @click.native="setRows(1, item, 6)">创建订单</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                <div v-else>
                  <span class="inline relation-label">{{ item.deviceTypeName }}</span>{{ item.deviceSn }}
                </div>
              </div>
            </template>
            <template v-else-if="scope.row.fatherDeviceSn">
              <div class="cursor">
                <span class="inline relation-label">主设备</span>{{ scope.row.fatherDeviceSn }}
              </div>
            </template>
            <template v-else>
              <div class="cursor text-black3">未关联设备</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" v-if="isStore()">
          <template slot-scope="scope">
            <el-row class="line-six">
              <el-col :span="24" v-if="checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                <div class="text-primary cursor" @click="setRows(1, scope.row, 6)">创建订单</div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 非商户 -->
        <el-table-column label="关联设备" width="260" v-if="Ability['RELATION_DEVICE'] && !isStore()">
          <template slot-scope="scope">
            <template v-if="scope.row.fatherDeviceSn == 'FATHER' && fatherSn[scope.row.deviceSn]">
              <div class="cursor text-primary" v-for="(item, idx) in fatherSn[scope.row.deviceSn]">
                <el-dropdown trigger="click">
                  <el-link :underline="false">
                    <span class="inline relation-label">{{ item.deviceTypeName }}</span>{{ item.deviceSn }}<i class="el-icon-arrow-down"></i>
                  </el-link>
                  <el-dropdown-menu slot="dropdown" class="dropdown">
                    <el-dropdown-item @click.native="setRows(1, scope.row, 4, idx); dform.sonDeviceSn = item.deviceSn">解除关联</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(1, scope.row, 5)">新增关联</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
            <template v-else-if="scope.row.fatherDeviceSn">
              <div class="cursor text-primary">
                <el-dropdown trigger="click">
                  <el-link :underline="false">
                    <span class="inline relation-label">主设备</span>{{ scope.row.fatherDeviceSn }}<i class="el-icon-arrow-down"></i>
                  </el-link>
                  <el-dropdown-menu slot="dropdown" class="dropdown">
                    <el-dropdown-item @click.native="setRows(1, scope.row, 4)">解除关联</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
            <template v-else>
              <span class="cursor text-primary" @click="setRows(1, scope.row, 5)">关联设备</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="190" :fixed="device == 'desktop' ? 'right' : false" v-if="!isStore()">
          <template slot-scope="scope">
            <el-row class="line-six">
              <el-col :span="12">
                <div class="text-primary cursor" @click="setRows(1, scope.row, 2)">二维码</div>
              </el-col>
              <el-col :span="12" v-if="lowerDevice">
                <div class="text-primary cursor" @click="setRows(1, scope.row, 1)">设备归属</div>
              </el-col>
              <el-col :span="12" v-if="scope.row.distribute">
                <div class="text-primary cursor" @click="unboundStore(scope.row)">解绑</div>
              </el-col>
              <el-col :span="12" v-if="scope.row.distribute && isBrand() && checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                <div class="text-primary cursor" @click="$router.push({path: `/device/bedStat?deviceSn=${scope.row.deviceSn}`})">在线统计</div>
              </el-col>
              <template v-if="!isSaas()">
                <template v-if="lowerDevice">
                  <el-col :span="12" v-if="!scope.row.distribute">
                    <div class="text-primary cursor" @click="unbindAgent(scope.row, scope.$index)">回收设备</div>
                  </el-col>
                </template>
                <template v-else-if="!scope.row.distribute">
                  <el-col :span="12">
                    <div class="text-primary cursor" @click="$router.push({path: `/agent?deviceSns=${scope.row.deviceSn}`})">去分配</div>
                  </el-col>
                  <el-col :span="12">
                    <div class="text-primary cursor" @click="$router.push({path: `/store?deviceSns=${scope.row.deviceSn}`})">去铺货</div>
                  </el-col>
                </template>
              </template>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <div class="rel flex justify-center">
        <div class="abs flex pagination-left" v-if="!isSaas()">
          <template v-if="lowerDevice">
            <el-button type="primary" size="medium" :disabled="selID.length == 0"
              @click="unbindAgent()">批量回收
            </el-button>
          </template>
          <template v-else-if="!isStore()">
            <el-button type="primary" size="medium" :disabled="selID.length == 0"
              @click="$router.push({path: `/store?deviceId=${selID}`})">批量铺货</el-button>
            <el-button type="primary" size="medium" :disabled="selID.length == 0"
              @click="$router.push({path: `/agent?deviceId=${selID}`})">批量分配
            </el-button>
          </template>
        </div>
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-table :data="deviceInfo[curRow.deviceSn].deviceOwnerUserList" border v-if="deviceInfo[curRow.deviceSn]">
          <el-table-column label="角色">
            <template slot-scope="scope">
              {{ config.system_role[scope.row.userType] }}
            </template>
          </el-table-column>
          <el-table-column label="联系信息">
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <el-image class="access-url" :src="deviceInfo[curRow.deviceSn].accessUrl" fit="cover" v-if="deviceInfo[curRow.deviceSn] && deviceInfo[curRow.deviceSn].accessUrl"></el-image>
          <div class="access-url" id="accessUrl" v-else></div>
          <div class="mt-20 text-grey">SN码：{{ curRow.deviceSn }}</div>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input v-model="dform.place" placeholder="请输入投放位置(如房间号：101)"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 4">
        <div class="text-center">
          <div class="text-black">确定解除该设备关联关系吗？</div>
        </div>
      </template>
      <template v-if="dialogType == 5">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input v-model="dform.sonDeviceSn" placeholder="请输入设备SN码"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 6">
        <div class="text-center">
          <div class="flex align-center justify-center">
            <div>订单可使用时长：</div>
            <el-select v-model="dform.duration" placeholder="免费时长">
              <el-option :label="`${item}小时`" :value="item" v-for="item in config.bed_order_time"/>
            </el-select>
          </div>
          <div class="mt-15 fs-s3">注：提交后，{{ dform.duration }}小时内用户可扫码直接启动设备。</div>

          <div class="mt-30 text-black">
            <div class="cursor">当前剩余快活币：<span class="text-primary">{{ money.happyCurrencyNum }}</span><span class="ml-20 text-primary cursor" @click="$router.push({path: `/money`})">快活币充值</span></div>
            <div class="mt-15" v-if="!createOrderConfig[dform.deviceTypeCode]">订单计费规则未配置，暂不可下单</div>
            <div class="mt-15" v-else-if="createOrderConfig[dform.deviceTypeCode].giftDays > 0 && currentTime() < unixTime(curRow.bindStoreTime) + createOrderConfig[dform.deviceTypeCode].giftDays * 86400">剩余赠送免费时间：{{ formatSeconds((unixTime(curRow.bindStoreTime) + createOrderConfig[dform.deviceTypeCode].giftDays * 86400) - currentTime())}}</div>
            <div class="mt-15" v-else>创建订单将会扣除快活币：<span class="text-danger">{{ createOrderConfig[dform.deviceTypeCode].amount }}</span></div>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 7">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input v-model="dform.place" placeholder="请输入设备投放位置(如设备所在房间号：101)"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center" v-if="dialogType > 2">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
      <div class="mt-30 text-center" v-else>
        <el-button size="medium" type="primary" @click="dialogStatus = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import QRCode from 'qrcodejs2'
  import { unixTime, formatSeconds } from '@/utils/index'
  export default {
    name: 'device',
    components: {
      Pagination,
      condition,
      selectSearch
    },
    props: {
      lowerDevice: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      myDevice() {
        return this.$store.state.user.myDevice
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      Ability() {
        return this.$store.getters.Ability
      },
    },
    data() {
      return {
        formatSeconds: formatSeconds,
        unixTime: unixTime,
        clickSubmit: false,
        haveBind: [
          {
            value: '',
            title: '全部',
            nkey: 'deviceNumber'
          },
          {
            value: true,
            title: '已绑',
            nkey: 'bindStoreNumber'
          },
          {
            value: false,
            title: '未绑',
            nkey: 'noBindStoreNumber'
          },
          {
            value: 'ONLINE',
            title: '在线',
            nkey: 'onlineCount'
          },
          {
            value: 'OFFLINE',
            title: '离线',
            nkey: 'offlineCount'
          }
        ],
        form: {
          //search_store_name: this.$route.query.store_name || ''
        },
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          haveBind: this.$route.query.haveBind || '',
          page: 1,
          size: 20
        },
        orderCount: {},
        deviceCount: {},
        onLineCount: {},
        fatherSn: {},

        selSnArr: [],
        selID: [],

        // 钱包 + 快活币余额
        money: {},

        //订单收费配置信息
        createOrderConfig: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '设备归属',
          2: '设备二维码',
          3: '投放位置备注',
          4: '设备解除关联',
          5: '关联副设备',
          6: '创建订单'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        // 设备归属
        deviceInfo: {},
      }
    },
    mounted(options) {
      let query = this.$route.query
      this.queryKey = ['brandId', 'storeId', 'agentId', 'deviceIds', 'sourceType']
      for (var i in this.queryKey) {
        if(query[this.queryKey[i]]) this.form[this.queryKey[i]] = query[this.queryKey[i]]
      }
      this.toQuery()
      if(this.isStore()){
        this.getBalance()
      }
    },
    methods: {
      /**
       * 获取可提现金额
       */
      getBalance(){
        this.$get('iot-saas-pay/api/pay/withdraw/balance').then(res => {
          this.money = res || {}
        })
      },

      /**
       * 设备数量统计查询
       */
      queryDeviceCount(){
        let params = {}, url = 'iot-saas-device/admin/device/count/queryGroupCount'
        if(this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
        if(this.form.agentId){
          params.countType = 'AGENT'
          params.groupIds = this.form.agentId
        }else if(this.form.brandId){
          params.countType = 'BRAND'
          params.groupIds = this.form.brandId
        } else if(this.isAgent()){
          params.countType = 'AGENT'
          params.groupIds = this.agentInfo.agentId
        } else if(this.isBrand()){
          params.countType = 'BRAND'
          params.groupIds = this.agentInfo.brandId
        } else if(this.isSaas()){
          url = 'iot-saas-device/admin/device/count/queryByUser'
          if(this.deviceCount.deviceNumber != undefined){
            if(params.deviceTypeCode){
              this.deviceCount = {
                deviceNumber: 0,
                bindStoreNumber: 0,
                noBindStoreNumber: 0
              }
              for(var i in this.deviceCountes.deviceTypeDetail){
                let item = this.deviceCountes.deviceTypeDetail[i]
                if(i.indexOf(params.deviceTypeCode) > -1){
                  this.deviceCount.deviceNumber += parseInt(item.deviceNumber)
                  this.deviceCount.bindStoreNumber += parseInt(item.bindStoreNumber)
                  this.deviceCount.noBindStoreNumber += parseInt( item.deviceNumber ) - parseInt( item.bindStoreNumber )
                }
              }
            } else {
              this.deviceCount = {
                deviceNumber: this.deviceCountes.deviceNumber,
                bindStoreNumber: this.deviceCountes.bindStoreNumber,
                noBindStoreNumber: this.deviceCountes.noBindStoreNumber
              }
            }
            return
          }
        }
        this.$get(url, params).then(res => {
          if(res[params.groupIds]){
            res = res[params.groupIds]
          } else {
            res.noBindStoreNumber = parseInt( res.deviceNumber ) - parseInt( res.bindStoreNumber )
            this.deviceCountes = JSON.parse(JSON.stringify(res))
            this.deviceCount = res
            return
          }
          if(this.lowerDevice){
            this.deviceCount = {
              deviceNumber: res.lowerDeviceNumber,
              bindStoreNumber: res.lowerBindStoreNumber,
              noBindStoreNumber: parseInt(res.lowerDeviceNumber) -  parseInt(res.lowerBindStoreNumber)
            }
          } else {
            this.deviceCount = {
              deviceNumber: parseInt(res.deviceNumber) -  parseInt(res.lowerDeviceNumber),
              bindStoreNumber: parseInt(res.bindStoreNumber) -  parseInt(res.lowerBindStoreNumber),
              noBindStoreNumber: (parseInt(res.deviceNumber) -  parseInt(res.lowerDeviceNumber)) - (parseInt(res.bindStoreNumber) -  parseInt(res.lowerBindStoreNumber))
            }
          }
        })
      },

      /**
       * 在线设备数量统计
       */
      onlineDevice(){
        let params = {
          statisticsType: this.lowerDevice ? 'CHILDREN' : 'OWNER'
        }
        if(this.listQuery.deviceTypeCode != 0) params.deviceTypeCode = this.listQuery.deviceTypeCode
        this.$get('iot-saas-device/deviceOnline/statistics', params).then((res = {}) => {
          this.$set(this.onLineCount, 'onlineCount', res.onlineCount || 0)
          this.$set(this.onLineCount, 'offlineCount', res.offlineCount || 0)
        })
      },

      /**
       * 校验是否可选
       */
      checkSel(row) {
        return !row.distribute
      },

      /**
       * 选择设备
       * @param {Object} res
       */
      selList(list) {
        let selSnArr = [],
          selID = []
        for (var i in list) {
          selSnArr.push(list[i].goods_sn)
          selID.push(list[i].id)
        }
        this.selSnArr = selSnArr
        this.selID = selID
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
        if(!this.isStore()){
          this.queryDeviceCount()
          this.onlineDevice()
        }
      },

      /**
       * 重置查询
       */
      reset() {
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
        if(!this.isStore()){
          this.queryDeviceCount()
          this.onlineDevice()
        }
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1,
          lowerDevice: this.lowerDevice
        })
        if(['ONLINE', 'OFFLINE'].indexOf(params.haveBind) > -1){
          params.onlineStatus = params.haveBind
          delete params.haveBind
        }
        if(params.deviceTypeCode == 0) delete params.deviceTypeCode
        this.$get('iot-saas-device/admin/device/findPage', params).then((res = {}) => {
          this.list = res.rows || []
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
          }
          this.queryOrderCount(this.arrayKeys(res.rows, 'deviceSn'))
          if(this.Ability['RELATION_DEVICE'] && this.list.length > 0){
            let fatherSn = []
            this.list.map(item => {
              if(item.fatherDeviceSn == 'FATHER'){
                fatherSn.push(item.deviceSn)
              }
            })
            if(fatherSn.length > 0){
              this.queryByFatherDeviceSn(fatherSn)
            }
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 订单统计数量查询
       */
      queryOrderCount(sns){
        if(sns.length == 0){
          this.orderCount = {}
          return
        }
        this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
          countType: 'DEVICE',
          groupIds: sns.join(',')
        }).then(res => {
          this.orderCount = res
        })
      },

      /**
       * 查询副设备信息
       */
      queryByFatherDeviceSn(fatherSns){
        if(fatherSns.length == 0){
          this.fatherSnObj = {}
          return
        }
        this.$get('iot-saas-device/device/queryByFatherDeviceSn', {
          deviceSn: fatherSns.join(',')
        }).then(res => {
          this.fatherSn = res
        })
      },

      /**
       * 设备解绑
       */
      unboundStore(row) {
        this.$alert('确定解绑该设备？', '解绑设备', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-device/admin/device/unbindStore', {
                deviceIds: [row.id]
              }).then(res => {
                this.$message({
                  message: '解绑成功',
                  type: 'success'
                })
                row.distribute = false
                row.store = ''
              })
            }
          }
        })
      },

      /**
       * 设备回收
       */
      unbindAgent(row, idx) {
        this.$alert('确定回收该设备？', '回收设备', {
          confirmButtonText: '确定',
          center: true,
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-device/admin/device/unbindAgent', {
                deviceIds: row ? [row.id] : this.selID
              }).then(res => {
                this.$message({
                  message: '回收成功',
                  type: 'success'
                })
                if(idx){
                  this.list.splice(idx, 1)
                } else {
                  this.getList()
                }
              })
            }
          }
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '设备归属'  2: '二维码' 3: '位置备注'  4: '设备解除关联'  5: '关联副设备' 6: '创建订单'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            this.dform = {}
            if(dialogType == 1 || dialogType == 2){
              if(this.deviceInfo[row.deviceSn]){
                this.$nextTick(()=>{
                  if(!this.deviceInfo[row.deviceSn].accessUrl && dialogType == 2){
                    this.deviceCode(this.deviceInfo[row.deviceSn].content)
                  }
                })
                return
              }
              this.$get('iot-saas-device/admin/device/findBelong', {
                deviceSn: row.deviceSn
              }).then(res => {
                this.$set(this.deviceInfo, row.deviceSn, res)
                if(!res.accessUrl && dialogType == 2){
                  this.deviceCode(res.content)
                }
              })
            } else if(dialogType == 3){
              this.dform = {
                place: row.place
              }
            } else if(dialogType == 6){
              let code = row.deviceTypeCode ? row.deviceTypeCode.substr(0, 2) : row.deviceType.code.substr(0, 2)
              if(!this.createOrderConfig[code]){
                this.$set(this.createOrderConfig, code, {})
                this.getCreateOrderConfig(code)
              }
              this.dform = {
                deviceSn: row.deviceSn,
                deviceTypeCode: code,
                duration: 2
              }
            }
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
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 3:
            params.deviceId = curRow.id
            params.deviceSn = curRow.deviceSn
            this.$post('iot-saas-device/admin/device/update', params).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.$set(curRow, 'place', params.place)
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 4:
            if(curRow.fatherDeviceSn == 'FATHER'){
              params.fatherDeviceSn = curRow.deviceSn
              params.sonDeviceSn = this.dform.sonDeviceSn
            }else{
              params.fatherDeviceSn = curRow.fatherDeviceSn
              params.sonDeviceSn = curRow.deviceSn
            }
            this.$post('iot-saas-device/admin/device/liftAssociationDevice', params).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              if(curRow.fatherDeviceSn == 'FATHER'){
                this.fatherSn[params.fatherDeviceSn].splice(curIdx, 1)
              } else {
                curRow.fatherDeviceSn = ''
              }
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 5:
            if(!params.sonDeviceSn){
              this.$message({
                message: '副设备无效',
                type: 'error'
              })
              this.clickSubmit = false
              return
            }
            this.$post('iot-saas-device/admin/device/associationDevice', {
              fatherDeviceSn: curRow.deviceSn,
              sonDeviceSn: params.sonDeviceSn
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.getList()
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 6:
            params.duration = params.duration * 60
            this.$post('iot-saas-order/admin/order/create', params).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      },

      /**
       * 获取创建的配置
       */
      getCreateOrderConfig(code){
        this.$get('iot-saas-basic/admin/storeOrderConfig/v1/findById', {
          deviceTypeCode: code,
          storeId: this.agentInfo.storeIds[0]
        }).then(res => {
          this.createOrderConfig[code] = res
        })
      },

      /**
       * 设置二维码
       */
      deviceCode(url){
        document.getElementById('accessUrl').innerHTML = ''
        new QRCode('accessUrl', {
          width: 150,
          height: 150,
          text: url
        })
      },
    }
  }
</script>

<style>
  .dropdown.el-popper{
    margin-top: 0;
    min-width: 150px;
  }
</style>
<style lang="scss" scoped>
  .access-url{
    margin: 0 auto;
    width: 150px;
    height: 150px
  }
  .relation-label{
    width: 5em;
  }
</style>
