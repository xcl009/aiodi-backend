<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="设备类型">
          <el-select v-model="form.deviceTypeCode" @change="toQuery()" placeholder="设备类型">
            <el-option :label="index" :value="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-select>
        </el-form-item>
        <!-- <el-input v-model="form.batchNumber" placeholder="二维码"/> -->
        <!-- <el-input v-model="form.deviceId" placeholder="设备SN"/> -->
        <el-date-picker
          class="range-day flex align-center"
            @change="toQuery()"
            v-model="form.date"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="创建开始"
            end-placeholder="创建结束">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <div class="mb-10 flex">
        <el-button size="medium" type="primary" @click="$router.push({path: `/device/addQrcode`})">生成二维码</el-button>
        <el-button size="medium" type="primary" @click="$router.push({path: `/device/qrAddRecord`})">生成记录</el-button>
        <el-button size="medium" type="primary" :disabled="selSnArr.length == 0" @click="downloadImg()">批量下载</el-button>
        <import-data name="files" btnSize="medium" class="ml-10"></import-data>
      </div>
      <el-table id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row :max-height="tableMaxH" @selection-change="selSb">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column label="编号" width="200">
          <template slot-scope="scope">
            {{ scope.row.deviceSn }}
          </template>
        </el-table-column>
        <el-table-column label="设备SN">
          <template slot-scope="scope">
            {{ scope.row.factorySn || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="设备类型">
          <template slot-scope="scope">
            {{ scope.row.deviceType.name }}
          </template>
        </el-table-column>
        <el-table-column label="二维码内容">
          <template slot-scope="scope">
            {{ scope.row.content || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="生成时间" width="160">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下载" width="80">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content='全选后点击查询后的"下载"按钮可下载本页所有设备二维码图片' placement="top" v-if="scope.row.accessUrl">
              <el-link :href="scope.row.accessUrl" target="_blank" type="primary">下载</el-link>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination
          v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import ImportData from '@/components/ImportData/'

  import JSZip from 'jszip'
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  export default {
    name: 'qrcode',
    components: {
      condition,
      Pagination,
      ImportData
    },
    computed: {
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
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

        xlsxName: '设备二维码列表',
        outStatus: false,
        excel: false,
        percentage: 0,
        wbout: {},
        wi: 0,
        agent_name: {},
        deviceList: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'addQrcode') {
        to.meta.isBack = true
      } else {
        to.meta.isBack = false
      }
      next()
    },
    activated() {
      if (!this.$route.meta.isBack || !this.list) {
        this.getList()
      }
    },
    mounted(options) {

    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
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
          page: this.listQuery.page - 1
        })
        if(params.date && params.date.length > 0){
          params.startTime = params.date[0]
          params.endTime = params.date[1]
          delete params.date
        }
        this.$get('iot-saas-device/admin/qrcode/findPage', params).then(res => {
          this.listLoading = false
          this.clickSubmit = false
          this.list = res.rows
          if(params.page == 0){
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
        for (var i in list){
          if(list[i].accessUrl){
            selSnArr.push(list[i].deviceSn)
            selSnUrl.push(list[i].accessUrl)
          }
        }
        this.selSnArr = selSnArr
        this.selSnUrl = selSnUrl
      },

      downloadImgs(row){
        this.$get('iot-saas-device/admin/aliyun/download', {
          refId: row.accessUrl
        }).then(res => {
          console.log(res)
        })
      },

      /**
       * 下载二维码
       */
      downloadImg(){
        let that = this
        that.downLoad = this.$loading({
          lock: true,
          text: '文件打包下载中，请耐心等待',
          spinner: 'el-icon-loading'
        })
        var blogTitle = '设备二维码'
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
                imgs.file(imgNameList[k], baseList[k], {base64: true})
              }
              zip.generateAsync({type: 'blob'}).then((content) => {
                FileSaver.saveAs(content, blogTitle + '.zip')
                that.downLoad.close()
              })
            }
          }
          image.src = arr[i]
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
