<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="设备类型:">
          <el-select v-model="form.depend_type" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in deviceKeyObj" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定状态:">
          <el-select v-model="form.bind_status" @change="toQuery()">
            <el-option label="未绑定" value="2" />
            <el-option label="已绑定" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="卡号:" class="hidden-sm-and-down">
          <el-input v-model="form.card_num" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-md-and-down">
          <el-input v-model="form.mobile" />
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-lg-and-down">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-xg-and-down">
          <el-input v-model="form.nick_name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '用户充值记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <el-form-item label="卡号:" class="hidden-md-and-up">
          <el-input v-model="form.card_num" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-lg-and-up">
          <el-input v-model="form.mobile" />
        </el-form-item>
        <el-form-item label="用户ID:" class="hidden-xg-and-up">
          <el-input v-model="form.uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-xl-only">
          <el-input v-model="form.nick_name" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe
          highlight-current-row>
          <el-table-column label="卡号">
            <template slot-scope="scope">
              {{ scope.row.nfc_card_num }}
            </template>
          </el-table-column>
          <el-table-column label="卡类型">
            <template slot-scope="scope">
              {{ deviceKeyObj[scope.row.depend_type] }}
            </template>
          </el-table-column>
          <el-table-column label="卡余额">
            <template slot-scope="scope">
              <span v-if="scope.row.bind_uid > 0">￥{{ scope.row.wash_balance }}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="卡赠送余额">
            <template slot-scope="scope">
              <span v-if="scope.row.bind_uid > 0">￥{{ scope.row.wash_gift_balance }}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="用户" width="200">
            <template slot-scope="scope">
              <div class="flex align-center text-cut" v-if="scope.row.bind_uid > 0">
                <el-avatar size="small" :src="scope.row.avatar"></el-avatar>
                <div class="ml-5 flex1">
                  <div class="text-cut">{{ scope.row.nick_name }}</div>
                  {{ scope.row.mobile }}
                </div>
              </div>
              <div v-else>未绑定</div>
            </template>
          </el-table-column>
          <el-table-column label="绑定时间">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updated, '{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain class="ml-0" @click="setCard(scope.row)">{{ scope.row.status == 1 ? '暂停此卡' : '启用此卡' }}</el-button>
              <template v-if="scope.row.bind_uid > 0">
                <el-button type="primary" size="mini" round plain class="ml-0" @click="recharge(scope.row, 0)">充值余额</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  export default {
    name: 'entityCard',
    components: {
      Pagination,
      drawer
    },
    computed: {
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      deviceKeyObj(){
        return this.$store.getters.deviceKeyObj
      }
    },
    data() {
      return {
        form: {},
        list: [],
        listLoading: true,
        listQuery: {
          start: 1,
          total: 10,
          page_num: 1
        }
      }
    },
    mounted(options) {
      this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        this.$refs.filterDrawer.hide()
        if (type == 1) {
          this.form = {}
          this.listQuery.start = 1
        } else {
          this.listQuery.start = 1
        }
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let listQuery = Object.assign({}, this.form, this.listQuery, {
            start: this.listQuery.start - 1
          })
        this.$get('agentapi/card/query_nfc', listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 充值
       */
      recharge(row, type = 1) {
        this.$prompt('请输入充值金额', type == 1 ? '余额充值' : '储值卡充值', {
          confirmButtonText: '确定充值',
          cancelButtonText: '取消',
          inputPlaceholder: '正数为加，负数为减',
          inputType: 'text',
          beforeClose: (action, instance, done) => {
            if (action == 'confirm') {
              this.loadObj = this.$loading({
                lock: true,
                text: '正在充值',
                spinner: 'el-icon-loading'
              })
              const value = instance.inputValue
              this.$post('agentapi/business/invest_user_accout', {
                uid: row.bind_uid,
                type: type,
                money: value
              }).then(res => {
                this.loadObj.close()
                this.$message({
                  message: '充值成功',
                  type: 'success'
                })
                this.toQuery()
                done()
              })
            } else {
              done()
            }
          }
        })
      },

      /**
       * 设置卡状态
       */
      setCard(row){
        let status = row.status == 1 ? 0 : 1
        this.loadObj = this.$loading({
          text: '提交中~~',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/card/save_nfc_info', {
          status: status,
          card_id: row.id
        }).then(res => {
          row.status = status
          this.loadObj.close()
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        }).catch(err => {
          this.loadObj.close()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
