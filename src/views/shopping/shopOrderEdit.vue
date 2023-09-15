<template>
    <div>
        <el-row class="pl-30 pr-30 custom-form bg-white">
            <el-col :xs="24" :sm="18" :md="12" :lg="10">
                <el-form ref="form" :rules="rules" :model="form" label-width="120px" label-position="left">
                    <h4>基础信息</h4>
                    <el-form-item label="设备类型" prop="deviceTypeCode">
                        <el-radio-group v-model="form.deviceTypeCode" prop="deviceTypeCode" class="pl-10">
                            <el-radio v-for="(name, code) in myDeviceId" :label="code" class="raiod_margin">{{ name
                            }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item ref="pictures" label="商品图片" prop="productUrlList">
                        <upload v-model="form.productUrlList" :limit="1" />
                    </el-form-item>
                    <el-form-item label="商品名称" prop="productName">
                        <el-input v-model="form.productName" placeholder="输入商品名称" />
                    </el-form-item>
                    <el-form-item label="设备寿命特点" prop="productContent">
                        <el-input v-model="form.productContent" placeholder="输入设备寿命特点" />
                        <div class="message ">设备寿命特点:当达到累计使用次数或累计使用时间时，建议相关人员对设备进行检修，以保障用户能够持续正常使用设备</div>
                    </el-form-item>
                    <el-form-item label="工厂选择" prop="factoryId">
                        <el-select v-model="form.factoryId" placeholder="请选择">
                            <el-option v-for="(item, index) in plantList" :key="index" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <!-- <el-form-item label="品牌商" prop="brandId">
                        <el-select v-model="form.brandId" placeholder="请选择">
                            <el-option v-for="(item, index) in brandList" :key="index" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item> -->
                    <el-form-item label="商品详情">
                        <tinymce ref="rContent" v-model="form.productDetail" :height="300" />
                    </el-form-item>
                    <el-form-item label="详细介绍" prop="productRemark">
                        <div v-for="(item, index) in form.productRemark" class="flex_j mark_box">
                            <el-input v-model="item.text" placeholder="例如：保修年限" />
                            <el-input v-model="item.text1" placeholder="1年" class="ml-10" />
                            <div class="m_l_a right_add" @click="addmarkChange()" v-if="index == 0">
                                新增
                            </div>
                            <div class="m_l_a right_add delete" @click="deleteChange(index, 1)" v-if="index > 0">
                                删除
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="设备规格及价格" prop="productStandardList">
                        <div v-for="(item, index) in form.productStandardList" class="flex_j mark_box">
                            <el-input v-model="item.number" placeholder="请输入" />
                            <span> </span>
                            <el-input v-model="item.price" placeholder="请输入" class="ml-10" />
                            <span>元/台</span>
                            <div class="m_l_a right_add" @click="addsizeChange()" v-if="index == 0">
                                新增
                            </div>
                            <div class="m_l_a right_add delete" @click="deleteChange(index, 2)" v-if="index > 0">
                                删除
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit('form')" :disabled="clickSubmit">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>
    
<script>
import upload from '@/components/upload'
import { pickKeys,currentTime } from '@/utils/index'
import Tinymce from '@/components/Tinymce/'
export default {
    components: {
        upload,
        Tinymce
    },
    data() {
        return {
            tinymceDescID: `app_desc_${currentTime()}`,
            tinymceFulID: `app_ful_${currentTime()}`,
            clickSubmit: false,
            form: {
                deviceTypeCode: '',
                productName: '',
                productUrlList: '',
                productContent: '',
                factoryId: '',
                productRemark: [{
                    text: '',
                    text1: ''
                }],
                productStandardList: [{
                    number: '',
                    price: '',
                }],
                productDetail:'',
            },
            rules: {
                deviceTypeCode: [
                    { required: true, message: '请填写关联设备类型', trigger: 'change' }
                ],
                productName: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                productUrlList: [
                    { required: true, message: '请选择上传商品图片', trigger: 'blur' }
                ],
                productContent: [
                    { required: true, message: '请输入设备寿命特点', trigger: 'blur' }
                ],
                factoryId: [
                    { required: true, message: '请选择工厂', trigger: 'blur' }
                ],
                productRemark: [
                    { required: true, message: '请输入详情介绍', trigger: 'blur' }
                ],
                productStandardList: [
                    { required: true, message: '请输入设备规格及价格', trigger: 'blur' }
                ],
            },
            cityList: [],
            plantList: [],
            brandList: [],
        }
    },
    computed: {
        myDeviceId() {
            return this.$store.getters.myDeviceId
        },
    },
    mounted() {
        this.getCity()
        this.getplantList();
        this.getbrandList();
        let id = this.$route.query.id;
        if (id) this.getList(id);
    },
    methods: {
        deleteChange(index, type) {
            if (type == 2) {
                this.form.productStandardList.splice(index, 1);
            } else {
                this.form.productRemark.splice(index, 1);
            }

        },

        // 获取详情数据
        getList(id) {
            this.$get(`iot-saas-order/admin/product/detail/${id}`, { id: id }).then(res => {
                this.form = res;   
                this.form.productUrlList = res.productUrlList.join(',');
                this.plantList.forEach(list=>{
                    console.log(list.id,res.factoryCode)
                    if(list.factoryCode == res.factoryCode){
                        this.form.factoryId = list.name;
                    }
                })            
                this.form.productRemark = JSON.parse(this.form.productRemark);
                this.$nextTick(()=>{
                    this.$refs['rContent'].setContent(this.form.productDetail);  
                })
                                      
            }).catch(() => {
            })
        },
        addmarkChange() {
            let obj = {
                text: '',
                text1: '',
            }
            this.form.productRemark.push(obj);
        },
        addsizeChange() {
            let obj = {
                number: '',
                price: '',
            }
            this.form.productStandardList.push(obj);
            console.log()
        },
        /**
         * 提交
         * @param {Object} formName
         */
        onSubmit(formName) {
            let params = JSON.parse(JSON.stringify(this.form)), url = 'iot-saas-order/admin/product/save'
            if (Array.isArray(params.province) && params.province.length > 0) {
                params.district = params.province[2]
                params.city = params.province[1]
                params.province = params.province[0]
            }
            params.productRemark = JSON.stringify(params.productRemark);
            this.plantList.forEach(res => {
                if (this.form.factoryId == res.id) {
                    params.factoryCode = res.code;
                }
            })
            this.clickSubmit = true
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (params.id > 0) {
                        url = `iot-saas-order/admin/product/update/${params.id}`
                        // params.factoryId = params.id;
                        // params.productUrlList = params.productUrlList.join(',')
                    }
                    this.$post(url, params).then(res => {
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        })
                        this.$router.push({
                            path: '/shopping/equipment'
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
        },

        /**
         * 获取城市
         */
        getCity() {
            this.$store.dispatch('api/getRegions').then(res => {
                let list = {}, areaId = ''
                res.map(item => {
                    if (item.level == 1) {
                        list[item.tag] = {
                            value: item.title,
                            label: item.title,
                            children: {}
                        }
                    } else if (item.level == 2) {
                        let tag = item.tag.substring(0, 3)
                        list[tag].children[item.tag] = {
                            value: item.title,
                            label: item.title,
                            children: []
                        }
                    } else if (item.level == 3) {
                        areaId = areaId || item.tag
                        let tag1 = item.tag.substring(0, 3), tag2 = item.tag.substring(0, 6)
                        list[tag1].children[tag2].children.push({
                            value: item.title,
                            label: item.title
                        })
                    }
                })
                list = Object.values(list)
                list.map(item => {
                    if (JSON.stringify(item.children) == '{}') {
                        item.children = []
                    } else {
                        item.children = Object.values(item.children)
                    }
                    return item
                })
                this.cityList = list
            })
        },
        /**
       * 获取工厂列表
       */
        getplantList() {
            const params = {};
            this.$get('iot-saas-basic/admin/factory/list', params).then(res => {
                this.plantList = res;
            }).catch(() => {
            })
        },
        /**
       * 获取品牌列表
       */
        getbrandList() {
            let params = {
                page: 0,
                size: 100,
            }
            this.$get('iot-saas-basic/admin/brand/findPage', params).then(res => {
                this.brandList = res.rows
            }).catch(() => {
            })
        },
    }
}
</script>
    
<style scoped>
.el-radio {
    margin-top: 10px;
}

.message {
    color: #ccc;
    font-size: 12px;
    line-height: 20px;
}

.mark_box {
    position: relative;
}

.mark_box span {
    flex-shrink: 0;
    margin-left: 10px;
}

.right_add {
    position: absolute;
    right: -48px;
    top: 0;
    margin-left: 10px;
    flex-shrink: 0;
    color: #165DFF;
}

.delete {
    color: #e54d42;
}
</style>
    