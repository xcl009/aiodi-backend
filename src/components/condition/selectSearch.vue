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
      :value="item.id">
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
      this.$emit('input', val)
      this.$emit('change')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
