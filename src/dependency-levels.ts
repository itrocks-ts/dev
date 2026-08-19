#!/usr/bin/env node
import { join }                 from 'node:path'
import { readdir }              from 'node:fs/promises'
import { readFile }             from 'node:fs/promises'
import { printHelpIfRequested } from './cli-help'

const SCOPE           = '@itrocks'
const SCOPE_DIRECTORY = join(process.cwd(), 'node_modules', SCOPE)

const DEPENDENCY_SECTIONS = [
	'dependencies',
	'devDependencies',
	'peerDependencies',
	'optionalDependencies'
] as const

const AI_DOCUMENTATION_PATTERN = /artificial intelligence/i

type DependencySection = typeof DEPENDENCY_SECTIONS[number]

type DependencyVersions = Record<string, string>

interface PackageJson
{
	name?: string
	dependencies?: DependencyVersions
	devDependencies?: DependencyVersions
	peerDependencies?: DependencyVersions
	optionalDependencies?: DependencyVersions
}

interface PackageData
{
	dependencies: Set<string>
	hasAiDocumentation: boolean
}

type PackageMap = Map<string, PackageData>
type DependencyMap = Map<string, Set<string>>
type MissingDependencyMap = Map<string, string[]>

interface LevelResult
{
	levels: string[][]
	blockedPackages: DependencyMap
}

async function readTextFile(
	path: string
): Promise<string | null>
{
	try {
		return await readFile(path, 'utf8')
	}
	catch
	{
		return null
	}
}

async function readPackageJson(
	directory: string
): Promise<PackageJson | null>
{
	const packageJsonPath = join(
		directory,
		'package.json'
	)

	const content = await readTextFile(packageJsonPath)

	if (content === null)
	{
		return null
	}

	try
	{
		return JSON.parse(content)
	}
	catch (error: unknown)
	{
		console.warn(
			`Invalid package.json in ${directory}: ${getErrorMessage(error)}`
		)

		return null
	}
}

async function hasAiDocumentation(
	directory: string
): Promise<boolean>
{
	const readmePath = join(
		directory,
		'README.md'
	)

	const readme = await readTextFile(readmePath)

	return readme !== null
		&& AI_DOCUMENTATION_PATTERN.test(readme)
}

function getInternalDependencies(
	packageJson: PackageJson
): Set<string>
{
	const dependencies = new Set<string>()

	for (const section of DEPENDENCY_SECTIONS)
	{
		const sectionDependencies = getDependencySection(
			packageJson,
			section
		)

		for (const dependencyName of Object.keys(sectionDependencies))
		{
			if (dependencyName.startsWith(`${SCOPE}/`))
			{
				dependencies.add(dependencyName)
			}
		}
	}

	return dependencies
}

function getDependencySection(
	packageJson: PackageJson,
	section: DependencySection
): DependencyVersions
{
	return packageJson[section] ?? {}
}

async function loadPackages(): Promise<PackageMap>
{
	const entries = await readdir(
		SCOPE_DIRECTORY,
		{
			withFileTypes: true
		}
	)

	const packages: PackageMap = new Map()

	for (const entry of entries)
	{
		if (!entry.isDirectory() && !entry.isSymbolicLink())
		{
			continue
		}

		const directory = join(
			SCOPE_DIRECTORY,
			entry.name
		)

		const packageJson = await readPackageJson(directory)

		if (
			typeof packageJson?.name !== 'string'
			|| !packageJson.name.startsWith(`${SCOPE}/`)
		)
		{
			continue
		}

		packages.set(
			packageJson.name,
			{
				dependencies: getInternalDependencies(packageJson),
				hasAiDocumentation: await hasAiDocumentation(directory)
			}
		)
	}

	return packages
}

function findMissingDependencies(
	packages: PackageMap
): MissingDependencyMap
{
	const missingDependencies: MissingDependencyMap = new Map()

	for (const [packageName, packageData] of packages)
	{
		const missing = [...packageData.dependencies]
			.filter(
				(dependencyName: string): boolean =>
					!packages.has(dependencyName)
			)
			.sort(compareStrings)

		if (missing.length > 0)
		{
			missingDependencies.set(
				packageName,
				missing
			)
		}
	}

	return missingDependencies
}

function buildDependencyMap(
	packages: PackageMap
): DependencyMap
{
	const dependenciesByPackage: DependencyMap = new Map()

	for (const [packageName, packageData] of packages)
	{
		const installedDependencies = [...packageData.dependencies]
			.filter(
				(dependencyName: string): boolean =>
					packages.has(dependencyName)
			)

		dependenciesByPackage.set(
			packageName,
			new Set(installedDependencies)
		)
	}

	return dependenciesByPackage
}

function buildDependents(
	dependenciesByPackage: DependencyMap
): DependencyMap
{
	const dependents: DependencyMap = new Map()

	for (const packageName of dependenciesByPackage.keys())
	{
		dependents.set(
			packageName,
			new Set()
		)
	}

	for (const [packageName, dependencies] of dependenciesByPackage)
	{
		for (const dependencyName of dependencies)
		{
			dependents.get(dependencyName)?.add(packageName)
		}
	}

	return dependents
}

function buildLevels(
	dependenciesByPackage: DependencyMap
): LevelResult
{
	const remaining = cloneDependencyMap(
		dependenciesByPackage
	)

	const levels: string[][] = []

	while (remaining.size > 0)
	{
		const currentLevel = [...remaining]
			.filter(
				([, dependencies]: [string, Set<string>]): boolean =>
					dependencies.size === 0
			)
			.map(
				([packageName]: [string, Set<string>]): string =>
					packageName
			)
			.sort(compareStrings)

		if (currentLevel.length === 0)
		{
			break
		}

		levels.push(currentLevel)

		for (const packageName of currentLevel)
		{
			remaining.delete(packageName)
		}

		for (const dependencies of remaining.values())
		{
			for (const packageName of currentLevel)
			{
				dependencies.delete(packageName)
			}
		}
	}

	return {
		levels,
		blockedPackages: remaining
	}
}

function cloneDependencyMap(
	dependencyMap: DependencyMap
): DependencyMap
{
	const clone: DependencyMap = new Map()

	for (const [packageName, dependencies] of dependencyMap)
	{
		clone.set(
			packageName,
			new Set(dependencies)
		)
	}

	return clone
}

function formatPackageName(
	packageName: string,
	packages: PackageMap
): string
{
	const packageData = packages.get(packageName)

	return packageData?.hasAiDocumentation === true
		? `${packageName} (AI doc)`
		: packageName
}

function printLevels(
	levels: string[][],
	packages: PackageMap,
	dependenciesByPackage: DependencyMap,
	dependents: DependencyMap
): void
{
	console.log(`Dependency hierarchy for ${SCOPE}`)

	for (const [levelIndex, packageNames] of levels.entries())
	{
		console.log(`\nLevel ${levelIndex}`)

		for (const packageName of packageNames)
		{
			const dependencies = getSortedDependencies(
				dependenciesByPackage,
				packageName
			)

			const packageDependents = getSortedDependencies(
				dependents,
				packageName
			)

			console.log(
				`\n\t${formatPackageName(packageName, packages)}`
			)

			printPackageDependencies(
				dependencies,
				packages
			)

			printPackageDependents(
				packageDependents,
				packages
			)
		}
	}
}

function printPackageDependencies(
	dependencies: string[],
	packages: PackageMap
): void
{
	if (dependencies.length === 0)
	{
		console.log('\t\tInternal dependencies: none')
		return
	}

	console.log('\t\tInternal dependencies:')

	for (const dependencyName of dependencies)
	{
		console.log(
			`\t\t\t← ${formatPackageName(dependencyName, packages)}`
		)
	}
}

function printPackageDependents(
	dependents: string[],
	packages: PackageMap
): void
{
	if (dependents.length === 0)
	{
		console.log('\t\tDirectly used by: none')
		return
	}

	console.log('\t\tDirectly used by:')

	for (const dependentName of dependents)
	{
		console.log(
			`\t\t\t→ ${formatPackageName(dependentName, packages)}`
		)
	}
}

function printMissingDependencies(
	missingDependencies: MissingDependencyMap,
	packages: PackageMap
): void
{
	if (missingDependencies.size === 0)
	{
		return
	}

	console.warn(
		`\n${SCOPE} dependencies referenced but not installed:`
	)

	const sortedEntries = [...missingDependencies]
		.sort(compareMapEntries)

	for (const [packageName, dependencies] of sortedEntries)
	{
		console.warn(
			`\n\t${formatPackageName(packageName, packages)}`
		)

		for (const dependencyName of dependencies)
		{
			console.warn(`\t\t? ${dependencyName}`)
		}
	}
}

function printBlockedPackages(
	blockedPackages: DependencyMap,
	packages: PackageMap
): void
{
	if (blockedPackages.size === 0)
	{
		return
	}

	console.error(
		'\nCycles or blocking internal dependencies detected:'
	)

	const sortedEntries = [...blockedPackages]
		.sort(compareMapEntries)

	for (const [packageName, dependencies] of sortedEntries)
	{
		console.error(
			`\n\t${formatPackageName(packageName, packages)}`
		)

		for (const dependencyName of [...dependencies].sort(compareStrings))
		{
			console.error(
				`\t\t↔ ${formatPackageName(dependencyName, packages)}`
			)
		}
	}

	process.exitCode = 1
}

function getSortedDependencies(
	dependencyMap: DependencyMap,
	packageName: string
): string[]
{
	return [...(dependencyMap.get(packageName) ?? [])]
		.sort(compareStrings)
}

function compareStrings(
	left: string,
	right: string
): number
{
	return left.localeCompare(right)
}

function compareMapEntries<T>(
	left: [string, T],
	right: [string, T]
): number
{
	return compareStrings(
		left[0],
		right[0]
	)
}

function getErrorMessage(
	error: unknown
): string
{
	return error instanceof Error
		? error.message
		: String(error)
}

async function main(): Promise<void>
{
	if (printHelpIfRequested(`
Usage: dependency-levels [--help]

Print installed @itrocks packages grouped by dependency level and report missing or
cyclic internal dependencies.

Options:
  -h, --help  Show this help without scanning installed packages.
	`)) return

	let packages: PackageMap

	try
	{
		packages = await loadPackages()
	}
	catch (error: unknown)
	{
		console.error(
			`Unable to read ${SCOPE_DIRECTORY}: ${getErrorMessage(error)}`
		)

		process.exitCode = 1
		return
	}

	if (packages.size === 0)
	{
		console.warn(
			`No ${SCOPE} modules found in ${SCOPE_DIRECTORY}.`
		)

		return
	}

	const missingDependencies = findMissingDependencies(packages)

	const dependenciesByPackage = buildDependencyMap(packages)

	const dependents = buildDependents(dependenciesByPackage)

	const {
		levels,
		blockedPackages
	} = buildLevels(dependenciesByPackage)

	printLevels(
		levels,
		packages,
		dependenciesByPackage,
		dependents
	)

	printMissingDependencies(
		missingDependencies,
		packages
	)

	printBlockedPackages(
		blockedPackages,
		packages
	)
}

main().catch(error => {
	console.log(`Unexpected error: ${getErrorMessage(error)}`)
	process.exitCode = 1
})
