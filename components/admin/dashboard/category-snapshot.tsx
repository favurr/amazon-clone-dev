import { getCategoryDistribution } from "@/actions/dashboard";
import { CategorySnapshotClient } from "./category-snapshot-client";

export async function CategorySnapshot() {
  const data = await getCategoryDistribution();
  
  if (!data || data.length === 0) {
    return <div className="h-60 border rounded-xl flex items-center justify-center text-muted-foreground">No inventory data</div>;
  }

  return <CategorySnapshotClient data={data} />;
}