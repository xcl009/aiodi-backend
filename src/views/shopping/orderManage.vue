<template>
    <div>
        <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
            <template v-slot:tabs>
                <div class="mb-10 flex align-center bg-white" v-if="myDeviceName">
                    <div class="mr-10">{{ $t('public.deviceType') }}</div>
                    <el-tabs class="flex-1" v-model="listQuery.deviceTypeCode" @tab-click="toQuery()">
                        <el-tab-pane :label="$t('public.allDevice')" :name="''" />
                        <el-tab-pane :label="index" :name="'' + item + ''" v-for="(item, index) in myDeviceName"
                            :key="index" />
                    </el-tabs>
                </div>
                <div class="mb-10 flex align-center bg-white">
                    <div class="mr-10">{{ $t('public.orderType') }}</div>
                    <el-tabs class="flex-1" v-model="listQuery.status" @tab-click="toQuery()">
                        <el-tab-pane :label="`${item.title}`" :name="'' + item.value + ''"
                            v-for="(item, index ) in orderTab" :key="index" />
                    </el-tabs>
                </div>
            </template>


            <template v-slot:defult>
                <el-form-item v-for="(item, index) in 1" :key="index">
                    <div class="flex combined">
                        <el-select v-model="formKey[`sel${item}`]" :placeholder="$t('public.pleaseSelect')">
                            <template v-for="(q, key) in queryObj">
                                <el-option :label="q.title" :value="key"
                                    v-if="checkQueryRepeat(key, item, formKey)"></el-option>
                            </template>
                        </el-select>
                        <template v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'input'">
                            <el-input :placeholder="`${$t('public.enter')}${queryObj[formKey[`sel${item}`]].title}`"
                                v-model="form[formKey[`sel${item}`]]"></el-input>
                        </template>
                        <template
                            v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'selectSearch'">
                            <selectSearch v-model="form[formKey[`sel${item}`]]"
                                :type="queryObj[formKey[`sel${item}`]].sType" :name="queryObj[formKey[`sel${item}`]].name"
                                :placeholder="`${queryObj[formKey['sel' + item]].title}`" @change="toQuery()">
                            </selectSearch>
                        </template>
                        <template
                            v-if="queryObj[formKey[`sel${item}`]] && queryObj[formKey[`sel${item}`]].type == 'select'">
                            <el-select v-model="form[formKey[`sel${item}`]]"
                                :placeholder="`${queryObj[formKey['sel' + item]].title}`" clearable @change="toQuery()">
                                <el-option :label="item.label" :value="item.value"
                                    v-for="(item, key) in queryObj[formKey[`sel${item}`]].selectArr" />
                            </el-select>
                        </template>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-date-picker class="range-day flex align-center" v-model="form.date" type="daterange"
                        range-separator="-" value-format="yyyy-MM-dd" :start-placeholder="$t('public.statrtDate')" :end-placeholder="$t('public.endDate')"
                        :picker-options="pickerOptionsEnd" @change="toQuery()">
                    </el-date-picker>
                </el-form-item>
            </template>
        </condition>

        <div class="pl-10 pr-10 bg-white">
            <div class="flex align-center pt-15 mb-15 l-t">
                <div class="flex1 fs-c1 text-black">{{ $t('public.enquiryForm') }}</div>
                <table-column-set storageKey="orderTableColumn" :showColumn.sync="showColumn"
                    :defaultColumn="defaultColumn"></table-column-set>
            </div>

            <div v-if="showColumn.length > 0">
                <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
                    :max-height="tableMaxH" element-loading-text="Loading">
                    <el-table-column :label="$t('public.brand')" width="150" prop="brandName" v-if="isSaas()"></el-table-column>

                    <template v-for="item in showColumn">
                        <el-table-column :label="$t('public.orderNum')" width="140" v-if="item.val && item.key == 'orderNo'">
                            <template slot-scope="scope">
                                {{ scope.row.orderNo || '--' }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('public.orderNum')" v-if="item.val && item.key == 'productStandardDTO'">
                            <template slot-scope="scope">
                                {{ parseFloat(scope.row.productStandardDTO.price) * scope.row.productNumber }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('public.deviceType')" v-if="item.val && item.key == 'deviceTypeCode'">
                            <template slot-scope="scope">
                                {{ myDeviceId[scope.row.deviceTypeCode] }}
                            </template>
                        </el-table-column>

                        <el-table-column :label="$t('payType.payStatus')" v-if="item.val && item.key == 'payStatus'">
                            <template slot-scope="scope">
                                {{ payStatusText[scope.row.payStatus] }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('public.orderType')" v-if="item.val && item.key == 'status'">
                            <template slot-scope="scope">
                                <el-link type="danger" v-if="scope.row.status == 0">{{ $t('public.toBePaid') }}</el-link>
                                <el-link type="primary" v-if="scope.row.status == 1">{{ $t('public.inProduction') }}</el-link>
                                <el-link type="warning" v-if="scope.row.status == 2">{{ $t('public.toBeReceived') }}</el-link>
                                <el-link type="success" v-if="scope.row.status == 3">{{ $t('public.receivedGoods') }}</el-link>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('public.orderTime')" v-if="item.val && item.key == 'orderTime'">
                            <template slot-scope="scope">
                                {{ parseTime(scope.row.orderTime) || '--' }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('public.payTime')" v-if="item.val && item.key == 'orderTime'">
                            <template slot-scope="scope">
                                {{ parseTime(scope.row.payTime) || '--' }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('public.deliveryTime')" v-if="item.val && item.key == 'orderTime'">
                            <template slot-scope="scope">
                                {{ parseTime(scope.row.receivedTime) || '--' }}
                            </template>
                        </el-table-column>

                    </template>
                    <el-table-column :label="$t('public.operate')" width="200" :fixed="device == 'desktop' ? 'right' : false">
                        <template slot-scope="scope">
                            <div class="flex flex-wrap operate">
                                <el-button type="primary" size="mini" @click="setRows(1, scope.row, 4)">{{ $t('public.particulars') }}</el-button>
                                <el-button type="warning" size="mini" v-if="scope.row.status == 0"
                                    @click="setRows(1, scope.row, 1)">{{ $t('shopping.confirmOfflinePayment') }}</el-button>
                                <el-button type="primary" size="mini" v-if="scope.row.status == 1"
                                    @click="setRows(1, scope.row, 2)">{{ $t('shopping.confirmShipment') }}</el-button>
                                <el-button type="success" size="mini" v-if="scope.row.status == 2"
                                    @click="setRows(1, scope.row, 3)">{{ $t('shopping.confirmDelivery') }}</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="flex justify-end">
                <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
                    :total="parseInt(listTotal)" @pagination="getList" />
            </div>

            <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false">

                <template v-if="dialogType == 4">
                    <div class="pl-20 pr-20 text-black">
                        <div class="mb-15">{{ $t('public.userInfo') }}</div>
                        <div class="flex align-center pb-20 l-b">
                            <img :src="curRow.userAvatar || agentInfo.avatar" class="round" width="56" alt="">
                            <div class="pl-20">
                                <div class="flex">
                                    <div class="label-text">{{ $t('public.deviceType') }}:</div>
                                    <div> {{ myDeviceId[curRow.deviceTypeCode] }}</div>
                                    <div class="ml-10 label-text">{{ $t('public.payType') }}:</div>
                                    <div>{{ payStatusText[curRow.payStatus] }}</div>
                                    <div class="ml-10 label-text">{{ $t('public.orderTime') }}:</div>
                                    <div>{{ parseTime(curRow.orderTime) || '--' }}</div>
                                </div>
                            </div>
                        </div>
                        <template v-if="!isStore()">
                            <div class="mt-20 mb-15">{{ $t('order.orderProcess') }}</div>
                            <div class="flex pb-20 timeline-box white-space text-center l-b">
                                <div class="rel pt-30 timeline-item el-icon-"
                                    v-for="(item, index) in curRow.productOrderFlows">
                                    <div class="pl-10 pr-10">
                                        <el-tooltip :content="statusText[item.status] || $t('public.notHave')" placement="top">
                                            <div class="text-cut">{{ statusText[item.status] }}</div>
                                        </el-tooltip>
                                        <div class="mt-10 fs-s2 text-gray">{{ parseTime(item.createTime) }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template>
                            <div class="mt-20 mb-15">{{ $t('public.orderInformation') }}</div>
                            <el-table border :data="curRow.productStandardDTO" class="custom">
                                <el-table-column :label="$t('public.deviceType')" align="center">
                                    <template slot-scope="scope">
                                        {{ myDeviceId[curRow.deviceTypeCode] }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('public.specifications')" align="center">
                                    <template slot-scope="scope">
                                        {{ scope.row.number }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="`${$t('public.unitPrice')}`" align="center">
                                    <template slot-scope="scope">
                                        {{ scope.row.price }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('public.number')" align="center">
                                    <template slot-scope="scope">
                                        {{ curRow.productNumber }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="`${$t('public.totalAmount')}`" align="center">
                                    <template slot-scope="scope">
                                        <span class="red_color">{{ curRow.productPrice }}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </div>
                </template>
            </el-drawer>

            <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" :close-on-press-escape="false"
                width="760px">
                <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
                <template>
                    <div class="">
                        <div class="flex_c">
                            <div>
                                <el-image :preview-src-list="[curRow.productUrlList]"  class="shop_img" :src="curRow.productUrlList" ></el-image>
                                <div class="mt-10">
                                    {{ curRow.brandName }}
                                </div>
                            </div>
                            <div class="ml-30">
                                <div class="text-bold fs-b1">{{ $t('public.orderInformation') }}</div>
                                <div class="mt-10">{{ $t('public.deviceType') }}:  {{ myDeviceId[curRow.deviceTypeCode] }}</div>
                                <div class="mt-10">{{ $t('public.equipmentAmount') }}:  {{ curRow.productPrice }}</div>
                                <div class="mt-10">{{ $t('public.orderTime') }}:  {{ parseTime(curRow.orderTime) }}</div>
                                <div class="mt-10" v-if="curRow.payTime">{{ $t('shopping.offlinePaymentTime') }} {{ parseTime(curRow.payTime) }}</div>
                            </div>
                        </div>
                        <div class="mt-30 flex_c">
                            <div>
                                {{ dialogTitle[dialogType] }}{{ $t('public.time') }}:
                            </div>
                            <div class="ml-30">
                                <el-date-picker value-format="yyyy-MM-dd hh:mm:ss" v-model="form.dateTime" type="datetime"
                                    :placeholder="$t('shopping.selectDateTime')">
                                </el-date-picker>
                            </div>
                        </div>
                    </div>
                </template>
                <div class="mt-30 text-center">
                    <el-button size="medium" class="bg-body" @click="dialogStatus = false">{{ $t('public.cancel') }}</el-button>
                    <el-button size="medium" type="primary" @click="dialogConfirm(dialogType)"
                        :disabled="clickSubmit">{{ $t('public.confirm') }}</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import TableColumnSet from '@/components/TableColumnSet/index'
import {
    dealPhone,
    showFeeMode,
    showFeeName,
    parseTime,
    unixTime,
    accAdd,
    accSub
} from '@/utils/index'

export default {
    name: 'Order',
    components: {
        TableColumnSet,
        Pagination,
        condition,
        selectSearch
    },
    props: {
        lowerAgent: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        Constant() {
            return this.$store.getters.Constant
        },
        device() {
            return this.$store.state.app.device
        },
        myDeviceName() {
            return this.$store.state.user.myDeviceName
        },
        myDeviceId() {
            return this.$store.state.user.myDeviceId
        },
        myDevice() {
            return this.$store.state.user.myDevice
        },
        agentInfo() {
            return this.$store.getters.agentInfo
        },
        siteInfo() {
            return this.$store.getters.siteInfo
        },
        Ability() {
            return this.$store.getters.Ability
        }
    },
    data() {
        return {
            dealPhone: dealPhone,
            showFeeMode: showFeeMode,
            showFeeName: showFeeName,
            accSub: accSub,
            clickSubmit: false,
            pickerOptionsEnd: {
                disabledDate: (time) => {
                    let timeOptionRange = this.timeOptionRange
                    let secondNum = 60 * 60 * 24 * 31 * 1000
                    if (timeOptionRange) {
                        return (time.getTime() > timeOptionRange.getTime() + secondNum || time.getTime() < timeOptionRange
                            .getTime() - secondNum) || time.getTime() > Date.now()
                    }
                    return time.getTime() > Date.now()
                },
                onPick: (time) => {
                    //当第一时间选中才设置禁用
                    if (time.minDate && !time.maxDate) {
                        this.timeOptionRange = time.minDate
                    }
                    if (time.maxDate) {
                        this.timeOptionRange = null
                    }
                }
            },
            orderTab: [{
                value: 'all',
                title: this.$t('public.all'),
                nkey: 'orderNumber'
            },
            {
                value: '0',
                title: this.$t('public.toBePaid'),
                nkey: 'rentingNumber'
            },
            {
                value: '1',
                title: this.$t('public.inProduction'),
                nkey: 'todayNumber'
            },
            {
                value: '2',
                title: this.$t('public.toBeReceived'),
                nkey: 'doneNumber'
            },
            {
                value: '3',
                title: this.$t('public.receivedGoods'),
                nkey: 'expiredNumber'
            },
            ],

            search_regions_tag: [],
            categoryList: [],
            areaList: [],

            tableMaxH: '250',
            listLoading: true,
            listTotal: 0,
            statInfo: {},
            list: [],
            listQuery: {
                status: 'all',
                page: 1,
                size: 20
            },

            queryObj: {
                orderNo: {
                    title: this.$t('public.orderNo'),
                    type: 'input',
                    name: 'brandName',
                },
                idLastNine: {
                    title: this.$t('public.brandNames'),
                    type: 'input',
                    name: 'brandName',
                    sType: 1
                },
            },
            formKey: {
                sel1: 'orderNo',
                sel2: 'brandName'
            },
            form: {},
            order: {},
            selID: [],

            // 弹出相关
            dialogType: 1,
            dialogStatus: false,
            drawerStatus: false,
            dialogTitle: {
                1: this.$t('shopping.confirmOfflinePayment'),
                2: this.$t('shopping.confirmShipment'),
                3: this.$t('shopping.confirmDelivery'),
                4: this.$t('public.particulars')
            },
            curRow: {},
            curIdx: 0,
            dform: {},

            /**
             * 列的配置化对象，存储配置信息
             */
            showColumn: [],
            defaultColumn: [
                {
                    key: 'orderNo',
                    val: true,
                    name: this.$t('public.orderNum')
                },
                {
                    key: 'productStandardDTO',
                    val: true,
                    name: `${this.$t('public.orderMoney')}`
                },
                {
                    key: 'deviceTypeCode',
                    val: true,
                    name: this.$t('public.deviceType')
                },
                {
                    key: 'payStatus',
                    val: true,
                    name: this.$t('payType.payStatus')
                },

                {
                    key: 'status',
                    val: true,
                    name: this.$t('public.orderType')
                },
                {
                    key: 'orderTime',
                    val: true,
                    name: this.$t('public.orderTime')
                },
                {
                    key: 'payTime',
                    val: true,
                    name: this.$t('public.payTime')
                },
                {
                    key: 'receivedTime',
                    val: true,
                    name: this.$t('public.deliveryTime')
                },
            ],
            payStatusText: [this.$t('public.unpaid'), this.$t('public.paid'), this.$t('public.offlinePayment')],
            statusText: [this.$t('public.toBePaid'), this.$t('public.inProduction'), this.$t('public.toBeReceived'), this.$t('public.receivedGoods')],
        }
    },
    mounted() {
        this.toQuery()
    },
    methods: {

        /**
         * 搜索查询
         */
        toQuery(type = 1) {
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
            if (this.clickSubmit) return
            this.clickSubmit = true
            this.form = {}
            this.listQuery.page = 1
            this.listQuery.size = 20
            this.getList()
        },

        /**
         * 获取列表
         */
        getList() {
            var url = 'iot-saas-order/admin/product/order/findPage',
                params = Object.assign({}, this.form, this.listQuery, {
                    page: this.listQuery.page - 1
                })
            if (params.date && params.date.length > 0) {
                params.startTime = params.date[0] + ' 00:00:00'
                params.endTime = params.date[1] + ' 23:59:59'
                delete params.date
            }
            if (params.status == 'all') {
                delete params.status
            }
            for (var i in this.queryKey) {
                if (this[this.queryKey[i]]) {
                    params[this.queryKey[i]] = this[this.queryKey[i]]
                }
            }
            if (params.storeId && params.storeId.indexOf('&') > -1) {
                let ids = params.storeId.split('&')
                params.storeId = ids[0]
                params.agentId = ids[1]
                params.brandId = ids[2]
            }
            if (params.deviceTypeCode == 0) delete params.deviceTypeCode
            this.$get(url, params).then(res => {
                this.list = res.rows
                this.listLoading = false
                this.clickSubmit = false
                this.listTotal = res.total
                if (params.page == 0) {
                    this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 55
                }
            }).catch(() => {
                this.listLoading = false
                this.clickSubmit = false
            })
        },

        /**
         * 订单详情分润合并单元格
         */
        fenRunSpanMethod({
            row,
            column,
            rowIndex,
            columnIndex
        }) {
            if (columnIndex === 0) {
                if (rowIndex % 8 === 0) {
                    return {
                        rowspan: 8,
                        colspan: 1
                    }
                } else {
                    return {
                        rowspan: 0,
                        colspan: 0
                    }
                }
            }
        },

        setRows(type, row, dialogType, idx) {
            switch (type) {
                case 1:
                    this.dialogType = dialogType
                    if (dialogType == 4) {
                        this.drawerStatus = true;
                    } else {
                        this.dialogStatus = true;
                    }
                    this.curIdx = idx
                    this.form = {}
                    this.$get(`iot-saas-order/admin/product/order/detail/${row.id}`, {
                        id: row.id
                    }).then(res => {
                        this.curRow = res;
                        this.curRow.productUrlList = row.productUrlList[0];
                        this.curRow.productStandardDTO = [this.curRow.productStandardDTO];
                    })
                    break
            }
        },


        /**
         * 弹窗确认
         */
        dialogConfirm(type) {
            let that = this;
            if (!this.form.dateTime) {
                this.$message({
                    message: that.$t('shopping.timeCannotBeEmpty'),
                    type: 'error'
                })
                return;
            };
            let url = '';
            switch (type) {
                case 1:
                    url = 'iot-saas-order/admin/product/order/confirmPay';
                    break;
                case 2:
                    url = 'iot-saas-order/admin/product/order/send';
                    break;
                case 3:
                    url = 'iot-saas-order/admin/product/order/received';
                    break;

            }
            this.$post(url, {
                id: this.curRow.id,
                dateTime: this.form.dateTime
            }).then(res => {
                this.$message({
                    message: that.$t('public.confirmedSuccess'),
                    type: 'success'
                })
                this.dialogStatus = false;
                this.toQuery();
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.remark-box {
    max-height: 80px;
}

/deep/ .order-no {
    .el-input__inner {
        padding-right: 0;
    }
}

.timeline-box {
    max-width: 900px;
    overflow-y: scroll;

    .timeline-item {

        &::after,
        &::before {
            content: '';
            position: absolute;
        }

        &::before {
            width: 26px;
            height: 14px;
            top: 0;
            margin-left: -13px;
            content: "";
            background-color: var(--white);
            color: var(--olive);
            z-index: 99;
        }

        &::after {
            top: 6px;
            margin-left: 10px;
            width: 100%;
            height: 1px;
            background: var(--olive);
        }

        &:last-child {
            &::before {
                color: var(--orange);
            }

            &::after {
                width: 0;
            }
        }

        &.err {
            &::before {
                content: "";
                color: var(--orange);
            }
        }
    }
}

.shop_img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
}
</style>
