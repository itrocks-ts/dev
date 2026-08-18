#!/usr/bin/env node
import { normalizeVersion } from './dev-dependency-version'
import { requiresUpgrade }  from './dev-dependency-version'
import { appDir }           from '@itrocks/app-dir'
import { execSync }         from 'node:child_process'
import { accessSync }       from 'node:fs'
import { existsSync }       from 'node:fs'
import { mkdtempSync }      from 'node:fs'
import { readdirSync }      from 'node:fs'
import { readFileSync }     from 'node:fs'
import { renameSync }       from 'node:fs'
import { rmSync }           from 'node:fs'
import { writeFileSync }    from 'node:fs'
import { basename }         from 'node:path'
import { join }             from 'node:path'

interface PackageJson
{
	devDependencies?: Record<string, string>
}

interface PackageLock
{
	packages?: Record<string, PackageJson>
}

const itrocksPath = appDir + '/node_modules/@itrocks'
let modules       = listModules()

function buildModules()
{
	const build = new Set<string>(modules)
	while (build.size) {
		build.forEach(module => {
			const json = JSON.parse(readFileSync(join(itrocksPath, module, 'package.json'), 'utf-8'))
			const path = join(itrocksPath, module)
			json.optionalDependencies ||= {}
			Object.assign(json.optionalDependencies, json.dependencies || {})
			const dependencies = json.optionalDependencies
			let canBuild       = true
			Object.keys(dependencies).forEach(dependency => {
				if (dependency.startsWith('@itrocks/') && build.has(basename(dependency))) {
					canBuild = false
				}
			})
			if (canBuild) {
				if (json.scripts?.build) {
					execSync(`npm run build`, {cwd: path, stdio: 'inherit'})
				}
				else {
					console.info('No build script for', module)
				}
				build.delete(module)
			}
		})
	}
}

function checkoutModules()
{
	modules.forEach(module => {
		const path = join(itrocksPath, module)
		try {
			accessSync(path + '/.git')
		}
		catch {
			rmSync(path, { force: true, recursive: true })
			execSync(`git clone git@github.com:itrocks-ts/${module}`, { cwd: itrocksPath, stdio: 'inherit' })
		}
	})
}

function installDevDependencies()
{
	const appPackage        = appDir + '/package.json'
	const appPackageContent = readFileSync(appPackage, 'utf8')
	const appPackageJson    = JSON.parse(appPackageContent) as PackageJson

	const installed: Record<string, string> = appPackageJson.devDependencies ||= {}
	const required:  Record<string, string> = {}
	modules.forEach(module => {
		const json = JSON.parse(readFileSync(join(itrocksPath, module, 'package.json'), 'utf8'))
		Object.entries<string>(json.devDependencies || {}).forEach(([dependency, version]) => {
			const normalized = normalizeVersion(version)
			if (requiresUpgrade(required[dependency], normalized)) required[dependency] = normalized
		})
	})
	const install = Object.entries(required)
		.filter(([dependency, version]) => requiresUpgrade(installed[dependency], version))
		.map(([dependency]) => dependency)
	let packageChanged = false
	Object.entries(required).forEach(([dependency, version]) => {
		const selected = requiresUpgrade(installed[dependency], version)
			? version
			: normalizeVersion(installed[dependency] as string)
		if (installed[dependency] === selected) return
		installed[dependency] = selected
		packageChanged        = true
	})
	if (packageChanged) writeJson(appPackage, appPackageJson, appPackageContent)
	if (!install.length) {
		if (packageChanged) updatePackageLock(installed)
		return
	}

	const backup       = mkdtempSync(join(appDir, '.vcs-modules-'))
	const repositories = modules.filter(module => existsSync(join(itrocksPath, module, '.git')))
	repositories.forEach(module => renameSync(join(itrocksPath, module), join(backup, module)))
	try {
		execSync('npm install', { cwd: appDir, stdio: 'inherit' })
	}
	finally {
		repositories.forEach(module => {
			rmSync(join(itrocksPath, module), { force: true, recursive: true })
			renameSync(join(backup, module), join(itrocksPath, module))
		})
		rmSync(backup, { force: true, recursive: true })
	}
}

function listModules(): string[]
{
	return readdirSync(itrocksPath, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name)
		.sort()
}

function main()
{
	installDevDependencies()
	modules = listModules()
	checkoutModules()
	updateVcsMappings()
	buildModules()
	console.log('Done.')
}

function updatePackageLock(devDependencies: Record<string, string>)
{
	const packageLock = appDir + '/package-lock.json'
	if (!existsSync(packageLock)) return
	const packageLockContent = readFileSync(packageLock, 'utf8')
	const packageLockJson    = JSON.parse(packageLockContent) as PackageLock
	const packageLockRoot    = packageLockJson.packages?.['']?.devDependencies
	if (!packageLockRoot) return
	let changed = false
	Object.entries(devDependencies).forEach(([dependency, version]) => {
		if (!(dependency in packageLockRoot) || (packageLockRoot[dependency] === version)) return
		packageLockRoot[dependency] = version
		changed                     = true
	})
	if (changed) writeJson(packageLock, packageLockJson, packageLockContent)
}

function updateVcsMappings()
{
	try {
		const vcsFile  = appDir + '/.idea/vcs.xml'
		let vcsContent = readFileSync(vcsFile, 'utf8')
			.replaceAll(/\n\s*<mapping directory="\$PROJECT_DIR\$\/node_modules\/@itrocks\/.*" vcs="Git" \/>/g, '')
		modules.forEach(module => {
			if (vcsContent.includes(`/@itrocks/${module}"`)) return
			const component = vcsContent.indexOf('name="VcsDirectoryMappings"')
			if (component < 0) throw new Error('vcs.xml should contain name="VcsDirectoryMappings"')
			const position = vcsContent.indexOf('</component>', component)
			if (position < 0) throw new Error('vcs.xml should contain </component> after name="VcsDirectoryMappings"')
			vcsContent = vcsContent.slice(0, position)
				+ `  <mapping directory="$PROJECT_DIR$/node_modules/@itrocks/${module}" vcs="Git" />\n  `
				+ vcsContent.slice(position)
		})
		writeFileSync(vcsFile, vcsContent, 'utf8')
	}
	catch {
		console.warn('[WebStorm] No such file or directory .idea/vcl.xml: ignored.')
	}
}

function writeJson(file: string, json: object, source: string)
{
	const endOfLine   = source.includes('\r\n') ? '\r\n' : '\n'
	const indentation = source.match(/\n([\t ]+)"/)?.[1] ?? '\t'
	writeFileSync(file, JSON.stringify(json, undefined, indentation).replaceAll('\n', endOfLine) + endOfLine, 'utf8')
}
main()
