<template>
  <div>
    <div class="pl-20 pr-20 pb-10 bg-white">
      <el-tabs class="mb-10 fs-b2" v-model="deviceTypeCode" @tab-click="getList">
        <el-tab-pane :label="item.name" :name="item.deviceTypeCode" v-for="(item, name) in deviceType"/>
      </el-tabs>

      <template v-if="Ability[`${deviceTypeCode}_MEMBER_XF`] || Ability[`${deviceTypeCode}_MEMBER_DQ`]">
        <el-button class="mb-20" type="primary" @click="setRows(1, {ableState: 1, countCycle: 1}, 1)">添加会员卡</el-button>
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading">
          <el-table-column label="卡名称">
            <template slot-scope="scope">
              {{ scope.row.serviceName }}
            </template>
          </el-table-column>
          <el-table-column label="金额">
            <template slot-scope="scope">
              {{ scope.row.amount }}
            </template>
          </el-table-column>
          <el-table-column label="卡时长(天)">
            <template slot-scope="scope">
              {{ scope.row.availableDay }}
            </template>
          </el-table-column>
          <el-table-column label="计次周期(天)">
            <template slot-scope="scope">
              {{ scope.row.countCycle == scope.row.availableDay ? '--'  : scope.row.countCycle }}
            </template>
          </el-table-column>
          <el-table-column label="明细">
            <template slot-scope="scope">
              <div>
                {{ scope.row.cycleFreeTimes == cycleFreeTimes ? '不限次' : `免费次数：${scope.row.cycleFreeTimes}次`}}
              </div>
              <div>
                {{ scope.row.freeTime == 600000 ? '不限时长' : `单次免费：${scope.row.freeTime}分钟` }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="押金">
            <template slot-scope="scope">
              <div>{{ scope.row.depositAmount }}元</div>
              <div v-if="scope.row.depositAmount > 0">超{{ scope.row.overTime }}分钟不退</div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="setRows(1, scope.row, 1)">编辑</el-button>
              <el-button size="mini" type="danger" @click="setRows(2, scope.row, scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-click-modal="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" label-width="auto" ref="cardForm" :rules="cardRules" :model="dform">
          <el-form-item label="卡名称" ref="serviceName" prop="serviceName">
            <el-input v-model="dform.serviceName"></el-input>
          </el-form-item>
          <el-form-item label="卡金额" ref="amount" prop="amount">
            <el-input v-model="dform.amount">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="卡时长" ref="availableDay" prop="availableDay">
            <el-input v-model="dform.availableDay">
              <template slot="append">天</template>
            </el-input>
          </el-form-item>
          <el-form-item label="卡类型">
            <el-radio-group v-model="dform.cardType">
              <el-radio :label="item.val" v-for="(item, key) in CardType">{{ item.name }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="flex" v-if="dform.cardType == 2">
            <el-form-item label="每" ref="countCycle" prop="countCycle">
              <el-select v-model="dform.countCycle" @change="toQuery()">
                <el-option :label="item.name" :value="item.val" v-for="(item, key) in Cycle" />
              </el-select>
            </el-form-item>
            <el-form-item label="免费" ref="cycleFreeTimes" prop="cycleFreeTimes">
              <el-input v-model="dform.cycleFreeTimes">
                <template slot="append">次</template>
              </el-input>
            </el-form-item>
          </div>
          <el-form-item label="免费" ref="cycleFreeTimes" prop="cycleFreeTimes" v-else-if="dform.cardType == 1">
            <el-input v-model="dform.cycleFreeTimes">
              <template slot="append">次</template>
            </el-input>
          </el-form-item>
          <el-form-item label="时长类型">
            <el-radio-group v-model="dform.freeTimeType">
              <el-radio :label="item.val" v-for="(item, key) in freeTimeType">{{ item.name }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="单次免费时长" ref="freeTime" prop="freeTime" v-if="dform.freeTimeType == 1">
            <el-input v-model="dform.freeTime">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item label="卡押金">
            <el-input v-model="dform.depositAmount">
              <template slot="append">
                <el-popover
                  placement="top"
                  title="温馨提示"
                  width="250"
                  trigger="hover"
                  content="押金大于0时表示会员卡为押金模式,用户购买卡需缴纳押金,租借时无需缴纳押金">
                  <span slot="reference">元<i class="el-icon-question text-primary"></i></span>
                </el-popover>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="不退押金时长">
            <el-input v-model="dform.overTime">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item label="卡状态">
            <el-switch v-model="dform.ableState" :active-value="1" :inactive-value="2" />
          </el-form-item>
        </el-form>
      </template>
      <div class="pb-20 mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { arrayToObj } from "@/utils/index"
  export default {
    components: {

    },
    props: {
      type: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        userKey: this.$route.query.userKey || '',
        id: this.$route.query.id || 0,
        cycleFreeTimes: 999999,
        deviceType: [],
        deviceTypeCode: '',
        clickSubmit: false,
        listLoading: false,
        listTotal: 0,
        list: [],
        listQuery: {
          status: '',
          page: 1,
          size: 20
        },
        CardType: [{ name: '次卡', val: 1 },{ name: '周期卡', val: 2 },{ name: '无限次卡', val: 3 }],
        freeTimeType: [{ name: '限时长', val: 1 },{ name: '不限时长', val: 2 }],
        Cycle: [{ name: '天', val: 1 },{ name: '周', val: 7 },{ name: '月', val: 30 }],
        form: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '添加会员卡'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        cardRules: {
          serviceName: [{
            required: true,
            message: '请填写卡名称',
            trigger: 'blur'
          }],
          amount: [{
            required: true,
            message: '请填写卡金额',
            trigger: 'blur'
          }],
          availableDay: [{
            required: true,
            message: '请填写卡金额',
            trigger: 'blur'
          }],
          countCycle: [{
            required: true,
            message: '请填写计次周期',
            trigger: 'blur'
          }],
          cycleFreeTimes: [{
            required: true,
            message: '请填写免费次数',
            trigger: 'blur'
          }],
          freeTime: [{
            required: true,
            message: '请填写单次免费时长',
            trigger: 'blur'
          }]
        },
      }
    },
    computed: {
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {
      this.getDevice()
    },
    methods: {
      /**
       * 获取设备
       */
      getDevice() {
        let params = {}
        if(this.userKey && this.id) params[this.userKey] = this.id
        this.$get(`iot-saas-basic/admin/queryDeviceType`, params).then(res => {
          let deviceType = [], deviceTypeCode = ''
          res.map(item => {
            if(!item.fatherCode && (this.Ability[`${item.deviceTypeCode}_MEMBER_XF`] || this.Ability[`${item.deviceTypeCode}_MEMBER_DQ`])){
              deviceType.push(item)
              deviceTypeCode = deviceTypeCode || item.deviceTypeCode
            }
          })
          this.deviceType = deviceType
          this.deviceTypeCode = deviceTypeCode
          this.getList()
        })
      },

      /**
       * 获取卡列表
       */
      getList() {
        let params = {
          deviceTypeCode: this.deviceTypeCode,
          storeId: 0,
          agentId: 0
        }
        params[this.userKey] = this.id
        this.$get('iot-saas-basic/brand/goods/v1/admin/list', params).then(res => {
          if(res && res.length > 0){
            this.list = res
          }else{
            this.list.push({
              serviceName: '优惠月卡',
              amount: '9.9',
              availableDay: 30,
              countCycle: 30,
              cycleFreeTimes: 60,
              freeTime: 180,
              ableState: 1,
              storeId: 0,
              agentId: 0,
              freeTimeType: 1,
              overTime: 0,
              depositAmount: 0,
              deviceTypeCode: this.deviceTypeCode
            })
          }
        })
      },

      /**
       * 操作数据
       * @param {Object} type 1 dialog类型 2 删除
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '添加模板'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            if(dialogType == 1){
              let rows = JSON.parse(JSON.stringify(row))
              this.dform = {
                id: rows.id || '',
                serviceName: rows.serviceName,
                amount: rows.amount,
                availableDay: rows.availableDay,
                countCycle: rows.countCycle,
                cycleFreeTimes: rows.cycleFreeTimes,
                cardType: rows.cycleFreeTimes == this.cycleFreeTimes ? 3 : (((rows.availableDay == rows.countCycle) || (!rows.availableDay && rows.countCycle == 1)) ? 1 : 2),
                freeTime: rows.freeTime,
                freeTimeType: rows.freeTime == 600000 ? 2 : 1,
                overTime: rows.overTime,
                depositAmount: rows.depositAmount,
                ableState: rows.ableState,
                storeId: rows.storeId,
                agentId: rows.agentId,
                deviceTypeCode: rows.deviceTypeCode || this.deviceTypeCode
              }
            }else{
              this.dform = {}
            }
            this.dialogStatus = true
            break
          case 2:
            this.$confirm('确定删除此会员卡吗？', '删除会员卡', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$post(`iot-saas-basic/brand/goods/v1/delete`, {
                    id: row.id
                  }).then(res => {
                    this.$message({
                      message: '删除成功',
                      type: 'success'
                    })
                    this.list.splice(dialogType, 1)
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
      dialogConfim() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            this.$refs['cardForm'].validate((valid, object) => {
              if (valid) {
                params[this.userKey] = this.id
                if(params.cardType == 1){
                  params.countCycle = params.availableDay
                }else if(params.cardType == 3){
                  params.cycleFreeTimes = this.cycleFreeTimes
                  params.countCycle = params.availableDay
                }
                if(params.freeTimeType == 2){
                  params.freeTime = 600000
                }
                this.clickSubmit = false
                this.$post('iot-saas-basic/brand/goods/v1/save', params).then(res => {
                  this.$message({
                    message: '设置成功',
                    type: 'success'
                  })
                  this.dialogStatus = false
                  this.clickSubmit = false
                  this.getList()
                })
              } else {
                this.clickSubmit = false
              }
            })
            break
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-dialog__body {
    padding: 10px;
  }
</style>
