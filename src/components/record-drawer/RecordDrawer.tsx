import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ToneBadge } from '@/components/entity-table/cells'
import type { DrawerContent } from '@/entities/types'

export function RecordDrawer({
  open,
  onOpenChange,
  content,
  extra,
  onEdit,
  onDelete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: DrawerContent | null
  extra?: ReactNode
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:max-w-[420px]">
        {content && (
          <>
            <SheetHeader className="flex-row items-start justify-between gap-3 border-b border-[var(--border-2)] pr-12">
              <div className="flex-1">
                <SheetTitle className="text-[15px] font-bold tracking-tight">{content.title}</SheetTitle>
                {content.subtitle && (
                  <div className="mt-0.5 font-mono text-xs text-[var(--text-3)]">{content.subtitle}</div>
                )}
              </div>
              {content.badge && <ToneBadge tone={content.badge.tone} label={content.badge.label} />}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4">
              {content.sections.map((section) => (
                <div key={section.label} className="mb-5">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--text-3)]">
                    {section.label}
                  </div>
                  {section.rows.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 border-b border-[var(--border-2)] py-1.5"
                    >
                      <div className="text-xs text-[var(--text-2)]">{row.label}</div>
                      {row.tone ? (
                        <ToneBadge tone={row.tone} label={row.value} />
                      ) : (
                        <div className="text-right font-mono text-[12.5px] font-medium">{row.value}</div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {extra}
            </div>

            <SheetFooter className="flex-row border-t border-[var(--border-2)] p-3.5">
              <SheetClose render={<Button variant="outline" className="flex-1" />}>Close</SheetClose>
              {onDelete && (
                <Button variant="destructive" className="flex-1" onClick={onDelete}>
                  Delete
                </Button>
              )}
              {onEdit && (
                <Button className="flex-1" onClick={onEdit}>
                  Edit
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
