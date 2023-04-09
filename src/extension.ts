import * as vscode from 'vscode';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';

export function activate(context: vscode.ExtensionContext) {

  const serverModule = context.asAbsolutePath('out/src/server.js');
  const client = new LanguageClient(
    'sbvr',
    'sbvr',
    {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: { execArgv: ['--nolazy', '--inspect=6009'] },
      },
    },
    {
      documentSelector: [{ language: 'sbvr', scheme: 'file' }],
    }
  );
  context.subscriptions.push(client);
  client.start();
}
