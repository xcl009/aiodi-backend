<template>
  <div>
    <div class="pb-20 pt-20">
      <el-button type="primary" size="small" class="mr-10" @click="setRows(3, {}, 1)"><i
          class="el-icon-plus el-icon--left" />{{ $t('notice.addNotice') }}</el-button>
    </div>

    <div class="pl-10 pr-10 bg-white">
      <el-table ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
        highlight-current-row :max-height="tableMaxH">
        <el-table-column :label="$t('notice.noticeType')" show-overflow-tooltip  v-if="isSaas()">
          <template slot-scope="scope">
            <div>{{ scope.row.noticeTypeVO.typeName || '--' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('notice.userType')" show-overflow-tooltip>
          <template slot-scope="scope">
            <div><span v-for="item in scope.row.targetTypes">{{ identity[item] }}</span></div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.status')" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-link :underline="false" type="success" v-if="scope.row.status == 1">{{ $t('public.open') }}</el-link>
            <el-link :underline="false" type="info" v-else>{{ $t('public.close') }}</el-link>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.title')" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.operate')" width="140">
          <template slot-scope="scope">
            <div class="flex flex-wrap operate">
              <!-- <el-button type="text" @click="showDialog(scope.row, {}, 2)">{{ $t('public.edit') }}</el-button> -->
              <el-button type="text" class="text-danger" @click="del(scope.row, scope.$index)">{{ $t('public.delete') }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)" @pagination="getList" />
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false" size="40%">
      <template>
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item :label="$t('notice.noticeType')" v-if="isSaas()">
            <el-select v-model="dform.typeCode">
              <block v-for="(item, index) in dataList.noticeType">
                <el-option :label="`${item.typeName}`" :value="item.typeCode" :key="index"></el-option>
              </block>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('notice.userType')">
            <el-checkbox-group v-model="dform.targetTypes">
              <el-checkbox :label="key" v-for="(item, key) in identity">{{ item }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item :label="$t('public.status')">
            <el-radio-group v-model="dform.status">
              <el-radio :label="1">{{ $t('public.open') }}</el-radio>
              <el-radio :label="2">{{ $t('public.close') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('public.title')">
            <el-input v-model="dform.title" :placeholder="$t('notice.noticeContentText')" />
          </el-form-item>
          <el-form-item :label="$t('notice.noticeContent')">
            <!-- <el-input v-model="dform.recodeContent" :placeholder="$t('notice.noticeContentText')" type="textarea"
              :rows="4" /> -->

              <tinymce ref="tinymce" v-model="dform.recodeContent" :height="600" />
          </el-form-item>
        </el-form>
      </template>
      <template>
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel')
                    }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{
                        $t('public.confirm') }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script>
  import condition from '@/components/condition/'
  import selectSearch from '@/components/condition/selectSearch'
  import Pagination from '@/components/Pagination'
  import upload from '@/components/upload'
  import Tinymce from '@/components/Tinymce'
  import {
    parseTime,
  } from '@/utils/index'
  export default {
    name: 'useGuide',
    components: {
      condition,
      selectSearch,
      Pagination,
      upload,
      Tinymce
    },
    data() {
      return {
        clickSubmit: false,
        form: {

        },
        list: [],
        tableMaxH: '250',
        listLoading: true,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 20
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        drawerStatus: false,
        curRow: {},
        curIdx: 0,
        dform: {
          status: 1
        },
        // 指南对象数组
        dataList: [],

        identity: []
      }
    },
    watch: {
      drawerStatus(newValue, oldValue) {
        if(!newValue){
          this.$refs.tinymce.setContent('')
        }
    }
  },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      siteInfo() {
        return this.$store.getters.siteInfo
      },
      myDeviceName() {
        return this.$store.state.user.myDeviceName
      },
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      },
      myDevice() {
        return this.$store.state.user.myDevice;
      },
      dialogTitle() {
        return {
          1: this.$t('notice.addNotice'),
          2: this.$t('notice.editNotice')
        }
      },
    },
    mounted() {
      if(this.isBrand()){
        this.identity = {
          user: this.$t('public.user')
        }
      }else{
        this.identity = {
          brand: this.$t('public.brand'),
          store: this.$t('public.store'),
          agent: this.$t('public.agent'),
          user: this.$t('public.user')
        }
      }
      this.getList();
      this.init();
    },
    methods: {
      /**
       * 获取公告类型
       */
      init() {
        let url = 'iot-saas-basic/admin/notice/record/findTypes';
        this.$get(url, {}).then(res => {
          this.dataList = res
          console.log(this.dataList)
          this.listLoading = false;
        }).catch(() => {
          this.listLoading = false
        })
      },
      /**
       * 显示dialog
       */
      showDialog(row, res, index) {
        this.dialogType = index;
        this.drawerStatus = true
        this.dform = Object.assign({}, row)
        if (index == 2) {
          this.dform.type = row.brandId == '1' ? 'brandId' : row.storeId == '1' ? 'storeId' : row.agentId == '1' ?
            'agentId' : '';
        }
      },

      /**
       * 删除问题指南
       */
      del(row) {
        let that = this;
        this.$alert(that.$t('notice.message'), that.$t('notice.notice'), {
          confirmButtonText: that.$t('notice.notice'),
          center: true,
          callback: action => {
            if (action == 'confirm') {
              this.$post('iot-saas-basic/admin/notice/record/delete', {
                id: row.id,
              }).then(res => {
                this.$message({
                  message: that.$t('public.deleteSuccess'),
                  type: 'success'
                })
                this.getList();
              })
            }
          }
        })
      },

      /**
       * 获取公告列表
       */
      getList() {
        let url = 'iot-saas-basic/admin/notice/record/getJunior'
        var params = Object.assign({}, this.form, this.listQuery, {
          page: this.listQuery.page - 1
        })
        if (params.deviceTypeCode == 0) {
          delete params.deviceTypeCode
        }
        if (params.guideType == 0) {
          delete params.guideType
        }
        if (params.guideTarget == 0) {
          delete params.guideTarget
        }
        this.$get(url, params).then(res => {
          this.list = res.rows
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
          }
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 操作行
       * @param {Object} type 1 dialog类型  3 drawer类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '添加指南'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            break
          case 3:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.drawerStatus = true
            this.dform = {
              status: 1,
              targetTypes: ["user"],
              typeCode: 'MSG_NOTICE'
            }
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm(row = {}) {
        let that = this;
        let url = this.dialogType == 1 ? 'iot-saas-basic/admin/notice/record/save' :
          'iot-saas-basic/admin/notice/record/edit';
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        // if (this.isSaas()) {
        //   params.brandId = this.agentInfo.brandId
        // }
        if (!params.recodeContent) {
          this.$message({
            message: that.$t('notice.noticeContentText'),
            type: 'error'
          })
          return
        }
        params.page = 0
        params.size = 1
        delete params.type;
        this.$post(url, params).then(res => {
          this.$message({
            message: that.$t('public.operationSuccessful'),
            type: 'success'
          })
          this.getList();
          this.drawerStatus = false
          this.clickSubmit = false
          
        }).catch(err => {
          this.clickSubmit = false
        })
      },


    }
  }
</script>

<style lang="scss" scoped>
  /deep/.el-drawer {
    min-width: 500px !important;
  }
</style>
