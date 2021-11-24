<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="用户来源:">
          <el-select v-model="listQuery.search_user_type" @change="toQuery()">
            <el-option label="全部" value="2" />
            <el-option label="微信" value="0" />
            <el-option label="支付宝" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID:">
          <el-input v-model="form.search_uid" />
        </el-form-item>
        <el-form-item label="用户昵称:" class="hidden-sm-and-down">
          <el-input v-model="form.search_nick_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-lg-and-down">
          <el-input v-model="form.search_phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="toQuery()">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" @click="$router.push({path: `/userManage/portrait`})" v-if="checkRoles(['partner'])">用户画像</el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <sel-plat v-if="checkRoles(['terminal'])" :listQuery="listQuery" @change="toQuery()"></sel-plat>
        <el-form-item label="用户昵称:" class="hidden-md-and-up">
          <el-input v-model="form.search_nick_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-xg-and-up">
          <el-input v-model="form.search_phone" />
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="order_table" ref="order_table" v-loading="listLoading" :data="list" :max-height="tableMaxH"
          element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="品牌商" v-if="checkRoles(['terminal'])">
            <template slot-scope="scope">
              {{ oemInfo[scope.row.agent_id] ? oemInfo[scope.row.agent_id].mini_name : '' }}
            </template>
          </el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <el-avatar :size="40" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="昵称" width="200">
            <template slot-scope="scope">
              <el-link class="cursor">【{{ scope.row.id }}】{{ scope.row.nick_name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="手机号码">
            <template slot-scope="scope">
              <div v-if="checkRoles(config.system_other.have_role)">{{ scope.row.mobile }}</div>
              <div v-else>{{ dealPhone(scope.row.mobile) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="来源">
            <template slot-scope="scope">
              {{ scope.row.user_type == 0 ? '微信' : '支付宝' }}
            </template>
          </el-table-column>
          <el-table-column label="已交押金" v-if="checkRoles(['terminal', 'partner'])">
            <template slot-scope="scope">
              {{ scope.row.money || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="租借次数">
            <template slot-scope="scope">
              {{ scope.row.used_num }}
            </template>
          </el-table-column>
          <el-table-column label="消费总金额" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              ￥{{ scope.row.paid_amount }}
            </template>
          </el-table-column>
          <el-table-column label="钱包余额" v-if="checkRoles(['terminal', 'partner'])">
            <template slot-scope="scope">
              ￥{{ scope.row.balance }}
            </template>
          </el-table-column>
          <el-table-column label="储值卡余额" v-if="checkRoles(['terminal', 'partner'])">
            <template slot-scope="scope">
              ￥{{ scope.row.wash_balance }}
            </template>
          </el-table-column>
          <el-table-column label="储值卡赠额" width="120" v-if="checkRoles(['terminal', 'partner'])">
            <template slot-scope="scope">
              ￥{{ scope.row.wash_gift_balance }}
            </template>
          </el-table-column>
          <el-table-column label="注册日期" width="180">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" v-if="checkRoles(['terminal', 'partner'])">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/userManage/user_order?search_uid=${scope.row.id}`})" v-if="agentInfo.virtual_divide == 0 && agentInfo.check_order > 0">订单记录</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="memberDialog = true; memberObj.uid = scope.row.id" v-if="checkRoles(['partner'])">设置会员</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="recharge(scope.row, 1)" v-if="checkRoles(['partner'])">余额充值</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="recharge(scope.row, 0)" v-if="checkRoles(['partner'])">储值卡充值</el-button>
              <!-- <el-button type="primary" plain round size="small" @click="setBlack(scope.row)">黑名单</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num" @pagination="getList" />
        </div>
      </div>
    </div>

    <el-dialog title="设置会员" :visible.sync="memberDialog">
      <el-form label-width="140px">
        <el-form-item label="会员资格：">
          <el-switch v-model="memberObj.status" :active-value="1" :inactive-value="0"/>
        </el-form-item>
        <el-form-item label="设备类型：">
          <el-radio-group v-model="memberObj.depend_type">
            <el-radio-button :label="key" :disabled="key != 3" v-for="(item, key) in deviceKeyObj">{{ item }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="会员类型：">
          <el-radio-group v-model="memberObj.date_type">
            <el-radio-button :label="item.value" v-for="item in config.cardObj">{{ item.name }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商户ID：">
          <el-input v-model="memberObj.store_id"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="memberDialog = false">取 消</el-button>
        <el-button type="primary" @click="setUserMember()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import selPlat from '@/components/selPlat'
  import drawer from '@/components/filterDrawer/filter'
  import {
    dealPhone
  } from '@/utils/index'
  export default {
    name: 'userList',
    components: {
      Pagination,
      selPlat,
      drawer
    },
    computed: {
      deviceKeyObj(){
        return this.$store.state.user.deviceKeyObj
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    data() {
      return {
        dealPhone: dealPhone,
        form: {},
        tableMaxH: '250',
        oemInfo: {},
        list: [],
        listLoading: true,
        listQuery: {
          search_agent_id: '0',
          search_user_type: '2',
          start: 1,
          total: 10,
          page_num: 1,
          limit: 20
        },
        memberDialog: false,
        memberObj: {
          status: 1,
          depend_type: 3,
          date_type: 0
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
          }),
          url = 'agentapi/search/query_users'
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          if (listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.order_table.$el.offsetTop - 80
          if(this.checkRoles(['terminal'])) this.getOEMInfo(this.arrayKeys(res.list, 'agent_id'))
        }).catch(() => {
          this.listLoading = false
        })
      },
      
      /**
       * 品牌信息
       */
      getOEMInfo(aids = []) {
        this.$get('commonapi/configer/these_platform_info', {
          son_aids: JSON.stringify(aids)
        }).then(res => {
          this.oemInfo = res.list
        })
      },

      /**
       * 拉黑 或 移除黑名单
       */
      setBlack(row) {
        row.black_status = row.black_status == 1 ? 0 : 1
        this.$get('agentapi/business/manual_finish_order', {
          uid: row.id,
          black_status: row.black_status
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
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
                uid: row.id,
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
       * 设置会员
       */
      setUserMember(){
        let params = this.memberObj
        this.loadObj = this.$loading({
          lock: true,
          text: '提交中~~',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/card/save_user_member_card_info', params).then(res => {
          this.loadObj.close()
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.memberDialog = false
        }).catch(err => {
          this.loadObj.close()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
