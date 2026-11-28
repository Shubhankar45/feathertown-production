import 'booking_model.dart';

class InvoiceItem {
  final String? id;
  final String itemType; // 'bird' | 'accessory' | 'service'
  final String? productId;
  final String name;
  final String? sku;
  final double rate;
  final int quantity;
  final double discount;
  final double taxPercent;
  final double total;

  InvoiceItem({
    this.id,
    required this.itemType,
    this.productId,
    required this.name,
    this.sku,
    required this.rate,
    this.quantity = 1,
    this.discount = 0.0,
    this.taxPercent = 18.0,
    required this.total,
  });

  factory InvoiceItem.fromJson(Map<String, dynamic> json) {
    final qty = (json['quantity'] is num) ? (json['quantity'] as num).toInt() : 1;
    final r = (json['rate'] is num)
        ? (json['rate'] as num).toDouble()
        : ((json['price'] is num) ? (json['price'] as num).toDouble() : 0.0);
    final tot = (json['total'] is num) ? (json['total'] as num).toDouble() : (r * qty);

    return InvoiceItem(
      id: json['id']?.toString() ?? json['_id']?.toString(),
      itemType: json['itemType']?.toString() ?? 'accessory',
      productId: json['productId']?.toString() ?? json['itemId']?.toString(),
      name: json['name']?.toString() ?? 'Item',
      sku: json['sku']?.toString(),
      rate: r,
      quantity: qty,
      discount: (json['discount'] is num) ? (json['discount'] as num).toDouble() : 0.0,
      taxPercent: (json['taxPercent'] is num)
          ? (json['taxPercent'] as num).toDouble()
          : ((json['taxRate'] is num) ? (json['taxRate'] as num).toDouble() : 0.0),
      total: tot,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'itemType': itemType,
      'productId': productId,
      'name': name,
      'sku': sku,
      'rate': rate,
      'quantity': quantity,
      'discount': discount,
      'taxPercent': taxPercent,
      'total': total,
    };
  }
}

class Invoice {
  final String id;
  final String invoiceNumber;
  final Map<String, dynamic> customer;
  final List<InvoiceItem> items;
  final double subtotal;
  final double totalDiscount;
  final double taxAmount;
  final double grandTotal;
  final double paidAmount;
  final double balanceDue;
  final String paymentStatus; // 'paid' | 'partial' | 'unpaid' | 'pending' | 'void'
  final String paymentMethod;
  final String status; // 'issued' | 'cancelled' | 'paid'
  final String? paymentReference;
  final String? notes;
  final BirdBookingDetails? birdBooking;
  final DateTime createdAt;

  Invoice({
    required this.id,
    required this.invoiceNumber,
    required this.customer,
    required this.items,
    required this.subtotal,
    required this.totalDiscount,
    required this.taxAmount,
    required this.grandTotal,
    required this.paidAmount,
    required this.balanceDue,
    required this.paymentStatus,
    required this.paymentMethod,
    this.status = 'issued',
    this.paymentReference,
    this.notes,
    this.birdBooking,
    required this.createdAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final raw = json['createdAt'];
      dt = raw != null ? DateTime.parse(raw.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    final rawItems = json['items'] as List? ?? [];
    final itemsList = rawItems.map((e) => InvoiceItem.fromJson(Map<String, dynamic>.from(e))).toList();

    final tot = (json['grandTotal'] is num && (json['grandTotal'] as num) > 0)
        ? (json['grandTotal'] as num).toDouble()
        : ((json['totalAmount'] is num)
            ? (json['totalAmount'] as num).toDouble()
            : ((json['subtotal'] is num) ? (json['subtotal'] as num).toDouble() : 0.0));

    final sub = (json['subtotal'] is num)
        ? (json['subtotal'] as num).toDouble()
        : tot;

    final disc = (json['totalDiscount'] is num)
        ? (json['totalDiscount'] as num).toDouble()
        : ((json['discount'] is num) ? (json['discount'] as num).toDouble() : 0.0);

    final paid = (json['paidAmount'] is num)
        ? (json['paidAmount'] as num).toDouble()
        : (json['paymentStatus']?.toString().toLowerCase() == 'paid' ? tot : 0.0);

    final bal = (json['balanceDue'] is num)
        ? (json['balanceDue'] as num).toDouble()
        : (tot - paid).clamp(0.0, double.infinity);

    BirdBookingDetails? booking;
    if (json['birdBooking'] is Map) {
      booking = BirdBookingDetails.fromJson(Map<String, dynamic>.from(json['birdBooking']));
    } else if (json['bookingDetails'] is Map) {
      booking = BirdBookingDetails.fromJson(Map<String, dynamic>.from(json['bookingDetails']));
    }

    return Invoice(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      invoiceNumber: json['invoiceNumber']?.toString() ?? '',
      customer: json['customer'] is Map ? Map<String, dynamic>.from(json['customer']) : {},
      items: itemsList,
      subtotal: sub,
      totalDiscount: disc,
      taxAmount: (json['taxAmount'] is num) ? (json['taxAmount'] as num).toDouble() : 0.0,
      grandTotal: tot,
      paidAmount: paid,
      balanceDue: bal,
      paymentStatus: json['paymentStatus']?.toString().toLowerCase() ?? 'unpaid',
      paymentMethod: json['paymentMethod']?.toString() ?? 'UPI',
      status: json['status']?.toString().toLowerCase() ?? 'issued',
      paymentReference: json['paymentReference']?.toString(),
      notes: json['notes']?.toString(),
      birdBooking: booking,
      createdAt: dt,
    );
  }
}
