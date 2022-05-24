<template>
  <div>
    <div class="p-5 bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item label="广告位置">
            <el-select v-model="form.position" placeholder="广告位置" @change="toQuery()">
              <el-option :label="item.title" :value="item.position" v-for="(item, index) in positionList" />
            </el-select>
          </el-form-item>
        </template>
        <template v-slot:endButton>
          <router-link :to="`/advert/posterEdit?pid=${pid}`">
            <el-button type="primary" size="small">添加广告</el-button>
          </router-link>
        </template>
      </condition>

      <div class="p-10">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="图片" align="center">
            <template slot-scope="scope">
              <el-image
                class="flex"
                style="height: 80px;"
                :src="scope.row.img_url"
                :preview-src-list="[scope.row.img_url]"
                fit="contain"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="名称" align="center">
            <template slot-scope="scope">
              {{ scope.row.ad_name }}
            </template>
          </el-table-column>
          <el-table-column label="时间" align="center">
            <template slot-scope="scope">
              <div>{{ parseTime(scope.row.start_date, '{y}-{m}-{d} {h}:{i}') }}<el-link type="primary">起</el-link></div>
              <div>{{ parseTime(scope.row.end_date, '{y}-{m}-{d} {h}:{i}') }}<el-link type="danger">止</el-link></div>
            </template>
          </el-table-column>
          <el-table-column label="拓展方式" align="center">
            <template slot-scope="scope">
              {{ scope.row.jump_type == 1 ? '拓展长图' : '跳转广告' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="$router.push({path: `/advert/posterEdit?pid=${pid}&id=${scope.row.id}`})">编辑</el-button>
              <el-button type="danger" size="mini" @click="del(scope.row, scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'adList',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        statusObj: {
          0: '未审核', 1: '审核中', 2: '审核通过', 3: '审核不通过'
        },
        pid: this.$route.query.pid || '',
        name: this.$route.query.name || '',
        positionList: [],
        list: [],
        listLoading: true,
        form: {}
      }
    },
    mounted() {
      this.toQuery()
      this.getPositions()
    },
    methods: {
      /**
       * 获取广告位
       */
      getPositions() {
        this.$get(`iot-saas-advert/admin/ad/ordinary/type/${this.pid}/positions`).then(res => {
          this.positionList = res
        })
      },

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
        let params = Object.assign({}, this.form)
        this.$get(`iot-saas-advert/admin/ad/${this.pid}/ordinary/list`, params).then(res => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 删除广告
       */
      del(row, index){
        this.$alert('确定删除此广告吗？', '删除广告', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$delete(`iot-saas-advert/admin/ad/${row.id}`).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
                this.list.splice(index, 1)
              })
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
