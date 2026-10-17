#!/usr/bin/env node
import { watch }                from 'chokidar'
import { exec }                 from 'node:child_process'
import { existsSync }           from 'node:fs'
import { utimesSync }           from 'node:fs'
import { basename }             from 'node:path'
import { dirname }              from 'node:path'
import { join }                 from 'node:path'
import { resolve }              from 'node:path'
import { printHelpIfRequested } from './cli-help'

const activeBuilds  = new Set<string>()
const baseDir       = resolve('node_modules/@itrocks')
const configFile    = resolve('config.yaml')
const waitingBuilds = new Set<string>()

let batchStarted = false
let settleTimer: ReturnType<typeof setTimeout> | undefined

function findPackageDir(filePath: string)
{
	let dir = dirname(filePath)
	while ((dir !== '/') && !existsSync(join(dir, 'package.json'))) {
		dir = dirname(dir)
	}
	const parent = basename(dirname(dir))
	if (parent === '@itrocks') {
		return dir
	}
	return null
}

function flushBuilds()
{
	for (const pkgDir of waitingBuilds) {
		if (activeBuilds.has(pkgDir)) continue
		waitingBuilds.delete(pkgDir)
		runBuild(pkgDir)
	}
	if (activeBuilds.size || waitingBuilds.size || !batchStarted) return

	batchStarted = false
	try {
		const now = new Date()
		utimesSync(configFile, now, now)
	}
	catch (error) {
		console.error(`❌ Could not update ${configFile}:`, error)
	}
}

function main()
{
	if (printHelpIfRequested(`
Usage: wsbuild [--help]

Watch @itrocks package sources and rebuild the owning package after a relevant file
changes.

After each completed build batch, update the modification time of the application's
existing config.yaml, including when a build fails.

Options:
  -h, --help  Show this help without starting the watcher.
	`)) return

	if (process.argv.length > 2) {
		console.error('Usage: wsbuild [--help]')
		process.exitCode = 1
		return
	}

	const watcher = watch(baseDir, {
		awaitWriteFinish: {
			pollInterval:       100,
			stabilityThreshold: 200,
		},
		ignored:       /node_modules\/@itrocks\/[^/]+\/(esm|cjs|node_modules)/,
		ignoreInitial: true,
		persistent:    true,
	})

	watcher.on('all', (event, filePath: string) => {
		if (!['add', 'change', 'unlink'].includes(event)) return
		if (
			!filePath.endsWith('.ts')
			&& !filePath.endsWith('.scss')
			&& !(
				filePath.includes('/src/')
				&& (
					filePath.endsWith('.html')
					|| filePath.endsWith('.jpg')
					|| filePath.endsWith('.png')
					|| filePath.endsWith('.svg')
				)
			)
		) return
		if (filePath.endsWith('.d.ts')) return
		console.log('  Modified', filePath)
		const pkgDir = findPackageDir(filePath)
		if (!pkgDir) {
			console.error('❌ No package dir for', filePath)
			return
		}
		waitingBuilds.add(pkgDir)
		scheduleBuilds()
	})

	watcher.once('ready', () => console.log(`👀 Watch ${baseDir}...`))
}
function runBuild(pkgDir: string)
{
	console.log(`📦 Build ${pkgDir}...`)
	activeBuilds.add(pkgDir)
	batchStarted = true

	exec('npm run build', { cwd: pkgDir }, (error, stdout, stderr) => {
		if (error) {
			console.error(`❌ Failed ${pkgDir} :\n${stdout}${stderr}`)
		}
		else {
			console.log(`✅ Done ${pkgDir}`)
		}
		activeBuilds.delete(pkgDir)
		scheduleBuilds()
	})
}

function scheduleBuilds()
{
	clearTimeout(settleTimer)
	settleTimer = setTimeout(flushBuilds, 200)
}


main()
