class OrderItem {
  final String name;
  final int quantity;
  final double price;
  final String? image;

  OrderItem({required this.name, required this.quantity, required this.price, this.image});

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      name: json['name']?.toString() ?? 'Item',
      quantity: (json['quantity'] is num) ? (json['quantity'] as num).toInt() : 1,
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      image: json['image']?.toString(),
    );
  }
}

class StoreOrder {
  final String id;
  final String? orderNumber;
  final String? userEmail;
  final Map<String, dynamic>? shippingAddress;
  final List<OrderItem> items;
  final double amount;
  final String paymentMethod;
  final String paymentStatus;
  final String orderStatus; // 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  final Map<String, dynamic>? tracking;
  final DateTime createdAt;

  StoreOrder({
    required this.id,
    this.orderNumber,
    this.userEmail,
    this.shippingAddress,
    required this.items,
    required this.amount,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.orderStatus,
    this.tracking,
    required this.createdAt,
  });

  String get displayOrderNumber => orderNumber ?? (id.length > 8 ? id.substring(id.length - 8).toUpperCase() : id);
  String get trackingStatus => tracking?['currentStatus']?.toString() ?? tracking?['status']?.toString() ?? orderStatus;
  String? get courierCarrier => tracking?['courier']?.toString() ?? tracking?['carrier']?.toString();
  String? get trackingNumber => tracking?['trackingNumber']?.toString() ?? tracking?['awb']?.toString();
  String? get trackingUrl => tracking?['trackingUrl']?.toString();
  String? get estimatedDelivery => tracking?['estimatedDelivery']?.toString();

  factory StoreOrder.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final raw = json['createdAt'];
      dt = raw != null ? DateTime.parse(raw.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    final rawItems = (json['orderItems'] as List?) ?? (json['items'] as List?) ?? [];
    final itemsList = rawItems.map((e) => OrderItem.fromJson(Map<String, dynamic>.from(e))).toList();

    final customer = json['customer'] as Map? ?? json['shippingAddress'] as Map?;
    final addressMap = customer != null ? Map<String, dynamic>.from(customer) : null;
    final email = json['userEmail']?.toString() ?? customer?['email']?.toString();

    final amt = (json['amount'] is num)
        ? (json['amount'] as num).toDouble()
        : (json['totalAmount'] is num)
            ? (json['totalAmount'] as num).toDouble()
            : 0.0;

    final trackingData = json['tracking'] is Map ? Map<String, dynamic>.from(json['tracking'] as Map) : null;

    return StoreOrder(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? json['orderId']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString(),
      userEmail: email,
      shippingAddress: addressMap,
      items: itemsList,
      amount: amt,
      paymentMethod: json['paymentMethod']?.toString() ?? 'COD',
      paymentStatus: json['paymentStatus']?.toString() ?? 'pending',
      orderStatus: json['orderStatus']?.toString() ?? 'pending',
      tracking: trackingData,
      createdAt: dt,
    );
  }
}
