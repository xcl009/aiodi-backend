<template>
  <div>
    <div class="pb-20 pt-20">
      <el-button type="primary" size="small" class="mr-10" @click="setRows(3, {}, 1)"><i class="el-icon-plus el-icon--left" />添加通道</el-button>
    </div>

    <div class="p-20 p-20 bg-white">
      <el-radio-group v-model="form.sourceType">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button :label="key" v-for="(item, key) in Constant.SourceType">{{ item }}</el-radio-button>
      </el-radio-group>

      <div class="mt-20 channel-box ">
        <template v-if="list.length > 0">
          <el-row :gutter="20" type="flex" class="flex-wrap">
            <template v-for="(item, idx) in list">
              <el-col :sm="24" :lg="6" v-if="!form.sourceType || item.sourceType == form.sourceType">
                <div class="flex align-center mb-20 p-10 channel-item radius-10 cursor">
                  <el-avatar class="block" :size="35" :src="item.logo" fit="cover" shape="square"></el-avatar>
                  <div class="pl-10 pr-10 flex-1 text-bold">
                    <div class="mb-5 text-primary">{{ Constant.SourceType[item.sourceType] }}</div>
                    <div>{{ item.name }}</div>
                  </div>
                  <div class="text-primary" @click="setRows(3, item, 2)">
                    修改
                  </div>
                  <div class="ml-15 text-primary" @click="setRows(3, item, 3)">
                    复制
                  </div>
                  <el-popconfirm
                    title="确定删除该通道吗？"
                    @onConfirm="delChannel(item, idx)"
                  >
                    <div class="ml-15 text-danger" slot="reference">
                      删除
                    </div>
                  </el-popconfirm>
                </div>
              </el-col>
            </template>
          </el-row>
        </template>
        <template v-else>
          <div class="mt-15 mb-15">暂无通道</div>
        </template>
      </div>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false" size="40%">
      <template v-if="[1,2,3].indexOf(dialogType) > -1">
        <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
          <el-form-item label="通道名称">
            <el-input v-model="dform.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('brand.appType')">
            <el-select v-model="dform.sourceType" class="tfixed">
              <el-option :label="item" :value="parseInt(key)" v-for="(item, key) in Constant.SourceType" />
            </el-select>
          </el-form-item>
          <el-form-item label="通道编码">
            <el-input v-model="dform.code"></el-input>
          </el-form-item>
          <el-form-item label="通道类型">
            <el-input v-model="dform.payType"></el-input>
          </el-form-item>
          <div class="mb-10 text-black3">通道图标</div>
          <upload v-model="dform.logo" ratio="1:1" />
        </el-form>
      </template>
      <template>
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
          <el-button size="medium" class="bg-body" @click="drawerStatus = false">{{ $t('public.cancel') }}</el-button>
          <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
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
  import {
    parseTime,
  } from '@/utils/index'
  export default {
    name: 'payChannel',
    components: {
      condition,
      selectSearch,
      Pagination,
      upload
    },
    data() {
      return {
        clickSubmit: false,
        form: {},
        list: [],

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
      }
    },
    computed: {
      Constant() {
        return this.$store.getters.Constant
      },
      dialogTitle() {
        return {
          1: '添加通道',
          2: '修改通道',
          3: '添加通道'
        }
      },
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        let url = 'iot-saas-pay/admin/pay/channel/all'
        var params = Object.assign({}, this.form)
        this.$get(url, params).then(res => {
          this.list = res
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
            this.dform = {}
            switch (dialogType) {
              case 2:
                this.dform = {
                  name: row.name,
                  code: row.code,
                  payType: row.payType,
                  sourceType: row.sourceType,
                  logo: row.logo
                }
                break
              case 3:
                this.dform = {
                  name: row.name,
                  code: row.code,
                  logo: row.logo
                }
                break
            }
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
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1: case 2: case 3:
            this.$post('iot-saas-pay/admin/pay/channel/saveChannel', params).then(res => {
              this.$message({
                message: this.$t('public.operationSuccessful'),
                type: 'success'
              })
              if(this.dialogType == 2){
                curRow = Object.assign(curRow, params)
              } else {
                this.getList()
              }
              this.drawerStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }

      },

      /**
       * 删除通道
       */
      delChannel(item, idx){
        if(this.clickSubmit) return
        this.clickSubmit = true
        this.$post('iot-saas-pay/admin/pay/channel/removeChannel', {
          id: item.id
        }).then(res => {
          this.$message({
            message: this.$t('public.operationSuccessful'),
            type: 'success'
          })
          this.list.splice(idx, 1)
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /deep/.el-drawer {
    min-width: 500px !important;
  }

  .channel-box{
    .channel-item{
      border: 2px solid #eee;
      &.act{
        border-color: var(--olive);
      }
    }
    /deep/ .el-avatar{
      background: none;
    }
  }
</style>
