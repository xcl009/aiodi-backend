<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :xl="5" class="pb-20 cursor" v-for="item in toolsList">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="flex1 pl-20">
                <div class="flex1 fs-b1">{{ item.functionName }}</div>
                <div class="mt-5 fs-s3 text-gray" v-if="toolsObj[item.functionType]">{{ toolsObj[item.functionType].desc }}</div>
              </div>
              <el-switch :value="item.state" :active-value="1" :inactive-value="2" @change="setRow(3, item)"/>
            </div>
            <div class="text-right" v-if="toolsObj[item.functionType]">
              <el-button plain class="bg-body text-primary" @click="setRow(sitem.dialogType, item, sitem)" v-for="sitem in toolsObj[item.functionType].btns">{{ sitem.title }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog :title="dialogTitle[dialogType]" :visible.sync="dialogStatus" :close-on-click-modal="false" width="550px" align="center">
      <template v-if="dialogType == 2">
        <el-form class="mt-20 pl-30 pr-30 custom-form" @submit.native.prevent v-if="dform.content">
          <el-form-item v-for="(item, index) in dform.content">
            <el-input v-model="item.mobile" placeholder="前台电话">
              <template slot="append">
                <i class="fs-b1 text-primary el-icon-circle-plus" @click="dform.content.push({mobile: ''})" v-if="index == 0 && dform.content.length < 3"></i>
                <i class="fs-b1 text-danger el-icon-remove" @click="dform.content.splice(index, 1)" v-if="index > 0"></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 1">
        <el-form class="pl-10 pr-10 custom-form wifi-form" @submit.native.prevent v-if="dform.content">
          <el-form-item v-for="(item, index) in dform.content">
            <div class="flex align-center">
              <el-input v-model="item.roomNumber" placeholder="房间号(选填)"></el-input>
              <el-input class="ml-10" v-model="item.name" placeholder="WIFI账号"></el-input>
              <el-input class="ml-10" v-model="item.password" placeholder="WIFI密码"></el-input>
              <div class="pl-10" @click="dform.content.push({})" v-if="index == 0">
                <i class="fs-b1 text-primary el-icon-circle-plus cursor"></i>
              </div>
              <div class="pl-10" @click="dform.content.splice(index, 1)" v-if="index > 0">
                <i class="fs-b1 text-danger el-icon-remove cursor" ></i>
              </div>
            </div>
          </el-form-item>
          <div class="mt-15 text-gray text-left">温馨提示：用户进入房间扫描设备，优先查询该房间号绑定的WIFI，未查询到时则会展示房间号为空的WIFI</div>
        </el-form>
      </template>
      <div slot="footer" class="dialog-footer text-center">
        <el-button @click="dialogStatus = false">取 消</el-button>
        <el-button type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'deviceTools',
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        storeId: this.$route.query.storeId || '',
        toolsList: [],
        toolsObj: {
          WIFI: {
            desc: '设置WIFI账号密码，客人扫一扫一键连接wifi',
            btns: [
              {
                tag: 'WIFI',
                title: 'WIFI设置',
                dialogType: 1
              }
            ]
          },
          MOBILE: {
            desc: '设置多个前台电话，客人扫一扫一键联系前台',
            btns: [
              {
                tag: 'MOBILE',
                title: '电话设置',
                dialogType: 2
              }
            ]
          },
          SUGGESTIONS: {
            desc: '开启投诉建议，随时随地接收客人反馈信息，快速响应处理',
            btns: [
              {
                tag: 'SUGGESTIONS',
                title: '反馈记录',
                dialogType: 0,
                url: '/userManage/feedback',
              }
            ]
          }
        },

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: 'WIFI设置',
          2: '电话设置'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      }
    },
    mounted() {
      this.getTools()
    },
    methods: {
      /**
       * 获取功能列表
       */
      getTools(){
        this.$get('iot-saas-basic/store/function/List', {
          storeId: this.storeId
        }).then(res => {
          this.toolsList = res
        })
      },


      /**
       * 操作行
       * @param {Object} dialogType dialog内容显示类型 0: '跳转' 3: 改状态 其他：弹出
       * @param {Object} row 选择当前数据
       */
      setRow(dialogType, row, srow) {
        switch (dialogType) {
          case 0:
            this.$router.push({
              path: srow.url
            })
          break
          case 3:
            let state = row.state == 1 ? 2 : 1
            this.$post('iot-saas-basic/store/admin/function/switch', {
              storeId: row.storeId,
              functionType: row.functionType,
              state: state
            }).then(res => {
              row.state = state
            })
          break
          default:
            this.dialogType = dialogType
            this.curRow = row
            this.dform = {}
            if(dialogType == 1 || dialogType == 2){
              this.$set(this.dform, 'content', row.functionContent ? JSON.parse(row.functionContent) : [{}])
            }
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1: case 2:
            params.content = JSON.stringify(params.content)
            params.storeId = curRow.storeId
            params.functionType = curRow.functionType
            this.$post('iot-saas-basic/store/admin/function/update', params).then(res => {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
              this.curRow.functionContent = params.content
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
  .role-item {
    padding: 20px 16px;
    height: 184px;
    border-radius: 4px;
    border: 1px solid #E5E6EB;

    .icon-box {
      width: 64px;
      height: 64px;
      background-color: var(--olive);
      border-radius: 64px;
      font-size: 20px;
      color: var(--white);
    }
    .bg-body{
      padding: 10px 15px;
    }
  }

  .wifi-form{
    /deep/ .el-form-item{
      margin-bottom: 5px;
    }
  }
</style>
