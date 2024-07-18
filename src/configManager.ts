// src/configManager.ts
// This file contains the ConfigManager class, which handles the extension's configuration
// including API key management and other settings.

import * as vscode from 'vscode';

export class ConfigManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Checks if the API key is set and prompts the user to enter it if not
     */
    public async checkApiKey(): Promise<void> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            const newApiKey = await vscode.window.showInputBox({
                prompt: 'Enter your META AI API Key',
                password: true
            });
            if (newApiKey) {
                await this.setApiKey(newApiKey);
            } else {
                vscode.window.showWarningMessage('META AI API Key is required for this extension to work.');
            }
        }
    }

    /**
     * Gets the API key from the configuration
     * @returns The API key or undefined if not set
     */
    public getApiKey(): string | undefined {
        return vscode.workspace.getConfiguration('metaAIAssistant').get('apiKey');
    }

    /**
     * Sets the API key in the configuration
     * @param apiKey The API key to set
     */
    public async setApiKey(apiKey: string): Promise<void> {
        await vscode.workspace.getConfiguration('metaAIAssistant').update('apiKey', apiKey, true);
    }

    /**
     * Gets the maximum number of tokens per chunk from the configuration
     * @returns The maximum number of tokens
     */
    public getMaxTokens(): number {
        return vscode.workspace.getConfiguration('metaAIAssistant').get('maxTokens') || 2000;
    }

    /**
     * Sets the maximum number of tokens per chunk in the configuration
     * @param maxTokens The maximum number of tokens to set
     */
    public async setMaxTokens(maxTokens: number): Promise<void> {
        await vscode.workspace.getConfiguration('metaAIAssistant').update('maxTokens', maxTokens, true);
    }

    /**
     * Gets the chat history from the extension's global state
     * @returns An array of chat history items
     */
    public getChatHistory(): any[] {
        return this.context.globalState.get('chatHistory', []);
    }

    /**
     * Adds a new chat to the chat history
     * @param chatId The ID of the chat to add
     * @param chatTitle The title of the chat to add
     */
    public async addChatToHistory(chatId: string, chatTitle: string): Promise<void> {
        const chatHistory = this.getChatHistory();
        chatHistory.push({ id: chatId, title: chatTitle, timestamp: new Date().toISOString() });
        await this.context.globalState.update('chatHistory', chatHistory);
    }

    /**
     * Removes a chat from the chat history
     * @param chatId The ID of the chat to remove
     */
    public async removeChatFromHistory(chatId: string): Promise<void> {
        const chatHistory = this.getChatHistory();
        const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
        await this.context.globalState.update('chatHistory', updatedHistory);
    }

    /**
     * Clears the entire chat history
     */
    public async clearChatHistory(): Promise<void> {
        await this.context.globalState.update('chatHistory', []);
    }

    /**
     * Gets a configuration value
     * @param key The configuration key
     * @returns The configuration value or undefined if not set
     */
    public getConfig<T>(key: string): T | undefined {
        return vscode.workspace.getConfiguration('metaAIAssistant').get<T>(key);
    }

    /**
     * Sets a configuration value
     * @param key The configuration key
     * @param value The value to set
     */
    public async setConfig<T>(key: string, value: T): Promise<void> {
        await vscode.workspace.getConfiguration('metaAIAssistant').update(key, value, true);
    }
}