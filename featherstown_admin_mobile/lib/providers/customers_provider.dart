import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/customer_model.dart';

class CustomersProvider extends ChangeNotifier {
  List<Customer> _customers = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';

  List<Customer> get customers => _customers;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<Customer> get filteredCustomers {
    if (_searchQuery.trim().isEmpty) return _customers;
    final q = _searchQuery.toLowerCase();
    return _customers.where((c) {
      return c.name.toLowerCase().contains(q) ||
          c.phone.toLowerCase().contains(q) ||
          (c.email?.toLowerCase().contains(q) ?? false) ||
          (c.city?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  Future<void> fetchCustomers({bool refresh = false}) async {
    if (!refresh && _customers.isNotEmpty) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.customers);
      if (res is Map && res['customers'] is List) {
        final list = res['customers'] as List;
        _customers = list.map((e) => Customer.fromJson(Map<String, dynamic>.from(e))).toList();
      } else if (res is List) {
        _customers = res.map((e) => Customer.fromJson(Map<String, dynamic>.from(e))).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createCustomer(Map<String, dynamic> data) async {
    try {
      final res = await ApiService.post(ApiEndpoints.customers, body: data);
      if (res is Map<String, dynamic>) {
        _customers.insert(0, Customer.fromJson(res));
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
    return false;
  }
}
