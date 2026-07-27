import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listInventory, listPurchasedInventory } from "@/lib/admin/inventory";
import { PurchasedInventory } from "@/components/admin/PurchasedInventory";
import { InventoryClient } from "@/components/admin/InventoryClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const [rows, purchased] = await Promise.all([
    listInventory(),
    listPurchasedInventory().catch(() => ({ memos: [], rows: [] })),
  ]);
  const soldOut = rows.filter((row) => row.stock <= 0).length;
  const hidden = rows.filter((row) => !row.visible).length;
  const missingImages = rows.filter((row) => row.missingImages).length;
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Inventory</h1>
          <p className={styles.pageSub}>Stock, website visibility, prices, product records, images, and Excel import.</p>
        </div>
      </header>
      <TileGrid>
        <StatTile label="Products" value={rows.length} />
        <StatTile label="Sold out" value={soldOut} tone={soldOut ? "warn" : "good"} />
        <StatTile label="Hidden" value={hidden} tone={hidden ? "warn" : "neutral"} />
        <StatTile label="Missing images" value={missingImages} tone={missingImages ? "bad" : "good"} />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}><InventoryClient initialRows={rows} /></section>
      <section style={{ marginTop: "1.2rem" }}>
        <PurchasedInventory memos={purchased.memos} initialRows={purchased.rows} />
      </section>
    </>
  );
}

