import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/transaction_model.dart';

class TransactionsProvider extends ChangeNotifier {
  List<LedgerTransaction> _transactions = [];
  double _totalInflow = 0.0;
  double _totalOutflow = 0.0;
  double _netBalance = 0.0;
  bool _isLoading = false;
  String? _errorMessage;
  String _typeFilter = 'all';

  List<LedgerTransaction> get transactions => _transactions;
  double get totalInflow => _totalInflow;
  double get totalOutflow => _totalOutflow;
  double get netBalance => _netBalance;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get typeFilter => _typeFilter;

  List<LedgerTransaction> get filteredTransactions {
    if (_typeFilter == 'all') return _transactions;
    return _transactions.where((t) => t.type == _typeFilter).toList();
  }

  void setTypeFilter(String type) {
    _typeFilter = type;
    notifyListeners();
  }

  Future<void> fetchTransactions({bool refresh = false}) async {
    if (!refresh && _transactions.isNotEmpty) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.transactions);
      if (res is Map) {
        final list = res['transactions'] as List? ?? [];
        _transactions = list.map((e) => LedgerTransaction.fromJson(Map<String, dynamic>.from(e))).toList();
        _totalInflow = (res['totalInflow'] is num) ? (res['totalInflow'] as num).toDouble() : 0.0;
        _totalOutflow = (res['totalOutflow'] is num) ? (res['totalOutflow'] as num).toDouble() : 0.0;
        _netBalance = (res['netBalance'] is num) ? (res['netBalance'] as num).toDouble() : 0.0;
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createTransaction(Map<String, dynamic> data) async {
    try {
      final res = await ApiService.post(ApiEndpoints.transactions, body: data);
      if (res is Map<String, dynamic>) {
        _transactions.insert(0, LedgerTransaction.fromJson(res));
        await fetchTransactions(refresh: true);
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
    return false;
  }
}
