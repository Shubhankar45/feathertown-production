class ApiEndpoints {
  static const String defaultBaseUrl = 'https://feathertown.online';

  // Auth
  static const String adminLogin = '/api/auth/login';
  static const String adminLogout = '/api/auth/logout';
  static const String adminMe = '/api/auth/me';
  static const String login = adminLogin;
  static const String logout = adminLogout;
  static const String me = adminMe;

  // Dashboard & Analytics
  static const String analytics = '/api/admin/analytics';
  static const String auditLogs = '/api/admin/audit-logs';

  // Billing & Invoices
  static const String invoices = '/api/admin/invoices';
  static const String transactions = '/api/admin/transactions';
  static const String customers = '/api/admin/customers';

  // Birds & Bookings
  static const String birds = '/api/admin/birds';
  static const String bookings = '/api/admin/bookings';
  static String bookingDetail(String id) => '/api/admin/bookings/$id';

  // Accessories & Inventory
  static const String accessories = '/api/admin/accessories';
  static const String categories = '/api/admin/categories';

  // Orders, Reviews, Subscribers
  static const String orders = '/api/admin/orders';
  static const String reviews = '/api/admin/reviews';
  static const String subscribers = '/api/admin/subscribers';

  // Settings & Media Upload
  static const String settings = '/api/admin/settings';
  static const String upload = '/api/admin/upload';

  // Real-Time Notification Center
  static const String notifications = '/api/admin/notifications';
  static const String markAllNotificationsRead = '/api/admin/notifications/mark-all-read';
  static const String notificationsMarkAllRead = markAllNotificationsRead;
  static String notificationRead(String id) => '/api/admin/notifications/$id/read';
  static String notificationDetail(String id) => '/api/admin/notifications/$id';
  static const String registerFcmToken = '/api/admin/notifications/fcm-token';
  static const String testNotification = '/api/admin/notifications/test';
}
