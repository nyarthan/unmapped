import * as z from "zod/mini";

export const sourceMapSchema = z.object({
	version: z.literal(3),
	file: z.optional(z.string()),
	sourceRoot: z.optional(z.string()),
	source: z.array(z.nullable(z.string())),
	sourcesContent: z.optional(z.nullable(z.string())),
	names: z.optional(z.array(z.string())),
	mappings: z.string(),
	ignoreList: z.optional(z.array(z.int())),
});

export function parseSourceMap(
	string: string,
	baseURL: string,
): DecodedSourceMapRecord {
	const json = JSON.parse(string);

	if (json.sections) return decodeIndexSourceMap(json, baseURL);

	return decodeSourceMap(json, baseURL);
}

export function decodeIndexSourceMap(
	json: any,
	baseURL: string,
): DecodedSourceMapRecord {
	const sectionsField = json.sections;
	if (sectionsField === undefined) throw new Error("sectionsField is missing");
	if (!Array.isArray(sectionsField))
		throw new Error("sectionsField must be an array");

	if (json.version !== 3) throw new Error("version must be 3");

	const fileField = json.file;

	const sourceMap: DecodedSourceMapRecord = {
		file: fileField,
		sources: [],
		mappings: [],
	};

	let previousOffsetPosition: PositionRecord | null = null;
	let previousLastMapping: DecodedMappingRecord | null = null;

	for (let i = 0; sectionsField.length; i++) {
		const section = sectionsField[i];
		if (!section) throw new Error("section must be an object");

		const offset = section.offset;
		if (!offset) throw new Error("offset must be an object");

		let offsetLine = offset.line;
		let offsetColumn = offset.column;
		if (typeof offsetLine !== "number" || offsetLine < 0) {
			throw new Error("offsetLine must be an integral number");
			offsetLine = 0;
		}
		if (typeof offsetColumn !== "number" || offsetColumn < 0) {
			throw new Error("offsetColumn must be an integral number");
			offsetColumn = 0;
		}

		const offsetPosition: PositionRecord = {
			line: offsetLine,
			column: offsetColumn,
		};

		if (previousOffsetPosition !== null) {
			if (comparePositions(offsetPosition, previousOffsetPosition) === LESSER) {
				throw new Error("");
			}
		}

		if (previousLastMapping !== null) {
			if (
				comparePositions(
					offsetPosition,
					previousLastMapping.generatedPosition,
				) === LESSER
			) {
				throw new Error("");
			}
		}

		const mapField = section.map;
		if (!mapField) throw new Error("mapField must be an object");

		const decodedSectionCompletion = completion(decodeSourceMap(json, baseURL));
	}
}

function decodeSourceMap(
	json: any,
	baseURL: string,
	reporter: Reporter,
): DecodedSourceMapRecord {
	if (json.version !== 3) reporter.error(new VersionError("Version must be 3"));

	const mappingsField = json.mappings;
	if (typeof mappingsField !== "string")
		throw new Error("MappingsField must be a string.");

	if (!Array.isArray(json.sources))
		throw new Error("Sources must be an Array.");

	const fileField = json.file;
	const sourceRootField = json.sourceRoot;
}

class VersionError extends Error {
	constructor(message: string) {
		super(message);
	}
}

interface Reporter {
	error(error: Error): void;
}

export function comparePositions(
	first: PositionRecord | OriginalPositionRecord,
	second: PositionRecord | OriginalPositionRecord,
): PositionComparison {
	if (first.line < second.line) return PositionComparison.LESSER;
	if (first.line > second.line) return PositionComparison.GREATER;
	if (first.line !== second.line) throw new Error("");
	if (first.column < second.column) return PositionComparison.LESSER;
	if (first.column > second.column) return PositionComparison.GREATER;
	return PositionComparison.EQUAL;
}

const PositionComparison = {
	LESSER: 0,
	EQUAL: 1,
	GREATER: 2,
} as const;
type PositionComparison = Enum<typeof PositionComparison>;

function completion(completionRecord: CompletionRecord) {}

interface CompletionRecord {
	type: CompletionType;
	value: unknown;
	target: string | CompletionTarget;
}

const CompletionType = {
	NORMAL: 0,
	BREAK: 1,
	CONTINUE: 2,
	RETURN: 3,
	THROW: 4,
} as const;
type CompletionType = Enum<typeof CompletionType>;

const CompletionTarget = {
	EMPTY: 0,
} as const;
type CompletionTarget = Enum<typeof CompletionTarget>;

type Enum<Obj extends Record<string, string | number | symbol>> =
	Obj[keyof Obj];

interface DecodedSourceMapRecord {
	file: string;
	sources: Array<DecodedSourceRecord>;
	mappings: Array<DecodedMappingRecord>;
}

interface DecodedSourceRecord {
	url: string | null;
	content: string | null;
	ignored: boolean;
}

interface DecodedMappingRecord {
	generatedPosition: PositionRecord;
	originalPosition: OriginalPositionRecord | null;
	name: string | null;
}

interface PositionRecord {
	line: number;
	column: number;
}

interface OriginalPositionRecord {
	source: DecodedSourceRecord;
	line: number;
	column: number;
}
