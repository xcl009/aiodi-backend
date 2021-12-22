<template>
  <div class="mb-10 pl-10 pr-10 pt-10 flex align-center justify-between equip-head">
    <b class="mr-15">{{ title }}</b>
    <div class="flex flex-wrap flex1" v-if="showEquip">
      <div class="mr-15 flex align-center fs-s2 cursor equip-label" :class="device_type == '-1' ? 'act' : ''" @click="switchType(-1)" v-if="myDeviceName && Object.values(myDeviceName).length > 1">
        <span class="mr-5 label-bg" :style="{'background': colorPalette[7]}"></span>
        <span>全部</span>
      </div>
      <div class="mr-15 flex align-center fs-s2 cursor equip-label" :class="device_type == item ? 'act' : ''" v-for="(item, index) in myDeviceName" @click="switchType(item)">
        <span class="mr-5 label-bg" :style="{'background': colorPalette[item]}"></span>
        <span>{{ index }}</span>
      </div>
    </div>
    <el-dropdown trigger="click" v-if="checkRoles(['terminal'])">
      <span class="cursor el-dropdown-link">
        {{ drop_title }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item tabindex="0" @click.native="drop(0, '全部品牌')">全部品牌</el-dropdown-item>
        <el-dropdown-item v-for="item in platList" :tabindex="item.agent_id" @click.native="drop(item.agent_id, item.mini_name)">{{ item.mini_name }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import { delComma, colorPalette } from '@/utils/index'

export default {
  components: {
    CountTo
  },
  props: {
    title: {
      type: String,
      default: '数据统计'
    },
    showEquip: {
      type: Boolean,
      default: true
    },
    platList: {
      type: Array,
      default: []
    }
  },
  computed: {
    myDeviceName(){
      return this.$store.getters.myDeviceName
    }
  },
  data(){
    return {
      device_type: -1,
      colorPalette: colorPalette(),
      son_list: [],
      search_agent_id: '0',
      drop_title: '全部品牌'
    }
  },
  mounted(){
    
  },
  methods: {
    switchType(type) {
      this.device_type = type
      this.$emit('switchType', type)
    },

    drop(v, n){
      this.drop_title = n
      this.$emit('switchPlat', v)
    }
  }
}
</script>

<style lang="scss" scoped>
  .equip-label{
    padding: 3px 0;
    .label-bg{
      width: 15px;
      height: 15px;
      border-radius: 3px;
      background: red;
    }
    &.act{
       font-weight: bold;
      .label-bg{
        width: 20px;
        height: 20px;
      }
    }
  }
</style>
