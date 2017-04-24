import xs, { Stream, MemoryStream } from 'xstream'
import { fromJS, Map, List } from 'immutable'
import { DOMSource, div } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import Select from '../../../excalibur/Select'
const {map, transform, uniq} = require('lodash')

interface Actions {
  timeValue$: Stream<string>,
  typeValue$: Stream<string>,
}
interface Intents {
  time: Stream<Map<string, any>>,
  type: Stream<Map<string, any>>,
}

const intent = (set: Intents, dom: DOMSource): Actions => {
  return {
    timeValue$: set.time.map(props => (props as Map<string, any>).getIn(['value', 'value'])),
    typeValue$: set.type.map(props => (props as Map<string, any>).getIn(['value', 'value']))
  }
}

const reducers = (actions: Actions) => xs.merge(
  actions.timeValue$.map(
    value => (state: Map<string, any>) => state.set('time', value)
  ),
  actions.typeValue$.map(
    value => (state: Map<string, any>) => state.set('type', value)
  )
)

const model = (actions: Actions) => {
  const reducer$ = reducers(actions)
  return reducer$.fold((acc, reducer) => reducer(acc), fromJS({
  })).remember()
}

const view = (state$: Stream<Map<string, any>>, arr: Stream<VNode>[]) => xs.combine(...arr, state$).map(
      ([typeVNode, timeVNode, state]) =>
          div('.aragorn-toolbar-wrapper', {style: {visibility: 'hidden'}}, [
            div('.aragorn-toolbar', [
              div('.columns', [
                  div('.column .is-half', [typeVNode]),
                  div('.column .is-half', [timeVNode])
              ])
            ])]
          )
)

const props = {
  type: xs.of(fromJS({
    'data': [],
    'style': {
      background: 'hsl(120, 3%, 15%)',
      color: 'white',
      width: '324px'
    },
    'label': '类型',
    'search': ''
  })),
  time: xs.of(fromJS({
    'data': [],
    'style': {
      background: 'hsl(120, 3%, 15%)',
      color: 'white',
      width: '324px'
    },
    'label': '时间',
    'search': ''
  }))
}

export default function toolbar(source: Sources) {
  const time = Select({DOM: source.DOM, props: props.time
    .map(
      state => source.HTTP.select('getshopregionanalysisdetail')
        .flatten()
        .map(
          res => {
            let ans = JSON.parse(res.text).data.region_map
            return state.set('data', fromJS(uniq(map(ans, (item: {
                'date': string
              }) => transform(item, (res: {value: string, text: string}, n: string, key: string) => {
              if (key == 'date') {
                res.value = n
                res.text = n
              }
            })), (n: {value: string}) => n.value)))
            .setIn(['value', 'value'], ans[0] ? ans[0].date : '')
          }
        )
        .startWith(state)
    )
    .remember()
    .flatten()
  })
  const type = Select({DOM: source.DOM, props: props.type
    .map(
      state => source.HTTP.select('getshopregionanalysisdetail')
        .flatten()
        .map(
          res => {
            let ans = JSON.parse(res.text).data.region_map
            return state.set('data', fromJS(uniq(map(ans, (item: {
                'source': string
              }) => transform(item, (res: {value: string, text: string}, n: string, key: string) => {
              if (key == 'source') {
                res.value = n
                res.text = n
              }
            })), (n: {value: string}) => n.value)))
            .setIn(['value', 'value'], ans[0].source)
          }
        )
        .startWith(state)
    )
    .remember()
    .flatten()
  })
  const actions = intent({
    time: time.props,
    type: type.props,
  }, source.DOM)
  const state$ = model(actions)
  const vtree$ = view(state$, [type.DOM, time.DOM] as Stream<VNode>[])
  return {
    DOM: vtree$,
    props: state$
  }
}