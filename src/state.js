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
}

export function updateUI() {
  const distKm = DISTANCES[state.distanceKey]
  const intervalKm = state.splitInterval === '1k' ? 1 : 5

  // Pace display
  const { min, sec } = formatPace(state.paceSeconds)
  const paceMin = document.getElementById('pace-min')
  const paceSec = document.getElementById('pace-sec')
  if (paceMin && document.activeElement !== paceMin) paceMin.value = min
  if (paceSec && document.activeElement !== paceSec) paceSec.value = sec

  // Stats
  const totalSec = calcTotalTime(state.paceSeconds, distKm)
  setText('stat-time', formatTime(totalSec))
  setText('stat-speed', calcSpeed(state.paceSeconds))
  setText('stat-cadence', calcCadence(state.paceSeconds))
  setText('stat-stride', Math.round(calcStrideLength(state.paceSeconds) * 100))

  // Split table body
  const splits = generateSplits(state.paceSeconds, distKm, intervalKm, state.splitType)
  const tbody = document.getElementById('split-tbody')
  if (!tbody) return

  tbody.innerHTML = splits.map(row => `
    <tr class="${row.isHighlight ? 'row--highlight' : ''}">
      <td class="col-distance">
        <div class="td-distance-cell">
          <span class="td-primary">${row.distLabel}</span>
          <span class="td-secondary">${formatPace(row.lapPace).min}:${formatPace(row.lapPace).sec}/km</span>
        </div>
      </td>
      <td class="col-lap td-primary">${formatTime(row.lapTime)}</td>
      <td class="col-split td-primary">${formatTime(row.cumTime)}</td>
    </tr>
  `).join('')
}

function setText(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}
