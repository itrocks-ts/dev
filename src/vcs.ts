#!/usr/bin/env node
import { normalizeVersion } from './dev-dependency-version'
import { requiresUpgrade }  from './dev-dependency-version'
import { appDir }           from '@itrocks/app-dir'
import { execFileSync }     from 'node:child_process'
import { execSync }         from 'node:child_process'
import { accessSync }       from 'node:fs'
import { existsSync }       from 'node:fs'
import { readdirSync }      from 'node:fs'
import { readFileSync }     from 'node:fs'
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

function checkGitRepositories(): boolean
{
	const problems = modules
		.map(module => ({ name: `@itrocks/${module}`, path: join(itrocksPath, module) }))
		.filter(repository => existsSync(join(repository.path, '.git')))
		.map(repository => {
			const issues: string[] = []
			let status: string
			try {
				status = gitOutput(repository.path, ['status', '--porcelain=v1', '--untracked-files=all'])
			}
			catch {
				return { ...repository, issues: ['Git status could not be read'] }
			}
			status.split(/\r?\n/).filter(Boolean).forEach(line => {
				const code = line.slice(0, 2)
				const file = line.slice(3)
				if (['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'].includes(code)) {
					issues.push(`conflict: ${file}`)
					return
				}
				if (code === '??') {
					issues.push(`untracked: ${file}`)
					return
				}
				if (code[0] !== ' ') issues.push(`staged: ${file}`)
				if (code[1] !== ' ') issues.push(`not staged: ${file}`)
			})
			try {
				const commits = new Set([
					...gitOutput(repository.path, ['rev-list', '--branches', '--not', '--remotes']).split(/\r?\n/),
					...gitOutput(repository.path, ['rev-list', 'HEAD', '--not', '--remotes']).split(/\r?\n/)
				].filter(Boolean))
				if (commits.size) issues.push(`${commits.size} commit(s) not found on a known remote branch`)
				const stashes = gitOutput(repository.path, ['stash', 'list', '--format=%gd: %s'])
					.split(/\r?\n/).filter(Boolean)
				stashes.forEach(stash => issues.push(`local stash: ${stash}`))
			}
			catch {
				issues.push('pushed commits and local stashes could not be verified')
			}
			return { ...repository, issues }
		}).filter(repository => repository.issues.length)

	if (!problems.length) return true
	console.error('vcs-modules stopped: Git work must be clean and pushed before dependencies are installed.')
	problems.forEach(repository => {
		console.error(`\n${repository.name} (${repository.path})`)
		repository.issues.forEach(issue => console.error(`  - ${issue}`))
	})
	console.error('\nResolve or commit file changes, apply or drop stashes, and push commits before trying again.')
	return false
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

function gitOutput(path: string, arguments_: string[]): string
{
	return execFileSync('git', ['-C', path, ...arguments_], {
		encoding: 'utf8',
		stdio:    ['ignore', 'pipe', 'ignore']
	}).trimEnd()
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

	execSync('npm install', { cwd: appDir, stdio: 'inherit' })
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
	if (!checkGitRepositories()) {
		process.exitCode = 1
		return
	}
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
