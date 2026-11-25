import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/order_model.dart';

class OrdersProvider extends ChangeNotifier {
  List<StoreOrder> _orders = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _selectedStatus = 'all';

  List<StoreOrder> get orders {
    if (_selectedStatus == 'all') return _orders;
    return _orders.where((o) => o.orderStatus.toLowerCase() == _selectedStatus.toLowerCase()).toList();
  }

  int get pendingCount => _orders.where((o) => o.orderStatus.toLowerCase() == 'pending').length;
  int get confirmedCount => _orders.where((o) => o.orderStatus.toLowerCase() == 'confirmed').length;
  int get shippedCount => _orders.where((o) => o.orderStatus.toLowerCase() == 'shipped').length;
  int get deliveredCount => _orders.where((o) => o.orderStatus.toLowerCase() == 'delivered').length;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get selectedStatus => _selectedStatus;

  void setSelectedStatus(String status) {
    _selectedStatus = status;
    notifyListeners();
  }

  Future<void> fetchOrders({bool refresh = false}) async {
    if (_orders.isNotEmpty && !refresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.orders);
      if (res is List) {
        _orders = res.map((item) => StoreOrder.fromJson(Map<String, dynamic>.from(item))).toList();
      } else if (res is Map && res['data'] is List) {
        _orders = (res['data'] as List).map((item) => StoreOrder.fromJson(Map<String, dynamic>.from(item))).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateOrderStatus(String id, String newStatus) async {
    try {
      await ApiService.patch('/api/admin/orders/$id/status', body: {'status': newStatus});
      final idx = _orders.indexWhere((o) => o.id == id);
      if (idx != -1) {
        final old = _orders[idx];
        _orders[idx] = StoreOrder(
          id: old.id,
          userEmail: old.userEmail,
          shippingAddress: old.shippingAddress,
          items: old.items,
          amount: old.amount,
          paymentMethod: old.paymentMethod,
          paymentStatus: old.paymentStatus,
          orderStatus: newStatus,
          createdAt: old.createdAt,
        );
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
