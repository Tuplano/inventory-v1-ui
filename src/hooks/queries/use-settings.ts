import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SettingRow } from '@/entities/settings.config'

type InventoryCostingMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE'

interface CompanySettingsRecord {
  allowNegativeStock: boolean
  enableBatchTracking: boolean
  enableExpiryTracking: boolean
  enableBarcode: boolean
  requireReceivingApproval: boolean
  requireAdjustmentApproval: boolean
  requireTransferApproval: boolean
  inventoryCostingMethod: InventoryCostingMethod
}

function toSettingRows(settings: CompanySettingsRecord): SettingRow[] {
  return [
    { id: 'allowNegativeStock', key: 'allow_negative_stock', value: String(settings.allowNegativeStock), type: 'boolean' },
    { id: 'enableBatchTracking', key: 'enable_batch_tracking', value: String(settings.enableBatchTracking), type: 'boolean' },
    { id: 'enableExpiryTracking', key: 'enable_expiry_tracking', value: String(settings.enableExpiryTracking), type: 'boolean' },
    { id: 'enableBarcode', key: 'enable_barcode', value: String(settings.enableBarcode), type: 'boolean' },
    { id: 'requireReceivingApproval', key: 'require_receiving_approval', value: String(settings.requireReceivingApproval), type: 'boolean' },
    { id: 'requireAdjustmentApproval', key: 'require_adjustment_approval', value: String(settings.requireAdjustmentApproval), type: 'boolean' },
    { id: 'requireTransferApproval', key: 'require_transfer_approval', value: String(settings.requireTransferApproval), type: 'boolean' },
    { id: 'inventoryCostingMethod', key: 'inventory_costing_method', value: settings.inventoryCostingMethod, type: 'enum' },
  ]
}

export function useSettings() {
  const { companyId } = useScopeStore()
  return useQuery({
    queryKey: ['company-settings', companyId],
    queryFn: async (): Promise<SettingRow[]> => {
      const { data } = await apiClient.get<CompanySettingsRecord>('/company-settings')
      return toSettingRows(data)
    },
    enabled: !!companyId,
  })
}
