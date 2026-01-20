export function generateColorFromId(str: string): string {
  let hash = 0;
  if (!str) return "hsl(0, 0%, 50%)";
  
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 50%)`;
}

export function getTopInventoryData(rawData: any[], limit: number = 5) {
  if (!rawData || rawData.length === 0) return [];

  const sorted = [...rawData].sort((a, b) => b.count - a.count);
  
  const topItems = sorted.slice(0, limit).map(item => ({
    ...item,
    fill: generateColorFromId(item.id)
  }));

  if (sorted.length > limit) {
    const othersCount = sorted.slice(limit).reduce((acc, curr) => acc + curr.count, 0);
    topItems.push({
      id: "others-group",
      name: "Others",
      count: othersCount,
      fill: "hsl(215, 16%, 47%)"
    });
  }

  return topItems;
}