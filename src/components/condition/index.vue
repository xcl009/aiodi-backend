<template>
  <div :class="`rel filter-box bg-white ` + pdClass">
    <slot name="tabs"></slot>
    <el-form size="small" label-width="auto" @submit.native.prevent="query()" v-if="filterForm">
      <div class="flex" id="filterContent">
        <slot name="left"></slot>
        <div class="flex1" v-if="defaultShowLength > 0"></div>
        <div id="filterBox" class="flex flex-wrap filterBox" :class="{'fold': defaultShowLength == 0 && unfoldStatus, 'flex1': defaultShowLength == 0}">
          <slot name="defult"></slot>
          <div id="setBox" class="flex align-center set-box pl-20 pr-10 line-1">
            <el-button native-type="submit" :disabled="clickSubmit" class="icon-search" type="primary" size="small">
              <i class="mr-5 el-icon-search fs-s2"/><span class="fs-s3">查询</span>
            </el-button>
            <el-button class="icon-search icon-refresh" size="small" v-if="resetStatus" @click="reset()">
              <i class="mr-5 el-icon-refresh fs-s2"/><span class="fs-s3">重置</span>
            </el-button>
            <el-tooltip class="item" effect="dark" content="选择开始时间和结束时间,点击查询后即可导出该时间段内的记录" placement="top" v-if="device != 'mobile' && exportStatus">
              <el-button class="icon-search icon-refresh" size="small" @click="saveXlsx()">
                <i class="mr-5 el-icon-download fs-s2"/><span class="fs-s3">导出</span>
              </el-button>
            </el-tooltip>
            <span class="ml-10 fs-s4 text-primary cursor" v-if="unfoldShow && (child_i == -1 || child_i > 0)" @click="unfoldStatus = !unfoldStatus; controlChildren(2)">
              {{ unfoldStatus ? '收起' : '更多' }}<i class="el-icon--right" v-bind:class="{'el-icon-arrow-down': !unfoldStatus, 'el-icon-arrow-up' : unfoldStatus}"></i>
            </span>
          </div>
        </div>
        <slot name="endButton"></slot>
      </div>
      <div class="abs pt-10 pb-10 filter-popup bg-white" v-if="unfoldStatus && defaultShowLength > 0">
        <div class="flex flex-wrap filterBox">
          <slot name="defult"></slot>
        </div>
        <div class="flex justify-center align-center">
          <el-button native-type="submit" :disabled="clickSubmit" size="medium" type="primary">
            搜索
          </el-button>
          <span class="pl-10 pr-10 text-six cursor" v-if="resetStatus" @click="reset()">重置</span>
          <span class="fs-s4 text-primary cursor" @click="unfoldStatus = !unfoldStatus">
            收起<i class="el-icon--right el-icon-arrow-up"></i>
          </span>
        </div>
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
    },
    defaultShowLength: {
      type: Number,
      default: 0
    },
    pdClass: {
      type: String,
      default: 'p-10'
    },
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
        end_width = document.getElementById('setBox').clientWidth,
        child_width = 0, cidx = 0
      if(type == 2){
        if(this.defaultShowLength > 0) return
        for(var i in child){
          if(parseInt(child[i].clientWidth) >= 0 && i != child.length -1){
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
        box_width = box_width - end_width
        for(var i in child){
          if(parseInt(child[i].clientWidth) > 0 && i != child.length -1){
            cidx++
            child_width += child[i].clientWidth + 1
            if(this.defaultShowLength > 0){
              if(this.defaultShowLength < cidx || (box_width < child_width && i != 0)){
                if(this.child_i == -1) this.child_i = i
                child[i].style.display = 'none'
              }
            }else if(box_width < child_width && i != 0){
              if(this.child_i == -1) this.child_i = i
              child[i].style.display = 'none'
            }
          }
        }
        filterBox.classList.remove('flex1')
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
    saveXlsx(){
      this.$emit('saveXlsx')
    },

    /**
     * 查询
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
  .filter-box{
    padding-bottom: 1px;
    /deep/ .el-tabs--top{
      .el-tabs__item{
        height: 28px;
        margin: 0 6px;
        padding: 0 12px;
        line-height: 28px;
      }
      .el-tabs__item.is-active {
        background-color: #F2F3F5;
        border-radius: 100px;
        font-weight: 550;
        color: var(--olive);
      }
      .el-tabs__nav-wrap::after{
        background: none;
      }
      .el-tabs__nav-next, .el-tabs__nav-prev{
        line-height: 28px;
      }
      .el-tabs__active-bar{
        display: none;
      }
    }
  }
  .filterBox{
    max-height: 42.667px;
    transition: max-height 0.5s linear;
    /deep/ .el-form-item{
      padding-right: 20px;
      display: flex;
      .el-form-item__label-wrap{
        margin-left: 0 !important;
        float: initial;
      }
      .el-form-item__label{

        padding-right: 10px;
        //min-width: 64px;
        font-weight: 500;
        font-size: 13px;
      }
    }
    &.fold{
      max-height: 400px;
      /deep/ > div.el-form-item {
        &:last-child {
          margin-right: -15px;
        }
      }
      .el-form-item{
        & + .set-box{
          margin-left: 0;
        }
      }
    }
    /deep/ .el-form-item::last-child {
      margin-right: -15px;
    }
    /deep/ .el-form-item__content{
      margin-left: 0 !important;
      height: 32px;
    }
    /deep/ > div:not(.set-box) {
      margin-bottom: 10px;
    }
    /deep/ .el-input{
      width: initial;
      height: 32px;
    }
    /deep/ .combined .el-select{
      &:first-child{
        border-right: 1px solid #E5E6EB;
      }
    }
    /deep/ .el-input__inner{
      padding-left: 10px;
      width: 135px;
      height: 32px !important;
      line-height: 32px;
      border: 1px solid #F2F3F5;
      background: #F2F3F5;
      border-radius: 0;
    }

    /deep/ .el-select__caret{
      line-height: 32px;
    }
    /deep/ .el-input__suffix, /deep/ .el-input__icon{
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
      padding: 0 0 0 10px;

    }
    /deep/ .el-range-input{
      background: #F2F3F5;
    }
  }
  .set-box{
    border-left: 1px solid #E5E6EB;
    margin-bottom: 10px;
  }
  .icon-download{
    padding: 0 10px;
    height: 32px;
  }
  .icon-search{
    padding: 0 16px;
    // width: 32px;
    // height: 32px;
    // border-radius: 0 2px 2px 0;
    &.icon-refresh{
      background-color: var(--greyLight);
      border-color: var(--greyLight);
    }
  }
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  /deep/ .el-button--small{
    height: 32px;
  }

  .filter-popup{
    width: 100%;
    z-index: 99;
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    .filterBox{
      max-height: 999px;
      justify-content: start;
    }
  }

</style>
