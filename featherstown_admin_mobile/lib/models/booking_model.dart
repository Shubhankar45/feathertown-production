class BirdBookingDetails {
  final String? ringNumber;
  final String? dnaSex;
  final String? weaningStage;
  final String? handoverDate;
  final bool healthCertified;
  final String? specialInstructions;

  BirdBookingDetails({
    this.ringNumber,
    this.dnaSex,
    this.weaningStage,
    this.handoverDate,
    this.healthCertified = true,
    this.specialInstructions,
  });

  factory BirdBookingDetails.fromJson(Map<String, dynamic> json) {
    return BirdBookingDetails(
      ringNumber: json['ringNumber']?.toString(),
      dnaSex: json['dnaSex']?.toString() ?? 'Pending',
      weaningStage: json['weaningStage']?.toString() ?? 'Fully Weaned & Flight Ready',
      handoverDate: json['handoverDate']?.toString(),
      healthCertified: json['healthCertified'] == true,
      specialInstructions: json['specialInstructions']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ringNumber': ringNumber,
      'dnaSex': dnaSex,
      'weaningStage': weaningStage,
      'handoverDate': handoverDate,
      'healthCertified': healthCertified,
      'specialInstructions': specialInstructions,
    };
  }
}

class BirdBookingItem {
  final String invoiceId;
  final String invoiceNumber;
  final String? birdId;
  final String birdName;
  final String? birdImage;
  final String status; // 'reserved' | 'health_certified' | 'ready_for_handover' | 'completed' | 'cancelled'
  final Map<String, dynamic>? customer;
  final BirdBookingDetails? birdBooking;
  final double amount;
  final double balanceDue;
  final DateTime createdAt;

  String get id => invoiceId;

  BirdBookingItem({
    required this.invoiceId,
    required this.invoiceNumber,
    this.birdId,
    required this.birdName,
    this.birdImage,
    required this.status,
    this.customer,
    this.birdBooking,
    required this.amount,
    required this.balanceDue,
    required this.createdAt,
  });

  factory BirdBookingItem.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final raw = json['createdAt'];
      dt = raw != null ? DateTime.parse(raw.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    return BirdBookingItem(
      invoiceId: json['invoiceId']?.toString() ?? json['_id']?.toString() ?? json['id']?.toString() ?? '',
      invoiceNumber: json['invoiceNumber']?.toString() ?? '',
      birdId: json['birdId']?.toString(),
      birdName: json['birdName']?.toString() ?? 'Companion Bird',
      birdImage: json['birdImage']?.toString(),
      status: json['status']?.toString() ?? 'reserved',
      customer: json['customer'] is Map ? Map<String, dynamic>.from(json['customer']) : null,
      birdBooking: json['birdBooking'] is Map ? BirdBookingDetails.fromJson(Map<String, dynamic>.from(json['birdBooking'])) : null,
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : 0.0,
      balanceDue: (json['balanceDue'] is num) ? (json['balanceDue'] as num).toDouble() : 0.0,
      createdAt: dt,
    );
  }
}
