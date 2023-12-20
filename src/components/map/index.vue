<template>
  <div>
    <div class="mb-10" v-if="isEdit">
      <el-input v-model="keyword" :placeholder="$t('components.inputText')" />
      <!-- <div class="mt-10 flex align-center">
        <div>经度：</div>
        <el-input class="mr-10 flex1" v-model="center.lat" placeholder="经度" />
        <div class="ml-10">纬度：</div>
        <el-input class="flex1" v-model="center.lng" placeholder="纬度" />
      </div> -->
    </div>
    <baidu-map ref="map_box" class="bm-view" :style="{ height: height }" :ak="config.baidu_map_ak"
      :center="center.lat ? center : iniCenter" :zoom="zoom" :scroll-wheel-zoom="true" @ready="handler" @click="mapClick"
      @moveend="handlerMoveend">
      <img v-if="isEdit" class="map-icon" src="@/assets/marker_red_sprite.png" alt="">
      <!-- <bm-marker-clusterer :averageCenter="true" :maxZoom="2" :minClusterSize="15" v-else>
        <bm-marker v-for="marker in markers" v-if="marker.lng" :position="{lng: marker.lng, lat: marker.lat}" :icon="{url: marker.icon, size: imgSize}" @click="setShopInfo(marker)"></bm-marker>
      </bm-marker-clusterer> -->
      <bm-local-search class="search-list" :auto-viewport="true" :keyword="keyword" :page-capacity="5" :panel="showPanel"
        @infohtmlset="infohtmlset"></bm-local-search>
      <bm-geolocation :autoLocation="true"></bm-geolocation>
    </baidu-map>
  </div>
</template>
.
<script>
import BaiduMap from 'vue-baidu-map/components/map/Map.vue';
import BmGeolocation from 'vue-baidu-map/components/controls/Geolocation.vue';
import BmLocalSearch from 'vue-baidu-map/components/search/LocalSearch'; //搜索
//import BmMarker from 'vue-baidu-map/components/overlays/Marker'; //点标注
//import BmMarkerClusterer from 'vue-baidu-map/components/extra/MarkerClusterer.vue'; //点标注

export default {
  components: {
    BaiduMap,
    BmGeolocation,
    BmLocalSearch,
    //BmMarker,
    //BmMarkerClusterer
  },
  props: {
    center: {
      type: Object,
      default: () => {
        return {
          lng: 114.02597366,
          lat: 22.54605355
        }
      }
    },

    isEdit: {
      type: Boolean,
      default: true
    },

    zooms: {
      type: Number,
      default: 14
    },

    height: {
      type: String,
      default: '300px'
    }
  },

  data() {
    return {
      iniCenter: {},
      shopInfo: {},
      infoVisible: false,
      keyword: '',
      showPanel: true,

      imgSize: {
        width: 35,
        height: 35,
      },

      map_obj: '',
      mapvLayer: '',

      zoom: 14
    }
  },
  mounted() {

  },
  methods: {
    handler({ BMap, map }) {
      let that = this, ivn = 0, geolocation = new BMap.Geolocation()
      that.map_obj = map
      that.BMap = BMap
      that.geocoder = new BMap.Geocoder()
      if (this.zooms) this.zoom = this.zooms
      if (!this.$route.params.id) {
        geolocation.getCurrentPosition(function (r) {
          that.iniCenter = {
            lng: r.longitude,
            lat: r.latitude,
          }
          that.update()
        }, { enableHighAccuracy: true })
      }
    },

    /**
     * 设置地图图标
     */
    setMapLayer(markers) {
      let that = this
      if (that.mapvLayer) {
        that.mapvLayer.hide()
      }
      let markers_inter = setInterval(() => {
        if (this.map_obj) {
          clearInterval(markers_inter)
          const mapv = require("mapv"), storeList = []
          markers.map(item => {
            storeList.push({
              geometry: {
                type: 'Point',
                coordinates: [item.lng, item.lat]	//经纬度，用于标点
              },
              icon: item.icon,
              tag: item
            })
          })
          let dataSet = new mapv.DataSet(storeList)
          let dataOptions = {
            deg: 0,
            draw: 'icon',
            methods: {
              click: (res) => {
                if (res && res.tag) that.setShopInfo(res.tag)
              }
            },
            size: 30,
            width: 30,
            height: 30
          }

          that.mapvLayer = new mapv.baiduMapLayer(that.map_obj, dataSet, dataOptions)
          that.mapvLayer.show()
        }
      }, 500)
    },

    /**
     * 移动地图
     * @param {Object} e
     */
    handlerMoveend(e) {
      const { lng, lat } = e.target.getCenter()
      this.center.lng = lng
      this.center.lat = lat
      this.zoom = this.zooms
      this.update()
    },

    /**
     * 选择搜索列表
     * @param {Object} pois
     */
    infohtmlset(pois) {
      this.center.lng = pois.point.lng
      this.center.lat = pois.point.lat
      this.zoom = this.zooms
      this.showPanel = false
      this.update()
    },

    /**
     * 向父组件更新
     */
    update() {
      this.center.keyword = this.keyword
      clearTimeout(this.iTime)
      this.iTime = setTimeout(() => {
        let pt = new this.BMap.Point(this.center.lng, this.center.lat)
        this.geocoder.getLocation(pt, res => {
          this.center.address = res.address
          if (res.surroundingPois.length > 0) {
            this.center.address = res.surroundingPois[0].title
          }
          this.$emit('locationOk', this.center)
        })
      }, 500)
    },

    /**
     * 向父组件传输点击店铺信息
     */
    setShopInfo(info) {
      this.$emit('setShopInfo', info)
    },

    mapClick(e) {
      console.log(e.point)
      if (!e.overlay) {
        this.$emit('setShopInfo', {})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bm-view {
  position: relative;
  min-width: 300px;
  width: 100%;

  /*
    去除百度地图版权
    去除右上角[地图、卫星、三维]控件
    去除百度地图右上角平移缩放控件的市县区文字
    */
  >>>.anchorBL,
  >>>.anchorTR,
  >>>.BMap_zlHolder,
  /*隐藏因为播放街景失败的"您未安装Flash Player播放器或者版本过低"提示图层导致无法继续点击地图*/
  >>>[id^=PanoramaFlashWraperTANGRAM] {
    display: none;
    visibility: hidden;
  }
}

.map-icon {
  position: absolute;
  z-index: 99;
  left: 50%;
  top: 50%;
  margin-left: -9px;
  margin-top: -26px;
  width: 40px;
}

.search-list {
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
}</style>
