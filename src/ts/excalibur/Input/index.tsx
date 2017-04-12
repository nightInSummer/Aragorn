import { DOMComponent, Sources, Props } from '../types'
import xs, { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { DOMSource } from '@cycle/dom'
import { VNode } from 'snabbdom/vnode'
import './styles.less'

interface Sinks {
  DOM: Stream<JSX.Element>,
  props: Stream<Map<string, any> | Props>
}
interface Actions {
  input$: Stream<string>
}

const intent = (dom: DOMSource) : Actions =>
  ({
    input$: dom.select('.excalibur-simple-input').events('input').map((ev) =>  (ev.target as HTMLInputElement).value)
  })

const reducers = (actions : Actions) => actions.input$.map(
      (value) => (state: Map<string, any>) =>
        state.set('value', value)
    )

const model = (props: Stream<Props | Map<string, any>>, actions: Actions) : Stream<Props | Map<string, any>> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map((state: Props) => state.setIn(['style', 'position'], 'relative'))
    .map(state => reducer$.fold((acc, reducer) => reducer(acc as Map<string, any>), state))
    .flatten()
    .remember()
  return state$
}

const view = (state$: Stream<Map<string, any>>) => state$.map(
  (state: Map<string, any>) => {
    return <div style={{position: 'relative', ...state.get('style').toJS()}}>
      <input type="text" className="excalibur-simple-input" value={state.get('value')} required></input>
      <label htmlFor="text" className="excalibur-simple-input-label">{state.get('label')}</label>
      <div className="excalibur-simple-input-bar"></div>
    </div>
  }
)

const main: DOMComponent = (sources: Sources) : Sinks => {
  const actions$ = intent(sources.DOM)
  const state$ = model(sources.props, actions$)
  const vnode$ = view(state$  as Stream<Map<string, any>>)
  const sinks: Sinks = {
    DOM: vnode$,
    props: state$
  }
  return sinks
}

export default (sources: Sources) => isolate(main)(sources)