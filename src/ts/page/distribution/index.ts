import {run} from '@cycle/run'
import {makeDOMDriver, DOMSource} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import '../../../css/page/distribution/index.css'
import switchPath from 'switch-path'
import {createBrowserHistory} from 'history'
import {makeRouterDriver} from 'cyclic-router'
import {makeHistoryDriver} from '@cycle/history'

import app from './app'
const history = createBrowserHistory({
  basename: '',
  forceRefresh: true
})
const sinks = {
  DOM: makeDOMDriver('.cycle-container'),
  HTTP: makeHTTPDriver(),
  Router: makeRouterDriver(history, switchPath),
  History: makeHistoryDriver(history)
}

run(app, sinks)