import React, { useState, useEffect } from "react";
import { useAuth } from "@app/providers";
import {
  requestNotificationPermission,
  deleteFCMToken,
} from "@features/notification";
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
    setNotificationEnabled(!!currentUser?.fcmToken);
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
            {[
              {
                label: "Messaging",
                condition: !!messaging,
                trueText: "✅ Supported",
                falseText: "❌ Not Supported",
              },
              {
                label: "Service Worker",
                condition: "serviceWorker" in navigator,
                trueText: "✅ Supported",
                falseText: "❌ Not Supported",
              },
              {
                label: "Notification API",
                condition: "Notification" in window,
                trueText: "✅ Available",
                falseText: "❌ Not Available",
              },
              {
                label: "Permission",
                value: "Notification" in window ? Notification.permission : "N/A",
              },
              {
                label: "FCM Token",
                condition: !!currentUser?.fcmToken,
                trueText: "✅ Saved",
                falseText: "❌ Not saved",
                falseColor: "text-gray-400",
              },
              {
                label: "User Agent",
                value: navigator.userAgent,
                className: "break-all text-[10px]",
              },
              {
                label: "Platform",
                value: navigator.platform,
              },
              {
                label: "Standalone",
                condition: window.matchMedia("(display-mode: standalone)").matches,
                trueText: "✅ PWA Mode",
                falseText: "⚠️ Browser Mode",
                falseColor: "text-orange-600",
              },
            ].map(({ label, condition, trueText, falseText, falseColor = "text-red-600", value, className }) => (
              <React.Fragment key={label}>
                <span className="font-semibold">{label}:</span>
                <span className={className ?? (value !== undefined ? undefined : condition ? "text-green-600" : falseColor)}>
                  {value !== undefined ? value : condition ? trueText : falseText}
                </span>
              </React.Fragment>
            ))}
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
