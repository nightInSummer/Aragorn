import xs, { Stream } from 'xstream'
import { fromJS, List } from 'immutable'
import { DOMSource, div, button } from '@cycle/dom'
import { Sources } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import Table from '../../../excalibur/Table'
interface Actions {
  searchComplete$: Stream<any>
}

const intent = (source: Sources): Actions => {
  return {
    searchComplete$: source.HTTP.select('getshopregionanalysis').flatten().map(res => JSON.parse(res.text))
  }
}

const reducers = (actions: Actions) => xs.merge(
  actions.searchComplete$.map(
    (value) => (state: Map<string, any>) => {
      return state.set('data', value ? fromJS(value.data.list.map((item: any) => ({...item, action: button(
        '.button',
          {attrs: {title: encodeURIComponent(JSON.stringify(item))}}, '查看详情')
        }))) : List())
    }
  )
)

const model = (props: Stream<Map<string, any>>, actions: Actions) : Stream<Map<string, any>> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map(state => reducer$.fold((acc, reducer) => reducer(acc), state))
    .flatten()
    .remember()
  return state$
}

const view = (state$: Stream<Map<string, any>>, source: Sources) : Stream<VNode> => Table({DOM: source.DOM, props: state$}).DOM.map(
  VNode => div('.aragorn-main-section .fadeIn', [VNode])
)

const props$ = xs.of(fromJS({
  data: [],
  columns: [{
    text: '商户ID',
    key: 'shop_id'
  }, {
    text: '商户名称',
    key: 'shop_name'
  }, {
    text: '物流方',
    key: 'teamname'
  }, {
    text: '物流商圈',
    key: 'aoiname'
  }, {
    text: 'BD商圈',
    key: 'bd_aoiname'
  }, {
    text: '周日均单量',
    key: 'day_order_num_per_week'
  }, {
    text: <span>百度配送范围面积/km<sup>2</sup></span>,
    key: 'baidu_delivery_region_user'
  }, {
    text: '百度最远直线距离/km',
    key: 'baidu_delivery_distance'
  }, {
    text: <span>百度配送范围面积（抓取）/km<sup>2</sup></span>,
    key: 'baidu_delivery_region_grab'
  }, {
    text: <span>美团配送范围面积（抓取）/km<sup>2</sup></span>,
    key: 'meituan_delivery_region_grab'
  }, {
    text: <span>饿了么配送范围面积（抓取）/km<sup>2</sup></span>,
    key: 'eleme_delivery_region_grab'
  }, {
    text: '操作',
    key: 'action'
  }]
}))

export default function app(source: Sources) {
  const actions = intent(source)
  const state$ = model(props$, actions)
  const vtree$ = view(state$, source)
  return {
    DOM: vtree$,
    Router: source.DOM.select('.aragorn-main-section').events('click').filter((x: Event)=> (x.target as HTMLButtonElement).tagName === 'BUTTON').mapTo('/detail'),
    HTTP: source.DOM.select('.aragorn-main-section').events('click').filter((x: Event)=> (x.target as HTMLButtonElement).tagName === 'BUTTON').map((ev) =>  (ev.target as HTMLInputElement).title).map(
      params => ({
        url: '/wlmine/getshopregionanalysisdetail',
        category: 'getshopregionanalysisdetail',
        method: 'GET',
        query: {
          shop_id: JSON.parse(decodeURIComponent(params)).shop_id
        },
        withCredentials: true
      })
    )
  }
}