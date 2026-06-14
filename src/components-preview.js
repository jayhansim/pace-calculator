import '@fontsource-variable/geist'
import './styles/tokens.css'
import './styles/reset.css'
import './styles/typography.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/preview.css'

document.addEventListener('DOMContentLoaded', () => {
  // Segmented controls on preview page
  document.querySelectorAll('.segmented').forEach(container => {
    container.querySelectorAll('.segmented__option').forEach(opt => {
      opt.addEventListener('click', () => {
        container.querySelectorAll('.segmented__option').forEach(o => o.classList.remove('segmented__option--selected'))
        opt.classList.add('segmented__option--selected')
      })
    })
  })

  // Overlay demo
  const backdrop = document.getElementById('overlay-backdrop')
  document.getElementById('overlay-open-btn')?.addEventListener('click', () => backdrop?.classList.add('is-open'))
  document.querySelectorAll('[data-close-overlay]').forEach(btn => {
    btn.addEventListener('click', () => backdrop?.classList.remove('is-open'))
  })
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('is-open') })
})
