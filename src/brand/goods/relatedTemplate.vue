<template>
  <div>
    <div class="pl-20 pr-20 pb-10 bg-white">
      <el-button class="mb-20 mt-20" type="primary" @click="setRows(1, {}, 1)">添加仓口模板</el-button>
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="[{},{}]"
        :max-height="tableMaxH" element-loading-text="Loading">
        <el-table-column label="模板名称">
          <template slot-scope="scope">
            2口设备模板
          </template>
        </el-table-column>
        <el-table-column label="仓口数">
          <template slot-scope="scope">
            {{ scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="单仓口商品数">
          <template slot-scope="scope">
            {{ scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="$router.push({path: `/goods/relatedGoods?num=${scope.$index + 1}`})">关联商品</el-button>
            <el-button size="mini" type="danger" @click="list.splice(scope.$index, 1)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="560px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-form class="custom-form pl-20 pr-20" label-width="auto">
          <el-form-item label="模板名称">
            <el-input v-model="dform.amount"></el-input>
          </el-form-item>
          <el-form-item label="仓口数量">
            <el-input v-model="dform.amount"></el-input>
          </el-form-item>
          <el-form-item label="单仓口商品数">
            <el-input v-model="dform.amount"></el-input>
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
      // if (this.type == 2) {
      //   this.getShop()
      // } else {
      //   this.getInfo()
      // }
      // this.getGoods()
    },
    methods: {
      /**
       * 获取信息
       */
      getInfo() {
        this.$get('agentapi/product/get_business_samples', {
          store_id: this.id
        }).then(res => {
          this.save_plan = res.list ? Object.values(res.list) : []
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
            this.dialogStatus = true
            break
        }
      },

      /**
       * 弹窗确认
       */
      dialogConfim() {
        let curRow = this.curRow,
          curIdx = this.curIdx,
          params = JSON.parse(JSON.stringify(this.dform))
        if(this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:

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
