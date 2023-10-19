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
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">按出货量</div>
          <el-tabs class="flex-1" v-model="listQuery.order" @tab-click="toQuery()">
            <el-tab-pane label="默认" :name="''" />
            <el-tab-pane :label="item.title" :name="item.type" v-for="(item, index) in shipmenList" />
          </el-tabs>
        </div>
        <div class="mb-10 flex align-center bg-white">
          <div class="mr-10">按 价 格</div>
          <el-tabs class="flex-1" v-model="listQuery.sort" @tab-click="toQuery()">
            <el-tab-pane label="默认" :name="''" />
            <el-tab-pane :label="item.title" :name="item.type" v-for="(item, index) in price" />
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

      <template>
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
    </condition>

    <div class="flex_s mt-20">
      <div>
        为您找到符合条件的 {{ listTotal }} 个商品
      </div>
    </div>

    <div class="pb-20 load-box mt-10" v-infinite-scroll="loadPage">
      <div class="p-30 text-center bg-white" v-if="list == 0">
        服务持续更新中，请持续关注设备商城
      </div>
      <el-row :gutter="20">
        <el-col :sm="24" :md="12" :lg="8" :xl="6" v-for="(item, index) in list">
          <div class=" list-item cursor bg-white">
            <el-image class="list-img" :src="item.productUrlList[0]" fit="cover"></el-image>
            <div class="p-20">
              <div class="mt-15 text-black fs-c1">
                {{ item.productName }}
              </div>
              <div class="mt-15  text-cut_two flex_j">
                <img src="@/assets/gongchang-fill.svg" /> {{ item.factoryName }}
                <div class="sub">|</div>
                {{ numFormatting(item.soldQuantity) || 0 }}+出货量
              </div>
              <div class="mt-15 flex align-center">
                <template>
                  <div class="flex1">
                    <span class=" fs-b3 text-danger">￥{{ minPrice(item.productStandardList) }}</span>
                    <span>起</span>
                  </div>
                </template>
                <el-button type="primary" size="medium" @click="setRows(1, item, 1)">立即购买</el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-drawer :title="dialogTitle[dialogType]" :visible.sync="drawerStatus">
      <template v-if="dialogType == 1">
        <div class="pl-20 pr-20 text-black ">
          <div class="mb-15 fs-a1 text-bold ">设备详情</div>
          <div class="border_bottom">
            <div class="flex_j">
              <div class="details_img">
                <el-image :preview-src-list="[curRow.productUrlList]" class="shop_img"
                  :src="curRow.productUrlList"></el-image>
              </div>
              <div class="details_list ">
                <div class="flex_j">
                  <span>设备类型</span> {{ myDeviceId[curRow.deviceTypeCode] }}
                </div>
                <div class="flex_j">
                  <span>工厂名称</span> {{ curRow.factoryName }}
                </div>
                <div class="flex_j">
                  <span>寿命特点</span> {{ curRow.productContent }}
                </div>
                <div v-if="curRow" class="flex_j" v-for="(item, index) in JSON.parse(curRow.productRemark)"
                  :key="index">
                  <span>{{ item.text }}</span> {{ item.text1 }}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-20">
            <div class="flex_j">
              <div class="gg_width">价格</div>
              <div>
                ￥{{ queryList.productStandardDTO.price }}
              </div>
            </div>
            <div class="flex_j mt-20">
              <div class="gg_width">选择规格</div>
              <div>
                <el-radio-group v-model="radio1" @input="radioChange">
                  <el-radio-button :label="`${item.number}`" va
                    v-for="(item, index) in curRow.productStandardList"></el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="flex_j mt-20">
              <div class="gg_width">购买数量</div>
              <div>
                <el-input-number v-model="queryList.productNumber" :min="0" :max="9999999"></el-input-number>
              </div>
            </div>

            <!-- <div class="flex_s mt-15 border_bottom_de" v-for="(item, index) in curRow.productStandardList"
                            :key="index">
                            <div>{{ item.number }}口</div>
                            <div>{{ item.price }}元</div>
                            <div>
                                <el-input-number v-model="item.productNumber" :min="0" :max="9999999"></el-input-number>
                            </div>
                        </div> -->
          </div>

          <div class="mt-20">
            <div v-html="curRow.productDetail"></div>
          </div>
        </div>

      </template>
      <template v-if="[1].indexOf(dialogType) > -1">
        <div style="height: 66px;"></div>
        <div class="p-15 mt-30 abs bfixed bg-white flex_j l-t">
          <div class="flex_b">
            合计{{ queryList.productNumber }}件 <div class="pl-15 flex_b">
              <span>总金额</span> <span class="red_color fs-b3 text-bold m_lr_10">{{ (parseInt(queryList.productNumber) *
                                parseFloat(queryList.productStandardDTO.price)).toFixed(2) }}</span>元
            </div>
          </div>
          <div class="m_l_a">
            <el-button size="medium" class="bg-body" @click="drawerStatus = false">取消</el-button>
            <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
          </div>
        </div>
      </template>
    </el-drawer>

    <el-dialog :title="dialogType == 2 ? '确定信息' : ''" :visible.sync="dialogStatus" :center="true" width="600px">
      <div v-if="dialogType == 2">
        <el-form label-width="130px">
          <el-form-item label="购买商品">
            <div>{{ myDeviceId[curRow.deviceTypeCode] }}</div>
          </el-form-item>
          <el-form-item label="规格">
            <div>{{ queryList.productStandardDTO.number }} {{
                            myDeviceId[curRow.deviceTypeCode] }}×{{ queryList.productNumber }}台
            </div>
          </el-form-item>
          <el-form-item label="支付方式">
            <div>线下支付</div>
          </el-form-item>
          <el-form-item label="实付金额">
            <div class="red_color fs-b3">{{ (parseInt(queryList.productNumber) *
                            parseFloat(queryList.productStandardDTO.price)).toFixed(2) }}元</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer flex_c">
          <el-button type="primary" @click="onSubmit(2)" :disabled="clickSubmit_type">{{ clickSubmit_type ? '提交中'
                        :
                        '确认支付' }}</el-button>
        </div>
      </div>
      <div v-if="dialogType == 3">
        <div class="text-center ">
          <div class="flex_c">
            <img src="@/assets/succeed.svg" />
          </div>
          <div class="pl-15 pt-5">
            <div class="fs-c1 text-center">下单成功</div>
            <div class="mt-5 text-gray">设备二维码已生成，请联系平台客服进行货品对接</div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer flex_c mt-15">
          <el-button @click="gobackChange()">查看订单</el-button>
          <el-button type="primary" @click="dialogStatus = false" :disabled="clickSubmit_type">{{ clickSubmit_type
                        ? '提交中' :
                        '我知道了' }}</el-button>
        </div>
      </div>
    </el-dialog>
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
        radio1: '',
        clickSubmit_type: false,
        dialogStatus: false,
        form: {},
        formKey: {
          sel1: 'orderNo',
          sel2: 'idLastNine'
        },
        clickSubmit: false,
        tabs: [],
        form: {},
        list: [],
        listLoading: false,
        listTotal: 0,
        listQuery: {
          page: 1,
          size: 50,
          status: "1",
          deviceTypeCode: '0',

        },

        brandId: this.$route.query.brandId || '',

        // 弹出相关
        dialogType: 0,
        drawerStatus: false,
        dialogTitle: {
          1: '',
          2: '',
        },
        curRow: {},
        curIdx: 0,
        dform: {},
        num: 0,
        purchaseParameter: {

        },
        queryList: {
          productId: '',
          productNumber: 0,
          productStandardDTO: {
            number: '',
            price: '',
          }
        },
        orderNo: '',
        shipmenList: [{
          title: '由高到低',
          type: 'asc'
        }, {
          title: '由低到高',
          type: 'desc'
        }],
        price: [{
          title: '由高到低',
          type: 'username'
        }, {
          title: '由低到高',
          type: 'nickname'
        }],
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
      this.$store.dispatch('api/getServiceType').then(res => {
        this.tabs = res
      })
    },
    // watch: {
    //     curRow: {
    //         deep: true,//true为进行深度监听,false为不进行深度监听
    //         immediate: true,
    //         handler(newVal) {
    //             let num = 0;
    //             let amount = 0;
    //             if (newVal.productStandardList) {
    //                 newVal.productStandardList.forEach(res => {
    //                     num += res.productNumber;
    //                     amount += res.productNumber * res.price
    //                 })
    //             }
    //             this.numbers = num;
    //             this.amount = amount.toFixed(2);

    //         }
    //     }
    // },


    methods: {
      // 数字格式化
      numFormatting(number) {
        if (!number && number != 0) return number;
        var str_num
        if (number >= 1E3 && number < 1E4) {
          str_num = number / 1E3
          return str_num + '千'
        } else if (number >= 1E4 && number < 1E6) {
          str_num = number / 1E4
          return str_num + '万'
        } else if (number >= 1E6 && number < 1E7) {
          str_num = number / 1E6
          return str_num + '百万'
        } else if (number >= 1E7 && number < 1E8) {
          str_num = number / 1E7
          return str_num + '千万'
        } else if (number >= 1E8 && number < 1E10) {
          str_num = number / 1E8
          return str_num + '亿'
        } else if (number >= 1E10 && number < 1E11) {
          str_num = number / 1E10
          return str_num + '百亿'
        } else if (number >= 1E11 && number < 1E12) {
          str_num = number / 1E11
          return str_num + '千亿'
        } else if (number >= 1E12) {
          str_num = number / 1E12
          return str_num + '万亿'
        } else { //一千以下
          return number
        }
      },
      gobackChange() {
        this.$router.push({
          path: '/shopping/orderList',
          query: {
            orderNo: this.orderNo,
          }
        })
      },
      radioChange(e) {
        this.curRow.productStandardList.forEach(res => {
          if (`${res.number}` == e) {
            let obj = {
              number: res.number,
              price: res.price,
            }
            this.queryList.productNumber = res.productNumber;
            this.queryList.productStandardDTO = obj;
          }
        })
      },
      minPrice(arr) {
        let numArr = [];
        arr.forEach(res => {
          if (res.price) {
            numArr.push(res.price);
          }
        })
        let sortArr = numArr.sort((a, b) => a - b);
        return sortArr[0];
      },
      // 支付事件
      onSubmit(type) {
        switch (type) {
          case 2:
            this.$post('iot-saas-order/admin/product/sold', this.queryList).then((res = {}) => {
              this.dialogType = 3;
              this.orderNo = res;
            }).catch(() => {})
            //
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
        if (params.serviceTypeCode == 0) delete params.serviceTypeCode
        if (params.deviceTypeCode == 0 || params.serviceTypeCode == 'SYSTEM') {
          delete params.deviceTypeCode
          this.listQuery.deviceTypeCode = '0'
        }
        if (params.order == 0) delete params.order;
        if (params.sort == 0) delete params.sort;
        if (params.Type < 0) delete params.Type
        this.$get('iot-saas-order/admin/product/findPage', params).then((res = {}) => {
          res.rows.forEach((list, index) => {
            list.productStandardList.forEach((list1, index1) => {
              res.rows[index].productStandardList[index1].productNumber = 0;
            })
          })
          this.list = this.list.concat(res.rows || [])
          this.listLoading = false
          this.clickSubmit = false
          if (params.page == 0) {
            this.listTotal = res.total || 0
          }
          this.onLoadPage = false
        }).catch(() => {
          this.listLoading = false
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
        this.curRow = row;
        switch (type) {
          case 1:
            this.queryList.productNumber = 0;
            this.queryList.productId = row.id;
            this.queryList.productStandardDTO.price = row.productStandardList[0].price;
            this.queryList.productStandardDTO.number = row.productStandardList[0].number;
            this.radio1 = `${row.productStandardList[0].number}`;
            this.dialogType = dialogType;
            this.dialogTitle[1] = `${this.myDeviceId[row.deviceTypeCode]}选购`;
            this.drawerStatus = true
            this.clickSubmit = false;
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
        if (this.clickSubmit) return
        this.clickSubmit = true
        switch (this.dialogType) {
          case 1:
            if (this.queryList.productNumber == 0) {
              this.clickSubmit = false;
              this.$message.error('请选购商品');
              return;
            }
            this.clickSubmit = false;
            this.drawerStatus = false;
            this.dialogType = 2;
            this.dialogStatus = true;

        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './list.scss';
</style>