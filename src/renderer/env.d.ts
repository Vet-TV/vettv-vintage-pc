import type { VetTvApi } from '@shared/types'

declare global {
  interface Window {
    vettv: VetTvApi
  }
}

export {}
