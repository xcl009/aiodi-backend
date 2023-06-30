<template>
  <el-popover popper-class="el-popovers" placement="bottom" trigger="click" v-model="popoversStatus">
    <div class="custom">
      <div class="pl-10 pt-10 pr-10 pb-5">
        <draggable group="task" :list="showColumn">
          <div class="flex align-center pt-5 pb-5" v-for="(item, key) in showColumn" :key="item.key">
            <img :src="require('@/assets/table_sort.svg')" slot="reference" class="mr-10 block grab" width="16" alt="">
            <el-checkbox class="block mr-0" v-model="item.val">{{ item.name }}</el-checkbox>
          </div>
        </draggable>
      </div>
      <div class="p-10 flex justify-around l-t">
        <el-button type="info" size="mini" plain @click="setColumn(2)">重置</el-button>
        <el-button type="primary" size="mini" @click="setColumn(1)">确定</el-button>
      </div>
    </div>
    <img :src="require('@/assets/table_head.svg')" slot="reference" class="ml-20 block cursor" width="16" alt="">
  </el-popover>
</template>

<script>
  import draggable from 'vuedraggable'
  export default {
    components: {
      draggable
    },
    props: {
      showColumn: {
        type: Array,
        default () {
          return []
        }
      },
      storageKey: {
        type: String,
        val: ''
      },
      defaultColumn: {
        type: Array,
        default () {
          return []
        }
      }
    },
    data() {
      return {
        popoversStatus: false
      }
    },
    mounted() {
      if (localStorage.getItem(this.storageKey)) {
        let showColumn = JSON.parse(localStorage.getItem(this.storageKey))
        this.$emit('update:showColumn', this.arrayUnique(showColumn.concat(this.defaultColumn), 'key'))
      } else {
        this.$emit('update:showColumn', this.defaultColumn)
      }
    },
    methods: {
      /**
       * 数组指定键值去重
       * @param {Object} prop
       * @param {Object} arr
       */
      arrayUnique(arr, prop) {
        return arr.filter((element, index, self) => {
          return self.findIndex(el => el[prop] === element[prop]) === index
        })
      },

      /**
       * 设置表格表头
       */
      setColumn(type = 1) {
        if (type == 1) {
          localStorage.setItem(this.storageKey, JSON.stringify(this.showColumn))
        } else {
          localStorage.removeItem(this.storageKey)
          this.$emit('update:showColumn', this.defaultColumn)
        }
        this.popoversStatus = false
      }
    }
  }
</script>

<style lang="scss" scoped>
  .grab{
    cursor: grab
  }
</style>
