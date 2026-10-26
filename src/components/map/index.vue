<template>
  <div class="map">
    <div class="mb-10 mapLeftStyle" v-if="isEdit">
      <el-input v-model="keyword" :disabled="!placesReady" :placeholder="$t('components.inputText')" @input="changeAddress"></el-input>
      <div class="card" v-if="list.length > 0 && cardShow">
        <div class="item" v-for="item in list" :key="item.placeId">
          <div @click="confirm(item)">
            <div class="title">{{ item.mainText }}</div>
            <div class="address">
              {{ item.secondaryText }}
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
  export default {
    props: {
      center: {
        type: Object,
        default: () => {
          return {
            // Stadhoudersmolenweg 62, 7317 AW Apeldoorn, The Netherlands
            lng: 5.97025183,
            lat: 52.24274424
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
        cardShow: false,
        placesReady: false
      }
    },
    created() {
      this.placesApi = null
      this.geocoder = null
      this.autocompleteSessionToken = null
      this.searchRequestId = 0
      this.geocodeRequestId = 0
    },
    mounted() {
      this.init()
    },
    beforeDestroy() {
      this.searchRequestId++
      this.geocodeRequestId++
      clearTimeout(this.searchTimer)
      clearTimeout(this.iTime)
      if (this.mapCenterListener) this.mapCenterListener.remove()
      this.autocompleteSessionToken = null
    },
    methods: {
      init() {
        if (!this.$googleMapsApiKey) {
          this.$emit('locationOk', this.center)
          this.$message.error(this.$t('public.fail'))
          return
        }
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
        this.mapLanguage = language
        this.$nextTick(() => {
          try{
            const loader = new Loader({
              apiKey: this.$googleMapsApiKey,
              version: "weekly", //版本
              libraries: ["places"],
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
              .then(async(google) => {
                const placesApi = await google.maps.importLibrary('places')
                if (this._isDestroyed) return
                const map = new google.maps.Map(
                  document.getElementById(this.mapID),
                  mapOptions
                )
                this.googleMap = map
                this.googleApi = google
                this.placesApi = placesApi
                this.placesReady = true
                // 对请求进行地理编码 参考文档：https://developers.google.com/maps/documentation/javascript/reference/geocoder?hl=en
                this.geocoder = new google.maps.Geocoder()
                // marker = new google.maps.Marker({
                //   map: map,
                //   position: {},
                //   draggable: true,
                // })
                this.mapCenterListener = google.maps.event.addListener(map, 'center_changed', () => {
                  this.center.lng = map.getCenter().lng()
                  this.center.lat = map.getCenter().lat()
                  this.update()
                })
                this.update()
              })
              .catch((e) => {
                if (this._isDestroyed) return
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
      update(address) {
        const requestId = ++this.geocodeRequestId
        this.center.keyword = this.keyword
        clearTimeout(this.iTime)
        if (address) {
          this.center.address = address
          this.$emit('locationOk', this.center)
          return
        }
        const location = { lng: this.center.lng, lat: this.center.lat }
        this.iTime = setTimeout(() => {
          this.geocoder.geocode({
            location,
          }, (results, status) => {
            if (requestId !== this.geocodeRequestId || this._isDestroyed) return
            if (status === 'OK' && results && results.length > 0) {
              this.center.address = results[0].formatted_address
            }
            this.$emit('locationOk', this.center)
          })

        }, 500)
      },

      /**
       * 搜索地点和检索地点详细信息
       * @param {Object} item
       */
      async confirm(item) {
        const requestId = ++this.searchRequestId
        clearTimeout(this.searchTimer)
        this.cardShow = false
        this.list = []
        this.autocompleteSessionToken = null
        try {
          const place = item.prediction.toPlace()
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location']
          })
          if (requestId !== this.searchRequestId || this._isDestroyed) return
          if (!place.location) throw new Error('Selected place has no coordinates')
          this.keyword = place.displayName || item.mainText
          this.center.lng = place.location.lng()
          this.center.lat = place.location.lat()
          this.googleMap.setCenter(place.location)
          this.update(place.formattedAddress)
        } catch (error) {
          if (requestId !== this.searchRequestId || this._isDestroyed) return
          console.error('Google Places details failed', error)
          this.$message.error(this.$t('public.fail'))
        }
      },

      changeAddress(value) {
        const requestId = ++this.searchRequestId
        const input = value.trim()
        clearTimeout(this.searchTimer)
        this.list = []
        this.cardShow = false
        if (!input || !this.placesApi) {
          this.autocompleteSessionToken = null
          return
        }
        if (!this.autocompleteSessionToken) {
          this.autocompleteSessionToken = new this.placesApi.AutocompleteSessionToken()
        }
        const sessionToken = this.autocompleteSessionToken
        this.searchTimer = setTimeout(async() => {
          try {
            const { suggestions } = await this.placesApi.AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input,
              sessionToken,
              language: this.mapLanguage || undefined
            })
            if (requestId !== this.searchRequestId || this._isDestroyed) return
            this.list = suggestions
              .filter(suggestion => suggestion.placePrediction)
              .map(({ placePrediction }) => ({
                placeId: placePrediction.placeId,
                mainText: placePrediction.mainText ? placePrediction.mainText.text : placePrediction.text.text,
                secondaryText: placePrediction.secondaryText ? placePrediction.secondaryText.text : '',
                prediction: placePrediction
              }))
            this.cardShow = this.list.length > 0
          } catch (error) {
            if (requestId !== this.searchRequestId || this._isDestroyed) return
            console.error('Google Places autocomplete failed', error)
            this.$message.error(this.$t('public.fail'))
          }
        }, 250)
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
