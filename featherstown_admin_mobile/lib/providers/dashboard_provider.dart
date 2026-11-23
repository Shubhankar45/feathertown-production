import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/dashboard_model.dart';

class DashboardProvider extends ChangeNotifier {
  DashboardAnalytics? _analytics;
  bool _isLoading = false;
  String? _errorMessage;

  DashboardAnalytics? get analytics => _analytics;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchAnalytics({bool refresh = false}) async {
    if (!refresh && _analytics != null) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.analytics);
      if (res is Map<String, dynamic>) {
        _analytics = DashboardAnalytics.fromJson(res);
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
