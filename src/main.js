
import { state, updateUI, SPLIT_DELTA_MIN, SPLIT_DELTA_MAX } from './state.js'
import { initWheelPicker, getWheelPicker } from './wheelPicker.js'
import { exportPNG, exportPDF } from './export.js'
import { parseUrlParams } from './urlParams.js'
import particlesScriptUrl from 'particles.js/particles.js?url'
import particlesConfig from './particlesConfig.js'
import './styles/export.css'

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

function setSegmentedSelection(containerId, value) {
  const container = document.getElementById(containerId)
  if (!container) return
  container.querySelectorAll('.segmented__option').forEach(opt => {
    opt.classList.toggle('segmented__option--selected', opt.dataset.value === value)
  })
}

const PACE_MIN_SECONDS = 2 * 60
const PACE_MAX_SECONDS = 12 * 60 + 59

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

function stepSplitDelta(delta) {
  state.splitDeltaSec = Math.max(SPLIT_DELTA_MIN, Math.min(SPLIT_DELTA_MAX, state.splitDeltaSec + delta))
  updateUI()
}

function initSplitAdjust() {
  document.getElementById('split-delta-minus')?.addEventListener('click', () => stepSplitDelta(-1))
  document.getElementById('split-delta-plus')?.addEventListener('click', () => stepSplitDelta(1))
}

function initParticles() {
  if (!document.getElementById('particles-js')) return
  // particles.js relies on `arguments.callee`, which throws under the strict
  // mode that ES module imports run in — load it as a classic script instead.
  const script = document.createElement('script')
  script.src = particlesScriptUrl
  script.onload = () => window.particlesJS?.('particles-js', particlesConfig)
  document.body.appendChild(script)
}

function initOverlay(backdropId, openBtnId, onOpen) {
  const backdrop = document.getElementById(backdropId)
  const openBtn = document.getElementById(openBtnId)
  if (!backdrop) return
  const closeBtns = backdrop.querySelectorAll('[data-close-overlay]')

  function openOverlay() {
    backdrop.style.display = 'flex'
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open')
      requestAnimationFrame(() => onOpen?.())
    })
  }
  function closeOverlay() {
    backdrop.classList.remove('is-open')
    backdrop.addEventListener('transitionend', () => { backdrop.style.display = 'none' }, { once: true })
  }

  openBtn?.addEventListener('click', openOverlay)
  closeBtns.forEach(btn => btn.addEventListener('click', closeOverlay))
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeOverlay() })
}

function onPaceWheelChange() {
  const minute = getWheelPicker('pace-minute').value
  const second = getWheelPicker('pace-second').value
  state.paceSeconds = minute * 60 + second
  updateUI()
}

function onCadenceWheelChange(value) {
  state.cadence = value
  updateUI()
}

function safeInitWheelPicker(el, opts) {
  try {
    initWheelPicker(el, opts)
  } catch (err) {
    console.error('Failed to init wheel picker', el?.dataset?.wheel, err)
  }
}

function initWheelPickers() {
  safeInitWheelPicker(document.querySelector('[data-wheel="pace-minute"]'), { onChange: onPaceWheelChange })
  safeInitWheelPicker(document.querySelector('[data-wheel="pace-second"]'), { onChange: onPaceWheelChange })
  safeInitWheelPicker(document.querySelector('[data-wheel="cadence"]'), { onChange: onCadenceWheelChange })
}

function syncPaceWheels() {
  const minute = Math.floor(state.paceSeconds / 60)
  const second = state.paceSeconds % 60
  getWheelPicker('pace-minute')?.setValue(minute, { instant: true })
  getWheelPicker('pace-second')?.setValue(second, { instant: true })
}

function syncCadenceWheels() {
  getWheelPicker('cadence')?.setValue(state.cadence, { instant: true })
}

document.addEventListener('DOMContentLoaded', () => {
  const { distanceKey, paceSeconds, cadence } = parseUrlParams()
  state.distanceKey = distanceKey
  state.paceSeconds = paceSeconds
  state.cadence = cadence

  initSegmented('distance-segmented', 'distanceKey')
  initSegmented('interval-segmented', 'splitInterval')
  initSegmented('split-type-segmented', 'splitType')
  setSegmentedSelection('distance-segmented', state.distanceKey)
  initPaceInput()
  initSplitAdjust()
  initWheelPickers()
  initOverlay('overlay-backdrop', 'info-btn')
  initOverlay('pace-overlay-backdrop', 'pace-picker-toggle', syncPaceWheels)
  initOverlay('cadence-overlay-backdrop', 'cadence-picker-toggle', syncCadenceWheels)
  initParticles()
  updateUI()

  document.getElementById('btn-export-png')?.addEventListener('click', exportPNG)
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF)
})
