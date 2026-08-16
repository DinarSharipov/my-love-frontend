export type Notification = {
  id: string;
  userId: string;
  familyId?: string | null;
  type: string;
  title: string;
  body?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
};

export type UpdateNotificationPreferences = Partial<NotificationPreferences>;
