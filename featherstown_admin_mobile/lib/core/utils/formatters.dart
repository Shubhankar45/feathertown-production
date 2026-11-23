import 'package:intl/intl.dart';

class AppFormatters {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static final NumberFormat _decimalCurrencyFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  /// Formats amount in Indian Rupees (e.g. ₹45,000)
  static String currency(num? amount, {bool showDecimals = false}) {
    if (amount == null) return '₹0';
    if (showDecimals && amount % 1 != 0) {
      return _decimalCurrencyFormat.format(amount);
    }
    return _currencyFormat.format(amount);
  }

  /// Compact currency format (e.g. ₹4.5L or ₹25K)
  static String compactCurrency(num? amount) {
    if (amount == null || amount == 0) return '₹0';
    final n = amount.toDouble();
    if (n >= 10000000) {
      return '₹${(n / 10000000).toStringAsFixed(1)}Cr';
    } else if (n >= 100000) {
      return '₹${(n / 100000).toStringAsFixed(1)}L';
    } else if (n >= 1000) {
      return '₹${(n / 1000).toStringAsFixed(1)}K';
    }
    return '₹${n.toInt()}';
  }

  /// Standard Date (e.g. 15 Nov 2026)
  static String date(dynamic val) {
    if (val == null) return '—';
    try {
      DateTime dt;
      if (val is DateTime) {
        dt = val;
      } else {
        dt = DateTime.parse(val.toString());
      }
      return DateFormat('dd MMM yyyy').format(dt);
    } catch (_) {
      return val.toString();
    }
  }

  /// Date & Time (e.g. 15 Nov 2026, 04:30 PM)
  static String dateTime(dynamic val) {
    if (val == null) return '—';
    try {
      DateTime dt;
      if (val is DateTime) {
        dt = val;
      } else {
        dt = DateTime.parse(val.toString());
      }
      return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
    } catch (_) {
      return val.toString();
    }
  }

  /// Notification grouping: 'Today', 'Yesterday', or 'Earlier'
  static String notificationGroup(DateTime dt) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final itemDate = DateTime(dt.year, dt.month, dt.day);

    final diff = today.difference(itemDate).inDays;
    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    return 'Earlier';
  }

  /// Safe lowercased string for search
  static String safeLower(dynamic val) {
    if (val == null) return '';
    return val.toString().toLowerCase().trim();
  }
}
