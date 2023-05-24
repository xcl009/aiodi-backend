<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="设备类型">
          <el-select v-model="form.deviceTypeCode" @change="toQuery()" placeholder="设备类型">
            <el-option :label="index" :value="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-select>
        </el-form-item>
        <el-form-item label="扣款状态">
          <el-select v-model="form.status" @change="toQuery()" placeholder="扣款状态">
            <el-option label="未开始" value="1"/>
            <el-option label="进行中" value="1"/>
            <el-option label="已完成" value="2"/>
            <el-option label="已取消" value="0"/>
          </el-select>
        </el-form-item>
        <el-form-item label="创建日期">
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
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button size="small" type="primary" @click="$router.push({path: `/leaseOrder/edit`})">创建订单</el-button>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row :max-height="tableMaxH" @selection-change="selSb">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column label="订单号" width="200">
          <template slot-scope="scope">
            666666
          </template>
        </el-table-column>
        <el-table-column label="设备类型" width="200">
          <template slot-scope="scope">
            充电宝
          </template>
        </el-table-column>
        <el-table-column label="设备数量" width="200">
          <template slot-scope="scope">
            10
          </template>
        </el-table-column>
        <el-table-column label="总扣款金额">
          <template slot-scope="scope">
            8100
          </template>
        </el-table-column>
        <el-table-column label="已扣款金额">
          <template slot-scope="scope">
            1200
          </template>
        </el-table-column>
        <el-table-column label="扣款周期">
          <template slot-scope="scope">
            每天
          </template>
        </el-table-column>
        <el-table-column label="扣款金额">
          <template slot-scope="scope">
            10元
          </template>
        </el-table-column>
        <el-table-column label="状态" width="200">
          <template slot-scope="scope">
            进行中
          </template>
        </el-table-column>
        <el-table-column label="扣款开始">
          <template slot-scope="scope">
            2023-05-23
          </template>
        </el-table-column>
        <el-table-column label="预计完成">
          <template slot-scope="scope">
            2023-08-23
          </template>
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            2023-05-23 16:00
          </template>
        </el-table-column>
        <el-table-column label="操作" width="245">
          <el-button type="primary" size="mini" @click="bindStore(scope.row)">修改</el-button>
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

  import JSZip from 'jszip'
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'
  export default {
    name: 'qrcode',
    components: {
      condition,
      Pagination
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
        list: [{}],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        selSnArr: [],
        selSnUrl: [],

        xlsxName: '列表',
        outStatus: false,
        excel: false,
        percentage: 0,
        wbout: {},
        wi: 0
      }
    },
    mounted(options) {
      //this.getList()
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
