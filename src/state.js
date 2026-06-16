import {
  DISTANCES,
  formatPace,
  formatTime,
  calcTotalTime,
  calcSpeed,
  calcCadence,
  calcStrideLength,
  generateSplits,
} from './calculator.js'

export const state = {
  distanceKey: 'full',
  paceSeconds: 330,
  splitInterval: '1k',
  splitType: 'even',
  cadenceOverride: null,
}

export function updateUI() {
  const distKm = DISTANCES[state.distanceKey]
  const intervalKm = state.splitInterval === '1k' ? 1 : 5

  // Pace display
  const { min, sec } = formatPace(state.paceSeconds)
  setDigits('pace-min-display', min.padStart(2, '0'))
  setDigits('pace-sec-display', sec)

  // Stats
  const totalSec = calcTotalTime(state.paceSeconds, distKm)
  setText('stat-time', formatTime(totalSec))
  setText('stat-speed', calcSpeed(state.paceSeconds))
  const effectiveCadence = state.cadenceOverride ?? calcCadence(state.paceSeconds)
  setText('stat-cadence', effectiveCadence)
  setText('stat-stride', Math.round(calcStrideLength(state.paceSeconds, effectiveCadence) * 100))

  // Split table body
  const splits = generateSplits(state.paceSeconds, distKm, intervalKm, state.splitType, state.distanceKey)
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
}

function setText(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

function setDigits(id, digits) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = digits.split('').map(d => `<span class="pace-digit">${d}</span>`).join('')
}
