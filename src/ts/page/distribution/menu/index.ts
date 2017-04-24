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
  const debug = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  const state$ = source.History
    .compose(dropRepeats((x: any, y: any) => {return debug ? x.pathname === y.pathname : x.search === y.search}))
    .map((location: any) => props$.map( props => props.set('selected', debug ? location.pathname.replace('/', '') : location.search.replace('?tpl=', ''))))
    .flatten()
    .remember()
  const menu = Menu({DOM: source.DOM, props: state$})
  const vtree$ = view(menu.DOM as Stream<VNode>)
  const History = menu.props
    .map(
      (state: Map<string, any>) => state.get('selected')
    )
    .filter((x: string) => x !== 'distribution')
    .map((value: string) => {
    return debug
    ? {
      type: 'push',
      pathname: '/' + value
    }
    : {
      type: 'push',
      pathname: location.pathname + '?tpl=' + value
    }
  })
  return {
    DOM: vtree$,
    History
  }
}