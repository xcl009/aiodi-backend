<template>
  <div>
    <div class="pl-20 pr-20 pb-10 bg-white">
      <el-button class="mb-15 mt-15" type="primary" @click="setRows(1, {}, 1)">添加仓口模板</el-button>
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="模板名称">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="仓口数">
          <template slot-scope="scope">
            {{ scope.row.positionQty }}
          </template>
        </el-table-column>
        <el-table-column label="单仓口商品数">
          <template slot-scope="scope">
            {{ scope.row.merchandiseQty }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button class="ml-0" size="mini" type="primary"
              @click="$router.push({path: `/goods/relatedGoods?id=${scope.row.id}&positionQty=${scope.row.positionQty}`})">关联商品</el-button>
            <el-button size="mini" type="primary" @click="setRows(1, scope.row, 1)">修改</el-button>
            <el-button size="mini" type="danger" @click="list.splice(scope.$index, 1)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" label-width="120px" label-position="left">
          <el-form-item label="模板名称">
            <el-input v-model="dform.name" placeholder="例：2口设备模板"></el-input>
          </el-form-item>
          <el-form-item label="仓口数量">
            <el-input v-model="dform.positionQty"></el-input>
          </el-form-item>
          <el-form-item label="单仓口商品数">
            <el-input v-model="dform.merchandiseQty" placeholder="例：1"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <div class="pb-20 mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfim()" :disabled="clickSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    components: {
      Pagination
    },
    props: {
      type: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        clickSubmit: false,
        tableMaxH: '250',
        listLoading: false,
        listTotal: 0,
        list: [],
        listQuery: {
          status: '',
          page: 1,
          size: 20
        },
        form: {},

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '添加模板'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {

    },
    mounted() {
      this.getList()
      // if (this.type == 2) {
      //   this.getShop()
      // } else {
      //   this.getInfo()
      // }
      // this.getGoods()
    },
    methods: {
      /**
       * 获取列表
       */
      getList() {
        this.$get('iot-saas-device/admin/template').then(res => {
          this.list = res || []
        })
      },

      /**
       * 操作数据
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '添加模板'
       * @param {Object} idx 当前数据所在位置
       */
      setRows(type, row, dialogType, idx) {
        switch (type) {
          case 1:
            this.dialogType = dialogType
            this.curRow = row
            this.curIdx = idx
            this.dform = {}
            if(dialogType == 1){
              this.dform = {
                id: row.id || '',
                name: row.name || '',
                positionQty: row.positionQty || '',
                merchandiseQty: row.merchandiseQty || 1
              }
            }
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfim() {
        if (this.clickSubmit) return
        this.clickSubmit = true
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        switch (this.dialogType) {
          case 1:
            let type = '$post'
            if (params.id) type = '$put'
            this[type]('iot-saas-device/admin/template', params).then(res => {
              this.$message({
                message: '提交成功',
                type: 'success'
              })
              this.getList()
              this.dialogStatus = false
              this.clickSubmit = false
            }).catch(err => {
              this.clickSubmit = false
            })
            break
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  /deep/ .el-dialog__body {
    padding: 10px;
  }
</style>
