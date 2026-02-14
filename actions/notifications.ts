"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "BAD_REVIEW"
  | "NEW_ORDER"
  | "LOW_STOCK"
  | "NEW_USER"
  | "ORDER_FAILED";

/**
 * Create a notification for admin
 */
export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        link: link || null,
      },
    });

    // Revalidate admin pages to show new notification
    revalidatePath("/admin");
  } catch (error) {
    console.error("[CREATE_NOTIFICATION_ERROR]", error);
    // Don't throw - notifications should not break main flow
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadNotificationsCount() {
  try {
    const count = await prisma.notification.count({
      where: { isRead: false },
    });
    return count;
  } catch (error) {
    console.error("[GET_UNREAD_COUNT_ERROR]", error);
    return 0;
  }
}

/**
 * Get recent notifications (latest 10)
 */
export async function getRecentNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    return notifications;
  } catch (error) {
    console.error("[GET_RECENT_NOTIFICATIONS_ERROR]", error);
    return [];
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("[MARK_ALL_READ_ERROR]", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("[MARK_READ_ERROR]", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Delete old read notifications (cleanup utility)
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: cutoffDate },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[DELETE_OLD_NOTIFICATIONS_ERROR]", error);
    return { success: false, error: "Failed to delete old notifications" };
  }
}
