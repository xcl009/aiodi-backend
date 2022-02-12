<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <!-- <el-select v-model="form.sort" @change="toQuery()" placeholder="综合排序">
          <el-option :label="item" :value="key" v-for="(item, key) in sort_type" />
        </el-select> -->
        <el-select v-model="form.isPuhuo" @change="toQuery()" placeholder="是否铺货">
          <el-option label="全部" value="2" />
          <el-option label="未铺货" value="0" />
          <el-option label="已铺货" value="1" />
        </el-select>
        <el-input v-model="form.name" placeholder="商户名称" />
        <el-input v-model="form.mobile" placeholder="手机号码" />
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/store/create`})"><i
            class="el-icon-plus el-icon--left" />添加商户</el-button>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" highlight-current-row element-loading-text="Loading"
        v-loading="listLoading" :max-height="tableMaxH" :data="list">
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
            <div>{{ userObj[scope.row.userId] ? userObj[scope.row.userId].nickname : '昵称' }}</div>
            <div>{{ userObj[scope.row.userId] ? userObj[scope.row.userId].mobile : '手机号码' }}</div>
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
            {{ scope.row.regionTag }}
          </template>
        </el-table-column>
        <el-table-column label="行业分类" align="center" width="90">
          <template slot-scope="scope">
            {{ scope.row.catId || '--' }}
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
        <el-table-column label="操作" align="center" width="190" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <template v-if="deviceId">
              <el-button type="primary" size="mini" @click="bindShop(scope.row)">铺货</el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 1, scope.$index)">设备绑定</el-button>
              <el-button type="primary" size="mini" @click="">添加分店</el-button>
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 2, scope.$index)">权限设置</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini">更多<i class="el-icon-arrow-down el-icon--right line-1"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="$router.push({path: `/store/edit/${scope.row.id}`})">编辑商户
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 3, scope.$index)">删除商户</el-dropdown-item>
                  <el-dropdown-item @click.native="$router.push({path: `/store?son_id=${scope.row.id}`})">更多应用
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-center">
        <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
          :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="454px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form">
          <el-input v-model="dform.introduce" placeholder="设备编号与编号之间用英文逗号隔开" type="textarea" :rows="5" />
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="text-center">
          <el-checkbox v-model="dform.check_order">查看订单</el-checkbox>
          <el-checkbox v-model="dform.withdraw_right">提现</el-checkbox>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <div class="text-center">
          <div class="text-black">确定删除此商户吗？</div>
          <div class="mt-10 pl-40 pr-40 text-danger text-left">注：若该商户下存在设备，则无法删除。需由该设备的归属商户去回收，无法跨级回收。</div>
        </div>
      </template>
      <div class="mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import qs from 'qs'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  export default {
    name: 'subShop',
    components: {
      Pagination,
      condition
    },
    props: {
      user_type: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        clickSubmit: false,
        catList: [],
        cityList: [],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        userObj: {},

        // 操作相关
        deviceId: '',

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '设备绑定',
          2: '商户权限设置',
          3: '删除商户'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
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
      let queryKey = ['deviceId', 'agentId'],
        query = this.$route.query
      for (var i in queryKey) {
        this[queryKey[i]] = query[queryKey[i]]
      }
      if (this.$route.meta.reload) {
        this.getList()
      } else if (this.urlQuery != this.$route.meta.urlQuery) {
        this.toQuery()
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
        if(this.agentId > 0) params.agentId = this.agentId
        this.$get('iot-saas-basic/admin/store/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
          this.getUserInfo(this.arrayKeys(res.rows, 'userId'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 获取用户信息
       */
      getUserInfo(uids = []){
        if(uids.length == 0){
          this.userObj = {}
          return
        }
        this.$post('iot-saas-user/admin/user/findByIds', {
          userIds: uids.join(',')
        }).then(res => {
          this.userObj = res
        })
      },

      /**
       * 获取商户类别
       */
      getCategory() {
        this.$get('iot-saas-basic/admin/store/category').then(res => {
          let list = {}
          res.map(item => {
            if(item.level == 1){
              list[item.catId] = {
                value: item.catId,
                label: item.catName,
                children: []
              }
            }else if(item.level == 2){
              list[item.parentId].children.push({
                value: item.catId,
                label: item.catName
              })
            }
          })
          this.catList = Object.values(list)
        })
      },

      /**
       * 获取区域
       */
      getCity() {
        this.$get('iot-saas-basic/admin/regions').then(res => {
          let list = {}
          res.map(item => {
            if(item.level == 1){
              list[item.tag] = {
                value: item.tag,
                label: item.title,
                children: {}
              }
            }else if(item.level == 2){
              let tag = item.tag.substring(0, 3)
              list[tag].children[item.tag] = {
                value: item.tag,
                label: item.title,
                children: []
              }
            }else if(item.level == 3){
              let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
              list[tag1].children[tag2].children.push({
                value: item.tag,
                label: item.title
              })
            }
          })
          list = Object.values(list)
          list.map(item => {
            if(JSON.stringify(item.children) == '{}'){
              item.children = []
            } else {
              item.children = Object.values(item.children)
            }
            return item
          })
          this.cityList = list
        })
      },

      /**
       * 铺货
       */
      bindShop(row) {
        let url = 'iot-saas-device/admin/device/singleDistribution', params = {
          storeId: row.id
        }
        let deviceIdArr = this.deviceId.split(',')
        if(deviceIdArr.length == 1){
          params.deviceId = this.deviceId
        } else {
          url = 'iot-saas-device/admin/device/bulkDistribution'
          params.ids = deviceIdArr
        }
        this.$post(url, params).then((res) => {
          this.$message({
            type: 'success',
            message: '铺货成功'
          })
          history.back()
        })
      },

      /**
       * 操作商户
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前商户
       * @param {Object} dialogType dialog内容显示类型 1: '设备绑定', 2: '商户权限设置', 3: '删除商户'
       * @param {Object} idx 当前商户所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
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
        switch (this.dialogType) {
          case 1:

            break
          case 2:

            break
          case 3:
            this.$post('agentapi/store/type_switch', params).then(res => {

            })
            break
        }
      },


      /**
       * 修改商户的部分
       */
      editShopPart(params) {
        this.$post('agentapi/store/type_switch', params).then(res => {
          this.$message({
            type: 'success',
            message: '设置成功'
          })
          this.rowObj = Object.assign(this.rowObj, params)
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }

  .text-cut_two {
    max-height: 66px;
    line-height: 22px;
    -webkit-line-clamp: 3;
    /*规定超过两行的部分截断*/
  }
</style>
