#!/usr/bin/env node

import utils from './utils';
import { program } from 'commander';

if (require.main == module) {
	const packageConfig = require('../package.json');

	program.version(packageConfig.version);

	program
		.option('-e, --extension <extension>', 'Filters by extension', utils.commaSeparatedList, [])
		.option('-ex, --exclude <files|directories>', 'Exclude directories or files', utils.commaSeparatedList, [])

	program.parse(process.argv)

	utils.parseProject(program.extension, program.exclude).then(details => {
		const languages = details.languages.filter(stats => stats.lines > 0);
		const description = languages.map(language => `\r• ${language.name}: ${language.lines} (${language.percentage}%)`).join('\n');

		if (details.totalLines == 0) {
			return console.log(`
				\r=-----------= Lines of Code v${packageConfig.version} =-----------=
				
				\rYour code is empty.
				`);
		}
		
		console.log(`
		\r=-----------= Lines of Code v${packageConfig.version} =-----------=

		\r• Lines of Code: ${details.totalLines}
		\r• Empty Lines: ${details.totalEmptyLines}
		\r• Non-Empty Lines: ${details.totalNonEmptyLines}

		\r=---= Project Info =---=

		${description}
		`);
	});
} else {
	module.exports = utils;
}