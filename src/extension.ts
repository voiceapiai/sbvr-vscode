import * as vscode from 'vscode';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { SBVRParser } from '@balena/sbvr-parser';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function () {
  const tokenTypesLegend = [
    'comment',
    'string',
    'keyword',
    'number',
    'regexp',
    'operator',
    'namespace',
    'type',
    'struct',
    'class',
    'interface',
    'enum',
    'typeParameter',
    'function',
    'method',
    'decorator',
    'macro',
    'variable',
    'parameter',
    'property',
    'label',
  ];
  tokenTypesLegend.forEach((tokenType, index) =>
    tokenTypes.set(tokenType, index)
  );

  const tokenModifiersLegend = [
    'declaration',
    'documentation',
    'readonly',
    'static',
    'abstract',
    'deprecated',
    'modification',
    'async',
  ];
  tokenModifiersLegend.forEach((tokenModifier, index) =>
    tokenModifiers.set(tokenModifier, index)
  );

  return new vscode.SemanticTokensLegend(
    tokenTypesLegend,
    tokenModifiersLegend
  );
})();

export function activate(context: vscode.ExtensionContext) {
  const tokensProvider =
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: 'sbvr' },
      new SbvrTokensProvider(),
      legend
    );
  context.subscriptions.push(tokensProvider);

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    'sbvr',
    new SbvrDefinitionProvider()
  );
  context.subscriptions.push(definitionProvider);

  const documentSymbolProvider =
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'sbvr' },
      new SbvrDocumentSymbolProvider()
    );
  context.subscriptions.push(documentSymbolProvider);
}

interface IParsedToken {
  line: number;
  startCharacter: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
}

class SbvrTokensProvider implements vscode.DocumentSemanticTokensProvider {
  async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SemanticTokens> {
    const allTokens = this._parseText(document.getText());
    const builder = new vscode.SemanticTokensBuilder();
    allTokens.forEach(token => {
      builder.push(
        token.line,
        token.startCharacter,
        token.length,
        this._encodeTokenType(token.tokenType),
        this._encodeTokenModifiers(token.tokenModifiers)
      );
    });
    return builder.build();
  }

  private _encodeTokenType(tokenType: string): number {
    if (tokenTypes.has(tokenType)) {
      return tokenTypes.get(tokenType)!;
    } else if (tokenType === 'notInLegend') {
      return tokenTypes.size + 2;
    }
    return 0;
  }

  private _encodeTokenModifiers(strTokenModifiers: string[]): number {
    let result = 0;
    for (let i = 0; i < strTokenModifiers.length; i++) {
      const tokenModifier = strTokenModifiers[i];
      if (tokenModifiers.has(tokenModifier)) {
        result = result | (1 << tokenModifiers.get(tokenModifier)!);
      } else if (tokenModifier === 'notInLegend') {
        result = result | (1 << (tokenModifiers.size + 2));
      }
    }
    return result;
  }

  private _parseText(text: string): IParsedToken[] {
    const r: IParsedToken[] = [];
    const lines = text.split(/\r\n|\r|\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let currentOffset = 0;
      do {
        const openOffset = line.indexOf('[', currentOffset);
        if (openOffset === -1) {
          break;
        }
        const closeOffset = line.indexOf(']', openOffset);
        if (closeOffset === -1) {
          break;
        }
        const tokenData = this._parseTextToken(
          line.substring(openOffset + 1, closeOffset)
        );
        r.push({
          line: i,
          startCharacter: openOffset + 1,
          length: closeOffset - openOffset - 1,
          tokenType: tokenData.tokenType,
          tokenModifiers: tokenData.tokenModifiers,
        });
        currentOffset = closeOffset;
      } while (true);
    }
    return r;
  }

  private _parseTextToken(text: string): {
    tokenType: string;
    tokenModifiers: string[];
  } {
    const parts = text.split('.');
    return {
      tokenType: parts[0],
      tokenModifiers: parts.slice(1),
    };
  }
}

class SbvrDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    return null;
  }
}

class SbvrDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  private format(cmd: string): string {
    return cmd
      .substr(1)
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }

  public provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentSymbol[]> {
    return new Promise((resolve, reject) => {
      const symbols: vscode.DocumentSymbol[] = [];
      const nodes = [symbols];
      const inside_obj = false;
      const inside_prop = false;
      const inside_userinput = false;

      const symbolkind_obj = vscode.SymbolKind.Object;
      const symbolkind_prop = vscode.SymbolKind.Property;
      const symbolkind_mtd = vscode.SymbolKind.Method;

      /*   const marker_symbol = new vscode.DocumentSymbol(
        'Marker',
        'Component',
        symbolkind_obj,
        line.range,
        line.range
      ); */

      const parser = SBVRParser.createInstance();
      const text = document.getText();
      parser.setInput(text);
      const LF = parser.matchAll(text, 'Process');

      // console.log(parser.lines);

      resolve(symbols);
    });
  }
}
