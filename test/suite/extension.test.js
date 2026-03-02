//

'use strict';

const assert = require('assert');
const vscode = require('vscode');

suite('DigitalJS Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting DigitalJS integration tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('ananay-22.digitaljs'));
    });

    test('Extension should activate successfully', async () => {
        const ext = vscode.extensions.getExtension('ananay-22.digitaljs');
        if (!ext.isActive) {
            await ext.activate();
        }
        assert.strictEqual(ext.isActive, true);
    });

    test('DigitalJS commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('digitaljs.openView'), 'digitaljs.openView not registered');
        assert.ok(commands.includes('digitaljs.addFiles'), 'digitaljs.addFiles not registered');
        assert.ok(commands.includes('digitaljs.exportImage'), 'digitaljs.exportImage not registered');
    });

    test('Yosys local path config should be available', () => {
        const config = vscode.workspace.getConfiguration('digitaljs');
        const yosysPath = config.get('yosysPath');
        assert.strictEqual(typeof yosysPath, 'string', 'Yosys path should be configured as a string');
    });

});
