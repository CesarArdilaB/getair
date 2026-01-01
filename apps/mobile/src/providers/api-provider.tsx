import { ApiProvider as SharedApiProvider } from '@shared/api/client'
import type { ReactNode } from 'react'
import { API_URL } from '../constants'

export function ApiProvider({ children }: { children: ReactNode }) {
    return <SharedApiProvider url={API_URL}>{children}</SharedApiProvider>
}
