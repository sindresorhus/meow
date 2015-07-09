'use strict';
var path = require('path');
var minimist = require('minimist');
var indentString = require('indent-string');
var objectAssign = require('object-assign');
var camelcaseKeys = require('camelcase-keys');

// get the uncached parent
delete require.cache[__filename];
var parentDir = path.dirname(module.parent.filename);

module.exports = function (opts, minimistOpts) {
	if (Array.isArray(opts) || typeof opts === 'string') {
		opts = {help: opts};
	}

	opts = objectAssign({
		pkg: './package.json',
		argv: process.argv.slice(2)
	}, opts);

	if (Array.isArray(opts.help)) {
		opts.help = opts.help.join('\n');
	}

	var pkg = typeof opts.pkg === 'string' ? require(path.join(parentDir, opts.pkg)) : opts.pkg;
	var argv = minimist(opts.argv, minimistOpts);
	var help = '\n' + indentString(pkg.description + (opts.help ? '\n\n' + opts.help : '\n'), '  ');
	var showHelp = function (code) {
		console.log(help);
		process.exit(code || 0);
	};

	if (argv.version && opts.version !== false) {
		console.log(typeof opts.version === 'string' ? opts.version : pkg.version);
		process.exit();
	}

	if (argv.help && opts.help !== false) {
		showHelp();
	}

	var _ = argv._;
	delete argv._;

	return {
		input: _,
		flags: camelcaseKeys(argv),
		pkg: pkg,
		help: help,
		showHelp: showHelp
	};
};
