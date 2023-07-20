<template>
  <div class="p-5">
    <condition ref="condition" :clickSubmit="clickSubmit" :defaultShowLength="2" @reset="reset" @query="toQuery">
      <template v-slot:left>
        <div class="pl-10 max-w filter-btn_box white-space">
          <el-scrollbar>
            <el-button size="medium" :type="!listQuery.serviceTypeCode ? 'primary' : ''"
              :class="{'btn-body': listQuery.serviceTypeCode}"
              @click="listQuery.serviceTypeCode = ''; toQuery(2)">全部服务</el-button>
            <el-button size="medium" :type="listQuery.serviceTypeCode == item.code ? 'primary' : ''"
              :class="{'btn-body': listQuery.serviceTypeCode != item.code}" v-for="item in tabs"
              @click="listQuery.serviceTypeCode = item.code; toQuery(2)">{{ item.name }}</el-button>
          </el-scrollbar>
        </div>
      </template>
      <template v-slot:defult>
        <el-form-item label="设备类型">
          <el-select placeholder="设备类型" v-model="form.deviceTypeCode" @change="toQuery()">
            <el-option v-for="(item, code) in myDeviceId" :label="item" :value="code">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input v-model="form.serviceName" placeholder="服务名称" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/market/addApp`})"><i class="el-icon-circle-plus-outline el-icon--left" />添加服务</el-button>
      </template>
    </condition>

    <div class="load-box" v-infinite-scroll="loadPage">
      <el-row :gutter="10">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="item in list">
          <div class="p-10 list-item cursor bg-white shadow-light">
            <el-image
              class="list-img"
              :src="item.url"
              fit="cover"></el-image>
            <div class="mt-10 text-black fs-c1">
              {{ item.name }}
            </div>
            <div class="mt-10 fs-s2 text-cut_two">{{ item.brief }}</div>
            <div class="mt-15 flex align-center">
              <template v-for="(sitem, idx) in item.priceSettings">
                <div class="flex1" v-if="idx == 0">
                  <span class="fs-b3 text-danger">{{ sitem.monthAmount > 0 ? `¥${sitem.monthAmount}` : sitem.yearAmount > 0 ? `¥${sitem.yearAmount}` : `¥${sitem.permanentAmount}` }}</span>
                  <span class="text-grey">{{ sitem.monthAmount > 0 ? `/月付` : sitem.yearAmount > 0 ? `/年付` : `/永久` }}</span>
                </div>
              </template>
              <el-button type="primary" size="medium" @click="$router.push({path: `/market/addApp?id=${item.id}`})">立即修改</el-button>
              <el-button type="danger" @click="setRows(1, item, 1)" v-if="brandId">赠送服务</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="p-30 text-center bg-white" v-if="listTotal == 0">
      服务持续更新中，请持续关注服务市场
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <div class="flex justify-center">
          <el-form class="custom-form pl-20 pr-20" label-width="auto">
            <el-form-item label="套餐" v-if="curRow.priceSettings">
              <el-radio-group v-model="dform.priceCode">
                <el-radio-button :label="item.priceCode" v-for="(item, key) in curRow.priceSettings">{{ item.priceName }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="dform.giveEndDatetime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择结束时间">
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { arrayKeys, arrayToObj} from '@/utils/index'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'appList',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        tabs: [],
        form: {},
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 24
        },

        brandId: this.$route.query.brandId || '',

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '赠送服务'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    activated() {
      let queryKey = ['brandId'],
        query = this.$route.query
      for (var i in queryKey) {
        this[queryKey[i]] = query[queryKey[i]]
      }
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery()
      }
    },
    computed: {
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
    },
    mounted() {
      this.$store.dispatch('api/getServiceType').then(res => {
        this.tabs = res
      })
    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.list = []
        this.getList()
      },

      /**
       * 重置查询
       */
      reset(){
        this.form = {}
        this.listQuery.page = 1
        this.listQuery.size = 24
        this.list = []
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        if(params.serviceTypeCode == 0) delete params.serviceTypeCode
        this.$get('iot-saas-basic/admin/service/market/findPage', params).then((res = {}) => {
          this.list = this.list.concat(res.rows || [])
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total || 0
          }
          this.onLoadPage = false
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 加载更多
       */
      loadPage(){
        if((parseInt(this.listTotal) / this.listQuery.size) > this.listQuery.page && !this.onLoadPage){
          this.onLoadPage = true
          this.listQuery.page++
          this.getList()
        }
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '赠送服务'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 1){
              this.dform = {
                priceCode: row.priceSettings[0].priceCode,
                giveEndDatetime: this.parseTime(this.currentTime() + 30 * 86400, '{y}-{m}-{d}')
              }
            }
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            if(!params.giveEndDatetime){
              this.$message({
                message: '请选择赠送服务结束时间',
                type: 'error'
              })
              return
            }
            this.$post('iot-saas-basic/admin/service/market/give', {
              priceCode: params.priceCode,
              giveEndDatetime: params.giveEndDatetime + ' 23:59:59',
              serviceMarketId: this.curRow.id,
              brandId : this.brandId
            }).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-row{
    margin: 0 !important;
  }
  .list-item{
    margin-top: 10px;
    border-radius: 4px;
    .list-img{
      width: 44px;
      height: 44px;
      border-radius: 4px;
      border: thin solid #f5f5f5;
    }
    .text-cut_two{
      height: 48px;
      -webkit-line-clamp: 3;
      white-space: pre-line;
    }
  }
  .load-box{
    max-height: calc(100vh - 180px);
    overflow-y: scroll;
  }
</style>
