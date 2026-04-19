import { createContext, ReactNode, useState } from 'react';
import notifee, { AndroidImportance } from '@notifee/react-native';

type Notification = {
  title: string;
  body: string;
};

interface NotificationContextType {
  notifications: Array<Notification>;
  handleNotification: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  handleNotification: () => {},
});

// Create a notification channel once when the module loads
notifee.createChannel({
  id: 'package-alerts',
  name: 'Package Alerts',
  importance: AndroidImportance.HIGH,
  vibration: true,
  sound: 'default',
}).catch(err => console.warn('Failed to create channel:', err));

// Helper to show a local notification
const showLocalNotification = async (title: string, message: string) => {
  await notifee.displayNotification({
    title,
    body: message,
    android: {
      channelId: 'package-alerts',
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
};

function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleNotification = (title: string, body: string) => {
    console.log("Notification Called")  // Debug print
    // Store in context state
    setNotifications(prev => [...prev, { title, body }]);
    // Show system notification
    showLocalNotification(title, body);
  };

  return (
    <NotificationContext.Provider value={{ notifications, handleNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext, NotificationProvider };