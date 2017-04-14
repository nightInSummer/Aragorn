import Search from './search'
import Table from './table'
import Menu from './menu'
import { Sources } from '../../excalibur/types'
import { VNode } from 'snabbdom/vnode'
import { RequestOptions } from '@cycle/http'
import { div } from '@cycle/dom'
import xs, { Stream } from 'xstream'

export default function app(sources: Sources) {
  const search = Search(
    {
      DOM: sources.DOM,
      HTTP: sources.HTTP
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
    HTTP: search.HTTP,
    History: menu.History
  }
}