import { DOMComponent, Sources, Props } from '../types'
import { Stream } from 'xstream'
import isolate from '@cycle/isolate'
import {div, svg, h} from '@cycle/dom'
import { VNode } from 'snabbdom/vnode'
import './styles.less'
interface Sinks {
  DOM: Stream<VNode>,
}
const main: DOMComponent = (sources: Sources) : Sinks => {
  let path = "M0 ,90 L250 ,90 Q257 ,60 262 ,87 T267 ,95 270 ,88 273 ,92 t6 ,35 7 ,-60 T290 ,127 297 ,107 s2 ,-11 10 ,-10 1 ,1 8 ,-10 T319 ,95 c6 ,4 8 ,-6 10 ,-17 s2 ,10 9 ,11 h210 "
  const zoom = (scale: number) => path.split(' ').map((item) => item.replace(/[0-9]+/g, (i) => parseInt(i) / scale + ``)).join(' ')
  const vnode$ = sources.props.map(
    (props: Props) =>
      div('.excalibur-loading', [
        svg({style: {width: `${548 / (props['scale'] || 1)}px`, height: `${326 / (props['scale'] || 1)}px`}}, [
          h('path', {
            attrs: {
              "stroke": props['color'] || "rgba(0,155,155,1)",
              "fill": "none",
              "stroke-width": props['stroke'] || 1,
              "stroke-linejoin": "round",
              "d": zoom(props['scale'] || 1)
            }
          })]
        )]
      )
  )
  return {
    DOM: vnode$
  }
}

export default (source: Sources) => isolate(main)(source)