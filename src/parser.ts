import * as peggy from 'peggy';
import * as fs from 'fs';
import * as path from 'path';

export class SbvrPeggyParser<T = any> {
  private readonly parser!: peggy.Parser;

  constructor(startRule?: string | undefined) {
    try {
      const file = path.join(__dirname, '../grammar/svbr.peggy');
      const grammar = fs.readFileSync(file).toString();
      this.parser = peggy.generate(
        grammar,
        startRule === undefined ? {} : { allowedStartRules: [startRule] }
      );
    } catch (error) {
      console.log(error);
    }
  }

  mustParse(input: string): T {
    return this.parser.parse(input);
  }

  parseOrError(input: string): { ok: T } | { err: peggy.parser.SyntaxError } {
    try {
      return { ok: this.parser.parse(input) };
    } catch (err) {
      if (
        err instanceof
        (this.parser.SyntaxError as any as typeof peggy.parser.SyntaxError)
      ) {
        return { err };
      }
      throw err;
    }
  }

  parse(input: string): T | null {
    const v = this.parseOrError(input);
    return 'ok' in v ? v.ok : null;
  }

  check(input: string): peggy.parser.SyntaxError | null {
    const v = this.parseOrError(input);
    return 'err' in v ? v.err : null;
  }
}

export type PeggyLocation = {
  start: { offset: number; line: number; column: number };
  end: { offset: number; line: number; column: number };
};

export type Token = {
  text: string;
  location: PeggyLocation;
};

export const setOffset = <T>(
  x: T,
  start: { offset: number; line: number; column: number }
): T => {
  if (Array.isArray(x)) {
    x.forEach(v => setOffset(v, start));
  } else if (typeof x === 'object' && x !== null) {
    if (
      'offset' in x &&
      typeof x.offset === 'number' &&
      'line' in x &&
      typeof x.line === 'number' &&
      'column' in x &&
      typeof x.column === 'number'
    ) {
      x.offset += start.offset;
      if (x.line === 1) {
        x.column += start.column - 1;
      }
      x.line += start.line - 1;
    }
    Object.values(x).forEach(v => setOffset(v, start));
  }
  return x;
};