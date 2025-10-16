import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';

tl.setResourcePath(path.join(__dirname, 'task.json'));

const binary = "spin";

async function verifySpinCLI(): Promise<void> {
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


async function authenticateWithFermyonWasmFunctions(): Promise<void> {
    console.log(tl.loc("AuthenticatingWithFermyonWasmFunctions"));
    const args = ["aka", "login", "--token"];

    return new Promise<void>(async (resolve, reject) => {
        try {
            const token = tl.getInput('token', true);

            var spin = tl.tool(binary);
            args.forEach((arg) => spin.arg(arg));
            spin.arg(token!);

            const exitCode = await spin.execAsync();
            if (exitCode !== 0) {
                reject(`Could not login to Fermyon Wasm Functions. (exit code: ${exitCode})`);
            }
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}

verifySpinCLI()
    .then(() => authenticateWithFermyonWasmFunctions())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
