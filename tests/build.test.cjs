const assert                                               = require('node:assert/strict')
const { spawn, spawnSync }                                 = require('node:child_process')
const { existsSync, mkdirSync, mkdtempSync, readFileSync } = require('node:fs')
const { rmSync, statSync, unlinkSync, writeFileSync }      = require('node:fs')
const { tmpdir }                                           = require('node:os')
const { join, resolve }                                    = require('node:path')
const { setTimeout: delay }                                = require('node:timers/promises')
const { test }                                             = require('node:test')

const cli = resolve(__dirname, '../cjs/build.js')

async function waitFor(condition, description)
{
	const deadline = Date.now() + 10000
	while (!condition()) {
		assert.ok(Date.now() < deadline, `Timed out: ${description}`)
		await delay(50)
	}
}

test('CLI validates arguments before starting a watcher', () => {
	for (const args of [['--on-success'], ['--on-success', ' '], ['--unknown']]) {
		const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
		assert.equal(result.status, 1)
		assert.match(result.stderr, /Usage:/)
	}
	const help = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' })
	assert.equal(help.status, 0)
	assert.match(help.stdout, /config.yaml/)
})

test('batches builds, handles source lifecycle and recovers after failures', async t => {
	const baseDir = mkdtempSync(join(tmpdir(), 'wsbuild-test-'))

	const config   = join(baseDir, 'config.yaml')
	const packages = ['alpha', 'beta'].map(name => join(baseDir, 'node_modules/@itrocks', name))
	for (const pkg of packages) {
		mkdirSync(join(pkg, 'src'), { recursive: true })
		writeFileSync(join(pkg, 'package.json'), JSON.stringify({ scripts: { build: 'node build.cjs' } }))
		writeFileSync(join(pkg, 'src/source.ts'), 'initial')
		writeFileSync(join(pkg, 'build.cjs'), `
const fs = require('node:fs')
fs.appendFileSync('builds', 'start\\n')
setTimeout(() => {
	fs.appendFileSync('builds', 'end\\n')
	process.exit(fs.existsSync('fail') ? 1 : 0)
}, 650)
`)
	}
	writeFileSync(config, 'app: test\n')
	const watcher = spawn(process.execPath, [cli], { cwd: baseDir })

	let output = ''
	watcher.stdout.on('data', data => output += data)
	watcher.stderr.on('data', data => output += data)
	t.after(async () => {
		watcher.kill('SIGTERM')
		await new Promise(resolve => watcher.once('close', resolve))
		rmSync(baseDir, { force: true, recursive: true })
	})
	const builds             = pkg => existsSync(join(pkg, 'builds')) ? readFileSync(join(pkg, 'builds'), 'utf8') : ''
	const countNotifications = () => {
		const modified = statSync(config).mtimeMs
		if (modified !== lastModified) {
			lastModified = modified
			notifications ++
		}
		return notifications
	}

	const edit               = (pkg, name = 'source.ts') => writeFileSync(join(pkg, 'src', name), String(Date.now()))

	let lastModified  = statSync(config).mtimeMs
	let notifications = 0

	await waitFor(() => output.includes('👀 Watch'), 'watcher ready')
	assert.equal(countNotifications(), 0)

	edit(packages[0])
	edit(packages[1])
	await waitFor(() => packages.every(pkg => builds(pkg).includes('start')), 'concurrent builds')
	edit(packages[0])
	await waitFor(() => countNotifications() === 1, 'one notification after queued rebuild')
	assert.equal(builds(packages[0]), 'start\nend\nstart\nend\n')
	assert.equal(builds(packages[1]), 'start\nend\n')

	writeFileSync(join(packages[0], 'fail'), '')
	edit(packages[0])
	edit(packages[1])
	await waitFor(() => output.includes('❌ Failed'), 'failed build')
	await waitFor(() => countNotifications() === 2, 'failed build also notifies')
	unlinkSync(join(packages[0], 'fail'))

	edit(packages[0], 'added.ts')
	await waitFor(() => countNotifications() === 3, 'addition notification')
	unlinkSync(join(packages[0], 'src/added.ts'))
	await waitFor(() => countNotifications() === 4, 'deletion notification')

	writeFileSync(join(packages[0], 'src/ignored.d.ts'), 'ignored')
	mkdirSync(join(packages[0], 'cjs'))
	writeFileSync(join(packages[0], 'cjs/output.ts'), 'ignored')
	await delay(600)
	assert.equal(countNotifications(), 4)

	assert.equal(readFileSync(config, 'utf8'), 'app: test\n')
	unlinkSync(config)
	edit(packages[0])
	await waitFor(() => output.includes('Could not update'), 'missing configuration reported')
	assert.equal(existsSync(config), false)
	writeFileSync(config, 'app: restored\n')
	lastModified = statSync(config).mtimeMs
	edit(packages[0])
	await waitFor(() => countNotifications() === 5, 'watching continues after configuration error')
	assert.equal(readFileSync(config, 'utf8'), 'app: restored\n')
})
