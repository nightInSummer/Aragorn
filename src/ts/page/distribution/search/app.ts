import xs, { Stream } from 'xstream'
import { fromJS } from 'immutable'
import { DOMSource, div, label } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import Input from '../../../excalibur/Input'
import Select from '../../../excalibur/Select'
import Button from '../../../excalibur/Button'
interface Actions {
  shopIdValue$: Stream<string>,
  shopNameValue$: Stream<string>
}

const intent = (arr: Stream<Map<string, any> | Props>[]): Actions => {
  const shopIdSearch$ = arr[0].map(props => (props as Map<string, any>).get('loading'))
  const shopNameSearch$ = arr[0].map(props => (props as Map<string, any>).get('loading'))
  return {
    shopIdValue$: arr[0].map(props => (props as Map<string, any>).get('value')).startWith(''),
    shopNameValue$: arr[1].map(props => (props as Map<string, any>).get('value')).startWith('')
  }
}

const reducers = (actions: Actions) => xs.merge(
  actions.shopIdValue$.map(
    value => (state: Map<string, any>) => state.set('shopId', value)
  ),
  actions.shopNameValue$.map(
    value => (state: Map<string, any>) => state.set('shopId', value)
  )
)

const model = (actions: Actions) => {
  const reducer$ = reducers(actions)
  return xs.of(fromJS({
    shopId: ''
  }))
  .map(state => reducer$.fold((acc, reducer) => reducer(acc), state))
  .flatten()
}

const view = (state$: Stream<Map<string, any>>, arr: Stream<VNode>[]) => xs.combine(...arr, state$).map(
      ([shopIdVNode, shopNameVNode, teamVNode, aoiVNode, bdVNode, compairVNode, searchVNode, state]) =>
         div([compairVNode, teamVNode, aoiVNode, bdVNode, shopIdVNode, shopNameVNode, searchVNode])
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
    'text': '搜索'
  }))
}

export default function app(source: Sources) {
  const shopId = Input({DOM: source.DOM, props: props.shopId})
  const shopName = Input({DOM: source.DOM, props: props.shopName})
  const team = Select({DOM: source.DOM, props: props.team})
  const aoi = Select({DOM: source.DOM, props: props.aoi})
  const bd = Select({DOM: source.DOM, props: props.bd})
  const compair = Select({DOM: source.DOM, props: props.compair})
  const search = Button({DOM: source.DOM, props: props.search})

  const actions = intent([shopId.props, shopName.props])
  const state$ = model(actions)
  const vtree$ = view(state$, [shopId.DOM, shopName.DOM, team.DOM, aoi.DOM, bd.DOM, compair.DOM, search.DOM] as Stream<VNode>[])

  
  return {
    DOM: vtree$
  }
}