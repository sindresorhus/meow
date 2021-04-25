import {expectAssignable, expectType} from 'tsd';
import {PackageJson} from 'type-fest';
import meow from './index.js';

expectType<meow.Result<never>>(meow('Help text'));
expectType<meow.Result<never>>(meow('Help text', {hardRejection: false}));
expectAssignable<{flags: {foo: number}}>(
	meow({flags: {foo: {type: 'number', isRequired: true}}})
);
expectAssignable<{flags: {foo: string}}>(
	meow({flags: {foo: {type: 'string', isRequired: true}}})
);
expectAssignable<{flags: {foo: boolean}}>(
	meow({flags: {foo: {type: 'boolean', isRequired: true}}})
);
expectAssignable<{flags: {foo: number | undefined}}>(
	meow({flags: {foo: {type: 'number'}}})
);
expectAssignable<{flags: {foo: string | undefined}}>(
	meow({flags: {foo: {type: 'string'}}})
);
expectAssignable<{flags: {foo: boolean | undefined}}>(
	meow({flags: {foo: {type: 'boolean'}}})
);
expectType<meow.Result<never>>(meow({description: 'foo'}));
expectType<meow.Result<never>>(meow({description: false}));
expectType<meow.Result<never>>(meow({help: 'foo'}));
expectType<meow.Result<never>>(meow({help: false}));
expectType<meow.Result<never>>(meow({version: 'foo'}));
expectType<meow.Result<never>>(meow({version: false}));
expectType<meow.Result<never>>(meow({autoHelp: false}));
expectType<meow.Result<never>>(meow({autoVersion: false}));
expectType<meow.Result<never>>(meow({pkg: {foo: 'bar'}}));
expectType<meow.Result<never>>(meow({argv: ['foo', 'bar']}));
expectType<meow.Result<never>>(meow({inferType: true}));
expectType<meow.Result<never>>(meow({booleanDefault: true}));
expectType<meow.Result<never>>(meow({booleanDefault: null}));
expectType<meow.Result<never>>(meow({booleanDefault: undefined}));
expectType<meow.Result<never>>(meow({hardRejection: false}));

const result = meow('Help text', {
	flags: {
		foo: {type: 'boolean', alias: 'f'},
		'foo-bar': {type: 'number'},
		bar: {type: 'string', default: ''},
		abc: {type: 'string', isMultiple: true}
	}
});

expectType<string[]>(result.input);
expectType<PackageJson>(result.pkg);
expectType<string>(result.help);

expectType<boolean | undefined>(result.flags.foo);
expectType<unknown>(result.flags.fooBar);
expectType<string>(result.flags.bar);
expectType<string[] | undefined>(result.flags.abc);
expectType<boolean | undefined>(result.unnormalizedFlags.foo);
expectType<unknown>(result.unnormalizedFlags.f);
expectType<number | undefined>(result.unnormalizedFlags['foo-bar']);
expectType<string>(result.unnormalizedFlags.bar);
expectType<string[] | undefined>(result.unnormalizedFlags.abc);

result.showHelp();
result.showHelp(1);
result.showVersion();

const options = {
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
} as const;

meow('', options);
