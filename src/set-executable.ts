import { chmodSync }  from 'node:fs'
import { readdirSync } from 'node:fs'
import { statSync }    from 'node:fs'
import { join }        from 'node:path'

if (process.platform !== 'win32') {
	const outputDirectory = join(__dirname)
	for (const entry of readdirSync(outputDirectory)) {
		if (!entry.endsWith('.js')) continue
		const path = join(outputDirectory, entry)
		chmodSync(path, statSync(path).mode | 0o111)
	}
}
