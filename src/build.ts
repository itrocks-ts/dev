#!/usr/bin/env node
import { watch }                from 'chokidar'
import { exec }                 from 'node:child_process'
import { existsSync }           from 'node:fs'
import { basename }             from 'node:path'
import { dirname }              from 'node:path'
import { join }                 from 'node:path'
import { resolve }              from 'node:path'
import { printHelpIfRequested } from './cli-help'

const baseDir = resolve('node_modules/@itrocks')

const activeBuilds  = new Set()
const waitingBuilds = new Set()

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

function runBuild(filePath: string)
{
	const pkgDir = findPackageDir(filePath)

	if (!pkgDir) {
		console.error('❌ No package dir for', filePath)
		return
	}

	if (waitingBuilds.has(pkgDir)) {
		console.log('  Already waiting', pkgDir)
		return
	}

	if (activeBuilds.has(pkgDir)) {
		console.log('  Already building', pkgDir, ': enqueue for waiting')
		waitingBuilds.add(pkgDir)
		setTimeout(
			() => {
				waitingBuilds.delete(pkgDir)
				runBuild(filePath)
			},
			200
		)
		return
	}

	console.log(`📦 Build ${pkgDir}...`)
	activeBuilds.add(pkgDir)

	exec('npm run build', { cwd: pkgDir }, (error, stdout, stderr) => {
		if (error) {
			console.error(`❌ Failed ${pkgDir} :\n${stdout}${stderr}`)
		}
		else {
			console.log(`✅ Done ${pkgDir}`)
		}
		activeBuilds.delete(pkgDir)
	})
}

function main()
{
	if (printHelpIfRequested(`
Usage: wsbuild [--help]

Watch @itrocks package sources and rebuild the owning package after a relevant file
changes.

Options:
  -h, --help  Show this help without starting the watcher.
	`)) return

	const watcher = watch(baseDir, {
		ignored: /node_modules\/@itrocks\/[^/]+\/(esm|cjs|node_modules)/,
		persistent: true,
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: 200,
			pollInterval: 100,
		},
	})

	watcher.on('change', (filePath: string) => {
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
		runBuild(filePath)
	})

	console.log(`👀 Watch ${baseDir}...`)
}

main()
