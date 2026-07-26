import { redirect } from "next/navigation";
import diamonds from "@/data/loose-diamonds.json";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { DiamondsClient } from "@/components/admin/DiamondsClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export default function DiamondsPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const certified = diamonds.filter((item) => item.certified).length;
  const shapes = new Set(diamonds.map((item) => item.shape)).size;
  return (
    <>
      <header className={styles.pageHead}>
        <div><h1 className={styles.pageTitle}>Loose diamonds</h1><p className={styles.pageSub}>Searchable view of source spreadsheet inventory. Website prices include approved 5% adjustment.</p></div>
      </header>
      <TileGrid>
        <StatTile label="Stones" value={diamonds.length} tone="gold" />
        <StatTile label="Certified" value={certified} tone="good" />
        <StatTile label="Shapes" value={shapes} />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}><DiamondsClient diamonds={diamonds} /></section>
    </>
  );
}
