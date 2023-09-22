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
      <div class="flex align-center pt-15 mb-15 l-t">
        <div class="flex1 fs-c1 text-black">查询表格</div>
        <table-column-set storageKey="brandTableColumn" :showColumn.sync="showColumn" :defaultColumn="defaultColumn"></table-column-set>
      </div>

      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" :max-height="tableMaxH" element-loading-text="Loading">
        <template v-for="item in showColumn" v-if="item.val">
          <el-table-column label="品牌信息" width="150" v-if="item.key == 'name'">
            <template slot-scope="scope">
              <div class="mb-5 cursor" @click="copyText(scope.row.id)">{{ scope.row.name || '品牌名' }}</div>
              <el-tooltip class="item" effect="dark" :content="scope.row.brandUser.mobile" placement="top" v-if="scope.row.brandUser">
                <div>{{ dealPhone(scope.row.brandUser.mobile) }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="公司名称" min-width="160" v-else-if="item.key == 'companyName'">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar shape="square" :size="35" fit="cover" :src="scope.row.logo"></el-avatar>
                <div class="pl-5 flex-sub">{{ scope.row.companyName || '--'}}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="入驻时间" width="130" v-else-if="item.key == 'createTime'">
            <template slot-scope="scope">
              {{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}
            </template>
          </el-table-column>
          <el-table-column label="团长" width="100" v-else-if="item.key == 'isLeader'">
            <template slot-scope="scope">
              <div class="text-primary cursor" v-if="scope.row.isLeader == 1">团长</div>
              <div class="text-primary cursor" @click="setRow(3, scope.row)" v-else-if="scope.row.isLeader == 0 && scope.row.leaderBrandId == 0">设为团长</div>
              <div class="mb-5" v-else>{{ scope.row.leaderBrandName || '--' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="品类" width="200" v-else-if="item.key == 'brandDeviceType'">
            <template slot-scope="scope">
              <div>
                <span class="mr-20 inline" v-for="item in scope.row.brandDeviceType">
                  {{ item.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="设备数" min-width="100" v-else-if="item.key == 'deviceCount'">
            <template slot-scope="scope">
              <div class="inline text-left" @click="$router.push({path: `/device?brandId=${scope.row.id}`})">
                <div>全部：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].deviceNumber : '0' }}</div>
                <div>已铺货：{{ deviceCount[scope.row.id] ? deviceCount[scope.row.id].bindStoreNumber : '0' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="订单数" width="120" v-else-if="item.key == 'orderCount'">
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
          <el-table-column label="交易额(元)" width="120" v-else-if="item.key == 'amount'">
            <template slot-scope="scope">
              {{ orderCount[scope.row.id] ? orderCount[scope.row.id].amount : '0.00' }}
            </template>
          </el-table-column>
          <el-table-column :label="item.name" :prop="item.key" :width="item.width || 120" v-else></el-table-column>
        </template>
        <el-table-column label="操作" width="245" :fixed="device == 'desktop' ? 'right' : false">
          <template slot-scope="scope">
            <div class="flex flex-wrap">
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?brandId=${scope.row.id}`})">订单列表</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/store?brandId=${scope.row.id}`})">商户列表</el-button>
              <el-button type="primary" size="mini" @click="setRows(1, scope.row, 2)">合同管理</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/market/appManage?brandId=${scope.row.id}`})">赠送服务</el-button>
              <el-button type="primary" size="mini" @click="$router.push({path: `/brand/addBrand?brandId=${scope.row.id}`})">修改信息</el-button>
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini" class="" @click="">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="$router.push({path: `/market?brandName=${scope.row.name}`})">增值服务记录</el-dropdown-item>
                  <el-dropdown-item @click.native="toLogin(scope.row)">品牌管理</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 1)">VIP开通抵扣券</el-dropdown-item>
                  <el-dropdown-item @click.native="copyloginUrl(scope.row)">登录地址</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(4, scope.row)">设备统计数量</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(5, scope.row)">代理层级缓存</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(6, scope.row)">租借中订单缓存</el-dropdown-item>
                  <el-dropdown-item @click.native="setRows(1, scope.row, 3)">跳转小程序</el-dropdown-item>
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

    <el-drawer
      :title="dialogTitle[dialogType]"
      :visible.sync="drawerStatus"
      >
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item label="抵扣券金额">
            <el-input v-model="dform.amount">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="text-danger" style="width: 400px; max-width: 100%;">温馨提示：续费月度VIP可抵扣{{ dform.amount || 0 }}元，续费季度VIP可抵{{ (dform.amount || 0) * 3 }}元，开永久VIP无优惠。</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 2">
        <div class="flex flexv pl-20 pr-20 pb-20" style="width: 600px; height: 100%;">
          <upload uploadText="上传合同(PDF)" accept=".pdf,.PDF" :upObj="{fileType: 'pdfFile'}" @onSuccess="uploadPdf"/>
          <div class="mt-20 mb-15 text-black">合同信息</div>
          <div class="text-gray" v-if="!dform.pdfUrl">暂未上传合同</div>
          <div class="flex1">
            <iframe ref="pdfCotainer" :src="dform.pdfUrl" width="100%" height="100%" style="min-height: 600px;"></iframe>
          </div>
        </div>
      </template>
      <template v-if="dialogType == 3">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()" v-if="dform.jumpDetail && dform.jumpDetail.wx">
          <h4>微信</h4>
          <template v-for="item in curRow.brandDeviceType">
            <el-form-item :label="item.name">
              <el-input v-model="dform.jumpDetail.wx[`${item.code}`]" placeholder="跳转小程序appid"></el-input>
            </el-form-item>
          </template>
          <h4>支付宝</h4>
          <template v-for="item in curRow.brandDeviceType">
            <el-form-item :label="item.name">
              <el-input v-model="dform.jumpDetail.ali[`${item.code}`]" placeholder="跳转小程序appid"></el-input>
            </el-form-item>
          </template>
          <el-form-item>
            <div class="text-danger" style="width: 400px; max-width: 100%;">温馨提示：设置跳转小程序appid后，非该小程序扫码进入租借页会提示跳转到对应的小程序，小程序必须在系统内已绑定。</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="[1,3].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
  import upload from '@/components/upload'
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'
  import { copyText } from '@/utils/index'
  import { getToken, setToken, removeToken } from '@/utils/auth'
  import TableColumnSet from '@/components/TableColumnSet/index'

  export default {
    name: 'brand',
    components: {
      upload,
      TableColumnSet,
      Pagination,
      condition
    },
    data() {
      return {
        copyText: copyText,
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
        deviceCount: {},

        /**
         * 列的配置化对象，存储配置信息
         */
        showColumn: [],
        defaultColumn: [
          {
            key: 'name',
            val: true,
            name: '品牌信息'
          },
          {
            key: 'companyName',
            val: false,
            name: '公司名称'
          },
          {
            key: 'createTime',
            val: true,
            name: '入驻时间',
            width: 260
          },
          {
            key: 'isLeader',
            val: true,
            name: '团长'
          },
          {
            key: 'fatherBrandName',
            val: true,
            name: '邀请人'
          },
          {
            key: 'brandDeviceType',
            val: true,
            name: '品类'
          },
          {
            key: 'deviceCount',
            val: true,
            name: '设备数'
          },
          {
            key: 'orderCount',
            val: true,
            name: '订单数'
          },
          {
            key: 'amount',
            val: true,
            name: '交易额(元)'
          }
        ],

        // 弹出相关
        dialogType: 1,
        drawerStatus: false,
        dialogTitle: {
          1: '赠送抵扣券',
          2: '合同管理',
          3: '跳转小程序'
        },
        curRow: {},
        curIdx: 0,
        dform: {},
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
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前行
       * @param {Object} dialogType dialog内容显示类型 1: '赠送券' 2: '合同'
       * @param {Object} idx 当前行所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 2){
              this.$get('iot-saas-basic/admin/platform/getFileInfo', {
                bussinessId: row.id,
                type: 1
              }).then(res => {
                this.dform = {
                  pdfUrl: res.url
                }
              })
            }else if(dialogType == 1){
              this.$get('iot-saas-basic/admin/settings/find', {
                brandId: row.id,
                code: 'VIP_COUPON'
              }).then(res => {
                if(res && res.setting){
                  let coupon = JSON.parse(res.setting)
                  this.dform = {
                    amount: coupon.amount || 0
                  }
                }
              })
            }else if(dialogType == 3){
              this.$get('iot-saas-basic/admin/settings/find', {
                brandId: row.id,
                code: 'BRAND_JUMP_MINI'
              }).then(res => {
                if(res && res.setting){
                  let info = JSON.parse(res.setting)
                  console.log(info)
                  this.dform = {
                    jumpDetail: {
                      wx: JSON.parse(info.wx),
                      ali: JSON.parse(info.ali),
                    }
                  }
                }else{
                  this.dform = {
                    jumpDetail: {
                      wx: {},
                      ali: {}
                    }
                  }
                }
              })
            }
            this.drawerStatus = true
            break
        }
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
       * 弹窗确认
       */
      dialogConfirm(row = {}) {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            params.brandId = curRow.id
            this.$post('iot-saas-basic/admin/settings/saveCoupon', params).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.drawerStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
          case 3:
            params.brandId = curRow.id
            if(params.jumpDetail.wx) params.jumpDetail.wx = JSON.stringify(params.jumpDetail.wx)
            if(params.jumpDetail.ali) params.jumpDetail.ali = JSON.stringify(params.jumpDetail.ali)
            this.$post('iot-saas-basic/admin/settings/saveJump', params).then(res => {
              this.$message({
                message: '操作成功',
                type: 'success'
              })
              this.drawerStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
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
      },

      /**
       * 上传合同
       */
      uploadPdf(res){
        this.$post('iot-saas-basic/admin/platform/saveFileInfo', {
          type: 1,
          businessId: this.curRow.id,
          url: res.data.url
        }).then(ares => {
          this.dform = {
            pdfUrl: res.data.url
          }
          this.$message({
            message: '上传成功',
            type: 'success'
          })
        })
      }
	  },
  }
</script>

<style lang="scss" scoped>

</style>
