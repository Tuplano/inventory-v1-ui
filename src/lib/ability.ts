import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'

/**
 * Permission codes from the API are flat `subject.action` strings (e.g. `roles.view`).
 * CASL rules are `action, subject` pairs, so codes are split on the last `.`.
 */
export type AppAbility = MongoAbility<[string, string]>

function parsePermissionCode(code: string): { action: string; subject: string } | null {
  const separatorIndex = code.lastIndexOf('.')
  if (separatorIndex === -1) return null
  return { subject: code.slice(0, separatorIndex), action: code.slice(separatorIndex + 1) }
}

export function buildAbilityFromPermissions(permissionCodes: Iterable<string>): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  for (const code of permissionCodes) {
    const parsed = parsePermissionCode(code)
    if (parsed) can(parsed.action, parsed.subject)
  }

  return build()
}

/** True if no permissions are required, or the ability grants at least one of them. */
export function canAny(ability: AppAbility, permissionCodes: string[] | undefined): boolean {
  if (!permissionCodes || permissionCodes.length === 0) return true

  return permissionCodes.some((code) => {
    const parsed = parsePermissionCode(code)
    return parsed !== null && ability.can(parsed.action, parsed.subject)
  })
}
