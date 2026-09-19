import { readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const backendRoot = resolve(".");
const srcRoot = resolve("src");

async function findTestFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await findTestFiles(fullPath)));
            continue;
        }

        if (
            entry.isFile() &&
            (entry.name.endsWith(".spec.ts") ||
                entry.name.endsWith(".test.ts"))
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

const testFiles = (await findTestFiles(srcRoot)).sort();

if (testFiles.length === 0) {
    console.error("ERROR: No test files were found under src/.");
    process.exit(1);
}

console.log(`Found ${testFiles.length} test files:`);

for (const file of testFiles) {
    console.log(`  - ${relative(backendRoot, file)}`);
}

console.log("\nRunning backend test suite...\n");

const result = spawnSync(
    process.execPath,
    [
        "--import",
        "tsx",
        "--test",
        "--test-concurrency=1",
        ...testFiles
    ],
    {
        stdio: "inherit",
        cwd: backendRoot
    }
);

if (result.error) {
    console.error("\nFailed to start test runner:");
    console.error(result.error);
    process.exit(1);
}

if (result.signal) {
    console.error(`\nTest runner terminated by signal: ${result.signal}`);
    process.exit(1);
}

process.exit(result.status ?? 1);