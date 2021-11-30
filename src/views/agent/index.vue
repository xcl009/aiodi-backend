<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
				<!-- <el-form-item label="代理类型:">
				  <el-select v-model="form.search_agent_level" @change="toQuery()">
				    <el-option v-for="itme in give_role" :label="itme.role_name" :value="''+itme.role_id" />
				  </el-select>
				</el-form-item> -->
				<el-form-item label="排序类型:">
				  <el-select v-model="form.sort" @change="toQuery()">
				    <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
				  </el-select>
				</el-form-item>
				<el-form-item label="代理姓名:">
				  <el-input v-model="form.name" />
				</el-form-item>
				<el-form-item label="手机号码:">
				  <el-input v-model="form.mobile" />
				</el-form-item>
				<!-- <el-form-item label="代理状态:">
				  <el-select v-model="form.activated_status" @change="toQuery()">
				    <el-option label="有效" :value="1" />
				    <el-option label="无效" :value="2" />
				    <el-option label="已删除" :value="0" />
				  </el-select>
				</el-form-item> -->
		  </template>
		</condition>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="品牌信息" width="130">
            <template slot-scope="scope">
              <div>{{ scope.row.name || '品牌名' }}</div>
              <div>{{ scope.row.phone || '手机号码' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="运营城市" width="120">
            <template slot-scope="scope">
              <div>{{ scope.row.charge_province || '广东'}}</div>
              <div>{{ scope.row.charge_city || '深圳' }}</div>
              <div>{{ scope.row.charge_county || '深圳' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="公司名称">
            <template slot-scope="scope">
              {{ scope.row.child_agent_num || '--'}}
            </template>
          </el-table-column>
          <el-table-column label="设备">
            <template slot-scope="scope">
              {{ scope.row.depend_type_name || '密码线' }}：{{ scope.row.goods_sum || '0' }}
            </template>
          </el-table-column>
          <el-table-column label="下级总数" width="150">
            <template slot-scope="scope">
              <div>直属下级：{{ scope.row.child_agent_num || 0}}</div>
              <div>间属下级：{{ scope.row.child_agent_num || 0}}</div>
            </template>
          </el-table-column>
          <el-table-column label="收益" width="200">
            <template slot-scope="scope">
              <div class="cursor">
                总收益：<span class="text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}元</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="190">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/store?son_id=${scope.row.id}`})">商户列表</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/order?son_id=${scope.row.id}`})">订单列表</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="toLogin(scope.row)" v-if="checkRoles(['terminal'])">一键登录</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="">权限设置</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="">功能设置</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="copyloginUrl(scope.row)">登录地址</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="getMapIcon(scope.row)">地图图标</el-button>
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
      </div>

      <el-dialog title="地图图标设置" :visible.sync="iconDialog">
        <el-form label-width="auto">
          <el-form-item :label="`${ index }(25*25)：`" v-for="(item, index) in deviceNameObj">
            <upload v-model="brand_icon[`device_url_${item}`]" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="iconDialog = false">取 消</el-button>
          <el-button type="primary" @click="editDtIcon()">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="设备绑定" :visible.sync="deviceBindDialog" width="600px">
        <el-input
          type="textarea"
          :rows="6"
          placeholder="设备编号与编号之间用英文逗号隔开" v-model="deviceBindStr">
        </el-input>
        <div class="pt-5">注：设备编号与编号之间用 , 隔开(英文逗号)。</div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="deviceBindDialog = false">取 消</el-button>
          <el-button type="primary" @click="distribu()">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="设备绑定结果" :visible.sync="deviceBindEndDialog" width="600px">
        <div class="mb-10 flex" v-for="item in bind_success">
          <div>{{ item.sn }}</div>
          <div class="flex1 pl-20">{{ item.msg }}</div>
        </div>
        <div class="mb-10 flex text-danger" v-for="item in bind_err">
          <div>{{ item.sn }}</div>
          <div class="flex1 pl-20">{{ item.msg }}</div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="deviceBindEndDialog = false">确 定</el-button>
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
    props: {
      user_type: {
        type: Number,
        default: 0
      }
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
        give_role: [],
        tableMaxH: '250',
        list: [
          {}
        ],
        deviceNum: {},
        listLoading: false,
        listQuery: {
          activated_status: 1,
          search_agent_id: '0',
          sort_type: '0',
          search_agent_level: '0',
          son_type: 0,
          page: 1,
          size: 20,
          count: 10
        },
        zuo_sn: '',
        selSnArr: [],

        // 提现费率
        withdrawObj: {},
        withdrawDialog: false,

        // 免费店员
        freeObj: {},
        freeDialog: false,

        iconDialog: false,
        brand_icon: {},

        select_aid: '',
        deviceBindStr: '',
        deviceBindDialog: false,
        deviceBindEndDialog: false,
        bind_success: [],
        bind_err: [],
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
      this.zuo_sn = this.$route.query.zuo_sn || ''
      if(this.$route.meta.reload){
        this.getList()
      }else if(!this.list || this.list.length == 0) {
        this.listQuery.son_type = this.user_type
        this.toQuery(1)
      }
    },
    computed: {
      deviceNameObj(){
        return this.$store.state.user.deviceNameObj
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      deviceKeyObj(){
        return this.$store.state.user.deviceKeyObj
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
        this.$get('brand/findPage', params).then(res => {
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
        this.$get('SyStatistics/getAgentDeviceNum', {
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
      toEdit(row, rows) {
        switch (row.type) {
          case 1:
            this.$router.push({
              name: 'agentEdit',
              params: {
                id: row.id
              }
            })
            break
          case 2:
            this.$prompt('请输入冻结金额', '设置冻结金额', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputValue: row.freez_money
            }).then(({
              value
            }) => {
              this.$post('agentapi/save_agent_freez_money', {
                son_id: row.id,
                freez_money: value
              }).then(res => {
                this.$message({
                  message: '设置成功',
                  type: 'success'
                })
                row.freez_money = value
              })
            })
            break
          case 3:
            this.$get('agentapi/edit_agent', {
              son_id: row.id
            }).then(res => {
              this.withdrawDialog = true
              this.withdrawObj = res.agent_info
            })
            break
          case 4:
            this.$alert('确定删除此代理吗？', '删除代理', {
              confirmButtonText: '确定',
              callback: action => {
                if (action == 'confirm') {
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
          case 6:
            this.$post('agentapi/sttuf/save_member_setting', {
              son_id: rows.id,
              member_num: rows.member_num,
              member_day_count: rows.member_day_count,
              member_free_due_hours: rows.member_free_due_hours
            }).then(res => {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
              this.freeDialog = false
            })
            break
          case 7:
            this.$prompt('请输入新提现密码', '重置提现密码', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'password',
              beforeClose: (action, instance, done) => {
                if (action == 'confirm') {
                  const value = instance.inputValue
                  this.$post('agentapi/edit_agent_password', {
                    son_id: row.id,
                    password: value,
                    type: 1
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
          case 8:
              this.$alert('确定恢复此代理吗？', '恢复代理', {
                confirmButtonText: '确定',
                callback: action => {
                  if (action == 'confirm') {
                    this.$post('agentapi/sttuf/update_active_status', {
                      son_id: row.id,
                      active_status: 1
                    }).then(res => {
                      this.$message({
                        message: '恢复成功',
                        type: 'success'
                      })
                      this.list.splice(row.index, 1)
                    })
                  }
                }
              })
              break
        }
      },

      /**
       * 分配设备
       */
      setEquip(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '正在分配',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/save_distribute_agent_devices', {
          son_id: row.id,
          goods_sn: this.zuo_sn.split(',')
        }).then(res => {
          res.bind_fail = res.bind_fail || []
          if(res.bind_fail.length == 0){
            this.loadObj.close()
            this.$message({
              message: '分配成功',
              type: 'success'
            })
            history.back()
          } else {
            this.loadObj.close()
            let str = res.bind_fail.toString()
            this.$alert('【' + str + '】等设备未分配成功，', '分配失败', {
            confirmButtonText: '确定',
              callback: action => {
                history.back()
              }
            })
          }
        }).catch(()=>{
          this.loadObj.close()
        })
      },

      /**
       * 设置提现费率
       */
      setWithdraw() {
        this.$post('agentapi/save_agent_withdraw_percent', {
          son_id: this.withdrawObj.id,
          withdraw_percent: this.withdrawObj.withdraw_percent,
          withdraw_fee: this.withdrawObj.withdraw_fee
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          this.withdrawDialog = false
        })
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
          for(var i in this.deviceNameObj){
            brand_icon[`device_url_${this.deviceNameObj[i]}`] = res[`device_url_${this.deviceNameObj[i]}`] || ''
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
      },

	      /**
	       * 铺货
	       */
	      distribu(row) {
	        let aid, zuo_sn
	        this.bind_err = []
	        this.bind_success = []
	        if(row){
	          aid = row.aid
	          zuo_sn = this.zuo_sn
	        }else{
	          aid = this.select_aid
	          zuo_sn = this.deviceBindStr
	        }
	        zuo_sn = zuo_sn.replace(/[ ]/g,"")
	        zuo_sn = zuo_sn.replace(/[\r\n]/g,"")
	        zuo_sn = zuo_sn.replace(/\ +/g,"")
	        if(!zuo_sn){
	          this.$message({
	            message: '错误的设备码',
	            type: 'error'
	          })
	          return
	        }
	        this.$alert('确定将设备绑定到该代理吗？', '设备铺货', {
	          confirmButtonText: '确定',
	          callback: action => {
	            if (action == 'confirm') {
	              zuo_sn = zuo_sn.split(',')
	              this.load = this.$message({
	                duration: 0,
	                iconClass: 'el-icon-loading',
	                message: '绑定中'
	              })
	              for (var i in zuo_sn) {
	                this.postBind(zuo_sn[i], aid, zuo_sn.length, i)
	              }
	            }
	          }
	        })
	      },

	      async postBind(sn, aid, len, i){
	        this.$post('agentapi/device/save_pickup_devices', {
	          goods_sn: sn,
	          son_id: aid
	        }).then((res) => {
	          this.bind_success.push({
	            sn: sn,
	            msg: '绑定成功'
	          })
	          if(i == len - 1){
	            this.bindEnd()
	          }
	        }).catch(err=>{
	          this.bind_err.push({
	            sn: sn,
	            msg: err.msg
	          })
	          if(i == len - 1){
	            this.bindEnd()
	          }
	        })
	      },

	      bindEnd(){
	        this.load.close()
	        this.deviceBindEndDialog = true
	        if(this.bind_err.length == 0){
	          this.deviceBindDialog = false
	        }
	      },
	    }
	  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #90c328;
  }

  /deep/ #list_table .el-button+.el-button {
    margin-left: 0;
  }
</style>
