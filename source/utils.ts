import decamelize from 'decamelize';

export const decamelizeFlagKey = (flagKey: string) => `--${decamelize(flagKey, {separator: '-'})}`;

export const joinFlagKeys = (flagKeys: string[], prefix = '--') => `\`${prefix}${flagKeys.join(`\`, \`${prefix}`)}\``;
