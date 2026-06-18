import { DISTANCES, formatPace } from './calculator.js'

const PACE_DEFAULT = 330
const PACE_MIN = 120
const PACE_MAX = 779
const CADENCE_DEFAULT = 180
const CADENCE_MIN = 120
const CADENCE_MAX = 240

function parseDistance(raw) {
  return raw in DISTANCES ? raw : 'full'
}

function parsePace(raw) {
  if (!raw) return PACE_DEFAULT
  const parts = raw.split(':')
  if (parts.length !== 2) return PACE_DEFAULT

  const min = Number(parts[0])
  const sec = Number(parts[1])
  if (!Number.isInteger(min) || !Number.isInteger(sec) || sec < 0 || sec > 59) return PACE_DEFAULT

  const total = min * 60 + sec
  return total >= PACE_MIN && total <= PACE_MAX ? total : PACE_DEFAULT
}

function parseCadence(raw) {
  if (!raw) return CADENCE_DEFAULT
  const value = Number(raw)
  if (!Number.isInteger(value)) return CADENCE_DEFAULT
  return value >= CADENCE_MIN && value <= CADENCE_MAX ? value : CADENCE_DEFAULT
}

export function parseUrlParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    distanceKey: parseDistance(params.get('dist')),
    paceSeconds: parsePace(params.get('pace')),
    cadence: parseCadence(params.get('cad')),
  }
}

export function syncStateToUrl({ distanceKey, paceSeconds, cadence }) {
  const { min, sec } = formatPace(paceSeconds)
  const params = new URLSearchParams(window.location.search)
  params.set('dist', distanceKey)
  params.set('pace', `${min}:${sec}`)
  params.set('cad', String(cadence))

  const newSearch = `?${params.toString()}`
  if (newSearch !== window.location.search) {
    history.replaceState(null, '', newSearch + window.location.hash)
  }
}
