import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import * as tr from "azure-pipelines-task-lib/toolrunner";

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

async function getApplicationId(): Promise<void> {
    console.log(tl.loc("RetrievingApplicationId"));
    const args = ["aka", "apps", "list", "--format", "json"];

    return new Promise<void>(async (resolve, reject) => {
        try {
            const accountId = tl.getInput("accountId", false);
            const accountName = tl.getInput("accountName", false);
            const appName = tl.getInput("appName", true);

            if (!!accountId && !!accountName) {
                return reject("Either AccountID or AccountName should be specified. Found both!");
            }
            if (!!accountId) {
                args.push("--account-id", accountId!);
            }
            if (!!accountName) {
                args.push("--account-name", accountName!);
            }
            var spin = tl.tool(binary);

            const options: tr.IExecOptions = {
                ignoreReturnCode: true,
                silent: true
            };
            args.forEach((arg) => spin.arg(arg));
            const result = spin.execSync(options);
            if (result.code != 0) {
                reject(`Could not read list of applications from Fermyon Wasm Functions. (exit code: ${result.code} error: ${result.error})`);
            }
            try {
                const listOfApps = JSON.parse(result.stdout) as Array<AppInfo>;
                const found = listOfApps.find(app => app.name == appName);
                if (!found) {
                    tl.setResult(tl.TaskResult.Succeeded, `App "${appName}" not present on account`);
                    tl.setVariable("fwfAppId", "", false, false);
                } else {
                    tl.setResult(tl.TaskResult.Succeeded, `App "${appName}" found. Set ID "${found.id}" as fwfAppId`);
                    tl.setVariable("fwfAppId", found.id, false, false)
                }
            } catch {
                tl.setResult(tl.TaskResult.Failed, "Output was not valid JSON");
            }

            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}

interface AppInfo {
    id: string,
    name: string,
}

verifyFermyonSpin()
    .then(() => getApplicationId())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
