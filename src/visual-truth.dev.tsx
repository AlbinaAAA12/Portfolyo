import { createRoot } from 'react-dom/client'
import { VisualTruth } from 'visual-truth'
import 'visual-truth/style.css'

const workspacePresetKey = 'visual-truth:workspace-preset:v1'

export function mountVisualTruth() {
  if (document.querySelector('[data-visual-truth-host]')) return

  if (window.localStorage.getItem(workspacePresetKey) === null) {
    window.localStorage.setItem(workspacePresetKey, 'squarespace')
  }

  const host = document.createElement('div')
  host.dataset.visualTruthHost = ''
  document.body.append(host)
  createRoot(host).render(<VisualTruth />)
}
