class AdminNotification {
  final String id;
  final String title;
  final String body;
  final String category; // 'order' | 'invoice' | 'booking' | 'inventory' | 'customer' | 'system'
  final String priority; // 'low' | 'normal' | 'high' | 'urgent'
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic>? data;

  AdminNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.category,
    required this.priority,
    required this.isRead,
    required this.createdAt,
    this.data,
  });

  factory AdminNotification.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final cAt = json['createdAt'];
      dt = cAt != null ? DateTime.parse(cAt.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    return AdminNotification(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      title: json['title'] ?? 'Notification',
      body: json['body'] ?? '',
      category: json['category'] ?? 'system',
      priority: json['priority'] ?? 'normal',
      isRead: json['isRead'] == true,
      createdAt: dt,
      data: json['data'] is Map ? Map<String, dynamic>.from(json['data']) : null,
    );
  }

  AdminNotification copyWith({bool? isRead}) {
    return AdminNotification(
      id: id,
      title: title,
      body: body,
      category: category,
      priority: priority,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
      data: data,
    );
  }
}
