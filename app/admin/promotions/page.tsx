import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listPromos } from "@/lib/admin/promo-codes";
import { PromoClient } from "@/components/admin/PromoClient";
import { StatTile, TileGrid } from "../StatTile";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  if (!isAdminAuthenticated()) redirect("/admin/login");
  const promos = await listPromos().catch(() => []);
  const today = new Date().toISOString().slice(0, 10);
  const live = promos.filter((promo) =>
    promo.active &&
    (!promo.expiresAt || promo.expiresAt >= today) &&
    (!promo.startsAt || promo.startsAt <= today) &&
    !(typeof promo.maxRedemptions === "number" && promo.redemptions >= promo.maxRedemptions)).length;
  const redemptions = promos.reduce((sum, promo) => sum + promo.redemptions, 0);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Promotions</h1>
          <p className={styles.pageSub}>
            Discount codes customers enter at checkout. Every rule here is enforced again
            on the server before payment, so a code can never take more than it should.
          </p>
        </div>
      </header>
      <TileGrid>
        <StatTile label="Live codes" value={live} tone="gold" />
        <StatTile label="Total codes" value={promos.length} />
        <StatTile label="Redemptions" value={redemptions} />
      </TileGrid>
      <section style={{ marginTop: "1.2rem" }}>
        <PromoClient initialPromos={promos} />
      </section>
    </>
  );
}
