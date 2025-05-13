<template>
  <div>
    <div class="flex flexv p-20 channel-box bg-white" style="height: 90vh;">
      <el-radio-group v-model="dforms.sourceType" @change="getBrandCannel()">
        <el-radio-button :label="key" v-for="(item, key) in Constant.SourceType" v-if="['0','3'].indexOf(key) == -1">{{ item }}</el-radio-button>
      </el-radio-group>

      <div class="mt-15 mb-15">{{ $t('system.channelSort') || 'Sort values in reverse order' }}</div>
      <div class="flex-1 p-15 radius-5 channel-parent">
        <template v-if="brandChannels.length > 0">
          <template v-for="item in brandChannels">
            <div class="flex align-center p-10 mb-15 channel-item radius-10 cursor" :class="{ 'act': item.status == 'ENABLE' }">
              <el-avatar class="block" :size="40" :src="item.logo" fit="cover" shape="square"></el-avatar>
              <div class="pl-10 pr-10 flex-1">
                <div :class="{ 'text-bold text-black': item.status == 'ENABLE' }" @click.stop="$set(item, 'editName', true)" v-show="!item.editName">{{ item.name }}</div>
                <el-input v-model="item.name" autofocus @blur.stop="item.editName = false" size="mini" v-show="item.editName" />
                <div class="mt-5 fs-s2">{{ item.code }}</div>
              </div>
              <div class="flex align-center sort-box text-center">
                <template v-if="item.status == 'ENABLE'">
                  <span class="mr-5">{{ $t('system.sortValues') || 'Sort Values' }}</span>
                  <el-input class="flex-1" v-model="item.sort" type="number" />
                </template>
              </div>
              <div class="pay-config text-primary text-center">
                <span v-if="item.status == 'ENABLE' && item.code != 'BALANCE' && item.id" @click.stop="setRows(1, item, 1)">{{
      $t('brand.payConfig') }}</span>
              </div>
              <div class="mr-20 text-primary text-center" v-if="item.status == 'ENABLE'">
                <span @click.stop="item.access = (item.access == 'ENABLE' ? 'DISABLE' : 'ENABLE')">{{ item.access == 'ENABLE' ? ($t('system.sortValues') || 'Connected') : ($t('system.sortValues') || 'Opening') }}</span>
              </div>
              <el-checkbox v-model="item.status" true-label="ENABLE" false-label="DISABLE"></el-checkbox>
            </div>
          </template>
        </template>
      </div>
      <div class="mt-15" v-if="brandChannels.length > 0">
        <el-button size="medium" type="primary" @click="saveChannel()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <el-form class="pl-20 pr-20 custom-form max-w" style="width: 600px;">
          <el-form-item>
            <i class="text-primary el-icon-arrow-left cursor fs-a1" @click="dialogType = 12"></i>
          </el-form-item>
          <el-form-item :label="$t('brand.appType')">
            <el-select v-model="dform.sourceType" class="tfixed" disabled>
              <el-option :label="item" :value="parseInt(key)" v-for="(item, key) in Constant.SourceType" />
            </el-select>
          </el-form-item>
          <el-form-item label="APPID">
            <el-input v-model="dform.appId"></el-input>
            <div class="cursor text-primary" @click="generateChange()">{{ $t('system.sortValues') || 'Click here to generate' }}</div>
          </el-form-item>
          <el-form-item :label="`code${dform.id ? '（'+ dform.id +'）' : ''}`">
            <el-input v-model="dform.channelCode" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('public.content')">
            <el-input type="textarea" :autosize="{ minRows: 14, maxRows: 16 }" :placeholder="$t('public.content')"
              v-model="dform.content">
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1, 3, 11, 12, 13, 15, 16, 17].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{
            $t('public.confirm')
            }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { arrayToObj, unixTime,currencySymbolposition } from '@/utils/index'
export default {
  name: 'brandPayChannel',
  components: {

  },
  data() {
    return {
      dforms: {
        sourceType: 4
      },
      brandChannels: [],
      clickSubmit: false,

      // 弹出相关
      dialogType: 1,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {}
    }
  },
  beforeRouteEnter(to, from, next) {
    next()
  },
  activated() {
    if (this.$route.meta.reload) {
      this.getConfig()
      this.toQuery()
    } else if (!this.brandChannels || this.brandChannels.length == 0) {
      this.getBrandCannel()
    }
  },
  computed: {
    Constant() {
      return this.$store.getters.Constant
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
    dialogTitle() {
      return {
        1: this.$t('brand.payConfig'),
      }
    },
  },
  mounted() {

  },
  methods: {
    /**
     * 获取品牌支付通道
     * @param {Object} id
     */
    getBrandCannel() {
      this.$get('iot-saas-pay/admin/pay/channel', {
        brandId: this.agentInfo.brandId,
        sourceType: this.dforms.sourceType
      }).then(res => {
        this.brandChannels = res
      })
    },

    /**
     * 保存支付通道
     */
    saveChannel(){
      let params = JSON.parse(JSON.stringify(this.dforms))
      if (this.clickSubmit) return
      this.clickSubmit = true
      let channels = []
      for (var i in this.brandChannels) {
        channels.push({
          alias: this.brandChannels[i].name,
          channelId: this.brandChannels[i].channelId,
          status: this.brandChannels[i].status,
          sort: this.brandChannels[i].sort,
          access: this.brandChannels[i].access
        })
      }
      params.brandId = this.agentInfo.brandId
      params.channels = channels
      this.$post('iot-saas-pay/admin/pay/channel/saveChannelBrand', params).then(res => {
        this.$message({
          message: this.$t('public.operationSuccessful'),
          type: 'success'
        })
        this.getBrandCannel()
        this.clickSubmit = false
      }).catch(err => {
        this.clickSubmit = false
      })
    },

    /**
     * 操作行
     * @param {Object} type 1 dialog类型
     * @param {Object} row 选择当前行
     * @param {Object} dialogType dialog内容显示类型 1: '支付配置'
     * @param {Object} idx 当前行所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 1:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.dform = {}
          if (dialogType == 1) {
            console.log('channelInfo===', row)
            this.dform = {
              id: row.configId || '',
              brandId: row.brandId,
              bindId: row.id,
              sourceType: row.sourceType || 4,
              channelCode: row.code,
              appId: row.appId || '',
              content: row.content || ''
            }
          }
          this.drawerStatus = true
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
      if (this.clickSubmit) return
      this.clickSubmit = true
      switch (this.dialogType) {
        case 1:
          this.$post('iot-saas-pay/admin/pay/channel/saveAppConfig', params).then(res => {
            this.$message({
              message: this.$t('public.operationSuccessful'),
              type: 'success'
            })
            this.getBrandCannel()
            this.clickSubmit = false
            this.drawerStatus = false
          }).catch(err => {
            this.clickSubmit = false
          })
          break
      }
    },
    
    generateChange() {
      let channel = this.dform.channelCode.split('_')
      this.$get('iot-saas-pay/api/pay/app/getAppId', { channel: channel[0] }).then(res => {
        this.dform.appId = res
        this.$message({
          message: this.$t('public.operationSuccessful'),
          type: 'success'
        })
      }).catch(() => {
        
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  .channel-parent{
    overflow-y: auto;
    min-height: 400px;
    background: #f8f8f8;
  }
  .channel-box {
    .channel-item {
      min-width: 600px;
      max-width: 960px;
      border: 2px solid #eee;

      &.act {
        border-color: var(--olive);
      }
    }

    /deep/ .el-avatar {
      background: none;
    }

    .sort-box {
      width: 240px;

      /deep/ .el-input__inner {
        padding-right: 0;
        width: 100%;
        height: 32px;
      }
    }

    .pay-config {
      width: 90px;
    }
  }
</style>
