<template>
    <div>
        <div class="pb-20 pt-20">
            <el-button type="primary" size="small" class="mr-10" @click="setRows(3, {}, 1)"><i
                    class="el-icon-plus el-icon--left" />添加公告</el-button>
        </div>

        <div class="pl-10 pr-10 bg-white">
            <el-table ref="list_table" v-loading="listLoading" :data="list" element-loading-text="Loading"
                highlight-current-row :max-height="tableMaxH">
                <el-table-column label="公告类型" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div>{{ scope.row.noticeTypeVO.typeName || '--' }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="用户类型" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div>{{ scope.row.brandId == '1' ? '品牌商' : scope.row.storeId == '1' ? '商户' : scope.row.agentId ==
                            '1' ? '代理' : '' }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="状态" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-link :underline="false" type="success" v-if="scope.row.status == 1">开启</el-link>
                        <el-link :underline="false" type="info" v-else>关闭</el-link>
                    </template>
                </el-table-column>
                <el-table-column label="公告内容" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <div>{{ scope.row.recodeContent }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                    <template slot-scope="scope">
                        <div class="flex flex-wrap operate">
                            <template v-if="isSaas()">
                                <el-button type="text" @click="showDialog(scope.row, {}, 2)">编辑</el-button>
                                <el-button type="text" class="text-danger"
                                    @click="del(scope.row, scope.$index)">删除</el-button>
                            </template>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="flex justify-center">
                <pagination :page.sync="listQuery.page" :limit.sync="listQuery.size" :total="parseInt(listTotal)"
                    @pagination="getList" />
            </div>
        </div>

        <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus" :wrapperClosable="false" size="40%">
            <template>
                <el-form class="custom-form pl-20 pr-20" @submit.native.prevent="dialogConfirm()">
                    <el-form-item label="公告类型">
                        <el-select v-model="dform.typeCode">
                            <el-option :label="`${item.typeName}`" :value="item.typeCode" v-for="(item, index) in dataList"
                                :key="index"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="用户类型">
                        <el-select v-model="dform.type">
                            <el-option :label="`${t.title}`" :value="t.type" v-for="(t,index) in identity" :key="index"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-radio-group v-model="dform.status">
                            <el-radio :label="1">开启</el-radio>
                            <el-radio :label="2">关闭</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="公告内容">
                        <el-input v-model="dform.recodeContent" placeholder="请输入公告内容" type="textarea" :rows="4" />
                    </el-form-item>
                </el-form>
            </template>
            <template>
                <div style="height: 66px;"></div>
                <div class="p-15 mt-30 abs bfixed bg-white text-right l-t">
                    <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
                    <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
                </div>
            </template>
        </el-drawer>
    </div>
</template>
  
<script>
import condition from '@/components/condition/'
import selectSearch from '@/components/condition/selectSearch'
import Pagination from '@/components/Pagination'
import upload from '@/components/upload'
import {
    parseTime,
} from '@/utils/index'
export default {
    name: 'useGuide',
    components: {
        condition,
        selectSearch,
        Pagination,
        upload
    },
    data() {
        return {
            identity: [
                {
                    title: '品牌商',
                    type: 'brandId',
                },
                {
                    title: '商户',
                    type: 'storeId',
                },
                {
                    title: '代理',
                    type: 'agentId',
                }
            ],
            clickSubmit: false,
            form: {

            },
            list: [],
            tableMaxH: '250',
            listLoading: true,
            listTotal: 0,
            listQuery: {
                page: 1,
                size: 20
            },

            // 弹出相关
            dialogType: 1,
            dialogStatus: false,
            drawerStatus: false,
            dialogTitle: {
                1: '添加公告',
                2: '编辑公告'
            },
            curRow: {},
            curIdx: 0,
            dform: {
                status: 1
            },
            // 指南对象数组
            dataList: [],
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
        myDevice() {
            return this.$store.state.user.myDevice;
        }
    },
    mounted() {
        this.getList();
        this.init();
        // this.queryKey = ['brandId', 'storeId', 'agentId', 'deviceIds', 'sourceType']
        // for (var i in this.queryKey) {
        //     if (query[this.queryKey[i]]) {
        //         this.form[this.queryKey[i]] = query[this.queryKey[i]]
        //     } else {
        //         delete this.form[this.queryKey[i]]
        //     }
        // }

    },
    methods: {
        /**
        * 获取公告类型
        */
        init() {
            let url = 'iot-saas-basic/admin/notice/record/findTypes';
            this.$get(url, {}).then(res => {
                this.dataList = res;
                this.listLoading = false;
            }).catch(() => {
                this.listLoading = false
            })
        },
        /**
        * 显示dialog
        */
        showDialog(row, res, index) {
            this.dialogType = index;
            this.drawerStatus = true
            this.dform = Object.assign({}, row)
            if(index == 2){
                this.dform.type = row.brandId == '1' ? 'brandId' : row.storeId == '1' ? 'storeId' : row.agentId == '1' ? 'agentId' : '';
            }
        },

        /**
         * 删除问题指南
         */
        del(row) {
            this.$alert('确定删除此公告吗？', '公告', {
                confirmButtonText: '确定',
                center: true,
                callback: action => {
                    if (action == 'confirm') {
                        this.$post('iot-saas-basic/admin/notice/record/delete', {
                            id: row.id,
                        }).then(res => {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            })
                            this.getList();
                        })
                    }
                }
            })
        },

        /**
         * 获取公告列表
         */
        getList() {
            let url = 'iot-saas-basic/admin/notice/record/findPage'
            var params = Object.assign({}, this.form, this.listQuery, {
                page: this.listQuery.page - 1
            })
            if (params.deviceTypeCode == 0) {
                delete params.deviceTypeCode
            }
            if (params.guideType == 0) {
                delete params.guideType
            }
            if (params.guideTarget == 0) {
                delete params.guideTarget
            }
            this.$get(url, params).then(res => {
                this.list = res.rows
                this.clickSubmit = false
                if (params.page == 0) {
                    this.listTotal = res.total
                    this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 60
                }
            }).catch(() => {
                this.listLoading = false
            })
        },

        /**
         * 操作行
         * @param {Object} type 1 dialog类型  3 drawer类型
         * @param {Object} row 选择当前数据
         * @param {Object} dialogType dialog内容显示类型 1: '添加指南'
         * @param {Object} idx 当前数据所在位置
         */
        setRows(type, row, dialogType, idx) {
            switch (type) {
                case 1:
                    break
                case 3:
                    this.dialogType = dialogType
                    this.curRow = row
                    this.curIdx = idx
                    this.drawerStatus = true
                    this.dform = {
                        status : 1
                    }
                    break
            }
        },

        /**
         * 弹窗确认
         */
        dialogConfirm(row = {}) {
            let url = this.dialogType == 1 ? 'iot-saas-basic/admin/notice/record/save' : 'iot-saas-basic/admin/notice/record/edit';
            let curRow = this.curRow,
                curIdx = this.curIdx,
                params = JSON.parse(JSON.stringify(this.dform))
            if (this.isSaas()) {
                params.brandId = this.agentInfo.brandId
            }

            if (!params.recodeContent) {
                this.$message({
                    message: '请输入公告内容',
                    type: 'error'
                })
                return
            } else if (!params.type) {
                this.$message({
                    message: '请选择用户类型',
                    type: 'error'
                })
                return
            }
            params[params.type] = 1;
            delete params.type;
            params.createTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}');
            this.$post(url, params).then(res => {
                this.$message({
                    message: '操作成功',
                    type: 'success'
                })
                this.getList();
                this.drawerStatus = false
                this.clickSubmit = false
            }).catch(err => {
                this.clickSubmit = false
            })
        },


    }
}
</script>
  
<style lang="scss" scoped>
/deep/.el-drawer {
    min-width: 500px !important;
}
</style>
  