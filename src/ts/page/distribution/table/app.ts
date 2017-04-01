import xs, { Stream } from 'xstream'
import { fromJS } from 'immutable'
import { DOMSource } from '@cycle/dom'
import { Sources } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import Table from '../../../excalibur/Table'

const view = (state$: Stream<Map<string, any>>, dom: DOMSource) => Table({DOM: dom, props: state$}).DOM

const props$ = xs.of(fromJS({
  data: [{
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号'
  }],
  columns: [{
    text: '姓名',
    key: 'name'
  }, {
    text: '年龄',
    key: 'age',
  }, {
    text: '住址',
    key: 'address',
  }]
}))

export default function app(source: Sources) {
  const vtree$ = view(props$, source.DOM)
  return {
    DOM: vtree$
  }
}