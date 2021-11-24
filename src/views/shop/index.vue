<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:tabs>
        <el-tabs class="bg-white" v-model="listQuery.search_depend_type" @tab-click="toQuery()">
          <el-tab-pane label="全部设备" :name="'-1'" />
          <el-tab-pane :label="index" :name="''+item+''" v-for="(item, index) in deviceNameObj"/>
        </el-tabs>
      </template>
      <template v-slot:defult>
        <el-form-item label="商户归属:" v-if="user_type == 2">
          <el-select v-model="form.search_user_type" @change="toQuery()">
            <el-option label="本人" :value="0" />
            <el-option label="下级" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序方式:">
          <el-select v-model="form.sort_type" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in sort_type" />
          </el-select>
          <el-date-picker
            v-if="[7,8].indexOf(form.sort_type) > -1"
            v-model="form.query_month"
            type="month"
            value-format="yyyy-M"
            placeholder="选择月份"
            @change="toQuery()">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="数据筛选:">
          <el-select v-model="form.query_rate_date_type" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in rate_date" />
          </el-select>
          <el-select v-model="form.query_rate_number_type" @change="toQuery()">
            <el-option :label="item" :value="key" v-for="(item, key) in rate_number" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否铺货:" class="hidden-sm-and-down">
          <el-select v-model="form.is_distributed" @change="toQuery()">
            <el-option label="全部" value="2" />
            <el-option label="未铺货" value="0" />
            <el-option label="已铺货" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名称:" class="hidden-md-and-down">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-lg-and-down">
          <el-input v-model="form.search_phone" />
        </el-form-item>
        <template v-if="user_type != 2">
          <el-form-item label="代理ID:" class="hidden-xl-and-down" v-if="user_type == 1" >
            <el-input v-model="form.son_id" />
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" native-type="submit" :disabled="clickSubmit">查询<i class="el-icon-search el-icon--right"/></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="danger" @click="unbindAgent()" :disabled="selID.length == 0" v-if="son_type > 0">立即回收</el-button>
          <el-button type="danger" @click="bindAgent()" :disabled="selID.length == 0" v-else-if="son_uid > 0">立即分配</el-button>
          <el-button type="primary" plain @click="outTable()" v-else>导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
      <template v-slot:more>
        <sel-plat v-if="checkRoles(['terminal'])" :list-query="listQuery" @change="toQuery()"/>
        <el-form-item label="是否铺货:" class="hidden-md-and-up">
          <el-select v-model="form.is_distributed" @change="toQuery()">
            <el-option label="全部" value="2" />
            <el-option label="未铺货" value="0" />
            <el-option label="已铺货" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名称:" class="hidden-lg-and-up">
          <el-input v-model="form.search_store_name" />
        </el-form-item>
        <el-form-item label="手机号码:" class="hidden-xg-and-up">
          <el-input v-model="form.search_phone" />
        </el-form-item>
        <el-form-item v-if="user_type == 1" label="代理ID:" class="hidden-xg-and-up">
          <el-input v-model="form.son_id" />
        </el-form-item>
        <el-form-item label="创建时间:">
          <div class="flex">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="开始"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="beginOptions"
            />
            <span class="ml-5 mr-5">-</span>
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="结束"
              value-format="timestamp"
              style="width: 100%;"
              :picker-options="endOptions"
            />
          </div>
        </el-form-item>
        <el-form-item label="行业分类:">
          <el-cascader v-model="sel_cat" :options="categoryList" :props="{ expandTrigger: 'hover' }" @change="toQuery()"/>
        </el-form-item>
        <el-form-item label="所在地区:">
          <el-cascader v-model="search_regions_tag" :options="areaList" :show-all-levels="false" :props="{ expandTrigger: 'hover', checkStrictly: true }" @change="toQuery()"/>
        </el-form-item>
      </template>
    </drawer>
    <div class="p-5">
      <el-tabs v-if="user_type == 1" v-model="listQuery.search_agent_level" class="mb-0 bg-white" type="card" @tab-click="typeClick">
        <el-tab-pane v-for="itme in give_role" :label="itme.role_name" :name="''+itme.role_id" />
      </el-tabs>
      <div class="bg-white">
        <el-table
          v-if="outStatus"
          id="out_table"
          ref="out_table"
          element-loading-text="Loading"
          v-loading="listLoading"
          :data="list"
        >
          <el-table-column label="品牌商" v-if="checkRoles(['terminal'])">
            <template slot-scope="scope">
              {{ oemInfo[scope.row.aid] ? oemInfo[scope.row.aid].mini_name : '' }}
            </template>
          </el-table-column>
          <el-table-column label="商户ID">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column label="商户名称" width="200">
            <template slot-scope="scope">
              {{ scope.row.store_name }}
            </template>
          </el-table-column>
          <el-table-column label="商户地址" width="120">
            <template slot-scope="scope">
              {{ scope.row.address }}
            </template>
          </el-table-column>
          <el-table-column label="交易额" width="120">
            <template slot-scope="scope">
              {{ scope.row.order_amount }}
            </template>
          </el-table-column>
          <el-table-column label="总收益" width="120">
            <template slot-scope="scope">
              {{ scope.row.profit }}
            </template>
          </el-table-column>
          <el-table-column label="可提现" width="120">
            <template slot-scope="scope">
              {{ scope.row.available_withdraw_money }}
            </template>
          </el-table-column>
          <el-table-column label="订单量" width="120" v-if="agentInfo.check_order == 1">
            <template slot-scope="scope">
              {{ scope.row.order_num }}
            </template>
          </el-table-column>
          <el-table-column label="设备数" width="120">
            <template slot-scope="scope">
              {{ scope.row.goods_sum }}
            </template>
          </el-table-column>
          <el-table-column label="昨日使用率(%)">
            <template slot-scope="scope">
              {{ scope.row.last_day_order_use_rate }}
            </template>
          </el-table-column>
          <el-table-column label="近三天使用率(%)">
            <template slot-scope="scope">
              {{ scope.row.last_3_day_order_use_rate }}
            </template>
          </el-table-column>
          <el-table-column label="近七天使用率(%)">
            <template slot-scope="scope">
              {{ scope.row.last_7_day_order_use_rate }}
            </template>
          </el-table-column>
          <el-table-column label="上周使用率(%)">
            <template slot-scope="scope">
              {{ scope.row.last_week_order_use_rate }}
            </template>
          </el-table-column>
          <el-table-column label="本月使用率(%)">
            <template slot-scope="scope">
              {{ scope.row.this_month_order_use_rate }}
            </template>
          </el-table-column>
          <el-table-column label="上月使用率(%)">
            <template slot-scope="scope">
              {{ scope.row.last_month_order_use_rate }}
            </template>
          </el-table-column>
          <el-table-column label="昨日客单价(元)">
            <template slot-scope="scope">
              {{ scope.row.last_day_order_price }}
            </template>
          </el-table-column>
          <el-table-column label="近三天客单价(元)">
            <template slot-scope="scope">
              {{ scope.row.last_3_day_order_price }}
            </template>
          </el-table-column>
          <el-table-column label="近七天客单价(元)">
            <template slot-scope="scope">
              {{ scope.row.last_7_day_order_price }}
            </template>
          </el-table-column>
          <el-table-column label="上周客单价(元)">
            <template slot-scope="scope">
              {{ scope.row.last_week_order_price }}
            </template>
          </el-table-column>
          <el-table-column label="本月客单价(元)">
            <template slot-scope="scope">
              {{ scope.row.this_month_order_price }}
            </template>
          </el-table-column>
          <el-table-column label="上月客单价(元)">
            <template slot-scope="scope">
              {{ scope.row.last_month_order_price }}
            </template>
          </el-table-column>
          <el-table-column label="上级代理" width="115">
            <template slot-scope="scope">
              {{ scope.row.agent_name || "--" }}<br>
              {{ scope.row.agent_phone }}
            </template>
          </el-table-column>
          <el-table-column label="分润人" width="115">
            <template slot-scope="scope">
              {{ scope.row.name }}<br>
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column label="分成方式" width="200">
            <template slot-scope="scope">
              <div class="fs-s3" v-if="scope.row.divide_type_1 > 0">{{ scope.row.divide_type_1 == 1 ? '不分成' : '入场费' }}</div>
              <div class="fs-s3" v-else>
                <template v-for="(item, index) in scope.row.percent_info">
                  <div>
                    {{ deviceKeyObj[index] }}:{{ showPercent(item, config.goods_key[index]) }}
                  </div>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="城市区域">
            <template slot-scope="scope">
              {{ scope.row.region_tag && areaObj[scope.row.region_tag] ? areaObj[scope.row.region_tag].title : '--' }}
            </template>
          </el-table-column>
          <el-table-column label="行业分类">
            <template slot-scope="scope">
              {{ scope.row.cat_name }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="设备">
            <template slot-scope="scope">
              {{ scope.row.depend_type_name }}
            </template>
          </el-table-column> -->
          <el-table-column label="创建时间">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
        </el-table>

        <el-table
          v-else
          class="ptd-5"
          id="list_table"
          ref="list_table"
          stripe
          highlight-current-row
          element-loading-text="Loading"
          v-loading="listLoading"
          :max-height="tableMaxH"
          :data="list"
          @selection-change="selStore"
        >
          <el-table-column type="selection" v-if="son_uid > 0" width="50" />
          <el-table-column label="品牌商" v-if="checkRoles(['terminal'])">
            <template slot-scope="scope">
              {{ oemInfo[scope.row.aid] ? oemInfo[scope.row.aid].mini_name : '' }}
            </template>
          </el-table-column>
          <el-table-column label="门头照" width="80" v-if="checkThead.indexOf('门头照') > -1">
            <template slot-scope="scope">
              <el-avatar shape="square" :size="60" :src="scope.row.avatar" fit="fill" icon="el-icon-picture-outline"></el-avatar>
              <div class="dnone">【用户ID：{{ scope.row.aid }}】</div>
            </template>
          </el-table-column>
          <el-table-column label="商户名称" width="200" v-if="checkThead.indexOf('商户名称') > -1">
            <template slot-scope="scope">
              <el-link @click="$router.push({path: `/shop/detail/${scope.row.id}`})" class="cursor">【{{ scope.row.id }}】{{ scope.row.store_name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="商户地址" width="120" v-if="checkThead.indexOf('商户地址') > -1">
            <template slot-scope="scope">
              <div class="text-cut_two">{{ scope.row.address }}</div>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="160" v-if="agentInfo.business_type != 1">
            <template slot-scope="scope">
              <div>交易额：￥{{ scope.row.order_amount }}</div>
              <div>总收益：<span class="text-blue cursor" @click="$router.push({path: `/home/income?son_id=${scope.row.aid}`})">￥{{ scope.row.profit }}</span><!-- <span class="ml-5 cursor text-gray" v-if="checkRoles(['partner'])" @click="$refs.editwiths.showDialog(scope.row)">修改</span> --></div>
              <div>可提现：<a v-if="checkRoles(['partner'])" class="text-blue cursor" @click="$refs.editwith.showDialog(scope.row)">￥{{ scope.row.available_withdraw_money }}</a><a v-else>￥{{ scope.row.available_withdraw_money }}</a></div>
            </template>
          </el-table-column>
          <el-table-column label="订单量" width="140" v-if="checkThead.indexOf('订单量') > -1">
            <template slot-scope="scope">
              <div>订单量：<a class="text-blue" @click="$router.push({path: `${scope.row.agent_id == agentInfo.id ? '/order/meOrder' : '/order/subOrder'}?store_name=${scope.row.store_name}`})" v-if="agentInfo.check_order == 1">{{ scope.row.order_num }}</a><a v-else>{{ scope.row.order_num }}</a></div>
              <div>设备数：<el-link type="primary" @click="$router.push({path: `${scope.row.agent_id == agentInfo.id ? '/equipment/index' : '/equipment/subEquipment'}?store_name=${scope.row.store_name}`})">{{ scope.row.goods_sum }}</el-link></div>
            </template>
          </el-table-column>
          <el-table-column label="使用率(%)" width="240" v-if="checkThead.indexOf('使用率') > -1">
            <template slot-scope="scope">
              <div class="flex">
                <div class="flex1">
                  <div>昨日：{{ scope.row.last_day_order_use_rate }}</div>
                  <div>近三天：{{ scope.row.last_3_day_order_use_rate }}</div>
                  <div>近七天：{{ scope.row.last_7_day_order_use_rate }}</div>
                </div>
                <div class="flex1">
                  <div>上周：{{ scope.row.last_week_order_use_rate }}</div>
                  <div>本月：{{ scope.row.this_month_order_use_rate }}</div>
                  <div>上月：{{ scope.row.last_month_order_use_rate }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="客单价(元)" width="220" v-if="checkThead.indexOf('客单价') > -1">
            <template slot-scope="scope">
              <div class="flex">
                <div class="flex1">
                  <div>昨日：{{ scope.row.last_day_order_price }}</div>
                  <div>近三天：{{ scope.row.last_3_day_order_price }}</div>
                  <div>近七天：{{ scope.row.last_7_day_order_price }}</div>
                </div>
                <div class="flex1">
                  <div>上周：{{ scope.row.last_week_order_price }}</div>
                  <div>本月：{{ scope.row.this_month_order_price }}</div>
                  <div>上月：{{ scope.row.last_month_order_price }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上级代理" width="115" v-if="checkThead.indexOf('上级代理') > -1">
            <template slot-scope="scope">
              {{ scope.row.agent_name || "--" }}<br>
              {{ scope.row.agent_phone }}
            </template>
          </el-table-column>
          <el-table-column label="分润人" width="115" v-if="checkThead.indexOf('分润人') > -1">
            <template slot-scope="scope">
              {{ scope.row.name }}<br>
              {{ scope.row.phone }}
            </template>
          </el-table-column>
          <el-table-column label="分成方式" width="200" v-if="checkThead.indexOf('分成方式') > -1">
            <template slot-scope="scope">
              <div class="fs-s3" v-if="scope.row.divide_type_1 > 0">{{ scope.row.divide_type_1 == 1 ? '不分成' : '入场费' }}</div>
              <div class="fs-s3" v-else>
                <template v-for="(item, index) in scope.row.percent_info">
                  <div>
                    {{ deviceKeyObj[index] }}:{{ showPercent(item, config.goods_key[index]) }}
                  </div>
                  <!-- <div v-if="index == 7">
                    {{ deviceKeyObj[index] }}商品:{{ showPercent(item, config.goods_key[index] + '_product') }}
                  </div> -->
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="城市区域" v-if="checkThead.indexOf('城市区域') > -1">
            <template slot-scope="scope">
              {{ scope.row.region_tag && areaObj[scope.row.region_tag] ? areaObj[scope.row.region_tag].title : '--' }}
            </template>
          </el-table-column>
          <el-table-column label="行业分类" v-if="checkThead.indexOf('行业分类') > -1">
            <template slot-scope="scope">
              {{ scope.row.cat_name }}
            </template>
          </el-table-column>
          <el-table-column label="设备" v-if="checkThead.indexOf('设备') > -1">
            <template slot-scope="scope">
              {{ scope.row.depend_type_name }}
            </template>
          </el-table-column>
          <el-table-column label="提现控制" v-if="checkThead.indexOf('提现控制') > -1">
            <template slot-scope="scope">
              <div class="cursor" @click="
                  storeSetDialog = true;
                  rowObj = scope.row;
                  shopObj = {
                    thread_cost_price: scope.row.thread_cost_price,
                    cost_controll_switch: scope.row.cost_controll_switch,
                    dialogTitle: '设备成本·商户提现控制',
                    store_id: scope.row.id,
                    type: 3
                  }
                ">
                {{ scope.row.cost_controll_switch ? '已开启' : '未开启'}}
                ￥{{ scope.row.thread_cost_price }}
              </div>

            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="100" v-if="checkThead.indexOf('创建时间') > -1">
            <template slot-scope="scope">
              {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column width="270" :fixed="device == 'desktop' ? 'right' : false">
            <template slot="header" slot-scope="scope">
              <div class="flex">
                <div class="flex1">操作</div>
                <div class="cursor" @click="
                  storeSetDialog = true;
                  shopObj = {
                    dialogTitle: '表头设置',
                    type: 6
                  }
                ">表头设置</div>
              </div>
            </template>
            <template slot-scope="scope">
              <template v-if="zuo_sn">
                <el-button type="danger" size="mini" round @click="distribu(scope.row)">铺货</el-button>
              </template>
              <template v-else-if="son_type > 0">
                <el-button type="danger" size="mini" round @click="unbindAgent(scope.row, scope.$index)">立即回收</el-button>
              </template>
              <template v-else-if="son_uid > 0">
                <el-button type="danger" size="mini" round @click="bindAgent(scope.row)">立即分配</el-button>
              </template>
              <template v-else>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="deviceBindDialog = true; select_aid = scope.row.aid">设备绑定</el-button>
                <!-- <el-button type="primary" size="mini" round plain class="ml-0" @click="getDetail(scope.row.id, 1)">首单免费</el-button> -->
                <el-button type="primary" size="mini" round plain class="ml-0" @click="toEdit({aid: scope.row.aid, type: 8})">提现更新</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/shop/setvip?store_id=${scope.row.id}`})">免费店员</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="toEdit({row: scope.row, type: 6 })">营业时间</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/shop/billing/${scope.row.id}`})">会员设置</el-button>
                <!-- <el-button :type="scope.row.advance_buletooth == 1 ? 'danger' : 'primary'" size="mini" round plain class="ml-0" @click="setbuletooth(scope.row)">先连蓝牙</el-button> -->
                <el-button type="primary" size="mini" round plain class="ml-0" @click="getSetRecord(scope.row.aid)">操作记录</el-button>
                <el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/shop/edit/${scope.row.id}?user_type=${user_type}`})" v-if="!checkRoles(['terminal'])">编辑商户</el-button>
                <el-button type="danger" size="mini" round plain class="ml-0" @click="toEdit({id: scope.row.id, type: 4, index: scope.$index})">删除商户</el-button>
                <el-dropdown trigger="click">
                  <el-button type="primary" size="mini" round plain>更多设置</el-button>
                  <el-dropdown-menu slot="dropdown">
                     <el-dropdown-item @click.native="$router.push({path: `/shop/dayStat/${scope.row.id}`})" v-if="agentInfo.business_type != 1">数据统计</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/shop/steal/${scope.row.id}`})" v-if="agentInfo.steal_order_right == 1 || scope.row.steal_order_switch == 1">{{ (scope.row.steal_order_right == 1 || scope.row.steal_order_switch == 1) ? 'DD开启' : 'DD关闭' }}</el-dropdown-item>
                    <el-dropdown-item v-if="checkRoles(['partner'])"
                    @click.native="
                      storeSetDialog = true;
                      shopObj = {
                        deposit_drawbacke_type: scope.row.deposit_drawbacke_type,
                        dialogTitle: '押金退款方式',
                        store_id: scope.row.id,
                        type: 5
                      }
                    ">押金退款</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/condom/shopGoods/${scope.row.id}`})" v-if="scope.row.depend_type_name.indexOf('套套机') > -1">关联商品</el-dropdown-item>

                    <el-dropdown-item @click.native="$router.push({path: `/shop/billing/${scope.row.id}?type=2`})" v-if="checkRoles(['partner']) && scope.row.depend_type_name.indexOf('密码线') > -1">购买成本价</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/shop/public/${scope.row.id}`})" v-if="checkRoles(['partner']) && scope.row.depend_type_name.indexOf('密码线') > -1">先关注</el-dropdown-item>

                    <el-dropdown-item @click.native="
                      storeSetDialog = true;
                      rowObj = scope.row;
                      shopObj = {
                        thread_cost_price: scope.row.thread_cost_price,
                        cost_controll_switch: scope.row.cost_controll_switch,
                        dialogTitle: '设备成本·商户提现控制',
                        store_id: scope.row.id,
                        type: 3
                      }
                    ">提现成本控制</el-dropdown-item>

                    <!-- <el-dropdown-item @click.native="toEdit({aid: scope.row.aid, type: 8})">提现更新</el-dropdown-item> -->
                    <el-dropdown-item @click.native="$router.push({path: `/shop/withdraw?aid=${scope.row.aid}`})" v-if="checkRoles(['partner'])">提现设置</el-dropdown-item>
                    <el-dropdown-item @click.native="showEntranceFeeObj(scope.row)" v-if="scope.row.divide_type_1 == 2 && checkRoles(['partner'])">入场费</el-dropdown-item>
                    <el-dropdown-item @click.native="$router.push({path: `/adver/setPower?son_id=${scope.row.aid}`})">广告权限</el-dropdown-item>
                    <el-dropdown-item v-if="checkRoles(['partner'])"
                    @click.native="
                      storeSetDialog = true;
                      rowObj = scope.row;
                      shopObj = {
                        depend_type_name: scope.row.depend_type_name,
                        expired_bao_cost_price: scope.row.expired_bao_cost_price,
                        expired_thread_cost_price: scope.row.expired_thread_cost_price,
                        free_rent_minutes: scope.row.free_rent_minutes,
                        wx_ad_right: scope.row.wx_ad_right,
                        store_id: scope.row.id,
                        dialogTitle: '其他设置',
                        type: 4
                      }
                    ">其他设置</el-dropdown-item>
                    <template v-if="!checkRoles(['terminal'])">
                      <el-dropdown-item @click.native="$router.push({path: `/shop/create?fid=${scope.row.aid}`})" v-if="scope.row.major_pid == 0">添加分店</el-dropdown-item>
                    </template>
                    <el-dropdown-item @click.native="toEdit({aid: scope.row.aid, type: 7})">提现密码</el-dropdown-item>
                    <el-dropdown-item @click.native="toEdit({aid: scope.row.aid, type: 5})">登录密码</el-dropdown-item>
                    <!-- <el-dropdown-item @click.native="toEdit({id: scope.row.id, type: 4, index: scope.$index})">删除商户</el-dropdown-item> -->
                  </el-dropdown-menu>
                </el-dropdown>
                <!--<el-button type="primary" size="mini" round plain class="ml-0" @click="$router.push({path: `/shop/adver/${scope.row.id}`})">跳转广告</el-button>-->
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-center" v-if="!outStatus">
          <pagination
            v-show="listQuery.page_num > 0"
            :page.sync="listQuery.start"
            :limit.sync="listQuery.limit"
            :page-count="listQuery.page_num"
            @pagination="getList"
          />
        </div>
      </div>
    </div>

    <el-dialog title="首单免费" :visible.sync="freeDialog">
      <el-form label-width="140px">
        <el-form-item label="任一产品：">
          <el-switch v-model="shopObj.first_free_only_once" :active-value="1" :inactive-value="0"/>
          <div class="fs-s2 text-gray">提示：任一产品关闭时表示每一个产品都可以免费一次</div>
        </el-form-item>
        <el-form-item label="首单免费：">
          <el-switch v-model="shopObj.first_free_switch" :active-value="1" :inactive-value="0"/>
          <div class="fs-s2 text-gray">提示：开启免费，首页地图、附近商户和用户支付页面都会出现首单免费字样</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="freeDialog = false">取 消</el-button>
        <el-button type="primary" @click="postFree()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="操作记录" :visible.sync="setRecordDialog" width="600px">
      <div v-infinite-scroll="loadSetRecord" class="pl-10" style="overflow: auto; max-height: 350px">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in setRecordList" :key="index" placement="top" hide-timestamp :timestamp="index">
            <div class="mb-10 fs-c1">{{ index }}</div>
            <div v-for="sitem in item.list" class="mb-5 fs-s4 text-gray">{{ parseTime(sitem.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }} <span class="mr-10 ml-10 el-icon-right"></span> {{ sitem.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <el-dialog title="入场费设置" :visible.sync="entranceFeeDialog" width="600px">
      <el-form label-width="auto">
        <el-form-item label="模式：">
          <el-radio-group v-model="entranceFeeObj.divide_model">
            <el-radio :label="1">固定返款</el-radio>
            <el-radio :label="2">比例返款</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="entranceFeeObj.divide_model == 1">
          <el-form-item label="入场金额：">
            <el-input v-model="entranceFeeObj.store_door_fee_1">
            <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="返款日期：">
            <el-select v-model="entranceFeeObj.door_fee_date" placeholder="请选择">
              <el-option
                v-for="item in 28"
                :label="'每月' + item + '号'"
                :value="item">
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <template v-if="entranceFeeObj.divide_model == 2">
          <el-form-item label="总入场金额：">
            <el-input v-model="entranceFeeObj.promise_send_money">
              <template slot="append">元</template>
            </el-input>
            <div class="fs-s3 text-gray">返还入场费不会超过此金额</div>
          </el-form-item>
          <el-form-item label="返还比例：">
            <el-input v-model="entranceFeeObj.door_relative_percent">
              <template slot="append">%</template>
            </el-input>
            <div class="fs-s3 text-gray">返款金额=商户上级代理的收入*返还比例</div>
          </el-form-item>
          <el-form-item label="返款日期：">
            <el-select v-model="upMoneyObj.crond_once_unit_day" placeholder="请选择">
              <el-option
                v-for="item in 28"
                :label="'每月' + item + '号'"
                :value="item">
              </el-option>
            </el-select>
            <div class="fs-s2 text-gray">提示：比例返款模式会将提现更新模式改为定时更新</div>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="entranceFeeDialog = false">取 消</el-button>
        <el-button type="primary" @click="postEntranceFee()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="可提现金额更新" :visible.sync="upMoneyDialog" width="600px">
      <el-form label-width="130px">
        <el-form-item label="更新方式：">
          <el-radio-group v-model="upMoneyObj.crond_money_type">
            <el-radio :label="0">实时更新</el-radio>
            <el-radio :label="1">定时更新</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="更新日期：">
          <el-select v-model="upMoneyObj.crond_once_unit_day" placeholder="请选择">
            <el-option
              label="每天"
              :value="0">
            </el-option>
            <el-option
              v-for="item in 28"
              :label="'每月' + item + '号'"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <template v-if="upMoneyObj.crond_money_type == 1">
          <el-form-item label="更新时间：">
            <el-select v-model="upMoneyObj.crond_once_unit_hour" placeholder="请选择">
               <el-option
                 v-for="item in 24"
                 :label="`${item - 1}点`"
                 :value="item - 1">
               </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="最小更新金额：">
            <el-input v-model="upMoneyObj.crond_min_money">
              <template slot="append">元</template>
            </el-input>
            <div class="fs-s2 text-gray">注：未更新金额小于最小更新金额时，则不更新。</div>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="upMoneyDialog = false">取 消</el-button>
        <el-button type="primary" @click="postUpMoney()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="设备绑定" :visible.sync="deviceBindDialog" width="600px">
      <el-input
        type="textarea"
        :rows="6"
        placeholder="设备编号与编号之间用英文逗号隔开" v-model="deviceBindStr">
      </el-input>
      <div class="pt-5">注：设备编号与编号之间用 , 隔开(英文逗号)。</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deviceBindDialog = false">取 消</el-button>
        <el-button type="primary" @click="distribu()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="设备绑定结果" :visible.sync="deviceBindEndDialog" width="600px">
      <div class="mb-10 flex" v-for="item in bind_success">
        <div>{{ item.sn }}</div>
        <div class="flex1 pl-20">{{ item.msg }}</div>
      </div>
      <div class="mb-10 flex text-danger" v-for="item in bind_err">
        <div>{{ item.sn }}</div>
        <div class="flex1 pl-20">{{ item.msg }}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deviceBindEndDialog = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="shopObj.dialogTitle" :visible.sync="storeSetDialog">
      <template v-if="shopObj.type == 3">
        <el-form label-width="140px">
          <el-form-item label="是否开启：">
            <el-switch v-model="shopObj.cost_controll_switch" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">提示：开启表示商户提现时，商户的可提现金额需大于(商户设备数*成本)，且只能提超出的金额。</div>
          </el-form-item>
          <el-form-item label="密码线成本：">
            <el-input v-model="shopObj.thread_cost_price">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="shopObj.type == 4">
        <el-form label-width="auto">
          <template v-if="shopObj.depend_type_name">
            <el-form-item label="充电宝超时成本：" v-if="shopObj.depend_type_name.indexOf('充电宝') > -1">
              <el-input v-model="shopObj.expired_bao_cost_price">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="密码线超时成本：" v-if="shopObj.depend_type_name.indexOf('线') > -1">
              <el-input v-model="shopObj.expired_thread_cost_price">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </template>
          <el-form-item label="充电宝免费时长：" v-if="shopObj.depend_type_name.indexOf('充电宝') > -1">
            <el-input v-model="shopObj.free_rent_minutes" placeholder="为0时表示未设置免费时长">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item label="广告展示：">
            <el-switch v-model="shopObj.wx_ad_right" :active-value="1" :inactive-value="0"/>
            <div class="fs-s2 text-gray">提示：关闭表示扫此商户绑定的设备二维码进入小程序时，所有广告均不展示。</div>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="shopObj.type == 5">
        <el-form label-width="140px">
          <el-form-item label="退款方式：">
            <el-radio-group v-model="shopObj.deposit_drawbacke_type">
              <el-radio :label="0">默认系统设置</el-radio>
              <el-radio :label="1">原路退回</el-radio>
              <el-radio :label="2">退回小程序钱包</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="shopObj.type == 6">
        <el-checkbox-group v-model="formThead">
          <el-checkbox :label="item" v-for="item in allThead" class="mr-0 mb-10" style="width: 120px;" />
        </el-checkbox-group>
        <div class="mt-10 fs-s2 text-gray">提示：勾选表示列表显示此选项。表头设置只对当前用户在本机登录有效，有效期最长7天。</div>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button @click="storeSetDialog = false">取 消</el-button>
        <el-button type="primary" @click="setFormHead()" v-if="shopObj.type == 5">确 定</el-button>
        <el-button type="primary" @click="editShopPart(shopObj); storeSetDialog = false" v-else>确 定</el-button>
      </div>
    </el-dialog>

    <editwith ref="editwith" :type="2"></editwith>
    <editwith ref="editwiths" :type="2" :moneyType="2"></editwith>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
import selPlat from '@/components/selPlat'
import area from '@/components/area.json'
import editwith from '../agent/_editwith'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import Sortable from 'sortablejs'
import {
  copyText,
  showPercent
} from '@/utils/index'
import {
  getToken,
  setToken
} from '@/utils/auth'
const defaultThead = ['门头照', '商户名称', '商户地址', '订单量', '使用率', '客单价', '上级代理', '分润人', '分成方式', '城市区域', '行业分类', '设备', '创建时间']
export default {
  name: 'subShop',
  components: {
    Pagination,
    drawer,
    selPlat,
    editwith
  },
  props: {
    user_type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      allThead: ['门头照', '商户名称', '商户地址', '订单量', '使用率', '客单价', '上级代理', '分润人', '分成方式', '城市区域', '行业分类', '设备','提现控制','创建时间'],
      formThead: getToken(`${agentInfo.id}_check_thead`) ? JSON.parse(getToken(`${agentInfo.id}_check_thead`)) : defaultThead,
      checkThead: getToken(`${agentInfo.id}_check_thead`) ? JSON.parse(getToken(`${agentInfo.id}_check_thead`)) : defaultThead,
      beginOptions: {
        disabledDate: (time) => {
          if (this.form.endTime) {
            return time.getTime() > this.form.endTime || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          } else {
            return time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          }
        }
      },
      endOptions: {
        disabledDate: (time) => {
          if (this.form.startTime) {
            return time.getTime() < this.form.startTime || time.getTime() > new Date(new Date().toLocaleDateString()).getTime()
          } else {
            return time.getTime() > new Date(new Date().toLocaleDateString()).getTime() + 86400
          }
        }
      },
      clickSubmit: false,
      showPercent: showPercent,
      form: {
        query_rate_date_type: 0,
        query_rate_number_type: 0
      },
      sel_cat: [],
      categoryList: [],
      search_regions_tag: [],
      areaList: [],
      areaObj: {},
      give_role: [{
        role_name: '全部',
        role_id: 0
      }],
      tableMaxH: '250',
      oemInfo: {},
      list: [],
      listLoading: true,
      listQuery: {
        //search_agent_id: '0',
        search_depend_type: '-1',
        search_son_type: 2,
        search_agent_level: 0,
        type: 1,
        start: 1,
        total: 10,
        page_num: 1
      },
      sort_type: ['综合排序','收益从高到底','收益从低到高','创建时间由近到远','创建时间由远到近','登录时间由近到远','登录时间由远到近','月交易额由高到低','月交易额由低到高'],
      rate_date: ['默认', '昨天','近3天','近7天','上周','本月','上月'],
      rate_number: ['默认', '0收益','使用率大于2%','使用率大于5%','使用率大于10%','使用率大于20%'],
      selSnArr: [],
      zuo_sn: '',
      copyUrl: '',

      rowObj: {},
      freeDialog: false,
      shopObj: {},

      /** 操作记录 */
      setRecordDialog: false,
      setRecordList: {},
      setRecordObj: {},

      entranceFeeDialog: false,
      entranceFeeObj: {},

      upTime: ['08:00', '20:00', '12:00', '24:00'],
      upMoneyDialog: false,
      upMoneyObj: {},

      select_aid: '',
      deviceBindStr: '',
      deviceBindDialog: false,
      deviceBindEndDialog: false,
      bind_success: [],
      bind_err: [],

      storeSetDialog: false,

      selAidArr: [],
      selID: [],
      son_uid: 0,
      son_type: 0,

      outStatus: false,
      excel: false,
      percentage: 0,
      wbout: {},
      wi: 0,
    }
  },
  computed: {
    device() {
      return this.$store.state.app.device
    },
    deviceNameObj() {
      return this.$store.state.user.deviceNameObj
    },
    deviceKeyObj() {
      return this.$store.state.user.deviceKeyObj
    },
    siteInfo() {
      return this.$store.getters.siteInfo
    },
    agentInfo(){
      return this.$store.getters.agentInfo
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.urlQuery = JSON.stringify(to.query)
    if (from.name == 'shopEdit') {
      to.meta.reload = true
    } else {
      to.meta.reload = false
    }
    next()
  },
  activated() {
    let queryKey = ['zuo_sn', 'son_uid', 'son_type'], query = this.$route.query
    for(var i in queryKey){
      this[queryKey[i]] = query[queryKey[i]]
    }
    if(this.$route.meta.reload){
      this.getList()
      this.setFormHead(2)
    }else if(this.urlQuery != this.$route.meta.urlQuery) {
      this.toQuery(2)
      this.getCategory()
      this.getArea()
    }
    this.urlQuery = this.$route.meta.urlQuery
  },
  mounted(){

  },
  methods: {
    /**
     * 选择商户
     * @param {arr} list
     */
    selStore(list) {
      let selAidArr = [], selID = []
      for (var i in list) {
        selAidArr.push(list[i].aid)
        selID.push(list[i].id)
      }
      this.selAidArr = selAidArr
      this.selID = selID
    },

    /**
       * 获取权限
       */
    getPower() {
      let give_role = [{
        role_name: '全部',
        role_id: 0
      }]
      const roleKey = ['all_level_num', 'partner_level_num', 'agent_level_num', 'charge_level_num', 'manager_level_num']
      const listQuery = Object.assign({}, this.listQuery, this.form)
      if(listQuery.startTime) listQuery.startTime = listQuery.startTime / 1000
      if(listQuery.endTime) listQuery.endTime = listQuery.endTime / 1000
      this.$get('SyStatistics/getStoreStat', listQuery).then(res => { // agentapi/merchant_data_stat_num
        this.$get('agentapi/add_agent').then(ares => {
          give_role = give_role.concat(ares.give_role_right)
          for (var i in give_role) {
            const role_id = give_role[i].role_id
            give_role[i].role_name = `${give_role[i].role_name}(${res[roleKey[role_id]] || 0})`
          }
          this.give_role = give_role
        })
      })
    },

    /**
       * 请求类型筛选
       * @param {Object} tab
       * @param {Object} event
       */
    typeClick(tab, event) {
      this.listQuery.order_type = tab.name
      this.listQuery.start = 1
      this.getList()
    },

    /**
     * 搜索查询
     */
    toQuery(type = 0) {
      let baseFilter = {
        sort_type: 0,
        search_user_type: this.user_type == 2 ? 0 : this.user_type,
        search_regions_tag: '',
        query_rate_date_type: 0,
        query_rate_number_type: 0,
        is_distributed: '2'
      }
      if(this.clickSubmit) true
      this.clickSubmit = true
      this.$refs.filterDrawer.hide()
      if (type == 1 || type == 2) {
        if (type == 2) {
          baseFilter.son_id = this.$route.query.son_id
        }
        baseFilter.query_rate_date_type = 0
        baseFilter.query_rate_number_type = 0
        this.sel_cat = []
        this.listQuery.start = 1
        this.form = baseFilter
      } else {
        this.listQuery.start = 1
        if (this.search_regions_tag && this.search_regions_tag.length > 0) {
          baseFilter.search_regions_tag = this.search_regions_tag[this.search_regions_tag.length - 1]
        }
        baseFilter.cat_id = this.sel_cat[1] ? this.sel_cat[1] : this.sel_cat[0]
        if(this.old_rate && (this.old_rate.query_rate_date_type > 0 || this.old_rate.query_rate_number_type > 0) && (!this.form.query_rate_date_type || !this.form.query_rate_number_type)){
          this.form.query_rate_date_type = 0
          this.form.query_rate_number_type = 0
        } else {
          if(this.form.query_rate_date_type > 0 && !this.form.query_rate_number_type){
            this.form.query_rate_number_type = 1
          } else if(this.form.query_rate_number_type > 0 && !this.form.query_rate_date_type){
            this.form.query_rate_date_type = 1
          }
        }
        this.old_rate = {
          query_rate_date_type: baseFilter.query_rate_date_type,
          query_rate_number_type: baseFilter.query_rate_number_type
        }
      }
      if (this.outStatus) this.outStatus = false
      this.getPower()
      this.getList()
    },

    /**
       * 获取商户类别
       */
    getCategory() {
      this.$get('agentapi/store/store_cat_list').then(res => {
        for (var i in res) {
          const obj = {
            value: res[i].cat_id,
            label: res[i].cat_name,
            children: [{
              value: 0,
              label: '全部'
            }]
          }
          if (res[i].son_cat_list.length > 0) {
            for (var s in res[i].son_cat_list) {
              const child = res[i].son_cat_list[s]
              obj.children.push({
                value: child.cat_id,
                label: child.cat_name
              })
            }
          }
          this.categoryList.push(obj)
        }
      })
    },

    /**
     * 获取区域
     */
    getArea() {
      const res = area, areaObj = {}
      for (var i in res) {
        const firstLevel = res[i]
        const obj = {
          value: firstLevel.tag,
          label: firstLevel.title,
          children: []
        }
        areaObj[firstLevel.tag] = {
          title: firstLevel.title
        }
        if (firstLevel.son_list.length > 0) {
          const secondLevel = firstLevel.son_list
          for (var s in secondLevel) {
            const secondItem = secondLevel[s]
            obj.children.push({
              value: secondItem.tag,
              label: secondItem.title,
              children: []
            })
            areaObj[secondItem.tag] = {
              title: secondItem.title
            }
            if (secondItem.son_list.length > 0) {
              const thirdLevel = secondItem.son_list
              for (var t in thirdLevel) {
                const thirdItem = thirdLevel[t]
                obj.children[s].children.push({
                  value: thirdItem.tag,
                  label: thirdItem.title
                })
                areaObj[thirdItem.tag] = {
                  title: thirdItem.title
                }
              }
            } else {
              obj.children = undefined
            }
          }
        } else {
          obj.children = undefined
        }
        this.areaList.push(obj)
      }
      this.areaObj = areaObj
    },

    /**
     * 获取列表
     */
    getList() {
      let url = 'agentapi/search/query_merchants'
      let listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.start - 1
      })
      if(listQuery.query_month){
        let t = listQuery.query_month.split('-')
        listQuery.query_year = t[0]
        listQuery.query_month = t[1]
      }
      if(listQuery.startTime) listQuery.startTime = listQuery.startTime / 1000
      if(listQuery.endTime) listQuery.endTime = listQuery.endTime / 1000
      this.$get(url, listQuery).then(res => {
        if(this.checkRoles(['terminal'])) this.getOEMInfo(this.arrayKeys(res.list, 'aid'))
        if (this.outStatus) {
          this.list = res.list
          if (listQuery.limit > res.list.length) {
            this.listLoading = false
            this.percentage = 100
          } else {
            this.listQuery.start++
            this.percentage = this.percentage < 95 ? this.percentage + 5 : 95
          }
          this.$nextTick(() => {
            this.outTabdd('out_table')
          })
        } else {
          this.listLoading = false
          this.list = res.list
          this.listQuery.page_num = res.page_num
          this.clickSubmit = false
          if(listQuery.start == 0){
            this.tableMaxH = window.innerHeight - this.$refs.list_table.$el.offsetTop - 83
          }
        }
      }).catch(() => {
        this.clickSubmit = false
        this.listLoading = false
      })
    },

    /**
     * 品牌信息
     */
    getOEMInfo(aids = []) {
      this.$get('commonapi/configer/these_platform_info', {
        son_aids: JSON.stringify(aids)
      }).then(res => {
        this.oemInfo = res.list
      })
    },

    /**
       * 铺货
       */
    distribu(row) {
      let aid, zuo_sn
      this.bind_err = []
      this.bind_success = []
      if(row){
        aid = row.aid
        zuo_sn = this.zuo_sn
      }else{
        aid = this.select_aid
        zuo_sn = this.deviceBindStr
      }
      zuo_sn = zuo_sn.replace(/[ ]/g,"")
      zuo_sn = zuo_sn.replace(/[\r\n]/g,"")
      zuo_sn = zuo_sn.replace(/\ +/g,"")
      if(!zuo_sn){
        this.$message({
          message: '错误的设备码',
          type: 'error'
        })
        return
      }
      this.$alert('确定将设备绑定到该商户吗？', '设备铺货', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            zuo_sn = zuo_sn.split(',')
            this.load = this.$message({
              duration: 0,
              iconClass: 'el-icon-loading',
              message: '绑定中'
            })
            for (var i in zuo_sn) {
              this.postBind(zuo_sn[i], aid, zuo_sn.length, i)
            }
          }
        }
      })
    },

    async postBind(sn, aid, len, i){
      this.$post('agentapi/device/save_pickup_devices', {
        goods_sn: sn,
        son_id: aid
      }).then((res) => {
        this.bind_success.push({
          sn: sn,
          msg: '绑定成功'
        })
        if(i == len - 1){
          this.bindEnd()
        }
      }).catch(err=>{
        this.bind_err.push({
          sn: sn,
          msg: err.msg
        })
        if(i == len - 1){
          this.bindEnd()
        }
      })
    },

    bindEnd(){
      this.load.close()
      this.deviceBindEndDialog = true
      if(this.bind_err.length == 0){
        this.deviceBindDialog = false
      }
    },

    /**
       * 编辑
       * @param {Object} row
       */
    toEdit(row) {
      switch (row.type) {
        case 1:

          break
        case 2:
          this.$prompt('请输入冻结金额', '设置冻结金额', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: row.freez_money
          }).then(({
            value
          }) => {
            this.$post('agentapi/save_agent_freez_money', {
              son_id: row.id,
              freez_money: value
            }).then(res => {
              this.$message({
                message: '设置成功',
                type: 'success'
              })
              row.freez_money = value
            })
          })
          break
        case 4:
          this.$alert('确定删除此商户吗？', '删除商户', {
            confirmButtonText: '确定',
            callback: action => {
              if (action == 'confirm') {
                this.$post('agentapi/sttuf/delete_merchant', {
                  store_id: row.id
                }).then(res => {
                  this.$message({
                    message: '删除成功',
                    type: 'success'
                  })
                  this.list.splice(row.index, 1)
                })
              }
            }
          })
          break
        case 5:
          this.$prompt('请输入新登录密码', '重置登录密码', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'password',
            beforeClose: (action, instance, done) => {
              if (action == 'confirm') {
                const value = instance.inputValue
                this.$post('agentapi/save_merchant_password', {
                  son_id: row.aid,
                  password: value
                }).then(res => {
                  this.$message({
                    message: '设置成功',
                    type: 'success'
                  })
                  done()
                })
              } else {
                done()
              }
            }
          })
          break
        case 6:
          this.$prompt('请输入商户营业时间', '设置营业时间', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'text',
            inputPlaceholder: '如：09:00-22:00',
            inputValue: row.row.business_time_des,
            beforeClose: (action, instance, done) => {
              if (action == 'confirm') {
                const value = instance.inputValue
                this.$post('agentapi/store/save_business_time', {
                  store_id: row.row.id,
                  business_time_des: value
                }).then(res => {
                  row.row.business_time_des = value
                  this.$message({
                    message: '设置成功',
                    type: 'success'
                  })
                  done()
                })
              } else {
                done()
              }
            }
          })
          break
        case 7:
            this.$prompt('请输入新提现密码', '重置提现密码', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputType: 'password',
              beforeClose: (action, instance, done) => {
                if (action == 'confirm') {
                  const value = instance.inputValue
                  this.$post('agentapi/save_merchant_password', {
                    son_id: row.aid,
                    password: value,
                    type: 1
                  }).then(res => {
                    this.$message({
                      message: '设置成功',
                      type: 'success'
                    })
                    done()
                  })
                } else {
                  done()
                }
              }
            })
            break
        case 8:
          this.upMoneyDialog = true
          this.$get('agentapi/sttuf/crontab_merchant_account', {
            son_id: row.aid
          }).then(res => {
            res.son_id = row.aid
            this.upMoneyObj = res
          })
          break
      }
    },

    /**
     * 商户详情
     */
    getDetail(id, type = 1){
      let load = this.$message({
        duration: 0,
        iconClass: 'el-icon-loading',
        message: '请求中~~~'
      })
      this.$get('agentapi/my_merchant_detail', {
        store_id: id
      }).then(res => {
        load.close()
        if(type == 1){
          if(this.siteInfo.first_free_right == 0 && !res.profit_info.first_free_switch){
            this.$message({
              message: '系统首单免费功能已关闭，暂不支持开启首单免费',
              type: 'error'
            })
            return
          }
          this.freeDialog = true
          this.shopObj = {
            store_id: id,
            first_free_only_once: res.profit_info.first_free_only_once,
            first_free_switch: res.profit_info.first_free_switch
          }
        }
      })
    },

    /**
     * 设置首单免费
     */
    postFree(){
      if(this.siteInfo.first_free_right == 0 && this.shopObj.first_free_switch){
        this.$message({
          message: '系统首单免费功能已关闭，暂不支持开启首单免费，请关闭后提交',
          type: 'error'
        })
        return
      }
      let load = this.$message({
        duration: 0,
        iconClass: 'el-icon-loading',
        message: '请求中~~~'
      })
      this.$post('agentapi/store/save_first_free', this.shopObj).then(res => {
        load.close()
        this.$message({
          message: '设置成功',
          type: 'success'
        })
        this.freeDialog = false
      })
    },

    /**
     * 获取操作记录
     */
    getSetRecord(aid, type = 0){
      if(type == 1){
        this.setRecordObj.start = this.setRecordObj.start + 1
      } else {
        this.setRecordList = {}
        this.setRecordObj = {
          aid: aid,
          start: 0,
          limit: 20,
          page_num: 1
        }
      }
      this.$get('agentapi/log/agent_records', this.setRecordObj).then(res => {
        if(res.list.length == 0 && this.setRecordObj.start == 0){
          this.$message({
            message: '暂无记录',
            type: 'error'
          })
          return
        }
        res.list.map(item => {
          return item.date = this.parseTime(item.add_date, '{y}-{m}-{d}')
        })
        res.list.map(item => {
          if(!this.setRecordList[item.date]) this.$set(this.setRecordList, item.date, {})
          if(!this.setRecordList[item.date].list) this.$set(this.setRecordList[item.date], 'list', [])
          this.setRecordList[item.date].list.push(item)
        })
        this.setRecordDialog = true
        this.setRecordObj.page_num = res.page_num
      })
    },

    /**
     * 滚动加载更多
     */
    loadSetRecord () {
      if(this.setRecordObj.aid && this.setRecordObj.page_num > this.setRecordObj.start + 1){
        this.getSetRecord('', 1)
      }
    },

    /**
     * 显示入场费
     */
    showEntranceFeeObj(row){
      this.rowObj = row
      this.entranceFeeDialog = true
      this.entranceFeeObj = {
        store_id: row.id,
        divide_model: row.divide_model,
        store_door_fee_1: row.store_door_fee_1,
        door_fee_date: row.door_fee_date,
        promise_send_money: row.promise_send_money,
        door_relative_percent: row.door_relative_percent,
      }
      this.$get('agentapi/sttuf/crontab_merchant_account', {
        son_id: row.aid
      }).then(res => {
        this.upMoneyObj = {
          son_id: row.aid,
          crond_money_type: 1,
          crond_once_unit_day: res.crond_once_unit_day,
          crond_min_money: 0,
          crond_once_unit_hour: 0
        }
      })
    },

    /**
     * 提交入场费
     */
    postEntranceFee(){
      this.$post('agentapi/store/door_fee_date', this.entranceFeeObj).then(res => {
        this.entranceFeeDialog = false
        this.rowObj.store_door_fee_1 = this.entranceFeeObj.store_door_fee_1
        this.rowObj.door_fee_date = this.entranceFeeObj.door_fee_date
        this.rowObj.divide_model = this.entranceFeeObj.divide_model
        this.rowObj.promise_send_money = this.entranceFeeObj.promise_send_money
        this.rowObj.door_relative_percent = this.entranceFeeObj.door_relative_percent
        if(this.entranceFeeObj.divide_model == 2){
          this.postUpMoney()
        } else {
          this.$message({
            type: 'success',
            message: '设置成功'
          })
        }
      })
    },

    /**
     * 提交提现金额更新规则
     */
    postUpMoney(){
      this.$post('agentapi/sttuf/crontab_merchant_account', this.upMoneyObj).then(res => {
        this.upMoneyDialog = false
        this.$message({
          type: 'success',
          message: '设置成功'
        })
      })
    },

    /**
     * 设置蓝牙链接规则
     */
    setbuletooth(row){
      let advance_buletooth = row.advance_buletooth == 1 ? 0 : 1
      this.editShopPart({
        store_id: row.id,
        type: 1,
        agree: advance_buletooth
      })
      row.advance_buletooth = advance_buletooth
    },

    /**
     * 修改商户的部分
     */
    editShopPart(params){
      this.$post('agentapi/store/type_switch', params).then(res => {
        this.$message({
          type: 'success',
          message: '设置成功'
        })
        this.rowObj = Object.assign(this.rowObj, params)
      })
    },

    /**
     * 分配商户
     */
    bindAgent(row = {}){
      this.$alert('确定将商户分配到该代理吗？', '商户管理', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.load = this.$message({
              duration: 0,
              iconClass: 'el-icon-loading',
              message: '分配中'
            })
            this.$post('agentapi/employee/sons_transfer_parent', {
              son_id: this.son_uid,
              store_id_arr: row.id ? [row.id] : this.selID
            }).then(res => {
              this.load.close()
              this.$message({
                type: 'success',
                message: '分配成功'
              })
              history.back()
            })
          }
        }
      })
    },

    /**
     * 回收商户
     */
    unbindAgent(row = {}, index){
      this.$alert('确定回收该商户吗？', '商户管理', {
        confirmButtonText: '确定',
        callback: action => {
          if (action == 'confirm') {
            this.load = this.$message({
              duration: 0,
              iconClass: 'el-icon-loading',
              message: '回收中'
            })
            this.$post('agentapi/employee/merchants_recovery_parent', {
              store_id_arr: row.id ? [row.id] : this.selID
            }).then(res => {
              this.load.close()
              this.$message({
                type: 'success',
                message: '回收成功'
              })
              if(index){
                this.list.splice(index, 1)
              }else{
                history.back()
              }
            })
          }
        }
      })
    },

    /**
     * 导出
     */
    outTable() {
      this.outStatus = true
      this.listLoading = true
      this.listQuery.limit = 50
      this.list = []
      this.excel = true
      this.getList()
    },

    /**
     * 导出表格
     */
    outTabdd(tabId, fileName = '商户列表') {
      let fix = document.querySelector('.el-table__fixed-right')
      let xlsxParam = {}
      let wb
      if (fix) {
        this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`).removeChild(fix), xlsxParam)
        document.querySelector(`#${tabId}`).appendChild(fix)
      } else {
        this.wbout[this.wi] = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`), xlsxParam)
      }
      if(this.wi == 49 && this.listLoading){
        this.wi = 0
      } else {
        this.wi++
        if (this.listLoading) {
          this.getList()
          return
        }
      }
      let wboutes = this.wbout[0]
      var no = ''
      for (var i in this.wbout) {
        delete this.wbout[i].Sheets.Sheet1['!merges']
        delete this.wbout[i].Sheets.Sheet1['ANaN']
        if (i > 0) {
          let sheet1 = this.wbout[i].Sheets.Sheet1
          for (var s in sheet1) {
            let k = s.substring(0, 1)
            let n = s.substring(1)
            if (n != 1 && n != 'ref') {
              let k = s.substring(0, 1)
              n = s.substring(1)
              no = ((parseInt(i) * this.listQuery.limit) + parseInt(n))
              sheet1[k + no] = sheet1[s]
            }
            delete sheet1[s]
          }
          wboutes.Sheets.Sheet1 = Object.assign(wboutes.Sheets.Sheet1, sheet1)
        }
      }
      if (this.wbout[1]) wboutes.Sheets.Sheet1['!ref'] = `A1:Z${no}`
      let wbout = XLSX.write(wboutes, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array'
      })
      this.percentage = 100
      if (!this.listLoading || this.wi == 0) {
        try {
          FileSaver.saveAs(new Blob([wbout], {
            type: 'application/octet-stream'
          }), `${fileName}.xlsx`)
          this.$message({
            message: '导出成功',
            type: 'success'
          })
          if(this.wi == 0 && this.listLoading){
            this.wbout = []
            this.getList()
          } else {
            this.excel = false
            setTimeout(() => {
              location.reload()
            }, 1000)
          }
        } catch (e) {
          if (typeof console !== 'undefined') console.log(e, this.wbout)
        }
        return this.wbout
      }
    },

    /**
     * 设置表头信息
     */
    setFormHead(type = 1){
      if(type == 1){
        this.checkThead = this.formThead
        this.storeSetDialog = false
      }
      setToken(JSON.stringify(this.formThead), `${this.agentInfo.id}_check_thead`)
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  .text-cut_two{
    max-height: 66px;
    line-height: 22px;
    -webkit-line-clamp: 3;/*规定超过两行的部分截断*/
  }
</style>
