import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/invoice_model.dart';

class InvoicesProvider extends ChangeNotifier {
  List<Invoice> _invoices = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _statusFilter = 'all';
  String _searchQuery = '';

  List<Invoice> get invoices => _invoices;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get statusFilter => _statusFilter;
  String get searchQuery => _searchQuery;

  List<Invoice> get filteredInvoices {
    return _invoices.where((inv) {
      if (_statusFilter != 'all' && inv.paymentStatus != _statusFilter) return false;
      if (_searchQuery.trim().isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      final num = inv.invoiceNumber.toLowerCase();
      final cust = (inv.customer['name']?.toString() ?? '').toLowerCase();
      final phone = (inv.customer['phone']?.toString() ?? '').toLowerCase();
      return num.contains(q) || cust.contains(q) || phone.contains(q);
    }).toList();
  }

  void setStatusFilter(String status) {
    _statusFilter = status;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> fetchInvoices({bool refresh = false}) async {
    if (!refresh && _invoices.isNotEmpty) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.invoices);
      if (res is Map && res['invoices'] is List) {
        final list = res['invoices'] as List;
        _invoices = list.map((e) => Invoice.fromJson(Map<String, dynamic>.from(e))).toList();
      } else if (res is List) {
        _invoices = res.map((e) => Invoice.fromJson(Map<String, dynamic>.from(e))).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Invoice?> createInvoice(Map<String, dynamic> body) async {
    try {
      final res = await ApiService.post(ApiEndpoints.invoices, body: body);
      if (res is Map<String, dynamic>) {
        final newInv = Invoice.fromJson(res);
        _invoices.insert(0, newInv);
        notifyListeners();
        return newInv;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
    return null;
  }

  Future<bool> deleteInvoice(String id) async {
    try {
      await ApiService.delete('/api/admin/invoices/$id');
      _invoices.removeWhere((i) => i.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
