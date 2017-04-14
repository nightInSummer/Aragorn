import xs, { Stream } from 'xstream'
import { fromJS } from 'immutable'
import { DOMSource, div } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import { RequestOptions } from '@cycle/http'
import Menu from '../../../excalibur/Menu'
import dropRepeats from 'xstream/extra/dropRepeats'

const props$ = xs.of(fromJS({
  data: [
    {
      key: 'homepage',
      text: '首页'
    },
    {
      key: 'distribution',
      text: '配送范围分析'
    }
  ],
  openKeys: [],
  selected: ''
}))

const view = (vtree$: Stream<VNode>) => vtree$.map((vtree) => div('.aragorn-menu-wrapper', {style: {visibility: 'hidden'}}, [vtree]))

export default function menu(source: Sources) {
  const state$ = source.History
    .compose(dropRepeats((x: any, y: any) => x.pathname === y.pathname))
    .map((location: any) => props$.map( props => props.set('selected', location.pathname.replace('/', ''))))
    .flatten()
    .remember()
  const menu = Menu({DOM: source.DOM, props: state$})
  const vtree$ = view(menu.DOM as Stream<VNode>)
  const History = menu.props
    .map(
      (state: Map<string, any>) => '/' + state.get('selected')
    )
    .filter((x: string) => x !== '/distribution')
    .map((value: string) => ({
      type: 'push',
      pathname: value
    }))
  return {
    DOM: vtree$,
    History
  }
}