import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../core/services/storage_service.dart';
import '../models/admin_user.dart';

class AuthProvider extends ChangeNotifier {
  AdminUser? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AdminUser? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> checkAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = StorageService.getToken();
      if (token == null || token.isEmpty) {
        _user = null;
        _isLoading = false;
        notifyListeners();
        return;
      }

      final cachedUserJson = StorageService.getAdminUser();
      if (cachedUserJson != null) {
        _user = AdminUser.fromJson(jsonDecode(cachedUserJson), token: token);
      }

      // Verify token with backend
      final res = await ApiService.get(ApiEndpoints.me);
      if (res is Map<String, dynamic>) {
        _user = AdminUser.fromJson(res, token: token);
        await StorageService.setAdminUser(jsonEncode(_user!.toJson()));
      }
    } catch (_) {
      // If network fails but cached token exists, keep session for offline viewing
      final token = StorageService.getToken();
      final cachedUserJson = StorageService.getAdminUser();
      if (token != null && cachedUserJson != null) {
        _user = AdminUser.fromJson(jsonDecode(cachedUserJson), token: token);
      } else {
        _user = null;
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(
        ApiEndpoints.login,
        body: {'username': username.trim(), 'password': password},
      );

      if (res is Map) {
        final token = res['token']?.toString() ?? 'auth-cookie-session';
        await StorageService.setToken(token);

        final adminData = res['admin'] is Map ? Map<String, dynamic>.from(res['admin']) : {'username': username.trim()};
        _user = AdminUser.fromJson(adminData, token: token);
        await StorageService.setAdminUser(jsonEncode(_user!.toJson()));

        _isLoading = false;
        notifyListeners();
        return true;
      }
      throw ApiException('Unexpected login response format');
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post(ApiEndpoints.logout);
    } catch (_) {}
    await StorageService.clearSession();
    _user = null;
    notifyListeners();
  }
}
