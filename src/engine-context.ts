import { createContext } from './context'

export const UIHostContext = createContext<{
  owner: ex.Entity
}>()
