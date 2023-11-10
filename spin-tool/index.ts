import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

import { getSpecifiedSpinVersion, downloadSpin, addFolderToPath } from './util';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function downloadFermyonSpin(): Promise<string> {
    try {
        const version = await getSpecifiedSpinVersion();
        const spinToolPath = await downloadSpin(version!);
        addFolderToPath(spinToolPath!);
        return spinToolPath!;
    } catch (err: any) {
        throw err
    }
}

async function verifyFermyonSpin(spinPath: string) {
    console.log(tl.loc("VerifyingSpinInstallation"));
    const args = ["--version"];
    try {
        var spin = tl.tool(spinPath);
        args.forEach((arg) => spin.arg(arg));

        const exitCode = await spin.execAsync();
        if (exitCode != 0) {
            throw new Error(`Could not verify Fermyon Spin installation. (exit code: ${exitCode})`);
        }
    }
    catch (err: any) {
        throw err;
    }
}

async function installSpinTemplates(spinPath: string, repo: string) {
    console.log(tl.loc("InstallingSpinTemplates", repo));
    const args = ["templates", "install", "--git", repo, "--upgrade"];
    try {
        var spin = tl.tool(spinPath);
        args.forEach((arg) => spin.arg(arg));

        const exitCode = await spin.execAsync();
        if (exitCode != 0) {
            throw new Error(`Could not install Fermyon Spin templates from ${repo}. (exit code: ${exitCode})`);
        }
    }
    catch (err: any) {
        throw err;
    }
}

async function installSpinPlugin(spinPath: string, name: string) {
    console.log(tl.loc("InstallingSpinPlugins", name));
    const args = ["plugins", "install", name, "--yes"];

    try {
        var spin = tl.tool(spinPath);
        args.forEach((arg) => spin.arg(arg));

        const exitCode = await spin.execAsync();
        if (exitCode != 0) {
            throw new Error(`Could not install Fermyon Spin plugin ${name}. (exit code: ${exitCode})`);
        }
    } catch (err: any) {
        throw err;
    }

}

async function installPlugins(binary: string) {
    try {
        tl.debug("Starting plugin installation");
        await installSpinPlugin(binary, "cloud");
        await installSpinPlugin(binary, "js2wasm");
        await installSpinPlugin(binary, "py2wasm");
    } catch (err: any) {
        throw err;
    }
}

async function installTemplates(binary: string) {
    try {
        tl.debug("Starting template installation");
        await installSpinTemplates(binary, "https://github.com/fermyon/spin");
        await installSpinTemplates(binary, "https://github.com/fermyon/spin-python-sdk");
        await installSpinTemplates(binary, "https://github.com/fermyon/spin-js-sdk");
    } catch (err: any) {
        throw err;
    }
}

(async () => {
    try {
        const path = await downloadFermyonSpin();
        if (!path) {
            tl.setResult(tl.TaskResult.Failed, "Could not determine where spin got installed.");
            return;
        }
        await verifyFermyonSpin(path);
        const shouldInstallPlugins = tl.getBoolInput('plugins', true);
        const shouldInstallTemplates = tl.getBoolInput('templates', true);

        if (shouldInstallPlugins) {
            tl.debug("User wants to install plugins");
            await installPlugins(path);
        } else {
            tl.debug("Plugin installation skipped due to user choice");
        }

        if (shouldInstallTemplates) {
            tl.debug("User wants to install templates");
            await installTemplates(path);
        } else {
            tl.debug("Template installation skipped due to user choice");
        }
        tl.setResult(tl.TaskResult.Succeeded, '');
    } catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
})();
