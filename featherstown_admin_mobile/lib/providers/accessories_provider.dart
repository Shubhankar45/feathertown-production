import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/accessory_model.dart';

class AccessoriesProvider extends ChangeNotifier {
  List<AccessoryModel> _items = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';
  String _selectedCategory = 'All';

  List<AccessoryModel> get items {
    return _items.where((item) {
      final matchesSearch = _searchQuery.isEmpty ||
          item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.category.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (item.sku?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false);
      final matchesCategory = _selectedCategory == 'All' ||
          item.category.toLowerCase() == _selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    }).toList();
  }

  int get totalStock => _items.fold(0, (sum, i) => sum + i.stock);
  int get lowStockCount => _items.where((i) => i.stock > 0 && i.stock <= 5).length;
  int get outOfStockCount => _items.where((i) => i.stock <= 0).length;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;
  String get selectedCategory => _selectedCategory;

  void setSearchQuery(String q) {
    _searchQuery = q.trim();
    notifyListeners();
  }

  void setSelectedCategory(String cat) {
    _selectedCategory = cat;
    notifyListeners();
  }

  Future<void> fetchAccessories({bool refresh = false}) async {
    if (_items.isNotEmpty && !refresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.accessories);
      if (res is List) {
        _items = res.map((item) => AccessoryModel.fromJson(Map<String, dynamic>.from(item))).toList();
      } else if (res is Map && res['data'] is List) {
        _items = (res['data'] as List).map((item) => AccessoryModel.fromJson(Map<String, dynamic>.from(item))).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addAccessory(Map<String, dynamic> data) async {
    try {
      final res = await ApiService.post(ApiEndpoints.accessories, body: data);
      if (res is Map) {
        final newItem = AccessoryModel.fromJson(Map<String, dynamic>.from(res));
        _items.insert(0, newItem);
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

  Future<bool> updateAccessory(String id, Map<String, dynamic> data) async {
    try {
      final res = await ApiService.put('/api/admin/accessories/$id', body: data);
      final idx = _items.indexWhere((i) => i.id == id);
      if (idx != -1 && res is Map) {
        _items[idx] = AccessoryModel.fromJson(Map<String, dynamic>.from(res));
        notifyListeners();
      } else if (idx != -1) {
        final old = _items[idx];
        _items[idx] = AccessoryModel(
          id: old.id,
          name: data['name'] ?? old.name,
          category: data['category'] ?? old.category,
          price: double.tryParse(data['price']?.toString() ?? '') ?? old.price,
          stock: int.tryParse(data['stock']?.toString() ?? '') ?? old.stock,
          image: data['image'] ?? old.image,
          description: data['description'] ?? old.description,
          sku: data['sku'] ?? old.sku,
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

  Future<bool> updateStock(String id, int newStock) async {
    try {
      final idx = _items.indexWhere((i) => i.id == id);
      if (idx == -1) return false;
      final current = _items[idx];

      final updatedData = {
        'name': current.name,
        'category': current.category,
        'price': current.price,
        'stock': newStock,
        'image': current.image,
        'description': current.description,
        'sku': current.sku,
      };

      await ApiService.put('/api/admin/accessories/$id', body: updatedData);

      _items[idx] = AccessoryModel(
        id: current.id,
        name: current.name,
        category: current.category,
        price: current.price,
        stock: newStock,
        image: current.image,
        description: current.description,
        sku: current.sku,
      );
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteAccessory(String id) async {
    try {
      await ApiService.delete('/api/admin/accessories/$id');
      _items.removeWhere((i) => i.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
