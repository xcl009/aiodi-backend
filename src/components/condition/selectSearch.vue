<template>
  <el-select
    filterable
    remote
    :placeholder="placeholder"
    :remote-method="searchList"
    :loading="loading"
    :value="value"
    @change="toQuery"
    >
    <el-option
      v-for="item in list"
      :key="item.id"
      :label="`${item[name]}`"
      :value="isStoreOrder || emitRow ? item : item.id">
    </el-option>
  </el-select>
</template>

<script>
export default {
  props: {
    value: '',

    type: {
      type: Number,
      default: 1 // 用户手机号 2 用户昵称 3 商户名称 4 设备SN 5 代理名称 6 品牌名称
    },

    name: {
      type: String,
      default: ''
    },

    placeholder: {
      type: String,
      default: ''
    },

    isStoreOrder: {
      type: Boolean, // 是否是订单列表商户ID筛选
      default: false
    },
    
    emitRow: {
      type: Boolean, // 是否是订单列表商户ID筛选
      default: false
    }
  },
  computed: {

  },
  data(){
    return {
      loading: false,
      list: [],

      apiArr: {
        1: 'iot-saas-user/api/user/query',
        2: 'iot-saas-user/api/user/query',
        3: 'iot-saas-basic/admin/store/simpleQuery',
        4: 'iot-saas-device/admin/device/simpleQuery',
        5: 'iot-saas-basic/admin/agent/simpleQuery',
        6: 'iot-saas-basic/admin/brand/findPage'
      }
    }
  },
  mounted() {

  },
  methods: {
    /**
     * 搜索
     * @param {String} val
     */
    searchList(val){
      let url = '', params = {
        page: 0,
        size: 20
      }
      params[this.name] = val
      this.loading = true
      this.$get(this.apiArr[this.type], params).then(res => {
        this.list = res.rows
        this.loading = false
      }).catch(err => {
        this.loading = false
      })
    },

    /**
     * 选择结果
     */
    toQuery(val){
      if(this.isStoreOrder){
        val = `${val.id}&${val.agentId}&${val.brandId}`
      }
      if(this.emitRow){
        this.$emit('change', val)
      }else{
        this.$emit('input', val)
        this.$emit('change')
      }
      
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
