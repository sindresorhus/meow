import {expectAssignable, expectType} from 'tsd';
import {PackageJson} from 'type-fest';
import meow, {Result} from './index.js';

const importMeta = import.meta;

expectType<Result<never>>(meow('Help text'));
expectType<Result<never>>(meow('Help text', {importMeta, hardRejection: false}));
expectAssignable<{flags: {foo: number}}>(
	meow({importMeta: import.meta, flags: {foo: {type: 'number', isRequired: true}}})
);
expectAssignable<{flags: {foo: string}}>(
	meow({importMeta, flags: {foo: {type: 'string', isRequired: true}}})
);
expectAssignable<{flags: {foo: boolean}}>(
	meow({importMeta, flags: {foo: {type: 'boolean', isRequired: true}}})
);
expectAssignable<{flags: {foo: number | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'number'}}})
);
expectAssignable<{flags: {foo: string | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'string'}}})
);
expectAssignable<{flags: {foo: boolean | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'boolean'}}})
);
expectType<Result<never>>(meow({importMeta, description: 'foo'}));
expectType<Result<never>>(meow({importMeta, description: false}));
expectType<Result<never>>(meow({importMeta, help: 'foo'}));
expectType<Result<never>>(meow({importMeta, help: false}));
expectType<Result<never>>(meow({importMeta, version: 'foo'}));
expectType<Result<never>>(meow({importMeta, version: false}));
expectType<Result<never>>(meow({importMeta, autoHelp: false}));
expectType<Result<never>>(meow({importMeta, autoVersion: false}));
expectType<Result<never>>(meow({importMeta, pkg: {foo: 'bar'}}));
expectType<Result<never>>(meow({importMeta, argv: ['foo', 'bar']}));
expectType<Result<never>>(meow({importMeta, inferType: true}));
expectType<Result<never>>(meow({importMeta, booleanDefault: true}));
expectType<Result<never>>(meow({importMeta, booleanDefault: null}));
expectType<Result<never>>(meow({importMeta, booleanDefault: undefined}));
expectType<Result<never>>(meow({importMeta, hardRejection: false}));

const result = meow('Help text', {
	importMeta,
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
	importMeta,
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
} as const;

meow('', options);
