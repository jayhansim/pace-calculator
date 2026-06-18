import { slotText } from 'slot-text'
import {
  DISTANCES,
  SPLIT_FIRST_LABEL,
  formatPace,
  formatTime,
  calcTotalTime,
  calcSpeed,
  calcCadence,
  calcStrideLength,
  generateSplits,
} from './calculator.js'
import { buildExportTable } from './export.js'
import { syncStateToUrl } from './urlParams.js'

export const state = {
  distanceKey: 'full',
  paceSeconds: 330,
  splitInterval: '1k',
  splitType: 'even',
  splitDeltaSec: 5,
  cadence: calcCadence(330),
}

export const SPLIT_DELTA_MIN = 0
export const SPLIT_DELTA_MAX = 30

let prevPaceSeconds = null

export function updateUI() {
  syncStateToUrl(state)

  const distKm = DISTANCES[state.distanceKey]
  const intervalKm = state.splitInterval === '1k' ? 1 : 5

  // Pace display
  const { min, sec } = formatPace(state.paceSeconds)
  const paceDirection = prevPaceSeconds == null ? undefined
    : state.paceSeconds > prevPaceSeconds ? 'up'
    : state.paceSeconds < prevPaceSeconds ? 'down'
    : undefined
  setSlotDigits('pace-min-display', min.padStart(2, '0'), paceDirection)
  setSlotDigits('pace-sec-display', sec, paceDirection)
  prevPaceSeconds = state.paceSeconds

  // Stats
  const totalSec = calcTotalTime(state.paceSeconds, distKm)
  setSlotStat('stat-time', formatTime(totalSec), totalSec)

  const speed = calcSpeed(state.paceSeconds)
  setSlotStat('stat-speed', speed, parseFloat(speed))

  setSlotStat('stat-cadence', String(state.cadence), state.cadence)

  const stride = Math.round(calcStrideLength(state.paceSeconds, state.cadence) * 100)
  setSlotStat('stat-stride', String(stride), stride)

  // Split adjustment row
  const adjustRow = document.getElementById('split-adjust')
  if (adjustRow) {
    if (state.splitType === 'even') {
      adjustRow.style.display = 'none'
    } else {
      adjustRow.style.display = 'flex'
      setText('split-adjust-primary', `${state.splitDeltaSec} sec ${state.splitType === 'neg' ? 'slower' : 'faster'}`)
      setText('split-adjust-secondary', `in first ${SPLIT_FIRST_LABEL[state.distanceKey]}`)
    }
    setDisabled('split-delta-minus', state.splitDeltaSec <= SPLIT_DELTA_MIN)
    setDisabled('split-delta-plus', state.splitDeltaSec >= SPLIT_DELTA_MAX)
  }

  // Split table body
  const splits = generateSplits(state.paceSeconds, distKm, intervalKm, state.splitType, state.distanceKey, state.splitDeltaSec)
  const tbody = document.getElementById('split-tbody')
  if (!tbody) return

  tbody.innerHTML = splits.map(row => `
    <tr class="${row.isHighlight ? 'row--highlight' : (state.splitInterval === '1k' && row.is5kMark ? 'row--5k-mark' : '')}">
      <td class="col-distance">
        <div class="td-distance-cell">
          <span class="td-primary">${row.distLabel}</span>
          <span class="td-secondary">${formatPace(row.lapPace).min}:${formatPace(row.lapPace).sec}min/km</span>
        </div>
      </td>
      <td class="col-lap">${row.chunkTime !== null ? formatTime(row.chunkTime) : ''}</td>
      <td class="col-split">${formatTime(row.cumTime)}</td>
    </tr>
  `).join('')

  buildExportTable(state, splits)
}

function setText(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

// Animation bookkeeping for slot-machine stat rolls — not part of app state.
const slotStats = new Map()

function setSlotStat(id, text, numericValue) {
  const el = document.getElementById(id)
  if (!el) return

  let entry = slotStats.get(id)
  if (!entry) {
    slotStats.set(id, { controller: slotText(el, text), prev: numericValue })
    return
  }
  if (numericValue === entry.prev) return

  entry.controller.set(text, { direction: numericValue > entry.prev ? 'up' : 'down', stagger: 30, bounce: 0.1 })
  entry.prev = numericValue
}

const slotDigits = new Map()

function setSlotDigits(id, text, direction) {
  const el = document.getElementById(id)
  if (!el) return

  let entry = slotDigits.get(id)
  if (!entry) {
    slotDigits.set(id, { controller: slotText(el, text), prevText: text })
    return
  }
  if (text === entry.prevText) return

  entry.controller.set(text, { ...(direction && { direction }), stagger: 30, bounce: 0.1 })
  entry.prevText = text
}

function setDisabled(id, disabled) {
  const el = document.getElementById(id)
  if (el) el.disabled = disabled
}
