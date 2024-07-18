"use strict";
// src/extension.ts
// This file is the entry point for the META AI Assistant VS Code extension.
// It handles the activation and deactivation of the extension, and sets up the command handlers.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const metaAIManager_1 = require("./metaAIManager");
const chatViewProvider_1 = require("./chatViewProvider");
const configManager_1 = require("./configManager");
const codeEditManager_1 = require("./codeEditManager");
function activate(context) {
    console.log('META AI Assistant extension is now active');
    const configManager = new configManager_1.ConfigManager(context);
    const metaAIManager = new metaAIManager_1.MetaAIManager(configManager);
    const chatViewProvider = new chatViewProvider_1.ChatViewProvider(context, metaAIManager);
    const codeEditManager = new codeEditManager_1.CodeEditManager();
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatViewProvider_1.ChatViewProvider.viewType, chatViewProvider));
    // Register the startChat command
    context.subscriptions.push(vscode.commands.registerCommand('metaAIAssistant.startChat', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                const filePath = editor.document.uri.fsPath;
                const startLine = selection.start.line + 1;
                const endLine = selection.end.line + 1;
                yield metaAIManager.startNewChat(text, filePath, startLine, endLine);
            }
            else {
                vscode.window.showInformationMessage('Please select some text to start a chat.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error starting chat: ${error}`);
        }
    })));
    // Register the addToChat command
    context.subscriptions.push(vscode.commands.registerCommand('metaAIAssistant.addToChat', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                const filePath = editor.document.uri.fsPath;
                const startLine = selection.start.line + 1;
                const endLine = selection.end.line + 1;
                yield metaAIManager.addToExistingChat(text, filePath, startLine, endLine);
            }
            else {
                vscode.window.showInformationMessage('Please select some text to add to the chat.');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error adding to chat: ${error}`);
        }
    })));
    // Register the updateTokenCount command
    context.subscriptions.push(vscode.commands.registerCommand('metaAIAssistant.updateTokenCount', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            metaAIManager.updateTokenCount(text);
        }
    }));
    // Register the applyChanges command
    context.subscriptions.push(vscode.commands.registerCommand('metaAIAssistant.applyChanges', (originalText, modifiedText) => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            yield codeEditManager.showDiffAndApplyChanges(originalText, modifiedText, editor.document.uri);
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    })));
    // Listen for selection changes to update token count
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((event) => {
        const editor = event.textEditor;
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        metaAIManager.updateTokenCount(text);
    }));
    // Check for API key on activation
    configManager.checkApiKey();
}
exports.activate = activate;
function deactivate() {
    console.log('META AI Assistant extension is now deactivated');
}
exports.deactivate = deactivate;
