<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:tabs>
        <el-tabs class="mb-10 fs-b2 bg-white" v-model="listQuery.deviceTypeCode" @tab-click="toQuery">
          <el-tab-pane :label="item" :name="name" v-for="(item, name) in deviceTab" />
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-input placeholder="用户昵称" v-model="form.nickname" />
        <el-input placeholder="手机号码" v-model="form.mobile" />
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="setRows(1, {}, 1)"><i class="el-icon-plus el-icon--left" />添加</el-button>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-15 bg-white">
      <el-table class="custom" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="头像" width="60">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="昵称" width="160">
          <template slot-scope="scope">
            <el-link class="cursor">{{ scope.row.nickname || '无昵称' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="手机号码">
          <template slot-scope="scope">
            <div>{{ dealPhone(scope.row.mobile) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="来源">
          <template slot-scope="scope">
            {{ scope.row.userType == 'wechat' ? '微信' : '支付宝' }}
          </template>
        </el-table-column>
        <el-table-column label="添加时间" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.registeredTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
        <el-table-column label="免费时长">
          <template slot-scope="scope">
            {{ parseInt(scope.row.freeTime) / 60 }}小时
          </template>
        </el-table-column>
        <el-table-column label="今日次数">
          <template slot-scope="scope">
            {{ scope.row.haveUseTimes }}/{{ scope.row.freeTimes }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" class="ml-0" @click="setRows(1, scope.row, 2)">时长次数</el-button>
            <el-button type="danger" size="mini" class="ml-0" @click="setRows(2, scope.row, 1, scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false" width="700px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="flex align-center">
          <el-input placeholder="用户昵称" v-model="dform.nickname" class="flex-sub" @keyup.enter.native="searchUser"/>
          <el-input placeholder="手机号码" v-model="dform.mobile" class="flex-sub ml-15 mr-15" @keyup.enter.native="searchUser"/>
          <el-button type="primary" @click="searchUser">查找用户</el-button>
        </div>

        <el-table class="mt-30 custom" :data="userList" empty-text="未查询到用户，请更换条件" stripe highlight-current-row v-if="userList.length > 0 || searchStatus">
          <el-table-column label="头像" width="60">
            <template slot-scope="scope">
              <el-avatar shape="square" :size="35" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="昵称" width="120">
            <template slot-scope="scope">
              <el-link class="cursor">{{ scope.row.nickname || '无昵称' }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="手机号码">
            <template slot-scope="scope">
              <div>{{ dealPhone(scope.row.mobile) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="来源">
            <template slot-scope="scope">
              {{ scope.row.userType == 'wechat' ? '微信' : '支付宝' }}
            </template>
          </el-table-column>
          <el-table-column label="注册时间" width="90">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" class="ml-0" @click="curRow = scope.row; dialogConfirm()">添加</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="dialogType == 2">
        <el-form class="custom-form pl-20 pr-20" label-width="100px" label-position="left">
          <el-form-item label="免费时长">
            <el-input v-model="dform.freeTime">
              <span slot="append">小时</span>
            </el-input>
          </el-form-item>
          <el-form-item label="每天使用次数">
            <el-input v-model="dform.freeTimes">
              <span slot="append">次</span>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm" :disabled="clickSubmit" v-if="dialogType != 1">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import {
    dealPhone
  } from '@/utils/index'
  export default {
    name: 'freeQuota',
    components: {
      condition,
      selectSearch
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
        clickSubmit: false,
        deviceTab: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listQuery: {
          storeId: this.$route.query.id,
          deviceTypeCode: ''
        },
        form: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '添加免费会员',
          2: '修改会员时长'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        userList: [],
        searchStatus: false
      }
    },
    mounted(options) {
      let deviceTab = {}
      for(var i in this.myDeviceId){
        if(this.checkAbility([`${i}_FREEQUOTA`], 3)){
          deviceTab[i] = this.myDeviceId[i]
        }
      }
      this.listQuery.deviceTypeCode = Object.keys(deviceTab)[0]
      this.deviceTab = deviceTab
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
        var params = Object.assign({}, this.form, this.listQuery)
        this.$get('iot-saas-order/admin/free/quota/user/list', params).then(res => {
          this.list = res
          this.listLoading = false
          this.clickSubmit = false
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 120
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 搜索用户
       */
      searchUser() {
        var params = {
          nickname: this.dform.nickname,
          mobile: this.dform.mobile,
          page: 0,
          size: 5
        }
        if(!params.nickname && !params.mobile){
          this.$message({
            message: '请输入搜索条件',
            type: 'error'
          })
          return
        }
        this.$get('iot-saas-user/api/user/query', params).then(res => {
          this.userList = res.rows
          this.searchStatus = true
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前商户
       * @param {Object} dialogType dialog内容显示类型 1: '添加免费用户', 2: ''
       * @param {Object} idx 当前商户所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 2){
              this.dform = {
                freeTime: parseInt(row.freeTime) / 60,
                freeTimes: row.freeTimes,
                userId: row.userId
              }
            }
            this.dialogStatus = true
            break
          case 2:
            this.$alert('确定删除该免费用户吗？', '删除用户', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  let params = JSON.parse(JSON.stringify(this.listQuery))
                  params.userId = row.userId
                  this.$post('iot-saas-order/admin/free/quota/user/delete', params).then(res => {
                    this.dialogStatus = false
                    this.$message({
                      message: '删除成功',
                      type: 'success'
                    })
                    this.list.splice(idx, 1)
                    this.clickSubmit = false
                  })
                }
              }
            })
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1:
            params = JSON.parse(JSON.stringify(this.listQuery))
            params.userId = curRow.id
            this.$post('iot-saas-order/admin/free/quota/user/add', params).then(res => {
              this.$message({
                type: 'success',
                message: '添加成功'
              })
              this.getList()
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
          break
          case 2:
            params = Object.assign({}, params, this.listQuery)
            params.freeTime = parseFloat(params.freeTime) * 60
            this.$post('iot-saas-order/admin/free/quota/user/update', params).then(res => {
              this.$message({
                type: 'success',
                message: '修改成功'
              })
              curRow.freeTime = params.freeTime
              curRow.freeTimes = params.freeTimes
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
          break
        }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>
