<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select v-model="form.deviceTypeId" @change="toQuery()" placeholder="设备类型">
          <el-option :label="index" :value="''+item+''" v-for="(item, index) in myDeviceName" />
        </el-select>
        <!-- <el-input v-model="form.qrcodeSn" placeholder="二维码"/> -->
        <el-input v-model="form.deviceId" placeholder="设备SN"/>
        <el-date-picker
          class="range-day flex align-center"
            v-model="form.day"
            type="datetimerange"
            range-separator="-"
            start-placeholder="创建开始时间"
            end-placeholder="创建结束时间">
          </el-date-picker>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <div class="mb-15 flex">
        <div class="flex1">
          <el-button size="medium" type="primary" @click="$router.push({path: `/device/create`})">生成二维码</el-button>
          <el-button size="medium" type="primary" @click="$router.push({path: `/device/createRecord`})">生成记录</el-button>
          <el-button size="medium" type="primary" :disabled="selSnArr.length == 0" @click="toQuery(item.value)">批量下载</el-button>
        </div>
      </div>

      <el-table id="table_box" ref="table_box" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row :max-height="tableMaxH" @selection-change="selSb">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column label="编号" width="200">
          <template slot-scope="scope">
            {{ scope.row.codeSn }}
          </template>
        </el-table-column>
        <el-table-column label="设备号">
          <template slot-scope="scope">
            {{ scope.row.deviceId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            {{ scope.row.jumpTag }}
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            {{ scope.row.factoryId }}
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
              <el-link :href="scope.row.code_url" target="_blank" type="primary">下载</el-link>
            </el-tooltip>
            <a class="text-blue" @click="createImg(scope.row)" v-else-if="scope.row.content && !scope.row.accessUrl">生成图片</a>
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="editCode(scope.row)">编辑</el-button>
            <el-button type="primary" size="mini" round plain @click="setEquip(scope.row)">分配设备</el-button>
          </template>
        </el-table-column> -->
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
      if (from.name == 'edit') {
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
        if(params.startTime) params.startTime = params.startTime / 1000
        if(params.endTime) params.endTime = params.endTime / 1000
        this.$get('iot-saas-device/admin/qrcode/findPage', params).then(res => {
          if(this.outStatus){
            this.list = res.list
            if(this.listQuery.page >= res.total){
              this.listLoading = false
              this.percentage = 100
            } else {
              this.listQuery.page++
              this.percentage = this.percentage < 95 ? this.percentage + 5 : 95
            }
            this.$nextTick(() => {
              this.outTabdd('table_box', this.xlsxName)
            })
          } else {
            this.listLoading = false
            this.clickSubmit = false
            this.list = res.rows
          }
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
       * 校验是否可选
       */
      checkSel(row) {
        return !row.agent_id && row.device_id
      },

      /**
       * 选择设备铺货
       * @param {Object} res
       */
      selSb(list) {
        let selSnArr = [], selSnUrl = []
        for (var i in list){
          selSnArr.push(list[i].code_sn)
          if(list[i].code_url) selSnUrl.push(list[i].code_url)
        }
        this.selSnArr = selSnArr
        this.selSnUrl = selSnUrl
      },

      /**
       * 操作
       */
      setEquip(row){
        const selSn = this.selSnArr.join(',')
        if(this.son_id){
          this.$post('agentapi/save_distribute_agent_devices', {
            son_id: this.son_id,
            goods_sn: row ? [row.code_sn] : this.selSnArr
          }).then(res => {
            this.$message({
              message: '分配成功',
              type: 'success'
            })
            history.back()
          })
        } else {
          this.$router.push({
            path: '/partner/index',
            query: {
              zuo_sn: row ? row.code_sn : selSn
            }
          })
        }
      },

      /**
       * 生成二维码图片
       */
      createImg(row){
        this.$get('QRcode/createCodeSnImage', {
          id: row.id
        }).then(res => {
          row.code_url = res.img_url
        })
      },

      /**
       * 修改二维码
       */
      editCode(row){
        window.codeInfo = row
        this.$router.push({path: `/qrcode/edit?code_sn=${row.code_sn}`})
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
            imgNameList.push(image.src.substring(image.src.lastIndexOf("/") + 1))
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
      },

      /**
       * 导出
       */
      outTable(){
        this.outStatus = true
        this.listLoading = true
        this.listQuery.size = 100
        this.list = []
        this.excel = true
        this.getList()
      },

      /**
       * 导出表格
       */
      outTabdd(tabId, fileName = 'data') {
        let fix = document.querySelector('.el-table__fixed-right')
        let xlsxParam = { raw: true }
        let wb
        if (fix) {
          this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`).removeChild(fix), xlsxParam)
          document.querySelector(`#${tabId}`).appendChild(fix)
        } else {
          this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`), xlsxParam)
        }
        this.wi++
        console.log(0)
        if(this.listLoading){
          this.getList()
          return
        }
        let wboutes = this.wbout[0]
        var no = ''
        for(var i in this.wbout){
          delete this.wbout[i].Sheets.Sheet1['!merges']
          if(i > 0){
            let sheet1 = this.wbout[i].Sheets.Sheet1
            for(var s in sheet1){
              let k = s.substring(0, 1)
              let n = s.substring(1)
              if(n != 1 && n != 'ref'){
                let k = s.substring(0, 1)
                n = s.substring(1)
                no = ((parseInt(i) * 100) + parseInt(n))
                sheet1[k + no] = sheet1[s]
              }
              delete sheet1[s]
            }
            wboutes.Sheets.Sheet1 = Object.assign(wboutes.Sheets.Sheet1, sheet1)
          }
        }
        if(this.wbout[1]) wboutes.Sheets.Sheet1['!ref'] = `A1:Q${no}`
        let wbout = XLSX.write(wboutes, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        })
        this.percentage = 100
        if(!this.listLoading){
          try {
            FileSaver.saveAs(new Blob([wbout], {
              type: 'application/octet-stream'
            }), `${fileName}.xlsx`)
            this.excel = false
            this.$message({
              message: '导出成功',
              type: 'success'
            })
            setTimeout(()=>{
              location.reload()
            }, 1000)
          } catch (e) {
            if (typeof console !== 'undefined') console.log(e, this.wbout)
          }
          return this.wbout
        }
      },

      showCodeType(tag, sn){
        let typeText = ''
        switch(tag){
          case 'CDX:': case 'LINE:':
            typeText = "密码线"
            break
          case 'B-LINE:':
            typeText = "蓝牙线"
            break
          case 'NB-LINE:':
            typeText = "密码蓝牙线"
            break
          case 'XYJ:': case 'TAG_4_1':
            typeText = "洗衣机"
            break
          case 'AMZ:': case 'TAG_2_1':
            typeText = "按摩枕"
            break
          case 'CFJ:': case 'TAG_6_1':
            typeText = "电吹风"
            break
          case 'TAG_7_1': case 'TAG_7_6':
            typeText = "套套机"
            break
          case 'TAG_3_1':
            typeText = "充电桩"
            break
          default:
            if(sn.indexOf('F') > -1){
              typeText = "充电桩"
            }else{
              typeText = "充电宝"
            }
            break
        }
        return typeText
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
