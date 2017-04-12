import { DOMComponent, Sources, Props } from '../types'
import xs, { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { VNode } from 'snabbdom/vnode'
import { Map } from 'immutable'
import { DOMSource } from '@cycle/dom'
import './styles.less'

interface Sinks {
  DOM: Stream<JSX.Element>,
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
  return xs.merge(
    actions.open$.map(
      () => (state: Map<string, any>): Map<string, any> => {
        return state.update('openKeys', x => x.push())
      }
    )
  )
}

const model = (props: Stream<Props>, actions: Actions) : Stream<Map<string, any>> => {

}

const main: DOMComponent = (sources: Sources) : Sinks => {
  const vnode$ = sources.props.map(
    (props: Props) =>
      <div className="excalibur-menu-wrapper">
        {props.get('data').map(
          (item: Map<string, any>) => (
            <div>
              <label id={item.get('key')}>
                <i className={`icon-${item.get('icon')} iconfont`} />
                <span>{item.get('text')}</span>
                {item.get('children') && <div className="excalibur-menu-arrow" />}
                <div className="excalibur-menu-bar" />
                {item.get('children') && <div className="excalibur-menu-content">
                  <ul>{item.get('children').map(
                      (child: Map<string, any>) => <li>{child.get('text')}</li>
                    )}</ul>
                </div>}
              </label>
            </div>
          )
        ).toJS()}
      </div>
  ) 
  return {
    DOM: vnode$
  }
}

export default (source: Sources) => isolate(main)(source)