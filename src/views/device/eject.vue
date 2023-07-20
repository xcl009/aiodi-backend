<template>
  <div>
    <div class="p-15 bg-white">
      <el-popconfirm
        class="pop"
        cancel-button-type=""
        icon="el-icon-info"
        icon-color="#FF7D00"
        title="确定要全部弹出吗？"
        @onConfirm="allEject()"
        v-if="factoryCode == 'WS'"
      >
        <el-button class="mb-15" type="primary" size="medium" slot="reference" :disabled="allEjectStatus">{{ allEjectStatus ? '弹出中' : '全部弹出'}} </el-button>
      </el-popconfirm>
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" highlight-current-row>
        <el-table-column label="卡槽位置">
          <template slot-scope="scope">
            {{ scope.row.slot }}
          </template>
        </el-table-column>
        <el-table-column label="电池编号">
          <template slot-scope="scope">
            {{ scope.row.terminalId }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="弹出次数">
          <template slot-scope="scope">
            {{ scope.row.popupNum }}
          </template>
        </el-table-column> -->
        <el-table-column label="在线状态">
          <template slot-scope="scope">
            <div v-if="scope.row.onlineStatus == 2">弹出中</div>
            <div v-else-if="scope.row.onlineStatus == 1">在槽（{{ scope.row.electricQuantity }}%）</div>
            <div v-else >已弹出</div>
            <view v-if="scope.row.onlineStatus == 0">无数据包</view>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <el-popconfirm
                class="pop"
                cancel-button-type=""
                icon="el-icon-info"
                icon-color="#FF7D00"
                title="确定要弹出此口吗？"
                @onConfirm="singleEject(scope.row)"
              >
                <el-button type="text" :disabled="scope.row.distribute" slot="reference">{{ scope.row.onlineStatus == 2 ? '弹出中' : '弹出' }}</el-button>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'eject',
    components: {

    },
    computed: {

    },
    data() {
      return {
        clickSubmit: false,
        list: [],
        listLoading: false,
        deviceSn: this.$route.query.deviceSn || '',
        allEjectStatus: false,
        factoryCode: ''
      }
    },
    mounted(options) {
      this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo(){
      	this.$get('iot-saas-device/admin/device/findBelong', {
      		deviceSn: this.deviceSn
      	}).then(res => {
      		if(res.deviceTypeCode.indexOf('PA') == -1){
            this.$message({
              message: '该设备非充电宝，不可弹出',
              type: 'error'
            })
      			return
      		}
      		this.factoryCode = res.factoryCode
      		this.getBattery()
      	}).catch(err => {
      		setTimeout(() => {
      			uni.navigateBack()
      		}, 1500)
      	})
      },

      /**
       * 获取列表
       */
      getBattery() {
        this.$get('iot-saas-device/admin/device/stock/list', {
          deviceSn: this.deviceSn
        }).then((res = []) => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 单弹
       */
      singleEject(row){
        if(this.clickSubmit) return
        this.clickSubmit = true
        row.onlineStatus = 2
        this.$get('iot-saas-device/admin/device/singlePopup', {
          deviceSn: this.deviceSn,
					slot: row.slot
        }).then((res = {}) => {
          this.$message({
            message: '指令已发送',
            type: 'success'
          })
          this.clickSubmit = false
          setTimeout(() => {
          	this.getBattery()
          }, 8000)
        }).catch(() => {
          this.clickSubmit = false
        })
      },

      /**
       * 全弹
       */
      allEject(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.allEjectStatus = true
      	this.$get('iot-saas-device/admin/device/batchPopup', {
      		deviceSn: this.deviceSn
      	}).then((res = {}) => {
          this.$message({
            message: '指令已发送',
            type: 'success'
          })
      		setTimeout(() => {
      			this.getBattery()
            this.allEjectStatus = false
      		}, 10000)
      	}).catch(err => {
          this.clickSubmit = false
      	})
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
