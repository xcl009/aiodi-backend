<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
      <template v-slot:defult>
        <!-- <el-select v-model="form.sort" @change="toQuery()" placeholder="排序">
          <el-option :label="item" :value="key" v-for="(item, key) in sort_type" />
        </el-select>
        <el-date-picker
          v-if="[7,8].indexOf(form.sort) > -1"
          v-model="form.query_month"
          type="month"
          value-format="yyyy-M"
          placeholder="选择月份"
          @change="toQuery()">
        </el-date-picker> -->
        <el-select v-model="form.isPuhuo" @change="toQuery()" placeholder="是否铺货">
          <el-option label="全部" value="2" />
          <el-option label="未铺货" value="0" />
          <el-option label="已铺货" value="1" />
        </el-select>
        <el-input v-model="form.name" placeholder="商户名称" />
        <el-input v-model="form.mobile" placeholder="手机号码" />
        <!-- <el-form-item label="行业分类:">
          <el-cascader v-model="sel_cat" :options="categoryList" :props="{ expandTrigger: 'hover' }" @change="toQuery()"/>
        </el-form-item>
        <el-form-item label="所在地区:">
          <el-cascader v-model="search_regions_tag" :options="areaList" :show-all-levels="false" :props="{ expandTrigger: 'hover', checkStrictly: true }" @change="toQuery()"/>
        </el-form-item> -->
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-5 bg-white">
      <el-table
        class="ptd-5"
        id="list_table"
        ref="list_table"
        highlight-current-row
        element-loading-text="Loading"
        v-loading="listLoading"
        :max-height="tableMaxH"
        :data="list"
      >
        <el-table-column label="品牌商" align="center" width="120">
          <template slot-scope="scope">
            {{ oemInfo[scope.row.belong_aid] ? oemInfo[scope.row.belong_aid].mini_name : '品牌名' }}
          </template>
        </el-table-column>
        <el-table-column label="门头照" align="center" width="62" v-if="checkThead.indexOf('门头照') > -1">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="52" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline" class="m-auto block"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="商户名称" align="center" width="150" v-if="checkThead.indexOf('商户名称') > -1">
          <template slot-scope="scope">
            <el-link @click="$router.push({path: `/shop/detail/${scope.row.id}`})" class="cursor">[1021]{{ scope.row.store_name || '美宜佳' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="商户地址" align="center" width="200" v-if="checkThead.indexOf('商户地址') > -1">
          <template slot-scope="scope">
            <div class="text-cut_two">{{ scope.row.address || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="城市区域" align="center" width="120" v-if="checkThead.indexOf('城市区域') > -1">
          <template slot-scope="scope">
            {{ scope.row.region_tag && areaObj[scope.row.region_tag] ? areaObj[scope.row.region_tag].title : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="行业分类" align="center" width="120" v-if="checkThead.indexOf('行业分类') > -1">
          <template slot-scope="scope">
            {{ scope.row.cat_name || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="交易额(元)" align="center" width="90">
          <template slot-scope="scope">
            {{ scope.row.order_amount || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="收益(元)" align="center" width="90">
          <template slot-scope="scope">
            <span class="text-blue cursor" @click="$router.push({path: `/money/income?son_id=${scope.row.aid}`})">{{ scope.row.profit || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可提现(元)" align="center" width="90">
          <template slot-scope="scope">
            <a>{{ scope.row.available_withdraw_money || '0.00' }}</a>
          </template>
        </el-table-column>
        <el-table-column label="订单量" align="center" width="90" v-if="checkThead.indexOf('订单量') > -1">
          <template slot-scope="scope">
            <el-tag
              class="cursor"
              :hit="true"
              size="medium"
              effect="plain"
              @click="$router.push({path: `/order?store_name=${scope.row.store_name}`})">
              {{ scope.row.order_num || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="品类" align="center" v-if="checkThead.indexOf('品类') > -1">
          <template slot-scope="scope">
            <el-tag
              class="cursor"
              :hit="true"
              size="medium"
              effect="plain"
              @click="$router.push({path: `/device?store_name=${scope.row.store_name}`})">
              {{ scope.row.depend_type_name || '密码线' }}&nbsp;&nbsp;{{ scope.row.goods_sum || '0' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="120" v-if="checkThead.indexOf('创建时间') > -1">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') || '1970-01-01 00:00' }}
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination
          v-show="listQuery.count > 0"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.size"
          :page-count="listQuery.count"
          @pagination="getList"
        />
      </div>
    </div>

    <el-dialog title="首单免费" :visible.sync="freeDialog">
      <el-form label-width="140px">
        <el-form-item label="任一产品：">
          <el-switch v-model="shopObj.first_free_only_once" :active-value="1" :inactive-value="0"/>
          <div class="fs-s2 text-gray">提示：任一产品关闭时表示每一个产品都可以免费一次</div>
        </el-form-item>
        <el-form-item label="首单免费：">
          <el-switch v-model="shopObj.first_free_switch" :active-value="1" :inactive-value="0"/>
          <div class="fs-s2 text-gray">提示：开启免费，首页地图、附近商户和用户支付页面都会出现首单免费字样</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="freeDialog = false">取 消</el-button>
        <el-button type="primary" @click="postFree()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="操作记录" :visible.sync="setRecordDialog" width="600px">
      <div v-infinite-scroll="loadSetRecord" class="pl-10" style="overflow: auto; max-height: 350px">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in setRecordList" :key="index" placement="top" hide-timestamp :timestamp="index">
            <div class="mb-10 fs-c1">{{ index }}</div>
            <div v-for="sitem in item.list" class="mb-5 fs-s4 text-gray">{{ parseTime(sitem.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }} <span class="mr-10 ml-10 el-icon-right"></span> {{ sitem.content }}</div>
          </el-timeline-item>
        </el-timeline>
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

    <el-dialog :title="shopObj.dialogTitle" :visible.sync="storeSetDialog">
      <template v-if="shopObj.type == 3">
        <el-form label-width="140px">
          <el-form-item label="是否开启：">
            <el-switch v-model="shopObj.cost_controll_switch" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">提示：开启表示商户提现时，商户的可提现金额需大于(商户设备数*成本)，且只能提超出的金额。</div>
          </el-form-item>
          <el-form-item label="密码线成本：">
            <el-input v-model="shopObj.thread_cost_price">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="shopObj.type == 4">
        <el-form label-width="auto">
          <template v-if="shopObj.depend_type_name">
            <el-form-item label="充电宝超时成本：" v-if="shopObj.depend_type_name.indexOf('充电宝') > -1">
              <el-input v-model="shopObj.expired_bao_cost_price">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="密码线超时成本：" v-if="shopObj.depend_type_name.indexOf('线') > -1">
              <el-input v-model="shopObj.expired_thread_cost_price">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template>
          <el-form-item label="充电宝免费时长：" v-if="shopObj.depend_type_name.indexOf('充电宝') > -1">
            <el-input v-model="shopObj.free_rent_minutes" placeholder="为0时表示未设置免费时长">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item label="广告展示：">
            <el-switch v-model="shopObj.wx_ad_right" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">提示：关闭表示扫此商户绑定的设备二维码进入小程序时，所有广告均不展示。</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="shopObj.type == 5">
        <el-form label-width="140px">
          <el-form-item label="退款方式：">
            <el-radio-group v-model="shopObj.deposit_drawbacke_type">
              <el-radio :label="0">默认系统设置</el-radio>
              <el-radio :label="1">原路退回</el-radio>
              <el-radio :label="2">退回小程序钱包</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="shopObj.type == 6">
        <el-checkbox-group v-model="formThead">
          <el-checkbox :label="item" v-for="item in allThead" class="mr-0 mb-10" style="width: 120px;" />
        </el-checkbox-group>
        <div class="mt-10 fs-s2 text-gray">提示：勾选表示列表显示此选项。表头设置只对当前用户在本机登录有效，有效期最长7天。</div>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="storeSetDialog = false">取 消</el-button>
        <el-button type="primary" @click="setFormHead()" v-if="shopObj.type == 5">确 定</el-button>
        <el-button type="primary" @click="editShopPart(shopObj); storeSetDialog = false" v-else>确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selPlat from '@/components/selPlat'
import area from '@/components/area.json'
import {
  copyText,
  showPercent
} from '@/utils/index'
import {
  getToken,
  setToken
} from '@/utils/auth'
const defaultThead = ['门头照', '商户名称', '金额', '商户地址', '订单量', '城市区域', '行业分类', '品类', '创建时间']
export default {
  name: 'subShop',
  components: {
    Pagination,
    condition,
    selPlat
  },
  props: {
    user_type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      allThead: ['门头照', '商户名称', '金额', '商户地址', '订单量', '城市区域', '行业分类', '品类', '创建时间'],
      formThead: getToken(`${agentInfo.id}_check_thead`) ? JSON.parse(getToken(`${agentInfo.id}_check_thead`)) : defaultThead,
      checkThead: getToken(`${agentInfo.id}_check_thead`) ? JSON.parse(getToken(`${agentInfo.id}_check_thead`)) : defaultThead,
      beginOptions: {
        disabledDate: (time) => {
          if (this.form.endTime) {
            return time.getTime() > this.form.endTime || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          } else {
            return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          }
        }
      },
      endOptions: {
        disabledDate: (time) => {
          if (this.form.startTime) {
            return time.getTime() < this.form.startTime || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          } else {
            return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
          }
        }
      },
      clickSubmit: false,
      showPercent: showPercent,
      form: {
        query_rate_date_type: 0,
        query_rate_number_type: 0
      },
      sel_cat: [],
      categoryList: [],
      search_regions_tag: [],
      areaList: [],
      areaObj: {},
      tableMaxH: '250',
      oemInfo: {},
      list: [{}],
      listLoading: false,
      listQuery: {
        search_depend_type: '-1',
        search_son_type: 2,
        search_agent_level: 0,
        type: 1,
        page: 1,
        size: 20,
        count: 0
      },
      sort_type: ['综合排序','收益从高到底','收益从低到高','创建时间由近到远','创建时间由远到近','登录时间由近到远','登录时间由远到近','月交易额由高到低','月交易额由低到高'],
      rate_date: ['默认', '昨天','近3天','近7天','上周','本月','上月'],
      rate_number: ['默认', '0收益','使用率大于2%','使用率大于5%','使用率大于10%','使用率大于20%'],
      selSnArr: [],
      zuo_sn: '',
      copyUrl: '',

      rowObj: {},
      freeDialog: false,
      shopObj: {},

      /** 操作记录 */
      setRecordDialog: false,
      setRecordList: {},
      setRecordObj: {},

      entranceFeeDialog: false,
      entranceFeeObj: {},

      select_aid: '',
      deviceBindStr: '',
      deviceBindDialog: false,
      deviceBindEndDialog: false,
      bind_success: [],
      bind_err: [],

      storeSetDialog: false,

      selAidArr: [],
      selID: [],
      son_uid: 0,
      son_type: 0
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
    agentInfo(){
      return this.$store.getters.agentInfo
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'shopEdit') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let queryKey = ['zuo_sn', 'son_uid', 'son_type'], query = this.$route.query
    for(var i in queryKey){
      this[queryKey[i]] = query[queryKey[i]]
    }
    if(this.$route.meta.reload){
      this.getList()
      this.setFormHead(2)
    }else if(this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery(2)
      this.getCategory()
      this.getArea()
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted(){

  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery() {
      if(this.clickSubmit) return
      this.clickSubmit = true
      if (this.cat_id && this.cat_id.length > 0) {
        this.form.cat_id = this.cat_id[this.cat_id.length - 1]
      }
      if (this.search_regions_tag && this.search_regions_tag.length > 0) {
        this.form.search_regions_tag = this.search_regions_tag[this.search_regions_tag.length - 1]
      }
      this.listQuery.page = 1
      this.listQuery.size = 50
      if (this.xlsxStatus) this.xlsxStatus = false
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
        page: this.listQuery.start - 1
      })
      this.$get('merchant/findPage', params).then(res => {
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
      const res = area, areaObj = {}
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
      this.$alert('确定将设备绑定到该商户吗？', '设备铺货', {
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

    /**
       * 编辑
       * @param {Object} row
       */
    toEdit(row) {
      switch (row.type) {
        case 1:

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
        case 4:
          this.$alert('确定删除此商户吗？', '删除商户', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == 'confirm') {
                this.$post('agentapi/sttuf/delete_merchant', {
                  store_id: row.id
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
                this.$post('agentapi/save_merchant_password', {
                  son_id: row.aid,
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
          this.$prompt('请输入商户营业时间', '设置营业时间', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'text',
            inputPlaceholder: '如：09:00-22:00',
            inputValue: row.row.business_time_des,
            beforeClose: (action, instance, done) => {
              if (action == 'confirm') {
                const value = instance.inputValue
                this.$post('agentapi/store/save_business_time', {
                  store_id: row.row.id,
                  business_time_des: value
                }).then(res => {
                  row.row.business_time_des = value
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
        case 7:
            this.$prompt('请输入新提现密码', '重置提现密码', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'password',
              beforeClose: (action, instance, done) => {
                if (action == 'confirm') {
                  const value = instance.inputValue
                  this.$post('agentapi/save_merchant_password', {
                    son_id: row.aid,
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
          this.upMoneyDialog = true
          this.$get('agentapi/sttuf/crontab_merchant_account', {
            son_id: row.aid
          }).then(res => {
            res.son_id = row.aid
            this.upMoneyObj = res
          })
          break
      }
    },

    /**
     * 获取操作记录
     */
    getSetRecord(aid, type = 0){
      if(type == 1){
        this.setRecordObj.start = this.setRecordObj.start + 1
      } else {
        this.setRecordList = {}
        this.setRecordObj = {
          aid: aid,
          page: 0,
          size: 20
        }
      }
      this.$get('agentapi/log/agent_records', this.setRecordObj).then(res => {
        if(res.list.length == 0 && this.setRecordObj.start == 0){
          this.$message({
            message: '暂无记录',
            type: 'error'
          })
          return
        }
        res.list.map(item => {
          return item.date = this.parseTime(item.add_date, '{y}-{m}-{d}')
        })
        res.list.map(item => {
          if(!this.setRecordList[item.date]) this.$set(this.setRecordList, item.date, {})
          if(!this.setRecordList[item.date].list) this.$set(this.setRecordList[item.date], 'list', [])
          this.setRecordList[item.date].list.push(item)
        })
        this.setRecordDialog = true
        this.setRecordObj.count = res.count
      })
    },

    /**
     * 滚动加载更多
     */
    loadSetRecord () {
      if(this.setRecordObj.aid && this.setRecordObj.count > this.setRecordObj.start + 1){
        this.getSetRecord('', 1)
      }
    },

    /**
     * 修改商户的部分
     */
    editShopPart(params){
      this.$post('agentapi/store/type_switch', params).then(res => {
        this.$message({
          type: 'success',
          message: '设置成功'
        })
        this.rowObj = Object.assign(this.rowObj, params)
      })
    },

    /**
     * 分配商户
     */
    bindAgent(row = {}){
      this.$alert('确定将商户分配到该代理吗？', '商户管理', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.load = this.$message({
              duration: 0,
              iconClass: 'el-icon-loading',
              message: '分配中'
            })
            this.$post('agentapi/employee/sons_transfer_parent', {
              son_id: this.son_uid,
              store_id_arr: row.id ? [row.id] : this.selID
            }).then(res => {
              this.load.close()
              this.$message({
                type: 'success',
                message: '分配成功'
              })
              history.back()
            })
          }
        }
      })
    },

    /**
     * 回收商户
     */
    unbindAgent(row = {}, index){
      this.$alert('确定回收该商户吗？', '商户管理', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.load = this.$message({
              duration: 0,
              iconClass: 'el-icon-loading',
              message: '回收中'
            })
            this.$post('agentapi/employee/merchants_recovery_parent', {
              store_id_arr: row.id ? [row.id] : this.selID
            }).then(res => {
              this.load.close()
              this.$message({
                type: 'success',
                message: '回收成功'
              })
              if(index){
                this.list.splice(index, 1)
              }else{
                history.back()
              }
            })
          }
        }
      })
    },

    /**
     * 设置表头信息
     */
    setFormHead(type = 1){
      if(type == 1){
        this.checkThead = this.formThead
        this.storeSetDialog = false
      }
      setToken(JSON.stringify(this.formThead), `${this.agentInfo.id}_check_thead`)
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  .text-cut_two{
    max-height: 66px;
    line-height: 22px;
    -webkit-line-clamp: 3;/*规定超过两行的部分截断*/
  }
</style>
