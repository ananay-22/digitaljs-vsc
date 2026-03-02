import * as vscode from 'vscode';

let channel;

export function getLogger() {
    if (!channel) {
        channel = vscode.window.createOutputChannel("DigitalJS");
    }
    return channel;
}

export function logInfo(message) {
    getLogger().appendLine(`[INFO] ${new Date().toISOString()}: ${message}`);
}

export function logError(message, error) {
    getLogger().appendLine(`[ERROR] ${new Date().toISOString()}: ${message}`);
    if (error) {
        getLogger().appendLine(error.stack || String(error));
    }
}
