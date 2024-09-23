<template>
  <div>
    <template v-if="!isStore()">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery" :exportStatus="true"
        @saveXlsx="saveXlsx">
        <template v-slot:defult>
          <el-form-item :label="$t('public.brandName')" v-if="isSaas()">
            <selectSearch v-model="form.brandId" :type="6" name="name" :placeholder="$t('store.pleaseBrandName')"
              @change="toQuery()">
            </selectSearch>
          </el-form-item>
          <el-form-item :label="$t('store.goodsOrNot')">
            <el-select v-model="form.haveDevice" @change="toQuery()" :placeholder="$t('store.goodsOrNot')">
              <el-option :label="$t('public.all')" :value="null" />
              <el-option :label="$t('public.shipped')" value="1" />
              <el-option :label="$t('public.unpacked')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('public.storeName')">
            <el-input v-model="form.name" :placeholder="$t('public.storeName')" />
          </el-form-item>
          <el-form-item :label="$t('public.phone')">
            <el-input v-model="form.mobile" :placeholder="$t('public.phone')" />
          </el-form-item>
          <el-form-item :label="$t('public.remark')">
            <el-input v-model="form.remark" :placeholder="$t('public.remark')" />
          </el-form-item>
        </template>
        <template v-slot:endButton>
          <!-- <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/store/addStore`})" v-if="!lowerStore && !isSaas() && !form.agentId"><i class="el-icon-plus el-icon--left" />添加商户</el-button> -->
          <import-data :type="3" :uploadText="$t('store.importMerchants')"
            v-if="isBrand() && !lowerStore && !form.agentId"></import-data>
        </template>
      </condition>
    </template>

    <div class="pl-10 pr-10 bg-white" :class="{ 'pt-15': isStore() }">
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
        <div class="ml-20 text-primary cursor line-1" @click="setRows(1, {}, 3)" v-if="false">{{ $t('device.unfoldRecord')
        }}</div>
        <table-column-set storageKey="storeTableColumn" :showColumn.sync="showColumn"
          :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" highlight-current-row element-loading-text="Loading"
        v-loading="listLoading" :max-height="tableMaxH" :data="list">
        <el-table-column :label="$t('public.brand')" width="150" prop="brandName" v-if="isSaas()"></el-table-column>
        <template v-for="item in showColumn">
          <el-table-column :label="item.name" min-width="120" v-if="item.val && item.key == 'name'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar class="block" shape="square" :size="40" :src="ossThumbnail(scope.row.avatar || agentInfo.avatar)" fit="fill"
                  icon="el-icon-picture-outline"></el-avatar>
                <div class="ml-10 cursor text-cut_two" @click="copyText(scope.row.id)">{{ scope.row.name || '--' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="180" v-else-if="item.val && item.key == 'device'">
            <template slot-scope="scope">
              <div class="row-device_stat" v-if="deviceCount[scope.row.id]">
                <template v-for="(item, i) in deviceCount[scope.row.id].deviceCountVOMap">
                  {{ myDeviceId[i.substr(0, 2)] }}：{{ item.deviceNumber }}
                </template>
              </div>
              <div class="row-device_stat" v-else>
                <template v-for="(item, index) in scope.row.storeDivisionConfig">
                  <div v-if="index < 2">
                    {{ myDeviceId[item.deviceTypeCode] }}：0
                  </div>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'amount'">
            <template slot-scope="scope">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'amountDivide'">
            <template slot-scope="scope">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide : '0.00' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'balance'">
            <template slot-scope="scope">
              <div class="text-primary cursor" @click="$refs.UpdateBlances.setRows(cashStat[scope.row.id] || {})" v-if="checkAbility(['WD_MODIFY'], 3)">
                {{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}
              </div>
              <div class="cursor" v-else>
                {{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'order'">
            <template slot-scope="scope">
              <div class="text-primary cursor">
                <div
                  @click="$router.push({ path: `/order?storeId=${scope.row.id}&agentId=${scope.row.agentId}&brandId=${scope.row.brandId}` })"
                  v-if="isSaas()">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}
                </div>
                <div
                  @click="$router.push({ path: (lowerStore ? `/order/subOrder?storeId=${scope.row.id}&agentId=${scope.row.agentId}` : `/order?storeId=${scope.row.id}&agentId=${scope.row.agentId}`) })"
                  v-else>
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx + orderCount[scope.row.id].ali : 0 }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="180" v-else-if="item.val && item.key == 'user'">
            <template slot-scope="scope">
              <div v-if="scope.row.user">{{ scope.row.user.nickname || '' }}</div>
              <div v-if="scope.row.user && scope.row.user.mobile.length == 11">
                <el-tooltip class="item" effect="dark" :content="scope.row.user.mobile" placement="top" v-if="isSaas()">
                  <div>{{ dealPhone(scope.row.user.mobile) }}</div>
                </el-tooltip>
                <div v-else>{{ scope.row.user.mobile }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="280" v-else-if="item.val && item.key == 'deviceDivision'">
            <template slot-scope="scope">
              <div class="row-device_stat">
                <template v-for="(item, index) in scope.row.storeDivisionConfig">
                  <div class="flex line-1 item" v-if="index < 2">
                    <div>{{ myDeviceId[item.deviceTypeCode] }}：</div>
                    <div>
                      <span v-if="scope.row.divisionMode == 1">
                        <span v-if="isStore()">{{ item.promised || item.live }}%</span>
                        <span v-else-if="item.closeType == 3">{{ $t('public.commitment') }}{{ item.promised
                        }}%，{{ $t('public.relative') }}{{ item.relative }}%({{
  config.closeType[item.closeType] }})</span>
                        <span v-else>{{ item.live }}%({{ config.closeType[item.closeType] }})</span>
                      </span>
                      <span v-else>{{ $t('public.undivided') }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="item.name" width="180" v-else-if="item.val && item.key == 'province'">
            <template slot-scope="scope">
              {{ scope.row.province }}
              {{ scope.row.city }}
              {{ scope.row.district }}
            </template>
          </el-table-column> -->
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'catId'">
            <template slot-scope="scope">
              {{ cateObj[scope.row.catId] ? cateObj[scope.row.catId].catName : '--' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'supUser'">
            <template slot-scope="scope">
              <div>{{ supUser[scope.row.agentId] ? supUser[scope.row.agentId].name : '' }}</div>
              <div>{{ supUser[scope.row.agentId] ? dealPhone(supUser[scope.row.agentId].mobile) : '' }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" width="120" v-else-if="item.val && item.key == 'remark'">
            <template slot-scope="scope">
              <div class="cursor text-primary" @click="setRows(3, scope.row, 12)">{{ scope.row.remark || '无' }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="item.name" v-else-if="item.val" :prop="item.key"></el-table-column>
        </template>

        <el-table-column :label="$t('public.operate')" width="150" :fixed="device == 'desktop' ? 'right' : false"
          v-if="isStore()">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-button type="text" @click="setRows(2, scope.row)"
                v-if="agentInfo.storeIds && agentInfo.storeIds[0] != scope.row.id">{{ $t('store.switchMerchant') }}</el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('public.operate')" width="235" :fixed="device == 'desktop' ? 'right' : false" v-else>
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <template v-if="isSaas()">
                <el-button type="text" @click="toLogin(scope.row)">{{ $t('store.storeManagement') }}</el-button>
                <el-button type="text" @click="setRows(6, scope.row)">{{ $t('public.setLoginPassword') }}</el-button>
              </template>
              <template v-else-if="form.deviceSns">
                <el-button type="text" @click="bindStore(scope.row)">{{ $t('public.distributionOfGoods') }}</el-button>
              </template>
              <template v-else>
                <el-button type="text" @click="setRows(3, scope.row, 1, scope.$index)">{{ $t('public.bindDevice')
                }}</el-button>
                <el-button type="text" @click="$refs.AssignAbilitys.getAuthMenu(scope.row.userId)">{{
                  $t('public.permissionSettings') }}</el-button>
                <el-button type="text"
                  @click="$router.push({ path: `/store/editStore?storeId=${scope.row.id}&lowerStore=${lowerStore ? 1 : 0}` })">{{
                    $t('public.editStore') }}</el-button>
                <el-button type="text" @click.native="setRows(1, scope.row, 3, scope.$index)"><span class="text-danger">{{
                  $t('public.deleteStore') }}</span></el-button>
                <el-button type="text" @click="$router.push({ path: `/store/addStore?parentId=${scope.row.id}` })"
                  v-if="scope.row.parentId == '0'">{{ $t('public.addBranch') }}</el-button>
                <el-dropdown trigger="click">
                  <el-button type="text">{{ $t('public.adds') }}<i
                      class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                  <el-dropdown-menu slot="dropdown">
                    <template v-if="checkAbility(['VM'], 2, scope.row.storeDivisionConfig)">
                      <el-dropdown-item @click.native="$refs.VendorModes.getCompanyInfo(scope.row.id)">{{
                        $t('store.operationMode') }}</el-dropdown-item>
                      <el-dropdown-item @click.native="$refs.relatedTemplates.getCompanyTemplate(scope.row.id)">{{
                        $t('store.companyTemplate') }}</el-dropdown-item>
                    </template>
                    <template
                      v-if="checkAbility(Object.keys(config.roomDevice), 2, scope.row.storeDivisionConfig) && isBrand()">
                      <el-dropdown-item
                        @click.native="$router.push({ path: `/device/bedSetting?id=${scope.row.id}&userKey=storeId` })">{{
                          $t('store.roomDevice') }}</el-dropdown-item>
                    </template>
                    <el-dropdown-item @click.native="setRows(8, scope.row, 8)" v-if="isBrand()">{{
                      $t('store.assignMerchants') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({ path: `/device/bedStat?id=${scope.row.id}` })"
                      v-if="isBrand() && checkAbility(['BD', 'VG'], 2, scope.row.storeDivisionConfig)">{{
                        $t('store.onlineStatistics') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/store/membership?id=${scope.row.id}&userKey=storeId` })"
                      v-if="checkAbility(['_MEMBER_XF', '_MEMBER_DQ'], 1, scope.row.storeDivisionConfig)">{{
                        $t('store.membershipCard') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/store/steal?id=${scope.row.id}&userKey=storeId` })"
                      v-if="checkAbility(['_DD_END', '_DD_HIDE', '_DD_RATIO', '_DD_TIME', '_DD_FAIL'], 1, scope.row.storeDivisionConfig)">{{
                        $t('store.DDSettings') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/system/cashSet?id=${scope.row.id}&userKey=storeId` })"
                      v-if="isBrand() && checkAbility(['WD_AGENT','WD_STORE','WD_USER'], 3)">{{ $t('system.withdrawRule') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/device/freeQuota?id=${scope.row.id}&userKey=storeId` })"
                      v-if="checkAbility(['_FREEQUOTA'], 1, scope.row.storeDivisionConfig)">{{ $t('public.freeQuota')
                      }}</el-dropdown-item>
                    <!-- <el-dropdown-item @click.native="setRows(3, scope.row, 4, scope.$index)"
                      v-if="!deviceCount[scope.row.id] && !orderCount[scope.row.id]">{{ $t('public.assignToAgent')
                      }}</el-dropdown-item> -->
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/system/toolsConfig?id=${scope.row.id}&userKey=storeId&code=DEPOSIT_PRPR` })"
                      v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'], 1, scope.row.storeDivisionConfig)">{{
                        $t('public.probabilityDeposit') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/system/toolsConfig?id=${scope.row.id}&userKey=storeId&code=DIVIDE_ACCOUNTS` })"
                      v-if="isBrand() && checkAbility(['_DIVIDE_ACCOUNTS'], 1, scope.row.storeDivisionConfig)">{{
                        $t('public.weChatAccountSplitting') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(3, cashStat[scope.row.id], 6)"
                      v-if="checkAbility(['FROZEN_BALANCE'], 3)">{{ $t('public.freezeAmount') }}</el-dropdown-item>
                    <el-dropdown-item
                      @click.native="$router.push({ path: `/device/orderOt?id=${scope.row.id}&roleType=3` })"
                      v-if="isBrand()">{{
                        $t('device.deviceCost') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(3, scope.row, 11)" v-if="isBrand()">{{
                      $t('public.setLoginPassword') }}</el-dropdown-item>
                    <template v-if="checkAbility(['WF'], 2, scope.row.storeDivisionConfig)">
                      <el-dropdown-item @click.native="setRows(3, scope.row, 7)">{{ $t('store.sharedWIFI')
                      }}</el-dropdown-item>
                    </template>
                    <el-dropdown-item @click.native="setRows(3, scope.row, 10)" v-if="isBrand()">{{ $t('store.loginRecord') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({ path: `/market/appList` })"
                      v-if="isBrand()">{{ $t('public.moreApplications') }}</el-dropdown-item>
                    <el-dropdown-item @click.native="setRows(3, scope.row, 10)">付费会员码</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
          @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 3">
        <div class="text-center">
          <div class="text-black">{{ $t('store.deleteThisMerchant') }}</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left">{{ $t('store.deleteThisMerchantText') }}</div>
        </div>
      </template>
      <template v-if="dialogType == 5">
        <div class="text-center">
          <div class="text-black">{{ $t('store.resettingStorePassword') }}</div>
          <div class="mt-10 pl-40 pr-40 text-danger">{{ $t('store.resettingStorePasswordText') }}</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <el-form class="pl-20 pr-20 custom-form">
          <el-form-item :label="$t('store.deviceSns')">
            <el-input v-model="dform.deviceSns" :placeholder="$t('store.deviceSnsText')" type="textarea"
              :rows="5"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 4">
        <el-form class="pl-20 pr-20 custom-form">
          <el-form-item :label="$t('public.agentNickNames')">
            <selectSearch :type="5" :emitRow="true" name="name" :placeholder="$t('store.agentNameSerach')"
              @change="getAgent"></selectSearch>
          </el-form-item>
          <el-form-item>
            <div class="pb-20" v-if="agentRow.id">
              <span>{{ $t('public.name') }}：{{ agentRow.name }}</span>
              <span class="ml-10">{{ $t('public.telephone') }}：{{ agentRow.mobile }}</span>
            </div>
            <div class="flex justify-center align-center" v-if="!agentRow.id && lowerStore">
              <div class="mr-10">{{ $t('public.assignToOneself') }}</div>
              <el-switch v-model="dform.allotMe" />
            </div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 6">
        <el-form class="pl-20 pr-20 custom-form" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('public.freezeAmount')">
            <el-input type="number" v-model="dform.frozenBalance" :placeholder="$t('store.frozenBalanceText')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 7">
        <el-form class="pl-20 pr-20 custom-form" @submit.native.prevent v-if="dform.content">
          <el-form-item v-for="(item, index) in dform.content">
            <div class="flex align-center">
              <el-input v-model="item.roomNumber" :placeholder="$t('store.room')"></el-input>
              <el-input class="ml-10" v-model="item.name" :placeholder="$t('store.WIFIAccount')"></el-input>
              <el-input class="ml-10" v-model="item.password" :placeholder="$t('store.WIFIPassword')"></el-input>
              <div class="pl-10" @click="dform.content.push({})" v-if="index == 0">
                <i class="fs-b1 text-primary el-icon-circle-plus cursor"></i>
              </div>
              <div class="pl-10" @click="dform.content.splice(index, 1)" v-if="index > 0">
                <i class="fs-b1 text-danger el-icon-remove cursor"></i>
              </div>
            </div>
          </el-form-item>
          <div class="mt-15 text-gray text-left">{{ $t('store.WIFItext') }}</div>
        </el-form>
      </template>
      <template v-if="dialogType == 8">
        <div class="flexv pl-20 pr-20 text-black" style="height: 100%;">
          <div class="mb-20 pb-5 l-b">
            <condition :clickSubmit="clickSubmit" :unfoldShow="false" pdClass="p-0"
              @reset="agentList.query = { page: 1, size: 20 }; getAgentList(2)" @query="getAgentList(2)">
              <template v-slot:defult>
                <el-form-item :label="$t('public.agentName')">
                  <el-input :placeholder="$t('public.agentNameText')" v-model="agentList.query.name"></el-input>
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
                      <el-button type="primary" plain size="mini" @click="allocation(1, item, 9)">{{
                        $t('public.assignToTa') }}</el-button>
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
          <div v-infinite-scroll="getAgentList" infinite-scroll-distance="1" class=" pt-5"
            style="overflow-y: auto;width:1000px;">
            <el-row type="flex" :gutter="20" class="flex-wrap agent-list pb-50">
              <template v-for="item in agentList.list">
                <el-col :xs="24" :md="12" class="pb-15 custom-form">
                  <el-card class="box-card">
                    <div class="p-15 item radius-5 flexv">
                      <div class="flex">
                        <div class="flex1 flex_j">
                          <div>
                            <img :src="item.avatar || agentInfo.avatar" class="userimg" />
                          </div>
                          <div class="ml-15">
                            <div class="text-black color1">{{ item.name }}</div>
                            <div class="mt-5 text-gray color">{{ item.mobile }}</div>
                          </div>
                        </div>

                      </div>
                      <div class="mt-20" v-if="item.agentDeviceType">
                        <span class="color1 " :class="i > 0 ? 'ml-30' : ''" v-for="(d, i) in item.agentDeviceType"
                          :key="i"><span class="color">{{ d.name }} </span>{{
                            d.profitRatio }}</span>
                      </div>
                      <div class="flex_j">
                        <div class="mt-5">
                          <span class="text-gray color">{{ $t('public.operatingArea') }}</span>
                          <span class="ml-5">{{ item.province }}{{ item.city }}{{ item.district }}</span>
                        </div>
                        <div class="m_l_a">
                          <el-button type="primary" plain size="mini" @click="allocation(1, item, 9)">{{
                            $t('public.assignToTa') }}</el-button>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </template>
            </el-row>
          </div>
          <div class="bottom pt-15 pb-15" v-if="curRow.agentId != 0">
            <el-button type="primary" plain size="mini" @click="allocation(2, {}, 9)">{{ $t('public.assignToOneself')
            }}</el-button>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 9">
        <div class="flexv pl-20 pr-20 text-black">
          <div class="mb-15 fw6">{{ $t('store.merchantRecipient') }}</div>
          <div class="flex align-center pb-20 l-b">
            <img :src="checkList.avatar || agentInfo.avatar" class="userimg" width="56" alt="">
            <div class="pl-20">
              <div class="flex" v-if="checkList.id == 0">
                <div class="label-text">{{ $t('public.brandNames') }}:</div>
                <div>{{ checkList.name }}</div>
              </div>
              <div class="flex" v-if="checkList.id != 0">
                <div class="label-text">{{ $t('public.agentNickNames') }}:</div>
                <div>{{ checkList.name }}</div>
                <div class="ml-50 label-text">{{ $t('public.contactInformation') }}:</div>
                <div>{{ checkList.mobile }}</div>
              </div>
              <div class="flex mt-10" v-if="checkList.id != 0">
                <div class="label-text">{{ $t('public.deviceType') }}:</div>
                <div> <span class="ml-5" v-for="d in checkList.agentDeviceType">{{ d.name }}</span></div>
                <div class="ml-50 label-text">{{ $t('public.operatingArea') }}:</div>
                <div>{{ checkList.province }}{{ checkList.city }}{{ checkList.district }}</div>
              </div>
            </div>
          </div>
          <div class="mt-15 fw6">{{ $t('store.merchantDataChange') }}</div>

          <div class="mt-30">
            <div class="flex">
              <div class="title color2">
                {{ $t('store.empty') }}
              </div>
              <div class="ml-30">
                <el-radio-group v-model="checkList.enable">
                  <el-radio-button :label="0">{{ $t('public.reserve') }}</el-radio-button>
                  <el-radio-button :label="1">{{ $t('public.reserveEmpty') }}</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="flex mt-20">
              <div class="title color2">
                {{ $t('store.message1') }}
              </div>
              <div class="ml-30">
                <el-switch v-model="checkList.isBand" :active-value="1" :inactive-value="0" />
                <div class=" fs-s3 color mt-5">{{ $t('store.message2') }}</div>
              </div>
            </div>
            <div class="flex mt-20">
              <div class="title color2">
                {{ $t('store.message3') }}
              </div>
              <div class="ml-30">
                <div class=" fs-s3 color mt-5">{{ $t('store.message4Title') }}</br>{{ $t('store.message4') }}</br>{{
                  $t('store.message4s') }}
                </div>
                <div class="fs-s3 color mt-20">{{ $t('store.message5Title') }}</br>{{ $t('store.message5') }}</br>{{
                  $t('store.message5s') }}
                </div>
                <div class="fs-s3 color mt-20">{{ $t('store.message6Title') }}</br>{{ $t('store.message6') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 10">
        <div class="flexv pl-20 pr-20 text-black" v-if="dform.loginList">
          <el-table class="ptd-5" highlight-current-row element-loading-text="Loading" :data="dform.loginList">
            <el-table-column :label="$t('store.loginTime')" prop="operationTime"></el-table-column>
            <el-table-column :label="$t('brand.withdrawableAmount')">
              <template slot-scope="scope">
                {{ JSON.parse(scope.row.operationExt)['balance'] }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
      <template v-if="dialogType == 11">
        <el-form class="pl-20 pr-20 custom-form" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('public.loginPassword')">
            <el-switch v-model="dform.password" />
            <div class="fs-s3 text-danger">{{ $t('store.resettingStorePasswordText') }}</div>
          </el-form-item>
          <el-form-item :label="$t('public.operationPassword')">
            <el-switch v-model="dform.twoPassword" :active-value="1" :inactive-value="0" />
            <div class="fs-s3 text-danger">{{ $t('store.resetOPwdText') }}</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 12">
        <el-form class="pl-20 pr-20 custom-form" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('public.remark')">
            <el-input v-model="dform.remark" :placeholder="$t('public.enter')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1, 4, 6, 7, 9, 11, 12].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm')
          }}</el-button>
        </div>
      </template>
    </el-drawer>

    <relatedTemplate ref="relatedTemplates"></relatedTemplate>
    <AssignAbility ref="AssignAbilitys" noFlag="AGENT_ASSIGN,BRAND_ASSIGN"></AssignAbility>
    <VendorMode ref="VendorModes" v-if="myDeviceId['VM'] && !isSaas()"></VendorMode>
    <xlsx ref="toXlsx" :fileName="$t('store.storeList')"></xlsx>
    <update-blance ref="UpdateBlances" userType="store" v-if="checkAbility(['WD_MODIFY'], 3)"></update-blance>
  </div>
</template>

<script>
import qs from 'qs'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { arrayToObj, copyText } from '@/utils/index'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import RelatedTemplate from '@/components/RelatedTemplate/'
import VendorMode from '@/components/VendorMode/'
import AssignAbility from '@/components/AssignAbility/'
import ImportData from '@/components/ImportData/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
import UpdateBlance from '@/components/UpdateBlance/'
import xlsx from '@/components/xlsx/'
export default {
  name: 'subShop',
  components: {
    Pagination,
    condition,
    TableColumnSet,
    RelatedTemplate,
    VendorMode,
    AssignAbility,
    ImportData,
    selectSearch,
    UpdateBlance,
    xlsx
  },
  props: {
    lowerStore: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      clickSubmit: false,
      copyText: copyText,
      catList: [],
      cityList: [],
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
      cashStat: {},
      deviceCount: {},
      supUser: {},
      cateObj: {},

      // 弹出相关
      dialogType: 1,
      dialogStatus: false,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},

      agentRow: {},//分配代理选择的代理信息

      /**
       * 列的配置化对象，存储配置信息
       */
      showColumn: [],
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
      agentList: {
        query: {
          page: 1,
          size: 20
        },
        list: [],
        newly: []
      },
      checkList: {},
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
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    Ability() {
      return this.$store.getters.Ability
    },
    dialogTitle() {
      return {
        1: this.$t('public.bindDevice'),
        2: '',
        3: this.$t('public.deleteStore'),
        4: this.$t('store.assignMerchants'),
        5: this.$t('public.resetPassword'),
        6: this.$t('public.freezeAmount'),
        7: this.$t('store.sharedWIFI'),
        8: this.$t('store.assignMerchants'),
        9: this.$t('store.assignMerchants'),
        10: this.$t('store.loginRecord'),
        11: this.$t('public.setLoginPassword'),
        12: this.$t('public.remark'),
      }
    },
    defaultColumn() {
      return [
        {
          key: 'name',
          val: true,
          name: this.$t('public.doorstepPhoto')
        },
        {
          key: 'address',
          val: true,
          name: this.$t('store.storeAddress')
        },
        {
          key: 'device',
          val: true,
          name: this.$t('public.device')
        },
        {
          key: 'amount',
          val: this.checkAbility(['STORE_NUM_AMOUNT'], 3),
          hidden: !this.checkAbility(['STORE_NUM_AMOUNT'], 3),
          name: `${this.$t('public.aTurnover')}`
        },
        {
          key: 'amountDivide',
          val: true,
          name: `${this.$t('public.totalRevenue')}`
        },
        {
          key: 'balance',
          val: true,
          name: `${this.$t('store.withdrawable')}`
        },
        {
          key: 'order',
          val: this.checkAbility(['STORE_NUM_AMOUNT'], 3),
          hidden: !this.checkAbility(['STORE_NUM_AMOUNT'], 3),
          name: this.$t('home.orderNum')
        },
        // {
        //   key: 'order',
        //   val: true,
        //   name: '客单价(元)'
        // },
        {
          key: 'user',
          val: true,
          name: this.$t('public.dividendPerson')
        },
        {
          key: 'supUser',
          val: this.lowerStore,
          hidden: !this.lowerStore,
          name: this.$t('public.superiorAgent')
        },
        {
          key: 'deviceDivision',
          val: !this.isStore(),
          hidden: this.isStore(),
          name: this.$t('public.analysisMode')
        },
        // {
        //   key: 'province',
        //   val: true,
        //   name: this.$t('store.cityRegion')
        // },
        {
          key: 'catId',
          val: true,
          name: this.$t('public.industry')
        },
        {
          key: 'remark',
          val: false,
          name: this.$t('public.remark')
        }
      ]
    },
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'addStore' || from.name == 'editStore') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let query = this.$route.query
    this.queryKey = ['deviceSns', 'agentId', 'brandId']
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
    } else {
      this.toQuery()
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted() {

  },
  methods: {
    // 分配事件
    allocation(type, item, dialogType) {
      let jitem = JSON.parse(JSON.stringify(item))
      if (type == 2) {
        jitem = {
          name: this.agentInfo.nickname,
          mobile: this.agentInfo.mobile,
          id: 0
        }
      }
      jitem.enable = 0
      this.checkList = jitem
      this.dialogType = dialogType
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
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1,
        lowerStore: this.isSaas() ? true : this.lowerStore
      })
      this.$get('iot-saas-basic/admin/store/findPage', params).then(async (res = {}) => {
        let list = res.rows || []
        if (this.isSaas() && list.length > 0) {
          let brandIds = []
          list.map(item => {
            if (brandIds.indexOf(item.brandId) == -1) {
              brandIds.push(item.brandId)
            }
          })
          if (brandIds.length > 0) {
            await this.getOtherData('iot-saas-order/admin/order/device/rent/getDeductions', {
              deductionType: 2,
              deductionIds: brandIds
            }).then(ares => {
              let brandObj = arrayToObj(ares, 'id')
              list.map(item => {
                return item.brandName = brandObj[item.brandId].name
              })
            })
          }
        }
        this.list = list
        this.queryCash(this.arrayKeys(res.rows, 'id'))
        this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
        this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
        if (this.lowerStore) this.getSupUser(this.arrayKeys(res.rows, 'userId'))
        this.getStoreCate(this.arrayKeys(res.rows, 'catId'))
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
            this.listTotal = parseInt(res.total)
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
          }
        }
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 获取可提现金额
     */
    queryCash(ids) {
      if (ids.length == 0) {
        this.cashStat = {}
        return
      }
      this.$get('iot-saas-pay/api/pay/acount/list', {
        accountType: 2,
        ownerIds: ids.join(',')
      }).then(res => {
        this.cashStat = res
      })
    },

    /**
     * 订单数量统计查询
     */
    queryOrderCount(ids) {
      if (ids.length == 0) {
        this.orderCount = {}
        return
      }
      this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
        countType: 'STORE',
        groupIds: ids.join(',')
      }).then(res => {
        this.orderCount = res
      })
    },

    /**
     * 设备数量统计查询
     */
    queryDeviceCount(ids) {
      if (ids.length == 0) {
        this.deviceCount = {}
        return
      }
      this.$get('iot-saas-device/admin/device/count/queryGroupCountV2', {
        countType: 'STORE',
        groupIds: ids.join(',')
      }).then(res => {
        this.deviceCount = res
      })
    },

    /**
     * 获取上级代理
     */
    getSupUser(uids) {
      if (uids == 0) {
        this.supUser = {}
        return
      }
      this.$get('iot-saas-basic/admin/agent/queryByStoreUserId', {
        storeUserIds: uids.join(',')
      }).then(res => {
        this.supUser = res
      })
    },

    /**
     * 根据区域标识数组获取区域名称
     */
    getStoreCate(catId) {
      if (catId.length == 0) {
        this.cateObj = {}
        return
      }
      this.$get('iot-saas-basic/admin/store/findNameByCatIds', {
        catId: catId.join(',')
      }).then(res => {
        this.cateObj = res
      })
    },

    /**
     * 获取商户类别
     */
    getCategory() {
      this.$get('iot-saas-basic/admin/store/category').then(res => {
        let list = {}
        res.map(item => {
          if (item.level == 1) {
            list[item.catId] = {
              value: item.catId,
              label: item.catName,
              children: []
            }
          } else if (item.level == 2) {
            list[item.parentId].children.push({
              value: item.catId,
              label: item.catName
            })
          }
        })
        this.catList = Object.values(list)
      })
    },

    /**
     * 获取区域
     */
    getCity() {
      this.$store.dispatch('api/getRegions').then(res => {
        let list = {}
        res.map(item => {
          if (item.level == 1) {
            list[item.tag] = {
              value: item.tag,
              label: item.title,
              children: {}
            }
          } else if (item.level == 2) {
            let tag = item.tag.substring(0, 3)
            list[tag].children[item.tag] = {
              value: item.tag,
              label: item.title,
              children: []
            }
          } else if (item.level == 3) {
            let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
            list[tag1].children[tag2].children.push({
              value: item.tag,
              label: item.title
            })
          }
        })
        list = Object.values(list)
        list.map(item => {
          if (JSON.stringify(item.children) == '{}') {
            item.children = []
          } else {
            item.children = Object.values(item.children)
          }
          return item
        })
        this.cityList = list
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
      this.getList()
    },

    /**
     * 铺货
     */
    bindStore(row) {
      let that = this;
      let url = 'iot-saas-device/admin/device/bindStore', params = {
        storeId: row.id
      }
      if (row.deviceSns) {
        params.deviceSns = row.deviceSns.split(',')
      } else {
        params.deviceSns = this.form.deviceSns.split(',')
      }
      this.$post(url, params).then((res) => {
        this.$message({
          type: 'success',
          message: that.$t('store.successDistribution')
        })
        if (this.deviceIds) {
          history.back()
        } else {
          this.drawerStatus = false
        }
      })
    },

    /**
     * 操作商户
     * @param {Object} type 1 dialog类型 2 切换商户 3 重置登录密码
     * @param {Object} row 选择当前商户
     * @param {Object} dialogType dialog内容显示类型 1: '设备绑定', 2: '', 3: '删除商户' 4: '分配给代理'
     * @param {Object} idx 当前商户所在位置
     */
    setRows(type, row, dialogType, idx) {
      let that = this;
      switch (type) {
        case 1: case 3:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dform = {}
          if (dialogType == 6 && row.frozenBalance > 0) {
            this.dform = {
              frozenBalance: row.frozenBalance
            }
          } else if (dialogType == 7) {
            this.$get('iot-saas-basic/store/function/List', {
              storeId: row.id
            }).then(res => {
              for (var i in res) {
                if (res[i].functionType == 'WIFI') {
                  this.isWifi = true
                  this.dform = {
                    functionType: 'WIFI',
                    content: res[i].functionContent ? JSON.parse(res[i].functionContent) : [{}]
                  }
                  break
                }
              }
              if (!this.isWifi) {
                this.dform = {
                  functionType: 'WIFI',
                  content: [{}]
                }
              }
            })
          } else if (dialogType == 10) {
            this.$get('iot-saas-basic/api/operation/findPage', {
              ownerId: row.id,
              operationType: 'STORE_LOGIN',
              size: 100,
              page: 0
            }).then(res => {
              this.dform = {
                loginList: res && res.rows ? res.rows : []
              }
            })
          } else if (dialogType == 12) {
            this.dform = {
              remark: row.remark || ''
            }
          }
          if (type == 1) {
            this.dialogStatus = true
          } else {
            this.drawerStatus = true
          }
          break
        case 2:
          this.$alert(that.$t('store.switchStore'), that.$t('store.switchStoreText'), {
            confirmButtonText: that.$t('public.confirm'),
            callback: action => {
              if (action == 'confirm') {
                this.$post('iot-saas-user/store/login', {
                  storeId: row.id
                }).then(res => {
                  setToken(res.loginToken.accessToken)
                  this.$message({
                    message: that.$t('store.switchSuccess'),
                    type: 'success'
                  })
                  setTimeout(() => {
                    location.href = '/'
                  }, 1500)
                })
              }
            }
          })
          break
        case 8:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
        break
      }
    },

    /**
     * 弹窗确认
     */
    dialogConfirm(row) {
      let that = this;
      let curRow = this.curRow,
        curIdx = this.curIdx,
        params = JSON.parse(JSON.stringify(this.dform))
      switch (this.dialogType) {
        case 1:
          if (this.lowerStore) {
            this.$post('iot-saas-device/admin/device/bindAgent', {
              deviceSns: params.deviceSns,
              agentId: curRow.agentId,
            }).then(res => {
              this.bindStore({ id: curRow.id, deviceSns: params.deviceSns })
            })
          } else {
            this.bindStore({ id: curRow.id, deviceSns: params.deviceSns })
          }
          break
        case 2:

          break
        case 3:
          this.$post('iot-saas-basic/admin/store/delete', {
            storeId: curRow.id
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.dialogStatus = false
            this.list.splice(curIdx, 1)
          })
          break
        case 4:
          let agentId = -1
          if (this.lowerStore && params.allotMe) {
            agentId = this.isBrand() ? '0' : this.agentInfo.agentId
          } else {
            agentId = this.agentRow.id
          }
          if (!agentId) {
            this.$message({
              message: that.$t('store.pleaseSelectObjet'),
              type: 'error'
            })
            return
          }
          this.$post('iot-saas-basic/admin/store/updateFather', {
            storeId: curRow.id,
            agentId: agentId
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.dialogStatus = false
            this.list.splice(curIdx, 1)
          })
          break
        case 5:
          this.$post('iot-saas-user/admin/user/updateMobilePass', {
            id: curRow.userId,
            password: '123456'
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
          })
          break
        case 6:
          this.$post('iot-saas-pay/api/pay/acount/updateFrozenBalance', {
            ownerId: curRow.ownerId,
            frozenBalance: params.frozenBalance
          }).then(res => {
            this.dialogStatus = false
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            curRow.frozenBalance = params.frozenBalance
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 7:
          params.content = JSON.stringify(params.content)
          params.storeId = curRow.id
          this.$post('iot-saas-basic/store/admin/function/update', params).then(res => {
            this.$message({
              type: 'success',
              message: that.$t('public.operationSuccessful')
            })
            this.drawerStatus = false
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 8:
          this.$post('iot-saas-device/admin/device/bindStore', {
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
              message: that.$t('public.operationSuccessful'),
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
          this.$post('iot-saas-basic/admin/brand/giveStore', {
            storeId: curRow.id,
            targetAgentId: this.checkList.id,
            giveType: 1,
            isApprove: this.checkList.enable,
            isBand: this.checkList.isBand
          }).then(res => {
            this.$message({
              message: that.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.getList();
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
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
        case 12:
          params.storeId = curRow.id
          params.remark = params.remark || 0
          this.$post('iot-saas-basic/admin/store/updateRemark', params).then(res => {
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
          break
      }
    },

    /**
     * 搜索代理
     */
    getAgent(row) {
      this.agentRow = row
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
        userType: 'store',
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
  }
}
</script>

<style lang="scss" scoped>
.text-cut_two {
  max-height: 66px;
  line-height: 22px;
  -webkit-line-clamp: 3;
  /*规定超过两行的部分截断*/
}

.row-device_stat {
  .item {
    &+.item {
      margin-top: 10px;
    }

    .w-80 {
      width: 80px;
    }
  }
}

.operate {
  /deep/ .el-button--text {
    &:nth-child(4) {
      margin-left: 0;
    }
  }

  .el-dropdown {
    margin-left: 10px;
  }
}

.userimg {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.color {
  color: #86909C;
}

.color1 {
  color: #1D2129;
}

.color2 {
  color: #4E5969;
}

.flexv {
  position: relative;

  .bottom {
    position: absolute;
    width: 96%;
    bottom: 0;
    border-top: 1px solid var(--color-border-2, #E5E6EB);
    background: #FFF;
  }
}

.fw6 {
  font-weight: 600;
}

.title {
  min-width: 120px;
}
</style>
