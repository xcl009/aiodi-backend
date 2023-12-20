<template>
  <div class="rel filter-box">
    <slot name="tabs"></slot>
    <div class="mt-5 pl-5 pr-5 rel" v-if="filter_form">
      <el-form ref="form" class="pt-5 bg-white filter-froms" :inline="true" size="mini"
        @submit.native.prevent="$parent.toQuery()">
        <div>
          <div class="flex flex-wrap align-center" v-bind:class="{ 'pl-15': device == 'mobile' }">
            <slot name="defult"></slot>
            <div class="mb-5 pl-10 filter-text fs-s4 text-six cursor text-center" @click="drawer = !drawer"
              v-if="moreFilterHeight > 0">
              {{ drawer ? $t('components.retract') : $t('public.add') }}<i class="el-icon--right"
                v-bind:class="{ 'el-icon-arrow-down': !drawer, 'el-icon-arrow-up': drawer }"></i>
            </div>
          </div>
          <collapse-transition name="toTop">
            <div class="abs more-filter flex flex-wrap bg-white"
              v-bind:class="{ 'pl-15': device == 'mobile', 'opa-0': opa }" ref="moreFilter" v-show="drawer">
              <slot name="more"></slot>
            </div>
          </collapse-transition>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import CollapseTransition from '@/utils/collapse-transition'
export default {
  components: {
    collapseTransition: CollapseTransition
  },
  props: {
    filter_form: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  data() {
    return {
      drawer: true,

      opa: true,
      moreFilterHeight: 0
    }
  },
  mounted() {
    this.setMore()
    if (document.body.clientWidth >= 768) {
      window.addEventListener('resize', () => {
        this.drawer = true
        this.opa = true
        setTimeout(() => {
          this.setMore()
        }, 500)
      })
    }
  },
  methods: {
    /**
     * 设置筛选更多是否显示
     */
    setMore() {
      if (!this.$refs.moreFilter) return
      this.moreFilterHeight = this.$refs.moreFilter.offsetHeight
      this.drawer = false
      setTimeout(() => {
        this.opa = false
      }, 500)
    },

    /**
     * 隐藏更多
     */
    hide() {
      this.drawer = false
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-froms {
  /deep/ .el-form-item--mini.el-form-item {
    margin-bottom: 5px;
  }
}

.more-filter {
  width: 100%;
  z-index: 99;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);

  &.opa-0 {
    opacity: 0;
  }
}

.filter-text {}

.filter-box {
  /deep/ .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
    padding-left: 20px;
  }

  /deep/ .el-tabs--top .el-tabs__item.is-top:last-child {
    padding-right: 20px;
  }

  /deep/ .el-tabs__item.is-active {
    background-color: #90c328;
    color: #fff;
  }

  /deep/ .el-tabs__nav-wrap::after {
    background-color: #90c328;
  }
}</style>
