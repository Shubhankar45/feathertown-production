class Customer {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? address;
  final String? city;
  final String? state;
  final String? pincode;
  final String? notes;
  final int totalOrders;
  final double totalSpent;
  final DateTime createdAt;

  Customer({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.address,
    this.city,
    this.state,
    this.pincode,
    this.notes,
    this.totalOrders = 0,
    this.totalSpent = 0.0,
    required this.createdAt,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final raw = json['createdAt'];
      dt = raw != null ? DateTime.parse(raw.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    return Customer(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Customer',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString(),
      address: json['address']?.toString(),
      city: json['city']?.toString() ?? 'Bangalore',
      state: json['state']?.toString() ?? 'Karnataka',
      pincode: json['pincode']?.toString(),
      notes: json['notes']?.toString(),
      totalOrders: (json['totalOrders'] is num) ? (json['totalOrders'] as num).toInt() : 0,
      totalSpent: (json['totalSpent'] is num) ? (json['totalSpent'] as num).toDouble() : 0.0,
      createdAt: dt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'email': email,
      'address': address,
      'city': city,
      'state': state,
      'pincode': pincode,
      'notes': notes,
    };
  }
}
