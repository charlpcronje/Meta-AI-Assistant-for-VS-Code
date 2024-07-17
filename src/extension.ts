// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Meta AI Assistant extension activated!');

    let disposable = vscode.commands.registerCommand('metaAIAssistant.startChat', () => {
        // Command implementation goes here
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
