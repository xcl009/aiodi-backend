<template>
  <div :class="{'hidden':hidden}" class="p-5 pt-10 pagination-container">
    <el-pagination
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :page-sizes="pageSizes"
      :page-count="pageCount"
      :layout="layout"
      :total="(parseInt(total / pageSize) > 500 ? pageSize * 500 : total)"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    total: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 10
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50, 100]
      }
    },
    pageCount: {
      default: 5
    },
    layout: {
      type: String,
      default: 'prev, pager, next, sizes, jumper' // total, sizes,
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pagination-container.hidden {
  display: none;
}
/* /deep/ .el-pagination .el-select .el-input{
  margin-top: -3px;
} */
/deep/ .el-pagination {
  .btn-prev, .btn-next{
    background: none !important;
  }
  .el-pager{
    li{
      background: none !important;
      &.active{
        background: #E8F8FF !important;
        border-radius: 2px;
        color: var(--olive) !important;
      }
    }
  }
  .el-pagination__total{
    margin-right: 0;
  }
  .el-pagination__sizes{
    .el-input{
      width: 90px;
    }
    .el-select__caret{
      font-weight: bold;
      color: #4E5969 !important;
    }
    .el-input__inner{
      padding-right: 15px !important;
    }
  }
  .el-input__inner{
    padding-left: 0 !important;
    background: #F2F3F5;
    border: none;
    border-radius: 2px !important;
  }
  .el-pagination__jump{
    margin-left: 0;
  }
}
</style>
