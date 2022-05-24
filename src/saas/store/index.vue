<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select v-model="form.haveDevice" @change="toQuery()" placeholder="是否铺货">
          <el-option label="全部" :value="null" />
          <el-option label="已铺货" value="1" />
          <el-option label="未铺货" value="2" />
        </el-select>
        <el-input v-model="form.name" placeholder="商户名称" />
        <el-input v-model="form.mobile" placeholder="手机号码" />
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" highlight-current-row element-loading-text="Loading"
        v-loading="listLoading" :max-height="tableMaxH" :data="list">
        <el-table-column label="品牌商" width="120">
          <template slot-scope="scope">
            <div>{{ brandUser[scope.row.brandId] ? brandUser[scope.row.brandId].name : '--' }}</div>
            <div>{{ brandUser[scope.row.brandId] ? brandUser[scope.row.brandId].mobile : '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="门头照" width="70">
          <template slot-scope="scope">
            <el-link>
              <el-avatar class="block" shape="square" :size="50" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"></el-avatar>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="商户" width="180">
          <template slot-scope="scope">
            <div>{{ scope.row.name || '--' }}</div>
            <div class="mt-5">{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" width="150">
          <template slot-scope="scope">
            <div class="inline">
              <div>交易额：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}</div>
              <div>总收益：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].amountDivide : '0.00' }}</div>
              <div>可提现：{{ cashStat[scope.row.id] ? cashStat[scope.row.id].balance : '0.00' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单量" width="150">
          <template slot-scope="scope">
            <div class="inline">
              <div>订单量：{{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx +  orderCount[scope.row.id].ali : 0 }}</div>
              <div class="cursor" @click="$router.push({path: `/device?storeId=${scope.row.id}`})">设备数：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上级代理" width="120">
          <template slot-scope="scope">
            <div>{{ supUser[scope.row.userId] ? supUser[scope.row.userId].name : '' }}</div>
            <div>{{ supUser[scope.row.userId] ? dealPhone(supUser[scope.row.userId].mobile) : '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分润人" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.user.nickname || '' }}</div>
            <div>{{ scope.row.user.mobile || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分成比例">
          <template slot-scope="scope">
            <div class="mt-5">
              <div class="mb-5 cursor" v-for="(item, index) in scope.row.storeDivisionConfig" @click="$router.push({path: `/device?storeId=${scope.row.id}`})">
                {{ myDeviceId[item.deviceTypeCode] }}：{{ item.live || '0' }}%({{ config.closeType[item.closeType] }})
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="城市区域" width="90">
          <template slot-scope="scope">
            {{ regionsObj[scope.row.regionTag] ? regionsObj[scope.row.regionTag].title : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="行业分类" width="90">
          <template slot-scope="scope">
            {{ cateObj[scope.row.catId] ? cateObj[scope.row.catId].catName : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="85">
          <template slot-scope="scope">
            {{ scope.row.createTime }}
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import {
    getToken,
    setToken
  } from '@/utils/auth'
  export default {
    name: 'subShop',
    components: {
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        orderCount: {},
        cashStat: {},
        deviceCount: {},
        supUser: {},
        brandUser: {},
        regionsObj: {},
        cateObj: {},
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      }
    },
    beforeRouteEnter(to, from, next) {
      to.meta.urlQuery = JSON.stringify(to.query)
      if (from.name == 'shopCreate') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      let query = this.$route.query
      this.queryKey = ['deviceId', 'agentId', 'brandId']
      for (var i in this.queryKey) {
        this[this.queryKey[i]] = query[this.queryKey[i]]
      }
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery(2)
      }
      this.urlQuery = this.$route.meta.urlQuery
    },
    mounted() {

    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.listQuery.page = 1
        this.listQuery.size = 20
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        if (this.clickSubmit) return
        this.clickSubmit = true
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
        for(var i in this.queryKey){
          if(this[this.queryKey[i]]){
            params[this.queryKey[i]] = this[this.queryKey[i]]
          }
        }
        this.$get('iot-saas-basic/admin/store/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
          this.queryCash(this.arrayKeys(res.rows, 'id'))
          this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
          this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
          this.getSubBrand(this.arrayKeys(res.rows, 'brandId'))
          this.getSupUser(this.arrayKeys(res.rows, 'userId'))
          this.getStoreRegions(this.arrayKeys(res.rows, 'regionTag'))
          this.getStoreCate(this.arrayKeys(res.rows, 'catId'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 获取可提现金额
       */
      queryCash(ids){
        if(ids.length == 0){
          this.cashStat = {}
          return
        }
        this.$get('iot-saas-pay/api/pay/acount/list', {
          accountType: 2,
          ownerIds: ids.join(',')
        }).then(res => {
          this.cashStat = res
        })
      },

      /**
       * 订单数量统计查询
       */
      queryOrderCount(ids){
        if(ids.length == 0){
          this.orderCount = {}
          return
        }
        this.$get('iot-saas-order/admin/order/count/queryGroupCount', {
          countType: 'STORE',
          groupIds: ids.join(',')
        }).then(res => {
          this.orderCount = res
        })
      },

      /**
       * 设备数量统计查询
       */
      queryDeviceCount(ids){
        if(ids.length == 0){
          this.deviceCount = {}
          return
        }
        this.$get('iot-saas-device/admin/device/count/queryGroupCount', {
          countType: 'STORE',
          groupIds: ids.join(',')
        }).then(res => {
          this.deviceCount = res
        })
      },

      /**
       * 获取上级代理
       */
      getSupUser(uids){
        if(uids == 0){
          this.supUser = {}
          return
        }
        this.$get('iot-saas-basic/admin/agent/queryByStoreUserId', {
          storeUserIds: uids.join(',')
        }).then(res => {
          this.supUser = res
        })
      },

      /**
       * 获取所属品牌
       */
      getSubBrand(uids){
        if(uids == 0){
          this.brandUser = {}
          return
        }
        this.$get('iot-saas-basic/admin/brand/findInfoByIds', {
          brandIds: uids.join(',')
        }).then(res => {
          this.brandUser = res
        })
      },

      /**
       * 根据区域标识数组获取区域名称
       */
      getStoreRegions(tags){
        if(tags.length == 0){
          this.regionsObj = {}
          return
        }
        this.$get('iot-saas-basic/admin/regions/findNameByTags', {
          tags: tags.join(',')
        }).then(res => {
          this.regionsObj = res
        })
      },

      /**
       * 根据区域标识数组获取区域名称
       */
      getStoreCate(catId){
        if(catId.length == 0){
          this.cateObj = {}
          return
        }
        this.$get('iot-saas-basic/admin/store/findNameByCatIds', {
          catId: catId.join(',')
        }).then(res => {
          this.cateObj = res
        })
      },

      /**
       * 获取商户类别
       */
      getCategory() {
        this.$get('agentapi/store/store_cat_list').then(res => {
          for (var i in res) {
            const obj = {
              value: res[i].cat_id,
              label: res[i].cat_name,
              children: [{
                value: 0,
                label: '全部'
              }]
            }
            if (res[i].son_cat_list.length > 0) {
              for (var s in res[i].son_cat_list) {
                const child = res[i].son_cat_list[s]
                obj.children.push({
                  value: child.cat_id,
                  label: child.cat_name
                })
              }
            }
            this.categoryList.push(obj)
          }
        })
      },

      /**
       * 获取区域
       */
      getArea() {
        const res = area,
          areaObj = {}
        for (var i in res) {
          const firstLevel = res[i]
          const obj = {
            value: firstLevel.tag,
            label: firstLevel.title,
            children: []
          }
          areaObj[firstLevel.tag] = {
            title: firstLevel.title
          }
          if (firstLevel.son_list.length > 0) {
            const secondLevel = firstLevel.son_list
            for (var s in secondLevel) {
              const secondItem = secondLevel[s]
              obj.children.push({
                value: secondItem.tag,
                label: secondItem.title,
                children: []
              })
              areaObj[secondItem.tag] = {
                title: secondItem.title
              }
              if (secondItem.son_list.length > 0) {
                const thirdLevel = secondItem.son_list
                for (var t in thirdLevel) {
                  const thirdItem = thirdLevel[t]
                  obj.children[s].children.push({
                    value: thirdItem.tag,
                    label: thirdItem.title
                  })
                  areaObj[thirdItem.tag] = {
                    title: thirdItem.title
                  }
                }
              } else {
                obj.children = undefined
              }
            }
          } else {
            obj.children = undefined
          }
          this.areaList.push(obj)
        }
        this.areaObj = areaObj
      }
    }
  }
</script>

<style lang="scss" scoped>
  .text-cut_two {
    max-height: 66px;
    line-height: 22px;
    -webkit-line-clamp: 3;
    /*规定超过两行的部分截断*/
  }
</style>
