import prisma from "@/lib/prisma";

export async function fulfillOrder(orderId: string, flwId?: string) {
  console.log("FULFILL_ORDER_START", { orderId, flwId });

  // Load the order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");

  // Prevent double-processing
  if (order.status === "COMPLETED") {
    return order;
  }

  // Decrement variant stock for each order item that has a variantId
  for (const item of order.items) {
    if (item.variantId) {
      try {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant) {
          console.warn("Variant not found for stock decrement", {
            variantId: item.variantId,
          });
          continue;
        }

        const newStock = Math.max(0, variant.stock - item.quantity);
        await prisma.variant.update({
          where: { id: variant.id },
          data: { stock: newStock },
        });
      } catch (e) {
        console.error("Failed to decrement stock for variant", {
          variantId: item.variantId,
          itemId: item.id,
          error: e,
        });
      }
    } else {
      // If no variantId is present, we log and skip
      console.warn("OrderItem missing variantId; skipping stock decrement", {
        orderId: order.id,
        itemId: item.id,
      });
    }
  }

  // Update order status and payment status and optionally flw_id
  const updateData: any = { status: "COMPLETED", paymentStatus: "paid" };
  if (flwId) updateData.flw_id = flwId;

  await prisma.order.update({ where: { id: orderId }, data: updateData });

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  console.log("FULFILL_ORDER_COMPLETE", {
    orderId,
    status: updated?.status,
    paymentStatus: updated?.paymentStatus,
  });
  return updated;
}
