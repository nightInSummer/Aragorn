import {run} from '@cycle/run'
import {makeDOMDriver, DOMSource} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import '../../../css/page/distribution/index.css'
import switchPath from 'switch-path'
import {createHashHistory, createBrowserHistory} from 'history'
import {makeRouterDriver} from 'cyclic-router'
import {makeHistoryDriver } from "@cycle/history";
import {makeDataDriver} from "../../driver/dataDriver"
import app from './app'

const hashHistory = createHashHistory()
const browserHistory = createBrowserHistory({
  forceRefresh: true
})
const sinks = {
  DOM: makeDOMDriver('.cycle-container'),
  HTTP: makeHTTPDriver(),
  Router: makeRouterDriver(hashHistory, switchPath),
  History: makeHistoryDriver(browserHistory),
  MAP: makeDataDriver('.cycle-container', {type: 'map'})
}
run(app, sinks)