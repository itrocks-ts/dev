#!/usr/bin/env node
import { appDir }        from '@itrocks/app-dir'
import { execSync      } from 'node:child_process'
import { accessSync }    from 'node:fs'
import { readdirSync }   from 'node:fs'
import { readFileSync }  from 'node:fs'
import { rmSync }        from 'node:fs'
import { writeFileSync } from 'node:fs'
import { basename }      from 'node:path'
import { join }          from 'node:path'

const itrocksPath = appDir + '/node_modules/@itrocks'
const modules     = readdirSync(itrocksPath, { withFileTypes: true })
	.filter(entry => entry.isDirectory())
	.map(entry => entry.name)

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

try {
	const vcsFile = appDir + '/.idea/vcs.xml'
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

const build = new Set<string>(modules)
while (build.size) {
	build.forEach(module => {
		let   canBuild     = true
		const path         = join(itrocksPath, module)
		const json         = JSON.parse(readFileSync(path + '/package.json', 'utf-8'))
		const dependencies = json.optionalDependencies || {}
		Object.assign(dependencies, json.dependencies || {})
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

console.log('Done.')
