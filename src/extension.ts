// src/extension.ts
// This file is the entry point for the META AI Assistant VS Code extension.
// It handles the activation and deactivation of the extension, and sets up the command handlers.

import * as vscode from 'vscode';
import { MetaAIManager } from './metaAIManager';
import { ChatViewProvider } from './chatViewProvider';
import { ConfigManager } from './configManager';
import { CodeEditManager } from './codeEditManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('META AI Assistant extension is now active');

    const configManager = new ConfigManager(context);
    const metaAIManager = new MetaAIManager(configManager);
    const chatViewProvider = new ChatViewProvider(context, metaAIManager);
    const codeEditManager = new CodeEditManager();

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider)
    );

    // Register the startChat command
    context.subscriptions.push(
        vscode.commands.registerCommand('metaAIAssistant.startChat', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    const text = editor.document.getText(selection);
                    const filePath = editor.document.uri.fsPath;
                    const startLine = selection.start.line + 1;
                    const endLine = selection.end.line + 1;
                    await metaAIManager.startNewChat(text, filePath, startLine, endLine);
                } else {
                    vscode.window.showInformationMessage('Please select some text to start a chat.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error starting chat: ${error}`);
            }
        })
    );

    // Register the addToChat command
    context.subscriptions.push(
        vscode.commands.registerCommand('metaAIAssistant.addToChat', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const selection = editor.selection;
                    const text = editor.document.getText(selection);
                    const filePath = editor.document.uri.fsPath;
                    const startLine = selection.start.line + 1;
                    const endLine = selection.end.line + 1;
                    await metaAIManager.addToExistingChat(text, filePath, startLine, endLine);
                } else {
                    vscode.window.showInformationMessage('Please select some text to add to the chat.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error adding to chat: ${error}`);
            }
        })
    );

    // Register the updateTokenCount command
    context.subscriptions.push(
        vscode.commands.registerCommand('metaAIAssistant.updateTokenCount', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                metaAIManager.updateTokenCount(text);
            }
        })
    );

    // Register the applyChanges command
    context.subscriptions.push(
        vscode.commands.registerCommand('metaAIAssistant.applyChanges', async (originalText: string, modifiedText: string) => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await codeEditManager.showDiffAndApplyChanges(originalText, modifiedText, editor.document.uri);
            } else {
                vscode.window.showErrorMessage('No active text editor found.');
            }
        })
    );

    // Listen for selection changes to update token count
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection((event) => {
            const editor = event.textEditor;
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            metaAIManager.updateTokenCount(text);
        })
    );

    // Check for API key on activation
    configManager.checkApiKey();
}

export function deactivate() {
    console.log('META AI Assistant extension is now deactivated');
}