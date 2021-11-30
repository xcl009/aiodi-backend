<template>
  <div class="home-box bg-white">
    <panel-group :total-data="totalData" />
    <div class="p-5">
      <el-row :gutter="device === 'mobile' ? 0 : 5">
        <device-type :platList="platList" @switchType="pieSwitchType" @switchPlat="pieSwitchPlat" />
        <el-col class="mb-5" :md="24" :lg="13">
          <pie-chart ref="pieChart" />
        </el-col>

        <el-col class="mb-5" :md="24" :lg="11">
          <line-chart ref="lineChart" />
        </el-col>
      </el-row>

      <!-- 地图全屏展示 -->
      <div v-if="mapScreen" class="fixed p-all" style="z-index: 9999;">
        <el-button icon="el-icon-arrow-left" type="info" size="mini" plain class="fixed arrow-btn arrow-left fs-b2"
          @click="mapScreen = false" />
        <maps ref="map_box_screen" :center="{lat: 33.272016, lng: 105.801051}" :is-edit="false" :zooms="6"
          :height="'100vh'"  /> <!-- @setShopInfo="setShopInfo" -->
        <div class="z-99 abs map-data_content" style="top: 15px; right: 15px;">
          <collapse-transition name="toTop">
            <div v-show="mapDataStatus" class="p-10 map-data_box fs-s3">
              <div class="mb-5 f-w text-primary">充电宝详情：</div>
              <div class="flex">
                <div class="pr-20">
                  <div class="flex1">总底座数：{{ totalData.total_zuos }}个</div>
                  <div class="flex1">总商户数：{{ totalData.total_stores }}个</div>
                  <div class="flex1">今日借出：{{ totalData.today_rent_bao_num }}个</div>
                </div>
                <div>
                  <div class="flex1">总充电宝：{{ totalData.total_baos }}个</div>
                  <div class="flex1">当前借出：{{ totalData.today_scan_user_num }}个</div>
                  <div class="flex1">超时借出：{{ totalData.overtime_rent_bao_num }}个</div>
                </div>
              </div>
              <div class="mb-5 mt-10 f-w text-primary">维修详情：</div>
              <div class="flex">
                <div class="pr-20">
                  <div class="flex1">正常设备：{{ deviceData.usual_zuo_num }}个</div>
                  <div class="flex1">设备报修：{{ deviceData.repaire_num }}个</div>
                </div>
                <div>
                  <div class="flex1">异常设备：{{ deviceData.unusual_zuo_num }}个</div>
                </div>
              </div>
              <div v-if="shopInfo.id > 0" class="mb-5 mt-10 f-w text-primary">商户详情：</div>
              <div v-if="shopInfo.id > 0">
                <div>商户ID：{{ shopInfo.id }}</div>
                <div>商户名称：{{ shopInfo.store_name }}</div>
                <div>手机号码：{{ shopInfo.mobile }}</div>
                <div>地址：{{ shopInfo.address }}</div>
              </div>
              <div v-if="shopInfo.id > 0" class="mt-10">
                <div v-for="item in shopInfo.device_type_arr" v-if="item.has_num > 0">
                  {{ item.depend_name }}：{{ item.has_num }}</div>
              </div>
            </div>
          </collapse-transition>
          <div class="text-right">
            <el-button :icon="mapDataStatus ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" size="mini"
              class="arrow-btn fs-b2" @click="mapDataStatus = !mapDataStatus" />
          </div>
        </div>
      </div>
    </div>

    <div class="el-notification" v-bind:class="{'notification-show': informStatus}">
      <div style="width: 100%;">
        <h2 class="el-notification__title">服务通知</h2>
        <div class="pt-5 el-notification__content fs-s3">
          <template v-for="item in informList">
            <div class="mt-5 flex text-cut cursor" v-if="item.num > 0 && item.content" @click="$router.push({path: item.url})">
              <div class="title text-primary">{{ item.name }}</div>
              <div class="pr-10 flex1 text-cut">{{ item.content }}</div>
              <el-button class="p-5" type="primary" size="mini" plain round>去处理</el-button>
            </div>
          </template>
        </div>
        <div
          class="el-notification__closeBtn el-icon-close"
          @click="
            informStatus = false;
            $store.dispatch('rests/changeSetting', {
            key: 'informClose',
            value: true
          })"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
  import todo from './_todo.vue'
  import lineChart from './_lineChart.vue'
  import deviceType from './_deviceType.vue'
  import pieChart from './_pieChart.vue'
  import panelGroup from './_panelGroup.vue'
  import maps from '@/components/map'
  import CollapseTransition from '@/utils/collapse-transition'

  export default {
    name: 'Home',
    components: {
      panelGroup,
      pieChart,
      deviceType,
      maps,
      lineChart,
      todo,
      collapseTransition: CollapseTransition
    },
    data() {
      return {
        date_type: 1,
        totalData: {},
        statMoney: {},
        deviceData: {},
        shopInfo: {},

        mapScreen: false,
        mapDataStatus: false,
        search_agent_id: 0,
        platList: [],
        brand_icon: {},

        percent: {
          0: 'bao',
          4: 'wash',
          2: 'massage',
          3: 'zhuang'
        },

        device_type: -1,

        informStatus: false,
        informList: []
      }
    },
    computed: {
      device() {
        return this.$store.state.app.device
      },
      deviceNameObj() {
        return this.$store.getters.deviceNameObj
      },
      agentInfo() {
        return this.$store.getters.agentInfo
      },
      rests() {
        return this.$store.getters.rests
      }
    },
    created() {

    },
    mounted() {
      // this.getMoney()
      // this.getTotalData()
      // this.getPlatList()
      // this.$get('getLoginMenu').then(res => {
      //   console.log(res)
      // })
    },
    methods: {
      /**
       * 可提现金额
       */
      getMoney() {
        this.$get('agentapi/index').then(res => {
          this.statMoney = res
        })
      },

      /**
       * 总数据
       */
      getTotalData() {
        this.$get('agentapi/my_stat_data').then(res => {
          this.totalData = res
        })
      },

      /**
       * 地图数据
       */
      getDeviceData() {
        this.$get('SyStatistics/getTotalDevicePlace', {//agentapi/my_total_device_data
          search_agent_id: this.search_agent_id,
          device_type: this.device_type,
        }).then(res => {
          let store_list = []
          res.map(item => {
            if (item.store_id) {
              let device_type = item.depend_type[0] || 0
              if (this.brand_icon[item.belong_agent_id] && this.brand_icon[item.belong_agent_id][device_type]) {
                item.icon = this.brand_icon[item.belong_agent_id][device_type]
                store_list.push(item)
              }
            }
          })
          this.store_list = store_list
          if (this.$refs.map_box) this.$refs.map_box.setMapLayer(store_list)
        })
      },

      /**
       * 地图标点店铺信息
       */
      setShopInfo(info) {
        if (this.mapScreen) this.mapDataStatus = !!info.id
        this.shopInfo = info
      },

      getPlatList() {
        const brand_icon = {}
        this.$get('commonapi/configer/get_platform_list').then(res => {
          res.map(item => {
            brand_icon[item.agent_id] = {}
            item.device_type.map(icon => {
              brand_icon[item.agent_id][icon.depend_type] = icon.icon_url
            })
          })
          this.brand_icon = brand_icon
          this.platList = res
          this.getDeviceData()
        })
      },

      /**
       * 饼图选择设备类型
       */
      pieSwitchType(type) {
        this.$refs.pieChart.switchType(type)
        //this.$refs.lineChart.switchType(type)
        this.device_type = type
        this.getDeviceData()
      },

      /**
       * 饼图选择平台
       */
      pieSwitchPlat(search_agent_id) {
        this.$refs.pieChart.switchPlat(search_agent_id)
        this.$refs.lineChart.switchPlat(search_agent_id)
        this.search_agent_id = search_agent_id
        this.getDeviceData()
      },

      setMapScreen() {
        this.mapScreen = true
        setTimeout(() => {
          this.$refs.map_box_screen.setMapLayer(this.store_list)
        }, 20)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .home-box{
    min-height: calc(100vh - 40px);
  }
  @media screen and (min-width: 768px) {
    .left-box {
      padding-right: 20px;
    }

    .totalData .el-col-sm-5 {
      width: 20%;
    }
  }

  .el-icon-full-screen {
    right: 10px;
    bottom: 10px;
    z-index: 2;
    font-size: 40px;
  }

  .arrow-left {
    top: 15px;
    left: 15px;
    z-index: 1;
  }

  /deep/ .bm-view {
    .BMap_Marker {
      animation: myfirst 3s ease 0s 1;
    }
  }

  @keyframes myfirst {
    0% {
      transform: translateY(-20px);
    }

    20% {
      transform: translateY(0px);
    }

    40% {
      transform: translateY(-20px);
    }

    60% {
      transform: translateY(0px);
    }

    80% {
      transform: translateY(-20px);
    }

    100% {
      transform: translateY(0px);
    }
  }

  .map-data_content {
    top: 5px;
    right: 5px;

    .map-data_box {
      width: 280px;
      max-height: 500px;
      border-radius: 6px;
      background: rgba(255, 255, 255, .85);
      box-shadow: 0 0 4px rgba(144, 195, 40, .75);
    }

    .arrow-btn {
      padding: 5px 15px;
    }
  }

  .el-notification{
    padding: 10px;
    width: 400px;
    right: -400px;
    max-width: 90%;
    bottom: 16px;
    z-index: 2006;
    transition: all 0.6s;
    /deep/ .el-button--mini.is-round{
      padding: 4px 8px;
    }
    .title{
      width: 80px;
    }
  }
  .notification-show{
    transform: translateX(-420px);
  }
  // .toTop-enter-active, .toTop-leave-active {
  //   transition: all 1s ease;
  // }
  // .toTop-enter, .toTop-leave-to /* .fade-leave-active below version 2.1.8 */ {
  //   height: 0;
  // }
</style>
