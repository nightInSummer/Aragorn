import { run } from '@cycle/run'
import { makeDOMDriver, DOMSource } from '@cycle/dom'
import isolate from '@cycle/isolate'

import { DOMComponent, Sources } from '../types'
import xs, { Stream } from 'xstream'
import debounce from 'xstream/extra/debounce'
import {Map} from 'immutable'
import './styles.less'

interface Sinks {
  DOM: Stream<JSX.Element>,
  ACTIONS: Actions
}
interface Props {
  [x: string]: any
}
interface Actions {
  mousedown$: Stream<Symbol>,
  mousemove$: Stream<Event>,
  mouseleave$: Stream<Symbol>,
  mouseup$: Stream<Symbol>,
  mouseenter$: Stream<Symbol>
}
const mousedown = Symbol('Button.mousedown')
const mousemove = Symbol('Button.mousemove')
const mouseleave = Symbol('Button.mouseleave')
const mouseup = Symbol('Button.mouseup')
const mouseenter = Symbol('Button.mouseenter')



const intent = (dom: DOMSource) : Actions => ({
  mousedown$: dom.select('.button').events('mousedown').mapTo(mousedown),
  mousemove$: dom.select('.button').events('mousemove'),
  mouseleave$: dom.select('.button').events('mouseleave').mapTo(mouseleave),
  mouseup$: dom.select('.button').events('mouseup').mapTo(mouseup),
  mouseenter$: dom.select('.button').events('mouseenter').mapTo(mouseenter),
})

const reducers = (actions: Actions) => {
  const bendReducer$ = actions.mousemove$.map(
    (delta: any) => (state: Map<string, any>): Map<string, any> => {
      const boundingClientRect = delta.ownerTarget.getBoundingClientRect()
      const x = delta.clientX - boundingClientRect.left
      const y = delta.clientY - boundingClientRect.top
      const xc = boundingClientRect.width / 2
      const yc = boundingClientRect.height / 2
      const dx = x - xc
      const dy = y - yc
      return state.setIn(['style', '--rx'], `${dy/-1}deg`).setIn(['style', '--ry'], `${dx/10}deg`)
    }
  )
  const clickReducer$ = actions.mousedown$.map(
    () => (state: Map<string, any>): Map<string, any> => {
      return state.setIn(['style', '--tz'], '-35px')
    }
  )
  const upReducer$ = actions.mouseup$.map(
    () => (state: Map<string, any>): Map<string, any> => {
      return state.setIn(['style', '--tz'], '-12px')
    }
  )
  const leaveReducer$ = actions.mouseleave$.map(
    () => (state: Map<string, any>): Map<string, any> => {
      return state.set('style',  Map({
                    '--ty': '0px',
                    '--tz': '-12px',
                    '--rx': '0px',
                    '--ry': '0px'
                  }))
    }
  )
  return xs.merge(bendReducer$, clickReducer$, upReducer$, leaveReducer$)
}
const model = (props: Stream<Props>, actions: Actions) : Stream<Map<string, any>> => {
  const reducer$ = reducers(actions)
  const state$ = props
    .map(
          (props : Props) =>
            Map({
            ...props,
            style: Map({
                    '--ty': '0px',
                    '--tz': '-12px',
                    '--rx': '0px',
                    '--ry': '0px'
                  })
          })
    )
    .map(state => reducer$.fold((acc, reducer) => reducer(acc), state))
    .flatten()
  return state$
}

const view = (state$: Stream<Map<string, any>>) => state$.map(
  (state: Map<string, any>) => <a className="button" style={state.get('style').toJS()} title={state.get('text')} />
)

const main: DOMComponent = (sources: Sources ) : Sinks => {
  const actions$ = intent(sources.DOM)
  const states$ = model(sources.props, actions$)
  const vnode$ = view(states$)

  const sinks: Sinks = {
    DOM: vnode$,
    ACTIONS: actions$
  }

  return sinks
}

export default (sources: Sources) => isolate(main)(sources)
