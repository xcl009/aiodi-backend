<template>
    <div>
        <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
            <template v-slot:defult>
                <el-form-item :label="$t('activity.activityName')">
                    <el-input v-model="form.name" :placeholder="`${$t('public.enter')}${$t('activity.activityName')}`" />
                </el-form-item>
                <el-form-item :label="$t('public.status')">
                    <el-select v-model="form.status" @change="toQuery()" :placeholder="$t('public.status')">
                        <el-option :label="$t('public.close')" :value="0" />
                        <el-option :label="$t('public.open')" :value="1" />
                    </el-select>
                </el-form-item>
            </template>
            <template v-slot:endButton>
            </template>
        </condition>

        <div class="pl-10 pr-10 bg-white">
            <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
                element-loading-text="Loading" :max-height="tableMaxH">
                <el-table-column :label="$t('activity.activityName')" width="130">
                    <template slot-scope="scope">
                        <div class="mb-5">{{ scope.row.name }}</div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('activity.typeName')" width="130">
                    <template slot-scope="scope">
                        <div class="mb-5">{{ $t('activity.onePurchase') }}</div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('activity.countTotal')">
                    <template slot-scope="scope">
                        <div class="mb-5">{{ scope.row.countTotal }}</div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('activity.countPrice')">
                    <template slot-scope="scope">
                        <div class="mb-5">{{ scope.row.countPrice }}</div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('public.status')">
                    <template slot-scope="scope">
                        <el-button type="success" v-if="scope.row.status == 1" size="mini">{{ $t('public.open') }}</el-button>
                        <el-button type="info" v-else size="mini">{{ $t('public.close') }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('public.endTime')" width="230">
                    <template slot-scope="scope">
                        <div class="mb-5">{{ scope.row.endTime }}</div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('public.remark')">
                    <template slot-scope="scope">
                        <div class="mb-5">{{ scope.row.remark }}</div>
                    </template>
                </el-table-column>

            </el-table>

            <div class="flex justify-center">
                <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
                    :total="parseInt(listTotal)" @pagination="getList" />
            </div>
        </div>
    </div>
</template>

<script>

import { arrayToObj, unixTime } from '@/utils/index'
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import VendorMode from '@/components/VendorMode/'
import AssignAbility from '@/components/AssignAbility/'
import ImportData from '@/components/ImportData/'
import selectSearch from '@/components/condition/selectSearch'
import UpdateBlance from '@/components/UpdateBlance/'
export default {
    name: 'agent',
    components: {
        Pagination,
        condition,
        VendorMode,
        AssignAbility,
        ImportData,
        selectSearch,
        UpdateBlance
    },
    props: {
        lowerAgent: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            arrayToObj: arrayToObj,
            clickSubmit: false,
            form: {},
            tableMaxH: '250',
            list: [],
            listLoading: true,
            listTotal: 0,
            listQuery: {},

            orderCount: {},
            deviceCount: {},
            cashStat: {},

            deviceSns: '',

            // 弹出相关
            dialogType: 1,
            dialogStatus: false,
            curRow: {},
            curIdx: 0,
            dform: {},
            drawerStatus: false,

            agentRow: {}, //分配代理选择的代理信息
            // 代理
            agentList: {
                query: {
                    page: 1,
                    size: 20
                },
                list: [],
                newly: []
            },
            // 商户
            agentList: {
                query: {
                    page: 1,
                    size: 20
                },
                list: [],
                newly: []
            },
            checkList: {},
        }
    },
    beforeRouteEnter(to, from, next) {
        if (from.name == 'addAgent') {
            to.meta.reload = true
        } else {
            to.meta.reload = false
        }
        next()
    },
    activated() {
        let queryKey = ['deviceSns'],
            query = this.$route.query
        for (var i in queryKey) {
            this[queryKey[i]] = query[queryKey[i]]
        }
        if (this.$route.meta.reload) {
            this.toQuery()
        } else if (!this.list || this.list.length == 0) {
            this.toQuery(1)
        } else {
            this.toQuery()
        }
    },
    computed: {
        device() {
            return this.$store.state.app.device
        },
        siteInfo() {
            return this.$store.getters.siteInfo
        },
        myDeviceName() {
            return this.$store.state.user.myDeviceName
        },
        myDeviceId() {
            return this.$store.state.user.myDeviceId
        },
        agentInfo() {
            return this.$store.getters.agentInfo
        },
        Ability() {
            return this.$store.getters.Ability
        },
    },
    methods: {
        deleteChange(e, i) {
            let that = this;
            this.$get(`iot-saas-activity/admin/v2/activity/delete/${e.id}`).then(res => {
                this.dialogStatus = false
                this.$message({
                    message: that.$t('public.deleteSuccess'),
                    type: 'success'
                })
                this.list.splice(i, 1)
                this.clickSubmit = false
            }).catch(err => {
                this.clickSubmit = false
            })
        },
        /**
         * 搜索查询
         */
        toQuery() {
            if (this.clickSubmit) return
            this.clickSubmit = true
            this.listQuery.page = 1
            this.listQuery.size = 20
            this.getList()
        },

        /**
         * 重置查询
         */
        reset() {
            this.form = {
            }
            this.listQuery.page = 1
            this.listQuery.size = 20
            this.getList()
        },

        /**
         * 获取列表
         */
        getList() {
            var params = Object.assign({}, this.form, this.listQuery, {
                page: this.listQuery.page - 1
            })
            this.$post('iot-saas-activity/admin/v2/activity/record/findActivityWinnerPage', params).then(res => {
                this.list = res.rows
                this.listLoading = false
                this.clickSubmit = false
                if (params.page == 0) {
                    this.listTotal = res.total
                    this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
                }
            }).catch(() => {
                this.listLoading = false
                this.clickSubmit = false
            })
        },


    }
}
</script>

<style lang="scss" scoped>
.userimg {
    width: 56px;
    height: 56px;
    border-radius: 50%;
}

.color {
    color: #86909C;
}

.color1 {
    color: #1D2129;
}

.color2 {
    color: #4E5969;
}

.flexv {
    position: relative;

    .bottom {
        position: absolute;
        width: 96%;
        bottom: 0;
        border-top: 1px solid var(--color-border-2, #E5E6EB);
        background: #FFF;
    }
}

.fw6 {
    font-weight: 600;
}

.title {
    min-width: 120px;
}

.prizePictureImg {
    width: 80px;
    height: 80px;
    border-radius: 12px;
}
</style>