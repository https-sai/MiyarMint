import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { savePushToken } from "../api/client";

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  try {
    await savePushToken(token);
  } catch {
    // Backend may be offline during local preview; keep the token for retry.
  }

  return token;
}
