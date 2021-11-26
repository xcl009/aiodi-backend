<template>
  <div class="rel filter-box">
    <slot name="tabs"></slot>
    <div v-if="filterForm">
      <el-form ref="filterFrom" class="pt-10 bg-white filter-froms" :inline="true" size="small" @submit.native.prevent="query()">
        <slot name="defult"></slot>
        <el-form-item>
          <el-button type="primary" native-type="submit" :disabled="clickSubmit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="reset()">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-tooltip class="item" effect="dark" content="选择开始时间和结束时间,点击查询后即可导出该时间段内的订单" placement="top">
            <el-button type="primary" plain @click="outTable()" v-if="exportStatus">导出<i class="el-icon-download el-icon--right" /></el-button>
          </el-tooltip>
          <span class="pl-10 fs-s4 text-six cursor" v-if="unfoldShow && (si == -1 || si > 0)" @click="unfoldStatus = !unfoldStatus; controlChildren(2)">
            {{ unfoldStatus ? '收起' : '展开' }}<i class="el-icon--right" v-bind:class="{'el-icon-arrow-down': !unfoldStatus, 'el-icon-arrow-up' : unfoldStatus}"></i>
          </span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    clickSubmit: {
      type: Boolean,
      default: false
    },
    filterForm: {
      type: Boolean,
      default: true
    },
    exportStatus: {
      type: Boolean,
      default: false
    },
    unfoldShow: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  data(){
    return {
      unfoldStatus: false,
      si: -1
    }
  },
  mounted() {
    if(this.filterForm) this.controlChildren()
  },
  methods: {
    /**
     * 控制子元素是否显示
     */
    controlChildren(type = 1){
      let ds = this.$refs.filterFrom.$el.children, box_width = this.$refs.filterFrom.$el.offsetWidth, child_width = 0
      let endw = ds[ds.length - 1].offsetWidth
      if(type == 2){
        for(var i in ds){
          if(parseInt(ds[i].offsetWidth) >= 0){
            if(this.unfoldStatus){
              ds[i].style.display = 'inline-block';
            } else {
              if(parseInt(i) >= this.si){
                ds[i].style.display = 'none';
              }
            }
          }
        }
      } else {
        for(var i in ds){
          if(parseInt(ds[i].offsetWidth) > 0){
            child_width += ds[i].offsetWidth
            if(child_width + endw > box_width){
              if(this.si == -1) this.si = i
              ds[i].style.display = 'none';
            }
          }
        }
      }
      this.si = this.si > 0 ? this.si : 0
    },

    /**
     * 重置参数
     */
    reset(){
      this.$emit('reset')
    },

    /**
     * 确认查询
     */
    query(){
      this.$emit('query')
    },

    /**
     * 隐藏更多
     */
    hide(){
      this.unfoldStatus = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .filter-froms{
    /deep/ .el-form-item--small.el-form-item{
      margin-bottom: 10px;
    }
    /deep/ .el-form-item{
      &:last-child{
        display: inline-block !important;
      }
    }
  }
  .filter-box{
    /deep/ .el-tabs--top .el-tabs__item.is-top:nth-child(2){
      padding-left: 20px;
    }
    /deep/ .el-tabs--top .el-tabs__item.is-top:last-child{
      padding-right: 20px;
    }
    /deep/ .el-tabs__item.is-active {
      background-color: #3CA0FD;
      color: #fff;
    }
    /deep/ .el-tabs__nav-wrap::after{
      background-color: #3CA0FD;
    }
  }
</style>
