
const HELP_ARGUMENTS = new Set(['--help', '-h'])

export function printHelpIfRequested(help: string): boolean
{
	if (!process.argv.slice(2).some(argument => HELP_ARGUMENTS.has(argument))) return false
	console.log(help.trim())
	return true
}
