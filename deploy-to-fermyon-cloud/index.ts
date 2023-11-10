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

async function deployToFermyonCloud(): Promise<void> {
    console.log(tl.loc("DeployingToFermyonCloud"));
    const args = ["cloud", "deploy"];

    return new Promise<void>(async (resolve, reject) => {
        try {
            const noBuildInfo = tl.getBoolInput('noBuildInfo', false);

            var spin = tl.tool(binary);
            args.forEach((arg) => spin.arg(arg));
            if (noBuildInfo) {
                spin.arg("--no-buildinfo");
            }

            const exitCode = await spin.execAsync();
            if (exitCode != 0) {
                reject(`Could not deploy to Fermyon Cloud. (exit code: ${exitCode})`);
            }
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}

async function authenticateWithFermyonCloud(): Promise<void> {
    console.log(tl.loc("AuthenticatingWithFermyonCloud"));
    const args = ["cloud", "login", "--auth-method", "token", "--token"];

    return new Promise<void>(async (resolve, reject) => {
        try {
            const token = tl.getInput('token', true);

            var spin = tl.tool(binary);
            args.forEach((arg) => spin.arg(arg));
            spin.arg(token!);

            const exitCode = await spin.execAsync();
            if (exitCode !== 0) {
                reject(`Could not login to Fermyon Cloud. (exit code: ${exitCode})`);
            }
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}

verifyFermyonSpin()
    .then(() => authenticateWithFermyonCloud())
    .then(() => deployToFermyonCloud())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
