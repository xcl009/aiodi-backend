<template>
  <div class="p-10">
    <el-row class="pt-30 pl-30 pr-30 bg-white">
      <el-col>
        <el-form ref="form" :model="form" label-width="140px">
          <el-form-item label="上级：">
            <el-cascader
              :options="options"
              :props="{ checkStrictly: true }"
              clearable></el-cascader>
          </el-form-item>
          <el-form-item label="页面标题：">
            <el-input v-model="form.title" placeholder="页面标题:如订单管理" />
          </el-form-item>
          <el-form-item label="图标：">
            <el-input v-model="form.icon" placeholder="左侧图标" />
          </el-form-item>
          <el-form-item label="url地址：">
            <el-input v-model="form.path" placeholder="页面标题:如home" />
          </el-form-item>
          <el-form-item label="组件地址：">
            <el-input v-model="form.file_path" placeholder="页面标题:如/home/home" />
          </el-form-item>
          <el-form-item label="props参数：">
            <el-input v-model="form.props" placeholder="页面标题:如{user_type: 1}" />
          </el-form-item>
          <el-form-item label="状态：">
            <el-radio-group v-model="form.status">
              <el-radio-button label="1">有效</el-radio-button>
              <el-radio-button label="0">无效</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="显示：">
            <el-radio-group v-model="form.hidden">
              <el-radio-button :label="false">显示</el-radio-button>
              <el-radio-button :label="true">不显示</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import upload from '@/components/upload/two'
  export default {
    components: {
      upload
    },
    data() {
      return {
        options: [{
          value: 'zhinan',
          label: '指南',
          children: [{
            value: 'shejiyuanze',
            label: '设计原则',
            children: [{
              value: 'yizhi',
              label: '一致'
            }, {
              value: 'fankui',
              label: '反馈'
            }, {
              value: 'xiaolv',
              label: '效率'
            }, {
              value: 'kekong',
              label: '可控'
            }]
          }, {
            value: 'daohang',
            label: '导航',
            children: [{
              value: 'cexiangdaohang',
              label: '侧向导航'
            }, {
              value: 'dingbudaohang',
              label: '顶部导航'
            }]
          }]
        }, {
          value: 'zujian',
          label: '组件',
          children: [{
            value: 'basic',
            label: 'Basic',
            children: [{
              value: 'layout',
              label: 'Layout 布局'
            }, {
              value: 'color',
              label: 'Color 色彩'
            }, {
              value: 'typography',
              label: 'Typography 字体'
            }, {
              value: 'icon',
              label: 'Icon 图标'
            }, {
              value: 'button',
              label: 'Button 按钮'
            }]
          }, {
            value: 'form',
            label: 'Form',
            children: [{
              value: 'radio',
              label: 'Radio 单选框'
            }, {
              value: 'checkbox',
              label: 'Checkbox 多选框'
            }, {
              value: 'input',
              label: 'Input 输入框'
            }, {
              value: 'input-number',
              label: 'InputNumber 计数器'
            }, {
              value: 'select',
              label: 'Select 选择器'
            }, {
              value: 'cascader',
              label: 'Cascader 级联选择器'
            }, {
              value: 'switch',
              label: 'Switch 开关'
            }, {
              value: 'slider',
              label: 'Slider 滑块'
            }, {
              value: 'time-picker',
              label: 'TimePicker 时间选择器'
            }, {
              value: 'date-picker',
              label: 'DatePicker 日期选择器'
            }, {
              value: 'datetime-picker',
              label: 'DateTimePicker 日期时间选择器'
            }, {
              value: 'upload',
              label: 'Upload 上传'
            }, {
              value: 'rate',
              label: 'Rate 评分'
            }, {
              value: 'form',
              label: 'Form 表单'
            }]
          }, {
            value: 'data',
            label: 'Data',
            children: [{
              value: 'table',
              label: 'Table 表格'
            }, {
              value: 'tag',
              label: 'Tag 标签'
            }, {
              value: 'progress',
              label: 'Progress 进度条'
            }, {
              value: 'tree',
              label: 'Tree 树形控件'
            }, {
              value: 'pagination',
              label: 'Pagination 分页'
            }, {
              value: 'badge',
              label: 'Badge 标记'
            }]
          }, {
            value: 'notice',
            label: 'Notice',
            children: [{
              value: 'alert',
              label: 'Alert 警告'
            }, {
              value: 'loading',
              label: 'Loading 加载'
            }, {
              value: 'message',
              label: 'Message 消息提示'
            }, {
              value: 'message-box',
              label: 'MessageBox 弹框'
            }, {
              value: 'notification',
              label: 'Notification 通知'
            }]
          }, {
            value: 'navigation',
            label: 'Navigation',
            children: [{
              value: 'menu',
              label: 'NavMenu 导航菜单'
            }, {
              value: 'tabs',
              label: 'Tabs 标签页'
            }, {
              value: 'breadcrumb',
              label: 'Breadcrumb 面包屑'
            }, {
              value: 'dropdown',
              label: 'Dropdown 下拉菜单'
            }, {
              value: 'steps',
              label: 'Steps 步骤条'
            }]
          }, {
            value: 'others',
            label: 'Others',
            children: [{
              value: 'dialog',
              label: 'Dialog 对话框'
            }, {
              value: 'tooltip',
              label: 'Tooltip 文字提示'
            }, {
              value: 'popover',
              label: 'Popover 弹出框'
            }, {
              value: 'card',
              label: 'Card 卡片'
            }, {
              value: 'carousel',
              label: 'Carousel 走马灯'
            }, {
              value: 'collapse',
              label: 'Collapse 折叠面板'
            }]
          }]
        }, {
          value: 'ziyuan',
          label: '资源',
          children: [{
            value: 'axure',
            label: 'Axure Components'
          }, {
            value: 'sketch',
            label: 'Sketch Templates'
          }, {
            value: 'jiaohu',
            label: '组件交互文档'
          }]
        }],
        form: {
          open: 0
        },
        id: this.$route.query.id,
      }
    },
    mounted() {

    },
    methods: {
      /**
       * 获取公司
       */
      getFactory(){
        this.$get('/SyFactory/getList', { limit: 100 }).then(res => {
          res.list.map(item => {
            this.factoryList.push({
              factory_id: item.factory_id,
              factory_name: item.factory_name,
              support_device_type: item.support_device_type
            })
          })
        })
      },

      /**
       * 点击提交
       */
      onSubmit() {
        let params = JSON.parse(JSON.stringify(this.form))
        this.$post('/QRcode/getCodeSnByUnified', params).then(res => {
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
