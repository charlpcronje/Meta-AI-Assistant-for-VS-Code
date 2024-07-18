// src/metaAIManager.ts
// This file contains the MetaAIManager class, which handles interactions with the META AI API
// and manages the chat sessions.

import * as vscode from 'vscode';
import axios from 'axios';
import { ConfigManager } from './configManager';

export class MetaAIManager {
    private configManager: ConfigManager;
    private currentChatId: string | null = null;

    constructor(configManager: ConfigManager) {
        this.configManager = configManager;
    }

    /**
     * Starts a new chat session with the given text
     * @param text The selected text to start the chat with
     * @param filePath The path of the file containing the selected text
     * @param startLine The starting line number of the selection
     * @param endLine The ending line number of the selection
     */
    public async startNewChat(text: string, filePath: string, startLine: number, endLine: number): Promise<void> {
        try {
            const chatId = this.generateChatId();
            this.currentChatId = chatId;
            const prompt = this.formatPrompt(text, filePath, startLine, endLine);
            const response = await this.sendPromptToMetaAI(prompt);
            this.displayResponse(response, chatId);
        } catch (error) {
            vscode.window.showErrorMessage(`Error starting new chat: ${error}`);
        }
    }

    /**
     * Estimates the number of tokens in the given text
     * @param text The text to estimate tokens for
     * @returns Estimated number of tokens
     */
    public estimateTokenCount(text: string): number {
        const avgCharsPerToken = 4; // This is an approximation
        return Math.ceil(text.length / avgCharsPerToken);
    }

    /**
     * Updates the token count in the status bar
     * @param text The selected text
     */
    public updateTokenCount(text: string): void {
        const tokenCount = this.estimateTokenCount(text);
        vscode.window.setStatusBarMessage(`Estimated tokens: ${tokenCount}`);
    }

    /**
     * Opens an existing chat session
     * @param chatId The ID of the chat to open
     */
    public async openExistingChat(chatId: string): Promise<void> {
        try {
            const chatHistory = this.configManager.getChatHistory();
            const chat = chatHistory.find(c => c.id === chatId);
            
            if (!chat) {
                throw new Error('Chat not found');
            }

            this.currentChatId = chatId;

            // Create or focus on a document for this chat
            const document = await this.getOrCreateChatDocument(chat.title);
            await vscode.window.showTextDocument(document);

            // Load chat content (you may need to implement this method)
            const chatContent = await this.loadChatContent(chatId);
            await this.updateChatDocument(document, chatContent);

            vscode.window.showInformationMessage(`Opened chat: ${chat.title}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error opening chat: ${error}`);
        }
    }

    /**
     * Deletes a chat session
     * @param chatId The ID of the chat to delete
     */
    public async deleteChat(chatId: string): Promise<void> {
        try {
            await this.configManager.removeChatFromHistory(chatId);
            
            // If the deleted chat was the current chat, reset currentChatId
            if (this.currentChatId === chatId) {
                this.currentChatId = null;
            }

            // Close the document associated with this chat if it's open
            const chatDocument = this.findChatDocument(chatId);
            if (chatDocument) {
                await vscode.window.showTextDocument(chatDocument, { preview: false, preserveFocus: false });
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            }

            vscode.window.showInformationMessage(`Chat deleted successfully`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error deleting chat: ${error}`);
        }
    }

    /**
     * Gets or creates a document for a chat session
     * @param chatTitle The title of the chat
     * @returns The chat document
     */
    private async getOrCreateChatDocument(chatTitle: string): Promise<vscode.TextDocument> {
        const uri = vscode.Uri.parse(`untitled:${chatTitle}.md`);
        try {
            return await vscode.workspace.openTextDocument(uri);
        } catch {
            return await vscode.workspace.openTextDocument({ language: 'markdown' });
        }
    }

    /**
     * Finds an open document for a chat session
     * @param chatId The ID of the chat
     * @returns The chat document if found, otherwise undefined
     */
    private findChatDocument(chatId: string): vscode.TextDocument | undefined {
        return vscode.workspace.textDocuments.find(doc => doc.fileName.includes(chatId));
    }

    /**
     * Loads the content of a chat session
     * @param chatId The ID of the chat to load
     * @returns The chat content as a string
     */
    private async loadChatContent(chatId: string): Promise<string> {
        // Implement this method to load chat content from storage
        // For now, we'll return a placeholder
        return `Chat content for ${chatId}`;
    }

    /**
     * Updates the content of a chat document
     * @param document The document to update
     * @param content The new content
     */
    private async updateChatDocument(document: vscode.TextDocument, content: string): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            content
        );
        await vscode.workspace.applyEdit(edit);
    }

    /**
     * Adds text to an existing chat session
     * @param text The selected text to add to the chat
     * @param filePath The path of the file containing the selected text
     * @param startLine The starting line number of the selection
     * @param endLine The ending line number of the selection
     */
    public async addToExistingChat(text: string, filePath: string, startLine: number, endLine: number): Promise<void> {
        try {
            if (!this.currentChatId) {
                throw new Error('No active chat session');
            }
            const prompt = this.formatPrompt(text, filePath, startLine, endLine);
            const response = await this.sendPromptToMetaAI(prompt);
            this.displayResponse(response, this.currentChatId);
        } catch (error) {
            vscode.window.showErrorMessage(`Error adding to existing chat: ${error}`);
        }
    }

    /**
     * Generates a unique chat ID
     * @returns A unique string identifier for the chat session
     */
    private generateChatId(): string {
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
    private formatPrompt(text: string, filePath: string, startLine: number, endLine: number): string {
        return `File: ${filePath}\nLines ${startLine}-${endLine}\n\n\`\`\`\n${text}\n\`\`\``;
    }

    /**
     * Sends a prompt to the META AI API
     * @param prompt The formatted prompt to send
     * @returns The response from the META AI API
     */
    private async sendPromptToMetaAI(prompt: string): Promise<string> {
        const apiKey = this.configManager.getApiKey();
        if (!apiKey) {
            throw new Error('API key not set');
        }

        try {
            const response = await axios.post('https://api.meta.ai/v1/chat', {
                prompt: prompt,
                max_tokens: this.configManager.getMaxTokens()
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].text;
        } catch (error) {
            throw new Error(`Failed to send prompt to META AI: ${error}`);
        }
    }

    /**
     * Displays the META AI response in a new editor tab
     * @param response The response from META AI
     * @param chatId The ID of the current chat session
     */
    private async displayResponse(response: string, chatId: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument({
            content: response,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document, { preview: false });
    }
}