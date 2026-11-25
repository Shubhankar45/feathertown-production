import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/bird_model.dart';

class BirdsProvider extends ChangeNotifier {
  List<BirdModel> _birds = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';
  String _selectedStatus = 'all'; // all, available, reserved, sold

  List<BirdModel> get birds {
    return _birds.where((b) {
      final matchesSearch = _searchQuery.isEmpty ||
          b.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          b.species.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (b.ringNumber?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      final matchesStatus = _selectedStatus == 'all' || b.status.toLowerCase() == _selectedStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    }).toList();
  }

  int get totalCount => _birds.length;
  int get availableCount => _birds.where((b) => b.status.toLowerCase() == 'available').length;
  int get reservedCount => _birds.where((b) => b.status.toLowerCase() == 'reserved').length;
  int get soldCount => _birds.where((b) => b.status.toLowerCase() == 'sold').length;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  String get selectedStatus => _selectedStatus;

  void setSearchQuery(String q) {
    _searchQuery = q.trim();
    notifyListeners();
  }

  void setSelectedStatus(String status) {
    _selectedStatus = status;
    notifyListeners();
  }

  Future<void> fetchBirds({bool refresh = false}) async {
    if (_birds.isNotEmpty && !refresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.birds);
      if (res is List) {
        _birds = res.map((item) => BirdModel.fromJson(Map<String, dynamic>.from(item))).toList();
      } else if (res is Map && res['data'] is List) {
        _birds = (res['data'] as List).map((item) => BirdModel.fromJson(Map<String, dynamic>.from(item))).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addBird(Map<String, dynamic> birdData) async {
    try {
      final res = await ApiService.post(ApiEndpoints.birds, body: birdData);
      if (res is Map) {
        final newBird = BirdModel.fromJson(Map<String, dynamic>.from(res));
        _birds.insert(0, newBird);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateBirdStatus(String id, String newStatus) async {
    try {
      await ApiService.patch('/api/admin/birds/$id/status', body: {'status': newStatus});
      final idx = _birds.indexWhere((b) => b.id == id);
      if (idx != -1) {
        final old = _birds[idx];
        _birds[idx] = BirdModel(
          id: old.id,
          name: old.name,
          species: old.species,
          category: old.category,
          price: old.price,
          status: newStatus,
          image: old.image,
          description: old.description,
          ringNumber: old.ringNumber,
          dnaSex: old.dnaSex,
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

  Future<bool> deleteBird(String id) async {
    try {
      await ApiService.delete('/api/admin/birds/$id');
      _birds.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
