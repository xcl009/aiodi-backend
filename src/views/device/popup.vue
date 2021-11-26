<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <div class="mb-20 flex align-center" v-if="type == 1">
        <el-button size="small" type="primary" @click="ejectEquip()">全部弹出</el-button>
      </div>
      <el-table :data="baoList">
        <el-table-column label="卡槽位置" property="cang_num"></el-table-column>
        <el-table-column label="电池编号">
          <template slot-scope="scope">{{ scope.row.bao_sn || '--' }}</template>
        </el-table-column>
        <el-table-column label="电池电量">
          <template slot-scope="scope">{{ scope.row.electricity ? scope.row.electricity + '%' : '--' }}</template>
        </el-table-column>
        <el-table-column label="弹出次数">
          <template slot-scope="scope">{{ scope.row.used_num || '--' }}</template>
        </el-table-column>
        <el-table-column label="在线状态">
          <template slot-scope="scope">{{ statusArr[scope.row.bao_status] || '已弹出' }}</template>
        </el-table-column>
        <el-table-column label="异常信息">
          <template slot-scope="scope">
            <div v-if="scope.row.wire_status">{{ scope.row.wire_status }}</div>
            <div v-if="scope.row.battery_status">{{ scope.row.battery_status }}</div>
            <div v-if="scope.row.last_fail_detail">{{ scope.row.last_fail_detail }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div v-if="type == 1">
              <el-button type="primary" size="small" plain round v-if="scope.row.bind_action != 0" @click="ejectEquip(scope.row)">弹出</el-button>
              <el-button type="danger" size="small" plain round v-else>非本人不可弹出</el-button>
              <el-button :type="scope.row.is_locked == 1 ? 'danger' : 'warning'" size="small" plain round v-if="scope.row.bao_sn && scope.row.bind_action != 0" @click="locked(scope.row)">{{ scope.row.is_locked == 1 ? '解锁' : '锁定' }}</el-button>
            </div>
            <div v-if="type == 2">
              <el-button :type="scope.row.binded_status == 1 ? 'primary' : 'danger'" size="small" plain round v-if="scope.row.bao_sn && scope.row.bind_action == 1" @click="binded(scope.row)">{{ scope.row.binded_status == 1 ? '解绑' : '绑定' }}</el-button>
              <el-button type="danger" size="small" plain round v-else>非本人设备</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
</div>
</template>

<script>
  export default {
    name: 'popup',
    components: {

    },
    data() {
      return {
        statusArr: ['在槽','借出中','已借出','异常'],
        baoList: [],
        cangArr: [],
        type: this.$route.query.type || 1
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 获取设备信息
       */
      getList(){
        this.$get('agentapi/get_zuo_status', {
          goods_sn: this.$route.params.goods_sn
        }).then(res => {
          let baoList = []
          res.map((pitem, pidx)=>{
            pitem.betterys.map(item=>{
              //item.cang_num = item.cang_num + (pidx * pitem.identifier)
              baoList.push(item)
            })
          })
          this.baoList = baoList
        })
      },

      /**
       * 弹出设备
       */
      ejectEquip(row){
        let cang_num = []
        if(row){
          cang_num.push(row.cang_num)
        } else {
          for (var i in this.baoList) {
            if (this.baoList[i].bind_action == 1) {
              cang_num.push(this.baoList[i].cang_num);
            }
          }
        }
        if (cang_num.length == 0){
          this.$message({
            message: '暂无可弹出的设备',
            type: 'error'
          })
          return
        }
        this.loadObj = this.$loading({
          lock: true,
          text: '弹出中~~~',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/eject_baos', {
          zuo_sn: this.$route.params.goods_sn,
          cang_num: cang_num
        }).then(res => {
          this.loadObj.close()
          this.$message({
            message: '弹出成功',
            type: 'success'
          })
          setTimeout(()=>{
            this.getList()
          }, 1000)
        }).catch(err=>{
          this.loadObj.close()
        })
      },

      /**
       * 设备锁定 或  解锁
       */
      locked(row){
        let agree = row.is_locked == 1 ? 0 : 1
        this.$post('agentapi/device/lock_rent', {
          goods_sn: row.zuo_sn,
          bao_id: row.bao_id,
          agree: agree
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.is_locked = agree
        })
      },

      /**
       * 绑定 或  解绑
       */
      binded(row){
        let binded_status = row.binded_status == 1 ? 0 : 1
        this.$post('agentapi/device/bind_bao', {
          zuo_sn: row.zuo_sn,
          bao_sn: row.bao_sn,
          binded_status: binded_status
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.binded_status = binded_status
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
