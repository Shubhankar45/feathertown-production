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
  final String? userEmail;
  final Map<String, dynamic>? shippingAddress;
  final List<OrderItem> items;
  final double amount;
  final String paymentMethod;
  final String paymentStatus;
  final String orderStatus; // 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  final DateTime createdAt;

  StoreOrder({
    required this.id,
    this.userEmail,
    this.shippingAddress,
    required this.items,
    required this.amount,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.orderStatus,
    required this.createdAt,
  });

  factory StoreOrder.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final raw = json['createdAt'];
      dt = raw != null ? DateTime.parse(raw.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    final rawItems = json['items'] as List? ?? [];
    final itemsList = rawItems.map((e) => OrderItem.fromJson(Map<String, dynamic>.from(e))).toList();

    return StoreOrder(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userEmail: json['userEmail']?.toString(),
      shippingAddress: json['shippingAddress'] is Map ? Map<String, dynamic>.from(json['shippingAddress']) : null,
      items: itemsList,
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      paymentMethod: json['paymentMethod']?.toString() ?? 'COD',
      paymentStatus: json['paymentStatus']?.toString() ?? 'pending',
      orderStatus: json['orderStatus']?.toString() ?? 'pending',
      createdAt: dt,
    );
  }
}
