<template>
  <div>
    <el-form-item label="提现时间:">
      <el-radio v-model="form[`${name}_withdraw_date_type`]" :label="0">每天</el-radio>
      <el-radio v-model="form[`${name}_withdraw_date_type`]" :label="1">每周</el-radio>
      <el-radio v-model="form[`${name}_withdraw_date_type`]" :label="2">每月</el-radio>
    </el-form-item>

    <div class="flex align-start flex-wrap" v-for="(item, index) in form[`${name}_withdraw_plan`]">
      <el-form-item class="mr-20" label="每周：" v-if="form[`${name}_withdraw_date_type`] == 1">
        <el-select v-model="item.week_day" placeholder="请选择">
         <el-option
           v-for="(iitem, iindex) in week"
           :label="iitem"
           :value="iindex">
         </el-option>
       </el-select>
      </el-form-item>

      <el-form-item class="mr-20" label="每月：" v-if="form[`${name}_withdraw_date_type`] == 2">
        <el-select v-model="item.month_day" placeholder="请选择">
          <el-option
            v-for="iitem in 28"
            :label="iitem + '号'"
            :value="iitem">
          </el-option>
       </el-select>
      </el-form-item>

      <el-form-item class="mr-20" label="开始时间：">
        <el-time-select
          v-model="item.begin"
          :picker-options="{
            start: '00:00',
            step: '00:30',
            end: '23:59'
          }"
          placeholder="开始时间">
        </el-time-select>
      </el-form-item>
      <el-form-item class="mr-20" label="结束时间：">
        <el-time-select
          v-model="item.end"
          :picker-options="{
            start: '00:00',
            step: '00:30',
            end: '23:59',
            minTime: item.begin
          }"
          placeholder="结束时间">
        </el-time-select>
      </el-form-item>
      <el-button type="primary" icon="el-icon-plus" v-if="form[`${name}_withdraw_plan`].length < config.steal_time_length && index == 0" @click="form[`${name}_withdraw_plan`].push({
        week_day: 0,
        month_day: 1,
        begin: '00:00',
        end: '24:00'
      })"></el-button>
      <el-button type="danger" icon="el-icon-minus" v-if="form[`${name}_withdraw_plan`].length > 1 && index > 0" @click="form[`${name}_withdraw_plan`].splice(index, 1)"></el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    form: {
      type: Object,
      default: {}
    },
    name: {
      type: String,
      default: 'agent'
    }
  },
  data(){
    return {
      week: ['日', '一', '二', '三', '四', '五', '六'],
    }
  },
  mounted(){

  },
  methods: {
  }
}
</script>
