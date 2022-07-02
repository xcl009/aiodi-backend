<template>
  <div>
    <condition ref="condition" :clickSubmit="clickSubmit" @reset="toQuery(2)" @query="toQuery">
      <template v-slot:defult>
        <el-form-item label="工厂名称">
          <el-input v-model="form.name" placeholder="工厂名称" />
        </el-form-item>
      </template>
      <template v-slot:endButton>
        <el-button type="primary" size="small" class="mr-10" @click="$router.push({path: `/factory/addFactory`})"><i
            class="el-icon-circle-plus-outline el-icon--left" />添加工厂</el-button>
      </template>
    </condition>

    <div class="pl-15 pr-15 pb-15 bg-white">
      <div class="bg-white">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          element-loading-text="Loading" stripe highlight-current-row>
          <el-table-column label="工厂名称">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="地址">
            <template slot-scope="scope">
              {{ scope.row.address }}
            </template>
          </el-table-column>
          <el-table-column label="联系人">
            <template slot-scope="scope">
              <div>{{ scope.row.contacts }}</div>
              <div>{{ scope.row.mobile }}</div>
            </template>
          </el-table-column>
          <el-table-column label="简介">
            <template slot-scope="scope">
              {{ scope.row.briefIntroduction }}
            </template>
          </el-table-column>
          <el-table-column label="推荐贴牌数">
            <template slot-scope="scope">
              {{ scope.row.brandNum || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="分润快活币">
            <template slot-scope="scope">
              {{ scope.row.money || '0.00' }}
            </template>
          </el-table-column>
          <el-table-column label="设备类型">
            <template slot-scope="scope">
              <template v-for="item in scope.row.deviceTypeList">
                <span>{{ item.deviceTypeName }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="270">
            <template slot-scope="scope">
              <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="$router.push({name: 'addFactory', params: { info: scope.row }})">修改信息</el-button>
              <!-- <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="setRows(1, scope.row, 1)">主题设置</el-button>
              <el-button class="pl-5 pr-5 ml-0" size="medium" type="text" @click="toLogin(scope.row)">一键登录</el-button> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" width="650px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-table :data="uiList" stripe highlight-current-row>
          <el-table-column label="demo">
            <template slot-scope="scope">
              <el-image class="ui-img" :src="scope.row.img_url" fit="cover" :preview-src-list="[scope.row.img_url]">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="主题名称">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" round plain
                @click="bindUI({son_id: curRow.aid, code: scope.row.code})" v-if="dform.code != scope.row.code">绑定TA
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <div class="mt-30 text-center" v-if="dialogType != 1">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getToken,
    setToken,
    removeToken
  } from '@/utils/auth'
  import condition from '@/components/condition/'
  export default {
    name: 'factory',
    components: {
      condition
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        list: [],
        listLoading: true,
        listQuery: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '主题设置'
        },
        curRow: {},
        curIdx: 0,
        dform: {},

        uiList: {}
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.getters.myDeviceId
      },
    },
    beforeRouteEnter(to, from, next) {
      if (from.name == 'addFactory') {
        to.meta.reload = true
      } else {
        to.meta.reload = false
      }
      next()
    },
    activated() {
      this.zuo_sn = this.$route.query.zuo_sn || ''
      if (this.$route.meta.reload) {
        this.getList()
      } else if (!this.list || this.list.length == 0) {
        this.toQuery()
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 搜索查询
       */
      toQuery(type = 0) {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.getList()
      },

      /**
       * 重置查询
       */
      reset() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        this.form = {}
        this.getList()
      },

      /**
       * 获取列表
       */
      getList() {
        const params = this.form
        this.$get('iot-saas-basic/admin/factory/list', params).then(res => {
          this.list = res
          this.dataTotal = res.total
          this.listLoading = false
          this.clickSubmit = false
          this.totalRecommend(this.arrayKeys(res.list, 'aid'))
          this.totalCoin(this.arrayKeys(res.list, 'aid'))
        }).catch(() => {
          this.clickSubmit = false
          this.listLoading = false
        })
      },

      /**
       * 获取邀请品牌商数量
       */
      totalRecommend(aids = []) {
        if (aids.length == 0) return
        let aidStr = aids.join(',')
        this.$get('agentapi/team/totalRecommend', {
          factory_aids: aidStr
        }).then(res => {
          this.recommendObj = res
        })
      },

      /**
       * 获取总分润快活币
       */
      totalCoin(aids = []) {
        if (aids.length == 0) return
        let aidStr = aids.join(',')
        this.$get('agentapi/team/totalCoin', {
          factory_aids: aidStr
        }).then(res => {
          this.coinObj = res
        })
      },

      /**
       * 登录代理后台
       * @param {Object} row
       */
      toLogin(row) {
        this.loadObj = this.$loading({
          lock: true,
          text: '正在登录',
          spinner: 'el-icon-loading'
        })
        this.$post('agentapi/login/pretend_team_login', {
          son_id: row.aid
        }).then(res => {
          setToken(getToken(), 'token1')
          setToken(res.token)
          setToken(res.user_id, 'agent_id')
          setToken(res.user_id, 'user_id')
          setTimeout(() => {
            location.href = '/factory/dataStat'
            this.loadObj.close()
          }, 500)
        }).catch(err => {
          this.loadObj.close()
        })
      },

      /**
       * 操作
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前
       * @param {Object} dialogType dialog内容显示类型 1: 'ui模板设置'
       * @param {Object} idx 所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dialogStatus = true
            if (dialogType == 1) {
              this.$get('agentapi/system/detail_ui_template', {
                son_id: row.aid
              }).then(res => {
                this.dform = res
              })
            }
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }

  #list_table .el-button {
    padding-left: 0;
    padding-right: 0;
    width: 80px;
  }

  .ui-img {
    width: 60px;
    height: 60px;
  }
</style>
