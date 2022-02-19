<template>
  <div>
		<condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
		  <template v-slot:defult>
        <el-input v-model="form.name" placeholder="代理名"/>
        <el-input v-model="form.mobile" placeholder="手机号码"/>
		  </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/agent/create`})"><i class="el-icon-plus el-icon--left" />添加代理</el-button>
      </template>
		</condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        :max-height="tableMaxH">
        <el-table-column label="代理信息" align="center" width="130">
          <template slot-scope="scope">
            <div class="mb-5">{{ scope.row.name || '姓名' }}</div>
            <div>{{ scope.row.mobile || '手机号码' }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="运营城市" align="center" width="120">
          <template slot-scope="scope">
            <div>{{ scope.row.charge_county || '深圳' }}</div>
          </template>
        </el-table-column> -->
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
              <div class="mb-5">{{ scope.row.child_agent_num || 0}}</div>
              <!-- <div>间属下级：{{ scope.row.child_agent_num || 0}}</div> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可提现金额(元)" align="center" width="150">
          <template slot-scope="scope">
            <span class="cursor text-blue" @click="$router.push({path: `/money/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分润比例" align="center">
          <template slot-scope="scope">
            <div class="inline text-left">
              <el-tag
                class="cursor"
                :hit="true"
                size="medium"
                effect="plain"
                @click="$router.push({path: `/device?store_name=${scope.row.store_name}`})">
                {{ scope.row.depend_type_name || '密码线' }}&nbsp;&nbsp;{{ scope.row.goods_sum || '10%' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="190">
          <template slot-scope="scope">
            <template v-if="deviceId">
              <el-button type="primary" size="mini" @click="singleAssign(scope.row)">分配给Ta</el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="mini" @click="$router.push({path: `/order?son_id=${scope.row.id}`})">订单列表</el-button>
              <!-- <el-button type="primary" size="mini" @click="">功能设置</el-button> -->
              <el-dropdown trigger="click">
                <el-button type="primary" size="mini" class="" @click="">更多<i class="el-icon-arrow-down el-icon--right line-1"></i></el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="$router.push({path: `/agent/edit/${scope.row.id}`})">修改信息</el-dropdown-item>
                  <el-dropdown-item @click.native="$router.push({path: `/store?agentId=${scope.row.id}`})">商户列表</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(1, scope.row, scope.$index)" v-if="form.activated_status == 1">删除代理</el-dropdown-item>
                  <el-dropdown-item @click.native="setRow(2, scope.row, scope.$index)" v-if="form.activated_status != 1">账号恢复</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
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
  import Pagination from '@/components/Pagination'
  import condition from '@/components/condition/'

  export default {
    name: 'agent',
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
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        deviceId: ''
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
      this.deviceId = this.$route.query.deviceId || ''
      if(this.$route.meta.reload){
        this.toQuery()
      }else if(!this.list || this.list.length == 0) {
        this.listQuery.son_type = this.user_type
        this.toQuery(1)
      }
    },
    computed: {
      myDeviceName(){
        return this.$store.state.user.myDeviceName
      },
      siteInfo() {
        return this.$store.getters.siteInfo
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
        this.$get('iot-saas-basic/admin/agent/findPage', params).then(res => {
          this.list = res.rows
          this.listLoading = false
          this.clickSubmit = false
          if(params.page == 0){
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
          }
        }).catch(() => {
          this.listLoading = false
          this.clickSubmit = false
        })
      },

      /**
       * 编辑
       * @param {Object} row
       */
      setRow(type, row) {
        switch (type) {
          case 1:
            this.$alert('确定删除此代理吗？', '删除代理', {
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
          case 3:
            this.$get('agentapi/edit_agent', {
              son_id: row.id
            }).then(res => {
              this.withdrawDialog = true
              this.withdrawObj = res.agent_info
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
        }
      },

      /**
       * 分配设备
       */
      singleAssign(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '正在分配',
          spinner: 'el-icon-loading'
        })
        this.$post('iot-saas-device/admin/device/singleAssign', {
          agentId: row.id,
          deviceId: this.deviceId
        }).then(res => {
          this.loadObj.close()
          this.$message({
            message: '分配成功',
            type: 'success'
          })
          history.back()
        }).catch(err => {
          this.loadObj.close()
        })
      }
	  }
  }
</script>

<style lang="scss" scoped>

</style>
