<template>
  <div class="p-5">
    <div class="mt-5 pt-20 pl-20 pr-20 bg-white">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="8" :xl="6" class="pb-20 cursor"
          v-if="checkAbility(['WD_AGENT', 'WD_STORE', 'WD_USER'], 3)">
          <div class="role-item flexv justify-between">
            <div class="flex align-center">
              <div class="icon-box flex align-center justify-center">
                <svg-icon icon-class="mall"></svg-icon>
              </div>
              <div class="pl-20 flex1">
                <div class="fs-b1">{{ $t('system.withdrawalRules') }}</div>
                <div class="mt-5 fs-s3 text-gray">{{ $t('system.withdrawalRulesText') }}</div>
              </div>
            </div>
            <div class="text-right">
              <el-button plain class="bg-body text-primary" @click="$router.push({ path: `/system/cashSet` })">{{
                $t('system.setDefault') }}</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="24" class="pb-20 cursor">
          <div>{{ $t('system.development') }}</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'systemTools1111',
  components: {

  },
  data() {
    return {

    }
  },
  computed: {
    Ability() {
      return this.$store.getters.Ability
    },
    agentInfo() {
      return this.$store.getters.agentInfo
    }
  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.role-item {
  padding: 20px 16px;
  height: 184px;
  border-radius: 4px;
  border: 1px solid #E5E6EB;

  .icon-box {
    width: 64px;
    height: 64px;
    background-color: var(--olive);
    border-radius: 64px;
    font-size: 20px;
    color: var(--white);
  }

  .bg-body {
    padding: 10px 15px;
  }
}</style>
