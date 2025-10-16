import * as path from 'path';
import * as tl from 'azure-pipelines-task-lib/task';
import { Writable } from 'stream';

tl.setResourcePath(path.join(__dirname, 'task.json'));

const binary = "spin";

async function verifySpinCLI() {
    console.log(tl.loc("VerifyingSpinInstallation"));
    try {
        tl.which(binary, true);

    } catch (err: any) {
        throw err;
    }
}

async function version(): Promise<string> {
    console.log(tl.loc("RunningSpinVersion"));
    const args = ["--version"];
    try {
        let output = '';
        const writable = new Writable();
        writable._write = function (chunk, encoding, next) {
            tl.debug(`Received output chunk: ${chunk.toString()}`);
            if (!chunk.toString().trim().startsWith('[command]') && chunk.toString().trim().length > 0) {
                output += chunk.toString();
            }
            next();
        };

        var spin = tl.tool(binary);
        args.forEach((arg) => spin.arg(arg));

        const exitCode = await spin.execAsync({
            outStream: writable,
        });
        if (exitCode != 0) {
            throw new Error(`'spin --version' failed. (exit code: ${exitCode})`);
        }
        console.log(`Received output: ${output}`);
        tl.setVariable('spinVersion', output.trim(), false, false);
        return output.trim();
    } catch (err: any) {
        throw err;
    }
}

(async () => {
    try {
        await verifySpinCLI();
        const output = await version();
        tl.setResult(tl.TaskResult.Succeeded, output);
    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
})();
