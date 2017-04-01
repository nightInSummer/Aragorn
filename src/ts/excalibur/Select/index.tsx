import { DOMComponent, Sources, Props } from '../types'
import xs, { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { makeDOMDriver, DOMSource } from '@cycle/dom'
import { VNode } from 'snabbdom/vnode'
import './styles.less'
import {Map, fromJS} from 'immutable'
interface Sinks {
  DOM: Stream<JSX.Element>,
  VALUE: Stream<Object>
}
interface Actions {
  select$: Stream<Map<string, string>>,
  open$: Stream<Symbol>,
  search$: Stream<string>
}
const open = Symbol('Select.open')

const intent = (dom: DOMSource) : Actions =>
  ({
    select$: dom.select('.option').events('click').map((ev : MouseEvent) => Map({value: (ev.toElement as HTMLLIElement).title, text: (ev.toElement as HTMLLIElement).textContent})),
    open$: xs.merge(dom.select('.excalibur-select-arrow').events('click'), dom.select('.excalibur-select-title').events('click')).mapTo(open),
    search$: dom.select('.input').events('input').map((ev) =>  (ev.target as HTMLInputElement).value).startWith('')
  })

const reducers = (actions : Actions) => {
  return xs.merge(
    actions.select$.map(
      (ev) => (state: Map<string, any>) : Map<string, any> => state.get('multiple') ? state.update('value', x => x.push(ev)).set('open', state.get('multiple')) : state.set('value', ev).set('open', state.get('multiple'))
    ),
    actions.open$.map(
      () => (state: Map<string, any>) =>
        state.set('open', !state.get('open'))
    ),
    actions.search$.map(
      (value) => (state: Map<string, any>) =>
        state.set('search', value)
    )
  )
}

const model = (props: Stream<Props>, actions: Actions) : Stream<Map<string, any>> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map(
      (props : Props) =>
        props.set('open', false)
    )
    .map(state => reducer$.fold((acc, reducer) => reducer(acc), state))
    .flatten()
  return state$
}

const view = (state$: Stream<Map<string, any>>) => state$.map(
  (state: Map<string, any>) =>
    <ul className={`excalibur-select ${state.get('open') ? 'excalibur-select-on' : ''} ${state.get('search') && 'excalibur-animate-search'}`}>
      <li>
        <span className={`excalibur-select-arrow icon-more iconfont ${state.get('open') ? 'excalibur-select-on' : ''}`} style={{background: state.getIn(['style', 'background']), color: state.getIn(['style', 'color'])}}>
        </span>
        <span className="excalibur-select-title" style={{background: state.getIn(['style', 'background']), color: state.getIn(['style', 'color']), width: state.getIn(['style', 'width'])}}>
          {`${state.get('label')} ${state.getIn(['value', 'text']) || ''}`}
        </span>
        <span className="excalibur-select-search" style={{background: state.getIn(['style', 'background']), color: state.getIn(['style', 'color']), width: state.getIn(['style', 'width']), zIndex: state.get('open') ? 2 : -2}}>
          <input className="input" style={{color: '#FFF'}} value={state.get('search')} placeholder='Search'/>
        </span>
        <ul style={{zIndex: 3}}>
          {state.get('data').map((x: Map<string, string>) => <li title={x.get('value')} className={`option ${state.get('multiple') ? state.getIn(['value', 'value']).includes(x.get('value')) : state.getIn(['value', 'value']) === x.get('value') ? 'selected' : ''} ${x.get('text').includes(state.get('search')) ? 'excalibur-animate-fadein' : 'excalibur-animate-fadeout'}`}>{x.get('text')}</li>).toJS()}
        </ul>
      </li>
    </ul>
)

const main: DOMComponent = (sources: Sources) : Sinks => {
  const actions$ = intent(sources.DOM)
  const states$ = model(sources.props, actions$)
  const vnode$ = view(states$)

  const sinks: Sinks = {
    DOM: vnode$,
    VALUE: states$.map(state => state.get('value'))
  }
  return sinks
}

export default (source: Sources) => isolate(main)(source)