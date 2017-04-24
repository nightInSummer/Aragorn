import xs, { Stream, MemoryStream } from 'xstream'
import { fromJS, Map, List } from 'immutable'
import { DOMSource, div, label, input } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import { RequestOptions, ResponseStream } from '@cycle/http'
import Input from '../../../excalibur/Input'
import Select from '../../../excalibur/Select'
import Button from '../../../excalibur/Button'
import dropRepeats from 'xstream/extra/dropRepeats'
const {map, transform} = require('lodash')
const TPLData = JSON.parse((<any>window)._INITDATA_.replace(/%/g, '"'))

interface Actions {
  shopIdValue$: Stream<string>,
  shopNameValue$: Stream<string>,
  search$: Stream<Symbol>,
  openMap$: Stream<Symbol>,
  searchComplete$: Stream<Symbol>,
  openMapComplete$: Stream<Symbol>,
  check$: Stream<string>,
  aoiids$: Stream<string>,
  bdAoiids$: Stream<string>,
  compair$: Stream<string>,
  team$: Stream<string>
}
interface Intents {
  shopId: Stream<Map<string, any>>,
  shopName: Stream<Map<string, any>>,
  search: Stream<Symbol>,
  openMap: Stream<Symbol>,
  searchComplete: any,
  openMapComplete: any,
  aoiids: Stream<Map<string, any>>,
  bdAoiids: Stream<Map<string, any>>,
  compair: Stream<Map<string, any>>,
  team: Stream<Map<string, any>>
}

const intent = (set: Intents, dom: DOMSource): Actions => {
  return {
    shopIdValue$: set.shopId.map(props => (props as Map<string, any>).get('value')).startWith(''),
    shopNameValue$: set.shopName.map(props => (props as Map<string, any>).get('value')).startWith(''),
    search$: set.search as Stream<Symbol>,
    openMap$: set.openMap as Stream<Symbol>,
    searchComplete$: set.searchComplete.mapTo(Symbol('searchComplete')),
    openMapComplete$: set.openMapComplete.mapTo(Symbol('openMapComplete')),
    check$: dom.select('.radio input').events('click').map((ev) =>  (ev.target as HTMLInputElement).value).startWith('1'),
    aoiids$: set.aoiids.map(props => (props as Map<string, any>).getIn(['value', 'value'])),
    bdAoiids$: set.bdAoiids.map(props => (props as Map<string, any>).getIn(['value', 'value'])),
    compair$: set.compair.map(props => (props as Map<string, any>).getIn(['value', 'value'])),
    team$: set.team.map(props => (props as Map<string, any>).getIn(['value', 'value']))
  }
}

const request = (state$ : Stream<Props>, router$: any, other$: Stream<Map<string, any>>) : Stream<RequestOptions> | any =>
xs.merge(
  router$.history$.map(
    (history: any) => {
      return history.pathname
    }
  )
  .filter((x: string) => x === '/')
  .map(() => ({
    url: '/wlmine/getshopregionanalysis',
    category: 'getshopregionanalysis',
    method: 'GET',
    query: {
      logistics_type: '1'
    },
    withCredentials: true
  }))
  ,
  state$.filter(x => x.get('tableLoading'))
  .compose(dropRepeats((x: Boolean, y: Boolean) => x === y))
  .map((state) => ({
    url: '/wlmine/getshopregionanalysis',
    category: 'getshopregionanalysis',
    method: 'GET',
    query: {
      shop_id: state.get('shopId'),
      logistics_type: state.get('logistics_type'),
      bd_aoiids: state.get('bd_aoiids'),
      aoiids: state.get('aoiids')
    },
    withCredentials: true
  })),
  state$.filter(x => x.get('mapLoading')).map((state) => ({
    url: '/wlmine/getwholeshopregionanalysis',
    category: 'getwholeshopregionanalysis',
    method: 'GET',
    query: {
      shop_id: state.get('shopId'),
      teamname: state.get('teamname')
    },
    withCredentials: true
  })),
  other$.map(
    (state: Map<string, any>) => state.getIn(['value', 'value'])
  )
  .filter((x: string) => !!x)
  .compose(dropRepeats((x: string, y: string) => x === y))
  .map(
    (value: string) => ({
      url: '/logistics/msgsetting',
      category: 'msgsetting',
      method: 'GET',
      query: {
        teamname: value
      },
      withCredentials: true
    })
  )
)

const reducers = (actions: Actions) => xs.merge(
  actions.shopIdValue$.map(
    value => (state: Map<string, any>) => state.set('shopId', value)
  ),
  actions.shopNameValue$.map(
    value => (state: Map<string, any>) => state.set('shopName', value)
  ),
  actions.search$.map(
    () => (state: Map<string, any>) => state.set('tableLoading', true)
  ),
  actions.openMap$.map(
    () => (state: Map<string, any>) => state.set('mapLoading', true)
  ),
  actions.searchComplete$.map(
    () => (state: Map<string, any>) => state.set('tableLoading', false)
  ),
  actions.openMapComplete$.map(
    () => (state: Map<string, any>) => state.set('mapLoading', false)
  ),
  actions.check$.map(
    value => (state: Map<string, any>) => state.set('logistics_type', value)
  ),
  actions.aoiids$.map(
    value => (state: Map<string, any>) => state.set('aoiids', value)
  ),
  actions.bdAoiids$.map(
    value => (state: Map<string, any>) => state.set('bd_aoiids', value)
  ),
  actions.compair$.map(
    value => (state: Map<string, any>) => state.set('compair', value)
  ),
  actions.team$.map(
    value => (state: Map<string, any>) => state.set('teamname', value)
  )
)

const model = (actions: Actions) => {
  const reducer$ = reducers(actions)
  return reducer$.fold((acc, reducer) => reducer(acc), fromJS({
  }))
}

const view = (state$: Stream<Map<string, any>>, arr: Stream<VNode>[]) => xs.combine(...arr, state$).map(
      ([shopIdVNode, shopNameVNode, teamVNode, aoiVNode, bdVNode, compairVNode, searchVNode, openMapVNode, state]) =>
          div('.aragorn-toolbar-wrapper', {style: {visibility: 'hidden'}}, [
            div('.aragorn-toolbar', [
              div('.columns',
                div('.radio .column .is-4 .is-offset-4',
                  [
                    input({props: {
                      type: 'radio',
                      name: 'logistics_type',
                      value: '1',
                      checked: state.get('logistics_type') === '1'
                    }}),'百度',
                    input({props: {
                      type: 'radio',
                      name: 'logistics_type',
                      value: '2',
                      checked: state.get('logistics_type') === '2'
                    }}),'众包'
                  ]
              )),
              div('.columns', [
                  div('.column .is-half', [teamVNode]),
                  div('.column .is-half', [aoiVNode])
              ]),
              div('.columns', [
                  div('.column .is-half', [bdVNode]),
                  div('.column .is-half', [compairVNode]),
              ]),
              div('.columns', [
                  div('.column .is-half', [shopIdVNode]),
                  div('.column .is-half', [shopNameVNode]),
              ]),
              div('.columns', [
                  div('.column .is-4 .is-offset-4', [searchVNode]),
                  state.get('teamname') ? div('.column .is-4', [openMapVNode]) : '',
              ])
            ])]
          )
)

const props = {
  shopId: xs.of(fromJS({
    'label': '商户ID',
    'style': {
      width: '400px'
    }
  })),
  shopName: xs.of(fromJS({
    'label': '商户名称',
    'style': {
      width: '400px'
    }
  })),
  team: xs.of(fromJS({
    'data': map(TPLData.slist, (item: {
      'sid': Number,
      'sname': string,
      'delivery_party': string
    }) => transform(item, (res: {value: string, text: string}, n: Number | string, key: string) => {
     if (key == 'sid') res.value = n as Number + ''
     if (key == 'sname') res.text = n as string
   })),
    'style': {
      background: 'hsl(120, 3%, 15%)',
      color: 'white',
      width: '324px'
    },
    'label': '物流方'
  })),
  aoi: xs.of(fromJS({
    'data': [],
    'style': {
      background: 'hsl(120, 3%, 15%)',
      color: 'white',
      width: '324px'
    },
    'label': '物流商圈',
    'search': '' // state流被team的state流拦截，因而缺少了intent里面去startWith的过程，这里需要手动初始化
  })),
  bd: xs.of(fromJS({
    'data': [],
    'style': {
      background: 'hsl(120, 3%, 15%)',
      color: 'white',
      width: '324px'
    },
    'label': 'BD商圈'
  })),
  compair: xs.of(fromJS({
    'data': [{
      value: '0',
      text: '配送范围小于竞品'
    }, {
      value: '1',
      text: '配送范围和竞品差不多(±10%)'
    }, {
      value: '2',
      text: '配送范围大于竞品'
    }],
    'style': {
      background: 'hsl(120, 3%, 15%)',
      color: 'white',
      width: '324px'
    },
    'label': '和竞品对比'
  })),
  search: xs.of(fromJS({
    'text': '搜索',
    'style': {
      'padding': '.8em 2em'
    }
  })),
  openMap: xs.of(fromJS({
    'text': '查看整体配送范围',
    'style': {
      'padding': '.8em 2em'
    }
  }))
}

export default function search(source: Sources) {
  const shopId = Input({DOM: source.DOM, props: props.shopId})
  const shopName = Input({DOM: source.DOM, props: props.shopName})
  const team = Select({DOM: source.DOM, props: props.team})
  const aoi = Select({DOM: source.DOM, props: props.aoi
    .map(
      state => source.HTTP.select('msgsetting')
        .flatten()
        .map(
          res => {
            let ans = JSON.parse(res.text).data
            return state.set('data', fromJS(map(ans.team[ans.teamname].aois, (item: {
                'aoiid': string,
                'aoiname': string,
                'partnerids': Array<Number>
              }) => transform(item, (res: {value: string, text: string}, n: string, key: string) => {
              if (key == 'aoiid') res.value = n
              if (key == 'aoiname') res.text = n
            }))))
          }
        )
        .startWith(state)
    )
    .remember()
    .flatten()
  })
  const bd = Select({DOM: source.DOM, props: props.bd})
  const compair = Select({DOM: source.DOM, props: props.compair})
  const search = Button({DOM: source.DOM, props: props.search})
  const openMap = Button({DOM: source.DOM, props: props.openMap})
  const actions = intent({
    shopId: shopId.props,
    shopName: shopName.props,
    search: search.presses,
    openMap: openMap.presses,
    searchComplete: source.HTTP.select('getshopregionanalysis'),
    openMapComplete: source.HTTP.select('getwholeshopregionanalysis'),
    team: team.props,
    aoiids: aoi.props,
    bdAoiids: bd.props,
    compair: compair.props
  }, source.DOM)
  const state$ = model(actions)
  const vtree$ = view(state$, [shopId.DOM, shopName.DOM, team.DOM, aoi.DOM, bd.DOM, compair.DOM, search.DOM, openMap.DOM] as Stream<VNode>[])
  return {
    DOM: vtree$,
    HTTP: request(state$, source.Router, team.props),
    Router: state$.map(
      state => state.get('mapLoading')
    )
    .filter(
      x => !!x
    )
    .mapTo(
      '/overallscope'
    )
    .filter(
      x => location.hash !== '#' + x
    )
  }
}