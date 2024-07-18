"use strict";
// src/metaAIManager.ts
// This file contains the MetaAIManager class, which handles interactions with the META AI API
// and manages the chat sessions.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAIManager = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class MetaAIManager {
    constructor(configManager) {
        this.currentChatId = null;
        this.configManager = configManager;
    }
    /**
     * Starts a new chat session with the given text
     * @param text The selected text to start the chat with
     * @param filePath The path of the file containing the selected text
     * @param startLine The starting line number of the selection
     * @param endLine The ending line number of the selection
     */
    startNewChat(text, filePath, startLine, endLine) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatId = this.generateChatId();
                this.currentChatId = chatId;
                const prompt = this.formatPrompt(text, filePath, startLine, endLine);
                const response = yield this.sendPromptToMetaAI(prompt);
                this.displayResponse(response, chatId);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error starting new chat: ${error}`);
            }
        });
    }
    /**
     * Estimates the number of tokens in the given text
     * @param text The text to estimate tokens for
     * @returns Estimated number of tokens
     */
    estimateTokenCount(text) {
        const avgCharsPerToken = 4; // This is an approximation
        return Math.ceil(text.length / avgCharsPerToken);
    }
    /**
     * Updates the token count in the status bar
     * @param text The selected text
     */
    updateTokenCount(text) {
        const tokenCount = this.estimateTokenCount(text);
        vscode.window.setStatusBarMessage(`Estimated tokens: ${tokenCount}`);
    }
    /**
     * Opens an existing chat session
     * @param chatId The ID of the chat to open
     */
    openExistingChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatHistory = this.configManager.getChatHistory();
                const chat = chatHistory.find(c => c.id === chatId);
                if (!chat) {
                    throw new Error('Chat not found');
                }
                this.currentChatId = chatId;
                // Create or focus on a document for this chat
                const document = yield this.getOrCreateChatDocument(chat.title);
                yield vscode.window.showTextDocument(document);
                // Load chat content (you may need to implement this method)
                const chatContent = yield this.loadChatContent(chatId);
                yield this.updateChatDocument(document, chatContent);
                vscode.window.showInformationMessage(`Opened chat: ${chat.title}`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error opening chat: ${error}`);
            }
        });
    }
    /**
     * Deletes a chat session
     * @param chatId The ID of the chat to delete
     */
    deleteChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.configManager.removeChatFromHistory(chatId);
                // If the deleted chat was the current chat, reset currentChatId
                if (this.currentChatId === chatId) {
                    this.currentChatId = null;
                }
                // Close the document associated with this chat if it's open
                const chatDocument = this.findChatDocument(chatId);
                if (chatDocument) {
                    yield vscode.window.showTextDocument(chatDocument, { preview: false, preserveFocus: false });
                    yield vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                }
                vscode.window.showInformationMessage(`Chat deleted successfully`);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error deleting chat: ${error}`);
            }
        });
    }
    /**
     * Gets or creates a document for a chat session
     * @param chatTitle The title of the chat
     * @returns The chat document
     */
    getOrCreateChatDocument(chatTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = vscode.Uri.parse(`untitled:${chatTitle}.md`);
            try {
                return yield vscode.workspace.openTextDocument(uri);
            }
            catch (_a) {
                return yield vscode.workspace.openTextDocument({ language: 'markdown' });
            }
        });
    }
    /**
     * Finds an open document for a chat session
     * @param chatId The ID of the chat
     * @returns The chat document if found, otherwise undefined
     */
    findChatDocument(chatId) {
        return vscode.workspace.textDocuments.find(doc => doc.fileName.includes(chatId));
    }
    /**
     * Loads the content of a chat session
     * @param chatId The ID of the chat to load
     * @returns The chat content as a string
     */
    loadChatContent(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implement this method to load chat content from storage
            // For now, we'll return a placeholder
            return `Chat content for ${chatId}`;
        });
    }
    /**
     * Updates the content of a chat document
     * @param document The document to update
     * @param content The new content
     */
    updateChatDocument(document, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), content);
            yield vscode.workspace.applyEdit(edit);
        });
    }
    /**
     * Adds text to an existing chat session
     * @param text The selected text to add to the chat
     * @param filePath The path of the file containing the selected text
     * @param startLine The starting line number of the selection
     * @param endLine The ending line number of the selection
     */
    addToExistingChat(text, filePath, startLine, endLine) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.currentChatId) {
                    throw new Error('No active chat session');
                }
                const prompt = this.formatPrompt(text, filePath, startLine, endLine);
                const response = yield this.sendPromptToMetaAI(prompt);
                this.displayResponse(response, this.currentChatId);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error adding to existing chat: ${error}`);
            }
        });
    }
    /**
     * Generates a unique chat ID
     * @returns A unique string identifier for the chat session
     */
    generateChatId() {
        return `chat_${Date.now()}`;
    }
    /**
     * Formats the prompt with file information and code
     * @param text The selected text
     * @param filePath The path of the file containing the selected text
     * @param startLine The starting line number of the selection
     * @param endLine The ending line number of the selection
     * @returns Formatted prompt string
     */
    formatPrompt(text, filePath, startLine, endLine) {
        return `File: ${filePath}\nLines ${startLine}-${endLine}\n\n\`\`\`\n${text}\n\`\`\``;
    }
    /**
     * Sends a prompt to the META AI API
     * @param prompt The formatted prompt to send
     * @returns The response from the META AI API
     */
    sendPromptToMetaAI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = this.configManager.getApiKey();
            if (!apiKey) {
                throw new Error('API key not set');
            }
            try {
                const response = yield axios_1.default.post('https://api.meta.ai/v1/chat', {
                    prompt: prompt,
                    max_tokens: this.configManager.getMaxTokens()
                }, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response.data.choices[0].text;
            }
            catch (error) {
                throw new Error(`Failed to send prompt to META AI: ${error}`);
            }
        });
    }
    /**
     * Displays the META AI response in a new editor tab
     * @param response The response from META AI
     * @param chatId The ID of the current chat session
     */
    displayResponse(response, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument({
                content: response,
                language: 'markdown'
            });
            yield vscode.window.showTextDocument(document, { preview: false });
        });
    }
}
exports.MetaAIManager = MetaAIManager;
