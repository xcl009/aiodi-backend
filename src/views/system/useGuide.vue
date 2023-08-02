<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">对象类型</div>
          <el-tabs class="flex-1" v-model="listQuery.ruleType" @tab-click="toQuery()">
            <el-tab-pane label="全部" :name="''" />
            <el-tab-pane label="后台用户" name="1"/>
            <el-tab-pane label="终端用户" name="2"/>
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">指南类型</div>
          <el-tabs class="flex-1" v-model="listQuery.Type" @tab-click="toQuery()">
            <el-tab-pane label="全部" :name="''" />
            <el-tab-pane :label="item.title" :name="item.value" v-for="item in tabs" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">设备类型</div>
          <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item v-for="item in 2">
          <div class="flex combined">
            <el-select v-model="formKey[`sel${item}`]" placeholder="请选择">
              <template v-for="(q, key) in queryObj">
                <el-option :label="q.title" :value="key" v-if="checkQueryRepeat(key, item, formKey)"></el-option>
              </template>
            </el-select>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
              <el-input :placeholder="`请输入${queryObj[formKey.sel1].title}`" v-model="form[formKey[`sel${item}`]]"></el-input>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
              <selectSearch v-model="form[formKey[`sel${item}`]]" :type="queryObj[formKey[`sel${item}`]].sType" :name="queryObj[formKey[`sel${item}`]].name" :placeholder="`${queryObj[formKey['sel'+item]].title}`" @change="toQuery()"></selectSearch>
            </template>
            <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
              <el-select v-model="form[formKey[`sel${item}`]]" :placeholder="`${queryObj[formKey['sel'+item]].title}`" clearable @change="toQuery()">
                <el-option :label="item.label" :value="item.value" v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
              </el-select>
            </template>
          </div>
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="setRows(3, {}, 1)"><i class="el-icon-plus el-icon--left" />添加指南</el-button>
      </template>
    </condition>

    <div class="p-15 bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row>
        <el-table-column label="广告位置">
          <template slot-scope="scope">
            <div>{{ scope.row.position }}</div>
          </template>
        </el-table-column>
        <el-table-column label="广告位置名称">
          <template slot-scope="scope">
            <div>{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column label="广告类型">
          <template slot-scope="scope">
            <div>{{ scope.row.positionTypeName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="微信广告ID" v-if="isBrand()">
          <template slot-scope="scope">
            <div>{{ scope.row.weChatAdvertPositionId || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" :plain="scope.row.statusCode != 'ENABLE'" @click="setStatus(scope.row)" v-if="isBrand() && scope.row.weChatAdvertPositionId">{{ scope.row.statusCode == 'ENABLE' ? '已开启' : '已关闭' }}</el-button>
            <el-button type="primary" size="mini" @click="adUnitId(scope.row)" v-if="isBrand()">设置广告ID</el-button>
            <el-button type="primary" size="mini" @click="showDialog(scope.row)" v-if="isSaas()">编辑</el-button>
            <el-button type="danger" size="mini" @click="del(scope.row, scope.$index)" v-if="isSaas()">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-drawer
      :title="dialogTitle[dialogType]"
      :visible.sync="drawerStatus"
      >
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item label="类型">
            <el-select v-model="dform.Type">
              <el-option :label="`${t.title}`" :value="t.value" v-for="t in tabs" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备">
            <el-select v-model="dform.deviceType">
              <el-option :label="key" :value="item" v-for="(item, key) in myDeviceName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="dform.title" placeholder="指南标题" style="width: 600px;"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="dform.desc" placeholder="请输入指南内容" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="其他描述">
            <el-input v-model="dform.remark" type="textarea" :rows="4" />
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  export default {
    name: 'useGuide',
    components: {
      condition
    },
    data() {
      return {
        clickSubmit: false,
        category: this.$route.query.category,
        advertTypeCode: this.$route.query.advertTypeCode,
        advertTypeName: this.$route.query.advertTypeName,
        positionType: {
          'BANNER': 'Banner广告',
          'ENCOURAGE_VIDEO': '激励视频广告',
          'TABLE_SCREEN': '插屏广告',
          'VIDEO': '视频广告',
          'VIDEO_BEFORE': '视频前贴广告',
          'TEMPLATE': '原生模板广告'
        },
        tabs: [
          {
            value: '1',
            title: '使用'
          },
          {
            value: '2',
            title: '支付'
          },
          {
            value: '3',
            title: '归还'
          },
          {
            value: '4',
            title: '退款'
          }
        ],
        queryObj: {
          deviceSn: {
            title: '二维码',
            type: 'input'
          },
          place: {
            title: '位置备注',
            type: 'input'
          },
          haveAssociateDevice: {
            title: '是否关联',
            type: 'select',
            selectArr: [
              {
                label: '全部',
                value: null,
              },
              {
                label: '已关联',
                value: true,
              },
              {
                label: '未关联',
                value: false,
              }
            ]
          },
          storeId: {
            title: '商户名称',
            type: 'selectSearch',
            name: 'name',
            sType: 3
          },
          agentId: {
            title: '代理名称',
            type: 'selectSearch',
            name: 'name',
            sType: 5
          },
          factorySn: {
            title: '设备SN',
            type: 'input'
          },
        },
        formKey: {
          sel1: 'deviceSn',
          sel2: 'storeId'
        },
        form: {},
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          haveBind: this.$route.query.haveBind || '',
          page: 1,
          size: 20
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        drawerStatus: false,
        dialogTitle: {
          1: '添加指南'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {
      this.getList()
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
       * 获取广告位列表
       */
      getList() {
        let url = 'iot-saas-advert/admin/advert/position/find'
        if(this.isBrand()) url = 'iot-saas-advert/admin/advert/findBrandTraffic'
        this.$get(url, {
          category: this.category,
          advertTypeCode: this.advertTypeCode
        }).then(res => {
          this.listLoading = false
          this.list = res
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型  3 drawer类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '添加指南'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:

            break
          case 3:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.drawerStatus = true
            this.dform = {}
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
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            params.deviceSn = curRow.deviceSn
            params.heartbeat = curRow.heartbeat || 30
            if(!params.deviceSn){
              this.$message({
                message: '请输入设备SN',
                type: 'error'
              })
              return
            }else if(!params.address){
              this.$message({
                message: '请输入设备服务器地址',
                type: 'error'
              })
              return
            }else if(!params.port){
              this.$message({
                message: '请输入设备服务端口号',
                type: 'error'
              })
              return
            }
            this.$post('http://139.159.246.248:9888/api/setting/address', params).then(res => {
              this.$message({
                message: '操作成功',
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


    }
  }
</script>

<style lang="scss" scoped>

</style>
