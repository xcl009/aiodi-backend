<template>
  <div>
    <div class="pl-20 pr-20 pt-20 pb-5 bg-white">
      <el-form ref="form" label-width="auto">
        <el-table class="ptd-5" id="list_table" ref="list_table" :data="list">
          <el-table-column
            label="仓口" width="150">
            <template slot-scope="scope">
              {{ scope.row.position }}
            </template>
          </el-table-column>
          <el-table-column label="商品">
            <template slot-scope="scope">
              <div class="flex align-center">
                <el-avatar shape="square" :size="50" :src="scope.row.picture" fit="fill" icon="el-icon-picture-outline"  v-if="scope.row.picture"></el-avatar>
                <div class="pl-10 pr-10 flex1">{{ scope.row.title }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="成本价" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.costPrice" placeholder="成本价" disabled>
                <template slot="append">元</template>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="零售价" width="200">
            <template slot-scope="scope">
              <el-input v-model="scope.row.retailPrice" placeholder="零售价">
                <template slot="append">元</template>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" class="ml-0" @click="setRows(1, scope.row, 1)">选择商品</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-form-item class="mt-20">
          <el-button type="primary" @click="onSubmit">立即提交</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog :visible.sync="dialogStatus" :center="true" :show-close="false" width="750px">
      <div class="mt-5 text-center text-black fs-c1 text-initial" slot="title">{{ dialogTitle[dialogType] }}</div>
      <template v-if="dialogType == 1">
        <el-table class="ptd-5" :data="goodsList" border>
          <el-table-column label="图片" width="80">
            <template slot-scope="scope">
              <div class="flex">
                <el-avatar shape="square" :size="50" :src="scope.row.picture" fit="fill" icon="el-icon-picture-outline"></el-avatar>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品标题" width="250">
            <template slot-scope="scope">
              {{ scope.row.title }}
            </template>
          </el-table-column>
          <el-table-column label="价格">
            <template slot-scope="scope">
              <div>成本价：{{ scope.row.costPrice }}</div>
              <div>零售价：{{ scope.row.retailPrice }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="selGoods(scope.row)">选择此商品</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <div class="pb-20 mt-30 text-center">
        <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
        <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit" v-if="dialogType != 1">确定</el-button>
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
        id: this.$route.query.id || '',
        positionQty: this.$route.query.positionQty || 2,
        clickSubmit: false,
        tableMaxH: '250',
        list: [],
        goodsList: [],

        // 弹出相关
        dialogType: 1,
        dialogStatus: false,
        dialogTitle: {
          1: '选择商品'
        },
        curRow: {},
        curIdx: 0,
        dform: {}
      }
    },
    computed: {

    },
    mounted() {
      this.getInfo()
      this.getGoods()
    },
    methods: {
      /**
       * 选择商品
       * @param {Object} row
       */
      selGoods(row) {
        this.curRow.merchandiseId = row.id
        this.curRow.title = row.title
        this.curRow.costPrice = row.costPrice
        this.curRow.retailPrice = row.retailPrice
        this.curRow.picture = row.picture
        this.dialogStatus = false
      },

      /**
       * 获取信息
       */
      getInfo() {
        this.$get(`iot-saas-device/admin/template/binding/${this.id}`).then(res => {
          for(var i = 0; i < this.positionQty; i++){
            let obj = {
              position: i + 1
            }
            if(res){
              obj = Object.assign(obj, res[i])
            }
            this.list.push(obj)
          }
        })
      },

      /**
       * 获取商品
       */
      getGoods() {
        this.$get(`iot-saas-device/admin/merchandise/select`).then(res => {
          this.goodsList = res
        })
      },

      /**
       * 提交关联
       */
      onSubmit() {
        let params = {
          templateId: this.id,
          merchandiseList: []
        }
        this.list.map(item => {
          if(item.merchandiseId){
            params.merchandiseList.push({
              position: item.position,
              merchandiseId: item.merchandiseId,
              retailPrice: item.retailPrice
            })
          }
        })
        this.$post('iot-saas-device/admin/template/bindingMerchandise', params).then(res => {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        })
      },

      /**
       * 操作数据
       * @param {Object} type 1 dialog类型
       * @param {Object} row 选择当前数据
       * @param {Object} dialogType dialog内容显示类型 1: '选择商品'
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
      dialogConfirm() {
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
