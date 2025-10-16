import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import type { ToolRunner } from 'azure-pipelines-task-lib/toolrunner';

tl.setResourcePath(path.join(__dirname, 'task.json'));

const binary = "spin";

async function verifySpinCLI(): Promise<void> {
    console.log(tl.loc("VerifyingSpinInstallation"));
    try {
        tl.which(binary, true);
        return Promise.resolve()
    } catch (err: any) {
        return Promise.reject(err);
    }
}

async function installPlugin(): Promise<void> {
    const pluginSource = tl.getInputRequired('pluginSource');
    const pluginVersion = tl.getInput('pluginVersion', false);

    let args = ["plugins", "install"];
    if (pluginSource.startsWith("http://") ||
        pluginSource.startsWith("https://")) {
        args.push("-u")
    }
    args.push(pluginSource)
    args.push("-y")
    if (!!pluginVersion) {
        args.push("-v")
        args.push(pluginVersion)
    }
    let spin: ToolRunner = tl.tool(binary);
    spin.arg(args)
    console.log(tl.loc("InstallingSpinPlugins", pluginSource));
    try {
        const exitCode = await spin.execAsync();
        if (exitCode != 0) {
            return Promise.reject(`Installing Plugin (${pluginSource}) failed. (exit code: ${exitCode})`);
        }
        return Promise.resolve();
    } catch (err: any) {
        return Promise.reject(err);
    }
}

verifySpinCLI()
    .then(() => installPlugin())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
