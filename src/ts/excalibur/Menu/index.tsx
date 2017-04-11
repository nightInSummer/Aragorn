import { DOMComponent, Sources, Props } from '../types'
import { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import { VNode } from 'snabbdom/vnode'
import { Map } from 'immutable'
import './styles.less'
interface Sinks {
  DOM: Stream<JSX.Element>,
}
const main: DOMComponent = (sources: Sources) : Sinks => {
  const vnode$ = sources.props.map(
    (props: Props) =>
      <div className="excalibur-menu-wrapper">
        {props.get('data').map(
          (item: Map<string, any>) => (
            <div>
              <input id={item.get('key')} name="radio" type="radio" />
              <label htmlFor={item.get('key')}>
                <i className={`icon-${item.get('icon')} iconfont`} />
                <span>{item.get('text')}</span>
                <div className="excalibur-menu-arrow" />
                <div className="excalibur-menu-bar" />
                <div className="excalibur-menu-content">
                  <ul>{item.get('children') && item.get('children').map(
                      (child: Map<string, any>) => <li>{child.get('text')}</li>
                    )}</ul>
                </div>
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