<template>
  <div class="p-10">
    <el-row class="p-30 bg-white">
      <el-col :span="16">
        <el-form ref="form" :rules="rules" :model="form" label-width="180px">
          <el-form-item label="问题类型：">
            <el-select v-model="form.type">
              <el-option :label="item.name" :value="item.type" v-for="item in issueArr"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="问题描述：">
            <el-input type="textarea" v-model="form.content" rows="4" prop="phone"></el-input>
          </el-form-item>
          <el-form-item label="错误页面截图：">
            <upload :file-list="fileList" :limit="20" @fileOk="fileOk"/>
          </el-form-item>
          <el-form-item label="联系电话：" prop="phone">
            <el-input v-model="form.mobile" placeholder="联系电话，方便我们及时跟进处理"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit('form')">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import upload from '@/components/upload'
export default {
  name: 'feedbackEdit',
  components: {
    upload,
  },
  data() {
    return {
      rules: {
        content: [
          { required: true, message: '问题描述不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '联系电话不能为空', trigger: 'blur' }
        ],
      },
      issueArr: [
        {
          type: 1,
          name: '订单问题'
        },
        {
          type: 2,
          name: '系统bug'
        },
        {
          type: 3,
          name: '其他问题'
        }
      ],
      form: {
        img_url: [],
        type: 1,
      },
      fileList: []
    }
  },
  mounted() {
    this.form.mobile = window.agentInfo.phone
  },
  methods: {
    onSubmit() {
      const params = JSON.parse(JSON.stringify(this.form))
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.$post('commonapi/feedback/add', params).then(res => {
            this.$message({
              message: '提交成功',
              type: 'success'
            })
            history.go(-1)
          })
        }
      })
    },

    /**
     * 上传文件成功通知
     */
    fileOk(arr) {
      this.form.img_url = arr
    }
  }
}
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
