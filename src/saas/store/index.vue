<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <el-select v-model="form.isPuhuo" @change="toQuery()" placeholder="是否铺货">
          <el-option label="全部" value="2" />
          <el-option label="未铺货" value="0" />
          <el-option label="已铺货" value="1" />
        </el-select>
        <el-input v-model="form.name" placeholder="商户名称" />
        <el-input v-model="form.mobile" placeholder="手机号码" />
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" highlight-current-row element-loading-text="Loading"
        v-loading="listLoading" :max-height="tableMaxH" :data="list">
        <el-table-column label="品牌商" align="center" width="120">
          <template slot-scope="scope">
            {{ oemInfo && oemInfo[scope.row.belong_aid] ? oemInfo[scope.row.belong_aid].mini_name : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="门头照" align="center" width="150">
          <template slot-scope="scope">
            <el-link @click="$router.push({path: `/shop/detail/${scope.row.id}`})">
              <el-avatar shape="square" :size="52" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"
                class="m-auto block"></el-avatar>
              <div class="mt-5">{{ scope.row.name || '--' }}</div>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="商户地址" align="center" width="180">
          <template slot-scope="scope">
            <div class="text-cut_two">{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <div class="inline">
              <div>交易额：{{ scope.row.order_amount || '0.00' }}</div>
              <div>总收益：{{ scope.row.order_amount || '0.00' }}</div>
              <div>可提现：{{ scope.row.order_amount || '0.00' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单量" align="center" width="150">
          <template slot-scope="scope">
            <div class="inline">
              <div>订单量：{{ scope.row.order_num || 0 }}</div>
              <div>设备数：{{ scope.row.order_num || 0 }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上级代理" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.order_num || '昵称' }}</div>
            <div>{{ scope.row.order_num || '手机号码'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="分润人" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.nickname || '' }}</div>
            <div>{{ scope.row.mobile }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分成比例" align="center">
          <template slot-scope="scope">
            <div class="mt-5">
              <div class="mb-5" v-for="(item, index) in scope.row.storeDivisionConfig" @click="$router.push({path: `/device?store_name=${scope.row.store_name}`})">
                {{ myDeviceId[item.deviceTypeId] }}：{{ item.live || '0' }}%({{ config.closeType[item.closeType] }})
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="城市区域" align="center" width="90">
          <template slot-scope="scope">
            {{ regionsObj[scope.row.regionTag] ? regionsObj[scope.row.regionTag].title : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="行业分类" align="center" width="90">
          <template slot-scope="scope">
             {{ cateObj[scope.row.catId] ? cateObj[scope.row.catId].title : '--' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="品类" align="center">
          <template slot-scope="scope">
            <el-tag class="cursor" :hit="true" size="medium" effect="plain"
              @click="$router.push({path: `/device?store_name=${scope.row.store_name}`})">
              {{ scope.row.depend_type_name || '密码线' }}&nbsp;&nbsp;{{ scope.row.goods_sum || '0' }}
            </el-tag>
          </template>
        </el-table-column> -->

        <!-- <el-table-column label="门头照" align="center" width="62">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="52" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"
              class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="商户名称" align="center" width="150">
          <template slot-scope="scope">
            <el-link @click="$router.push({path: `/shop/detail/${scope.row.id}`})" class="cursor">
              {{ scope.row.shopName || '--' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="商户地址" align="center" width="200">
          <template slot-scope="scope">
            <div class="text-cut_two">{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="城市区域" align="center" width="120">
          <template slot-scope="scope">
            {{ scope.row.regionTag || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="行业分类" align="center" width="120">
          <template slot-scope="scope">
            {{ scope.row.catId || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" align="center" width="90">
          <template slot-scope="scope">
            {{ scope.row.order_amount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="90">
          <template slot-scope="scope">
            <span class="text-blue cursor"
              @click="$router.push({path: `/money/income?son_id=${scope.row.aid}`})">{{ scope.row.profit || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可提现(元)" align="center" width="90">
          <template slot-scope="scope">
            <a>{{ scope.row.available_withdraw_money || '0.00' }}</a>
          </template>
        </el-table-column>
        <el-table-column label="订单量" align="center" width="90">
          <template slot-scope="scope">
            <el-tag class="cursor" :hit="true" size="medium" effect="plain"
              @click="$router.push({path: `/order?store_name=${scope.row.shopName}`})">
              {{ scope.row.order_num || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分成比例" align="center">
          <template slot-scope="scope">
            <template v-for="(item, index) in scope.row.storeDivisionFun">
              <el-tag class="cursor" :hit="true" size="medium" effect="plain"
                @click="$router.push({path: `/device?store_name=${scope.row.shopName}`})">
                {{ myDeviceId[item.deviceTypeId] }}：{{ scope.row.live || '0' }}%({{ config.closeType[item.closeType] }})
              </el-tag>
            </template>
          </template>
        </el-table-column> -->
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

        oemInfo: {},
        regionsObj: {},
        cateObj: {}
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
      let queryKey = [],
        query = this.$route.query
      for (var i in queryKey) {
        this[queryKey[i]] = query[queryKey[i]]
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
        this.$get('iot-saas-basic/admin/store/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
          this.getStoreRegions(this.arrayKeys(res.rows, 'regionTag'))
          this.getStoreCate(this.arrayKeys(res.rows, 'catId'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
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
          tags: tags
        }).then(res => {
          this.regionsObj = res
        })
      },

      /**
       * 根据区域标识数组获取区域名称
       */
      getStoreCate(tags){
        if(tags.length == 0){
          this.cateObj = {}
          return
        }
        this.$get('iot-saas-basic/admin/category/findNameByTags', {
          tags: tags
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
