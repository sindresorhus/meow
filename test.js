'use strict';
var test = require('ava');
var meow = require('./');

test('return object', function (t) {
	var cli = meow({argv: ['foo', '--foo-bar']});
	t.assert(cli.input[0] === 'foo');
	t.assert(cli.flags.fooBar);
	t.assert(cli.pkg.name === 'meow');
	t.end();
});
