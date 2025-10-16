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

async function deployToFermyonWasmFunctions(): Promise<void> {
    console.log(tl.loc("DeployingToFermyonWasmFunctions"));
    const args = ["aka", "deploy", "--no-confirm"];

    return new Promise<void>(async (resolve, reject) => {
        try {
            const accountId = tl.getInput("accountId", false);
            const accountName = tl.getInput("accountName", false);
            const appId = tl.getInput("appId", false);
            const createName = tl.getInput("createName", false);


            if (!!accountId && !!accountName) {
                return reject("Either AccountID or AccountName should be specified. Found both!");
            }
            if (!!accountId) {
                args.push("--account-id", accountId!);
            }
            if (!!accountName) {
                args.push("--account-name", accountName);
            }

            if (!!createName && !!appId) {
                return reject("Either app-id or create-name should be specified. Found both!");
            }
            if (!!createName) {
                args.push("--create-name", createName);
            }
            if (!!appId) {
                args.push("--app-id", appId!);
            }
            try {
                const variables = tl.getInput("variables", false);
                const variableArgs = parseVariablesInput(variables);

                if (variableArgs) {
                    console.log("Args prepared:", variableArgs);
                    variableArgs.forEach(va => {
                        args.push(va)
                    });
                } else {
                    console.log("No variables provided, skipping args.");
                }

            } catch (err: any) {
                tl.setResult(tl.TaskResult.Failed, err.message || "Unknown error");
            }

            var spin = tl.tool(binary);
            args.forEach((arg) => spin.arg(arg));

            const exitCode = await spin.execAsync();
            if (exitCode != 0) {
                reject(`Could not deploy to Fermyon Wasm Functions. (exit code: ${exitCode})`);
            }
            resolve();
        } catch (err: any) {
            reject(err);
        }
    });
}

function parseVariablesInput(variablesInput?: string): string[] | undefined {
    if (!variablesInput || variablesInput.trim().length === 0) {
        return undefined;
    }

    const args: string[] = [];

    const lines = variablesInput
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

    for (const line of lines) {
        if (line.startsWith("@")) {
            // file reference
            const filePath = line.substring(1).trim();
            const ext = path.extname(filePath).toLowerCase();

            if (ext !== ".json" && ext !== ".toml") {
                throw new Error(
                    `Unsupported file type '${ext}'. Only .json or .toml are allowed.`
                );
            }

            args.push("--variable", line);
        } else {
            // key=value pair
            if (!line.includes("=")) {
                throw new Error(
                    `Invalid variable format '${line}'. Expected KEY=VALUE or @file.json/@file.toml`
                );
            }
            args.push("--variable", line);
        }
    }

    return args.length > 0 ? args : undefined;
}



verifySpinCLI()
    .then(() => deployToFermyonWasmFunctions())
    .then(() => tl.setResult(tl.TaskResult.Succeeded, ''))
    .catch((err: any) => tl.setResult(tl.TaskResult.Failed, err));
