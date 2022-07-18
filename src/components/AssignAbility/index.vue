<template>
  <el-dialog :visible.sync="dialogStatus" :show-close="false" :modal-append-to-body="false" width="600px" :center="true"  title="售货机设置">
    <div class="text-center" v-if="dform.menus">
      <template v-for="item in agentInfo.AssignAbility">
        <el-checkbox class="mt-5 mb-5" v-model="dform.menus[item.id]" v-if="item.displayFlag != noFlag">{{ item.name }}</el-checkbox>
      </template>
    </div>
    <div class="mt-30 text-center">
      <el-button size="medium" class="bg-body" @click="dialogStatus = false">取消</el-button>
      <el-button size="medium" type="primary" @click="dialogConfirm()" :disabled="clickSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: 'VendorMode',
    data() {
      return {
        clickSubmit: false,
        dialogStatus: false,
        dform: {}
      }
    },
    props: {
      noFlag: {
        type: String,
        default: 'STORE_ASSIGN'
      }
    },
    computed: {
      agentInfo(){
        return this.$store.getters.agentInfo
      },
      Ability() {
        return this.$store.getters.Ability
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 获取下级权限
       */
      getAuthMenu(childId){
        this.dialogStatus = true
        this.$get('iot-saas-user/auth/menu', {
          childId: childId
        }).then(res => {
          if(res && res.length > 0){
            let menus = {}
            res = res || []
            res.map(item => {
              menus[item.id] = true
              if(item.childrenAuthList && item.childrenAuthList.length > 0){
                item.childrenAuthList.map(sitem => {
                  menus[sitem.id] = true
                })
              }
            })
            this.$set(this.dform, 'menus', menus)
          }
        })
        this.$set(this.dform, 'childUserId', childId)
      },

      /**
       * 弹窗确认
       */
      dialogConfirm() {
        if(this.clickSubmit) return
        this.clickSubmit = true
        let menus = [], params = JSON.parse(JSON.stringify(this.dform))
        for(var i in params.menus){
          if(params.menus[i]) menus.push(i)
        }
        params.menus = menus
        this.$put('iot-saas-user/auth/childMenu', params).then(res => {
          this.$message({
            type: 'success',
            message: '设置成功'
          })
          this.dialogStatus = false
          this.clickSubmit = false
        }).catch(err => {
          this.clickSubmit = false
        })
      }
    }
  }
</script>
<style scoped lang="scss">

</style>
