//

'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { yosys2digitaljs, io_ui } from 'yosys2digitaljs/core';
import * as digitaljs_transform from '../node_modules/digitaljs/src/transform.mjs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';

const execFileAsync = promisify(execFile);

export function set_yosys_wasm_uri(uri) {
    // No-op since we use local yosys binary
}

async function process_files_local(files, opts = {}) {
    const config = vscode.workspace.getConfiguration('digitaljs');
    const yosysPath = config.get('yosysPath') || 'yosys';
    let yosysArgs = config.get('yosysArgs') || '';

    const tmpSandboxDir = path.join(tmpDir, `yosys_sandbox_${randId}`);
    await fs.promises.mkdir(tmpSandboxDir, { recursive: true });

    let script = 'design -reset;\n';

    const localSandboxFiles = [];
    for (const fileObj of files) {
        // fileObj is { fsPath: '/abs/path/to/script.v', name: 'src/script.v' }
        // We must preserve the exact hierarchy of `file.name` inside the sandbox
        // so that Yosys emits the correct `src` attribute for source highlighting mappings.
        const sandboxDest = path.join(tmpSandboxDir, fileObj.name);
        await fs.promises.mkdir(path.dirname(sandboxDest), { recursive: true });
        await fs.promises.copyFile(fileObj.fsPath, sandboxDest);
        localSandboxFiles.push(fileObj.name);
    }

    for (const relName of localSandboxFiles) {
        const ext = path.extname(relName);
        if (ext === '.sv') {
            script += `read_verilog -overwrite -sv "${relName}";\n`;
        } else {
            script += `read_verilog -overwrite "${relName}";\n`;
        }
    }

    script += 'hierarchy -auto-top;\n';
    script += 'proc;\n';
    script += (opts.optimize ? 'opt;\n' : 'opt_clean;\n');

    if (opts.fsm && opts.fsm !== 'no') {
        const fsmexpand = opts.fsmexpand ? ' -expand' : '';
        script += (opts.fsm === 'nomap' ? `fsm -nomap${fsmexpand};\n` : `fsm${fsmexpand};\n`);
    }

    script += 'memory -nomap;\n';
    script += 'wreduce -memx;\n';
    script += (opts.optimize ? 'opt -full;\n' : 'opt_clean;\n');

    const safe_outJsonPath = outJsonPath.replace(/\\/g, '/');
    script += `json -o "${safe_outJsonPath}";\n`;

    await fs.promises.writeFile(ysScriptPath, script);

    const args = [];
    if (yosysArgs) {
        args.push(...yosysArgs.split(' ').filter(a => a.trim() !== ''));
    }
    args.push('-s', ysScriptPath);

    try {
        await execFileAsync(yosysPath, args, { cwd: tmpSandboxDir, maxBuffer: 1024 * 1024 * 100 });

        const outputData = await fs.promises.readFile(outJsonPath, 'utf8');
        const outputJson = JSON.parse(outputData);

        await fs.promises.rm(tmpSandboxDir, { recursive: true, force: true }).catch(() => { });

        return outputJson;
    } catch (e) {
        console.error("Yosys execution failed:", e);
        await fs.promises.rm(tmpSandboxDir, { recursive: true, force: true }).catch(() => { });
        throw { error: e.message || String(e) };
    }
}

export async function run_yosys(files, options) {
    const obj = await process_files_local(files, options);
    let output = yosys2digitaljs(obj, options);
    io_ui(output);
    if (options.transform)
        output = digitaljs_transform.transformCircuit(output);
    return { output };
}
