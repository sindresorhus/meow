import decamelize from 'decamelize';

export const decamelizeFlagKey = flagKey => `--${decamelize(flagKey, {separator: '-'})}`;

export const joinFlagKeys = (flagKeys, prefix = '--') => `\`${prefix}${flagKeys.join(`\`, \`${prefix}`)}\``;
