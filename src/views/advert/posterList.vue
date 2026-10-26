<template>
  <div>
    <div class="p-5 bg-white">
      <condition ref="condition" :clickSubmit="clickSubmit" @reset="reset" @query="toQuery">
        <template v-slot:defult>
          <el-form-item :label="$t('advert.advertisingPosition')">
            <el-select v-model="form.position" :placeholder="$t('advert.advertisingPosition')" @change="toQuery()">
              <el-option :label="item.title" :value="item.position" v-for="(item, index) in positionList" />
            </el-select>
          </el-form-item>
        </template>
        <template v-slot:endButton>
          <router-link :to="`/advert/addPoster?advertTypeCode=${advertTypeCode}`">
            <el-button type="primary" size="small">{{ $t('advert.addAds') }}</el-button>
          </router-link>
        </template>
      </condition>

      <div class="pl-10 pr-10">
        <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
          element-loading-text="Loading" highlight-current-row :max-height="tableMaxH">
          <el-table-column :label="$t('public.image')" align="center">
            <template slot-scope="scope">
              <el-image class="flex" style="height: 80px;" :src="scope.row.logoUrl"
                :preview-src-list="[scope.row.logoUrl]" fit="contain"></el-image>
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.name')" align="center">
            <template slot-scope="scope">
              {{ scope.row.title }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.time')" align="center">
            <template slot-scope="scope">
              <div>{{ scope.row.startTime }}<el-link type="primary">{{ $t('public.rise') }}</el-link></div>
              <div>{{ scope.row.endTime }}<el-link type="danger">{{ $t('public.stop') }}</el-link></div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('advert.expandMode')" align="center">
            <template slot-scope="scope">
              {{ scope.row.expandMode == 1 ? $t('advert.extendedLongGraph') : $t('advert.jumpAdvertisement') }}
            </template>
          </el-table-column>
          <el-table-column :label="$t('public.actions')" align="center">
            <template slot-scope="scope">
              <el-button type="primary" size="mini"
                @click="$router.push({ path: `/advert/addPoster?advertTypeCode=${advertTypeCode}&id=${scope.row.id}` })">{{
                  $t('public.edit') }}</el-button>
              <el-button type="danger" size="mini" @click="del(scope.row, scope.$index)">{{ $t('public.delete')
              }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center">
          <pagination v-show="listTotal > 0" :page.sync="listQuery.page" :limit.sync="listQuery.size"
            :total="parseInt(listTotal)" @pagination="getList" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import condition from '@/components/condition/'
export default {
  name: 'adList',
  components: {
    Pagination,
    condition
  },
  data() {
    return {
      category: this.$route.query.category,
      advertTypeCode: this.$route.query.advertTypeCode,
      advertTypeName: this.$route.query.advertTypeName,
      clickSubmit: false,
      positionList: [],
      tableMaxH: '250',
      listLoading: true,
      listTotal: 0,
      list: [],
      listQuery: {
        page: 1,
        size: 20
      },
      form: {}
    }
  },
  mounted() {
    this.toQuery()
    this.getPositions()
  },
  methods: {
    /**
     * 获取广告位
     */
    getPositions() {
      this.$get(`iot-saas-advert/admin/advert/position/find`, {
        category: this.category,
        advertTypeCode: this.advertTypeCode
      }).then(res => {
        this.positionList = res
      })
    },

    /**
     * 搜索查询
     */
    toQuery() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.getList()
    },

    /**
     * 重置查询
     */
    reset() {
      if (this.clickSubmit) return
      this.clickSubmit = true
      this.form = {}
      this.getList()
    },

    /**
     * 获取列表
     */
    getList() {
      let params = Object.assign({}, this.listQuery, this.form, {
        page: this.listQuery.page - 1,
        category: this.category,
        advertTypeCode: this.advertTypeCode
      })
      this.$get(`iot-saas-advert/admin/advert/findPage`, params).then(res => {
        this.list = res.rows
        if (params.page == 0) {
          this.listTotal = res.total
          this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 80
        }
        this.listLoading = false
        this.clickSubmit = false
      }).catch(() => {
        this.listLoading = false
        this.clickSubmit = false
      })
    },

    /**
     * 删除广告
     */
    del(row, index) {
      let that = this;
      this.$alert(that.$t('advert.message'), that.$t('advert.deleteAds'), {
        confirmButtonText: that.$t('public.confirm'),
        callback: action => {
          if (action == 'confirm') {
            this.$delete(`iot-saas-advert/admin/advert/${row.id}`).then(res => {
              this.$message({
                message: that.$t('public.deleteSuccess'),
                type: 'success'
              })
              this.list.splice(index, 1)
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
