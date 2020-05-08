import * as process from 'process';
import { join } from 'path';
import * as fs from 'fs';
import CONSTANTS from './Constants';

const VALID_EXTENSIONS = Object.values(CONSTANTS.EXTENSIONS);

interface ProjectDetails {
	totalLines: number;
	totalEmptyLines: number;
	totalNonEmptyLines: number;
	languages: ProjectLanguageInformation[];
}

interface ProjectLanguageInformation {
	lines: number;
	percentage: number;
	name: string;
}

// eslint-disable-next-line
export default class utils {
	static dynamicSort(property) { 
		return function (obj1, obj2): number {
			return obj1[property] > obj2[property] ? 1
				: obj1[property] < obj2[property] ? -1 : 0;
		}
	}

	static flat(arr: any[], depth = 1): any[] {
		return arr.reduce((a, v) => a.concat(depth > 1 && Array.isArray(v) ? utils.flat(v, depth - 1) : v), []);
	}

	static getFiles(path: string, exclude: string[]): string[] {
		const content = fs.readdirSync(path);

		return utils.flat(content.map(file => 
			CONSTANTS.IGNORE.includes(file) && exclude.includes(file)
				? []
				: fs.lstatSync(join(path, file)).isDirectory()
					? utils.getFiles(join(path, file), exclude)
					: join(path, file)
		));
	}

	static getMainPath(): Promise<string> {
		return new Promise(resolve => {
			fs.readFile(join(process.cwd(), 'tsconfig.json'), {encoding: 'utf8'}, (err, data) => {
				if (err) return;
	
				const config = JSON.parse(data);

				resolve(config.compilerOptions.rootDir ? config.compilerOptions.rootDir : process.cwd());
			});
		});
	}

	static async parseFiles(extensions: string[], exclude: string[]): Promise<string[]> {
		let files = utils.getFiles(await utils.getMainPath(), exclude);

		return files.filter(file => (extensions.length > 0 ? extensions : VALID_EXTENSIONS).some(extension => file.endsWith(extension)));
	}

	static calculatePercentage(a: number, b: number): number {
		return parseFloat(((a / b) * 100).toFixed(2));
	}

	static async parseProject(extension: string[], exclude: string[]): Promise<ProjectDetails> {
		const files = await utils.parseFiles(extension, exclude);
		
		const data = {
			totalLines: 0,
			totalEmptyLines: 0,
			totalNonEmptyLines: 0,
			languages: []
		};

		for (const key of Object.keys(CONSTANTS.EXTENSIONS)) {
			const extension = CONSTANTS.EXTENSIONS[key];
			const sameExtensionFiles = files.filter(file => file.endsWith(extension));
			const lines = utils.flat(sameExtensionFiles.map(file => fs.readFileSync(file, {encoding: 'utf8'}).split('\r\n')));
			const emptyLines = lines.filter(line => line.length == 0).length;
			const nonEmptyLines = lines.length - emptyLines;

			data.totalEmptyLines += emptyLines;
			data.totalNonEmptyLines += nonEmptyLines;
			data.totalLines += lines.length;

			data.languages.push({
				lines: lines.length,
				percentage: 0,
				name: key
			});
		}

		data.languages = data.languages.sort(utils.dynamicSort('-lines'));

		for (let index = 0; index < VALID_EXTENSIONS.length; index++)
			data.languages[index].percentage = utils.calculatePercentage(data.languages[index].lines, data.totalLines);

		return data;
	}

	static commaSeparatedList(value): string[] {
		return value.split(',');
	}
}