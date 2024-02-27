import test from 'ava';
import {spawnFixture, stripIndentTrim} from '../_utils.js';

test('spawn cli and disabled autoVersion and autoHelp', async t => {
	const {stdout} = await spawnFixture(['--version', '--help']);

	t.is(stdout, stripIndentTrim`
		version
		help
		meow
		camelCaseOption
	`);
});
