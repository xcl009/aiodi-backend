<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select placeholder="用户来源" v-model="listQuery.search_user_type" @change="toQuery()">
          <el-option label="全部" value="2" />
          <el-option label="微信" value="0" />
          <el-option label="支付宝" value="1" />
        </el-select>
        <el-input placeholder="用户ID" v-model="form.search_uid" />
        <el-input placeholder="用户昵称" v-model="form.search_nick_name" />
        <el-input placeholder="手机号码" v-model="form.search_phone" />
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" border
        element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="品牌商" align="center" width="120">
          <template slot-scope="scope">
            {{ oemInfo[scope.row.agent_id] ? oemInfo[scope.row.agent_id].mini_name : '品牌名' }}
          </template>
        </el-table-column>
        <el-table-column label="头像" align="center" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="昵称" align="center" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nick_name || '无昵称' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="手机号码" align="center">
          <template slot-scope="scope">
            <div v-if="checkRoles(config.system_other.have_role)">{{ scope.row.mobile || '--' }}</div>
            <div v-else>{{ dealPhone(scope.row.mobile) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="来源" align="center">
          <template slot-scope="scope">
            {{ scope.row.user_type == 0 ? '微信' : '支付宝' }}
          </template>
        </el-table-column>
        <el-table-column label="已交押金" align="center" v-if="checkRoles(config.system_other.have_role)">
          <template slot-scope="scope">
            {{ scope.row.money || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="租借次数" align="center">
          <template slot-scope="scope">
            {{ scope.row.used_num || '0' }}
          </template>
        </el-table-column>
        <el-table-column label="消费总金额" align="center">
          <template slot-scope="scope">
            {{ scope.row.paid_amount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="钱包余额" align="center" ><!-- v-if="checkRoles(config.system_other.have_role)" -->
          <template slot-scope="scope">
            {{ scope.row.balance || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="注册日期" align="center" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" class="ml-0" @click="$router.push({path: `/userManage/user_order?search_uid=${scope.row.id}`})">订单记录</el-button>
            <!-- <el-button type="primary" size="mini" class="ml-0" @click="recharge(scope.row, 1)" v-if="checkRoles(['partner'])">余额充值</el-button>
            <el-button type="primary" size="mini" class="ml-0" @click="recharge(scope.row, 0)" v-if="checkRoles(['partner'])">储值卡充值</el-button>
            <el-button type="primary" plain round size="small" @click="setBlack(scope.row)">黑名单</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit"
          :page-count="listQuery.page_num" @pagination="getList" />
      </div>
    </div>

    <el-dialog title="设置会员" :visible.sync="memberDialog">
      <el-form label-width="140px">
        <el-form-item label="会员资格：">
          <el-switch v-model="memberObj.status" :active-value="1" :inactive-value="0"/>
        </el-form-item>
        <el-form-item label="设备类型：">
          <el-radio-group v-model="memberObj.depend_type">
            <el-radio-button :label="key" :disabled="key != 3" v-for="(item, key) in myDeviceId">{{ item }}</el-radio-button>
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
  import condition from '@/components/condition/'
  import {
    dealPhone
  } from '@/utils/index'
  export default {
    name: 'userManage',
    components: {
      Pagination,
      condition
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
        dealPhone: dealPhone,
        tableMaxH: '250',
        clickSubmit: false,
        form: {},
        oemInfo: {},
        list: [{}],
        listLoading: false,
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
      //this.getList()
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        this.$get('open/user/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.list
          this.clickSubmit = false
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
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
