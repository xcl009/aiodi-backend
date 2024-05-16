<template>
    <div>
        <el-row class="pl-30 pr-30 custom-form bg-white">
            <el-col :xs="24" :sm="18" :md="12" :lg="10">
                <h4>{{ $t('public.basicInformation') }}</h4>
                <el-form ref="form" :rules="rules" :model="form" label-width="auto">
                    <el-form-item :label="$t('activity.prizeName')" prop="prizeName">
                        <el-input v-model="form.prizeName" />
                    </el-form-item>
                    <el-form-item ref="prizePicture"  :label="$t('activity.prizeImg')" prop="prizePicture">
                        <upload v-model="form.prizePicture" :limit="1" />
                    </el-form-item>
                    <el-form-item :label="$t('activity.prizePrice')"  prop="prizePrice">
                        <el-input v-model="form.prizePrice" />
                    </el-form-item>
                    <el-form-item :label="$t('activity.prizeLowestPrize')" prop="prizeLowestPrize">
                        <el-input v-model="form.prizeLowestPrize" />
                    </el-form-item>
                    <el-form-item  :label="$t('activity.prizeContent')" prop="prizeContent">
                        <el-input v-model="form.prizeContent" />
                    </el-form-item>
                    <el-form-item :label="$t('public.status')" prop="status">
                        <el-radio-group v-model="form.status">
                            <el-radio :label="1">{{ $t('public.open') }}</el-radio>
                            <el-radio :label="0">{{ $t('public.close') }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('public.remark')" prop="remark">
                        <el-input v-model="form.remark" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">{{
                $t('public.submit')
                            }}</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import upload from '@/components/upload'
export default {
    components: {
        upload
    },
    data() {
        return {
            clickSubmit: false,
            form: {
                status:1
            },
            id: this.$route.query.id || '',
            pickerOptions: {
                disabledDate: (time) => {
                    return time.getTime() + 86400000 < Date.now()
                }
            },
        }
    },
    computed: {
        siteInfo() {
            return this.$store.getters.siteInfo
        },
        agentInfo() {
            return this.$store.getters.agentInfo
        },
        rules() {
            return {
                prizeName: [
                    { required: true, message:  `${this.$t('public.enter')}${this.$t('activity.prizeName')}`, trigger: 'blur' }
                ],
                prizePicture: [{
                    required: true,
                    message: `${this.$t('activity.plaseImg')}`,
                    trigger: 'blur'
                }],
                prizePrice: [
                    { required: true, message: `${this.$t('public.enter')}${this.$t('activity.prizePrice')}`, trigger: 'blur' }
                ],
                prizeLowestPrize: [
                    { required: true, message:  `${this.$t('public.enter')}${this.$t('activity.prizeLowestPrize')}`, trigger: 'blur' }
                ],
                prizeContent: [
                    { required: true, message: `${this.$t('public.enter')}${this.$t('activity.prizeContent')}`, trigger: 'blur' }
                ],
            }
        },
    },
    mounted() {
        this.form = {
            status:1
        };
        if (this.id) {
            this.getInfo()
        }
    },
    methods: {
        /**
         * 获取信息
         */
        getInfo() {
            console.log('zhixingl')
            this.$get(`iot-saas-activity/admin/v2/prizeInfo/find/${this.id}`).then(res => {
                this.form = res
                this.form.status = parseInt(this.form.status);
            })
        },

        /**
         * 提交添加
         */
        onSubmit() {
            let that = this
            let params = {}, url = 'iot-saas-activity/admin/v2/prizeInfo'
            params = JSON.parse(JSON.stringify(this.form))
            params.brandId = this.agentInfo.brandId
            delete params.createTime;
            this.clickSubmit = true
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (this.id) {
                        url = `iot-saas-activity/admin/v2/prizeInfo/update/${this.id}`
                    }
                    this.clickSubmit = true
                    this.$post(url, params).then(res => {
                        this.$message({
                            message: that.$t('public.submittedSuccess'),
                            type: 'success'
                        })
                        this.$router.push({
                            path: 'prize'
                        })
                    }).catch(err => {
                        setTimeout(() => {
                            this.clickSubmit = false
                        }, 1000)
                    })
                } else {
                    this.clickSubmit = false
                }
            })
        }
    }
}
</script>

<style scoped></style>