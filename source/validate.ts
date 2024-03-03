import process from 'node:process';
import {decamelizeFlagKey} from './utils.js';
import type {
	AnyFlag,
	AnyFlags,
	ParsedOptions,
	ParsedFlags,
} from './types.js';

type FlagInput = string | number;
type Flags = Record<string, FlagInput[]>;
type Options = Omit<ParsedOptions, 'pkg'>;
type DefinedFlags = Options['flags'];
type RequiredFlag = DefinedFlags[keyof DefinedFlags] & {key: string};

const validateFlags = (flags: Flags, options: Options): void => {
	for (const [flagKey, flagValue] of Object.entries(options.flags)) {
		if (flagKey !== '--' && !flagValue.isMultiple && Array.isArray(flags[flagKey])) {
			throw new Error(`The flag --${flagKey} can only be set once.`);
		}
	}
};

const validateChoicesByFlag = (flagKey: string, flagValue: AnyFlag, receivedInput: FlagInput | FlagInput[] | undefined): string | void => {
	const {choices, isRequired} = flagValue;

	if (!choices) {
		return;
	}

	const valueMustBeOneOf = `Value must be one of: [\`${choices.join('`, `')}\`]`;

	if (!receivedInput) {
		if (isRequired) {
			return `Flag \`${decamelizeFlagKey(flagKey)}\` has no value. ${valueMustBeOneOf}`;
		}

		return;
	}

	if (Array.isArray(receivedInput)) {
		const unknownValues = receivedInput.filter(index => !choices.includes(index as never)); // TODO: never?

		if (unknownValues.length > 0) {
			const valuesText = unknownValues.length > 1 ? 'values' : 'value';

			return `Unknown ${valuesText} for flag \`${decamelizeFlagKey(flagKey)}\`: \`${unknownValues.join('`, `')}\`. ${valueMustBeOneOf}`;
		}
	} else if (!choices.includes(receivedInput as never)) {
		return `Unknown value for flag \`${decamelizeFlagKey(flagKey)}\`: \`${receivedInput}\`. ${valueMustBeOneOf}`;
	}
};

const validateChoices = (flags: DefinedFlags, receivedFlags: Flags): void => {
	const errors = [];

	for (const [flagKey, flagValue] of Object.entries(flags)) {
		const receivedInput = receivedFlags[flagKey];
		const errorMessage = validateChoicesByFlag(flagKey, flagValue, receivedInput);

		if (errorMessage) {
			errors.push(errorMessage);
		}
	}

	if (errors.length > 0) {
		throw new Error(`${errors.join('\n')}`);
	}
};

export const validate = (flags: Flags, options: Options): void => {
	validateFlags(flags, options);
	validateChoices(options.flags, flags);
};

const reportUnknownFlags = (unknownFlags: string[]): void => {
	console.error([
		`Unknown flag${unknownFlags.length > 1 ? 's' : ''}`,
		...unknownFlags,
	].join('\n'));
};

export const checkUnknownFlags = (input: Array<string | number>): void => {
	const unknownFlags = input.filter((item): item is string => typeof item === 'string' && item.startsWith('-'));
	if (unknownFlags.length > 0) {
		reportUnknownFlags(unknownFlags);
		process.exit(2);
	}
};

const isFlagMissing = (flagName: string, flag: AnyFlag, receivedFlags: ParsedFlags, input: string[]): boolean => {
	let isFlagRequired = true;

	if (typeof flag.isRequired === 'function') {
		isFlagRequired = flag.isRequired(receivedFlags as AnyFlags, input);
		if (typeof isFlagRequired !== 'boolean') {
			throw new TypeError(`Return value for isRequired callback should be of type boolean, but ${typeof isFlagRequired} was returned.`);
		}
	}

	const receivedFlag = receivedFlags[flagName];

	if (receivedFlag === undefined) {
		return isFlagRequired;
	}

	return Boolean(flag.isMultiple) && (receivedFlag as any[]).length === 0 && isFlagRequired;
};

const reportMissingRequiredFlags = (missingRequiredFlags: RequiredFlag[]): void => {
	console.error(`Missing required flag${missingRequiredFlags.length > 1 ? 's' : ''}`);
	for (const flag of missingRequiredFlags) {
		console.error(`\t${decamelizeFlagKey(flag.key)}${flag.shortFlag ? `, -${flag.shortFlag}` : ''}`);
	}
};

export const checkMissingRequiredFlags = (flags: DefinedFlags, receivedFlags: ParsedFlags, input: string[]): void => {
	if (flags === undefined) {
		return;
	}

	const missingRequiredFlags: RequiredFlag[] = [];

	for (const [flagName, flag] of Object.entries(flags)) {
		if (flag.isRequired && isFlagMissing(flagName, flag, receivedFlags, input)) {
			missingRequiredFlags.push({key: flagName, ...flag});
		}
	}

	if (missingRequiredFlags.length > 0) {
		reportMissingRequiredFlags(missingRequiredFlags);
		process.exit(2);
	}
};
