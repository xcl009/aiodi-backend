<template>
  <el-row type="flex" justify="center" align="middle" class="p-30 custom-form bg-white">
    <el-col :xs="24" :sm="18" :md="14" :lg="10" :xl="8">
      <el-form ref="form" :model="form" :rules="rules" :hide-required-asterisk="true" label-width="auto">
        <el-form-item label="设备SN" prop="deviceSn">
          <el-input v-model="form.deviceSn" />
          <div>多设备切换用英文逗号(,)隔开</div>
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model="form.url" placeholder="域名:端口" />
          <div>暂只支持天聚充电宝设备且设备需已在线。请仔细确认设备链接地址是否正确，地址不正确会导致设备无法联网</div>
        </el-form-item>
        <div class="p-10 pt-10 mt-50 flex">
          <el-button class="flex1" type="primary" @click="onSubmit" :disabled="clickSubmit">确定</el-button>
        </div>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import {
    arrayToObj
  } from '@/utils/index'
  export default {
    components: {

    },
    data() {
      return {
        clickSubmit: false,
        form: {},
      }
    },
    computed: {
      rules() {
        return {
          deviceSn: [{
            required: true,
            message: '设备SN必须填写',
            trigger: 'blur'
          }],
          url: [{
            required: true,
            message: '设备链接地址必须填写',
            trigger: 'blur'
          }]
        }
      },
    },
    mounted() {

    },
    methods: {
      /**
       * 点击提交按钮
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        this.clickSubmit = true
        this.$refs['form'].validate((valid, object) => {
          if (valid) {
            this.loadObj = this.$loading({
              lock: true,
              text: '指令下发中',
              spinner: 'el-icon-loading'
            })
            this.setDomain(params.deviceSn.split(','), params)
          } else {
            this.clickSubmit = false
          }
        })
      },

      /**
       * 提交设置
       */
      setDomain(snArr, params, idx = 0) {
        if (!snArr[idx]) {
          this.$message({
            message: '下发指令成功，可等待60s后将设备断电重启，若未切换成功可重试',
            type: 'success'
          })
          this.loadObj.close()
          this.clickSubmit = false
          return
        }
        params.deviceSn = snArr[idx]
        this.$get('iot-saas-device/admin/device/setDeviceDomain', params).then(res => {
          idx++
          this.setDomain(snArr, params, idx)
        }).catch(err => {
          this.clickSubmit = false
          this.loadObj.close()
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .custom-form {
    min-height: 81vh;
  }
</style>