import { Dashboard } from "@/components/layout/dashboard"
import { useSettingsPersistence } from "@/hooks/use-settings-persistence"

export function App() {
  useSettingsPersistence()
  return <Dashboard />
}

export default App
