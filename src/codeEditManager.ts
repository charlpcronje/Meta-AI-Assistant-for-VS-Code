// src/codeEditManager.ts
// This file contains the CodeEditManager class, which handles in-place code editing
// using a diff view for user review and manual application of changes.

import * as vscode from 'vscode';
import { Diff, diff_match_patch } from 'diff-match-patch';

export class CodeEditManager {
    private dmp: any;

    constructor() {
        this.dmp = new diff_match_patch();
    }

    /**
     * Shows a diff view of the proposed changes and allows manual application
     * @param originalText The original text content
     * @param modifiedText The modified text content from META AI
     * @param uri The URI of the document being edited
     */
    public async showDiffAndApplyChanges(originalText: string, modifiedText: string, uri: vscode.Uri): Promise<void> {
        try {
            const diffs = this.dmp.diff_main(originalText, modifiedText);
            this.dmp.diff_cleanupSemantic(diffs);

            const diffContent = this.createDiffContent(diffs);

            const diffDocument = await vscode.workspace.openTextDocument({
                content: diffContent,
                language: 'diff'
            });

            await vscode.window.showTextDocument(diffDocument, vscode.ViewColumn.Beside);

            const applyChanges = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: 'Do you want to apply these changes?'
            });

            if (applyChanges === 'Yes') {
                await this.applyChangesToDocument(uri, originalText, modifiedText);
                vscode.window.showInformationMessage('Changes applied successfully.');
            } else {
                vscode.window.showInformationMessage('Changes were not applied.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error showing diff: ${error}`);
        }
    }

    /**
     * Creates a formatted diff content for display
     * @param diffs The array of Diff objects
     * @returns Formatted diff content as a string
     */
    private createDiffContent(diffs: Diff[]): string {
        let diffContent = '';
        for (const [op, text] of diffs) {
            switch (op) {
                case 1: // Insertion
                    diffContent += `+ ${text}\n`;
                    break;
                case -1: // Deletion
                    diffContent += `- ${text}\n`;
                    break;
                case 0: // Equal
                    diffContent += `  ${text}\n`;
                    break;
            }
        }
        return diffContent;
    }

    /**
     * Applies the changes to the document
     * @param uri The URI of the document being edited
     * @param originalText The original text content
     * @param modifiedText The modified text content
     */
    private async applyChangesToDocument(uri: vscode.Uri, originalText: string, modifiedText: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument(uri);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(uri, new vscode.Range(0, 0, document.lineCount, 0), modifiedText);
        await vscode.workspace.applyEdit(edit);
    }
}
