
import { state, updateUI, SPLIT_DELTA_MIN, SPLIT_DELTA_MAX } from './state.js'
import { initWheelPicker, getWheelPicker } from './wheelPicker.js'

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

function initOverlay(backdropId, openBtnId, onOpen) {
  const backdrop = document.getElementById(backdropId)
  const openBtn = document.getElementById(openBtnId)
  if (!backdrop) return
  const closeBtns = backdrop.querySelectorAll('[data-close-overlay]')

  function openOverlay() {
    backdrop.style.display = 'flex'
    onOpen?.()
    requestAnimationFrame(() => backdrop.classList.add('is-open'))
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

function initWheelPickers() {
  initWheelPicker(document.querySelector('[data-wheel="pace-minute"]'), { onChange: onPaceWheelChange })
  initWheelPicker(document.querySelector('[data-wheel="pace-second"]'), { onChange: onPaceWheelChange })
  initWheelPicker(document.querySelector('[data-wheel="cadence"]'), { onChange: onCadenceWheelChange })
}

function syncPaceWheels() {
  const minute = Math.floor(state.paceSeconds / 60)
  const second = state.paceSeconds % 60
  getWheelPicker('pace-minute').setValue(minute, { instant: true })
  getWheelPicker('pace-second').setValue(second, { instant: true })
}

function syncCadenceWheels() {
  getWheelPicker('cadence').setValue(state.cadence, { instant: true })
}

document.addEventListener('DOMContentLoaded', () => {
  initSegmented('distance-segmented', 'distanceKey')
  initSegmented('interval-segmented', 'splitInterval')
  initSegmented('split-type-segmented', 'splitType')
  initPaceInput()
  initSplitAdjust()
  initWheelPickers()
  initOverlay('overlay-backdrop', 'info-btn')
  initOverlay('pace-overlay-backdrop', 'pace-picker-toggle', syncPaceWheels)
  initOverlay('cadence-overlay-backdrop', 'cadence-picker-toggle', syncCadenceWheels)
  syncPaceWheels()
  syncCadenceWheels()
  updateUI()
})
