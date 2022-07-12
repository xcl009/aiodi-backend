<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :xl="5" class="pb-20 cursor" v-for="item in tool">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="flex1 pl-20">
                <div class="flex1 fs-b1">{{ item.title }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ item.desc }}</div>
              </div>
              <el-switch v-model="item.switch" :active-value="1" :inactive-value="0"/>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="setRow(sitem.dialogType, item, sitem)" v-for="sitem in manage[item.tag]">{{ sitem.title }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog :title="dialogTitle[dialogType]" :visible.sync="dialogStatus" width="550px" align="center">
      <template v-if="dialogType == 2">
        <el-form class="mt-20 pl-30 pr-30 custom-form" v-if="dform.mobile">
          <el-form-item v-for="(item, index) in dform.mobile">
            <el-input v-model="item.mobile"  placeholder="前台电话">
              <template slot="append">
                <i class="fs-b1 text-primary el-icon-circle-plus" @click="dform.mobile.push({mobile: ''})" v-if="index == 0 && dform.mobile.length < 3"></i>
                <i class="fs-b1 text-danger el-icon-remove" @click="dform.mobile.splice(index, 1)" v-if="index > 0"></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="dialogType == 1">
        <el-form class="mt-20 pl-30 pr-30 custom-form" v-if="dform.wifi_pwd">
          <el-form-item v-for="(item, index) in dform.wifi_pwd">
            <div class="flex align-center">
              <el-input v-model="item.SSID" placeholder="WIFI账号"></el-input>
              <el-input class="ml-10" v-model="item.password" placeholder="WIFI密码">
                <template slot="append">
                  <i class="fs-b1 text-primary el-icon-circle-plus cursor" @click="dform.wifi_pwd.push({})" v-if="index == 0"></i>
                  <i class="fs-b1 text-danger el-icon-remove cursor" @click="dform.wifi_pwd.splice(index, 1)" v-if="index > 0"></i>
                </template>
              </el-input>
            </div>
          </el-form-item>
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
        tool: [
          {
            tag: 'wifi',
            title: '连接WIFI',
            desc: '设置WIFI账号密码，客人扫一扫一键连接wifi',
          },
          {
            tag: 'qiantai',
            title: '联系前台',
            desc: '设置多个前台电话，客人扫一扫一键联系前台',
          },
          {
            tag: 'feedback',
            title: '投诉建议',
            desc: '开启投诉建议，随时随地接收客人反馈信息，快速响应处理',
          }
        ],
        manage: {
          wifi: [
            {
              tag: 'wifi',
              title: 'WIFI设置',
              dialogType: 1
            }
          ],
          qiantai: [
            {
              tag: 'qiantai',
              title: '电话设置',
              dialogType: 2
            }
          ],
          feedback: [
            {
              tag: 'feedback',
              title: '反馈记录',
              dialogType: 0,
              url: '/userManage/feedback',
            }
          ]
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

    },
    methods: {
      /**
       * 操作行
       * @param {Object} dialogType dialog内容显示类型 0: '跳转' 其他：弹出
       * @param {Object} row 选择当前数据
       */
      setRow(dialogType, row, srow) {
        switch (dialogType) {
          case 0:
            this.$router.push({
              path: srow.url
            })
          break
          default:
            this.dialogType = dialogType
            this.curRow = row
            this.dform = {}
            if(dialogType == 1){
              this.$set(this.dform, 'wifi_pwd', [{}])
            }else if(dialogType == 2){
              this.$set(this.dform, 'mobile', [{}])
            }
            this.dialogStatus = true
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
</style>
