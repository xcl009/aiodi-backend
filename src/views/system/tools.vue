<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="myDeviceId['VM'] && vendorInfo.operationMode == 'SELF_RUN'">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">商品管理</div>
                <div class="mt-5 fs-s3 text-gray">管理售货机出售的商品，管理不同仓口设备售货模板</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/relatedTemplate`})">仓口模板</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/addGoods`})">添加商品</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods`})">商品列表</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/goodsOrder`})">查看订单</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-else-if="myDeviceId['VM'] && Ability['order']">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">售货机订单管理</div>
                <div class="mt-5 fs-s3 text-gray">查看售货机的商品订单</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/goods/goodsOrder`})">查看订单</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(Object.keys(config.roomDevice), 2)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">主题房设备</div>
                <div class="mt-5 fs-s3 text-gray">设置按摩床、电玩盒子、影音盒子等设备铺货赠送规则、商户创建订单计费规则</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/bedSetting`})">设置</el-button>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_DEPOSIT_PRPR'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">概率押金</div>
                <div class="mt-5 fs-s3 text-gray">设置用户租借不能免押，需缴纳押金租借的概率</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/steal/depositCash`})">设置概率</el-button>
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/steal/depositCashUser`})">概率押金名单</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_DEPOSIT_DELAY', '_DEPOSIT_MP'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">押金退款规则</div>
                <div class="mt-5 fs-s3 text-gray">设置用户缴纳的押金退款方式、模式</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/depositRefund`})">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_FREEQUOTA'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">免费名额规则</div>
                <div class="mt-5 fs-s3 text-gray">设置添加免费名额默认免费时长、次数</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/freeQuotaConfig`})">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_BILLING'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">默认计费规则</div>
                <div class="mt-5 fs-s3 text-gray">设置添加商户时各设备的默认计费信息</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/billing`})">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['_DD_RATIO', '_DD_TIME', '_DD_FAIL'])">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">DD设置</div>
                <div class="mt-5 fs-s3 text-gray">设置全站DD单规则</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/store/steal`})">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand()">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">超时订单成本设置</div>
                <div class="mt-5 fs-s3 text-gray">设置超时订单设备成本及分润规则</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/device/orderOt`})">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="checkAbility(['WD_AGENT','WD_STORE','WD_USER'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">代理、商户、用户提现规则</div>
                <div class="mt-5 fs-s3 text-gray">配置代理、商户、用户可提现时间、手续费等规则</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({path: `/system/cashSet`})">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['MOBILE_POWER'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">登录手机号授权设置</div>
                <div class="mt-5 fs-s3 text-gray">配置微信用户登录手机号授权规则</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'MOBILE_POWER' }, 1)">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['RENT_LIMIT'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">免押订单租借次数限制</div>
                <div class="mt-5 fs-s3 text-gray">配置用户免押可租借次数</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'RENT_LIMIT' }, 2)">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['NEAR_STORE'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">附近商户展示设置</div>
                <div class="mt-5 fs-s3 text-gray">配置附近商户是否展示</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'NEAR_STORE' }, 3)">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor" v-if="isBrand() && checkAbility(['STORE_MONEY_SET'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">商户收益明细、月(日)统计设置</div>
                <div class="mt-5 fs-s3 text-gray">配置商户收益明细、月(日)统计相关设置</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRows(1, { code: 'STORE_MONEY_SET' }, 4)">设置</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="24" class="pb-20 cursor">
          <div>更多功能开发中，请持续关注</div>
        </el-col>
      </el-row>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" label-position="left" :model="dform">
          <el-form-item label="微信">
            <el-switch v-model="dform.wx_phone" :active-value="1" :inactive-value="0" />
            <span class="ml-10 fs-s3">开启表示微信用户登录需授权手机号码</span>
          </el-form-item>
          <!-- <el-form-item label="支付宝">
            <el-switch v-model="dform.ali_phone" :active-value="1" :inactive-value="0" />
            <span class="ml-10 fs-s3">开启表示支付宝用户登录需授权手机号码（须获得获取会员手机号权限，否则用户无法正常登录）</span>
          </el-form-item> -->
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" label-position="left" :model="dform">
          <el-form-item label="可借次数">
            <el-input v-model="dform.RENT_LIMIT" type="number"><template slot="append">单</template></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 3">
        <div class="text-center">
          <el-switch v-model="dform.nearStore" :active-value="1" :inactive-value="0" />
          <div class="mt-15">开启表示展示附近商户</div>
        </div>
      </template>
      <template v-if="dialogType == 4">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" label-position="left" :model="dform">
          <el-form-item label="收益明细">
            <el-switch v-model="dform.checkIncome" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="月日统计">
            <el-switch v-model="dform.checkMouthStat" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="月日统计简化">
            <el-switch v-model="dform.checkMouthStatSp" :active-value="1" :inactive-value="0" />
            <span class="ml-10 fs-s3">开启表示只展示日期和收益额</span>
          </el-form-item>
        </el-form>
      </template>
      <div class="pb-20 mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'systemTools',
    data() {
      return {
        clickSubmit: false,
        vendorInfo: {}, // 售货机运营信息

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '用户登录授权手机号',
          2: '免押订单租借次数限制',
          3: '附近商户展示设置',
          4: '全站商户设置',
        },
        curRow: {},
        curIdx: 0,
        dform: {},
      }
    },
    computed: {
      Ability() {
        return this.$store.getters.Ability
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      }
    },
    mounted() {
      if(this.isBrand()){
        this.vendorInfo = {
          operationMode: 'SELF_RUN',
          rebateRatio: 100
        }
      }else if(this.myDeviceId['VM']){
        this.getVendorInfo()
      }
    },
    methods: {
      /**
       * 我的运营模式详情
       */
      getVendorInfo(){
        this.$get('iot-saas-device/admin/vendor/setting', {
          companyId: this.isAgent() ? this.agentInfo.agentId : this.agentInfo.storeIds[0]
        }).then(res => {
          this.vendorInfo = res || {}
        })
      },

      /**
       * 操作数据
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '设置登录手机号权限'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            if([1, 2, 3, 4].indexOf(dialogType) > -1){
              this.$get('iot-saas-basic/admin/settings/find', {
                code: row.code
              }).then(res => {
                if(res && res.code){
                  this.dform = JSON.parse(res.setting)
                } else {
                  switch (dialogType) {
                    case 1:
                      this.dform = {
                        wx_phone: 0,
                        //ali_phone: 0
                      }
                    break
                    case 2:
                      this.dform = {
                        RENT_LIMIT: 3
                      }
                    break
                    case 3:
                      this.dform = {
                        nearStore: 1
                      }
                    break
                    case 4:
                      this.dform = {
                        checkIncome: 1,
                        checkMouthStat: 1,
                        checkMouthStatSp: 0
                      }
                    break
                  }
                }
              })
            } else {
              this.dform = {}
            }
            this.dialogStatus = true
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
          case 1: case 2: case 3: case 4:
            this.$post('iot-saas-basic/admin/settings/save', {
              code: curRow.code,
              setting: JSON.stringify(params)
            }).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.dialogStatus = false
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

<style lang="scss" scoped>
  .role-item {
    padding: 20px 16px;
    height: 184px;
    border-radius: 4px;
    border: 1px solid #E5E6EB;

    .icon-box {
      width: 64px;
      height: 64px;
      background-color: var(--olive);
      border-radius: 64px;
      font-size: 20px;
      color: var(--white);
    }
    .bg-body{
      padding: 10px 15px;
    }
  }
</style>
