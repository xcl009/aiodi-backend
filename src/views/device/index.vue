<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
      @saveXlsx="saveXlsx">
      <template v-slot:tabs>
        <!-- Device Type -->
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">{{ $t('public.deviceType') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="$t('public.allDevice')" :name="''" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
        <!-- Device Status -->
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">{{ $t('public.deviceStatus') }}</div>
          <el-tabs class="flex-1" v-model="listQuery.haveBind" @tab-click="toQuery()">
            <el-tab-pane :label="`${item.title}(${deviceCount[item.nkey] || 0})`" :name="'' + item.value + ''"
              v-for="item in haveBind" />
          </el-tabs>
        </div>
      </template>

      <!-- Query Form -->
      <template v-slot:defult>
        <el-form-item>
          <div class="flex combined">
            <el-select v-model="formKey[`sel1`]" :placeholder="$t('public.pleaseSelect')">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel1`]] && queryObj[formKey[`sel1`]].type == 'input'">
              <el-input v-model="form[formKey[`sel1`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel1`]] && queryObj[formKey[`sel1`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel1`]]" :type="queryObj[formKey[`sel1`]].sType"
                :name="queryObj[formKey[`sel1`]].name"
                @change="toQuery()"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel1`]] && queryObj[formKey[`sel1`]].type == 'select'">
              <el-select v-model="form[formKey[`sel1`]]" :placeholder="`${queryObj[formKey['sel1']].title}`"
                clearable @change="toQuery()">
                <el-option :label="item.label" :value="item.value"
                  v-for="(item, key) in queryObj[formKey[`sel1`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(4, {})" v-if="isSaas()">{{ $t('device.counting') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 3)" v-if="false">{{ $t('device.unfoldRecord')}}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(3, {}, 11)" v-if="isSaas()">{{ $t('device.deviceUpdate') || 'Device Upgrade'}}</div>
        <div v-show="false">{{ screenfull }}</div>
        <table-column-set storageKey="deviceTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row @selection-change="selList" :max-height="tableMaxH">
        <el-table-column type="selection" :selectable="checkSel" width="50" />
        <el-table-column :label="$t('public.brand')" width="150" v-if="isSaas()">
          <template slot-scope="scope">
            {{ scope.row.brand.name }}
          </template>
        </el-table-column>
        <template v-for="item in showColumn">
          <el-table-column :label="item.name" width="100" v-if="item.val && item.key == 'deviceType'">
            <template slot-scope="scope">
              {{ myDeviceId[scope.row.deviceType.code] || '' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="240" v-else-if="item.val && item.key == 'deviceSn'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <span class="mr-10">{{ scope.row.deviceSn || "--" }}</span>
                <el-popover trigger="hover">
                  <div class="access-url" :ref="`sn_${scope.row.deviceSn}`" :id="`sn_${scope.row.deviceSn}`"></div>
                  <div class="flex" slot="reference">
                    <svg-icon icon-class="h_qrcode"
                      @mouseover="deviceCode(scope.row.deviceSn, scope.row.content)"></svg-icon>
                  </div>
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="100" v-else-if="item.val && item.key == 'tenantNumber'">
            <template slot-scope="scope">
              <div v-if="scope.row.onlineStatus && scope.row.deviceType.code.indexOf('PA') > -1">
                {{ scope.row.tenantNumber }} / {{ scope.row.restoreNumber }}
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'deviceFactory'">
            <template slot-scope="scope">
              {{ scope.row.deviceFactory ? scope.row.deviceFactory.name : '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="100" v-else-if="item.val && item.key == 'distribute'">
            <template slot-scope="scope">
              <div>{{ scope.row.distribute ? $t('public.shipped') : $t('public.unpacked') }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="150" v-else-if="item.val && item.key == 'bindStoreTime'">
            <template slot-scope="scope">
              <div>{{ scope.row.distribute && scope.row.bindStoreTime ? parseTime(scope.row.bindStoreTime, '{d}-{m}-{y} {h}:{i}') : '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" min-width="200" v-else-if="item.val && item.key == 'store'">
            <template slot-scope="scope">
              <div v-if="scope.row.store">
                <div class="text-cut_two">{{ scope.row.store.name }}<span v-if="scope.row.store.mobile">（{{
                  scope.row.store.mobile }}）</span></div>
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" min-width="150" v-else-if="item.val && item.key == 'bind'">
            <template slot-scope="scope">
              <div v-if="scope.row.agent">
                <div class="text-cut_two">{{ scope.row.agent.name }}<span v-if="scope.row.agent.mobile">（{{
                  scope.row.agent.mobile }}）</span></div>
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="95" v-else-if="item.val && item.key == 'onlineStatus'">
            <template slot-scope="scope">
              <div v-if="scope.row.onlineStatus && checkAbility(['PA', 'DC', 'VG', 'AV', 'BD'], 2, [scope.row.deviceType])">
                <el-popover trigger="hover">
                  <div>{{ scope.row.updateTime }}</div>
                  <span class="cursor text-primary" slot="reference" v-if="scope.row.onlineStatus == 'ONLINE'">{{
                    $t('public.onLine') }}</span>
                  <span class="cursor text-danger" slot="reference" v-else>{{ $t('public.offline') }} ({{
                    formatSeconds(currentTime() - unixTime(scope.row.updateTime), 'd') }})</span>
                </el-popover>
              </div>
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="100" v-else-if="item.val && item.key == 'place'">
            <template slot-scope="scope">
              <div class="cursor text-primary text-cut" @click="setRows(1, scope.row, 3)">
                {{ scope.row.place || '--' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="100" v-else-if="item.val && item.key == 'order'">
            <template slot-scope="scope">
              {{ orderCount[scope.row.deviceSn] ? parseInt(orderCount[scope.row.deviceSn].wx) + parseInt(orderCount[scope.row.deviceSn].ali) : 0 }}
              <!-- <div class="flex">
                <div class="flex1">{{ $t('payType.wx') }}: {{ orderCount[scope.row.deviceSn] ?
                  orderCount[scope.row.deviceSn].wx : 0 }}</div>
                <div class="pr-5 flex1">{{ $t('payType.zfb') }}: {{ orderCount[scope.row.deviceSn] ?
                  orderCount[scope.row.deviceSn].ali : 0 }}</div>
              </div> -->
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="90" v-else-if="item.val && item.key == 'amount'">
            <template slot-scope="scope">
              {{ formatCurrency(orderCount[scope.row.deviceSn] ? orderCount[scope.row.deviceSn].amount : '0.00') }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 120"
            v-else-if="item.val"></el-table-column>
        </template>

        <!-- 商户 -->
        <el-table-column :label="$t('device.associatedDevices')" width="260"
          v-if="Ability['RELATION_DEVICE'] && isStore()">
          <template slot-scope="scope">
            <template v-if="scope.row.fatherDeviceSn == 'FATHER' && fatherSn[scope.row.deviceSn]">
              <div v-for="(item, idx) in fatherSn[scope.row.deviceSn]">
                <div class="cursor text-primary" v-if="checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                  <el-dropdown trigger="click">
                    <el-link :underline="false" v-if="checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                      <span class="inline relation-label">{{ item.deviceTypeName }}</span>{{ item.deviceSn }}<i
                        class="el-icon-arrow-down"></i>
                    </el-link>
                    <el-dropdown-menu slot="dropdown" class="dropdown">
                      <el-dropdown-item
                        @click.native="setRows(1, item, 6)">{{ $t('public.createOrderText') }}</el-dropdown-item>
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
                <span class="inline relation-label">{{ $t('device.master') }}</span>{{ scope.row.fatherDeviceSn }}
              </div>
            </template>
            <template v-else>
              <div class="cursor text-black3">{{ $t('device.unassociatedDevices') }}</div>
            </template>
          </template>
        </el-table-column>

        <!-- todo: Dropdown for the actions -->
        <el-table-column :label="$t('public.actions')" align="center" width="100" v-if="isStore()">
          <template slot-scope="scope">
            <el-row class="line-six">
              <el-col :span="24" v-if="checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType])">
                <div class="text-primary cursor" @click="setRows(1, scope.row, 6)">{{ $t('public.createOrderText') }}
                </div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 非商户 -->
        <el-table-column :label="$t('device.associatedDevices')" width="260"
          v-if="Ability['RELATION_DEVICE'] && !isStore()">
          <template slot-scope="scope">
            <template v-if="scope.row.fatherDeviceSn == 'FATHER' && fatherSn[scope.row.deviceSn]">
              <div class="cursor text-primary" v-for="(item, idx) in fatherSn[scope.row.deviceSn]">
                <el-dropdown trigger="click">
                  <el-link :underline="false">
                    <span class="inline relation-label">{{ item.deviceTypeName }}</span>{{ item.deviceSn }}<i
                      class="el-icon-arrow-down"></i>
                  </el-link>
                  <el-dropdown-menu slot="dropdown" class="dropdown">
                    <el-dropdown-item @click.native="setRows(1, scope.row, 4, idx); dform.sonDeviceSn = item.deviceSn">{{
                      $t('device.disassociation') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(1, scope.row, 5)">{{ $t('device.addAssociation')
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
            <template v-else-if="scope.row.fatherDeviceSn">
              <div class="cursor text-primary">
                <el-dropdown trigger="click">
                  <el-link :underline="false">
                    <span class="inline relation-label">{{ $t('device.master') }}</span>{{ scope.row.fatherDeviceSn }}<i
                      class="el-icon-arrow-down"></i>
                  </el-link>
                  <el-dropdown-menu slot="dropdown" class="dropdown">
                    <el-dropdown-item @click.native="setRows(1, scope.row, 4)">{{ $t('device.disassociation')
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
            <template v-else>
              <span class="cursor text-primary" @click="setRows(1, scope.row, 5)">{{ $t('device.associatedDevices')
              }}</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column :label="$t('public.actions')" width="235" :fixed="device == 'desktop' ? 'right' : false"
          v-if="!isStore()">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <template v-if="isSaas()">
                <el-button type="text" @click="setRows(3, scope.row, 1)">{{ $t('public.allocatedTo') }}</el-button>
                <el-button type="text" @click="setRows(1, scope.row, 9)"
                  :disabled="scope.row.distribute || scope.row.agentId">{{ $t('public.allocateToAgent') }}</el-button>
              </template>
              <template v-else-if="lowerDevice">
                <el-button type="text" @click="setRows(3, scope.row, 1)">{{ $t('public.allocatedTo') }}</el-button>
                <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')"
                  class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00" :title="$t('device.message')"
                  @onConfirm="unbindAgent(scope.row, scope.$index)">
                  <el-button type="text" :disabled="scope.row.distribute" slot="reference">{{ $t('device.recovery')
                  }}</el-button>
                </el-popconfirm>
              </template>
              <template v-else>
                <el-button type="text" @click="setRows(3, scope.row, 8, scope.$index)" :disabled="scope.row.distribute">{{
                  $t('public.allocateToAgent') }}</el-button>
                <el-button type="text" @click="setRows(3, scope.row, 10, scope.$index)"
                  :disabled="scope.row.distribute">{{ $t('public.allocateToPartner') }}</el-button>
              </template>
              <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
                :title="$t('device.message1')" @onConfirm="unboundStore(scope.row)">
                <el-button type="text" :disabled="!scope.row.distribute" slot="reference">{{ $t('device.unbind')
                }}</el-button>
              </el-popconfirm>
              <el-button type="text" v-if="scope.row.deviceType.code.indexOf('LK') > -1" slot="reference" @click="$router.push({path: `/device/cabinetDoor?deviceSn=${scope.row.deviceSn}`})">柜门列表</el-button>
              <el-button type="text" v-else-if="myDeviceId['PA'] && checkAbility(['eject'], 3)" :disabled="scope.row.deviceType.code.indexOf('PA') == -1" slot="reference" @click="$router.push({path: `/device/eject?deviceSn=${scope.row.deviceSn}`})">{{ $t('public.ejectPowerbank') }}</el-button>
              <el-popconfirm
                class="pop"
                cancel-button-type=""
                icon="el-icon-info"
                icon-color="#FF7D00"
                :title="$t('device.restartText')"
                @onConfirm="restart(scope.row)"
                v-if="scope.row.onlineStatus == 'ONLINE' && scope.row.deviceType.code.indexOf('PA') > -1"
              >
                <el-button type="text" slot="reference">{{ $t('device.restart') }}</el-button>
              </el-popconfirm>
              <!-- <div class="text-primary" v-if="scope.row.distribute && checkAbility(['BD', 'VG', 'AV'], 2, [scope.row.deviceType]) && (isBrand() || isSaas())" @click="$router.push({path: `/device/eject?deviceSn=${scope.row.deviceSn}`})">在线统计</div> -->
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="rel flex justify-center">
        <div class="abs flex pagination-left" v-if="!isSaas()">
          <template v-if="lowerDevice">
            <el-popconfirm :confirm-button-text="$t('public.confirm')" :cancel-button-text="$t('public.cancel')" class="pop" cancel-button-type="" icon="el-icon-info" icon-color="#FF7D00"
              :title="$t('device.message3')" @onConfirm="unbindAgent()">
              <el-button type="primary" size="mini" :disabled="selID.length == 0" slot="reference">{{
                $t('device.batchRecycling') }}</el-button>
            </el-popconfirm>
          </template>
          <template v-else-if="!isStore()">
            <el-button type="primary" size="mini" :disabled="selID.length == 0" @click="setRows(3, {}, 10)">{{
              $t('device.batchDistribution') }}</el-button>
            <el-button type="primary" size="mini" :disabled="selID.length == 0" @click="setRows(3, {}, 8)">{{
              $t('device.batchAllocation') }}
            </el-button>
          </template>
          <!-- <el-button type="primary" size="medium"
            @click="setRows(1, {}, 7)">服务器地址
          </el-button> -->
        </div>
        <div class="abs flex pagination-left" v-else-if="isSaas()">
          <el-button type="primary" size="mini" :disabled="selID.length == 0" @click="setRows(3, {}, 11)">设备软件升级</el-button>
        </div>
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <!-- Dialog Drawers -->
    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input v-model="dform.place" :placeholder="$t('device.inputMessage')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 4">
        <div class="text-center">
          <div class="text-black">{{ $t('device.message3') }}</div>
        </div>
      </template>
      <template v-if="dialogType == 5">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input v-model="dform.sonDeviceSn" :placeholder="$t('device.inputMessage1')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 9">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" @submit.native.prevent="dialogConfirm()">
          <el-form-item>
            <el-input v-model="dform.changeBrandId" :placeholder="$t('device.inputMessage2')"></el-input>
            <div class="mt-15 fs-s3">{{ $t('device.message4') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center" v-if="dialogType > 2">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
      <div class="mt-30 text-center" v-else>
        <el-button size="medium" type="primary" @click="dialogStatus = false">{{ $t('public.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :close-on-click-modal="[11].indexOf(dialogType) == -1" :wrapperClosable="[11].indexOf(dialogType) == -1">
      <template v-if="dialogType == 1 && deviceInfo[curRow.deviceSn]">
        <div class="owner-user">
          <template v-for="(item, idx) in deviceInfo[curRow.deviceSn].deviceOwnerUserList">
            <div :class="`flex p-15 item ` + item.userType">
              <div class="rel mt-15 circle bg-white"></div>
              <div class="rel flex1 p-15 ml-20 info radius-5">
                <div class="role-label inline text-white">{{ config.system_role[item.userType] }}</div>
                <div class="rel mt-10 fs-c1 text-black text-bold">{{ item.name }}</div>
                <!-- <div class="flex text-gray">
                  <i class="el-icon-phone"></i>
                  <div>{{ dealPhone(item.mobile) }}</div>
                </div> -->
                <img :src="require(`@/assets/device/belong${idx + 1}.svg`)" width="86" class="abs n-img">
              </div>
            </div>
          </template>
        </div>
      </template>
      <template v-if="dialogType == 2">

      </template>
      <template v-if="dialogType == 6">
        <div class="pl-20 pr-20">
          <div class="flex align-center justify-center">
            <div>{{ $t('device.usageDuration') }}: </div>
            <el-select v-model="dform.duration" :placeholder="$t('public.freeTime')">
              <el-option :label="`${item}${$t('public.huor')}`" :value="item" v-for="item in config.bed_order_time" />
            </el-select>
          </div>
          <div class="mt-15 fs-s3">{{ $t('home.after') }}{{ dform.duration }}{{ $t('home.startupSettings') }}</div>

          <div class="mt-30 text-black">
            <div class="cursor">
              {{ $t('home.residueKhb') }}<span class="text-primary">{{ money.happyCurrencyNum }}</span><span
                class="ml-20 text-primary cursor"
                @click="$router.push({ path: `/money` })">{{ $t('home.khbRecharge') }}</span>
            </div>
            <div class="mt-15 text-danger" v-if="!createOrderConfig[dform.deviceTypeCode]">{{ $t('home.notConfigured') }}
            </div>
            <div class="mt-15"
              v-else-if="createOrderConfig[dform.deviceTypeCode].giftDays > 0 && currentTime() < unixTime(curRow.bindStoreTime) + createOrderConfig[dform.deviceTypeCode].giftDays * 86400">
              {{ $t('home.giveFreeTime') }}{{ formatSeconds((unixTime(curRow.bindStoreTime) +
                createOrderConfig[dform.deviceTypeCode].giftDays * 86400) - currentTime()) }}</div>
            <div class="mt-15" v-else>{{ $t('home.deductKhb') }}<span class="text-danger">{{
              createOrderConfig[dform.deviceTypeCode].amount }}</span></div>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 7">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('public.deviceSn')">
            <el-input v-model="dform.deviceSN" :placeholder="$t('public.deviceSn')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('device.serverAddress')">
            <el-input v-model="dform.address" :placeholder="$t('device.serverAddressText')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('device.port')">
            <el-input v-model="dform.port" :placeholder="$t('device.portText')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('device.heartbeatTime')">
            <el-input v-model="dform.heartbeat" :placeholder="$t('device.heartbeatTimeText')">
              <template slot="append">{{ $t('public.second') }}</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="text-danger">{{ $t('device.message5') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 8">
        <div class="flexv pl-20 pr-20 text-black" style="height: 100%;">
          <div class="mb-20 pb-5 l-b">
            <condition :clickSubmit="clickSubmit" :unfoldShow="false" pdClass="p-0"
              @reset="agentList.query = { page: 1, size: 20 }; getAgentList(2)" @query="getAgentList(2)">
              <template v-slot:defult>
                <el-form-item :label="$t('public.agentName')">
                  <el-input v-model="agentList.query.name"></el-input>
                </el-form-item>
                <el-form-item :label="$t('public.phone')">
                  <el-input :placeholder="$t('public.phoneText')" type="tel" v-model="agentList.query.mobile"></el-input>
                </el-form-item>
              </template>
            </condition>
          </div>
          <template v-if="agentList.newly && agentList.newly.length > 0">
            <div class="mb-15">
              {{ $t('public.recentlyAllocated') }}
            </div>
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list">
              <template v-for="item in agentList.newly">
                <el-col :xs="24" :md="12" class="pb-15 custom">
                  <div class="p-15 item radius-5">
                    <div class="flex">
                      <div class="flex1">
                        <div class="text-black">{{ item.name }}</div>
                        <div class="mt-5 text-gray">{{ item.mobile }}</div>
                      </div>
                      <el-button type="primary" plain size="mini"
                        @click="dialogConfirm(item)">{{ $t('public.assign') }}</el-button>
                    </div>
                    <div class="mt-5" v-if="item.agentDeviceType">
                      <span class="text-gray">{{ $t('public.deviceType') }}</span>
                      <span class="ml-5" v-for="d in item.agentDeviceType">{{ d.name }}</span>
                    </div>
                    <div class="mt-5">
                      <span class="text-gray">{{ $t('public.operatingArea') }}</span>
                      <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                    </div>
                  </div>
                </el-col>
              </template>
            </el-row>
          </template>

          <div class="mb-10 flex align-center">
            {{ $t('public.queryResults') }}
          </div>
          <div v-infinite-scroll="getAgentList" infinite-scroll-distance="1" class="flex1 pt-5" style="overflow-y: auto;">
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list">
              <template v-for="item in agentList.list">
                <el-col :xs="24" :md="12" class="pb-15 custom">
                  <div class="p-15 item radius-5">
                    <div class="flex">
                      <div class="flex1">
                        <div class="text-black">{{ item.name }}</div>
                        <div class="mt-5 text-gray">{{ item.mobile }}</div>
                      </div>
                      <el-button type="primary" plain size="mini"
                        @click="dialogConfirm(item)">{{ $t('public.assign') }}</el-button>
                    </div>
                    <div class="mt-5" v-if="item.agentDeviceType">
                      <span class="text-gray">{{ $t('public.deviceType') }}</span>
                      <span class="ml-5" v-for="d in item.agentDeviceType">{{ d.name }}</span>
                    </div>
                    <div class="mt-5">
                      <span class="text-gray">{{ $t('public.operatingArea') }}</span>
                      <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                    </div>
                  </div>
                </el-col>
              </template>
            </el-row>
          </div>
        </div>
      </template>
      <!-- Allocate to Partner | 分配给商家 -->
      <template v-if="dialogType == 10">
        <div class="flexv pl-20 pr-20 text-black" style="height: 100%;">
          <div class="mb-20 pb-5 l-b">
            <condition :clickSubmit="clickSubmit" :unfoldShow="false" pdClass="p-0"
              @reset="storeList.query = { page: 1, size: 20 }; getStoreList(2)" @query="getStoreList(2)">
              <template v-slot:defult>
                <el-form-item :label="$t('public.storeName')">
                  <el-input v-model="storeList.query.name"></el-input>
                </el-form-item>
                <el-form-item :label="$t('public.phone')">
                  <el-input type="tel" v-model="storeList.query.mobile"></el-input>
                </el-form-item>
              </template>
            </condition>
          </div>
          <template v-if="storeList.newly && storeList.newly.length > 0">
            <div class="mb-15">
              {{ $t('public.recentlyAllocated') }}
            </div>
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list">
              <template v-for="item in storeList.newly">
                <el-col :xs="24" :md="12" class="pb-15 custom">
                  <div class="p-15 item radius-5">
                    <div class="flex">
                      <img :src="item.avatar || agentInfo.avatar" width="46" height="46" class="radius-5" alt="">
                      <div class="flex1 pl-10">
                        <div class="text-black">{{ item.name }}</div>
                        <div class="mt-5 text-gray text-cut">{{ item.address }}</div>
                      </div>
                    </div>
                    <div class="mt-15 text-cut" v-if="item.user">
                      <span class="text-gray">{{ $t('public.contactPerson') }}</span>
                      <span class="ml-5">{{ item.user.nickname }}</span>
                      <span class="ml-5 text-gray">{{ $t('public.contactInformation') }}</span>
                      <span class="ml-5">{{ item.user.mobile }}</span>
                    </div>
                    <div class="flex align-end">
                      <span class="text-gray">{{ $t('public.creationTime') }}</span>
                      <span class="flex1 ml-5">{{ item.createTime }}</span>
                      <el-button type="primary" plain size="mini"
                        @click="dialogConfirm(item)">{{ $t('public.assign') }}</el-button>
                    </div>
                  </div>
                </el-col>
              </template>
            </el-row>
          </template>

          <div class="mb-10 flex align-center">
            {{ $t('public.queryResults') }}
          </div>
          <div v-infinite-scroll="getStoreList" infinite-scroll-distance="1" class="flex1 pt-5" style="overflow-y: auto;">
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list">
              <template v-for="item in storeList.list">
                <el-col :xs="24" :md="12" class="pb-15 custom">
                  <div class="p-15 item radius-5">
                    <div class="flex">
                      <img :src="item.avatar || agentInfo.avatar" width="46" height="46" class="radius-5" alt="">
                      <div class="flex1 pl-10">
                        <div class="text-black">{{ item.name }}</div>
                        <div class="mt-5 text-gray text-cut">{{ item.address }}</div>
                      </div>
                    </div>
                    <div class="mt-15 text-cut" v-if="item.user">
                      <span class="text-gray">{{ $t('public.contactPerson') }}</span>
                      <span class="ml-5">{{ item.user.nickname }}</span>
                      <span class="ml-5 text-gray">{{ $t('public.contactInformation') }}</span>
                      <span class="ml-5">{{ item.user.mobile }}</span>
                    </div>
                    <div class="flex align-end">
                      <span class="text-gray">{{ $t('public.creationTime') }}</span>
                      <span class="flex1 ml-5">{{ item.createTime }}</span>
                      <el-button type="primary" plain size="mini"
                        @click="dialogConfirm(item)">{{ $t('public.assign') }}</el-button>
                    </div>
                  </div>
                </el-col>
              </template>
            </el-row>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 11">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()" style="width: 600px;">
          <el-form-item label="设备二维码">
            <el-input v-model="dform.deviceSns" placeholder="多设备英文逗号隔开" type="textarea" rows="4"></el-input>
          </el-form-item>
          <el-form-item label="设备工厂">
            <el-select v-model="dform.factoryCode">
              <template v-for="item in factoryList">
                <el-option :label="item.name" :value="item.code"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="设备口数">
            <el-select v-model="dform.deviceSlot" @change="selSlot">
              <template v-for="item in [4,6,8,12,16,20,24,28,32,36,40,48,52,56]">
                <el-option :label="item + '口'" :value="item"></el-option>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item label="软件类型">
            <el-radio-group v-model="dform.updateType" @change="selUpdateType">
              <el-radio :label="key" v-for="(item, key) in updateType">{{ item }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="更新包地址">
            <el-input v-model="dform.domainUrl" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="更新包路径">
            <el-input v-model="dform.path" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="更新包md5">
            <el-input v-model="dform.md5" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="更新包大小">
            <el-input v-model="dform.size" :placeholder="$t('public.enter')" :disabled="updateDisabled"><template slot="append">字节</template></el-input>
          </el-form-item>
          <el-form-item label="设备版本">
            <el-input v-model="dform.deviceVersion" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
          <el-form-item label="包版本名称">
            <el-input v-model="dform.fileVersion" :placeholder="$t('public.enter')" :disabled="updateDisabled"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[3, 6, 7, 11].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-popconfirm
            :title="dialogType == 11 ? '请仔细确认升级设备和软件类型及版本是否匹配，不匹配会导致设备出现异常' : '确定提交吗？'"
            @onConfirm="dialogConfirm()"
          >
            <el-button size="medium" type="primary" :disabled="clickSubmit" slot="reference">{{ $t('public.confirm') }}</el-button>
          </el-popconfirm>
        </div>
      </template>
    </el-drawer>

    <xlsx ref="toXlsx" :fileName="$t('device.equipmentRecord')"></xlsx>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
import xlsx from '@/components/xlsx/'
import QRCode from 'qrcodejs2'
import { unixTime, formatSeconds, currentTime, accSub } from '@/utils/index'
export default {
  name: 'device',
  components: {
    TableColumnSet,
    Pagination,
    condition,
    selectSearch,
    xlsx
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
    screenfull() {
      if(this.list.length > 0){
        this.setTableMaxH()
      }
      return this.$store.state.app.screenfull
    },
    haveBind() {
      return [
        {
          value: 0,
          title: this.$t('public.all'),
          nkey: 'SUM'
        },
        {
          value: true,
          title: this.$t('device.assignedToPartner'),
          nkey: 'BIND'
        },
        {
          value: false,
          title: this.$t('device.notAssignedToPartner'),
          nkey: 'UNBIND'
        },
        {
          value: 'ONLINE',
          title: this.$t('public.onLine'),
          nkey: 'ONLINE'
        },
        {
          value: 'OFFLINE',
          title: this.$t('public.offline'),
          nkey: 'OFFLINE'
        }
      ]
    },
    queryObj() {
      return {
        deviceSn: {
          title: this.$t('public.code'),
          type: 'input'
        },
        place: {
          title: this.$t('public.locationNotes'),
          type: 'input'
        },
        // Currently not functional | 是否关联设备,
        // haveAssociateDevice: {
        //   title: this.$t('device.isItRelated'),
        //   type: 'select',
        //   selectArr: [
        //     {
        //       label: this.$t('public.all'),
        //       value: null,
        //     },
        //     {
        //       label: this.$t('device.associated'),
        //       value: true,
        //     },
        //     {
        //       label: this.$t('device.unassociated'),
        //       value: false,
        //     }
        //   ]
        // },
        storeId: {
          title: this.$t('public.storeName'),
          type: 'selectSearch',
          name: 'name',
          sType: 3
        },
        agentId: {
          title: this.$t('public.agentNickNames'),
          type: 'selectSearch',
          name: 'name',
          sType: 5
        },
        factorySn: {
          title: this.$t('device.serialNumber'),
          type: 'input'
        },
        // positionQty: {
        //   title: '槽口数',
        //   type: 'input'
        // },
      }
    },
    dialogTitle() {
      return {
        1: this.$t('device.equipmentOwnership'),
        2: this.$t('public.deviceCode'),
        3: this.$t('device.putIn'),
        4: this.$t('device.deviceDisassociation'),
        5: this.$t('device.associateSecondaryEquipment'),
        6: this.$t('public.createOrderText'),
        7: this.$t('device.address'),
        8: this.$t('device.distributionEquipment'),
        9: this.$t('device.switchBrand'),
        10: this.$t('public.allocateToPartner'),
        11: '设备软件升级',
      }
    },
    defaultColumn() {
      return [
        {
          key: 'deviceType',
          val: true,
          name: this.$t('public.deviceType')
        },
        {
          key: 'factorySn',
          val: false,
          name: this.$t('device.deviceSnCode'),
          width: 130
        },
        {
          key: 'deviceSn',
          val: true,
          name: this.$t('public.code')
        },
        {
          key: 'tenantNumber',
          val: this.checkAbility(['PA'], 2),
          hidden: !this.checkAbility(['PA'], 2),
          name: this.$t('device.available') + ' / ' +this.$t('device.inUse')
        },
        // {
        //   key: 'deviceFactory',
        //   val: true,
        //   name: this.$t('public.deviceProperties')
        // },
        {
          key: 'distribute',
          val: true,
          name: this.$t('public.status')
        },
        {
          key: 'bindStoreTime',
          val: true,
          name: this.$t('public.deliveryTime')
        },
        {
          key: 'store',
          val: true,
          name: this.$t('public.storeName')
        },
        {
          key: 'bind',
          val: this.lowerDevice,
          hidden: !this.lowerDevice,
          name: this.$t('public.allocatedTo')
        },
        {
          key: 'place',
          val: true,
          name: this.$t('public.locationNotes')
        },
        {
          key: 'onlineStatus',
          val: true,
          name: this.$t('public.powerbankStatus')
        },
        {
          key: 'order',
          val: this.isBrand() || this.isSaas(),
          hidden: !this.isBrand() && !this.isSaas(),
          name: this.$t('home.allOrderNum')
        },
        {
          key: 'amount',
          val: this.isBrand() || this.isSaas(),
          hidden: !this.isBrand() && !this.isSaas(),
          name: `${this.$t('public.aTurnover')}`
        },
        {
          key: 'trafficCardId',
          val: false,
          name: this.$t('device.trafficCardNumber')
        },
        {
          key: 'signalStrength',
          val: false,
          name: this.$t('device.signalValue')
        },
        {
          key: 'romVer',
          val: false,
          name: 'RomVersion',
          width: 350
        },
        {
          key: 'voice',
          val: false,
          name: this.$t('device.volume')
        },
        {
          key: 'batteryLevel',
          val: false,
          name: this.$t('device.electricity')
        }
      ]
    }
  },
  data() {
    return {
      formatSeconds: formatSeconds,
      unixTime: unixTime,
      clickSubmit: false,
      formKey: {
        sel1: 'deviceSn',
        sel2: 'storeId'
      },
      form: {},
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
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
      // 代理
      agentList: {
        query: {
          page: 1,
          size: 20
        },
        list: [],
        newly: []
      },
      // 商户
      storeList: {
        query: {
          page: 1,
          size: 20
        },
        list: [],
        newly: []
      },
      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
      // 设备归属
      deviceInfo: {},
      factoryList: [],
      updateType: {'1': '网关版', '10': '仓位版(10)', '12': '仓位版(12)'},
      updateDisabled: true,
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'addStore') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let query = this.$route.query
    this.queryKey = ['brandId', 'storeId', 'agentId', 'deviceIds', 'sourceType']
    for (var i in this.queryKey) {
      if (query[this.queryKey[i]]) {
        this.form[this.queryKey[i]] = query[this.queryKey[i]]
      } else {
        delete this.form[this.queryKey[i]]
      }
    }
    if (this.$route.meta.reload) {
      this.getList()
    } else if (this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery()
    }
    this.urlQuery = this.$route.meta.urlQuery
    if (this.isStore()) {
      this.getBalance()
    }
  },
  mounted(options) {
    if (this.isSaas()) {
      this.$set(this.queryObj, 'brandId', {
        title: this.$t('public.brandName'),
        type: 'selectSearch',
        name: 'name',
        sType: 6
      })
    }
    let newlyAgent = localStorage.getItem(`newly_agent_${this.agentInfo.id}`) || ''
    if (newlyAgent) {
      this.agentList.newly = JSON.parse(newlyAgent)
    }
    let newlyStore = localStorage.getItem(`newly_store_${this.agentInfo.id}`) || ''
    if (newlyStore) {
      this.storeList.newly = JSON.parse(newlyStore)
    }
  },
  methods: {
    /**
     * 获取可提现金额
     */
    getBalance() {
      this.$get('iot-saas-pay/api/pay/withdraw/balance').then(res => {
        this.money = res || {}
      })
    },

    /**
     * 校验是否可选
     */
    checkSel(row) {
      if(this.isSaas()){
        return true
      }
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
        selSnArr.push(list[i].deviceSn)
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
      this.deviceCodeIds = {}
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
        page: this.listQuery.page - 1,
        lowerDevice: this.lowerDevice
      })
      if (['ONLINE', 'OFFLINE'].indexOf(params.haveBind) > -1) {
        params.onlineStatus = params.haveBind
        delete params.haveBind
      }
      if (params.haveBind == 0) delete params.haveBind
      if (params.deviceTypeCode == 0) delete params.deviceTypeCode
      this.$get('iot-saas-device/admin/device/findPage', params).then((res = {}) => {
        this.list = res.rows || []
        this.queryOrderCount(this.arrayKeys(this.list, 'deviceSn'))
        if (this.Ability['RELATION_DEVICE'] && this.list.length > 0) {
          let fatherSn = []
          this.list.map(item => {
            if (item.fatherDeviceSn == 'FATHER') {
              fatherSn.push(item.deviceSn)
            }
          })
          if (fatherSn.length > 0) {
            this.queryByFatherDeviceSn(fatherSn)
          }
        }
        if (this.outStatus) {
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
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.deviceCount = res.ext || {}
          }
        }

      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    setTableMaxH(){
      this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
    },

    /**
     * 订单统计数量查询
     */
    queryOrderCount(sns) {
      if (sns.length == 0) {
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
    queryByFatherDeviceSn(fatherSns) {
      if (fatherSns.length == 0) {
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
     * 设备解绑
     */
    unboundStore(row) {
      this.$post('iot-saas-device/admin/device/unbindStore', {
        deviceIds: [row.id]
      }).then(res => {
        this.$message({
          message: this.$t('public.unbindSuccessful'),
          type: 'success'
        })
        row.distribute = false
        row.store = ''
      })
    },

    /**
     * 设备回收
     */
    unbindAgent(row, idx) {
      this.$post('iot-saas-device/admin/device/unbindAgent', {
        deviceIds: row ? [row.id] : this.selID
      }).then(res => {
        this.$message({
          message: this.$t('public.recyclingSuccessful'),
          type: 'success'
        })
        if (idx) {
          this.list.splice(idx, 1)
        } else {
          this.getList()
        }
      })
    },

    /**
     * 设备重启
     */
    restart(row){
      this.$get('iot-saas-device/admin/device/restartDevice', {
        deviceSn: row.deviceSn
      }).then(res => {
        this.$message({
          message: this.$t('public.operationSuccessful'),
          type: 'success'
        })
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型  3
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型 1: '设备归属'  2: '' 3: '位置备注'  4: '设备解除关联'  5: '关联副设备' 6: '创建订单' 7: '设置服务器地址' 8: '分配设备' 9: '切换设备品牌商'
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
        if(dialogType == 3){
          this.dform = {
            place: row.place
          }
        }
        break
      case 3:
        this.dialogType = dialogType
        this.curRow = row
        this.curIdx = idx
        this.drawerStatus = true
        this.dform = {}
        if (dialogType == 1) {
          if (this.deviceInfo[row.deviceSn]) return
          this.$get('iot-saas-device/admin/device/findBelong', {
            deviceSn: row.deviceSn
          }).then(res => {
            if (res.storeName) {
              res.deviceOwnerUserList.push({
                name: res.storeName,
                userType: 'store'
              })
            }
            this.$set(this.deviceInfo, row.deviceSn, res)
          })
        } else if (dialogType == 6) {
          let code = row.deviceTypeCode ? row.deviceTypeCode.substr(0, 2) : row.deviceType.code.substr(0, 2)
          if (!this.createOrderConfig[code]) {
            this.$set(this.createOrderConfig, code, {})
            this.getCreateOrderConfig(code)
          }
          this.dform = {
            deviceSn: row.deviceSn,
            deviceTypeCode: code,
            duration: 2
          }
        } else if (dialogType == 8) {
          if (this.agentList.list.length == 0) this.getAgentList()
        } else if (dialogType == 10) {
          if (this.storeList.list.length == 0) this.getStoreList()
        } else if (dialogType == 11) {
          this.getFactory()
          let deviceSns = ''
          if(this.selSnArr.length > 0){
            deviceSns = this.selSnArr.join(',')
          }
          this.dform = {
            deviceSns: deviceSns,
            updateType: '1',
          }
        }
        break
      case 4:
        this.$alert(this.$t('device.alert'), this.$t('device.alert1'), {
          confirmButtonText: this.$t('public.confirm'),
          center: true,
          callback: action => {
            if (action == 'confirm') {
              this.$get('iot-saas-device/admin/device/count/init').then(res => {
                this.$message({
                  message: this.$t('public.refreshSuccessful'),
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
     * 获取工厂
     */
    getFactory() {
      if(this.factoryList.length > 0) return
      this.$get('iot-saas-basic/admin/factory/list').then(res => {
        this.factoryList = res.filter(item => item.deviceTypeList && JSON.stringify(item.deviceTypeList).indexOf('PA') > -1)
      })
      this.$get('iot-saas-pay/open/pay/system/config', {
        key: 'deviceUpdateConfig'
      }).then(res => {
        let deviceUpdateConfig = res.valueJson ? JSON.parse(res.valueJson) : {}
        if (deviceUpdateConfig.config) {
          let configObj = JSON.parse(deviceUpdateConfig.config)
          if(configObj.updateType){
            this.updateType = configObj.updateType
            delete configObj.updateType
          }
          if(configObj.updateDisabled){
            this.updateDisabled = configObj.updateDisabled == 1
            delete configObj.updateDisabled
          }
          this.deviceUpdateConfig = configObj
        }
      })
    },

    /**
     * 弹窗确认
     */
    dialogConfirm(row = {}) {
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 3:
          params.deviceId = curRow.id
          params.deviceSn = curRow.deviceSn
          this.$post('iot-saas-device/admin/device/update', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
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
          if (curRow.fatherDeviceSn == 'FATHER') {
            params.fatherDeviceSn = curRow.deviceSn
            params.sonDeviceSn = this.dform.sonDeviceSn
          } else {
            params.fatherDeviceSn = curRow.fatherDeviceSn
            params.sonDeviceSn = curRow.deviceSn
          }
          this.$post('iot-saas-device/admin/device/liftAssociationDevice', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            if (curRow.fatherDeviceSn == 'FATHER') {
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
          if (!params.sonDeviceSn) {
            this.$message({
              message: this.$t('device.message6'),
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
              message: this.$t('public.operationSuccessful'),
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
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 7:
          params.deviceSn = curRow.deviceSn
          params.heartbeat = curRow.heartbeat || 30
          if (!params.deviceSn) {
            this.$message({
              message: this.$t('device.inputMessage1'),
              type: 'error'
            })
            return
          } else if (!params.address) {
            this.$message({
              message: this.$t('device.message7'),
              type: 'error'
            })
            return
          } else if (!params.port) {
            this.$message({
              message: this.$t('device.message8'),
              type: 'error'
            })
            return
          }
          this.$post('http://139.159.246.248:9888/api/setting/address', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 8:
          this.$post('iot-saas-device/admin/device/bindAgent', {
            agentId: row.id,
            deviceSns: curRow.deviceSn ? curRow.deviceSn.split(',') : this.selSnArr
          }).then(res => {
            this.drawerStatus = false
            if (curIdx) {
              this.list.splice(curIdx, 1)
            } else {
              this.getList()
            }
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            let newlyAgent = JSON.parse(JSON.stringify(this.agentList.newly))
            if (newlyAgent.length > 2) newlyAgent.pop()
            if (this.arrayKeys(newlyAgent, 'id').indexOf(row.id) == -1) newlyAgent.unshift(row)
            localStorage.setItem(`newly_agent_${this.agentInfo.id}`, JSON.stringify(newlyAgent))
            this.agentList.newly = newlyAgent
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 9:
          params.deviceSn = curRow.deviceSn
          this.$post('iot-saas-device/admin/device/deviceChange', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.dialogStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 10:
          this.$post('iot-saas-device/admin/device/bindStore', {
            storeId: row.id,
            deviceSns: curRow.deviceSn ? curRow.deviceSn.split(',') : this.selSnArr
          }).then(res => {
            this.drawerStatus = false
            if (curIdx) {
              curRow.distribute = true
              curRow.store = {
                name: row.name
              }
              curRow.bindStoreTime = this.parseTime(this.currentTime())
            } else {
              this.getList()
            }
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            let newlyStore = JSON.parse(JSON.stringify(this.storeList.newly))
            if (newlyStore.length > 2) newlyStore.pop()
            if (this.arrayKeys(newlyStore, 'id').indexOf(row.id) == -1) newlyStore.unshift(row)
            localStorage.setItem(`newly_store_${this.agentInfo.id}`, JSON.stringify(newlyStore))
            this.storeList.newly = newlyStore
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 11:
          if(!params.deviceSns){
            this.$message({
              message: '设备二维码不能为空',
              type: 'error'
            })
            this.clickSubmit = false
            return
          }
          if(!params.domainUrl){
            this.$message({
              message: '更新包地址不能为空',
              type: 'error'
            })
            this.clickSubmit = false
            return
          }
          this.$post('iot-saas-device/admin/device/updateDeviceVersions', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.drawerStatus = false
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
    getCreateOrderConfig(code) {
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
    deviceCode(sn, url) {
      let deviceCodeIds = this.deviceCodeIds || {}
      if (deviceCodeIds[sn]) return
      deviceCodeIds[sn] = sn
      this.$refs[`sn_${sn}`][0].innerHTML = ''
      this.$nextTick(() => {
        new QRCode(this.$refs[`sn_${sn}`][0], {
          width: 150,
          height: 150,
          text: url
        })
      })
    },

    /**
     * 获取代理
     */
    getAgentList(type = 1) {
      let params = JSON.parse(JSON.stringify(this.agentList.query))
      if (type == 2) {
        params.page = 1
        this.agentList.list = []
      }
      params.page--
      params.lowerAgent = false
      if (this.onLoadAgent && type == 1) return
      this.onLoadAgent = true
      this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
        this.agentList.list = this.agentList.list.concat(res.rows || [])
        if (parseInt((parseInt(res.total) / params.size)) > params.page) {
          this.onLoadAgent = false
          this.agentList.query.page = params.page + 2
        }
      })
    },

    /**
     * 获取商户
     */
    getStoreList(type = 1) {
      let params = JSON.parse(JSON.stringify(this.storeList.query))
      if (type == 2) {
        params.page = 1
        this.storeList.list = []
      }
      params.page--
      params.lowerStore = false
      if (this.onLoadStore && type == 1) return
      this.onLoadStore = true
      this.$get('iot-saas-basic/admin/store/findPage', params).then(res => {
        this.storeList.list = this.storeList.list.concat(res.rows || [])
        if (parseInt((parseInt(res.total) / params.size)) > params.page) {
          this.onLoadStore = false
          this.storeList.query.page = params.page + 2
        }
      })
    },

    /**
     * 选择槽口数
     */
    selSlot(val){
      let dform = this.dform
      if(!dform.factoryCode){
        this.$message({
          message: '请先选择工厂',
          type: 'error'
        })
        return
      }
      let key = `${dform.factoryCode}_${val}_${dform.updateType}`, obj = JSON.parse(JSON.stringify(this.dform))
      if(this.deviceUpdateConfig[key]){
        obj = Object.assign({}, this.dform, this.deviceUpdateConfig[key])
      }else{
        let keys = ['domainUrl','path','md5','size','deviceVersion','fileVersion']
        for(var i in keys){
          if(obj[keys[i]]){
            delete obj[keys[i]]
          }
        }
      }
      this.dform = obj
    },

    /**
     * 选择更新类型
     */
    selUpdateType(val){
      let dform = this.dform
      if(!this.dform.factoryCode){
        this.$message({
          message: '请先选择工厂',
          type: 'error'
        })
        return
      }
      let key = `${dform.factoryCode}_${dform.deviceSlot}_${val}`, obj = JSON.parse(JSON.stringify(this.dform))
      if(this.deviceUpdateConfig[key]){
        obj = Object.assign({}, this.dform, this.deviceUpdateConfig[key])
      }else{
        let keys = ['domainUrl','path','md5','size','deviceVersion','fileVersion']
        for(var i in keys){
          if(obj[keys[i]]){
            delete obj[keys[i]]
          }
        }
      }
      this.dform = obj
    },
  }
}
</script>

<style>
.dropdown.el-popper {
  margin-top: 0;
  min-width: 150px;
}
</style>
<style lang="scss" scoped>
.access-url {
  margin: 0 auto;
  width: 150px;
  height: 150px
}

.relation-label {
  width: 5em;
}

/**
   * 归属
   */
.owner-user {
  .item {
    .circle {
      width: 24px;
      height: 24px;
      border: 5px solid var(--olive);
      border-radius: 24px;

      &::after {
        content: '';
        position: absolute;
        top: 20px;
        left: 7px;
        height: 120px;
        width: 1px;
        background-color: #E5E6EB;
      }
    }

    &:last-child {
      .circle {
        &::after {
          height: 0;
        }
      }
    }

    .info {
      min-width: 280px;
      border: 1px solid #E5E6EB;
    }

    .role-label {
      padding: 3px 8px;
      background: var(--olive);
      border-radius: 2px;
    }

    .n-img {
      right: 0;
      bottom: 0;
    }

    &.agent {
      .circle {
        border-color: #F77234;
      }

      .role-label {
        background: #F77234;
      }
    }

    &.store {
      .circle {
        border-color: #0FC6C2;
      }

      .role-label {
        background: #0FC6C2;
      }
    }
  }
}

/**
   * 代理
   */
.agent-list {
  width: 800px;

  .item {
    border: 1px solid #E5E6EB;
  }
}</style>
