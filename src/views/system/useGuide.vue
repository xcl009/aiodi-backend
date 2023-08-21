<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">对象类型</div>
          <el-tabs class="flex-1" v-model="form.guideTarget" @tab-click="toQuery()">
            <el-tab-pane label="全部" name="0" />
            <el-tab-pane :label="item.typeName" :name="item.userType" v-for="(item, index) in dataList" :key="index" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">指南类型</div>
          <el-tabs class="flex-1" v-model="form.guideType" @tab-click="toQuery()">
            <el-tab-pane label="全部" name="0" />
            <el-tab-pane :label="item.title" :name="item.value" v-for="item in tabs" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
          <div class="mr-10">设备类型</div>
          <el-tabs class="flex-1" v-model="form.deviceTypeCode" @tab-click="toQuery()">
            <el-tab-pane label="全部" name="0" />
            <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
          </el-tabs>
        </div>
      </template>

      <template v-slot:defult>
        <el-form-item label="指南标题">
          <el-input v-model="form.guideTitle" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="setRows(3, {}, 1)"><i
            class="el-icon-plus el-icon--left" />添加指南</el-button>
      </template>
    </condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
        <el-table-column label="对象" width="150">
          <template slot-scope="scope">
            <div>{{ scope.row.guideTargetName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="icon" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" fit="cover" :src="scope.row.guideIcon"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template slot-scope="scope">
            <div v-for="(item, index) in tabs" :key="index">
              <div v-if="item.value == scope.row.guideType">{{ item.title }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设备" width="100">
          <template slot-scope="scope">
              <div v-for="(item,index ) in myDevice" :key="index">
                  <div v-if="item.code == scope.row.deviceTypeCode">{{ item.name }}</div>
              </div>
          </template>
        </el-table-column>
        <el-table-column label="标题" width="220">
          <template slot-scope="scope">
            <div>{{ scope.row.guideTitle }}</div>
          </template>
        </el-table-column>
        <el-table-column label="描述" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.guideContent }}</div>
          </template>
        </el-table-column>
        <el-table-column label="其他描述" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.guideDesc }}</div>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template slot-scope="scope">
            {{ orderStatus[scope.row.refundStatus] || '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <template v-if="isSaas()">
                <el-button type="text" @click="showDialog(scope.row)">编辑</el-button>
                <el-button type="text" class="text-danger" @click="del(scope.row, scope.$index)">删除</el-button>
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

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item label="指南对象">
            <el-select v-model="dform.guideTarget">
              <el-option :label="`${item.typeName}`" :value="item.userType" v-for="(item,index) in dataList" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指南图标" class="up-img">
            <upload v-model="dform.guideIcon" />
          </el-form-item>
          <el-form-item label="指南类型">
            <el-select v-model="dform.guideType">
              <el-option :label="`${t.title}`" :value="t.value" v-for="t in tabs"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指南设备">
            <el-select v-model="dform.deviceTypeCode">
              <el-option :label="key" :value="item" v-for="(item, key) in myDeviceName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="dform.refundStatus">
              <el-option :label="v" :value="k" v-for="(v, k) in orderStatus"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="指南标题">
            <el-input v-model="dform.guideTitle" placeholder="指南标题" style="width: 600px;"></el-input>
          </el-form-item>
          <el-form-item label="指南内容">
            <el-input v-model="dform.guideContent" placeholder="请输入指南内容" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="其他描述">
            <el-input v-model="dform.guideDesc" type="textarea" :rows="4" />
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
import selectSearch from '@/components/condition/selectSearch'
import Pagination from '@/components/Pagination'
import upload from '@/components/upload'
export default {
  name: 'useGuide',
  components: {
    condition,
    selectSearch,
    Pagination,
    upload
  },
  data() {
    return {
      clickSubmit: false,
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
      orderStatus: {
        U: '待付款',
        R: '租借中',
        F: '租借失败',
        O: '已完成',
        W: '免押待付款',
        D: '已退款'
      },
      form: {},
      list: [],
      tableMaxH: '250',
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
      dform: {},
      // 指南对象数组
      dataList:[],
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    myDeviceName() {
      return this.$store.state.user.myDeviceName
    },
    myDeviceId() {
      return this.$store.state.user.myDeviceId
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    },
    Ability() {
      return this.$store.getters.Ability
    },
    myDevice() {
      return this.$store.state.user.myDevice;
    }
  },
  mounted() {
    this.getList();
    this.init();
  },
  methods: {
    /**
    * 获取指南对象数据
    */
   init(){
    let url = 'iot-saas-basic/admin/guide/config/findTypes';
    this.$get(url, {}).then(res => {
      this.dataList = res;
      this.listLoading = false;
      }).catch(() => {
        this.listLoading = false
      })
   },
    /**
    * 显示dialog
    */
    showDialog(row) {
      this.drawerStatus = true
      this.dform = Object.assign({}, row)
    },

    /**
     * 删除问题指南
     */
    del(row) {
      this.$alert('确定删除此问题指南吗？', '问题指南', {
        confirmButtonText: '确定',
        center: true,
        callback: action => {
          if (action == 'confirm') {
            this.$post('iot-saas-basic/admin/guide/config/delete', {
              id: row.id,
              status: 0
            }).then(res => {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.getList();
            })
          }
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
     * 获取问题指南列表
     */
    getList() {
      let url = 'iot-saas-basic/admin/guide/config/findPage'
      var params = Object.assign({}, this.form, this.listQuery, {
        page: this.listQuery.page - 1
      })
      if (params.deviceTypeCode == 0) {
        delete params.deviceTypeCode
      }
      if (params.guideType == 0) {
        delete params.guideType
      }
      if (params.guideTarget == 0) {
        delete params.guideTarget
      }
      this.$get(url, params).then(res => {
        this.list = res.rows
        this.clickSubmit = false
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
        }
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
      if (this.isSaas()) {
        params.brandId = this.agentInfo.brandId
      }
      switch (this.dialogType) {
        case 1:
        if (!params.guideTarget) {
            this.$message({
              message: '请选择对象',
              type: 'error'
            })
            return
          }else if (!params.guideType) {
            this.$message({
              message: '请选择指南类型',
              type: 'error'
            })
            return
          } else if (!params.guideTitle) {
            this.$message({
              message: '请输入标题',
              type: 'error'
            })
            return
          } else if (!params.guideContent) {
            this.$message({
              message: '请输入指南内容',
              type: 'error'
            })
            return
          }
          this.$post('iot-saas-basic/admin/guide/config/save', params).then(res => {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.toQuery();
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

<style lang="scss" scoped></style>
