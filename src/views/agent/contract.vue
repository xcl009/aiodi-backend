<template>
  <div class="p-10">
    <el-row class="p-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="auto">
          <el-form-item label="合同照片：">
            <upload v-model="form.contract_url" :emitUrl="false" :limit="99"/>
          </el-form-item>
          <el-form-item label="身份信息：">
            <upload v-model="form.identity_url" :emitUrl="false" :limit="99"/>
          </el-form-item>
          <el-form-item label="其他信息：">
            <upload v-model="form.extra_url" :emitUrl="false" :limit="99"/>
          </el-form-item>
          <template v-if="level == 1 && checkRoles(['terminal'])">
            <el-form-item ref="form" label="合同时间类型：">
              <el-radio-group v-model="form.date_type">
                <el-radio-button label="2">月付</el-radio-button>
                <el-radio-button label="1">年付</el-radio-button>
                <el-radio-button label="0">永久</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="已缴押金：" v-if="form.date_type == 2">
              <el-input v-model="form.taked_deposite">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="已付月数：" v-if="form.date_type == 2 || form.date_type == 1">
              <el-input v-model="form.taked_months">
                <template slot="append">月</template>
              </el-input>
            </el-form-item>
            <el-form-item label="合同开始时间：" v-if="form.date_type == 1 || form.date_type == 2">
              <el-date-picker
                v-model="form.begin"
                type="date"
                placeholder="开始时间"
                value-format="timestamp"
                style="width: 100%;"
              />
            </el-form-item>
          </template>
          <!-- <el-form-item label="合同结束时间：" v-if="form.date_type == 1 || form.date_type == 2">
            <el-date-picker
              v-model="form.end"
              type="date"
              placeholder="结束时间"
              value-format="timestamp"
              style="width: 100%;"
            />
          </el-form-item> -->
          <!-- <el-form-item label="合同服务费用：" v-if="form.date_type == 1">
            <el-input v-model="form.contract_renew_fee">
              <template slot="append">元</template>
            </el-input>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="onSubmit()">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload/two.vue'
  export default {
    components: {
      upload
    },
    data() {
      return {
        form: {

        },
        son_id: this.$route.query.son_id,
        level: this.$route.query.level || 1
      }
    },
    mounted() {
      this.getDetail()
    },
    methods: {
      /**
       * 获取信息
       */
      getDetail() {
        let url = 'agentapi/sttuf/check_contract'
        if (this.level == 1 && this.checkRoles(['terminal'])) url = 'agentapi/sttuf/check_platform_contract'
        this.$get(url, {
          aid: this.son_id
        }).then(res => {
          let form = this.pickKeys(res, ['date_type', 'begin', 'contract_renew_fee', 'taked_deposite', 'taked_months'])
          if(this.level == 1 && this.checkRoles(['terminal'])){
            form.begin = form.begin ? form.begin + '000' : form.begin
            form.end = form.end ? form.end + '000' : form.end
            form.date_type = form.date_type == null ? 1 : form.date_type
          }
          for(var i in res.contract_url){
            form.contract_url = form.contract_url || []
            form.contract_url.push({
              url: res.contract_url[i]
            })
          }
          for(var i in res.identity_url){
            form.identity_url = form.identity_url || []
            form.identity_url.push({
              url: res.identity_url[i]
            })
          }
          for(var i in res.extra_url){
            form.extra_url = form.extra_url || []
            form.extra_url.push({
              url: res.extra_url[i]
            })
          }
          this.form = form
        })
      },

      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form)), url = 'agentapi/sttuf/edit_contract'
        params.aid = this.son_id
        params.contract_url = this.arrayKeys(params.contract_url, 'url')
        params.identity_url = this.arrayKeys(params.identity_url, 'url')
        params.extra_url = this.arrayKeys(params.extra_url, 'url')
        if (this.level == 1 && this.checkRoles(['terminal'])){
          url = 'agentapi/sttuf/edit_platform_contract'
        }
        this.$post(url, params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          history.back()
        })
      }
    }
  }
</script>

<style scoped>

</style>
