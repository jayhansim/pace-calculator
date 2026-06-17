import html2canvas from 'html2canvas'
import { formatPace, formatTime } from './calculator.js'

export function buildExportTable(state, splits) {
  const paceEl = document.getElementById('export-pace-label')
  const tbody = document.getElementById('export-tbody')
  if (!paceEl || !tbody) return

  const { min, sec } = formatPace(state.paceSeconds)
  paceEl.textContent = `Pace ${min}:${sec}`

  tbody.innerHTML = splits.map((row, i) => `
    <tr class="export-table__row${i % 2 === 1 ? ' export-table__row--alt' : ''}">
      <td class="export-table__dist">
        <span class="export-table__dist-label">${row.distLabel}</span>
        <span class="export-table__dist-pace">${formatPace(row.lapPace).min}:${formatPace(row.lapPace).sec}min</span>
      </td>
      <td class="export-table__time">${formatTime(row.cumTime)}</td>
    </tr>
  `).join('')
}

export function exportPNG() {
  const el = document.getElementById('export-table')
  if (!el) return

  html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  }).then(canvas => {
    const link = document.createElement('a')
    link.download = 'splits.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}

export function exportPDF() {
  window.print()
}
