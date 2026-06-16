
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

const PACE_MIN_SECONDS = 60
const PACE_MAX_SECONDS = 99 * 60 + 59

function stepPace(deltaSeconds) {
  state.paceSeconds = Math.max(PACE_MIN_SECONDS, Math.min(PACE_MAX_SECONDS, state.paceSeconds + deltaSeconds))
  updateUI()
}

function initPaceInput() {
  document.getElementById('pace-min-minus')?.addEventListener('click', () => stepPace(-60))
  document.getElementById('pace-min-plus')?.addEventListener('click', () => stepPace(60))
  document.getElementById('pace-sec-minus')?.addEventListener('click', () => stepPace(-1))
  document.getElementById('pace-sec-plus')?.addEventListener('click', () => stepPace(1))
}

function initOverlay() {
  const backdrop = document.getElementById('overlay-backdrop')
  const openBtn = document.getElementById('info-btn')
  const closeBtns = document.querySelectorAll('[data-close-overlay]')

  function openOverlay() {
    backdrop.style.display = 'flex'
    requestAnimationFrame(() => backdrop.classList.add('is-open'))
  }
  function closeOverlay() {
    backdrop.classList.remove('is-open')
    backdrop.addEventListener('transitionend', () => { backdrop.style.display = 'none' }, { once: true })
  }

  openBtn?.addEventListener('click', openOverlay)
  closeBtns.forEach(btn => btn.addEventListener('click', closeOverlay))
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) closeOverlay() })
}

document.addEventListener('DOMContentLoaded', () => {
  initSegmented('distance-segmented', 'distanceKey')
  initSegmented('interval-segmented', 'splitInterval')
  initSegmented('split-type-segmented', 'splitType')
  initPaceInput()
  initOverlay()
  updateUI()
})
