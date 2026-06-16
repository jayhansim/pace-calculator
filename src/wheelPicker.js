const registry = new Map()

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function initWheelPicker(el, { onChange } = {}) {
  const key = el.dataset.wheel
  const min = Number(el.dataset.min)
  const max = Number(el.dataset.max)
  const digits = String(max).length
  const viewport = el.querySelector('.wheel-picker__viewport')
  const track = el.querySelector('.wheel-picker__track')
  const rowHeight = parseFloat(getComputedStyle(viewport).getPropertyValue('--wheel-row-h'))

  const rows = []
  const fragment = document.createDocumentFragment()
  for (let value = min; value <= max; value++) {
    const row = document.createElement('div')
    row.className = 'wheel-picker__row'
    row.textContent = String(value).padStart(digits, '0')
    row.dataset.value = String(value)
    row.setAttribute('role', 'option')
    row.setAttribute('aria-selected', 'false')
    fragment.appendChild(row)
    rows.push(row)
  }
  track.appendChild(fragment)

  let currentValue = min
  let centerRow = null

  function markCenter(value) {
    if (centerRow) {
      centerRow.classList.remove('wheel-picker__row--center')
      centerRow.setAttribute('aria-selected', 'false')
    }
    centerRow = rows[value - min]
    centerRow.classList.add('wheel-picker__row--center')
    centerRow.setAttribute('aria-selected', 'true')
    currentValue = value
  }

  function scrollToValue(value, { instant = false } = {}) {
    const top = (value - min) * rowHeight
    if (instant) {
      viewport.scrollTop = top
    } else {
      viewport.scrollTo({ top, behavior: 'smooth' })
    }
  }

  let settleTimer = null
  viewport.addEventListener('scroll', () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      const index = clamp(Math.round(viewport.scrollTop / rowHeight), 0, max - min)
      const value = min + index
      markCenter(value)
      onChange?.(value)
    }, 120)
  })

  track.addEventListener('click', e => {
    const row = e.target.closest('.wheel-picker__row')
    if (!row) return
    scrollToValue(Number(row.dataset.value))
  })

  el.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const next = clamp(currentValue + (e.key === 'ArrowDown' ? 1 : -1), min, max)
    scrollToValue(next)
  })

  markCenter(min)

  const handle = {
    setValue(value, { instant = false } = {}) {
      const clamped = clamp(value, min, max)
      markCenter(clamped)
      scrollToValue(clamped, { instant })
    },
    get value() {
      return currentValue
    },
  }
  registry.set(key, handle)
  return handle
}

export function getWheelPicker(key) {
  return registry.get(key)
}
