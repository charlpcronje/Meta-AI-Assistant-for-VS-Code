"use strict";
// src/chatViewProvider.ts
// This file contains the ChatViewProvider class, which manages the chat history sidebar
// and handles interactions with the chat history.
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
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class ChatViewProvider {
    constructor(_context, metaAIManager) {
        this._context = _context;
        this._extensionUri = _context.extensionUri;
        this._metaAIManager = metaAIManager;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            switch (data.type) {
                case 'openChat':
                    yield this._metaAIManager.openExistingChat(data.chatId);
                    break;
                case 'deleteChat':
                    yield this._metaAIManager.deleteChat(data.chatId);
                    (_a = this._view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({ type: 'refreshChatList' });
                    break;
            }
        }));
        this._context.subscriptions.push(vscode.commands.registerCommand('metaAIAssistant.refreshChatHistory', () => {
            var _a;
            (_a = this._view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({ type: 'refreshChatList' });
        }));
    }
    _getHtmlForWebview(webview) {
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
    updateChatList(chats) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateChatList',
                chats: chats
            });
        }
    }
}
exports.ChatViewProvider = ChatViewProvider;
ChatViewProvider.viewType = 'metaAIChatHistory';
