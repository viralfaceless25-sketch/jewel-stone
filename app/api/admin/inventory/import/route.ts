import readXlsxFile from "read-excel-file/node";
import { requireAdminApi } from "@/lib/admin/auth";
import { recordActivity } from "@/lib/admin/activity";
import { saveAdminProduct, setOverlay } from "@/lib/admin/inventory";
import {
  buildProduct,
  num,
  readDraft,
  revalidateStorefront,
  str,
  takenSlugs,
  uniqueSlug,
} from "../helpers";

export const runtime = "nodejs";

function headerKey(value: unknown) {
  return str(value, 100).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function POST(request: Request) {
  const denied = requireAdminApi();
  if (denied) return denied;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !/\.xlsx$/i.test(file.name) || file.size > 10_000_000) {
    return Response.json({ error: "Choose an .xlsx file under 10 MB." }, { status: 400 });
  }

  try {
    const sheets = await readXlsxFile(Buffer.from(await file.arrayBuffer()));
    const rows = sheets[0]?.data ?? [];
    if (rows.length < 2) return Response.json({ error: "Spreadsheet has no product rows." }, { status: 400 });
    const headers = rows[0].map(headerKey);
    const taken = await takenSlugs();
    const imported: string[] = [];
    const errors: string[] = [];

    for (const [index, row] of rows.slice(1, 501).entries()) {
      const record: Record<string, unknown> = {};
      headers.forEach((header, column) => { if (header) record[header] = row[column]; });
      const derivedName = [
        record.shape,
        record.usedfor ?? record.category,
      ].filter(Boolean).join(" ");
      const draftInput = {
        name: record.name ?? record.productname ?? record.item ?? record.description ?? derivedName,
        sku: record.sku ?? record.code ?? record.itemcode ?? record.productcode ?? record.productno,
        category: record.category ?? record.type ?? record.usedfor,
        price:
          record.price ??
          record.retailprice ??
          record.amount ??
          record.totalcostusd ??
          record.sellingpriceusd ??
          record.usd,
        style: record.style,
        material: record.material ?? record.metal ?? record.goldtype ?? record.purity ?? record.gold18kt,
        centerStone: record.centerstone ?? record.stone ?? record.shape,
        carats:
          record.carats ??
          record.diamondcarats ??
          record.cts ??
          record.totalcarat ??
          record.totaldiamondweightcarat ??
          record.totalstoneweightct ??
          record.stoneweightct,
        colorClarity:
          record.colorclarity ??
          record.colourclarity ??
          record.coloyurclarity ??
          [record.color ?? record.colour, record.clarity].filter(Boolean).join("/"),
        sizeInfo: record.sizeinfo ?? record.size ?? record.ussizelength ?? record.length,
        description: record.description ?? record.productname ?? record.name ?? record.item ?? derivedName,
      };
      const result = readDraft(draftInput);
      if (!result.ok) {
        errors.push(`Row ${index + 2}: ${result.error}`);
        continue;
      }
      const slug = uniqueSlug(result.draft.sku || result.draft.name, taken);
      await saveAdminProduct(buildProduct(result.draft, slug, null));
      await setOverlay(slug, {
        stock: Math.max(0, Math.round(num(record.stock ?? record.quantity ?? 0))),
        visible: false,
      });
      imported.push(slug);
    }

    revalidateStorefront();
    await recordActivity(
      "Imported inventory spreadsheet",
      file.name,
      `${imported.length} products imported · ${errors.length} rows skipped`,
    );
    return Response.json({
      imported: imported.length,
      errors: errors.slice(0, 50),
      warning: "Imported products stay hidden until images are uploaded.",
    });
  } catch (error) {
    console.error("inventory Excel import failed", error);
    return Response.json({ error: "Could not read that Excel file." }, { status: 400 });
  }
}
