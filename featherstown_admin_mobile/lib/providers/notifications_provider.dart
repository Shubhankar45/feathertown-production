import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/notification_model.dart';

class NotificationsProvider extends ChangeNotifier {
  List<AdminNotification> _notifications = [];
  int _unreadCount = 0;
  Map<String, int> _categoryUnread = {};
  bool _isLoading = false;
  String? _errorMessage;
  String _activeCategory = 'all';

  List<AdminNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  Map<String, int> get categoryUnread => _categoryUnread;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get activeCategory => _activeCategory;

  List<AdminNotification> get filteredNotifications {
    if (_activeCategory == 'all') return _notifications;
    return _notifications.where((n) => n.category == _activeCategory).toList();
  }

  void setActiveCategory(String cat) {
    _activeCategory = cat;
    notifyListeners();
  }

  Future<void> fetchNotifications({bool refresh = false}) async {
    if (!refresh && _notifications.isNotEmpty) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(
        ApiEndpoints.notifications,
        queryParams: {'limit': 100},
      );

      if (res is Map) {
        final listRaw = res['notifications'] as List? ?? [];
        _notifications = listRaw.map((e) => AdminNotification.fromJson(Map<String, dynamic>.from(e))).toList();
        _unreadCount = (res['unreadCount'] is num) ? (res['unreadCount'] as num).toInt() : 0;
        if (res['categoryUnread'] is Map) {
          _categoryUnread = Map<String, int>.from(res['categoryUnread']);
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await ApiService.patch(ApiEndpoints.notificationRead(id));
      final idx = _notifications.indexWhere((n) => n.id == id);
      if (idx != -1 && !_notifications[idx].isRead) {
        _notifications[idx] = _notifications[idx].copyWith(isRead: true);
        if (_unreadCount > 0) _unreadCount--;
        final cat = _notifications[idx].category;
        if ((_categoryUnread[cat] ?? 0) > 0) {
          _categoryUnread[cat] = _categoryUnread[cat]! - 1;
        }
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await ApiService.post(ApiEndpoints.notificationsMarkAllRead);
      _notifications = _notifications.map((n) => n.copyWith(isRead: true)).toList();
      _unreadCount = 0;
      _categoryUnread.clear();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> deleteNotification(String id) async {
    try {
      await ApiService.delete(ApiEndpoints.notificationDetail(id));
      _notifications.removeWhere((n) => n.id == id);
      notifyListeners();
    } catch (_) {}
  }
}
