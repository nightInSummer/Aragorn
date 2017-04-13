import { DOMComponent, Sources, Props } from '../types'
import xs, { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { VNode } from 'snabbdom/vnode'
import { Map } from 'immutable'
import { DOMSource } from '@cycle/dom'
import './styles.less'

interface Sinks {
  DOM: Stream<JSX.Element>,
  props: Stream<Map<string,any> | Props>
}
interface Actions {
  open$: Stream<string>,
  select$: Stream<string>
}
interface ClickEventTarget extends EventTarget {
  id: string
}
const intent = (dom: DOMSource) : Actions => ({
  open$: dom.select('.excalibur-menu-wrapper label').events('click').map(e => (e.target as ClickEventTarget).id),
  select$: dom.select('.exexcalibur-menu-wrapper li').events('click').map(e => (e.target as ClickEventTarget).id)
})

const reducers = (actions: Actions) => {
  console.log('hahaha');
  return xs.merge(
    actions.open$.map(
      (value) => (state: Map<string, any>): Map<string, any> => {
        return state.update('openKeys', x => x.includes(value) ? x.delete(x.indexOf(value)) : x.push(value))
      }
    ),
    actions.select$.map(
      (value) => (state: Map<string, any>): Map<string, any> => {
        return state.set('selected', value)
      }
    )
  )
}

const model = (props: Stream<Map<string, any> | Props>, actions: Actions) : Stream<Map<string, any> | Props> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map(state => reducer$.fold((acc: Map<string, any>, reducer) => reducer(acc), state))
    .flatten()
    .remember()
  return state$
}

const view = (state$: Stream<Map<string, any> | Props>) => state$.map(
  (state: Map<string, any>) => <div className="excalibur-menu-wrapper">
        {state.get('data').map(
          (item: Map<string, any>) => (
            <div>
              <label id={item.get('key')} className={state.get('openKeys').includes(item.get('key')) ? 'selected' : ''}>
                <i className={`icon-${item.get('icon')} iconfont`} />
                <span>{item.get('text')}</span>
                {item.get('children') && <div className={`excalibur-menu-arrow ${state.get('openKeys').includes(item.get('key')) ? 'selected' : ''}`} />}
                <div className={`excalibur-menu-bar ${state.get('openKeys').includes(item.get('key')) ? 'selected' : ''}`} />
                {item.get('children') && <div className={`excalibur-menu-content ${state.get('openKeys').includes(item.get('key')) ? 'selected' : ''}`}>
                  <ul>{item.get('children').map(
                      (child: Map<string, any>) => <li className={state.get('selected') === item.get('key') ? 'selected' : ''}>{child.get('text')}</li>
                    )}</ul>
                </div>}
              </label>
            </div>
          )
        ).toJS()}
      </div>
)

const main: DOMComponent = (sources: Sources) : Sinks => {
  const actions$ = intent(sources.DOM)
  const states$ = model(sources.props, actions$)
  const vnode$ = view(states$)
  return {
    DOM: vnode$,
    props: states$
  }
}

export default (source: Sources) => isolate(main)(source)