import { copyFileSync } from 'node:fs'
import { join }         from 'node:path'

const packageDir = join(__dirname, '..')
const source     = join(packageDir, 'AGENTS-@itrocks.md')
const target     = join(packageDir, '..', 'AGENTS.md')

copyFileSync(source, target)
console.log(`Copied ${source} to ${target}`)
