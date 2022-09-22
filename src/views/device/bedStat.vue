<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-input v-model="form.deviceSn" placeholder="二维码" />
        <el-select v-model="form.duration" @change="toQuery()" placeholder="在线时长">
          <el-option label="全部" :value="null" />
          <el-option label="大于15分钟" :value="15" />
          <el-option label="大于30分钟" :value="30" />
          <el-option label="大于2小时" :value="120" />
          <el-option label="大于4小时" :value="240" />
          <el-option label="大于8小时" :value="480" />
          <el-option label="大于12小时" :value="720" />
        </el-select>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="设备sn">
          <template slot-scope="scope">
            {{ scope.row.deviceSn }}
          </template>
        </el-table-column>
        <el-table-column label="商户">
          <template slot-scope="scope">
            {{ scope.row.storeName }}
          </template>
        </el-table-column>
        <el-table-column label="上线时间">
          <template slot-scope="scope">
            {{ scope.row.onlineDatetime }}
          </template>
        </el-table-column>
        <el-table-column label="下线时间">
          <template slot-scope="scope">
            {{ scope.row.offlineDatetime }}
          </template>
        </el-table-column>
        <el-table-column label="在线时长">
          <template slot-scope="scope">
            {{ scope.row.onlineDuration }}
          </template>
        </el-table-column>
      </el-table>

      <div class="rel flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  import Pagination from '@/components/Pagination/'
  export default {
    name: 'bedStat',
    components: {
      condition,
      Pagination,
    },
    computed: {
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          storeId: this.$route.query.id || '',
          page: 1,
          size: 20
        },
        form: {
          deviceSn: this.$route.query.deviceSn || '',
        }
      }
    },
    mounted(options) {
      this.toQuery()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('iot-saas-device/massageBed/statistics/findPage', params).then((res = {}) => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
          }
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
