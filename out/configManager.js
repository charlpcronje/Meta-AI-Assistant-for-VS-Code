"use strict";
// src/configManager.ts
// This file contains the ConfigManager class, which handles the extension's configuration
// including API key management and other settings.
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
exports.ConfigManager = void 0;
const vscode = __importStar(require("vscode"));
class ConfigManager {
    constructor(context) {
        this.context = context;
    }
    /**
     * Checks if the API key is set and prompts the user to enter it if not
     */
    checkApiKey() {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                const newApiKey = yield vscode.window.showInputBox({
                    prompt: 'Enter your META AI API Key',
                    password: true
                });
                if (newApiKey) {
                    yield this.setApiKey(newApiKey);
                }
                else {
                    vscode.window.showWarningMessage('META AI API Key is required for this extension to work.');
                }
            }
        });
    }
    /**
     * Gets the API key from the configuration
     * @returns The API key or undefined if not set
     */
    getApiKey() {
        return vscode.workspace.getConfiguration('metaAIAssistant').get('apiKey');
    }
    /**
     * Sets the API key in the configuration
     * @param apiKey The API key to set
     */
    setApiKey(apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace.getConfiguration('metaAIAssistant').update('apiKey', apiKey, true);
        });
    }
    /**
     * Gets the maximum number of tokens per chunk from the configuration
     * @returns The maximum number of tokens
     */
    getMaxTokens() {
        return vscode.workspace.getConfiguration('metaAIAssistant').get('maxTokens') || 2000;
    }
    /**
     * Sets the maximum number of tokens per chunk in the configuration
     * @param maxTokens The maximum number of tokens to set
     */
    setMaxTokens(maxTokens) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace.getConfiguration('metaAIAssistant').update('maxTokens', maxTokens, true);
        });
    }
    /**
     * Gets the chat history from the extension's global state
     * @returns An array of chat history items
     */
    getChatHistory() {
        return this.context.globalState.get('chatHistory', []);
    }
    /**
     * Adds a new chat to the chat history
     * @param chatId The ID of the chat to add
     * @param chatTitle The title of the chat to add
     */
    addChatToHistory(chatId, chatTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatHistory = this.getChatHistory();
            chatHistory.push({ id: chatId, title: chatTitle, timestamp: new Date().toISOString() });
            yield this.context.globalState.update('chatHistory', chatHistory);
        });
    }
    /**
     * Removes a chat from the chat history
     * @param chatId The ID of the chat to remove
     */
    removeChatFromHistory(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatHistory = this.getChatHistory();
            const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
            yield this.context.globalState.update('chatHistory', updatedHistory);
        });
    }
    /**
     * Clears the entire chat history
     */
    clearChatHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.context.globalState.update('chatHistory', []);
        });
    }
    /**
     * Gets a configuration value
     * @param key The configuration key
     * @returns The configuration value or undefined if not set
     */
    getConfig(key) {
        return vscode.workspace.getConfiguration('metaAIAssistant').get(key);
    }
    /**
     * Sets a configuration value
     * @param key The configuration key
     * @param value The value to set
     */
    setConfig(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace.getConfiguration('metaAIAssistant').update(key, value, true);
        });
    }
}
exports.ConfigManager = ConfigManager;
