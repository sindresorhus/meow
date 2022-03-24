import {expectAssignable, expectError, expectType} from 'tsd';
import {PackageJson} from 'type-fest';
import meow, {Result, AnyFlag} from './index.js';

const importMeta = import.meta;

expectType<Result<never>>(meow('Help text'));
expectType<Result<never>>(meow('Help text', {importMeta, hardRejection: false}));
expectAssignable<{flags: {foo: number}}>(
	meow({importMeta: import.meta, flags: {foo: {type: 'number', isRequired: true}}}),
);
expectAssignable<{flags: {foo: string}}>(
	meow({importMeta, flags: {foo: {type: 'string', isRequired: true}}}),
);
expectAssignable<{flags: {foo: boolean}}>(
	meow({importMeta, flags: {foo: {type: 'boolean', isRequired: true}}}),
);
expectAssignable<{flags: {foo: number | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'number'}}}),
);
expectAssignable<{flags: {foo: string | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'string'}}}),
);
expectAssignable<{flags: {foo: boolean | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'boolean'}}}),
);
expectAssignable<{flags: {foo: number[] | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'number', isMultiple: true}}}),
);
expectAssignable<{flags: {foo: string[] | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'string', isMultiple: true}}}),
);
expectAssignable<{flags: {foo: boolean[] | undefined}}>(
	meow({importMeta, flags: {foo: {type: 'boolean', isMultiple: true}}}),
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
expectType<Result<never>>(meow({importMeta, booleanDefault: undefined}));
expectType<Result<never>>(meow({importMeta, booleanDefault: undefined}));
expectType<Result<never>>(meow({importMeta, hardRejection: false}));

const result = meow('Help text', {
	importMeta,
	flags: {
		foo: {type: 'boolean', alias: 'f'},
		'foo-bar': {type: 'number'},
		bar: {type: 'string', default: ''},
		abc: {type: 'string', isMultiple: true},
	},
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
			alias: 'r',
		},
	},
} as const;

meow('', options);

expectAssignable<AnyFlag>({type: 'string', default: 'cat'});
expectAssignable<AnyFlag>({type: 'number', default: 42});
expectAssignable<AnyFlag>({type: 'boolean', default: true});

expectAssignable<AnyFlag>({type: 'string', default: undefined});
expectAssignable<AnyFlag>({type: 'number', default: undefined});
expectAssignable<AnyFlag>({type: 'boolean', default: undefined});

expectAssignable<AnyFlag>({type: 'string', isMultiple: true, default: ['cat']});
expectAssignable<AnyFlag>({type: 'number', isMultiple: true, default: [42]});
expectAssignable<AnyFlag>({type: 'boolean', isMultiple: true, default: [false]});

expectError<AnyFlag>({type: 'string', isMultiple: true, default: 'cat'});
expectError<AnyFlag>({type: 'number', isMultiple: true, default: 42});
expectError<AnyFlag>({type: 'boolean', isMultiple: true, default: false});
