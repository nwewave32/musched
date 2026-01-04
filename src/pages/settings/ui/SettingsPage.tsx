import { useState, useEffect } from "react";
import { useAuth } from "@shared/context/AuthContext";
import {
  requestNotificationPermission,
  deleteFCMToken,
} from "@shared/lib/fcm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@shared/ui/card";
import { Checkbox } from "@shared/ui/checkbox";
import { Label } from "@shared/ui/label";
import { messaging } from "@shared/config/firebase";

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.fcmToken) {
      setNotificationEnabled(true);
    }
  }, [currentUser]);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      if (enabled) {
        const success = await requestNotificationPermission(currentUser.id);
        setNotificationEnabled(success);

        if (!success) {
          alert(
            "Failed to enable notifications. Please check your browser permissions."
          );
        }
      } else {
        await deleteFCMToken(currentUser.id);
        setNotificationEnabled(false);
      }
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      alert("An error occurred while updating notification settings.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <p>Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="notifications"
              checked={notificationEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={isLoading}
            />
            <div className="space-y-1">
              <Label
                htmlFor="notifications"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable push notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for lesson proposals, confirmations, and
                cancellations
              </p>
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-muted-foreground">Updating...</p>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs font-mono">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="font-semibold">Messaging:</span>
            <span className={messaging ? "text-green-600" : "text-red-600"}>
              {messaging ? "✅ Supported" : "❌ Not Supported"}
            </span>

            <span className="font-semibold">Service Worker:</span>
            <span className={"serviceWorker" in navigator ? "text-green-600" : "text-red-600"}>
              {"serviceWorker" in navigator ? "✅ Supported" : "❌ Not Supported"}
            </span>

            <span className="font-semibold">Notification API:</span>
            <span className={"Notification" in window ? "text-green-600" : "text-red-600"}>
              {"Notification" in window ? "✅ Available" : "❌ Not Available"}
            </span>

            <span className="font-semibold">Permission:</span>
            <span>
              {"Notification" in window ? Notification.permission : "N/A"}
            </span>

            <span className="font-semibold">FCM Token:</span>
            <span className={currentUser?.fcmToken ? "text-green-600" : "text-gray-400"}>
              {currentUser?.fcmToken ? "✅ Saved" : "❌ Not saved"}
            </span>

            <span className="font-semibold">User Agent:</span>
            <span className="break-all text-[10px]">
              {navigator.userAgent}
            </span>

            <span className="font-semibold">Platform:</span>
            <span>{navigator.platform}</span>

            <span className="font-semibold">Standalone:</span>
            <span className={(window.matchMedia('(display-mode: standalone)').matches) ? "text-green-600" : "text-orange-600"}>
              {(window.matchMedia('(display-mode: standalone)').matches) ? "✅ PWA Mode" : "⚠️ Browser Mode"}
            </span>
          </div>

          {!messaging && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <p className="font-semibold mb-1">❌ Firebase Messaging Not Supported</p>
              <p className="text-[11px] leading-relaxed">
                Possible reasons:<br/>
                • iOS version must be 16.4 or higher<br/>
                • Must run as PWA (use home screen icon)<br/>
                • Service Worker must be supported<br/>
                • Third-party cookies must be enabled
              </p>
            </div>
          )}

          {messaging && !currentUser?.fcmToken && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-[11px]">
              ℹ️ Firebase Messaging is supported. Check the box above to enable notifications.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
