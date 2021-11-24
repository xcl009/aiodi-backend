<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="小程序" width="120">
          <template slot-scope="scope">
            {{ scope.row.source_miniprogram}}
          </template>
        </el-table-column>
        <el-table-column label="appid" width="180">
          <template slot-scope="scope">
            {{ scope.row.source_miniprogram_appid }}
          </template>
        </el-table-column>
        <el-table-column label="ID" width="80">
          <template slot-scope="scope">
            {{ scope.row.template_id }}
          </template>
        </el-table-column>
        <el-table-column label="版本号" width="80">
          <template slot-scope="scope">
            {{ scope.row.user_version || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template slot-scope="scope">
            {{ parseTime(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="上传者" width="100">
          <template slot-scope="scope">
            {{ scope.row.developer || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template slot-scope="scope">
            {{ scope.row.user_desc || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button class="mr-20" type="primary" size="mini" @click="delTemplate(scope.row, scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- <div class="p-20 flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :page-count="listQuery.page_num"
          @pagination="getList" />
      </div> -->
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'equipment',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        listLoading: true,
        listQuery: {
          type: 1,
          start: 1,
          total: 10,
          page_num: 1
        }
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      getList() {
        let url = 'WxOpen/getTemplateCodeList'
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res
          //this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 生成模板
       */
      delTemplate(row, index) {
        this.$alert('确定删除此模板代码？', '删除模板', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == "confirm") {
              this.$post('WxOpen/delTemplateCode', {
                template_id: row.template_id
              }).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                });
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
