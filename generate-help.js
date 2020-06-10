'use strict';
const decamelizeKeys = require('decamelize-keys');
const trimNewlines = require('trim-newlines');
const redent = require('redent');

function flagName(name, alias, type) {
	let result = `--${name}`;
	if (alias) {
		result += `, -${alias}`;
	}

	if (type && type !== 'boolean') {
		result += ` <${type}>`;
	}

	return result;
}

function buildFlagLines(flags) {
	flags = {...flags, help: {type: 'boolean', description: 'Show help'}};

	const entries = Object.entries(decamelizeKeys(flags, '-')).map(([name, def]) => {
		const type = def.type || def;

		const entry = {
			name: flagName(name, def.alias, type),
			description: def.description || ''
		};
		if (typeof def === 'object' && def !== null && 'default' in def) {
			entry.description += `  [default: ${def.default}]`;
		}

		entry.description = entry.description.trim();

		return entry;
	});

	const maxNameLengh = Math.max(...entries.map(({name}) => name.length));

	const lines = entries.map(({name, description}) => {
		if (!description) {
			return name;
		}

		const spaces = 4;
		const padding = ' '.repeat(maxNameLengh - name.length + spaces);

		let [firstLine, ...restLines] = description.split(/\r?\n/);
		if (restLines.length === 0) {
			return `${name}${padding}${firstLine}`;
		}

		const fullPadding = ' '.repeat(maxNameLengh + spaces);
		restLines = restLines.map(line => fullPadding + line).join('\n');

		return `${name}${padding}${firstLine}\n${restLines}`;
	});

	return lines;
}

module.exports = (options, defaultDescription) => {
	let lines = [];

	let {description} = options;
	if (!description && description !== false) {
		description = defaultDescription;
	}

	if (description) {
		lines.push(redent(description));
	}

	let flagLines;

	const {help} = options;
	if (typeof help === 'string' && help.length > 0) {
		if (lines.length > 0) {
			lines.push('');
		}

		lines.push(redent(help));
	} else {
		if (lines.length > 0) {
			lines.push('');
		}

		flagLines = buildFlagLines(options.flags);
		lines.push('Options:');
		lines.push(flagLines.map(line => redent(line, 2)).join('\n'));
	}

	lines = lines.map(line => trimNewlines(line));

	const content = lines.join('\n').trimEnd();
	const wholeText = '\n' + trimNewlines(redent(content, 2)) + '\n';

	if (typeof help === 'function') {
		return help({wholeText, flagLines, description, options});
	}

	return wholeText;
};
