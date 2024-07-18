"use strict";
// src/codeEditManager.ts
// This file contains the CodeEditManager class, which handles in-place code editing
// using a diff view for user review and manual application of changes.
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
exports.CodeEditManager = void 0;
const vscode = __importStar(require("vscode"));
const diff_match_patch_1 = require("diff-match-patch");
class CodeEditManager {
    constructor() {
        this.dmp = new diff_match_patch_1.diff_match_patch();
    }
    /**
     * Shows a diff view of the proposed changes and allows manual application
     * @param originalText The original text content
     * @param modifiedText The modified text content from META AI
     * @param uri The URI of the document being edited
     */
    showDiffAndApplyChanges(originalText, modifiedText, uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const diffs = this.dmp.diff_main(originalText, modifiedText);
                this.dmp.diff_cleanupSemantic(diffs);
                const diffContent = this.createDiffContent(diffs);
                const diffDocument = yield vscode.workspace.openTextDocument({
                    content: diffContent,
                    language: 'diff'
                });
                yield vscode.window.showTextDocument(diffDocument, vscode.ViewColumn.Beside);
                const applyChanges = yield vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: 'Do you want to apply these changes?'
                });
                if (applyChanges === 'Yes') {
                    yield this.applyChangesToDocument(uri, originalText, modifiedText);
                    vscode.window.showInformationMessage('Changes applied successfully.');
                }
                else {
                    vscode.window.showInformationMessage('Changes were not applied.');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error showing diff: ${error}`);
            }
        });
    }
    /**
     * Creates a formatted diff content for display
     * @param diffs The array of Diff objects
     * @returns Formatted diff content as a string
     */
    createDiffContent(diffs) {
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
    applyChangesToDocument(uri, originalText, modifiedText) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode.workspace.openTextDocument(uri);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(uri, new vscode.Range(0, 0, document.lineCount, 0), modifiedText);
            yield vscode.workspace.applyEdit(edit);
        });
    }
}
exports.CodeEditManager = CodeEditManager;
