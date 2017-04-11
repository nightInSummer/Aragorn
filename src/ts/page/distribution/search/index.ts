import xs, { Stream } from 'xstream'
import { fromJS } from 'immutable'
import { DOMSource, div, label } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import { RequestOptions } from '@cycle/http'
import Input from '../../../excalibur/Input'
import Select from '../../../excalibur/Select'
import Button from '../../../excalibur/Button'
interface Actions {
  shopIdValue$: Stream<string>,
  shopNameValue$: Stream<string>,
  search$: Stream<Symbol>,
  searchComplete$: Stream<Symbol>
}

const intent = (arr: Stream<Map<string, any> | Props | Symbol>[]): Actions => {
  return {
    shopIdValue$: arr[0].map(props => (props as Map<string, any>).get('value')).startWith(''),
    shopNameValue$: arr[1].map(props => (props as Map<string, any>).get('value')).startWith(''),
    search$: arr[2] as Stream<Symbol>,
    searchComplete$: arr[3].mapTo(Symbol('searchComplete'))
  }
}

const request = (state$ : Stream<Props>) : Stream<RequestOptions> => state$.filter(x => x.get('loading')).map((state) => ({
  url: '/wlmine/getshopregionanalysis',
  category: 'getshopregionanalysis',
  method: 'GET',
  query: {
    shop_id: state.get('shopId')
  }
}))

const reducers = (actions: Actions) => xs.merge(
  actions.shopIdValue$.map(
    value => (state: Map<string, any>) => state.set('shopId', value)
  ),
  actions.shopNameValue$.map(
    value => (state: Map<string, any>) => state.set('shopId', value)
  ),
  actions.search$.map(
    () => (state: Map<string, any>) => state.set('loading', true)
  ),
  actions.searchComplete$.map(
    () => (state: Map<string, any>) => state.set('loading', false)
  )
)

const model = (actions: Actions) => {
  const reducer$ = reducers(actions)
  return reducer$.fold((acc, reducer) => reducer(acc), fromJS({}))
}

const view = (state$: Stream<Map<string, any>>, arr: Stream<VNode>[]) => xs.combine(...arr, state$).map(
      ([shopIdVNode, shopNameVNode, teamVNode, aoiVNode, bdVNode, compairVNode, searchVNode, state]) =>
          div('.aragorn-toolbar-wrapper', {style: {visibility: 'hidden'}}, [
            div('.aragorn-toolbar', [
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
                  div('.column .is-4 .is-offset-8', [searchVNode])
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
    'data': [],
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
    'label': '物流商圈'
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
  }))
}

export default function search(source: Sources) {
  const shopId = Input({DOM: source.DOM, props: props.shopId})
  const shopName = Input({DOM: source.DOM, props: props.shopName})
  const team = Select({DOM: source.DOM, props: props.team})
  const aoi = Select({DOM: source.DOM, props: props.aoi})
  const bd = Select({DOM: source.DOM, props: props.bd})
  const compair = Select({DOM: source.DOM, props: props.compair})
  const search = Button({DOM: source.DOM, props: props.search})

  const actions = intent([shopId.props, shopName.props, search.presses, source.HTTP.select('getshopregionanalysis')])
  const state$ = model(actions)
  const vtree$ = view(state$, [shopId.DOM, shopName.DOM, team.DOM, aoi.DOM, bd.DOM, compair.DOM, search.DOM] as Stream<VNode>[])
  return {
    DOM: vtree$,
    HTTP: request(state$)
  }
}