import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';

class AdsProvider extends ChangeNotifier {
  List<dynamic> _campaigns = [];
  Map<String, dynamic>? _analytics;
  Map<String, dynamic>? _credentials;
  bool _isLoading = false;
  String? _error;

  List<dynamic> get campaigns => _campaigns;
  Map<String, dynamic>? get analytics => _analytics;
  Map<String, dynamic>? get credentials => _credentials;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final resCamp = await ApiService.get(ApiEndpoints.adCampaigns);
      if (resCamp is List) _campaigns = resCamp;

      final resAnal = await ApiService.get(ApiEndpoints.adAnalytics);
      if (resAnal is Map) _analytics = Map<String, dynamic>.from(resAnal);

      final resCred = await ApiService.get(ApiEndpoints.adCredentials);
      if (resCred is Map) _credentials = Map<String, dynamic>.from(resCred);
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createCampaign(Map<String, dynamic> data) async {
    try {
      await ApiService.post(ApiEndpoints.adCampaigns, body: data);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateCampaign(String id, Map<String, dynamic> data) async {
    try {
      await ApiService.put(ApiEndpoints.adCampaignDetail(id), body: data);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteCampaign(String id) async {
    try {
      await ApiService.delete(ApiEndpoints.adCampaignDetail(id));
      _campaigns.removeWhere((c) => (c['_id'] == id || c['id'] == id));
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> saveCredentials(String platform, Map<String, dynamic> creds) async {
    try {
      await ApiService.post(ApiEndpoints.adCredentials, body: {'platform': platform, ...creds});
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>?> testConnection(String platform) async {
    try {
      final res = await ApiService.post(ApiEndpoints.adTestConnection, body: {'platform': platform});
      await loadAll();
      if (res is Map) return Map<String, dynamic>.from(res);
      return {'success': true};
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> syncInsights() async {
    try {
      await ApiService.post(ApiEndpoints.adSync);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
