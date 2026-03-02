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

    const tmpDir = os.tmpdir();
    const randId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const outJsonPath = path.join(tmpDir, `yosys_out_${randId}.json`);
    const ysScriptPath = path.join(tmpDir, `yosys_script_${randId}.ys`);

    let script = 'design -reset;\n';

    const incdirs = new Set();
    for (const file of files) {
        incdirs.add(path.dirname(file).replace(/\\/g, '/'));
    }
    const incStr = Array.from(incdirs).map(d => `-I"${d}"`).join(' ');

    for (const file of files) {
        const ext = path.extname(file);
        const safe_file = file.replace(/\\/g, '/');
        if (ext === '.sv') {
            script += `read_verilog -overwrite -sv ${incStr} "${safe_file}";\n`;
        } else {
            script += `read_verilog -overwrite ${incStr} "${safe_file}";\n`;
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
        await execFileAsync(yosysPath, args, { maxBuffer: 1024 * 1024 * 100 });

        const outputData = await fs.promises.readFile(outJsonPath, 'utf8');
        const outputJson = JSON.parse(outputData);

        await fs.promises.unlink(outJsonPath).catch(() => { });
        await fs.promises.unlink(ysScriptPath).catch(() => { });

        return outputJson;
    } catch (e) {
        console.error("Yosys execution failed:", e);
        await fs.promises.unlink(outJsonPath).catch(() => { });
        await fs.promises.unlink(ysScriptPath).catch(() => { });
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
