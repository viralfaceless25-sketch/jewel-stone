"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import type { AdminProduct, InventoryRow } from "@/lib/admin/inventory";
import type { ProductCategory } from "@/data/products";
import admin from "@/app/admin/admin.module.css";
import styles from "./inventory.module.css";

const categories: ProductCategory[] = ["Rings", "Earrings", "Bracelets", "Necklaces", "Pendants", "Loose Diamonds", "Custom Jewelry"];

type ProductForm = {
  name: string;
  sku: string;
  category: ProductCategory;
  price: string;
  stock: string;
  style: string;
  material: string;
  centerStone: string;
  carats: string;
  colorClarity: string;
  sizeInfo: string;
  description: string;
};

const blankProduct: ProductForm = {
  name: "",
  sku: "",
  category: "Rings",
  price: "",
  stock: "1",
  style: "",
  material: "",
  centerStone: "",
  carats: "",
  colorClarity: "",
  sizeInfo: "",
  description: "",
};

async function compressImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not decode image."));
    element.src = dataUrl;
  });
  let scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
  let quality = 0.78;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const output = canvas.toDataURL("image/webp", quality);
    if (output.length <= 125_000) return output;
    if (quality > 0.52) quality -= 0.08;
    else scale *= 0.82;
  }
  throw new Error(`${file.name} is too detailed to compress safely. Use a smaller image.`);
}

export function InventoryClient({ initialRows }: { initialRows: InventoryRow[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [dialog, setDialog] = useState<"add" | "import" | "edit" | "bulk" | "">("");
  const [bulkPercent, setBulkPercent] = useState("");
  const [form, setForm] = useState<ProductForm>(blankProduct);
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(0);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => setRows(initialRows), [initialRows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (needle && ![row.name, row.sku, row.slug].some((value) => value.toLowerCase().includes(needle))) return false;
      if (category && row.category !== category) return false;
      if (stockFilter === "in" && row.stock <= 0) return false;
      if (stockFilter === "out" && row.stock > 0) return false;
      if (stockFilter === "hidden" && row.visible) return false;
      if (stockFilter === "images" && !row.missingImages) return false;
      return true;
    });
  }, [rows, query, category, stockFilter]);

  function updateLocal(slug: string, patch: Partial<InventoryRow>) {
    setRows((current) => current.map((row) => row.slug === slug ? { ...row, ...patch } : row));
  }

  async function saveRow(row: InventoryRow, patch: Partial<Pick<InventoryRow, "stock" | "visible" | "price">>) {
    setBusy(row.slug);
    setError("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: row.slug, ...patch }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not save product.");
      updateLocal(row.slug, patch);
      setNotice(`${row.name} updated.`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save product.");
    } finally {
      setBusy("");
    }
  }

  async function addProduct(event: FormEvent) {
    event.preventDefault();
    setBusy("add");
    setError("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not create product.");
      setDialog("");
      setForm(blankProduct);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create product.");
    } finally {
      setBusy("");
    }
  }

  async function openEditor(row: InventoryRow) {
    if (row.source !== "admin") return;
    setBusy(row.slug);
    setError("");
    try {
      const response = await fetch(`/api/admin/inventory/${encodeURIComponent(row.slug)}`);
      const body = (await response.json()) as { product?: AdminProduct; error?: string };
      if (!response.ok || !body.product) throw new Error(body.error ?? "Could not load product.");
      const product = body.product;
      setSelected(product);
      setImages(product.images);
      setDisplayCount(product.displayCount || product.images.length);
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: String(product.price),
        stock: String(row.stock),
        style: product.style,
        material: product.material,
        centerStone: product.centerStone,
        carats: String(product.carats),
        colorClarity: product.colorClarity,
        sizeInfo: product.sizeInfo,
        description: product.description,
      });
      setDialog("edit");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load product.");
    } finally {
      setBusy("");
    }
  }

  async function selectImages(files: FileList | null) {
    if (!files) return;
    setBusy("photos");
    setError("");
    try {
      const next = await Promise.all(Array.from(files).slice(0, 8).map(compressImage));
      setImages(next);
      setDisplayCount(next.length);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not prepare images.");
    } finally {
      setBusy("");
    }
  }

  async function saveEditor(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setBusy("edit");
    setError("");
    try {
      const productResponse = await fetch(`/api/admin/inventory/${encodeURIComponent(selected.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const productBody = (await productResponse.json().catch(() => ({}))) as { error?: string };
      if (!productResponse.ok) throw new Error(productBody.error ?? "Could not save product.");
      const photoResponse = await fetch(`/api/admin/inventory/${encodeURIComponent(selected.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "images", images, displayCount }),
      });
      const photoBody = (await photoResponse.json().catch(() => ({}))) as { error?: string };
      if (!photoResponse.ok) throw new Error(photoBody.error ?? "Could not save images.");
      await saveRow(rows.find((row) => row.slug === selected.slug)!, {
        stock: Math.max(0, Math.round(Number(form.stock) || 0)),
        price: Math.max(0, Math.round(Number(form.price) || 0)),
      });
      setDialog("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save product.");
    } finally {
      setBusy("");
    }
  }

  async function duplicateProduct() {
    if (!selected) return;
    setBusy("duplicate");
    const response = await fetch(`/api/admin/inventory/${encodeURIComponent(selected.slug)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    setBusy("");
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Could not duplicate product.");
      return;
    }
    setDialog("");
    router.refresh();
  }

  async function deleteProduct() {
    if (!selected || !window.confirm(`Delete ${selected.name}? This cannot be restored from the admin panel.`)) return;
    setBusy("delete");
    const response = await fetch(`/api/admin/inventory/${encodeURIComponent(selected.slug)}`, { method: "DELETE" });
    setBusy("");
    if (!response.ok) {
      setError("Could not delete product.");
      return;
    }
    setDialog("");
    router.refresh();
  }

  async function importExcel(event: FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy("import");
    setError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/inventory/import", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as { error?: string; imported?: number; errors?: string[] };
      if (!response.ok) throw new Error(result.error ?? "Could not import spreadsheet.");
      setNotice(`Imported ${result.imported ?? 0} products. They stay hidden until photographed.`);
      if (result.errors?.length) setError(result.errors.slice(0, 5).join(" "));
      setDialog("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not import spreadsheet.");
    } finally {
      setBusy("");
    }
  }

  async function applyBulkPrices(event: FormEvent) {
    event.preventDefault();
    const percent = Number(bulkPercent);
    if (!Number.isFinite(percent) || percent <= -100 || percent > 1000 || percent === 0) {
      setError("Enter a percentage between -99.99 and 1000.");
      return;
    }
    const changes = filtered.map((row) => ({
      slug: row.slug,
      price: Math.max(1, Math.round(row.price * (1 + percent / 100))),
    }));
    if (!changes.length || !window.confirm(`Change prices for ${changes.length} shown products by ${percent}%?`)) return;
    setBusy("bulk");
    setError("");
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_price", changes }),
      });
      const body = (await response.json().catch(() => ({}))) as { updated?: number; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not update prices.");
      const nextBySlug = new Map(changes.map((change) => [change.slug, change.price]));
      setRows((current) => current.map((row) => {
        const price = nextBySlug.get(row.slug);
        return price === undefined ? row : { ...row, price };
      }));
      setNotice(`Updated ${body.updated ?? changes.length} product prices.`);
      setDialog("");
      setBulkPercent("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update prices.");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <div className={styles.toolbar}>
        <input className={`${admin.input} ${styles.search}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, SKU, or slug" />
        <select className={admin.select} value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={admin.select} value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
          <option value="">All inventory</option>
          <option value="in">In stock</option>
          <option value="out">Sold out</option>
          <option value="hidden">Hidden</option>
          <option value="images">Missing images</option>
        </select>
        <button className={`${admin.btn} ${admin.btnPrimary}`} type="button" onClick={() => { setForm(blankProduct); setDialog("add"); }}>Add product</button>
        <button className={admin.btn} type="button" onClick={() => setDialog("import")}>Import Excel</button>
        <button className={admin.btn} type="button" onClick={() => { setBulkPercent(""); setDialog("bulk"); }}>Bulk price</button>
      </div>

      {notice ? <p className={`${admin.notice} ${admin.noticeGood}`} style={{ marginBottom: "1rem" }}>{notice}</p> : null}
      {error ? <p className={`${admin.notice} ${admin.noticeError}`} style={{ marginBottom: "1rem" }}>{error}</p> : null}

      <section className={admin.panel}>
        <div className={admin.tableWrap}>
          <table className={admin.table}>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>On hand</th><th>Website</th><th>Images</th><th /></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.slug}>
                  <td>
                    <div className={styles.rowName}>
                      <div className={styles.thumb}><NextImage src={row.image} alt="" fill sizes="48px" unoptimized /></div>
                      <div><strong>{row.name}</strong><small>{row.sku} · {row.source === "admin" ? "Admin" : "Spreadsheet"}</small></div>
                    </div>
                  </td>
                  <td>{row.category}</td>
                  <td><input className={`${admin.input} ${styles.numberInput}`} type="number" min="1" defaultValue={row.price} onBlur={(event) => { const price = Math.round(Number(event.target.value)); if (price > 0 && price !== row.price) saveRow(row, { price }); }} /></td>
                  <td><input className={`${admin.input} ${styles.numberInput}`} type="number" min="0" step="1" defaultValue={row.stock} onBlur={(event) => { const stock = Math.max(0, Math.round(Number(event.target.value))); if (stock !== row.stock) saveRow(row, { stock }); }} /></td>
                  <td><label className={styles.switch}><input type="checkbox" checked={row.visible} onChange={(event) => saveRow(row, { visible: event.target.checked })} disabled={busy === row.slug} />{row.visible ? "Shown" : "Hidden"}</label></td>
                  <td>{row.missingImages ? <span className={`${admin.badge} ${admin.badgeWarn}`}>Missing</span> : `${row.imageCount}`}</td>
                  <td>{row.source === "admin" ? <button className={`${admin.btn} ${admin.btnSmall}`} type="button" onClick={() => openEditor(row)} disabled={busy === row.slug}>Edit & photos</button> : <a className={`${admin.btn} ${admin.btnSmall}`} href={`/products/${row.slug}`} target="_blank">View</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {dialog === "add" ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <form className={styles.dialog} onSubmit={addProduct}>
            <div className={styles.dialogHead}><div><h2>Add product</h2><p className={admin.pageSub}>Created hidden. Upload photos before publishing.</p></div><button className={admin.btn} type="button" onClick={() => setDialog("")}>Close</button></div>
            <ProductFields form={form} setForm={setForm} />
            {error ? <p className={`${admin.notice} ${admin.noticeError}`}>{error}</p> : null}
            <div className={styles.dialogActions}><button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={busy === "add"}>{busy === "add" ? "Creating…" : "Create product"}</button></div>
          </form>
        </div>
      ) : null}

      {dialog === "import" ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <form className={styles.dialog} onSubmit={importExcel}>
            <div className={styles.dialogHead}><div><h2>Import Excel</h2><p className={admin.pageSub}>Reads first sheet. Use headers such as Name, SKU, Category, Price, Stock, Metal, Carats, and Description.</p></div><button className={admin.btn} type="button" onClick={() => setDialog("")}>Close</button></div>
            <div className={styles.importBox}><input ref={fileRef} className={admin.input} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required /><div className={`${admin.notice} ${admin.noticeWarn}`}>Imported products remain hidden until each product has at least one uploaded image.</div></div>
            <div className={styles.dialogActions}><button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={busy === "import"}>{busy === "import" ? "Importing…" : "Import products"}</button></div>
          </form>
        </div>
      ) : null}

      {dialog === "bulk" ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <form className={styles.dialog} onSubmit={applyBulkPrices}>
            <div className={styles.dialogHead}><div><h2>Bulk price adjustment</h2><p className={admin.pageSub}>Applies only to {filtered.length} products currently shown by your search and filters.</p></div><button className={admin.btn} type="button" onClick={() => setDialog("")}>Close</button></div>
            <label className={admin.field}><span className={admin.label}>Percentage change</span><input className={admin.input} type="number" min="-99.99" max="1000" step="0.01" value={bulkPercent} onChange={(event) => setBulkPercent(event.target.value)} placeholder="Example: 5 or -10" required /></label>
            <div className={`${admin.notice} ${admin.noticeWarn}`}>This changes website prices. Confirmation appears before saving.</div>
            {error ? <p className={`${admin.notice} ${admin.noticeError}`}>{error}</p> : null}
            <div className={styles.dialogActions}><button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={busy === "bulk"}>{busy === "bulk" ? "Updating…" : `Update ${filtered.length} prices`}</button></div>
          </form>
        </div>
      ) : null}

      {dialog === "edit" && selected ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <form className={styles.dialog} onSubmit={saveEditor}>
            <div className={styles.dialogHead}><div><h2>{selected.name}</h2><p className={admin.pageSub}>Edit details, stock, price, and website photos.</p></div><button className={admin.btn} type="button" onClick={() => setDialog("")}>Close</button></div>
            <ProductFields form={form} setForm={setForm} />
            <section style={{ marginTop: "1rem" }}>
              <label className={admin.field}><span className={admin.label}>Replace website photos (up to 8)</span><input className={admin.input} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => selectImages(event.target.files)} /></label>
              {busy === "photos" ? <p className={admin.pageSub}>Compressing photos for secure storage…</p> : null}
              {images.length ? <div className={styles.photoGrid}>{images.map((image, index) => <div className={styles.photo} key={`${image.slice(-24)}-${index}`}><NextImage src={image} alt={`Product view ${index + 1}`} fill sizes="140px" unoptimized /></div>)}</div> : <div className={`${admin.notice} ${admin.noticeWarn}`} style={{ marginTop: "0.8rem" }}>No images. Product cannot publish.</div>}
              <label className={admin.field} style={{ marginTop: "0.8rem" }}><span className={admin.label}>Number of images shown on website</span><input className={admin.input} type="number" min="0" max={images.length} value={displayCount} onChange={(event) => setDisplayCount(Math.max(0, Math.min(images.length, Number(event.target.value) || 0)))} /></label>
            </section>
            {error ? <p className={`${admin.notice} ${admin.noticeError}`}>{error}</p> : null}
            <div className={styles.dialogActions}>
              <button className={`${admin.btn} ${admin.btnDanger}`} type="button" onClick={deleteProduct} disabled={Boolean(busy)}>Delete</button>
              <button className={admin.btn} type="button" onClick={duplicateProduct} disabled={Boolean(busy)}>Duplicate</button>
              <button className={`${admin.btn} ${admin.btnPrimary}`} type="submit" disabled={Boolean(busy)}>{busy === "edit" ? "Saving…" : "Save product"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ProductFields({ form, setForm }: { form: ProductForm; setForm: (value: ProductForm) => void }) {
  const field = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm({ ...form, [key]: value });
  return (
    <div className={styles.formGrid}>
      <label className={admin.field}><span className={admin.label}>Name</span><input className={admin.input} value={form.name} onChange={(event) => field("name", event.target.value)} required /></label>
      <label className={admin.field}><span className={admin.label}>SKU / code</span><input className={admin.input} value={form.sku} onChange={(event) => field("sku", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Category</span><select className={admin.select} value={form.category} onChange={(event) => field("category", event.target.value as ProductCategory)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className={admin.field}><span className={admin.label}>Price ($)</span><input className={admin.input} type="number" min="1" step="1" value={form.price} onChange={(event) => field("price", event.target.value)} required /></label>
      <label className={admin.field}><span className={admin.label}>On hand</span><input className={admin.input} type="number" min="0" step="1" value={form.stock} onChange={(event) => field("stock", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Style</span><input className={admin.input} value={form.style} onChange={(event) => field("style", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Metal / material</span><input className={admin.input} value={form.material} onChange={(event) => field("material", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Center stone</span><input className={admin.input} value={form.centerStone} onChange={(event) => field("centerStone", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Carats</span><input className={admin.input} type="number" min="0" step="0.01" value={form.carats} onChange={(event) => field("carats", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Color / clarity</span><input className={admin.input} value={form.colorClarity} onChange={(event) => field("colorClarity", event.target.value)} /></label>
      <label className={admin.field}><span className={admin.label}>Size info</span><input className={admin.input} value={form.sizeInfo} onChange={(event) => field("sizeInfo", event.target.value)} /></label>
      <label className={`${admin.field} ${styles.span2}`}><span className={admin.label}>Description</span><textarea className={admin.textarea} value={form.description} onChange={(event) => field("description", event.target.value)} /></label>
    </div>
  );
}
