<template>
  <div>
    <el-row :gutter="device === 'mobile' ? 0 : 5" type="flex" class="flex-wrap">
      <el-col class="mb-5 to-do" :md="24" :lg="13">
        <el-card shadow="hover" :body-style="{ padding: '10px' }">
          <div v-if="toDo.length > 0" class="flex align-center">
            <b>待办事宜</b>
          </div>
          <el-row v-if="toDo.length > 0" :gutter="10" type="flex" class="mb-20 flex-wrap text-center">
            <el-col v-for="(item, index) in toDo" :md="3" :lg="5">
              <div class="pt-10 pb-10 mt-10 to-item cursor" :style="{borderColor: colorPalette[index], color: colorPalette[index]}" @click="$router.push({path: `${checkRoles(['terminal']) ? '' : item.url}`})">
                <div class="fs-b5">{{ item.num }}</div>
                <div class="text-gray fs-s2">{{ item.name }}</div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :sm="24" :lg="12">
              <router-link to="/home/article?type=1" class="pt-10 mb-10 flex align-center">
                <b class="flex1">最新公告</b>
                <span class="fs-s2 text-gray">更多<i class="el-icon-arrow-right el-icon--right" /></span>
              </router-link>
              <div class="marquee_box fs-s2 text-left" :class="{'f-h': toDo.length == 0 }">
                <ul class="marquee_list" :class="{'marquee_top': marquee_top && toDo.length > 0}">
                  <li v-for="item in articleList" class="text-cut">
                    <el-link class="text-cut block" :underline="false" @click="getDetail(item)">
                      <span class="mr-10">{{ parseTime(item.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
                      <span>{{ item.title }}</span>
                    </el-link>
                  </li>
                </ul>
              </div>
            </el-col>
            <el-col :sm="24" :lg="12">
              <router-link to="/home/updateRecord" class="pt-10 mb-10 flex align-center">
                <b class="flex1">更新公告</b>
                <span class="fs-s2 text-gray">更多<i class="el-icon-arrow-right el-icon--right" /></span>
              </router-link>
              <div class="marquee_box fs-s2 text-left" :class="{'f-h': toDo.length == 0 }">
                <ul class="marquee_list" :class="{'marquee_top': marquee_top && toDo.length > 0}">
                  <li v-for="item in updateList" class="text-cut">
                    <el-link class="text-cut block" :underline="false" @click="getDetail(item)">
                      <span class="mr-10">{{ parseTime(item.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
                      <span>{{ item.title }}</span>
                    </el-link>
                  </li>
                </ul>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col class="mb-5" :md="24" :lg="11">
        <el-card shadow="hover" style="height: 100%;">
          <div class="mb-10 flex align-center">
            <b>智能检测</b>
          </div>
          <el-row :gutter="device === 'mobile' ? 5 : 20">
            <el-col :md="24" :lg="10">
              <el-row :gutter="device === 'mobile' ? 5 : 10" class="text-center">
                <el-col v-for="(item, index) in device_data" class="mt-10" :span="12">
                  <div class="pt-15 pb-15 radius-10 text-white cursor" :style="{'background': colorPalette[index]}" @click="$router.push({path: item.url})">
                    <div class="f-w fs-a1">
                      <count-to :start-val="0" :end-val="delComma(item.total_num)" :duration="2600" />
                    </div>
                    <div class="fs-s3">{{ item.name }}</div>
                  </div>
                </el-col>
                <el-col class="mt-10" :span="12">
                  <div class="pt-15 pb-15 radius-10 text-white cursor" :style="{'background': colorPalette[5]}" @click="$router.push({path: `/home/income`})">
                    <div class="f-w fs-a1">
                      <count-to :start-val="0" :end-val="delComma(statMoney.income)" :duration="2600" :decimals="2" />
                    </div>
                    <div class="fs-s3">累计收益</div>
                  </div>
                </el-col>
              </el-row>
            </el-col>
            <el-col :md="24" :lg="14">
              <el-row :gutter="device === 'mobile' ? 5 : 10">
                <div class="pl-5 mb-10 flex align-center">
                  <img src="@/assets/zljc.png" width="100" alt="">
                  <div class="pl-10">
                    <div class="mb-5">设备智能检测，检测出异常设备</div>
                    <div class="mb-10 fs-s2">每天定时检测，异常设备及时处理，有利于营业额翻倍</div>
                    <el-button type="success" size="small" round plain>异常问题请及时处理</el-button>
                  </div>
                </div>
                <div class="mb-5 pl-5">
                  <el-radio-group v-model="abnormal_type" size="mini">
                    <el-radio-button :label="0" v-if="!checkRoles(['terminal'])">我的</el-radio-button>
                    <el-radio-button :label="1" v-if="!checkRoles(['salesman', 'merchants'])">下级</el-radio-button>
                  </el-radio-group>
                </div>
                <el-col v-for="(item, index) in abnormalInfo[abnormal_type]" class="mt-10" :span="12">
                  <div class="cursor" @click="jump(item)">{{ item.name }}：<span class="text-danger">
                    <count-to :start-val="0" :end-val="delComma(item.num)" :duration="2600" /></span></div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :title="info.title" :visible.sync="detailVisible">
      <div class="max-w bg-gray" v-html="info.content" />
    </el-dialog>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import {
  delComma,
  colorPalette
} from '@/utils/index'

export default {
  components: {
    CountTo
  },

  props: {
    statMoney: {
      type: Object,
      default: {}
    }
  },

  data() {
    return {
      delComma: delComma,
      date_type: 5,
      device_data: [],
      colorPalette: colorPalette(),
      abnormalInfo: [{}, {}],
      abnormal_type: this.checkRoles('terminal') ? 1 : 0,

      toDo: [],
      articleList: [],
      updateList: [],
      marquee_top: false,
      info: {},
      detailVisible: false
    }
  },

  computed: {
    device() {
      return this.$store.state.app.device
    }
  },

  mounted() {
    this.getStatistics()
    this.getTodo()
    this.getAbnormalData()
    this.getArticle()
    this.getArticle(4)
  },

  methods: {
    /**
     * 获取公告
     */
    getArticle(type = 1) {
      const url = 'agentapi/article/public_list'
      this.$get(url, {
        article_type: type
      }).then(res => {
        if (type == 1) {
          this.articleList = res.list
          setInterval(() => {
            this.showMarquee()
          }, 3000)
        } else {
          this.updateList = res.list
          setInterval(() => {
            this.showMarquee('updateList')
          }, 3000)
        }
      })
    },

    /**
       * 文章详情
       */
    getDetail(row) {
      this.$get('agentapi/article/detail', {
        id: row.id
      }).then(res => {
        this.info = res.info
        this.detailVisible = true
      })
    },

    /**
       * 代办事宜
       */
    getTodo() {
      this.$get('agentapi/business/pending_items').then(res => {
        this.toDo = res
      })
    },

    /**
     * 折线图统计
     */
    getStatistics() {
      const date_type = this.date_type
      this.$get('SyStatistics/getStatisticsdataByAgent', {// 'agentapi/my_statistics_data'
        date_type: date_type
      }).then(res => {
        if(this.checkRoles(['terminal'])){
          res.map(item => {
            switch (item.url){
              case '/agent/index':
                return item.url = '/partner/index'
              break
              case '/agent/subAgent':
                return item.url = '/partner/subAgent'
              break
              case '/shop/index':
                return item.url = '/shop/subShop'
              break
            }
          })
        }
        this.device_data = res
      })
    },

    /**
       * 异常数据
       */
    getAbnormalData() {
      this.$get('agentapi/business/entire_detection', {}).then(res => {
        this.abnormalInfo = [
          res.my_info,
          res.son_info
        ]
      })
    },

    /**
       * 跳转
       */
    jump(item) {
      window.sort_id_key = item.type == 1 ? item.goods_id : item.order_id
      if (item.type == 1 && this.abnormal_type == 0) {
        this.$router.push({
          path: '/equipment/index',
          query: {
            'sort_id_key': true
          }
        })
      } else if (item.type == 1 && this.abnormal_type == 1) {
        this.$router.push({
          path: '/equipment/subEquipment',
          query: {
            'sort_id_key': true
          }
        })
      } else if (item.type == 2 && this.abnormal_type == 0) {
        this.$router.push({
          path: '/order/meOrder',
          query: {
            'sort_id_key': true
          }
        })
      } else if (item.type == 2 && this.abnormal_type == 1) {
        this.$router.push({
          path: '/order/subOrder',
          query: {
            'sort_id_key': true
          }
        })
      }
    },

    showMarquee(name = 'articleList') {
      this.marquee_top = true
      setTimeout(() => {
        this[name].push(this[name][0])
        this[name].shift()
        this.marquee_top = false
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
  .to-do {
    .to-item {
      border: thin solid rgb(46, 199, 201);
      border-radius: 8px;
    }
  }
  .marquee_box {
    position: relative;
    height: 50px;
    overflow: hidden;
    &.f-h{
      height: 270px;
    }
    .marquee_list {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      li{
        line-height: 25px;
      }
    }
    .marquee_top {
      transition: all 0.5s;
      margin-top: -24px
    }
  }
</style>
