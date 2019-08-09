import {expectType} from 'tsd';
import {PackageJson} from 'type-fest';
import meow = require('.');
import {Result} from '.';

expectType<Result<never>>(meow('Help text'));
expectType<Result<never>>(meow('Help text', {hardRejection: false}));
expectType<{flags: {foo: number}}>(
	meow({flags: {foo: {type: 'number'}}})
);
expectType<{flags: {foo: string}}>(
	meow({flags: {foo: {type: 'string'}}})
);
expectType<{flags: {foo: boolean}}>(
	meow({flags: {foo: {type: 'boolean'}}})
);
expectType<{flags: {foo: number}}>(
	meow({flags: {foo: 'number'}})
);
expectType<{flags: {foo: string}}>(
	meow({flags: {foo: 'string'}})
);
expectType<{flags: {foo: boolean}}>(
	meow({flags: {foo: 'boolean'}})
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

const result = meow('Help text');

expectType<string[]>(result.input);
expectType<{[name: string]: unknown}>(result.unnormalizedFlags);
expectType<PackageJson>(result.pkg);
expectType<string>(result.help);

result.showHelp();
result.showHelp(1);
result.showVersion();
