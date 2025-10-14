import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import type { ToolRunner } from 'azure-pipelines-task-lib/toolrunner';

tl.setResourcePath(path.join(__dirname, 'task.json'));

const binary = "spin";

async function verifyFermyonSpin(): Promise<void> {
    console.log(tl.loc("VerifyingSpinInstallation"));
    try {
        tl.which(binary, true);
        return Promise.resolve()
    } catch (err: any) {
        return Promise.reject(err);
    }
}

async function run(): Promise<void> {
    const commands = tl.getInputRequired('command').split(' ');
    const args = tl.getDelimitedInput('arguments', ' ', false);

    console.log(tl.loc("RunningSpinCommand", commands.join(' ')));
    try {
        let spin: ToolRunner = tl.tool(binary);
        spin.arg(commands)
        spin.arg(args)
        const exitCode = await spin.execAsync();
        if (exitCode != 0) {
            return Promise.reject(`spin ${commands.join(' ')} failed. (exit code: ${exitCode})`);
        }
        return Promise.resolve();
    } catch (err: any) {
        return Promise.reject(err);
    }
}
verifyFermyonSpin()
    .then(() => run())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
