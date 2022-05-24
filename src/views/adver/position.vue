<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="标识">
          <template slot-scope="scope">
            <div>{{ scope.row.code }}</div>
          </template>
        </el-table-column>
        <el-table-column label="名称">
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="权限">
          <template slot-scope="scope">
            {{ scope.row.has_access == 1 ? "已获得" : "未获得" }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="son_id && scope.row.has_access == 1">
              <el-button type="primary" size="mini" round plain @click="setPer(scope.row)">{{ scope.row.son_has == 0 ? '开通' : '已开通' }}</el-button>
            </template>
            <template v-else-if="scope.row.has_access == 1">
             <router-link :to="`/advert/photo?pid=${scope.row.position_id}`">
               <el-button type="primary" size="mini" round plain>查看</el-button>
             </router-link>
             <router-link :to="`/advert/edit?pid=${scope.row.position_id}`">
               <el-button type="primary" size="mini" round plain>添加</el-button>
             </router-link>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'adPosition',
    components: {

    },
    data() {
      return {
        list: [],
        listLoading: true,
        son_id: ''
      }
    },
    mounted() {
      this.son_id = this.$route.query.son_id || ''
      this.getList()
    },
    methods: {
      getList() {
        let url = 'agentapi/son_ad_auths'
        this.$get(url, {
          son_id: this.son_id
        }).then(res => {
          this.listLoading = false
          this.list = res
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 设置子级广告权限
       */
      setPer(row){
        let agree = row.son_has == 1 ? 0 : 1
        this.$post('agentapi/switch_ad_position', {
          son_id: this.son_id,
          position_id: row.position_id,
          agree: agree
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.son_has = agree
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
