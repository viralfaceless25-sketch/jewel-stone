import { loadEnvConfig } from "@next/env";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

function argument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const [
    {
      DEFAULT_CLEAR_SECTIONS,
      clearPlanSummary,
      executeAdminDataClear,
      planAdminDataClear,
      validateClearSections,
    },
    { kvConfigured },
  ] = await Promise.all([
    import("../lib/admin/data-clear"),
    import("../lib/kv"),
  ]);

  const requested = argument("only");
  const sections = requested
    ? validateClearSections(requested.split(","))
    : [...DEFAULT_CLEAR_SECTIONS];
  const confirmed = process.argv.includes("--yes") || process.argv.includes("--confirm");
  const target = argument("target");
  if (confirmed && kvConfigured && target !== "production") {
    throw new Error("Remote deletion requires --target=production.");
  }

  const plan = await planAdminDataClear(sections);
  const storeLabel = kvConfigured
    ? "remote KV (production confirmation required)"
    : `local JSON (${process.env.ADMIN_STORE_FILE ?? ".data/admin-store.json"})`;
  console.log(`${confirmed ? "DELETE" : "DRY RUN"} — ${storeLabel}`);
  console.log(`Sections: ${plan.sections.join(", ")}`);
  if (!plan.deletions.length && !plan.removals.length) {
    console.log("Nothing found.");
    return;
  }

  for (const item of plan.deletions) {
    console.log(`  DEL  ${item.key}  # ${item.description}`);
  }
  for (const item of plan.removals) {
    console.log(`  SREM ${item.index} ${item.member}`);
  }

  if (!confirmed) {
    console.log("\nNo data changed. Re-run with --yes after reviewing this list.");
  } else {
    await executeAdminDataClear(plan);

    if (!kvConfigured && plan.sections.includes("inbox")) {
      const localFile =
        process.env.CUSTOM_REQUESTS_FILE ??
        path.join(process.cwd(), ".data", "custom-requests.json");
      try {
        const current = JSON.parse(await readFile(localFile, "utf8")) as Record<string, unknown>;
        for (const id of plan.removals
          .filter((item) => item.index === "jewelstone:custom-requests")
          .map((item) => item.member)) {
          delete current[id];
        }
        await mkdir(path.dirname(localFile), { recursive: true });
        const temporary = `${localFile}.${process.pid}.${Date.now()}.tmp`;
        await writeFile(temporary, `${JSON.stringify(current, null, 2)}\n`, { mode: 0o600 });
        await rename(temporary, localFile);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
  }

  console.log(
    `\n${confirmed ? "Deleted" : "Would delete"}: ${clearPlanSummary(plan) || "indexed records"}.`,
  );
  if (plan.sections.includes("customers") && !plan.sections.includes("accounts")) {
    console.log("Customer portal logins preserved. Use --only=accounts explicitly to remove them.");
  }
  console.log("Settings, products, inventory stock, and numbering counters preserved.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
