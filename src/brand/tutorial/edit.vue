<template>
  <div class="p-10">
    <el-row class="p-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="封面图：">
            <upload :file-list="fileList" @fileOk="fileOk" />
            <el-input v-model="form.img_url" class="abs" type="hidden" />
          </el-form-item>
          <el-form-item ref="store_name" label="标题：">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="投放范围：">
            <el-switch v-model="form.is_all" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item v-if="throw_agent_level && form.is_all == 0" label="范围：">
            <div class="flex">
              <el-checkbox-group v-model="throw_agent_level" size="small">
                <el-checkbox v-for="item in roles" :key="item.level" :label="item.level">{{ item.title }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
          <el-form-item label="介绍：">
            <tinymce v-model="form.content" :height="300" />
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
import Tinymce from '@/components/Tinymce'
export default {
  name: 'TutorialEdit',
  components: {
    upload,
    Tinymce
  },
  data() {
    return {
      roles: [{
        title: '全部',
        level: 0
      },
      {
        title: '总后台',
        level: 1
      },
      {
        title: '城市合伙人',
        level: 2
      },
      {
        title: '代理商',
        level: 3
      },
      {
        title: '业务员',
        level: 4
      },
      {
        title: '商家',
        level: 5
      }
      ],
      agentInfo: {},
      siteInfo: {},
      form: {
        article_type: this.$route.query.type || 0,
        role_id: 0,
        is_all: 0
      },
      throw_agent_level: '',
      fileList: [],
      role: [],
      id: this.$route.query.id || ''
    }
  },
  mounted() {
    this.siteInfo = window.siteInfo
    this.agentInfo = window.agentInfo
    this.roles = this.roles.splice(-(5 - this.agentInfo.agent_level))
    if (this.id > 0) {
      this.getInfo()
    } else {
      this.throw_agent_level = []
    }
    this.getPower()
  },
  methods: {
    /**
       * 获取权限
       */
    getPower() {
      this.$get('agentapi/add_agent').then(res => {
        this.role = res.give_role_right
      })
    },

    /**
       * 获取信息
       */
    getInfo() {
      this.$get('agentapi/article/detail', {
        id: this.id
      }).then(res => {
        this.form = res.info
        this.fileList = [{
          url: res.info.img_url
        }]
        this.throw_agent_level = res.throw_agent_level
      })
    },

    onSubmit(formName) {
      let url = 'agentapi/article/add'
      const params = JSON.parse(JSON.stringify(this.form))
      if (params.is_all == 0) params.throw_agent_level = this.throw_agent_level
      if (this.id > 0) url = 'agentapi/article/edit'
      this.$post(url, params).then(res => {
        this.$message({
          message: '提交成功',
          type: 'success'
        })
        history.go(-1)
      })
    },

    /**
       * 上传文件成功通知
       */
    fileOk(arr) {
      this.form.img_url = arr[0] || ''
    }
  }
}
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
