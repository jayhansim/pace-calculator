import '@fontsource-variable/geist'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/typography.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/landing.css'

import { state, updateUI } from './state.js'

function initSegmented(containerId, stateKey) {
  const container = document.getElementById(containerId)
  if (!container) return
  container.querySelectorAll('.segmented__option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.segmented__option').forEach(o => o.classList.remove('segmented__option--selected'))
      opt.classList.add('segmented__option--selected')
      state[stateKey] = opt.dataset.value
      updateUI()
    })
  })
}

function initPaceInput() {
  const paceMin = document.getElementById('pace-min')
  const paceSec = document.getElementById('pace-sec')
  const btnMinus = document.getElementById('pace-minus')
  const btnPlus = document.getElementById('pace-plus')

  function clampAndUpdate() {
    let m = parseInt(paceMin.value, 10) || 0
    let s = parseInt(paceSec.value, 10) || 0
    if (s >= 60) { m += Math.floor(s / 60); s = s % 60 }
    if (s < 0) { m = Math.max(0, m - 1); s = 59 }
    m = Math.max(0, Math.min(99, m))
    s = Math.max(0, Math.min(59, s))
    state.paceSeconds = m * 60 + s
    paceMin.value = String(m)
    paceSec.value = String(s).padStart(2, '0')
    updateUI()
  }

  paceMin?.addEventListener('blur', clampAndUpdate)
  paceSec?.addEventListener('blur', clampAndUpdate)

  paceMin?.addEventListener('keydown', e => { if (e.key === 'Enter') clampAndUpdate() })
  paceSec?.addEventListener('keydown', e => { if (e.key === 'Enter') clampAndUpdate() })

  btnMinus?.addEventListener('click', () => {
    state.paceSeconds = Math.max(60, state.paceSeconds - 1)
    updateUI()
  })

  btnPlus?.addEventListener('click', () => {
    state.paceSeconds = Math.min(99 * 60 + 59, state.paceSeconds + 1)
    updateUI()
  })
}

function initOverlay() {
  const backdrop = document.getElementById('overlay-backdrop')
  const openBtn = document.getElementById('info-btn')
  const closeBtns = document.querySelectorAll('[data-close-overlay]')

  openBtn?.addEventListener('click', () => backdrop?.classList.add('is-open'))
  closeBtns.forEach(btn => btn.addEventListener('click', () => backdrop?.classList.remove('is-open')))
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('is-open') })
}

document.addEventListener('DOMContentLoaded', () => {
  initSegmented('distance-segmented', 'distanceKey')
  initSegmented('interval-segmented', 'splitInterval')
  initSegmented('split-type-segmented', 'splitType')
  initPaceInput()
  initOverlay()
  updateUI()
})
