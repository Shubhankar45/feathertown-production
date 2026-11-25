class BirdModel {
  final String id;
  final String name;
  final String species;
  final String category;
  final double price;
  final String status; // 'available' | 'reserved' | 'sold'
  final String? image;
  final String? description;
  final String? ringNumber;
  final String? dnaSex;

  BirdModel({
    required this.id,
    required this.name,
    required this.species,
    required this.category,
    required this.price,
    required this.status,
    this.image,
    this.description,
    this.ringNumber,
    this.dnaSex,
  });

  factory BirdModel.fromJson(Map<String, dynamic> json) {
    return BirdModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      species: json['species']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Birds',
      price: () {
        final p = json['price'];
        if (p is num) return p.toDouble();
        if (p is String) {
          final clean = p.replaceAll(RegExp(r'[^0-9.]'), ' ');
          final parts = clean.trim().split(RegExp(r'\s+'));
          if (parts.isNotEmpty) {
            final parsed = double.tryParse(parts.first);
            if (parsed != null && parsed > 0) return parsed;
          }
        }
        if (json['minPrice'] is num) return (json['minPrice'] as num).toDouble();
        return 0.0;
      }(),
      status: json['status']?.toString() ?? 'available',
      image: json['image']?.toString(),
      description: json['description']?.toString(),
      ringNumber: json['ringNumber']?.toString(),
      dnaSex: json['dnaSex']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'species': species,
      'category': category,
      'price': price,
      'status': status,
      'image': image,
      'description': description,
      'ringNumber': ringNumber,
      'dnaSex': dnaSex,
    };
  }
}
