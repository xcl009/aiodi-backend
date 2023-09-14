<template>
    <div>

        <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
            <template v-slot:tabs>
                <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
                    <div class="mr-10">设备类型</div>
                    <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
                        <el-tab-pane label="全部设备" :name="''" />
                        <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName" />
                    </el-tabs>
                </div>
            </template>

            <template v-slot:defult>
                <el-form-item label="工厂名称">
                    <el-input v-model="form.factoryName" placeholder="工厂名称" />
                </el-form-item>
                <el-form-item label="设备名称">
                    <el-input v-model="form.productName" placeholder="设备名称" />
                </el-form-item>
                <el-form-item>
                    <el-input placeholder="最低金额" v-model="form.minPrice">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    -
                </el-form-item>
                <el-form-item label-width="0">
                    <el-input placeholder="最高金额" v-model="form.maxPrice">
                    </el-input>
                </el-form-item>
            </template>
            <template v-slot:endButton>
                <el-button type="primary" size="small" @click="$router.push({ path: `/shopping/shopOrderEdit` })"><i
                        class="el-icon-circle-plus-outline el-icon--left" />新增设备</el-button>
            </template>
        </condition>


        <div class="pb-20 load-box" v-infinite-scroll="loadPage">
            <div class="p-30 text-center bg-white" v-if="list == 0">
                请新增设备
            </div>
            <el-row :gutter="20">
                <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="(item, index) in list">
                    <div class=" list-item cursor bg-white shop_box">
                        <div class="und">
                            <el-button :type="item.status == 0 ?'success':'danger' " @click="undChange(item,index)">{{ item.status == 0 ?'上架':'下架' }}</el-button>
                        </div>
                        <el-image class="list-img" :src="item.productUrlList[0]" fit="cover"></el-image>
                        <div class=" p-20">
                            <div class="mt-15 text-black fs-c1">
                                {{ item.productName }}
                            </div>
                            <div class="mt-15  text-cut_two flex_j fs-b2 red_color">
                                {{ priceChange(item,item.productStandardList) }}
                            </div>
                            <div class="text-right">
                                设备寿命特点:{{ item.productContent }}
                            </div>
                            <div class="mt-15 flex align-center">
                                <template>
                                    <div class="flex1">
                                        <img src="@/assets/gongchang-fill.svg" /> {{ item.factoryName }}
                                    </div>
                                </template>
                                <el-button type="primary" size="medium"
                                    @click="$router.push({ path: `/shopping/shopOrderEdit?id=${item.id}` })">立即修改</el-button>
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>
  
<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
export default {
    name: 'shopping',
    components: {
        Pagination,
        condition,
        TableColumnSet,
        condition,
        selectSearch
    },
    data() {
        return {
            clickSubmit_type: false,
            form: {},
            clickSubmit: false,
            tabs: [],
            form: {},
            list: [],
            listTotal: 0,
            listQuery: {
                page: 1,
                size: 50,
                deviceTypeCode: '0',
            },

            brandId: this.$route.query.brandId || '',

            // 弹出相关
            dialogType: 1,
            drawerStatus: false,
            dialogTitle: {
                1: '充电宝选购',
                2: '',
            },
            curRow: {},
            curIdx: 0,
            dform: {},
            num: 0,
        }
    },
    computed: {
        siteInfo() {
            return this.$store.getters.siteInfo
        },
        agentInfo() {
            return this.$store.getters.agentInfo
        },
        myDeviceName() {
            return this.$store.getters.myDeviceName
        },
        myDeviceId() {
            return this.$store.getters.myDeviceId
        },
    },
    mounted() {
        this.getList()
    },
    methods: {
        priceChange(item,arr) {
            if(arr.length == 0) return '';
            let type = item.deviceTypeCode.indexOf('PL') != -1;
            if (arr.length > 1) {
                let numArr = [];
                arr.forEach(res => {
                    if (res.price) {
                        numArr.push(res.price);
                    }
                })
                
                let sortArr = numArr.sort((a, b) => a - b);
                let text ='';
                arr.forEach(res=>{
                    if(res.price == `${sortArr[sortArr.length - 1]}`){
                          text = res.number.substr(arr[0].number.length - 1,1);
                    }
                })
                return `￥${sortArr[0]}-${sortArr[sortArr.length - 1]}/${text}`
            } else {
               
                return `￥${arr[0].price}/${arr[0].number.substr(arr[0].number.length - 1,1)}`
            }

        },
        // 下架
        undChange(item,index) {
            let that = this;
            let text = item.status == 1 ?  '此操作将下架商品, 是否继续?':'此操作将上架商品, 是否继续?';
            this.$confirm(text, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {

                this.$post(`iot-saas-order/admin/product/upDown/${item.id}/${item.status == 1 ? 0 : 1}`, {}).then((res = {}) => {
                    this.$message({
                        message: '操作成功！',
                        type: 'success'
                    })
                    this.list[index].status = item.status == 1 ? 0 : 1;
                }).catch(() => {
                    this.$message({
                        message: '操作失败！请稍后再试',
                        type: 'success'
                    })
                })
            })

        },
        // 支付事件
        onSubmit(type) {
            switch (type) {
                case 2:
                    this.dialogType = 3;
            }
            console.log('调起支付')
        },
        /**
         * 搜索查询
         */
        toQuery() {
            if (this.clickSubmit) return
            this.clickSubmit = true
            this.listQuery.page = 1
            this.list = []
            this.getList()
        },

        /**
         * 重置查询
         */
        reset() {
            this.form = {}
            this.listQuery.page = 1
            this.listQuery.size = 24
            this.list = []
            this.getList()
        },

        /**
         * 获取列表
         */
        getList() {
            var params = Object.assign({}, this.form, this.listQuery, {
                page: this.listQuery.page - 1
            })
            if (params.deviceTypeCode == 0) {
                delete params.deviceTypeCode
                this.listQuery.deviceTypeCode = '0'
            }
            this.$get('iot-saas-order/admin/product/findPage', params).then((res = {}) => {
                this.list = this.list.concat(res.rows || [])
                this.clickSubmit = false
                if (params.page == 0) {
                    this.listTotal = res.total || 0
                }
                this.onLoadPage = false
            }).catch(() => {
                this.clickSubmit = false
            })
        },

        /**
         * 加载更多
         */
        loadPage() {
            if ((parseInt(this.listTotal) / this.listQuery.size) > this.listQuery.page && !this.onLoadPage) {
                this.onLoadPage = true
                this.listQuery.page++
                this.getList()
            }
        },

        /**
         * 操作
         * @param {Object} type 1 dialog类型
         * @param {Object} row 选择当前数据
         * @param {Object} dialogType dialog内容显示类型 1: '赠送服务'
         * @param {Object} idx 当前数据所在位置
         */
        setRows(type, row, dialogType, idx) {
            switch (type) {
                case 1:
                    this.dialogType = dialogType
                    this.drawerStatus = true
                    break
            }
        },

    }
}
</script>
  
<style lang="scss" scoped>
@import './list.scss';
</style>
  