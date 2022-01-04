<template>
  <div class="rel filter-box">
    <slot name="tabs"></slot>
    <el-form class="filter-froms" size="small" @submit.native.prevent="query()" v-if="filterForm">
      <div class="p-15 pb-5 flex align-start bg-white" id="filterContent">
        <div id="filterBox" class="flex flex-wrap flex1 filterBox">
          <slot name="defult"></slot>
        </div>
        <div id="setBox" class="flex align-center set-box">
          <el-button native-type="submit" :disabled="clickSubmit" class="icon-search"><i class="el-icon-search fs-c1"/></el-button>
          <span class="mr-10 pl-15 pr-15 text-primary cursor" v-if="resetStatus" @click="reset()">重置</span>
          <el-tooltip class="item" effect="dark" content="选择开始时间和结束时间,点击查询后即可导出该时间段内的订单" placement="top" v-if="device != 'mobile'">
            <el-button type="primary" @click="outTable()" v-if="exportStatus" class="icon-download"><i class="el-icon-download el-icon--left"/>导出</el-button>
          </el-tooltip>
          <span class="pl-10 fs-s4 text-six cursor" v-if="unfoldShow && (child_i == -1 || child_i > 0)" @click="unfoldStatus = !unfoldStatus; controlChildren(2)">
            {{ unfoldStatus ? '收起' : '更多' }}<i class="el-icon--right" v-bind:class="{'el-icon-arrow-down': !unfoldStatus, 'el-icon-arrow-up' : unfoldStatus}"></i>
          </span>
        </div>
        <slot name="endButton"></slot>
      </div>
    </el-form>
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
    resetStatus: {
      type: Boolean,
      default: true
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
      child_i: -1
    }
  },
  mounted() {
    let that = this
    that.$nextTick(()=>{
      if(that.filterForm) that.controlChildren()
    })
  },
  methods: {
    /**
     * 控制子元素是否显示
     */
    controlChildren(type = 1){
      let filterBox = document.getElementById('filterBox'),
        child = filterBox.children,
        box_width = document.getElementById('filterBox').clientWidth,
        child_width = 0
      if(type == 2){
        for(var i in child){
          if(parseInt(child[i].clientWidth) >= 0){
            if(this.unfoldStatus){
              child[i].style.display = '';
            } else {
              if(parseInt(i) >= this.child_i){
                child[i].style.display = 'none'
              }
            }
          }
        }
      } else {
        for(var i in child){
          if(parseInt(child[i].clientWidth) > 0){
            child_width += child[i].clientWidth - 1
            if(box_width < child_width && i != 0 ){
              if(this.child_i == -1) this.child_i = i
              child[i].style.display = 'none'
            }
          }
        }
        filterBox.classList.remove('flex1')
        filterBox.style.width = document.getElementById('filterBox').clientWidth + 'px'
      }
      this.child_i = this.child_i > 0 ? this.child_i : 0
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
  .filterBox{
    /deep/ > div {
      margin-bottom: 10px;
      margin-right: -1px;
    }
    /deep/ .el-input{
      width: initial;
      height: 32px;
    }
    /deep/ .el-input__inner{
      width: 152px;
      height: 32px;
      line-height: 32px;
      border: 1px solid #E5E6EB;
      border-radius: 0;
    }
    /deep/ .el-select__caret{
      line-height: 32px;
    }
    /deep/ .el-input__suffix{
      line-height: 32px;
    }
    /deep/ .el-cascader{
      height: 32px;
      .el-input__inner{
        vertical-align: super
      }
    }
    /deep/ .el-icon-arrow-down{
      line-height: 32px;
    }
    /deep/ .el-input__inner.range-day{
      width: 300px;
      padding: 0 10px;
    }
  }
  .filter-box{
    // /deep/ .el-tabs--top .el-tabs__item.is-top:nth-child(2){
    //   padding-left: 20px;
    // }
    // /deep/ .el-tabs--top .el-tabs__item.is-top:last-child{
    //   padding-right: 20px;
    // }
    /deep/ .el-tabs__item{
      font-size: 16px;
    }
    /deep/ .el-tabs__item:not(.is-active) {
      color: var(--gray);
    }
    /deep/ .el-tabs__nav-wrap::after{
      height: 0;
    }
  }
  .set-box{
    // height: 32px;
  }
  .icon-download{
    padding: 0 10px;
    height: 32px;
  }
  .icon-search{
    padding: 0;
    width: 32px;
    height: 32px;
    background: #E5E6EB;
    border-radius: 0 2px 2px 0;
  }
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
</style>
