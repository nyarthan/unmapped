/**
 * @see {@link https://tc39.es/ecma426/#sec-json-values-utilities}
 */

export class JSONParseError extends Error {
	constructor(message: string) {
		super(message);
	}
}

/**
 * The abstract operation ParseJSON takes argument string (a String) and returns a {@link JSONValue | JSON Value}.
 *
 * @see {@link https://tc39.es/ecma426/#sec-ParseJSON}
 */
export function parseJSON(string: string): JSONValue {
	try {
		return JSON.parse(string) as JSONValue;
	} catch (error) {
		throw new JSONParseError(error.message);
	}
}

/**
 * The abstract operation StringSplit takes arguments string (a String) and separators (a List of String) and returns a List of Strings.
 * It splits the string in substrings separated by any of the elements of separators.
 * If multiple separators match, those appearing first in separators have higher priority.
 *
 * @see {@link https://tc39.es/ecma426/#sec-StringSplit}
 */
export function stringSplit(
	string: string,
	separators: Array<string>,
): Array<string> {
	const parts: Array<string> = [];
	const strLen = string.length;

	let lastStart = 0;
	let i = 0;

	while (i < strLen) {
		let matched = false;

		for (const sep of separators) {
			const sepLen = sep.length;
			const candidate = string.slice(i, Math.min(i + sepLen, strLen));
			if (candidate === sep && !matched) {
				const chunk = string.slice(lastStart, i);
				parts.push(chunk);
				lastStart = i + sepLen;
				i += sepLen;
				matched = true;
			}
		}

		if (!matched) i++;
	}

	const chunk = string.slice(lastStart, strLen);
	parts.push(chunk);

	return parts;
}

export type JSONValue =
	| JSONObject
	| JSONArray
	| String
	| Number
	| Boolean
	| null;

export type JSONObject = {
	[key: string]: JSONValue;
};

export type JSONArray = Array<JSONValue>;
