import { describe, it } from "node:test";
import * as assert from "node:assert/strict";

import { JSONParseError, parseJSON, stringSplit } from "./json.ts";

describe(parseJSON.name, () => {
	it("parses valid JSON", () => {
		const value = '{"foo": {"bar": [{"baz": "fizz"}, 1, false, null]}}';
		const result = parseJSON(value);
		assert.deepStrictEqual(result, {
			foo: { bar: [{ baz: "fizz" }, 1, false, null] },
		});
	});

	it("throws JSONParseError on invalid input", () => {
		const value = "{foo: undefined}";
		const fn = () => parseJSON(value);
		assert.throws(fn, JSONParseError);
	});
});

describe(stringSplit.name, () => {
	it("splits string with single separator", () => {
		const str = "foo-bar";
		const separators = ["-"];
		const result = stringSplit(str, separators);
		assert.deepStrictEqual(result, ["foo", "bar"]);
	});

	it("splits string with multiple separators with priority", () => {
		const str = "foo-bar--baz";
		const separators = ["--", "-"];
		const result = stringSplit(str, separators);
		assert.deepStrictEqual(result, ["foo", "bar", "baz"]);
	});

	it("splits string with no separators", () => {
		const str = "foo-bar";
		const separators = [];
		const result = stringSplit(str, separators);
		assert.deepStrictEqual(result, ["foo-bar"]);
	});

	it("splits string with no matching separators", () => {
		const str = "foo-bar";
		const separators = ["|"];
		const result = stringSplit(str, separators);
		assert.deepStrictEqual(result, ["foo-bar"]);
	});

	it("splits empty string", () => {
		const str = "";
		const separators = ["-"];
		const result = stringSplit(str, separators);
		assert.deepStrictEqual(result, [""]);
	});

	it("splits empty string and no separators", () => {
		const str = "";
		const separators = [];
		const result = stringSplit(str, separators);
		assert.deepStrictEqual(result, [""]);
	});
});
