<template>
  <div>
    <sticky :z-index="10">
      <div class="mb-10 pl-10 pt-10 pr-10 bg-white l-t shadow-light">
        <el-form ref="form" class="filter-from text-center" :inline="true" size="small">
          <el-form-item class="mb-10 flex1" label="用户昵称：">
            <el-input v-model="form.search_nick_name" />
          </el-form-item>
          <el-form-item class="mb-10 flex1" label="手机号码：">
            <el-input v-model="form.search_phone" />
          </el-form-item>
          <el-form-item>
            <el-tooltip effect="dark" :content="`最多可添加${agentInfo.member_num}名免费店员`" placement="top">
              <el-button type="primary" @click="toQuery()">查询用户添加<i class="el-icon-search el-icon--right" /></el-button>
            </el-tooltip>
          </el-form-item>
          <el-form-item v-if="searchStatus">
            <el-button type="infou" @click="toQuery(1)">取消<i class="el-icon-close el-icon--right" /></el-button>
          </el-form-item>
        </el-form>
      </div>
    </sticky>
    <div class="p-5">
      <div class="bg-white" v-if="searchStatus">
        <el-table
          :data="searchList"
          stripe
          highlight-current-row
        >
          <el-table-column label="用户ID">
            <template slot-scope="scope">
              <div class="flex align-center">
                {{ scope.row.uid }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.avatar" />
                <div class="flex1 pl-10">{{ scope.row.nick_name || "--" }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="手机号码">
            <template slot-scope="scope">
              {{ scope.row.mobile || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="注册时间">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="primary" plain round size="small" @click="addUser(scope.row)">添加</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bg-white" v-else>
        <el-table
          id="order_table"
          v-loading="listLoading"
          :data="list"
          element-loading-text="Loading"
          stripe
          highlight-current-row
        >
          <el-table-column label="用户">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.avatar" />
                <div class="flex1 pl-10">{{ scope.row.nick_name || "--" }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="手机号码">
            <template slot-scope="scope">
              {{ scope.row.mobile || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="注册时间">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}
            </template>
          </el-table-column>
          <el-table-column label="商户">
            <template slot-scope="scope">
              {{ scope.row.store_name || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="免费时长">
            <template slot-scope="scope">
              {{ scope.row.member_free_due_hours }}小时
            </template>
          </el-table-column>
          <el-table-column label="今日次数">
            <template slot-scope="scope">
              {{ scope.row.member_used_count }}/{{ scope.row.member_day_count }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" plain round size="small" @click="vipDialog = true; vipInfo = scope.row">时长次数</el-button>
              <el-button type="primary" plain round size="small" @click="delUser(scope.row, scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>

    <el-dialog title="设置时长次数" :visible.sync="vipDialog">
      <el-form label-width="140px">
        <el-form-item label="免费时长：">
          <el-input v-model="vipInfo.free_due_hours">
            <template slot="append">小时</template>
          </el-input>
          <div class="fs-s2 text-gray">注：免费时长不可超过{{agentInfo.member_free_due_hours}}小时。</div>
        </el-form-item>
        <el-form-item label="每天使用次数：">
          <el-input v-model="vipInfo.day_count">
            <template slot="append">次</template>
          </el-input>
          <div class="fs-s2 text-gray">注：每天使用次数不可超过{{ agentInfo.member_day_count }}次。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="setDayCount()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Sticky from '@/components/Sticky'
  import Pagination from '@/components/Pagination'
  export default {
    name: 'subShop',
    components: {
      Sticky,
      Pagination
    },
    data() {
      return {
        agentInfo: {},
        searchStatus: false,
        form: {},
        searchList: [],
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1,
          store_id: this.$route.query.store_id
        },

        vipDialog: false,
        vipInfo: {}
      }
    },
    mounted(){
      this.agentInfo = window.agentInfo
      this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if (type == 1) {
          this.form = {}
          this.searchStatus = false
        } else {
          if(!this.form.search_nick_name && !this.form.search_phone){
            this.$message.error('请输入昵称或手机号码进行搜索')
            return
          }
          this.searchStatus = true
          this.search()
        }
      },

      /**
       * 获取已添加的店员
       */
      getList() {
        const url = 'agentapi/store/get_store_members'
        const listQuery = Object.assign({}, this.listQuery, this.form, {
          start: this.listQuery.start - 1
        })
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 搜索用户
       */
      search() {
        this.$get('agentapi/search/query_users', this.form).then(res => {
          this.searchList = res.list
        })
      },

      /**
       * 删除免费店员
       */
      delUser(row, index){
        this.$alert('确定删除此店员吗？', '删除店员', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('agentapi/store/del_one_member', {
                store_id: this.listQuery.store_id,
                uid: row.id
              }).then(res => {
                this.$message({
                  message: '删除成功',
                  type: 'success'
                })
                this.list.splice(index, 1)
              })
            }
          }
        })
      },

      /**
       * 添加免费店员
       */
      addUser(row){
        this.$alert('确定添加此用户为免费店员吗？', '添加店员', {
          confirmButtonText: '确定',
          callback: action => {
            if (action == 'confirm') {
              this.$post('agentapi/store/add_store_members', {
                store_id: this.listQuery.store_id,
                uid: [row.id]
              }).then(res => {
                this.$message({
                  message: '添加成功',
                  type: 'success'
                })
                this.getList()
                this.form = {}
                this.searchStatus = false
              })
            }
          }
        })
      },

      /**
       * 设置单日使用次数
       */
      setDayCount(row){
        this.$post('agentapi/store/edit_members_day_count', {
          store_id: this.listQuery.store_id,
          uid: this.vipInfo.id,
          day_count: this.vipInfo.day_count,
          free_due_hours: this.vipInfo.free_due_hours
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.vipDialog = false
          this.vipInfo.member_day_count = this.vipInfo.day_count
          this.vipInfo.member_free_due_hours = this.vipInfo.free_due_hours
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
