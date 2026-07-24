import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createSettingsConfig } from '@/entities/settings.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useSettings } from '@/hooks/queries/use-settings'
import { useCurrentCompany } from '@/hooks/queries/use-companies'

export const Route = createFileRoute('/_authed/settings')({
  beforeLoad: (opts) => requirePermission(opts, 'settings'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SettingsPage,
})

function SettingsPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useSettings()
  const config = createSettingsConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
