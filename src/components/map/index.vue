<template>
  <div class="map">
    <div class="mb-10 mapLeftStyle" v-if="isEdit">
      <el-input v-model="keyword" :placeholder="$t('components.inputText')" @input="changeAddress"></el-input>
      <div class="card" v-if="list.length > 0 && cardShow">
        <div class="item" v-for="(item, index) in list" :key="index">
          <div @click="confirm(item)">
            <div class="title">{{ item.structured_formatting.main_text }}</div>
            <div class="address">
              {{ item.structured_formatting.secondary_text }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mapStyle">
      <div :style="googleMapStyle" class="googleMap" :id="mapID"></div>
      <img v-if="isEdit" class="map-icon" src="@/assets/marker_red_sprite.png" alt="">
    </div>
  </div>
</template>
<script>
  import {
    Loader
  } from "@googlemaps/js-api-loader"; //引入
  // 输入框模糊查询
  let searchBox = undefined;
  // 搜索地点和检索地点详细信息
  let service = undefined;
  // 对请求进行地理编码
  let geocoder = undefined;
  let marker = undefined;
  export default {
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

      zooms: {
        type: Number,
        default: 14
      },

      isEdit: {
        type: Boolean,
        default: true
      },

      //地图id
      mapID: {
        type: String,
        default: () => {
          return "googleMap"
        },
      },

      //谷歌地图样式
      googleMapStyle: {
        type: Object,
        default: () => {
          return {
            wdith: "100%",
            height: "300px",
          };
        },
      },

      //谷歌地图配置
      mapOptions: {
        type: Object,
        default: () => {
          return {
            //为了关闭默认控件集,设置地图的disableDefaultUI的属性为true
            disableDefaultUI: false,
            // 启用缩放和平移
            gestureHandling: "greedy",
            panControl: true,
            zoomControl: true,
            scaleControl: true,
            //关闭街景
            streetViewControl: false,
          };
        },
      },

      //谷歌地图图形path
      mapPath: {
        type: String,
        default: () => {
          return "";
        },
      },
    },
    data() {
      return {
        apiKey: "AIzaSyB_ZeNcO-7lC3bHJIGbIN7NYd_kLnv4iUs",
        map: {},
        keyword: "",
        googleMapCenter: {
          lng: "",
          lat: "",
        },
        //标记点
        marker: [],
        //图形实例
        graphicalExample: null,
        //图形路径经纬度
        graphicalPath: [],
        // 模糊匹配数据
        list: [],
        cardShow: false
      }
    },
    mounted() {
      this.init()
    },
    methods: {
      init() {
        let lang =  localStorage.getItem('lang');
        let language = '';
        if(lang == 'zh_CN'){
          language = 'zh-CN'
        }else if(lang == 'zh_HK'){
           language = 'zh-TW'
        }else if(lang == 'en_US'){
           language = 'en'
        }else if(lang == 'vi_VN'){
           language = 'vi'
        }else if(lang == 'ru_RU'){
           language = 'ru'
        }else if(lang == 'ko_KR'){
           language = 'ko'
        }else if(lang == 'en_PH'){
           language = 'fil'
        }else if(lang == 'ja_JP'){
           language = 'ja'
        }else if(lang == 'es_ES'){
           language = 'es'
        }else if(lang == 'pt-PT'){
           language = 'pt-BR'
        }else if(lang == 'de-DE'){
           language = 'de'
        }else if(lang == 'th_TH'){
           language = 'th'
        }else if(lang == 'km_MM'){
           language = 'en'
        }
        console.log(lang,'lang')
        this.$nextTick(() => {
          try{
            const loader = new Loader({
              apiKey: this.apiKey, //之前的key
              version: "weekly", //版本
              libraries: ["places", "drawing"], //插件库places为基础库 drawing为绘制工具库
              region: "Canada",
              language: language,
            })

            const mapOptions = {
              center: this.center, //中心点
              zoom: this.zooms, //缩放级别
              ...this.mapOptions, //其他配置
            }

            loader
              .load()
              .then((google) => {
                const map = new google.maps.Map(
                  document.getElementById(this.mapID),
                  mapOptions
                )
                this.googleMap = map
                this.googleApi = google
                // 自动完成请求 参考文档：https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service?hl=en
                searchBox = new google.maps.places.AutocompleteService()
                // 搜索地点和检索地点详细信息 参考文档：https://developers.google.com/maps/documentation/javascript/reference/places-service?hl=en
                service = new google.maps.places.PlacesService(map)
                // 对请求进行地理编码 参考文档：https://developers.google.com/maps/documentation/javascript/reference/geocoder?hl=en
                geocoder = new google.maps.Geocoder()
                // marker = new google.maps.Marker({
                //   map: map,
                //   position: {},
                //   draggable: true,
                // })
                google.maps.event.addListener(map, 'center_changed', () => {
                  this.center.lng = map.getCenter().lng()
                  this.center.lat = map.getCenter().lat()
                  this.update()
                })
                this.update()
              })
              .catch((e) => {
                this.$emit('locationOk', this.center)
                console.log(e);
              })
            }catch(e){
              this.$emit('locationOk', this.center)
            }
        })
      },

      /**
       * 向父组件更新
       */
      update() {
        this.center.keyword = this.keyword
        clearTimeout(this.iTime)
        this.iTime = setTimeout(() => {
          geocoder.geocode({
            location: this.center,
          }, (results, status) => {
            if (results && results.length > 0) {
              this.center.address = results[0].formatted_address
            }
            this.$emit('locationOk', this.center)
          })

        }, 500)
      },

      /**
       * 搜索地点和检索地点详细信息
       * @param {Object} e
       */
      confirm(e) {
        service.getDetails({
          placeId: e.place_id
        }, (event, status) => {
          if (status === "OK") {
            this.keyword = event.name
            this.cardShow = false
            let str = event.name
            geocoder.geocode({
              address: str
            }, (results, status) => {
              this.googleMap.setCenter(results[0].geometry.location)
            })
          } else {}
        })
      },

      changeAddress(e) {
        searchBox.getPlacePredictions({
          input: e
        }, (event, status) => {
          if (status === "OK") {
            this.list = event || []
            this.list = this.list.filter((x) => x.place_id)
            this.cardShow = true
          } else {
            this.list = []
          }
        })
      },
    },
  };
</script>
<style lang="scss" scoped>
  .map {
    .mapLeftStyle {
      position: relative;
      background: #ffffff;

      .controls {
        padding: 0 30px;
        height: 50px;
      }

      .card {
        position: absolute;
        left: 0;
        top: 40px;
        width: 100%;
        box-shadow: 0 0 8px rgba(0, 0, 0, .4);
        z-index: 999;
        background: #fff;

        .item {
          cursor: pointer;
          padding: 8px;
          border-bottom: 1px solid #ebebeb;

          .title {
            font-size: 16px;
            font-weight: 400;
            line-height: 26px;
          }

          .address {
            font-size: 14px;
            font-family: Hei;
            font-weight: 400;
            color: #9f9f9f;
            line-height: 26px;
          }
        }
      }
    }

    .mapStyle {
      position: relative;
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
  }
</style>
