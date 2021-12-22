<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <!-- <el-select placeholder="排序" v-model="form.sort" @change="toQuery()">
          <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
        </el-select> -->
        <el-input v-model="form.name" placeholder="品牌名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
        <!-- <el-select placeholder="状态" v-model="form.activated_status" @change="toQuery()">
          <el-option label="有效" :value="1" />
          <el-option label="无效" :value="2" />
          <el-option label="已删除" :value="0" />
        </el-select> -->
		  </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/partner/edit`})"><i class="el-icon-circle-plus-outline el-icon--left" />添加品牌</el-button>
      </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="品牌信息" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '品牌名' }}</div>
            <div>{{ scope.row.phone || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="运营城市" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.areaId || '深圳' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="公司名称" align="center">
          <template slot-scope="scope">
            {{ scope.row.companyName || '--'}}
          </template>
        </el-table-column>
        <el-table-column label="团长" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '品牌名' }}</div>
            <div>{{ scope.row.phone || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="邀请人" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '品牌名' }}</div>
            <div>{{ scope.row.phone || '手机号码' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="品类" align="center">
          <template slot-scope="scope">
            <div class="inline text-left">
              <el-tag
                class="cursor"
                :hit="true"
                size="medium"
                effect="plain"
                @click="$router.push({path: `/device?store_name=${scope.row.store_name}`})">
                {{ scope.row.depend_type_name || '密码线' }}&nbsp;&nbsp;{{ scope.row.goods_sum || '0' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下级总数" align="center" width="150">
          <template slot-scope="scope">
            <div class="inline text-left">
              <div class="mb-5">直属下级：{{ scope.row.child_agent_num || 0}}</div>
              <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="190">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="$router.push({path: `/order?son_id=${scope.row.id}`})">订单列表</el-button>
            <el-button type="primary" size="mini" @click="">功能设置</el-button>
            <el-button type="primary" size="mini" @click="toLogin(scope.row)">一键登录</el-button>
            <el-dropdown trigger="click">
              <el-button type="primary" size="mini" class="" @click="">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="$router.push({path: `/partner/edit?aid=${scope.row.id}`})">修改信息</el-dropdown-item>
                <el-dropdown-item @click.native="$router.push({path: `/store?son_id=${scope.row.id}`})">商户列表</el-dropdown-item>
                <el-dropdown-item @click.native="getMapIcon(scope.row)">地图图标</el-dropdown-item>
                <el-dropdown-item @click.native="copyloginUrl(scope.row)">登录地址</el-dropdown-item>
                <el-dropdown-item @click.native="setRow(1, scope.row, scope.$index)" v-if="form.activated_status == 1">删除品牌</el-dropdown-item>
                <el-dropdown-item @click.native="setRow(2, scope.row, scope.$index)" v-if="form.activated_status != 1">账号恢复</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.count > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :total="listQuery.count"
          @pagination="getList"
        />
      </div>

      <el-dialog title="地图图标设置" :visible.sync="iconDialog">
        <el-form label-width="auto">
          <el-form-item :label="`${ index }(25*25)：`" v-for="(item, index) in myDeviceName">
            <upload v-model="brand_icon[`device_url_${item}`]" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="iconDialog = false">取 消</el-button>
          <el-button type="primary" @click="editDtIcon()">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import upload from '@/components/upload/two'
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
        form: {
          activated_status: 1
        },
        tableMaxH: '250',
        list: [],
        listLoading: false,
        listQuery: {
          sort_type: '0',
          page: 1,
          size: 20,
          count: 10
        },
        deviceNum: {},

        iconDialog: false,
        brand_icon: {},
      }
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == "agentEdit") {
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
          activated_status: 1
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
          this.list = res.list
          this.clickSubmit = false
          if(params.page == 1){
            this.count = res.count
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 获取设备数量
       */
      getDeviceNum(agent_ids){
        this.$get('SyStatistics/getmyDeviceNum', {
          agent_ids: JSON.stringify(agent_ids)
        }).then(res => {
          this.clickSubmit = false
          this.deviceNum = res
        }).catch(() => {
          this.clickSubmit = false
        })
      },

      /**
       * 编辑
       */
      set(row) {

      },

      /**
       * 编辑
       * @param {Object} row
       */
      setRow(type, row) {
        switch (type) {
          case 1:
            this.$alert('确定删除此品牌吗？', '删除品牌', {
              confirmButtonText: '确定',
              callback: action => {
                if (action == 'confirm') {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  })
                  this.list.splice(row.index, 1)
                  return
                  this.$post('agentapi/delete_agent', {
                    son_id: row.id
                  }).then(res => {
                    this.$message({
                      message: '删除成功',
                      type: 'success'
                    })
                    this.list.splice(row.index, 1)
                  })
                }
              }
            })
            break
          case 2:
            this.$alert('确定将账号恢复为正常吗？', '账号恢复', {
              confirmButtonText: '确定',
              callback: action => {
                if (action == 'confirm') {
                  this.$message({
                    message: '恢复成功',
                    type: 'success'
                  })
                  this.list.splice(row.index, 1)
                  return
                  this.$post('agentapi/delete_agent', {
                    son_id: row.id
                  }).then(res => {
                    this.$message({
                      message: '删除成功',
                      type: 'success'
                    })
                    this.list.splice(row.index, 1)
                  })
                }
              }
            })
            break
          case 5:
            this.$prompt('请输入新登录密码', '重置登录密码', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'password',
              beforeClose: (action, instance, done) => {
                if (action == 'confirm') {
                  const value = instance.inputValue
                  this.$post('agentapi/edit_agent_password', {
                    son_id: row.id,
                    password: value
                  }).then(res => {
                    this.$message({
                      message: '设置成功',
                      type: 'success'
                    })
                    done()
                  })
                } else {
                  done()
                }
              }
            })
            break
        }
      },

      /**
       * 获取地图图标
       */
      getMapIcon(row){
        let brand_icon = {}
        this.freeObj = row
        this.$get('agentapi/system/brand_icon', {
          platform_id: this.freeObj.aid
        }).then(res => {
          for(var i in this.myDeviceName){
            brand_icon[`device_url_${this.myDeviceName[i]}`] = res[`device_url_${this.myDeviceName[i]}`] || ''
          }
          this.brand_icon = brand_icon
          this.iconDialog = true
        })
      },

      /**
       * 修改地图图标
       */
      editDtIcon() {
        let params = this.brand_icon
        params.platform_id = this.freeObj.aid
        this.$post('agentapi/system/brand_icon', params).then(res => {
          this.iconDialog = false
          this.$message({
            message: '设置成功',
            type: 'success'
          })
        })
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
        this.$post('agentapi/pretend_son_login', {
          son_id: row.id
        }).then(res => {
          setToken(getToken(), 'token1')
          setToken(res.token)
          setToken(res.belong_partner_aid, 'agent_id')
          setToken(row.id, 'user_id')
          setTimeout(()=>{
            location.href = '/home'
            this.loadObj.close()
          }, 500)
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
