import Search from './search'
import Table from './table'
import Menu from './menu'
import Information from './information'
import Toolbar from './toolbar'
import { Sources } from '../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import { RequestOptions } from '@cycle/http'
import { div } from '@cycle/dom'
import xs, { Stream } from 'xstream'
import { fromJS, List } from 'immutable'
const { map, transform, findIndex } = require('lodash')
export default function app(sources: Sources) {
  const props$ = xs.of(fromJS({
    id: 'overallscopeMap',
    className: 'aragorn-main-section map fadeIn'
  }))
  const routes$ = sources.Router.define({
    '/': (sources: Sources) => {
      const search = Search(
        {
          DOM: sources.DOM,
          HTTP: sources.HTTP,
          Router: sources.Router
        }
      )
      const table = Table(
        {
          DOM: sources.DOM,
          HTTP: sources.HTTP
        }
      )
      const menu = Menu(
        {
          DOM: sources.DOM,
          History: sources.History
        }
      )
      return {
        DOM: xs.combine(search.DOM, table.DOM, menu.DOM).map(vtree => div(vtree)),
        MAP: xs.of(fromJS({
          hidden: true
        })),
        History: menu.History,
        HTTP: xs.merge(search.HTTP, table.HTTP),
        Router: xs.merge(search.Router, table.Router)
      }
    },
    '/overallscope': (sources: Sources) => {
      const search = Search(
        {
          DOM: sources.DOM,
          HTTP: sources.HTTP,
          Router: sources.Router
        }
      )
      const menu = Menu(
        {
          DOM: sources.DOM,
          History: sources.History
        }
      )
      return {
        DOM: xs.combine(search.DOM, menu.DOM).map(vtree => div(vtree)),
        MAP: props$.map(
          state => sources.HTTP.select('getwholeshopregionanalysis').flatten().map(res => JSON.parse(res.text))
            .filter(x => !!x)
            .map(
            res =>
              state.set('polygonList', fromJS(map(res.data.list.aoi_list, (item: { aoiid: string, aoiname: string, map_coords: string }) =>
                transform(item, (res: { id: string, name: string, path: Array<{ longitude: Number, latitude: Number }> }, n: Number | string, key: string) => {
                  if (key == 'aoiid') res.id = n as string
                  if (key == 'aoiname') res.name = n as string
                  if (key == 'map_coords') res.path = JSON.parse(n as string)
                })
              )))
            )
            .startWith(state)
        )
          .flatten(),
        History: menu.History,
        HTTP: search.HTTP,
        Router: xs.never()
      }
    },
    '/detail': (sources: Sources) => {
      const toolbar = Toolbar(
        {
          DOM: sources.DOM,
          HTTP: sources.HTTP
        }
      )
      const menu = Menu(
        {
          DOM: sources.DOM,
          History: sources.History
        }
      )
      const information = Information({
        DOM: sources.DOM,
        HTTP: sources.HTTP
      })
      return {
        DOM: xs.combine(toolbar.DOM, information.DOM, menu.DOM).map(vtree => div(vtree)),
        MAP: props$.map(
          state => sources.HTTP.select('getshopregionanalysisdetail').flatten().map(res => JSON.parse(res.text))
            .filter(x => !!x)
            .map(
            res => toolbar.props.map(
              (props: Map<string, any>) => 
              {
                let target = res.data.region_map[findIndex(res.data.region_map, (item: { source: string, date: string, delivery_range: string }) =>
                item.source === props.get('type') && item.date === props.get('time')
              )]
                return state.set('polygonList', target ? fromJS(
                [{
                  id: target.shopid,
                  name: target.shop_name,
                  path: JSON.parse(target.delivery_range)
                }]
              ) : List([])).set('className', 'aragorn-main-section map left fadeIn')
              }
            )
            )
            .flatten()
            .startWith(state.set('className', 'aragorn-main-section map left fadeIn'))
        )
          .flatten(),
        History: menu.History,
        HTTP: xs.never(),
        Router: xs.never()
      }
    }
  }),
    page$ = routes$.map(({ path, value }: {path: string, value: Function}) => value({...sources, Router: sources.Router.path(path)})).remember()
  return {
    DOM: page$.map((page: {DOM: any}) => page.DOM).flatten(),
    HTTP: page$.map((page: {HTTP: any}) => page.HTTP).flatten(),
    History: page$.map((page: {History: any}) => page.History).flatten(),
    MAP: page$.map((page: {MAP: any}) => page.MAP).flatten(),
    Router: page$.map((page: {Router: any}) => page.Router).flatten()
  }
}