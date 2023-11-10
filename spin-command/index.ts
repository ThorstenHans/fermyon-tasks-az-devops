import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

tl.setResourcePath(path.join(__dirname, 'task.json'));

const binary = "spin";

async function verifyFermyonSpin(): Promise<void> {
    console.log(tl.loc("VerifyingSpinInstallation"));
    return new Promise<void>(async (resolve, reject) => {
        try {
            tl.which(binary, true);
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}

async function run(): Promise<void> {
    const command = tl.getInputRequired('command');
    const args = tl.getDelimitedInput('arguments','\n', false);
    
    console.log(tl.loc("RunningSpinCommand", command));
    
    return new Promise<void>(async (resolve, reject) => {
        try {
            var spin = tl.tool(binary);
            spin.arg(command);
            args.forEach((arg) => spin.arg(arg));

            const exitCode = await spin.execAsync();
            if (exitCode != 0) {
                reject(`spin ${command} failed. (exit code: ${exitCode})`);
            }
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}
verifyFermyonSpin()
    .then(() => run())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
