<template>
  <div class="p-10">
    <div class="p-20 bg-white radius-10">
      <div class="mt-30 flex align-center">
        <span>二维码编号：</span>
        <el-input class="mr-10 flex1" v-model="code_sn" placeholder="输入二维码编号" />
        <!-- <el-button type="primary">点我扫描二维码</el-button> -->
      </div>
      <div class="mt-30 flex align-center flex-wrap justify-around">
        <el-button type="primary" @click="$router.push({path: `/checkd/bind?code_sn=${code_sn}`})">绑定设备</el-button>
        <el-button type="primary">测试设备</el-button>
        <el-button type="primary">二维码列表</el-button>
      </div>
    </div>

    <el-dialog title="绑定设备" :visible.sync="bindDialog">
      <div class="flex align-center">
        <span>二维码：</span>
        <el-input class="mr-10 flex1" v-model="code_sn" placeholder="输入二维码编号" @input="searchDevive" />
        <el-button type="primary">点我扫描二维码</el-button>
      </div>
      <div class="mt-10 flex align-center">
        <span>设备类型：</span>
        <el-radio-group v-model="bindForm.device_type">
          <el-radio-button label="0">八戒充电宝</el-radio-button>
          <el-radio-button label="4">圳优充电宝</el-radio-button>
          <el-radio-button label="99">其他</el-radio-button>
        </el-radio-group>
      </div>
      <div class="mt-10 flex align-center" v-show="bindForm.device_type == 0 || bindForm.device_type == 99">
        <span>设备编号：</span>
        <el-input class="flex1" v-model="bindForm.device_id" placeholder="输入设备编号" @input="searchDevive" />
      </div>
      <div class="mt-10 flex align-center" v-show="bindForm.device_type == 4">
        <span>mac编号：</span>
        <el-input class="flex1" v-model="bindForm.mac" placeholder="输入mac编号" @input="searchDevive" />
      </div>
      <div v-show="deviceList.length > 0">
        <el-table :data="deviceList">
          <el-table-column label="设备编号">
            <template slot-scope="scope">{{ scope.row.device_id || '--' }}</template>
          </el-table-column>
          <el-table-column label="mac编号">
            <template slot-scope="scope">{{ scope.row.mac || '--' }}</template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="small" plain round v-if="scope.row.bind_action != 0" @click="ejectEquip(scope.row)">绑定</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'checkDevice',
    components: {

    },
    data() {
      return {
        form: {},
        code_sn: '',
        bindDialog: false,
        bindForm: {
          device_type: 0
        },
        deviceList: []
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 搜索设备
       * @param {Object} e
       *
       */
      searchDevive(val){
        let params = {}
        if(this.bindForm.device_type == 4){
          params.mac = val
        } else {
          params.keywords = val
        }
        this.$get('SyServer/getDeviceList', params).then(res => {
          let list = []
          res.map(item => {
            if(!item.code_sn) list.push(item)
          })
          this.deviceList = list
        })
      },

      /**
       * 提交绑定设备
       */
      ejectEquip(row){
        this.$post('QRcode/edit_qrcode', {
          code_sn: this.data.code_sn,
          device_id: row.device_id
        }).then(res => {
          row.code_sn = ''
          this.$message({
            message: '绑定成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
