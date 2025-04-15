<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item :label="$t('public.deviceType')">
          <el-select v-model="form.deviceTypeCode" @change="toQuery()" :placeholder="$t('public.deviceType')">
            <el-option :label="index" :value="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-select>
        </el-form-item>
        <!-- <el-input v-model="form.batchNumber" placeholder="二维码"/> -->
        <!-- <el-input v-model="form.deviceId" placeholder="设备SN"/> -->
        <el-date-picker class="range-day flex align-center" @change="toQuery()" v-model="form.date" type="daterange"
          value-format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('qrcode.crateStart')"
          :end-placeholder="$t('qrcode.creationEnded')">
        </el-date-picker>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="mb-10 flex">
        <el-button size="medium" type="primary" @click="$router.push({ path: `/device/addQrcode` })">{{
          $t('qrcode.generateCode') }}</el-button>
        <el-button size="medium" type="primary" @click="$router.push({ path: `/device/qrAddRecord` })">{{
          $t('qrcode.generatedRecords') }}</el-button>
        <el-button size="medium" type="primary" :disabled="selSnUrl.length == 0" @click="downloadImg()">{{ $t('qrcode.batchDownload') }}</el-button>
        <import-data name="files" :uploadText="$t('components.importDevice')" btnSize="medium" class="ml-10"></import-data>
      </div>
      <el-table id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading"
        highlight-current-row :max-height="tableMaxH" @selection-change="selSb">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column :label="$t('public.number')" width="250">
          <template slot-scope="scope">
            {{ scope.row.deviceSn }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.deviceSn')">
          <template slot-scope="scope">
            {{ scope.row.factorySn || '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.deviceType')">
          <template slot-scope="scope">
            {{ scope.row.deviceType.name }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('qrcode.codeContent')">
          <template slot-scope="scope">
            <el-popover trigger="hover">
              <div class="access-url" :ref="`sn_${scope.row.deviceSn}`" :id="`sn_${scope.row.deviceSn}`"></div>
              <div class="text-cut cursor" slot="reference" @mouseover="deviceCode(scope.row.deviceSn, scope.row.content)">
                {{ scope.row.content || '--' }}
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="VIETQR" v-if="token1">
          <template slot-scope="scope">
            <el-popover trigger="hover">
              <div class="viet-qr">
                <div class="mb-5">{{ scope.row.secondContent }}</div>
                <div class="flex justify-center">
                  <div class="access-url" :ref="`sn1_${scope.row.deviceSn}`" :id="`sn1_${scope.row.deviceSn}`"></div>
                </div>
              </div>
              <div class="text-cut cursor" v-if="scope.row.secondContent" slot="reference" @mouseover="deviceCode1(scope.row.deviceSn, scope.row.content)">{{ scope.row.secondContent }}</div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column :label="$t('qrcode.generationTime')" width="160">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('qrcode.download')" width="160">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :content="$t('qrcode.downloadText')" placement="top" v-if="scope.row.accessUrl">
              <el-link :href=" scope.row.accessUrl" target="_blank" type="primary">{{ $t('qrcode.download') }}</el-link>
            </el-tooltip>
            <span class="text-primary cursor" @click="setRows(3, scope.row, 1)" v-if="token1">生成VIETQR</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="rel flex justify-center">
        <div class="abs flex pagination-left" v-if="token1">
          <el-button type="primary" size="mini" :disabled="selSnArr.length == 0" @click="setRows(3, {}, 1)">批量生成VIETQR</el-button>
        </div>
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()" style="width: 600px;">
          <el-form-item label="设备二维码">
            <el-input v-model="dform.deviceSn" placeholder="多设备英文逗号隔开" type="textarea" rows="4" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="押金金额">
            <el-input v-model="dform.amount" :placeholder="$t('public.enter')"><template :slot="currencySymbolpositionType ? 'prepend':'append'">{{ siteInfo.currencySymbol }}</template></el-input>
          </el-form-item>
          <el-form-item label="类型">
            <el-input v-model="dform.type" :placeholder="$t('public.enter')" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="支付通道ID">
            <el-input v-model="dform.configId" :placeholder="$t('public.enter')"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template>
        <div class="p-15 mt-30 abs bfixed text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{
            $t('public.confirm') }}</el-button>
        </div>
      </template>

      <template v-if="[1].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-popconfirm
            :title="'确定提交吗？'"
            @onConfirm="dialogConfirm()"
          >
            <el-button size="medium" type="primary" :disabled="clickSubmit" slot="reference">{{ $t('public.confirm') }}</el-button>
          </el-popconfirm>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import ImportData from '@/components/ImportData/'
import QRCode from 'qrcodejs2'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import { getToken } from '@/utils/auth'
import {
  currencySymbolposition
} from '@/utils/index'
export default {
  name: 'qrcode',
  components: {
    condition,
    Pagination,
    ImportData
  },
  computed: {
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    xlsxName(){
      return this.$t('qrcode.codeList')
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    dialogTitle() {
      return {
        1: 'VIETQR',
      }
    },
  },
  data() {
    return {
      token1: getToken('token1') || '',
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
      selSnArr: [],
      selSnUrl: [],
      outStatus: false,
      excel: false,
      percentage: 0,
      wbout: {},
      wi: 0,
      agent_name: {},
      deviceList: {},

      // 弹出相关
      dialogType: 1,
      drawerStatus: false,
      curRow: {},
      curIdx: 0,
      dform: {},
      currencySymbolpositionType:false
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'addQrcode') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    if (this.$route.meta.reload) {
      this.getList()
    } else if (this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery()
    }
    this.urlQuery = this.$route.meta.urlQuery
    this.getPayChannel()
  },
  mounted(options) {
    this.currencySymbolpositionType =  currencySymbolposition();
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
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.form = {}
      this.listQuery.page = 1
      this.listQuery.size = 20
      this.getList()
    },

    getPayChannel(){
      this.$get('iot-saas-pay/api/pay/channel', {
        sourceType: 3
      }).then(res => {

      })
    },

    /**
     * 获取列表
     */
    getList() {
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.date && params.date.length > 0) {
        params.startTime = params.date[0]
        params.endTime = params.date[1]
        delete params.date
      }
      this.$get('iot-saas-device/admin/qrcode/findPage', params).then(res => {
        this.listLoading = false
        this.clickSubmit = false
        this.list = res.rows
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.table_box.$el.offsetTop - 85
        }
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 选择设备铺货
     * @param {Object} res
     */
    selSb(list) {
      let selSnArr = [], selSnUrl = []
      for (var i in list) {
        selSnArr.push(list[i].deviceSn)
        if (list[i].accessUrl) {
          selSnUrl.push(list[i].accessUrl)
        }
      }
      this.selSnArr = selSnArr
      this.selSnUrl = selSnUrl
    },

    downloadImgs(row) {
      this.$get('iot-saas-device/admin/aliyun/download', {
        refId: row.accessUrl
      }).then(res => {
        console.log(res)
      })
    },

    /**
     * 下载二维码
     */
    downloadImg() {
      let that = this
      that.downLoad = this.$loading({
        lock: true,
        text: that.$t('qrcode.downloading'),
        spinner: 'el-icon-loading'
      })
      var blogTitle = that.$t('public.deviceCode')
      var zip = new JSZip()
      var imgs = zip.folder(blogTitle)
      var baseList = []
      var arr = that.selSnUrl // 要下载图片的url
      var imgNameList = [] // 图片名称
      for (var i = 0; i < arr.length; i++) {
        let image = new Image()
        // 解决跨域 Canvas 污染问题
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = function () {
          let canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height

          let context = canvas.getContext('2d')
          context.drawImage(image, 0, 0, image.width, image.height)

          let url = canvas.toDataURL() // 得到图片的base64编码数据
          canvas.toDataURL('image/png')
          baseList.push(url.substring(22))    // 去掉base64编码前的 data:image/png;base64,
          imgNameList.push(image.src.split("?")[0].substring(image.src.lastIndexOf("/") + 1))
          if (baseList.length === arr.length && baseList.length > 0) {
            for (let k = 0; k < baseList.length; k++) {
              imgs.file(imgNameList[k], baseList[k], { base64: true })
            }
            zip.generateAsync({ type: 'blob' }).then((content) => {
              FileSaver.saveAs(content, blogTitle + '.zip')
              that.downLoad.close()
            })
          }
        }
        image.src = arr[i]
      }
    },

    /**
     * 操作行
     * @param {Object} type 3 drawer类型
     * @param {Object} row 选择当前数据
     * @param {Object} dialogType dialog内容显示类型
     * @param {Object} idx 当前数据所在位置
     */
    setRows(type, row, dialogType, idx) {
      switch (type) {
        case 3:
          this.dialogType = dialogType
          this.curRow = row
          this.curIdx = idx
          this.drawerStatus = true
          this.dform = {}
          if (dialogType == 1) {
            this.dform = {
              deviceSn: row.deviceSn || this.selSnArr.join(','),
              brandId: row.brandId || this.agentInfo.brandId,
              amount: 350000,
              type: 'VIETQR',
              configId: '1328026287167524864'
            }
          }
        break
      }
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
        case 1:
          this.deviceSns = params.deviceSn.split(',')
          this.createViteQr(params, 0)
          break
      }
    },

    /**
     * 提交生成viteQr
     */
    createViteQr(params, i){
      params.deviceSn = this.deviceSns[i]
      this.$post('iot-saas-device/admin/qrcode/second', params).then(res => {
        if(i == this.deviceSns.length - 1){
          this.$message({
            message: this.$t('public.operationCompleted'),
            type: 'success'
          })
          this.getList()
          this.drawerStatus = false
          this.clickSubmit = false
        } else {
          i++
          this.createViteQr(params, i)
        }
      }).catch(err => {
        this.clickSubmit = false
      })
    },

    /**
     * 设置二维码
     */
    deviceCode(sn, url) {
      let deviceCodeIds = this.deviceCodeIds || {}
      if (deviceCodeIds[sn]) return
      deviceCodeIds[sn] = sn
      this.$refs[`sn_${sn}`].innerHTML = ''
      this.$nextTick(() => {
        new QRCode(this.$refs[`sn_${sn}`], {
          width: 150,
          height: 150,
          text: url
        })
      })
    },

    /**
     * 设置二维码
     */
    deviceCode1(sn, url) {
      let deviceCodeIds = this.deviceCodeIds || {}
      if (deviceCodeIds[sn]) return
      deviceCodeIds[sn] = sn
      this.$refs[`sn1_${sn}`].innerHTML = ''
      this.$nextTick(() => {
        new QRCode(this.$refs[`sn1_${sn}`], {
          width: 150,
          height: 150,
          text: url
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .viet-qr{
    width: 420px;
  }
</style>
