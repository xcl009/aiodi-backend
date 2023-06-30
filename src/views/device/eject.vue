<template>
  <div>
    <div class="p-15 bg-white">
      <el-button class="mb-15" type="primary" size="medium" @click="allEject()" :disabled="allEjectStatus">{{ allEjectStatus ? '弹出中' : '全部弹出'}} </el-button>
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
            <el-button type="primary" size="small" :disabled="scope.row.onlineStatus == 2" @click="singleEject(scope.row)">{{ scope.row.onlineStatus == 2 ? '弹出中' : '弹出' }}</el-button>
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
        allEjectStatus: false
      }
    },
    mounted(options) {
      this.getBattery()
    },
    methods: {
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
          }, 3000)
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
