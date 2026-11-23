class AccessoryModel {
  final String id;
  final String name;
  final String category;
  final double price;
  final int stock;
  final String? image;
  final String? description;
  final String? sku;

  AccessoryModel({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.stock,
    this.image,
    this.description,
    this.sku,
  });

  factory AccessoryModel.fromJson(Map<String, dynamic> json) {
    return AccessoryModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Accessories',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      stock: (json['stock'] is num) ? (json['stock'] as num).toInt() : 0,
      image: json['image']?.toString(),
      description: json['description']?.toString(),
      sku: json['sku']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'category': category,
      'price': price,
      'stock': stock,
      'image': image,
      'description': description,
      'sku': sku,
    };
  }
}
