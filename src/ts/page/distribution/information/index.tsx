import xs, { Stream } from 'xstream'
import { fromJS, Map, List } from 'immutable'
import { DOMSource } from '@cycle/dom'
import { Sources, Props } from '../../../excalibur/types'
import { VNode } from 'snabbdom/vnode'

const view = (state$: Stream<Map<string, any>>) => state$.map((state) =>
  <div className="content" style={{
    position: 'absolute',
    left: '60%',
    top: '11%',
    color: 'white'
  }}>
    <h3>{'配送范围信息：'}</h3>
    <dl>
      <dt>{'百度VS美团'}</dt>
      <dd>{`领先/落后`}
        {state.getIn(['region_info', 'region', 0, 'baidu_with_meituan']) || <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>}
        {'%'}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {'数据更新时间'}
        {state.getIn(['region_info', 'region', 0, 'date']) || <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>}
      </dd>
      <dt>{'百度VS饿了么'}</dt>
      <dd>{`领先/落后`}
        {state.getIn(['region_info', 'region', 1, 'baidu_with_ele']) || <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>}
        {'%'}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {'数据更新时间'}
        {state.getIn(['region_info', 'region', 1, 'date']) || <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>}
      </dd>
    </dl>
  </div>
)

export default function information(source: Sources) {
  return {
    DOM: view(
           source.HTTP.select('getshopregionanalysisdetail')
            .flatten()
            .map(res => JSON.parse(res.text))
            .filter(x => !!x)
            .map((res: {'data': {}}) => fromJS(res.data))
            .startWith(Map())
         )
  }
}