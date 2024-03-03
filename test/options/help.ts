import test from 'ava';
import indentString from 'indent-string';
import meow from '../../source/index.js';
import {
	_verifyCli,
	type MeowOptions,
	stripIndent,
	stripIndentTrim,
} from '../_utils.js';

const importMeta = import.meta;

const verifyCli = _verifyCli();

type VerifyHelpMacroArguments = [{
	cli: MeowOptions | [helpMessage: string, options?: MeowOptions];
	expected: string;
}];

const verifyHelp = test.macro<VerifyHelpMacroArguments>(async (t, {cli: cliArguments, expected}) => {
	const assertions = await t.try(async tt => {
		const cli = Array.isArray(cliArguments)
			? meow(cliArguments[0], {importMeta, ...cliArguments[1]})
			: meow({importMeta, ...cliArguments});

		tt.log('help text:\n', cli.help);
		tt.is(cli.help, expected);
	});

	assertions.commit({retainLogs: !assertions.passed});
});

test('support help shortcut', verifyHelp, {
	cli: [`
		unicorn
		cat
	`],
	expected: indentString(stripIndent`

		CLI app helper

		unicorn
		cat
	`, 2),
});

test('spawn cli and show help screen', verifyCli, {
	args: '--help',
	expected: indentString(stripIndent`

		Custom description

		Usage
		  foo <input>

	`, 2),
});

test('spawn cli and disabled autoHelp', verifyCli, {
	args: '--help --no-auto-help',
	expected: stripIndentTrim`
		help
		autoHelp
		meow
		camelCaseOption
	`,
});

test('spawn cli and not show help', verifyCli, {
	args: '--help=all',
	expected: stripIndentTrim`
		help
		meow
		camelCaseOption
	`,
});

test('single line help messages are not indented', verifyHelp, {
	cli: {
		description: false,
		help: 'single line',
	},
	expected: stripIndent`

		single line
	`,
});

test('descriptions with no help are not indented', verifyHelp, {
	cli: {
		help: false,
		description: 'single line',
	},
	expected: stripIndent`

		single line
	`,

});

test('support help shortcut with no indentation', verifyHelp, {
	cli: [`
		unicorn
		cat
	`, {
		helpIndent: 0,
	}],
	expected: stripIndent`

		CLI app helper

		unicorn
		cat
	`,
});

test('no description and no indentation', verifyHelp, {
	cli: [`
		unicorn
		cat
	`, {
		helpIndent: 0,
		description: false,
	}],
	expected: stripIndent`

		unicorn
		cat
	`,
});

test('exits with code 0 by default', verifyCli, {
	args: '--help',
});

test('showHelp exits with code 2 by default', verifyCli, {
	fixture: 'help/fixture.ts',
	args: '--show-help',
	error: {
		message: stripIndent`

			foo
		`,
		code: 2,
	},
});

test('showHelp exits with given code', verifyCli, {
	fixture: 'help/fixture.ts',
	args: '--show-help --code=0',
	expected: stripIndent`

		foo
	`,
});
