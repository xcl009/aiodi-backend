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
        <el-table-column label="在线状态">
          <template slot-scope="scope">{{ statusArr[scope.row.bao_status] || '已弹出' }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" plain round v-if="scope.row.bind_action != 0" @click="ejectEquip(scope.row)">弹出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
</div>
</template>

<script>
  export default {
    name: 'checkPopup',
    components: {

    },
    data() {
      return {
        statusArr: ['在槽','借出中','已借出','异常'],
        baoList: [],
        cangArr: [],
        type: this.$route.query.type || 1,
        goods_sn: this.$route.params.goods_sn || '0000152'
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
        this.$get('commonapi/tool/get_zuo_status', {
          goods_sn: this.goods_sn
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
        this.$post('commonapi/tool/factory_eject_baos', {
          zuo_sn: this.goods_sn,
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
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
