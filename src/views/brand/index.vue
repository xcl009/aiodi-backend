<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-form-item label="品牌名">
          <el-input v-model="form.name" placeholder="品牌名"/>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="form.mobile" placeholder="手机号码"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select placeholder="状态" v-model="form.status" @change="toQuery()">
            <el-option label="有效" :value="1" />
            <el-option label="无效" :value="2" />
          </el-select>
        </el-form-item>
		  </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" @click="$router.push({path: `/brand/addBrand`})"><i class="el-icon-circle-plus-outline el-icon--left" />添加品牌</el-button>
      </template>
		</condition>

    <div class="pl-10 pr-10 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="品牌信息" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '品牌名' }}</div>
            <div v-if="scope.row.brandUser">{{ scope.row.brandUser.mobile || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="公司名称" min-width="160">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar shape="square" :size="35" fit="cover" :src="scope.row.logo"></el-avatar>
              <div class="pl-5 flex-sub">{{ scope.row.companyName || '--'}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="团长" width="100">
          <template slot-scope="scope">
            <div class="text-primary cursor" v-if="scope.row.isLeader == 1">团长</div>
            <div class="text-primary cursor" @click="setRow(3, scope.row)" v-else-if="scope.row.isLeader == 0 && scope.row.leaderBrandId == 0">设为团长</div>
            <div class="mb-5" v-else>{{ scope.row.leaderBrandName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="邀请人" min-width="130">
          <template slot-scope="scope">
            <div>{{ scope.row.fatherBrandName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="品类" width="200">
          <template slot-scope="scope">
            <div>
              <span class="mr-20 inline" v-for="item in scope.row.brandDeviceType">
                {{ item.name }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="设备数" min-width="100">
          <template slot-scope="scope">
            <div class="inline text-left" @click="$router.push({path: `/device?brandId=${scope.row.id}`})">
              <div>全部：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}</div>
              <div>已铺货：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].bindStoreNumber : '0' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单数" width="120">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div>微信：<el-link type="primary"
                  @click="$router.push({path: `/order?brandId=${scope.row.id}&sourceType=1`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].wx : 0 }}
                </el-link>
              </div>
              <div>支付宝：<el-link type="primary"
                  @click="$router.push({path: `/order?brandId=${scope.row.id}&sourceType=2`})">
                  {{ orderCount[scope.row.id] ? orderCount[scope.row.id].ali : 0 }}
                </el-link>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="下级总数" width="150">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div class="mb-5">直属下级：{{ scope.row.child_agent_num || 0}}</div>
              <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
            </div>
          </template>
        </el-table-column> -->
        <el-table-column label="交易额(元)" width="120">
          <template slot-scope="scope">
            {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?brandId=${scope.row.id}`})">订单列表</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/store?brandId=${scope.row.id}`})">商户列表</el-button>
              <el-button type="primary" size="mini" @click="toLogin(scope.row)">一键登录</el-button>
              <el-button type="primary" size="mini" @click.native="$router.push({path: `/market/appManage?brandId=${scope.row.id}`})">赠送服务</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/brand/addBrand?brandId=${scope.row.id}`})">修改信息</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini" class="" @click="">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="copyloginUrl(scope.row)">登录地址</el-dropdown-item>
                  <el-dropdown-item @click.native="$router.push({path: `/market?brandName=${scope.row.name}`})">购买服务记录</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(4, scope.row)">设备统计数量</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(5, scope.row)">代理层级缓存</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(6, scope.row)">租借中订单缓存</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(1, scope.row, scope.$index)" v-if="scope.row.status == 1">删除品牌</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(2, scope.row, scope.$index)" v-else>账号恢复</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listTotal > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="parseInt(listTotal)"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import upload from '@/components/upload/'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import { copyText } from '@/utils/index'
  import { getToken, setToken, removeToken } from '@/utils/auth'

  export default {
    name: 'agent',
    components: {
      upload,
      Pagination,
      condition
    },
    data() {
      return {
        clickSubmit: false,
        sort_type: [{
            name: '综合排序',
            value: 0
          },
          {
            name: '收益从高到低',
            value: 1
          },
          {
            name: '收益从低到高',
            value: 2
          },
          {
            name: '创建时间由近到远',
            value: 3
          },
          {
            name: '创建时间由远到近',
            value: 4
          }
        ],
        form: {},
        tableMaxH: '250',
        list: [],
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },
        orderCount: {},
        deviceCount: {}
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'addBrand') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.toQuery(1)
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      myDeviceId(){
        return this.$store.state.user.myDeviceId
      },
      agentInfo(){
        return this.$store.getters.agentInfo
      }
    },
    mounted() {

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
        this.form = {
          status: 1
        }
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
        this.$get('iot-saas-basic/admin/brand/findPage', params).then(res => {
          this.listLoading = false
          this.list = res.rows
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 95
          }
          this.queryOrderCount(this.arrayKeys(res.rows, 'id'))
          this.queryDeviceCount(this.arrayKeys(res.rows, 'id'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
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
          countType: 'BRAND',
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
          countType: 'BRAND',
          groupIds: ids.join(',')
        }).then(res => {
          this.deviceCount = res
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 删除品牌 2 账号恢复 3 设为团长 4 设备统计数量  5 代理层级缓存  6 租借订单数刷新
       * @param {Object} row
       * @param {Object} index
       */
      setRow(type, row, index) {
        switch (type) {
          case 1:
            this.$alert('确定删除此品牌吗？', '删除品牌', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$post('iot-saas-basic/admin/brand/updateStatusById', {
                    id: row.id,
                    status: 0
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
            break
          case 2:
            this.$alert('确定将账号恢复为正常吗？', '账号恢复', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$post('iot-saas-basic/admin/brand/updateStatusById', {
                    id: row.id,
                    status: 0
                  }).then(res => {
                    this.$message({
                      message: '恢复成功',
                      type: 'success'
                    })
                    this.list.splice(index, 1)
                  })
                }
              }
            })
            break
          case 3:
            this.$alert('确定将该品牌设置为团长吗？', '团长', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$post('iot-saas-basic/admin/brand/setLeader', {
                    brandId: row.id
                  }).then(res => {
                    this.$message({
                      message: '设置成功',
                      type: 'success'
                    })
                  })
                }
              }
            })
            break
          case 4:
            this.$alert('确定刷新该品牌设备数量统计信息吗？', '统计刷新', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$get('iot-saas-device/admin/device/count/init', {
                    brandId: row.id
                  }).then(res => {
                    this.$message({
                      message: '刷新成功',
                      type: 'success'
                    })
                  })
                }
              }
            })
            break
          case 5:
            this.$alert('确定刷新该品牌代理层级关系吗？', '层级刷新', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$get('iot-saas-basic/admin/agent/initAgentCache', {
                    brandId: row.id
                  }).then(res => {
                    this.$message({
                      message: '刷新成功',
                      type: 'success'
                    })
                  })
                }
              }
            })
            break
          case 6:
            this.$alert('确定刷新该品牌租借中订单数量统计吗？', '租借订单数量', {
              confirmButtonText: '确定',
              center: true,
              callback: action => {
                if (action == 'confirm') {
                  this.$get('iot-saas-order/admin/order/count/initRentingOrderCount', {
                    brandId: row.id
                  }).then(res => {
                    this.$message({
                      message: '刷新成功',
                      type: 'success'
                    })
                  })
                }
              }
            })
            break
        }
      },

      /**
       * 登录代理后台
       * @param {Object} row
       */
      toLogin(row){
        this.loadObj = this.$loading({
          lock: true,
          text: '正在登录',
          spinner: 'el-icon-loading'
        })
        this.$post('iot-saas-user/admin/login', {
          userType: 'brand',
          id: row.id
        }).then(res => {
          setToken(getToken(), 'token1')
          setToken(res.loginToken.accessToken)
          setTimeout(()=>{
            location.href = '/home'
            this.loadObj.close()
          }, 500)
        }).catch(err=>{
          this.loadObj.close()
        })
      },

      /**
       * 复制贴牌登录地址
       * @param {Object} row
       */
      copyloginUrl(row){
        copyText(`${location.origin}/login/${row.id}`)
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      }
	  },
  }
</script>

<style lang="scss" scoped>

</style>
