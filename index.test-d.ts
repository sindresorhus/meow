import {expectType} from 'tsd';
import {PackageJson} from 'type-fest';
import meow = require('.');
import {Result} from '.';

expectType<Result>(meow('Help text'));
expectType<Result>(meow('Help text', {hardRejection: false}));
expectType<Result>(
	meow({
		flags: {
			unicorn: {
				type: 'boolean',
				alias: 'u'
			},
			fooBar: {
				type: 'string',
				default: 'foo'
			}
		}
	})
);
expectType<Result>(meow({description: 'foo'}));
expectType<Result>(meow({description: false}));
expectType<Result>(meow({help: 'foo'}));
expectType<Result>(meow({help: false}));
expectType<Result>(meow({version: 'foo'}));
expectType<Result>(meow({version: false}));
expectType<Result>(meow({autoHelp: false}));
expectType<Result>(meow({autoVersion: false}));
expectType<Result>(meow({pkg: {foo: 'bar'}}));
expectType<Result>(meow({argv: ['foo', 'bar']}));
expectType<Result>(meow({inferType: true}));
expectType<Result>(meow({booleanDefault: true}));
expectType<Result>(meow({booleanDefault: null}));
expectType<Result>(meow({booleanDefault: undefined}));
expectType<Result>(meow({hardRejection: false}));

const result = meow('Help text');

expectType<string[]>(result.input);
expectType<{[name: string]: unknown}>(result.flags);
expectType<{[name: string]: unknown}>(result.unnormalizedFlags);
expectType<PackageJson>(result.pkg);
expectType<string>(result.help);

result.showHelp();
result.showHelp(1);
result.showVersion();
