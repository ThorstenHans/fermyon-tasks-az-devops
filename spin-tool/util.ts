import * as fs from 'fs';
import * as os from 'os';
import * as util from 'util';
import * as path from 'path';

import * as tl from 'azure-pipelines-task-lib/task';
import * as toolLib from 'azure-pipelines-tool-lib/tool';

const download = require('download');
const { v4: uuidv4 } = require('uuid');

const spinToolName = "spin"; 
const spinLatestReleaseUrl = "https://api.github.com/repos/fermyon/spin/releases/latest";
const spinLatestStableVersion = "v2.0.0";

export async function downloadSpin(version: string): Promise<string> {
    let cachedSpinToolPath = toolLib.findLocalTool(spinToolName, version);
    if (!cachedSpinToolPath) {
        const source = getDownloadUrl(version);    
        var downloadPath = await downloadFile(source);   
        tl.debug('Extracting the downloaded Fermyon Spin tool archive..');
        const unzippedSpinToolPath = await extractArchive(downloadPath);

        var show_extracted = tl.tool("ls");
        show_extracted.arg(unzippedSpinToolPath);
        tl.debug(`Contents of ${unzippedSpinToolPath}:`)
        await show_extracted.execAsync();
        tl.debug(`Contents of ${unzippedSpinToolPath} shown.`)


        cachedSpinToolPath = await toolLib.cacheDir(unzippedSpinToolPath, spinToolName, version);
        console.log(tl.loc("SuccessfullyDownloaded", version, cachedSpinToolPath));
    } else {
        console.log(tl.loc("VersionAlreadyInstalled", version, cachedSpinToolPath));
    }
    const spinPath = path.join(cachedSpinToolPath, spinToolName + getExecutableExtension());
    fs.chmodSync(spinPath, '755');   
    tl.debug(`File permissions set on ${spinPath} to 755`);
    return spinPath;
}

export function addFolderToPath(folder: string) {
    console.log(tl.loc("PrependingToPath", folder));
    if (!process.env['PATH']!.startsWith(path.dirname(folder))) {
        tl.prependPath(path.dirname(folder));
    }
}

export async function getSpecifiedSpinVersion(): Promise<string> {
    let version = tl.getInput('version', true);
    if (!version || version! == "latest") {
        tl.debug('No version specified. Attempting to find latest version...')
        version = await getLatestVersion();
        tl.debug(`Latest version queried from GitHub... It is ${version}`);
    }
    // prepend version with 'v' if it's not there already
    if (!version!.startsWith('v')) {
        version = 'v' + version;
    }
    return Promise.resolve(version!);
}

async function getLatestVersion(): Promise<string> {
    let latestVersion = spinLatestStableVersion;
    
    try {
        const f = await downloadFile(spinLatestReleaseUrl)
        const response = JSON.parse(fs.readFileSync(f, 'utf8').toString().trim());
        if (response.tag_name) {
            latestVersion = response.tag_name;
        }
    } catch (error) {
        tl.warning(tl.loc('ErrorFetchingLatestVersion', spinLatestReleaseUrl, error, spinLatestStableVersion));
    }
    return latestVersion;
}

function getDownloadUrl(version: string): string {
    let downloadUrlFormat = 'https://github.com/fermyon/spin/releases/download/%s/spin-%s-%s%s';
    switch (os.type()) {
        case 'Linux':
            return util.format(downloadUrlFormat, version, version, 'linux-amd64', '.tar.gz');
        case 'Darwin':
            return util.format(downloadUrlFormat, version, version, 'macos-amd64', '.tar.gz');
        case 'Windows_NT':
        default:
            return util.format(downloadUrlFormat, version, version, 'windows-amd64', '.zip');
    }
}

async function downloadFile(source: string): Promise<string>{
    const targetFolder = getTempFolder();
    const targetFile = getRandomFileName();
    try{
        await download(source, targetFolder, {filename: targetFile});
        return path.join(targetFolder, targetFile);
    }
    catch (ex) {
        throw new Error(tl.loc('SpinDownloadFailed', source, targetFolder, ex));
    }
}

function getTempFolder() {
    tl.assertAgent('2.115.0');
    const tempDirectory = tl.getVariable('Agent.TempDirectory');
    if (!tempDirectory) {
        throw new Error('Agent.TempDirectory is not set! Please update to a newer agent version.');
    }
    return tempDirectory;
}

function getRandomFileName(): string {
    return uuidv4();    
}

function getExecutableExtension(): string {
    if (os.type().match(/^Win/)) {
        return '.exe';
    }
    return '';
}

async function extractArchive(archivePath: string): Promise<string> {
    if (os.type().match(/^Win/)) {
        return toolLib.extractZip(archivePath);
    }
    return toolLib.extractTar(archivePath);
}
