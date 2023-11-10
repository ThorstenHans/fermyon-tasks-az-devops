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

async function build(): Promise<void> {
    console.log(tl.loc("RunningSpinBuild"));
    const args = ["build"];

    return new Promise<void>(async (resolve, reject) => {
        try {
            var spin = tl.tool(binary);
            args.forEach((arg) => spin.arg(arg));

            const exitCode = await spin.execAsync();
            if (exitCode != 0) {
                reject(`Spin Build failed. (exit code: ${exitCode})`);
            }
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}
verifyFermyonSpin()
    .then(() => build())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
