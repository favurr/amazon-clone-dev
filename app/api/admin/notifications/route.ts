import { NextResponse } from "next/server";
import { getRecentNotifications, getUnreadNotificationsCount } from "@/actions/notifications";

export async function GET() {
  try {
    const [notifications, unreadCount] = await Promise.all([
      getRecentNotifications(),
      getUnreadNotificationsCount(),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
