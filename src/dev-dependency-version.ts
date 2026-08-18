import { minVersion } from 'semver'

function minimumVersion(requirement: string)
{
	try {
		return minVersion(requirement)
	}
	catch {
		return null
	}
}

export function normalizeVersion(requirement: string): string
{
	const version = requirement.match(/^[\^~]?(\d+)\.(\d+)(?:\.\d+)?$/)
	return version ? `^${version[1]}.${version[2]}` : requirement
}

export function requiresUpgrade(current: string | undefined, required: string): boolean
{
	if (!current) return true
	if ((current === required) || (current === 'latest')) return false
	const currentVersion  = minimumVersion(current)
	const requiredVersion = minimumVersion(required)
	if (!currentVersion || !requiredVersion) return true
	return (currentVersion.major < requiredVersion.major)
		|| ((currentVersion.major === requiredVersion.major) && (currentVersion.minor < requiredVersion.minor))
}
