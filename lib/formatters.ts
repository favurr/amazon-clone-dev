export function formatPrice(price: any) {
  const amount = typeof price === "number" ? price : parseFloat(price);
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-US").format(number);
}

export function formatCompactNumber(number: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}