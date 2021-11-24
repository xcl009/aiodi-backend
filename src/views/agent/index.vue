<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="代理类型:">
          <el-select v-model="listQuery.search_agent_level" @change="toQuery()">
            <el-option v-for="itme in give_role" :label="itme.role_name" :value="''+itme.role_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序类型:">
          <el-select v-model="listQuery.sort_type" @change="toQuery()">
            <el-option v-for="itme in sort_type" :label="itme.name" :value="''+itme.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理姓名:" class="hidden-sm-and-down">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-lg-and-down">
          <el-input v-model="form.search_phone" />
        </el-form-item>
        <el-form-item label="代理状态:" class="hidden-xg-and-down">
          <el-select v-model="listQuery.activated_status" @change="toQuery()">
            <el-option label="有效" :value="1" />
            <el-option label="无效" :value="2" />
            <el-option label="已删除" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :disabled="clickSubmit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '代理记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <sel-plat v-if="checkRoles(['terminal'])" :listQuery="listQuery" @change="toQuery()"></sel-plat>
        <el-form-item label="姓名:" class="hidden-md-and-up">
          <el-input v-model="form.search_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-xg-and-up">
          <el-input v-model="form.search_phone" />
        </el-form-item>
        <el-form-item label="代理状态:" class="hidden-xl-only">
          <el-select v-model="listQuery.activated_status" @change="toQuery()">
            <el-option label="有效" :value="1" />
            <el-option label="无效" :value="2" />
            <el-option label="已删除" :value="0" />
          </el-select>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
          stripe highlight-current-row :max-height="tableMaxH">
          <el-table-column label="代理信息" width="130">
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
              <div>{{ scope.row.phone }}</div>
              <div>{{ scope.row.agent_name }}({{ scope.row.id }})</div>
            </template>
          </el-table-column>
          <el-table-column label="运营城市" width="120">
            <template slot-scope="scope">
              <div>{{ scope.row.charge_province }}</div>
              <div>{{ scope.row.charge_city }}</div>
              <div>{{ scope.row.charge_county }}</div>
            </template>
          </el-table-column>
          <el-table-column label="用户" width="150">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar size="small" :src="scope.row.avatar" />
                <div class="flex1 ml-5">{{ scope.row.nick_name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="设备">
            <template slot-scope="scope">
              <div v-if="deviceNum[scope.row.id]">
                <div v-for="(item, index) in deviceNum[scope.row.id]" class="cursor" @click="$router.push({path: `/equipment/subEquipment?son_id=${scope.row.id}&all=true`})">
                  {{ deviceKeyObj[index] }}：<span class="text-blue">{{ item.my + item.son }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="下级总数" width="90">
            <template slot-scope="scope">
              {{ scope.row.child_agent_num }}
            </template>
          </el-table-column>
          <el-table-column label="收益" width="200">
            <template slot-scope="scope">
              <div class="cursor">
                &nbsp;&nbsp;&nbsp;总收益：<span class="text-blue" @click="$router.push({path: `/home/income?son_id=${scope.row.id}`})">{{ scope.row.income || '0.00' }}元</span><span class="ml-5 cursor text-gray" v-if="checkRoles(['partner'])" @click="$refs.editwiths.showDialog(scope.row)">修改</span>
              </div>
              <div class="cursor" @click="toEdit({id: scope.row.id, type: 2})">冻结金额：<span class="text-blue">{{ scope.row.freez_money }}元</span></div>
            </template>
          </el-table-column>
          <el-table-column label="可提现金额">
            <template slot-scope="scope">
              <a v-if="checkRoles(['partner'])" class="text-blue cursor" @click="$refs.editwith.showDialog(scope.row)">￥{{ scope.row.money }}</a>
              <a v-else>￥{{ scope.row.money }}</a>
            </template>
          </el-table-column>
          <el-table-column label="分润比例">
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.percent_info">
                {{ deviceKeyObj[index] }}：{{ item[config.goods_key[index] + '_percent'] }}%
              </div>
            </template>
          </el-table-column>
          <el-table-column label="贴牌操作" width="190" v-if="checkRoles(['terminal']) && user_type == 0">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/qrcode/index?son_id=${scope.row.id}`})"
                v-if="checkRoles(['terminal'])">分配设备</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/station/oemMoney?id=${scope.row.id}`})">续费金额</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="getMapIcon(scope.row)">地图图标</el-button>
              <el-button type="primary" size="mini" round plain class="ml-0" @click="copyloginUrl(scope.row)">登录地址</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="360">
            <template slot-scope="scope">
              <template v-if="zuo_sn">
                <el-button type="primary" size="mini" round plain @click="setEquip(scope.row)">分配给TA</el-button>
              </template>
              <template v-else>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/equipment/index?agent_id=${scope.row.id}`})" v-if="!checkRoles(['terminal'])">分配设备</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/agent/equip?type=2&son_id=${scope.row.id}`})">分配记录</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/shop/subShop?son_id=${scope.row.id}`})">商户管理</el-button>
                <!-- <el-button type="primary" size="mini" round plain class="ml-0" @click="toEdit({id: scope.row.id, type: 3})">提现费率</el-button> -->
                <el-button type="primary" size="mini" round plain class="ml-0" @click="toEdit({id: scope.row.id, type: 1})" v-if="!checkRoles(['terminal']) || user_type == 0">修改信息</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/adver/position?son_id=${scope.row.id}`})">广告权限</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="freeDialog = true; freeObj = scope.row">免费店员</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/order/morder?son_id=${scope.row.id}`})" v-if="agentInfo.check_order == 1">订单列表</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="toEdit({id: scope.row.id, type: 5})">登录密码</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="toEdit({id: scope.row.id, type: 7})" v-if="scope.row.role_id != 1">提现密码</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="toLogin(scope.row)" v-if="checkRoles(['terminal'])">登录后台</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/shop/steal/${scope.row.id}?type=2`})" v-if="(agentInfo.steal_order_right == 1 || scope.row.steal_order_switch == 1) && (!checkRoles(['terminal']))"> {{ (scope.row.steal_order_right == 1 || scope.row.steal_order_switch == 1) ? 'DD开启' : 'DD关闭' }}</el-button>
                <el-dropdown trigger="click">
                  <el-button type="primary" size="mini" round plain>更多设置</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="$router.push({path: `/qrcode/create?aid=${scope.row.id}`})" v-if="checkRoles(['terminal']) && user_type == 0">二维码生成</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/agent/contract?son_id=${scope.row.id}&level=${scope.row.role_id}`})">合同管理</el-dropdown-item>
                    <el-dropdown-item @click.native="deviceBindDialog = true; select_aid = scope.row.id">设备绑定</el-dropdown-item>
                    <el-dropdown-item @click.native="toEdit({id: scope.row.id, type: 4, index: scope.$index})" v-if="listQuery.activated_status == 1">删除代理</el-dropdown-item>
                    <el-dropdown-item @click.native="toEdit({id: scope.row.id, type: 8, index: scope.$index})" v-else>恢复显示</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/agent/agentBilling?son_id=${scope.row.id}`})" v-if="scope.row.role_id == 2 && checkRoles(['partner'])">计费与提现</el-dropdown-item>

                    <template v-if="scope.row.business_type == 1 && !checkRoles(['terminal'])">
                      <el-dropdown-item @click.native="$router.push({path: `/shop/index?son_uid=${scope.row.id}`})" v-if="user_type == 0">分配商户</el-dropdown-item>
                      <el-dropdown-item @click.native="$router.push({path: `/shop/subShop?son_uid=${scope.row.id}&son_id=${scope.row.id}&son_type=${scope.row.business_type}`})" v-if="user_type == 0">回收商户</el-dropdown-item>
                      <el-dropdown-item @click.native="$router.push({path: `/condom/plusGoods?son_id=${scope.row.id}`})" v-if="scope.row.percent_info[7]">补货记录</el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center" v-if="listQuery.count > 0">
          <pagination :page.sync="listQuery.start" :limit.sync="listQuery.limit" :total="listQuery.count" @pagination="getList" />
        </div>
      </div>

      <el-dialog title="提现费率" :visible.sync="withdrawDialog">
        <el-form>
          <div class="mb-10 flex align-center">
            <el-checkbox v-model="siteInfo.agent_withdraw_fee_type" :true-label="0" disabled>按比例：</el-checkbox>
            <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="withdrawObj.withdraw_percent">
              <template slot="append">%</template>
            </el-input>
          </div>
          <div class="mb-10 flex align-center">
            <el-checkbox v-model="siteInfo.agent_withdraw_fee_type" :true-label="1" disabled>按单笔：</el-checkbox>
            <el-input class="flex1" oninput="value=value.replace(/[^\d.]/g,'')" v-model="withdrawObj.withdraw_fee">
              <template slot="append">元</template>
            </el-input>
          </div>
          <div class="fs-s2 text-gray">注：您填写增加的手续费，将在下级代理提现时以分润的方式发放到您的账户，下级代理提现手续费 = 您设置的手续费 + 总后台设置的手续费。</div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="withdrawDialog = false">取 消</el-button>
          <el-button type="primary" @click="setWithdraw()">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="免费店员" :visible.sync="freeDialog">
        <el-form label-width="150px">
          <el-form-item label="免费名额：">
            <el-input v-model="freeObj.member_num" />
          </el-form-item>
          <el-form-item label="每天使用次数：">
            <el-input v-model="freeObj.member_day_count" />
            <div class="fs-s2 text-gray">注：名额不可超过{{agentInfo.member_num}}个，每天使用次数不可超过{{agentInfo.member_day_count}}次。</div>
          </el-form-item>
          <el-form-item label="每次最高使用时长：">
            <el-input v-model="freeObj.member_free_due_hours" />
            <div class="fs-s2 text-gray">注：超过最高时长将按正常计费。</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="freeDialog = false">取 消</el-button>
          <el-button type="primary" @click="toEdit({type: 6}, freeObj)">确 定</el-button>
        </div>
      </el-dialog>

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

      <editwith ref="editwith" :type="1"></editwith>
      <editwith ref="editwiths" :type="1" :moneyType="2"></editwith>
    </div>
  </div>
</template>

<script>
  import upload from '@/components/upload/two'
  import Pagination from '@/components/Pagination'
  import drawer from '@/components/filterDrawer/filter'
  import selPlat from '@/components/selPlat'
  import { copyText } from '@/utils/index'
  import { getToken, setToken, removeToken } from '@/utils/auth'
  import editwith from './_editwith'

  export default {
    name: 'agent',
    components: {
      upload,
      Pagination,
      drawer,
      selPlat,
      editwith
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
        list: [],
        deviceNum: {},
        listLoading: true,
        listQuery: {
          activated_status: 1,
          search_agent_id: '0',
          sort_type: '0',
          search_agent_level: '0',
          son_type: 0,
          start: 1,
          limit: 10,
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
        this.getPower()
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
       * 获取权限
       */
      getPower() {
        let give_role = [{
          role_name: '全部',
          role_id: 0
        }]
        this.$get('agentapi/add_agent').then(res => {
          this.give_role = give_role.concat(res.give_role_right)
        })
      },

      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.$refs.filterDrawer.hide()
        if (type == 1) this.form = {}
        this.listQuery.start = 1
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        let url = 'SyStatistics/getSonList' //'agentapi/son_list'
        let listQuery = Object.assign(this.form, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get(url, listQuery).then(res => {
          this.listLoading = false
          this.list = res.list
          this.listQuery.count = res.count
          this.getDeviceNum(this.arrayKeys(res.list, 'id'))
          if(listQuery.start == 0) this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
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
