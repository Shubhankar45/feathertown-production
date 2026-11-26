import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../core/services/api_service.dart';
import '../models/booking_model.dart';

class BookingsProvider extends ChangeNotifier {
  List<BirdBookingItem> _bookings = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _statusFilter = 'all';

  List<BirdBookingItem> get bookings => _bookings;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get statusFilter => _statusFilter;

  List<BirdBookingItem> get filteredBookings {
    if (_statusFilter == 'all') return _bookings;
    return _bookings.where((b) => b.status == _statusFilter).toList();
  }

  void setStatusFilter(String s) {
    _statusFilter = s;
    notifyListeners();
  }

  Future<void> fetchBookings({bool refresh = false}) async {
    if (!refresh && _bookings.isNotEmpty) return;
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.get(ApiEndpoints.bookings);
      if (res is Map && res['bookings'] is List) {
        final list = res['bookings'] as List;
        _bookings = list.map((e) => BirdBookingItem.fromJson(Map<String, dynamic>.from(e))).toList();
      } else if (res is List) {
        _bookings = res.map((e) => BirdBookingItem.fromJson(Map<String, dynamic>.from(e))).toList();
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createBooking(Map<String, dynamic> data) async {
    try {
      final res = await ApiService.post(ApiEndpoints.bookings, body: data);
      if (res is Map<String, dynamic>) {
        _bookings.insert(0, BirdBookingItem.fromJson(res));
        await fetchBookings(refresh: true);
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
    return false;
  }

  Future<bool> updateBooking(String invoiceId, Map<String, dynamic> data) async {
    try {
      await ApiService.patch(ApiEndpoints.bookingDetail(invoiceId), body: data);
      await fetchBookings(refresh: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteBooking(String invoiceId) async {
    try {
      await ApiService.delete(ApiEndpoints.bookingDetail(invoiceId));
      _bookings.removeWhere((b) => b.id == invoiceId || b.invoiceNumber == invoiceId);
      await fetchBookings(refresh: true);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
