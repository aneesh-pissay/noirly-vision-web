export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeNotificationScheduler } = await import(
      "@/services/notification-scheduler"
    );
    initializeNotificationScheduler();
  }
}
