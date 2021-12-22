<template>
  <div class="p-5">
    <div class="pl-20 pr-20 pb-10 bg-white">
      <el-button class="mb-20 mt-20" type="success" @click="save_plan.push(defaultAd)">添加广告</el-button>
      <el-form ref="form" label-width="auto">
        <el-table
          :data="save_plan"
          border
          style="width: 100%">
          <el-table-column
            label="广告图片(2:1)" width="150">
            <template slot-scope="scope">
              <upload v-model="scope.row.banner_url" ratio=""/>
            </template>
          </el-table-column>

          <el-table-column label="跳转小程序APPID" width="350">
            <template slot-scope="scope">
              <el-form-item class="mb-10" label="微信：">
                <el-input v-model="scope.row.wx_appid" placeholder="请输入微信小程序APPID"/>
              </el-form-item>
              <el-form-item class="mb-0" label="支付宝：">
                <el-input v-model="scope.row.zfb_appid" placeholder="请输入支付宝小程序APPID"/>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="页面路径">
            <template slot-scope="scope">
              <el-form-item class="mb-10" label="微信：">
                <el-input v-model="scope.row.wx_jump_url" placeholder="请输入微信小程序页面路径"/>
              </el-form-item>
              <el-form-item class="mb-0" label="支付宝：">
                <el-input v-model="scope.row.zfb_jump_url" placeholder="请输入支付宝小程序页面路径"/>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="展示设备" width="200">
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.depend_type">
                <el-checkbox :label="item" v-for="(item, key) in myDeviceName">{{ key }}</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>


          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" round @click="save_plan.splice(scope.$index, 1)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-form-item class="mt-30">
          <el-button type="primary" @click="onSubmit">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import upload from '@/components/upload/two'
  export default {
    components: {
      upload
    },
    data() {
      return {
        id: this.$route.params.id,
        save_plan: [],
        defaultAd: {
          depend_type: []
        }
      }
    },
    computed: {
      myDeviceName() {
        return this.$store.getters.myDeviceName
      }
    },
    mounted() {
      this.getInfo()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('wxapi/store/outer_banners', {
          store_id: this.id,
          depend_type: -1
        }).then(res => {
          this.save_plan = res.banner_list
        })
      },

      onSubmit() {
        let params = {}
        params.save_plan = this.save_plan
        params.store_id = this.id
        this.$post('agentapi/store/save_outer_banners', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .avatar-uploader{
    .avatar-uploader-icon{
      height: 50px;
      line-height: 50px;
    }
  }
</style>
