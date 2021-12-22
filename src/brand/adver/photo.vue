<template>
  <div class="p-5">
    <div class="bg-white">
      <div class="p-5">
        <router-link :to="`/adver/edit?pid=${listQuery.position_id}`" v-if="listQuery.position_id">
          <el-button type="primary" size="small" icon="el-icon-plus">添加</el-button>
        </router-link>
      </div>
      <el-table class="ptd-5" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="ID" width="80">
          <template slot-scope="scope">
            <div>{{ scope.row.id }}</div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="120">
          <template slot-scope="scope">
            <el-image
                  style="width: 100px; height: 100px"
                  :src="scope.row.img_url"
                  :preview-src-list="[scope.row.img_url]"
                  fit="cover"></el-image>
          </template>
        </el-table-column>
        <el-table-column label="名称" width="160">
          <template slot-scope="scope">
            {{ scope.row.ad_name }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160">
          <template slot-scope="scope">
            <div>{{ parseTime(scope.row.start_date, '{y}-{m}-{d} {h}:{i}') }}<el-link type="primary">起</el-link></div>
            <div>{{ parseTime(scope.row.end_date, '{y}-{m}-{d} {h}:{i}') }}<el-link type="danger">止</el-link></div>
          </template>
        </el-table-column>
        <el-table-column label="定向地址">
          <template slot-scope="scope">
            <el-link type="primary" :href="scope.row.ad_link">{{ scope.row.ad_link }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="投放类型">
          <template slot-scope="scope">
            {{ scope.row.is_all == 1 ? '全部投放' : '指定设备投放' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="160">
          <template slot-scope="scope">
            <div>{{ statusObj[scope.row.review_status] }}</div>
            <div v-if="scope.row.review_status == 3">失败原因：{{ scope.row.refuse_reason }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round plain @click="setShow(scope.row)" v-if="scope.row.review_status == 2">{{ scope.row.is_show == 1 ? '已显示' : '未显示' }}</el-button>
            <el-button type="primary" size="mini" round plain @click="setReview(scope.row)" v-else-if="scope.row.review_status == 0 || scope.row.review_status == 3">提交审核</el-button>
            <el-button type="primary" size="mini" round plain @click="$router.push({path: `/equipment/index?ad_id=${scope.row.id}&all=1`})" v-if="scope.row.is_all == 0">绑定设备</el-button>
            <p></p>
            <el-button type="primary" size="mini" round plain @click="$router.push({path: `/adver/edit/?id=${scope.row.id}`})">编辑</el-button>
            <!-- <el-button type="danger" size="mini" round plain>删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num"
@pagination="getList"/>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'photo',
    components: {
      Pagination
    },
    data() {
      return {
        statusObj: {
          0: '未审核', 1: '审核中', 2: '审核通过', 3: '审核不通过'
        },
        list: [],
        listLoading: true,
        listQuery: {
          position_id: '',
          type: 1,
          start: 1,
          total: 10,
          page_num: 1
        }
      }
    },
    mounted() {
      this.listQuery.position_id = parseInt(this.$route.query.pid) || 1
      this.getList()
    },
    methods: {
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        }), url = 'agentapi/ad_list'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 设置是否显示
       */
      setShow(row){
        let is_show = row.is_show == 1 ? 0 : 1
        this.$post('agentapi/ad/is_show_switch', {
          id: row.id,
          agree: is_show
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.is_show = is_show
        })
      },

      /**
       * 提交审核
       */
      setReview(row){
        this.$post('agentapi/ad/ad_tobe_audited', {
          id: row.id,
          agree: 1
        }).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          row.review_status = 1
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
