<template>
  <div>
    <el-row class="pl-30 pr-30 custom-form bg-white">
      <el-col :lg="24" :xl="20">
        <el-form ref="form" :rules="rules" :model="form" label-position="left" label-width="130px">
          <h3>{{ $t('public.basicInformation') }}</h3>
          <el-form-item :label="$t('public.doorstepPhoto')" class="up-img">
            <upload v-model="form.avatar" :upObj="{ fileType: 'storePhoto' }" />
          </el-form-item>
          <el-form-item ref="name" :label="$t('public.storeName')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('store.plseaseStoreName')" />
          </el-form-item>
          <el-form-item ref="mobile" :label="$t('store.storePhone')" prop="mobile">
            <el-input v-model="form.mobile" :placeholder="$t('store.storePhoneText')" />
          </el-form-item>
          <el-form-item ref="catId" :label="$t('public.industry')" prop="catId" v-if="false">
            <el-cascader v-model="form.catId" :options="catList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item>
          <el-form-item ref="lng" :label="$t('store.locationAddress')" prop="lng" v-if="mapTrue">
            <maps v-if="form.lng" :center="{ lng: form.lng, lat: form.lat }" @locationOk="locationOk" :zooms="18" />
            <maps v-else @locationOk="locationOk" :zooms="18" />
          </el-form-item>
          <!-- <el-form-item ref="province" :label="$t('store.area')" prop="province">
            <el-cascader v-model="form.province" :options="cityList" :props="{ expandTrigger: 'hover' }" />
          </el-form-item> -->
          <el-form-item ref="address" :label="$t('store.storeAddress')" prop="address">
            <el-input v-model="form.address" :placeholder="$t('store.storeAddressText')" />
          </el-form-item>
          <el-form-item :label="$t('store.businessHours')">
            <div class="flex align-center" v-for="(item, idx) in form.businessTimeDes">
              <el-input v-model="form.businessTimeDes[idx]" />
              <el-button type="text" size="small" v-if="idx == 0"
                @click="form.businessTimeDes.push('')" class="set-btn">{{ $t('public.add') }}</el-button>
              <el-button type="text" size="small" v-else
                @click="form.businessTimeDes.splice(idx, 1)" class="set-btn text-danger">{{ $t('public.delete') }}</el-button>
            </div>
          </el-form-item>
          <el-form-item :label="$t('store.introduce')">
            <el-input v-model="form.introduce" :placeholder="$t('store.introduce')" type="textarea" :rows="3" />
          </el-form-item>

          <template>
            <h3>{{ $t('store.dividendInformation') }}</h3>
            <el-form-item :label="$t('store.sharingMethod')">
              <el-radio-group v-model="form.divisionMode">
                <el-radio-button :label="1">{{ $t('store.proportionalSharing') }}</el-radio-button>
                <el-radio-button :label="2">{{ $t('store.noShareGiven') }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <div v-if="form.divisionMode != 2 && !parentId && (!form.parentId || form.parentId == '0')">
              <el-form-item ref="userNickName" :label="$t('public.contacts')" prop="userNickName">
                <el-input v-model="form.userNickName" :placeholder="$t('brand.message1')" />
              </el-form-item>
              <el-form-item ref="userMobile" :label="$t('public.phone')" prop="userMobile" v-if="!isAgent() || (isAgent() && !sysShows.agentEditStoreMobile)">
                <el-input type="number" v-model="form.userMobile" :placeholder="$t('factory.phoneLoginAccount')" />
              </el-form-item>
              <el-form-item v-if="!storeId" :label="$t('public.loginPassword')">
                <el-input v-model="form.loginPassword" :placeholder="$t('store.pleaseLoginPassword')" />
              </el-form-item>
            </div>
          </template>

          <h3 class="pt-20">{{ $t('public.operationalProducts') }}</h3>
          <el-checkbox-group v-model="selDevice" @change="changeDevice" class="pl-10">
            <el-checkbox v-for="(name, code) in myDeviceId" :label="code">{{ name }}</el-checkbox>
          </el-checkbox-group>

          <div>
            <div class="mt-15 p-10 radius-10 shadow-light" v-for="(item, index) in deviceDataArr"
              v-if="item.status == 1">
              <h3 class="mt-0">{{ myDeviceId[item.deviceTypeCode] }}{{ $t('public.empty') }}{{ $t('public.setUp') }}
              </h3>

              <template v-if="form.divisionMode != 2">
                <el-form-item :label="$t('store.splitMode')">
                  <el-radio-group v-model="item.closeType" @change="setCloseType">
                    <el-radio-button :label="cti" v-for="(ct, cti) in config.closeType"
                      :disabled="!Ability[`${item.deviceTypeCode}_CLOSETYPE_${cti}`] && cti != 1">{{
        $t('store.closeType' + cti) }}</el-radio-button>
                  </el-radio-group>
                  <el-popover placement="right" title="" width="400" trigger="hover">
                    <div>
                      <div class="mb-15 text-bold text-black">{{ $t('store.divideIntoComments') }}</div>
                      <div class="mb-5 text-black">{{ $t('store.closeType1') }}</div>
                      {{ $t('store.text1') }}<br><br>
                      <div class="mb-5 text-black">{{ $t('store.closeType2') }}</div>
                      {{ $t('store.text3') }}<br><br>
                      <div>
                        <div class="mb-5 text-black">{{ $t('store.closeType3') }}</div>
                        {{ $t('store.text5') }}<span>{{ $t('store.text6') }}</span><br>
                        {{ $t('store.text7') }}<br>
                        {{ $t('store.text8') }}
                      </div>
                      <div class="mt-20">{{ $t('store.text9') }}<el-link type="primary" :underline="false"
                          @click="$router.push({ path: `/market/appList?deviceTypeCode=${item.deviceTypeCode}&serviceName=分成方式` })">{{
        $t('store.text10') }}</el-link>
                      </div>
                    </div>
                    <el-link type="danger" slot="reference" :underline="false"
                      class="ml-10 el-icon-question fs-c1"></el-link>
                  </el-popover>
                </el-form-item>
                <template v-if="item.closeType == 3">
                  <el-form-item :label="$t('store.commitmentSharing')" :error="ferror.promised">
                    <el-input type="number" v-model="item.promised" :placeholder="$t('store.commitmentSharingText')"
                      @input="(v) => (ferror.promised = checkDigit(v))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item :label="$t('store.closeType30')" :error="ferror.relative">
                    <el-input type="number" v-model="item.relative" :placeholder="$t('store.commitmentSharingText')"
                      @input="(v) => (ferror.relative = checkDigit(v))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item :label="$t('store.beforeTheEnd')" :error="ferror.promisedDeal">
                    <el-input type="number" v-model="item.promisedDeal" placeholder="0"
                      @input="(v) => (ferror.promisedDeal = checkDigit(v))">
                      <template slot="append">{{ $t('store.beforeTheEndText') }}</template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-else-if="item.closeType == 2">
                  <el-form-item :label="$t('store.closeType1')" :error="ferror.live">
                    <el-input type="number" v-model="item.live"
                      :placeholder="`${$t('store.max')}${myProfitRatio[item.deviceTypeCode]}%`"
                      @input="(v) => (ferror.live = checkDigit(v))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item :label="$t('store.closeType2')" :error="ferror.relative">
                    <el-input type="number" v-model="item.relative"
                      :placeholder="`${$t('store.max')}${item.live || 100}%`"
                      @input="(v) => (ferror.relative = checkDigit(v, 0, item.live))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                </template>
                <template v-else>
                  <el-form-item :label="$t('public.shareRatio')" :error="ferror.live">
                    <el-input class="input-with" type="number" v-model="item.live"
                      :placeholder="`${$t('store.max')}${myProfitRatio[item.deviceTypeCode]}%`"
                      @input="(v) => (ferror.live = checkDigit(v, 0, myProfitRatio[item.deviceTypeCode]))">
                      <template slot="append">%</template>
                    </el-input>
                  </el-form-item>
                </template>
              </template>

              <!-- <el-form-item :label="$t('public.payType')">
                <el-checkbox-group v-model="item.storePayConfig">
                  <el-checkbox :label="key" v-for="(item, key) in config.pay_way">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item> -->

              <el-row class="rel radius-10 flex flex-wrap" :class="{'disabled-box': agentPower.editStoreFee == 1}" :gutter="20">
                <el-col :sm="24" :lg="12" v-for="(name, xcx) in config.xcx_pay.default">
                  <div>
                    <div class="mb-10 text-dfs text-bold text-black">
                      {{ $t('payMode.' + xcx) }}{{ $t('public.empty') }}{{ $t('store.billingSettings') }}
                      <span class="ml-10 text-primary cursor" v-if="xcx != 'weixin'" @click="setAlipayMode(item, xcx)">{{
        $t('store.synchronous') }}</span>
                    </div>

                    <el-form-item :label="`${$t('store.paymentMode')}`">
                      <el-radio-group v-model="item[`${xcx}PayMode`].modeType" size="medium">
                        <el-radio-button :label="key" v-for="(key, name) in getModeType(item.deviceTypeCode, xcx)">{{
                           $t('public.' + key) }}</el-radio-button>
                      </el-radio-group>
                      <el-popover placement="right" title="" trigger="hover"
                        v-if="getModeType(item.deviceTypeCode, xcx)['DEPOSIT_FREE'] || getModeType(item.deviceTypeCode, xcx)['DEPOSIT']">
                        <div>
                          {{ $t('store.text11') }}<el-link type="primary" :underline="false"
                            @click="$router.push({ path: `/market/appList?deviceTypeCode=${item.deviceTypeCode}&serviceName=计费模式` })">{{
        $t('store.text10') }}</el-link>
                        </div>
                        <el-link type="danger" :underline="false" slot="reference"
                          class="ml-10 el-icon-question fs-c1"></el-link>
                      </el-popover>
                    </el-form-item>

                    <template v-if="item[`${xcx}PayMode`].modeType == 'PACKAGE'">
                      <el-form-item :label="`${$t('store.packageSettings')}`">
                        <div class="mb-5 flex align-center flex-wrap"
                          v-for="(plan, index) in item[`${xcx}PayMode`].payModeDetail">
                          <el-select v-model="plan.time" v-if="item.deviceTypeCode == 'WM'">
                            <el-option :label="`${wp.title}`" :value="wp.value"
                              v-for="wp in config[`washing_package`]"></el-option>
                          </el-select>
                          <el-select v-model="plan.time" v-else>
                            <el-option :label="`${time / 60}${$t('public.huor')}`" :value="time"
                              v-for="time in config[`plan_time`]"></el-option>
                          </el-select>
                          <el-input type="number" v-model="plan.money" class="flex1 ml-10 mr-10">
                            <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                          </el-input>
                          <el-button type="text" size="small"
                            :disabled="item[`${xcx}PayMode`].payModeDetail.length == 4" v-if="index == 0"
                            @click="item[`${xcx}PayMode`].payModeDetail.push({ time: (item.deviceTypeCode == 'WM' ? '46' : 60), money: 2, tag: index + 1 })" class="set-btn">{{ $t('public.add') }}</el-button>
                          <el-button type="text" size="small" v-else
                            @click="item[`${xcx}PayMode`].payModeDetail.splice(index, 1)" class="set-btn text-danger">{{ $t('public.delete') }}</el-button>
                        </div>
                      </el-form-item>
                      <el-form-item :label="`${$t('store.laundryDetergentSettings')}`"
                        v-if="item.deviceTypeCode == 'WM'">
                        <template v-for="(laundry, lidx) in item[`${xcx}PayMode`].laundryMode">
                          <!-- <el-input v-model="laundry.title" class="flex1 mr-10" disabled></el-input> -->
                          <div class="text-black">{{ laundry.title }}</div>
                          <div class="mb-5 flex align-center flex-wrap" v-for="(lpi, lpidx) in laundry.package">
                            <el-input type="number" v-model="lpi.value" class="flex1 mr-10" disabled>
                              <template slot="append">ml</template>
                            </el-input>
                            <el-input type="number" v-model="lpi.money" class="flex1 mr-10">
                              <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                            </el-input>
                            <!-- <el-button type="text" size="small" :disabled="item[`${xcx}PayMode`].laundryMode[lidx].package.length == 3" v-if="lpidx == 0"
                              @click="item[`${xcx}PayMode`].laundryMode[lidx].package.push({tag: lpidx + 1})">添加</el-button>
                            <el-button type="text" size="small" v-else
                              @click="item[`${xcx}PayMode`].laundryMode[lidx].package.splice(lpidx, 1)" class="text-danger">删除</el-button> -->
                          </div>
                        </template>
                      </el-form-item>
                    </template>

                    <template v-else-if="item[`${xcx}PayMode`].modeType == 'STEPBILLING'">
                      <el-form-item :label="$t('public.deposit')"
                        v-if="(isBrand() || agentPower.editStoreFeeDeposit === 0)"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_depositAmount`]">
                        <el-input v-model="item[`${xcx}PayMode`].stepPayMode.depositAmount"
                          @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_depositAmount`] = checkDigit(v, 0, 100000000))">
                          <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item :label="$t('public.amount')"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_startingTime`]">
                        <div class="flex">
                          <div class="flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].stepPayMode.unitPrice"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 100000000))">
                              <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                            </el-input>
                          </div>
                          <div class="pl-10 flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].stepPayMode.overBillingUnit"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 1440, 0))">
                              <template slot="append">{{ $t('public.minute') }}</template>
                            </el-input>
                          </div>
                        </div>
                      </el-form-item>

                      <el-form-item :label="$t('public.stepList')" :error="ferror[`${item.deviceTypeCode}_${xcx}_startingTime`]">
                        <template v-for="(plan, stepIdx) in item[`${xcx}PayMode`].stepPayMode.stepList">
                          <div class="flex">
                            <div class="flex1">
                              <el-input type="number" v-model="plan.startingTime"
                                @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 1440, 0))" disabled>
                                <template slot="append">{{ $t('public.minute') }}</template>
                              </el-input>
                            </div>
                            <template v-if="plan.endTime">
                              <div class="pl-10 pr-10">-</div>
                              <div class="flex1">
                                <el-input type="number" v-model="plan.endTime" @input="setStepList(item[`${xcx}PayMode`].stepPayMode.stepList, stepIdx, 1)">
                                  <template slot="append">{{ $t('public.minute') }}</template>
                                </el-input>
                              </div>
                            </template>
                            <div class="pl-10 pr-10 flex1">
                              <el-input type="number" v-model="plan.maxAmount"
                                @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 100000000))">
                                <template slot="prepend">{{ $t('public.capping') }}</template>
                                <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                              </el-input>
                            </div>
                            <el-button type="text" size="small" v-if="stepIdx == 0"
                              @click="setStepList(item[`${xcx}PayMode`].stepPayMode.stepList, stepIdx, 2)" class="set-btn">{{ $t('public.add') }}</el-button>
                            <el-button type="text" size="small" v-else
                              @click="setStepList(item[`${xcx}PayMode`].stepPayMode.stepList, stepIdx, 3)" class="set-btn text-danger">{{ $t('public.delete') }}</el-button>
                          </div>
                        </template>
                      </el-form-item>
                    </template>

                    <template v-else>
                      <el-form-item :label="$t('public.freeTime')"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_freeTime`]" v-if="item.deviceTypeCode == 'PA'">
                        <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.freeTime"
                          :placeholder="$t('store.defaultTime')"
                          @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_freeTime`] = checkDigit(v, 0, 1440, 0, true))">
                          <template slot="append">{{ $t('public.minute') }}</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item :label="$t('public.amount')"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_startingTime`]">
                        <div class="flex">
                          <div class="flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.startingAmount"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 100000000))">
                              <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                            </el-input>
                          </div>
                          <div class="pl-10 flex1 flex">
                            <!-- <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.startingTime"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_startingTime`] = checkDigit(v, 0, 1440, 0))">
                              <template slot="append">{{ $t('public.minute') }}</template>
                            </el-input> -->
                            <el-select v-model="item[`${xcx}PayMode`].payModeDetails.startingTime.toString()" class="flex1">
                              <el-option :label="`${wp.title}`" :value="wp.value" v-for="(wp, index) in timeList"
                                :key="index"></el-option>
                            </el-select>
                          </div>
                        </div>
                      </el-form-item>
                      <!-- <el-form-item :label="$t('public.afterExceeding')"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_overBillingUnit`]">
                        <div class="flex">
                          <div class="flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.overBillingUnit"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_overBillingUnit`] = checkDigit(v, 0, 1440, 0))">
                              <template slot="append">{{ $t('public.minute') }}</template>
                            </el-input>
                          </div>
                          <div class="pl-10 flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.unitPrice"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_overBillingUnit`] = checkDigit(v, 0, 100000000))">
                              <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                            </el-input>
                          </div>
                        </div>
                      </el-form-item> -->
                      <el-form-item :label="$t('public.capping')"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_maxBillingTimePrice`]">
                        <div class="flex">
                          <!-- <div class="flex1">
                            <el-select v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimeUnit">
                              <el-option :label="`${item / 60}${$t('public.hourlyCap')}`" :value="item"
                                v-for="item in config.day_unit"></el-option>
                            </el-select>
                          </div> -->
                          <div class="flex1">
                            <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.maxBillingTimePrice"
                              @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_maxBillingTimePrice`] = checkDigit(v, 0, 100000000))">
                              <template slot="prepend">{{ $t('public.dailyCap') }}</template>
                              <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                            </el-input>
                          </div>
                        </div>
                      </el-form-item>
                      <el-form-item :label="$t('public.totalCapping')"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_maxAmount`]">
                        <el-input type="number" v-model="item[`${xcx}PayMode`].payModeDetails.maxAmount"
                          @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_maxAmount`] = checkDigit(v, 0, 100000000))">
                          <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                        </el-input>
                      </el-form-item>
                      <el-form-item :label="$t('public.deposit')"
                        v-if="(item[`${xcx}PayMode`].modeType == 'DEPOSIT' || item[`${xcx}PayMode`].modeType == 'DEPOSIT_AND_FREE') && (isBrand() || agentPower.editStoreFeeDeposit === 0)"
                        :error="ferror[`${item.deviceTypeCode}_${xcx}_depositAmount`]">
                        <el-input v-model="item[`${xcx}PayMode`].payModeDetails.depositAmount"
                          @input="(v) => (ferror[`${item.deviceTypeCode}_${xcx}_depositAmount`] = checkDigit(v, 0, 100000000))">
                          <template slot="append">{{ [''].indexOf(xcx) > -1 ? '￥' : siteInfo.currencySymbol }}</template>
                        </el-input>
                      </el-form-item>
                    </template>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
          <el-form-item>
            <el-button class="mt-10 mb-10" type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{
        $t('public.submitNow') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {
  defaultFee,
  bMapTransQQMap,
  qqMapTransBMap,
  arrayToObj
} from '@/utils/index'
import upload from '@/components/upload'
import maps from '@/components/map/index'
export default {
  name: 'addStore',
  components: {
    upload,
    maps
  },
  computed: {
    agentInfo() {
      let agentInfo = this.$store.getters.agentInfo
      return agentInfo
    },
    Ability() {
      console.log(this.$store.getters.Ability)
      return this.$store.getters.Ability
    },
    myDevice() {
      let myDevice = this.$store.getters.myDevice
      return myDevice
    },
    myDeviceId() {
      return this.$store.getters.myDeviceId || { PA: this.$t('public.powerBank') }
    },
    siteInfo() {
      let siteInfo = this.$store.getters.siteInfo
      return siteInfo
    },
    myProfitRatio() {
      return this.$store.getters.myProfitRatio || { PA: 100 }
    },
    rules() {
      return {
        name: [{
          required: true,
          message: this.$t('store.plseaseStoreName'),
          trigger: 'blur'
        }],
        address: [{
          required: true,
          message: this.$t('store.pleaseStoreAddress'),
          trigger: 'blur'
        }],
        userMobile: [{
          required: true,
          message: this.$t('factory.message2'),
          trigger: 'blur'
        }],
        catId: [{
          required: true,
          message: this.$t('store.pleaseIndustryClassification'),
          trigger: 'blur'
        }],
        province: [{
          required: true,
          message: this.$t('store.pleaseUrbanAreas'),
          trigger: 'blur'
        }],
        lng: [{
          required: true,
          message: this.$t('store.pleaseMapLotion')
        }]
      }
    },
    timeList() {
      return [
        {
          title: this.$t('public.oneHour'),
          value: '60'
        },
        {
          title: this.$t('public.halfHour'),
          value: '30'
        }
      ]
    },
  },
  data() {
    return {
      clickSubmit: false,
      storeId: this.$route.query.storeId || '',
      parentId: this.$route.query.parentId || '',
      lowerStore: this.$route.query.lowerStore || false,
      catList: [],
      cityList: [],
      form: {
        catId: [],
        province: [],
        businessTimeDes: [''],
        divisionMode: 1,
        avatar: '',
        loginPassword: '123456',
        lng: '',
        address: ''
      },
      ferror: {},
      powerInfo: {},

      selDevice: [],
      deviceDataArr: [],
      defaultDevice: defaultFee(),

      // 地图加载
      mapTrue: false,

      sysShows: {},
      agentPower: {}
    }
  },
  mounted() {
    this.storeDfKey = 'storeDfKey'
    let storeDefaultConfig = localStorage.getItem(this.storeDfKey)
    if (storeDefaultConfig) {
      storeDefaultConfig = JSON.parse(storeDefaultConfig)
      this.storeDefaultConfig = storeDefaultConfig
    } else {
      this.storeDefaultConfig = {}
    }
    this.getCategory()
    //this.getCity()
    if(this.isAgent()){
      this.$store.dispatch('user/getOpenSettings', {
        code: 'AGENT_VIEW_POWER',
        brandId: this.agentInfo.brandId,
        agentId: this.agentInfo.agentId
      }).then(res => {
        this.agentPower = res
      })
    }
    if (this.storeId > 0) {
      if(this.isAgent()){
        this.$store.dispatch('user/getOpenSettings', {
          code: 'STORE_MONEY_SET',
          brandId: this.agentInfo.brandId
        }).then(res => {
          this.sysShows = res
        })
      }
      this.getInfo()
    } else {
      if (storeDefaultConfig) {
        if (storeDefaultConfig.lng) {
          this.$set(this.form, 'lat', storeDefaultConfig.lat)
          this.$set(this.form, 'lng', storeDefaultConfig.lng)
        }
        if (storeDefaultConfig.province) {
          this.$set(this.form, 'province', [storeDefaultConfig.province, storeDefaultConfig.city, storeDefaultConfig.district])
        }
      }
      this.mapTrue = true
      this.selDevice.push(Object.keys(this.myDeviceId)[0])
      this.getDefaultBilling(Object.keys(this.myDeviceId)[0]).then(info => {
        this.deviceDataArr.push(info)
      })
    }
  },
  methods: {
    /**
     * 类型选择
     */
    changeDevice(selCode) {
      let deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr)),
        idArr = [],
        deviceObj = {}
      deviceDataArr.map(item => {
        if (selCode.indexOf(item.deviceTypeCode) == -1) {
          return item.status = 0
        }
      })
      selCode.map(code => {
        let idxs = -1
        deviceDataArr.map((item, idx) => {
          if (item.deviceTypeCode == code) {
            idxs = idx
            item.status = 1
          }
        })
        if (idxs == -1) {
          this.getDefaultBilling(code).then(info => {
            deviceDataArr.push(info)
          })
        }
      })
      this.deviceDataArr = deviceDataArr
    },

    /**
     * 获取信息
     */
    getDefaultBilling(deviceTypeCode) {
      let defaultDevice = JSON.parse(JSON.stringify(this.defaultDevice)),
        mode_way = Object.values(this.config.mode_way[deviceTypeCode] || this.config.mode_way.default)
      defaultDevice.deviceTypeCode = deviceTypeCode
      defaultDevice.weixinPayMode.modeType = mode_way[0]
      defaultDevice.alipayPayMode.modeType = mode_way[0]
      let mode_way_three = Object.values(this.config.mode_way[`${deviceTypeCode}_three`] || this.config.mode_way[deviceTypeCode] || this.config.mode_way.default)
      defaultDevice.threePayMode.modeType = mode_way_three[0]
      let mode_way_four = Object.values(this.config.mode_way[`${deviceTypeCode}_four`] || this.config.mode_way[deviceTypeCode] || this.config.mode_way.default)
      defaultDevice.fourPayMode.modeType = mode_way_four[0]
      return new Promise((resolve, reject) => {
        if (!this.Ability['defaultBilling']) {
          this.$get(`iot-saas-basic/admin/billing/configs/findMax`, {
            deviceTypeCode: deviceTypeCode
          }).then((res = {}) => {
            if (res.deviceTypeCode) {
              defaultDevice.weixinPayMode = JSON.parse(res.wechatJson)
              defaultDevice.alipayPayMode = JSON.parse(res.alipayJson)
              defaultDevice.threePayMode = res.threeJson ? JSON.parse(res.threeJson) : JSON.parse(res.wechatJson)
              defaultDevice.fourPayMode = res.fourJson ? JSON.parse(res.fourJson) : JSON.parse(res.wechatJson)
              if(!defaultDevice.weixinPayMode.stepPayMode){
                defaultDevice.weixinPayMode.stepPayMode = defaultFee(deviceTypeCode).weixinPayMode.stepPayMode
                defaultDevice.alipayPayMode.stepPayMode = defaultFee(deviceTypeCode).alipayPayMode.stepPayMode
                defaultDevice.threePayMode.stepPayMode = defaultFee(deviceTypeCode).threePayMode.stepPayMode
                defaultDevice.fourPayMode.stepPayMode = defaultFee(deviceTypeCode).fourPayMode.stepPayMode
              }
              if (!this.Ability[`${deviceTypeCode}_${defaultDevice.weixinPayMode.modeType}`]) {
                defaultDevice.weixinPayMode.modeType = mode_way[0]
              }
              if (!this.Ability[`${deviceTypeCode}_${defaultDevice.alipayPayMode.modeType}`]) {
                defaultDevice.alipayPayMode.modeType = mode_way[0]
              }
              if (!this.Ability[`${deviceTypeCode}_${defaultDevice.threePayMode.modeType}`]) {
                defaultDevice.threePayMode.modeType = mode_way_three[0]
              }
              if (!this.Ability[`${deviceTypeCode}_${defaultDevice.fourPayMode.modeType}`]) {
                defaultDevice.fourPayMode.modeType = mode_way_four[0]
              }
              resolve(defaultDevice)
            } else {
              defaultDevice.weixinPayMode.payModeDetail = defaultFee(deviceTypeCode).weixinPayMode[
                `payModeDetail`]
              defaultDevice.alipayPayMode.payModeDetail = defaultFee(deviceTypeCode).alipayPayMode[
                `payModeDetail`]
              defaultDevice.threePayMode.payModeDetail = defaultFee(deviceTypeCode).threePayMode[
                  `payModeDetail`]
              defaultDevice.fourPayMode.payModeDetail = defaultFee(deviceTypeCode).fourPayMode[
                    `payModeDetail`]
              resolve(defaultDevice)
            }
          })
        } else {
          defaultDevice.weixinPayMode.payModeDetail = defaultFee(deviceTypeCode).weixinPayMode[`payModeDetail`]
          defaultDevice.alipayPayMode.payModeDetail = defaultFee(deviceTypeCode).alipayPayMode[`payModeDetail`]
          defaultDevice.threePayMode.payModeDetail = defaultFee(deviceTypeCode).weixinPayMode[`payModeDetail`]
          defaultDevice.fourPayMode.payModeDetail = defaultFee(deviceTypeCode).alipayPayMode[`payModeDetail`]
          resolve(defaultDevice)
        }
      })
    },

    /**
     * 获取类别
     */
    getCategory() {
      this.$get('iot-saas-basic/admin/store/category').then(res => {
        let list = {},
          catId = ''
        res.map(item => {
          if (item.level == 1) {
            list[item.catId] = {
              value: item.catId,
              label: item.catName,
              children: []
            }
          } else if (item.level == 2) {
            catId = catId || item.catId
            list[item.parentId].children.push({
              value: item.catId,
              label: item.catName
            })
          }
        })
        this.catList = Object.values(list)
        if (!this.storeId) {
          this.$set(this.form, 'catId', this.storeDefaultConfig.catId || catId)
        }
      })
    },

    /**
     * 获取城市
     */
    getCity() {
      let country = 'CN'
      this.$store.dispatch('api/getRegions', {
        country: country
      }).then(res => {
        let list = {}
        res.map(item => {
          if (item.level == 1) {
            list[item.tag] = {
              value: item.title,
              label: item.title,
              children: {}
            }
          } else if (item.level == 2) {
            let tag = ''
            if(country == 'VN'){
              tag = item.tag.substring(0, 2)
            }else{
              tag = item.tag.substring(0, 3)
            }
            list[tag].children[item.tag] = {
              value: item.title,
              label: item.title,
              children: []
            }
          } else if (item.level == 3) {
            let tag1, tag2
            if(country == 'VN'){
              tag1 = item.tag.substring(0, 2),
              tag2 = item.tag.substring(0, 5)
            }else{
              tag1 = item.tag.substring(0, 3),
              tag2 = item.tag.substring(0, 6)
            }
            list[tag1].children[tag2].children.push({
              value: item.title,
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
     * 获取商户信息
     */
    getInfo() {
      this.$get('iot-saas-basic/admin/store/findById', {
        id: this.storeId
      }).then(res => {
        let info = res,
          deviceDataArr = [],
          storePayConfig = {},
          payConfigId = {}
        if (res.storePayConfig) {
          res.storePayConfig.map(item => {
            let payArr = []
            for (var i in this.config.pay_way) {
              if (item[i] == 1) payArr.push(i)
            }
            storePayConfig[item.deviceTypeCode] = payArr
            payConfigId[item.deviceTypeCode] = item.id
          })
        }
        if (res.storeDivisionConfig) {
          res.storeDivisionConfig.map(item => {
            Object.keys(this.config.xcx_pay.default).map(key => {
              if (item[`${key}PayMode`]) {
                if (item[`${key}PayMode`].modeType == 'PACKAGE') {
                  item[`${key}PayMode`].payModeDetail = JSON.parse(item[`${key}PayMode`].payModeDetail)
                  item[`${key}PayMode`].payModeDetails = JSON.parse(JSON.stringify(this.defaultDevice[`${key}PayMode`].payModeDetails))
                  item[`${key}PayMode`].stepPayMode = JSON.parse(JSON.stringify(this.defaultDevice[`${key}PayMode`].stepPayMode))
                } else if(item[`${key}PayMode`].modeType == 'STEPBILLING') {
                  item[`${key}PayMode`].stepPayMode = JSON.parse(item[`${key}PayMode`].payModeDetail)
                  item[`${key}PayMode`].payModeDetails = JSON.parse(JSON.stringify(this.defaultDevice[`${key}PayMode`][`payModeDetails`]))
                } else {
                  item[`${key}PayMode`].payModeDetails = JSON.parse(item[`${key}PayMode`].payModeDetail)
                  item[`${key}PayMode`].payModeDetail = JSON.parse(JSON.stringify(this.defaultDevice[`${key}PayMode`][`payModeDetail`]))
                  item[`${key}PayMode`].stepPayMode = JSON.parse(JSON.stringify(this.defaultDevice[`${key}PayMode`][`stepPayMode`]))
                }
              } else {
                item[`${key}PayMode`] = item.weixinPayMode ? JSON.parse(JSON.stringify(item.weixinPayMode)) : JSON.parse(JSON.stringify(this.defaultDevice[`${key}PayMode`]))
              }
            })
            item.storePayConfig = storePayConfig[item.deviceTypeCode]
            item.status = 1
            item.payConfigId = payConfigId[item.deviceTypeCode]
            this.selDevice.push(item.deviceTypeCode)
            deviceDataArr.push(item)
          })
        }
        this.deviceDataArr = deviceDataArr
        res.user = res.user || {}
        info.userNickName = res.user.bindUserName
        info.userMobile = res.user.mobile
        info.province = [res.province, res.city, res.district]
        info.businessTimeDes = info.businessTimeDes ? info.businessTimeDes.split(',') : ['']
        delete info.city
        delete info.district
        delete info.storeDivisionConfig
        delete info.storePayConfig
        delete info.user
        this.form = info
        this.mapTrue = true
      })
    },

    /**
     * 提交
     * @param {Object} formName
     */
    onSubmit(formName) {
      let url = 'iot-saas-basic/admin/store/save',
        deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr))
      if (this.storeId > 0) {
        url = 'iot-saas-basic/admin/store/updateById'
      }
      if (this.selDevice.length == 0) {
        uni.showToast({
          title: this.$t('brand.message5'),
          icon: 'none'
        })
        return
      }
      let error = false
      for (var i in this.ferror) {
        if (this.ferror[i]) {
          error = true
          break
        }
      }
      if (error) return
      this.$refs[formName].validate((valid, object) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.form))
          if (this.parentId) params.parentId = this.parentId
          if (params.catId && typeof params.catId == 'object') {
            params.catId = params.catId[params.catId.length - 1]
          }
          params.businessTimeDes = params.businessTimeDes.filter(item => item).join(',')
          if (Array.isArray(params.province) && params.province.length > 0) {
            params.district = params.province[2]
            params.city = params.province[1]
            params.province = params.province[0]
          }
          params.storePayConfig = []
          params.storeDivisionConfig = []
          let moneyKeyArr = ['startingAmount','maxBillingTimePrice','maxAmount','depositAmount']
          for (let i in deviceDataArr) {
            let list =  deviceDataArr[i]
            let item = list
            if (item.status == 1) {
              let payConfig = {
                deviceTypeCode: item.deviceTypeCode
              }
              for (let i in this.config.pay_way) {
                if (item.storePayConfig.indexOf(i) > -1) {
                  payConfig[i] = 1
                } else {
                  payConfig[i] = 0
                }
              }
              if (item.payConfigId) payConfig.id = item.payConfigId
              params.storePayConfig.push(payConfig)
              Object.keys(this.config.xcx_pay.default).map(key => {
                if (item[`${key}PayMode`].payModeDetail) {
                  if (item[`${key}PayMode`].modeType == 'PACKAGE') {
                    item[`${key}PayMode`].payModeDetail.map((packItem, packI) => {
                      if(packItem.money < this.siteInfo.currencyMin){
                      	error = `${this.myDeviceId[item.deviceTypeCode]}${this.$t('store.message21')}${this.siteInfo.currencyMin}`
                      }
                      return packItem.tag = packI + 1
                    })
                    item[`${key}PayMode`].payModeDetail = JSON.stringify(item[`${key}PayMode`].payModeDetail)
                  } else if (item[`${key}PayMode`].modeType == 'STEPBILLING') {
                    item[`${key}PayMode`].stepPayMode.stepList.map((packItem, packI) => {
                      return packItem.tag = packI + 1
                    })
                    item[`${key}PayMode`].payModeDetail = JSON.stringify(item[`${key}PayMode`].stepPayMode)
                  } else {
                    item[`${key}PayMode`].payModeDetails.unitPrice = item[`${key}PayMode`].payModeDetails.startingAmount
                    item[`${key}PayMode`].payModeDetails.overBillingUnit = item[`${key}PayMode`].payModeDetails.startingTime
                    if (item[`${key}PayMode`].payModeDetails.maxAmount > item[`${key}PayMode`].payModeDetails.depositAmount && (item[`${key}PayMode`].modeType == 'DEPOSIT' || item[`${key}PayMode`].modeType == 'DEPOSIT_AND_FREE')) {
                      error = `${this.myDeviceId[item.deviceTypeCode]}${this.$t('store.message7')}`
                    } else if (item[`${key}PayMode`].modeType == 'DEPOSIT_FREE') {
                      item[`${key}PayMode`].payModeDetails.depositAmount = item[`${key}PayMode`].payModeDetails.maxAmount
                    }
                    moneyKeyArr.map(moneyKey => {
                    	if(item[`${key}PayMode`].payModeDetails[moneyKey] < this.siteInfo.currencyMin){
                    		error = `${this.myDeviceId[item.deviceTypeCode]}${this.$t('store.message21')}${this.formatCurrency(this.siteInfo.currencyMin)}`
                    	}
                    })
                    item[`${key}PayMode`].payModeDetail = JSON.stringify(item[`${key}PayMode`].payModeDetails)
                  }
                }
              })
              let division = {
                closeType: item.closeType,
                deviceTypeCode: item.deviceTypeCode,
                alipayPayMode: item.alipayPayMode,
                weixinPayMode: item.weixinPayMode,
                threePayMode: item.threePayMode || this.defaultDevice.threePayMode,
                fourPayMode: item.fourPayMode || this.defaultDevice.fourPayMode
              }
              if (item.id) division.id = item.id
              division.live = item.live || 0
              division.relative = item.relative || 0
              division.promised = item.promised || 0
              division.promisedDeal = item.promisedDeal || 1
              params.storeDivisionConfig.push(division)
            }
          }
          if (error) {
            this.$message({
              message: error,
              type: 'error'
            })
            return
          }
          this.clickSubmit = true
          if (params.userMobile) params.userMobile = this.trim(params.userMobile)
          this.$post(url, params).then(res => {
            if (!this.storeId) {
              localStorage.setItem(this.storeDfKey, JSON.stringify({
                lng: params.lng || '',
                lat: params.lat || '',
                catId: params.catId || '',
                district: params.district,
                city: params.city,
                province: params.province
              }))
              this.setDefaultbilling()
            }
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            if (this.lowerStore > 0) {
              this.$router.push({
                path: '/store/subStore'
              })
            } else {
              this.$router.push({
                path: '/store'
              })
            }
            this.clickSubmit = false
          }).catch(err => {
            this.clickSubmit = false
          })
        }
      })
    },

    /**
     * @param {Object} type
     */
    setCloseType(type) {
      if (type == 1) {
        this.ferror.promised = ''
        this.ferror.relative = ''
        this.ferror.promisedDeal = ''
      } else if (type == 2) {
        this.ferror.promisedDeal = ''
        this.ferror.promised = ''
      } else {
        this.ferror.live = ''
        this.ferror.live = ''
      }
    },

    /**
     * 商户经纬度
     */
    locationOk(center) {
      this.form.lat = center.lat
      this.form.lng = center.lng
      if (!this.storeId || this.onLoad) {
        this.form.address = center.address
        //this.getLatCity(center.lng, center.lat)
      } else if (this.storeId) {
        setTimeout(() => {
          this.onLoad = true
        }, 3000)
      }
    },

    /**
     * 经纬度获取省市区标识
     */
    getLatCity(lng, lat) {
      this.$get('Place/getLatLookup', {
        lng: lng,
        lat: lat
      }).then(res => {
        let regionTag = []
        res.tag.map(tag => {
          regionTag.push(tag)
        })
        if (regionTag.length > 0) this.form.regionTag = regionTag
      })
    },

    /**
     * 获取设备支持模式
     */
    getModeType(code, xcx) {
      return this.config.mode_way[`${code}_${xcx}`] ? this.config.mode_way[`${code}_${xcx}`] : this.config.mode_way[code] ? this.config.mode_way[code] : this.config.mode_way.default
    },

    /**
     * 一键同步微信计费
     */
    setAlipayMode(item, key) {
      let that = this;
      let errorMsg = false
      for (var i in this.ferror) {
        if (this.ferror[i] && i.indexOf('weixin') > -1) {
          errorMsg = this.ferror[i]
          break
        }
      }
      if (errorMsg) {
        this.$message({
          message: that.$t('store.listError'),
          type: 'error'
        })
        return
      }
      for (var i in this.ferror) {
        if (this.ferror[i] && i.indexOf('alipay') > -1) {
          delete this.ferror[i]
        }
      }
      item[`${key}PayMode`] = JSON.parse(JSON.stringify(item.weixinPayMode))
    },

    /**
     * 提交设置默认计费
     */
    setDefaultbilling() {
      let deviceDataArr = JSON.parse(JSON.stringify(this.deviceDataArr))
      deviceDataArr.map(item => {
        if (item.status == 1) {
          let params = {
            deviceTypeCode: item.deviceTypeCode,
            agentId: this.isBrand() ? 0 : this.agentInfo.agentId,
            wechatJson: JSON.stringify(item.weixinPayMode),
            alipayJson: JSON.stringify(item.alipayPayMode),
            threeJson: JSON.stringify(item.threePayMode),
            fourJson: JSON.stringify(item.fourPayMode)
          }
          this.$post('iot-saas-basic/admin/billing/configs/save', params).then(res => { })
        }
      })
    },

    /**
     * 修改分段计费信息
     */
    setStepList(stepList, idx, type = 1){
      switch(type){
        case 1:
          let prevItem = {}
          stepList.map((item, index) => {
            if(index > idx && (item.startingTime != parseInt(prevItem.endTime) + 1 || item.endTime < item.startingTime)){
              item.startingTime = parseInt(prevItem.endTime)
              if(item.endTime < item.startingTime){
                item.endTime = parseInt(item.startingTime) + 180
              }
              prevItem = item
              return item
            }
            prevItem = item
          })
        break
        case 2:
          let stepEnd = stepList[stepList.length - 1]
          stepEnd.endTime = parseInt(stepEnd.startingTime) + 180
          stepList[stepList.length - 1] = stepEnd
          stepList.push({
            startingTime: stepEnd.endTime,
            maxAmount: stepEnd.maxAmount
          })
        break
        case 3:
          stepList.splice(idx, 1)
          if(idx == stepList.length){
            delete stepList[idx - 1]['endTime']
          }
          this.setStepList(stepList, 0, 1)
        break
      }
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-cascader {
  width: 100%;
}

/deep/ .input-with .el-input-group__prepend {
  padding: 0 0 0 5px;
}

/deep/ .disabled-box{
  input{
    pointer-events: none; /* 阻止鼠标事件 */
    background-color: #e6e6e6; /* 添加背景色以改善视觉效果 */
    cursor: not-allowed;
  }

  .el-select {
    pointer-events: none;
  }
}
.set-btn{
  min-width: 60px;
}
</style>
