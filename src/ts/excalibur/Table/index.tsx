import { DOMComponent, Sources, Props } from '../types'
import xs, { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { makeDOMDriver, DOMSource } from '@cycle/dom'
import { VNode } from 'snabbdom/vnode'
import './styles.less'
import {Map, fromJS} from 'immutable'
interface Sinks {
  DOM: Stream<JSX.Element>,
  props: Stream<Map<string, any>>
}
interface Actions {
}
const intent = (dom: DOMSource) : Actions =>
  ({
  })

const reducers = (actions : Actions) => {
  return xs.merge(
  )
}

const model = (props: Stream<Props | Map<string, any>>, actions: Actions) : Stream<Map<string, any>> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map(
      (props : Props) => fromJS(props)
    )
    .map(state => reducer$.fold((acc, reducer) => reducer(acc), state))
    .flatten()
    .remember()
  return state$
}

const view = (state$: Stream<Map<string, any>>) => state$.map(
  (state: Map<string, any>) => {
    return <div className="excalibur-table">
      {typeof state.get('header') !== 'undefined' ? <div className="excalibur-table-header">{state.get('header')}</div> : ''}
      <table cellSpacing="0">
        <tbody>
          <tr>{state.get('columns').map((item : Map<string, any>) => <th width={item.get('width') || 200}>{item.get('text')}</th>).toJS()}</tr>
          {state.get('data').map((item: Map<string, any>) => <tr>{state.get('columns').map((col : Map<string, any>) => item.get(col.get('key')) ? <td title={col.get('text') + ' :'}>{item.get(col.get('key'))}</td> : <td style={{height: 0, padding: 0}}/>).toJS()}</tr>).toJS()}
        </tbody>
      </table>
    </div>
  }
)

const main: DOMComponent = (sources: Sources) : Sinks => {
  const actions$ = intent(sources.DOM)
  const states$ = model(sources.props, actions$)
  const vnode$ = view(states$)

  const sinks: Sinks = {
    DOM: vnode$,
    props: states$
  }
  return sinks
}

export default (source: Sources) => isolate(main)(source)