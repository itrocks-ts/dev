#!/usr/bin/env node
import { appDir }               from '@itrocks/app-dir'
import { execFile }             from 'node:child_process'
import { access }               from 'node:fs/promises'
import { readdir }              from 'node:fs/promises'
import { readFile }             from 'node:fs/promises'
import { join }                 from 'node:path'
import { gt }                   from 'semver'
import { valid }                from 'semver'
import { printHelpIfRequested } from './cli-help'

const baseDir = appDir + '/node_modules/@itrocks'
const dryRun  = process.argv.slice(2).includes('--dry')

type NpmResult = {
	code:   number
	stderr: string
	stdout: string
}

type NpmSearchPackage = {
	name:    string
	version: string
}

type NpmSearchObject = {
	package: NpmSearchPackage
}

type NpmSearchResult = {
	objects?: NpmSearchObject[]
}

async function getItrocksPublishedVersions()
{
	const url      = 'https://registry.npmjs.org/-/v1/search?text=maintainer:baptistepillot&size=500'
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Unable to fetch npm search results: ${response.status} ${response.statusText}`)
	}

	const data = await response.json() as NpmSearchResult
	const map  = new Map<string, string>()

	for (const item of data.objects ?? []) {
		const pkg = item.package
		if (!pkg?.name || !pkg.version) continue
		if (!pkg.name.startsWith('@itrocks/')) continue
		map.set(pkg.name, pkg.version)
	}

	return map
}

async function getPackageDirs(dir: string)
{
	const dirs    = []
	const entries = await readdir(dir, { withFileTypes: true })
	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		const pkg = join(dir, entry.name, 'package.json')
		try {
			await access(pkg)
			dirs.push(join(dir, entry.name))
		}
		catch {
		}
	}
	return dirs
}

async function main()
{
	if (printHelpIfRequested(`
Usage: it-publish [--dry] [--help]

Publish local @itrocks packages whose version is ahead of the npm registry.

Options:
  --dry       Report packages without publishing them.
  -h, --help  Show this help without querying npm or publishing packages.
	`)) return

	console.log(`it-publish – scan @itrocks packages${dryRun ? ' (dry-run)' : ''}\n`)

	const publishedVersions = await getItrocksPublishedVersions()
	const packageDirs       = await getPackageDirs(baseDir)
	let   checkedCount      = 0
	let   publishCount      = 0

	if (!publishedVersions.size) {
		console.log('Unabled to list published versions')
		return
	}

	for (const dir of packageDirs) {
		if (await publishPackage(dir, publishedVersions)) publishCount ++
		checkedCount ++
	}

	console.log(`\nChecked ${checkedCount} @itrocks package(s) in ${baseDir}`)
	console.log(`${dryRun ? 'Would publish' : 'Published'} ${publishCount} @itrocks package(s)`)
}

async function publishPackage(dir: string, publishedVersions: Map<string, string>)
{
	const packageFile = join(dir, 'package.json')
	const pkg         = await readJson(packageFile) as { name?: string, version?: string }

	if (!pkg?.name || !pkg?.version) return false
	if (!pkg.name.startsWith('@itrocks/')) return false

	const localVersion = pkg.version
	if (!valid(localVersion)) {
		console.warn(`Skipping ${pkg.name}: invalid local version "${localVersion}"`)
		return false
	}

	const publishedVersion = publishedVersions.get(pkg.name) ?? null

	if (!publishedVersion) {
		console.log(`🚀 ${pkg.name}@${localVersion} (not yet published in search index)`)
		if (dryRun) {
			console.log('    dry-run: npm publish --access public')
			return true
		}
		const { code, stderr } = await runNpm(['publish', '--access', 'public'], dir)
		if (code !== 0) {
			console.error(`    publish failed:\n${stderr}`)
			return false
		}
		console.log('    published')
		return true
	}

	if (!valid(publishedVersion)) {
		console.warn(`Skipping ${pkg.name}: invalid published version "${publishedVersion}"`)
		return false
	}

	if (!gt(localVersion, publishedVersion)) {
		console.log(`↩︎ ${pkg.name} unchanged (local ${localVersion}, npm ${publishedVersion})`)
		return false
	}

	console.log(`⬆️  ${pkg.name} ${publishedVersion} → ${localVersion}`)
	if (dryRun) {
		console.log('    dry-run: npm publish')
		return true
	}

	const { code, stderr } = await runNpm(['publish'], dir)
	if (code !== 0) {
		console.error(`    publish failed:\n${stderr}`)
		return false
	}
	console.log('    published')
	return true
}

async function readJson(file: string)
{
	return JSON.parse(await readFile(file, 'utf8'))
}

async function runNpm(args: string[], cwd?: string): Promise<NpmResult>
{
	return new Promise(resolve => {
		execFile('npm', args, { cwd }, (error, stdout, stderr) => {
			const code = +((error as NodeJS.ErrnoException | null)?.code ?? 0)
			resolve({
				stdout: stdout.toString().trim(),
				stderr: stderr.toString().trim(),
				code
			})
		})
	})
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
