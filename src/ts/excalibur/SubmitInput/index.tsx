import { DOMComponent, Sources, Props } from '../types'
import xs, { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { makeDOMDriver, DOMSource } from '@cycle/dom'
import { VNode } from 'snabbdom/vnode'
import './styles.less'
import {Map, fromJS} from 'immutable'
interface Sinks {
  DOM: Stream<JSX.Element>,
  props: Stream<Map<string, any> | Props>
}
interface Actions {
  focus$: Stream<Symbol>,
  blur$: Stream<Symbol>,
  input$: Stream<string>,
  submit$: Stream<Symbol>,
  reset$: Stream<Symbol>
}
const focus = Symbol('Input.focus')
const blur = Symbol('Input.blur')
const submit = Symbol('Input.submit')
const reset = Symbol('Input.reset')

const intent = (dom: DOMSource) : Actions =>
  ({
    focus$: dom.select('.excalibur-input-input').events('focus').mapTo(focus),
    blur$: dom.select('.excalibur-input-input').events('blur').mapTo(blur),
    input$: dom.select('.excalibur-input-input').events('input').map((ev) =>  (ev.target as HTMLInputElement).value),
    submit$: xs.merge(dom.select('.excalibur-input form').events('submit').map(ev => ev.preventDefault()), dom.select('.excalibur-input-button-icon').events('click')).mapTo(submit),
    reset$: dom.select('.excalibur-input-reset-icon').events('click').mapTo(reset)
  })

const reducers = (actions : Actions) => {
  return xs.merge(
    actions.input$.map(
      (value) => (state: Map<string, any>) =>
        state.set('value', value)
    ),
    actions.focus$.map(
      () => (state: Map<string, any>) =>
        state.set('focus', true)
    ),
    actions.blur$.map(
      () => (state: Map<string, any>) =>
        state.set('focus', false)
    ),
    actions.submit$.map(
      () => (state: Map<string, any>) => {
        return state.set('focus', false).set('loading', 'true')
      }
    ),
    actions.reset$.map(
      () => (state: Map<string, any>) =>
        state.set('complete', false)
    )
  )
}

const model = (props: Stream<Props | Map<string, any>>, actions: Actions) : Stream<Props | Map<string, any>> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map(state => reducer$.fold((acc, reducer) => reducer(acc as Map<string, any>), state))
    .flatten()
    .remember()
  return state$
}

const view = (state$: Stream<Map<string, any>>) => state$.map(
  (state: Map<string, any>) => {
    return <div className="excalibur-input">
      <form className={`${state.get('focus') ? 'ready' : ''} ${state.get('loading') ? 'loading' : ''} ${state.get('complete') ? 'complete' : ''}`}>
        <div>
          <p className="excalibur-input-text">
            {state.get('label')}
          </p>
        </div>
        <div>
          <label htmlFor="submit" className={`excalibur-input-button-icon${state.get('value') ? ' active' : ''}`}>
            <i className="icon-more iconfont" style={{fontSize: '25px'}} />
          </label>
          <input type="text" className="excalibur-input-input excalibur-input-text" placeholder={state.get('placeholder') || 'Search'} autoComplete="off" value={state.get('value')}/>
          <input type="submit" className="excalibur-input-button" />
        </div>
        <div>
          <p className="excalibur-input-text excalibur-input-loader">
            {state.get('loadingText') || 'Just a moment'}
          </p>
        </div>
        <div>
          <span className="excalibur-input-reset-icon">
            <i className="icon-refresh iconfont" style={{fontSize: '15px'}} />
          </span>
          <p className="excalibur-input-text">
            {`${state.get('label')} ${state.get('value')}`}
          </p>
        </div>
      </form>
    </div>
  }
)

const main: DOMComponent = (sources: Sources) : Sinks => {
  const actions$ = intent(sources.DOM)
  const states$ = model(sources.props, actions$)
  const vnode$ = view(states$ as Stream<Map<string, any>>)

  const sinks: Sinks = {
    DOM: vnode$,
    props: states$
  }
  return sinks
}

export default (source: Sources) => isolate(main)(source)