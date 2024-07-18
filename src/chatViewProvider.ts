// src/chatViewProvider.ts
// This file contains the ChatViewProvider class, which manages the chat history sidebar
// and handles interactions with the chat history.

import * as vscode from 'vscode';
import { MetaAIManager } from './metaAIManager';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'metaAIChatHistory';

    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;
    private _metaAIManager: MetaAIManager;

    constructor(
        private readonly _context: vscode.ExtensionContext,
        metaAIManager: MetaAIManager
    ) {
        this._extensionUri = _context.extensionUri;
        this._metaAIManager = metaAIManager;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'openChat':
                    await this._metaAIManager.openExistingChat(data.chatId);
                    break;
                case 'deleteChat':
                    await this._metaAIManager.deleteChat(data.chatId);
                    this._view?.webview.postMessage({ type: 'refreshChatList' });
                    break;
            }
        });

        this._context.subscriptions.push(
            vscode.commands.registerCommand('metaAIAssistant.refreshChatHistory', () => {
                this._view?.webview.postMessage({ type: 'refreshChatList' });
            })
        );
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>META AI Chat History</title>
            </head>
            <body>
                <h1>META AI Chat History</h1>
                <div id="chat-list"></div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    public updateChatList(chats: any[]) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateChatList',
                chats: chats
            });
        }
    }
}