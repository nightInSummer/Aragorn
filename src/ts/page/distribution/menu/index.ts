import xs, { Stream } from 'xstream'
import { fromJS } from 'immutable'
import { DOMSource, div } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import { RequestOptions } from '@cycle/http'
import Menu from '../../../excalibur/Menu'

const props = xs.of(fromJS({
  data: [
    {
      key: 'distribution',
      text: '配送范围分析'
    }
  ]
}))

const view = (vtree$: Stream<VNode>) => vtree$.map((vtree) => div('.aragorn-menu-wrapper', {style: {visibility: 'hidden'}}, [vtree]))

export default function menu(source: Sources) {
  const vtree$ = view(Menu({DOM: source.DOM, props}).DOM as Stream<VNode>)
  return {
    DOM: vtree$
  }
}