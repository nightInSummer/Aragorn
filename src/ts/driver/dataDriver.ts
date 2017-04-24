import { adapt } from '@cycle/run/lib/adapt'
import { Map, List } from 'immutable'
import xs, { Stream } from 'xstream'
const {toString, isPlainObject, isArray, isString, map} = require('lodash')
export interface DataOptions {
  type: 'map' | 'chart'
}
const BMap = (<any>window).BMap
const BMapLib = (<any>window).BMapLib

function _transferPoint(point: any) {
  let x, y
  if (isPlainObject(point)) {
    x = point.x || point.longitude || point.lng
    y = point.y || point.latitude || point.lat
  }
  if (isArray(point)) {
    x = point[0]
    y = point[1]
  }
  if (isString(point)) {
    if (point.indexOf(',') === -1) {
      throw new Error(`what is this fucking shit: ${point}`)
    }
    x = point.split(',')[0]
    y = point.split(',')[1]
  }
  if (point instanceof BMap.Point) {
    return point
  }
  if (point instanceof BMap.Pixel) {
    let merca = new BMap.MercatorProjection().pointToLngLat(point)
    return new BMap.Point(merca.lng, merca.lat) 
  }
  if (!x || !y) {
    throw new Error(`Invalid point ${point}`)
  }
  if ((x + '').split('.')[0].length > 3) {
    // 墨卡托
    let merca = new BMap.MercatorProjection().pointToLngLat(new BMap.Pixel(x, y))
    return new BMap.Point(merca.lng, merca.lat)
  } else {
    // 经纬度
    return new BMap.Point(x, y)
  }
}

function _addPolygon(polygon: Map<string, any>, data: Map<string, any>, instance: any, overlayMap: {string?: any}) {
  let polygonOptions = polygon.get('polygonOptions') || data.get('polygonOptions')
  let labelOptions = polygon.get('labelOptions') || data.get('labelOptions')
  let path = polygon.get('path').map(
      (point: Map<string, any>) => _transferPoint(point.toJS())
    )
    path = path.toJS()
  let overlay = new BMap.Polygon(path, polygonOptions && polygonOptions.toJS())
  let label = new BMap.Label(polygon.get('name'), {
    position: BMapLib.GeoUtils.getCenterOfGravityPoint(path)
  });
  label.setStyle(labelOptions && labelOptions.toJS());
  overlayMap[polygon.get('id')] = [overlay, label]
  instance.addOverlay(overlay)
  instance.addOverlay(label)
}

function ___removePolygon(overlay: any, instance: any) {
  overlay.forEach(
    (item: any) => instance.removeOverlay(item)
  )
}

function _setViewport(vieport: List<any>, instance: any) {
   instance.setViewport(
      vieport.map(
        (polygon: Map<string, any>) => polygon.get('path').map((point: Map<string, any>) => _transferPoint(point.toJS()))
      ).flatten().toJS()
    )
}

function _generateContent(content: Map<string, any>): string {
  return `<div>${content}</div>`
}

function _addPoint(point: Map<string, any>, data: Map<string, any>, instance: any, overlayMap: {string?: any}) {
  let pointOptions = point.get('options') || data.get('pointOptions')
  let overlay = new BMap.Marker(_transferPoint(point.get('point')), pointOptions.toJS())
  point.get('information') && overlay.addEventListener('click', (e: any) => {
    let p = e.target
    let point = new BMap.Point(p.getPosition().lng, p.getPosition().lat)
    let information = new BMap.InfoWindow(_generateContent(point.get('information')), data.get('inforOptions'))
    instance.openInfoWindow(information, point)
  })
  overlayMap[point.get('id')] = overlay
  instance.addOverlay(overlay)
}

export function makeDataDriver(selector: string, options: DataOptions) {
  let myMap: any = null
  let myChart: any = null
  let echartsOptions: any = {}
  let prevState: Map<string, any> = null
  let overlayMap: {string?: Array<any>} = {}
  let div = document.createElement('div')
  const el = document.querySelector(selector)
  if (!el) {
    throw new Error(`No element '${selector}' found`)
  }
  if (!BMap) {
    throw new Error(`Where is your BMap?`)
  }
  function create(data: Map<string, any>) {
    if (!data.get('hidden')) {
      const echarts = require('echarts/lib/echarts')
      div.id = data.get('id')
      div.className = data.get('className')
      el.appendChild(div)
      myChart = echarts.init(div)
      if (options.type === 'map') {
        require('echarts/extension/bmap/bmap.js')
        echartsOptions = {
          bmap: {
            center: [116.40, 40.04],
            zoom: 10,
            roam: true,
            mapStyle: {
              'styleJson': [
                {
                  'featureType': 'water',
                  'elementType': 'all',
                  'stylers': {
                    'color': '#031628'
                  }
                },
                {
                  'featureType': 'land',
                  'elementType': 'geometry',
                  'stylers': {
                    'color': '#000102'
                  }
                },
                {
                  'featureType': 'highway',
                  'elementType': 'all',
                  'stylers': {
                    'visibility': 'off'
                  }
                },
                {
                  'featureType': 'arterial',
                  'elementType': 'geometry.fill',
                  'stylers': {
                    'color': '#000000'
                  }
                },
                {
                  'featureType': 'arterial',
                  'elementType': 'geometry.stroke',
                  'stylers': {
                    'color': '#0b3d51'
                  }
                },
                {
                  'featureType': 'local',
                  'elementType': 'geometry',
                  'stylers': {
                    'color': '#000000'
                  }
                },
                {
                  'featureType': 'railway',
                  'elementType': 'geometry.fill',
                  'stylers': {
                    'color': '#000000'
                  }
                },
                {
                  'featureType': 'railway',
                  'elementType': 'geometry.stroke',
                  'stylers': {
                    'color': '#08304b'
                  }
                },
                {
                  'featureType': 'subway',
                  'elementType': 'geometry',
                  'stylers': {
                    'lightness': -70
                  }
                },
                {
                  'featureType': 'building',
                  'elementType': 'geometry.fill',
                  'stylers': {
                    'color': '#000000'
                  }
                },
                {
                  'featureType': 'all',
                  'elementType': 'labels.text.fill',
                  'stylers': {
                    'color': '#857f7f'
                  }
                },
                {
                  'featureType': 'all',
                  'elementType': 'labels.text.stroke',
                  'stylers': {
                    'color': '#000000'
                  }
                },
                {
                  'featureType': 'building',
                  'elementType': 'geometry',
                  'stylers': {
                    'color': '#022338'
                  }
                },
                {
                  'featureType': 'green',
                  'elementType': 'geometry',
                  'stylers': {
                    'color': '#062032'
                  }
                },
                {
                  'featureType': 'boundary',
                  'elementType': 'all',
                  'stylers': {
                    'color': '#465b6c'
                  }
                },
                {
                  'featureType': 'manmade',
                  'elementType': 'all',
                  'stylers': {
                    'color': '#022338'
                  }
                },
                {
                  'featureType': 'label',
                  'elementType': 'all',
                  'stylers': {
                    'visibility': 'off'
                  }
                }
              ]
            }
          },
          series: []
        }
      myChart.setOption(echartsOptions)
      myMap = myChart.getModel().getComponent('bmap').getBMap()
      if (data.get('polygonList')) {
        data.get('polygonList').map(
          (polygon: Map<string, any>) => {
            _addPolygon(polygon, data, myMap, overlayMap)
          }
        )
        _setViewport(data.get('polygonList'), myMap)
      }
      if (data.get('pointList')) {
        data.get('pointList').map(
          (point: Map<string, any>) => {
            _addPoint(point, data, myMap, overlayMap)
          }
        )
      }
      }
    }
    prevState = data
  }
  function update(data: Map<string, any>) {
    if (myMap === null) {
      create(data)
    }
    div.className = data.get('hidden') ? "aragorn-main-section map hidden" : data.get('className')
    if (data.get('polygonList') !== prevState.get('polygonList')) {
        if (!data.get('polygonList')) {
          map(overlayMap, (item: Array<any>, key: string) => ___removePolygon(item, myMap))
          overlayMap = {}
        } else {
          let midMap = {}
          data.get('polygonList').forEach(
            (polygon: Map<string, any>) => {
              if (overlayMap[polygon.get('id')]) {
                midMap[polygon.get('id')] = overlayMap[polygon.get('id')]
                delete overlayMap[polygon.get('id')]
              } else {
                _addPolygon(polygon, data, myMap, midMap)
              }
            }
          )
          _setViewport(data.get('polygonList'), myMap)
          map(overlayMap, (item: Array<any>, key: string) => ___removePolygon(item, myMap))
          overlayMap = midMap
        }
    }
    prevState = data
  }

  return function dataDriver(sink$: Stream<Map<string, any>>) {
    sink$.take(1).addListener({
      next: create
    })
    sink$.addListener({
      next: update
    })
    return xs.empty()
  }
}