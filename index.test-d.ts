import {expectAssignable, expectType} from 'tsd';
import {PackageJson} from 'type-fest';
import meow = require('.');
import {Result} from '.';

expectType<Result<never>>(meow('Help text'));
expectType<Result<never>>(meow('Help text', {hardRejection: false}));
expectAssignable<{flags: {foo: number}}>(
	meow({flags: {foo: {type: 'number'}}})
);
expectAssignable<{flags: {foo: string}}>(
	meow({flags: {foo: {type: 'string'}}})
);
expectAssignable<{flags: {foo: boolean}}>(
	meow({flags: {foo: {type: 'boolean'}}})
);
expectType<Result<never>>(meow({description: 'foo'}));
expectType<Result<never>>(meow({description: false}));
expectType<Result<never>>(meow({help: 'foo'}));
expectType<Result<never>>(meow({help: false}));
expectType<Result<never>>(meow({version: 'foo'}));
expectType<Result<never>>(meow({version: false}));
expectType<Result<never>>(meow({autoHelp: false}));
expectType<Result<never>>(meow({autoVersion: false}));
expectType<Result<never>>(meow({pkg: {foo: 'bar'}}));
expectType<Result<never>>(meow({argv: ['foo', 'bar']}));
expectType<Result<never>>(meow({inferType: true}));
expectType<Result<never>>(meow({booleanDefault: true}));
expectType<Result<never>>(meow({booleanDefault: null}));
expectType<Result<never>>(meow({booleanDefault: undefined}));
expectType<Result<never>>(meow({hardRejection: false}));

const result = meow('Help text', {
	flags: {
		foo: {type: 'boolean', alias: 'f'},
		'foo-bar': {type: 'number'},
		bar: {type: 'string', default: ''}
	}
});

expectType<string[]>(result.input);
expectType<PackageJson>(result.pkg);
expectType<string>(result.help);

expectType<boolean>(result.flags.foo);
expectType<unknown>(result.flags.fooBar);
expectType<string>(result.flags.bar);
expectType<boolean>(result.unnormalizedFlags.foo);
expectType<unknown>(result.unnormalizedFlags.f);
expectType<number>(result.unnormalizedFlags['foo-bar']);
expectType<string>(result.unnormalizedFlags.bar);

result.showHelp();
result.showHelp(1);
result.showVersion();
