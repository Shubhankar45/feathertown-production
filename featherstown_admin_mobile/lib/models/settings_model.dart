class StoreSettingsModel {
  final String heroTitle;
  final String heroSubtitle;
  final String whatsapp;
  final String email;
  final String phone;
  final String? bannerImage;
  final String? promoBanner;

  StoreSettingsModel({
    required this.heroTitle,
    required this.heroSubtitle,
    required this.whatsapp,
    required this.email,
    required this.phone,
    this.bannerImage,
    this.promoBanner,
  });

  factory StoreSettingsModel.fromJson(Map<String, dynamic> json) {
    return StoreSettingsModel(
      heroTitle: json['heroTitle']?.toString() ?? '',
      heroSubtitle: json['heroSubtitle']?.toString() ?? '',
      whatsapp: json['whatsapp']?.toString() ?? '919556747518',
      email: json['email']?.toString() ?? 'care@feathertown.online',
      phone: json['phone']?.toString() ?? '',
      bannerImage: json['bannerImage']?.toString(),
      promoBanner: json['promoBanner']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'heroTitle': heroTitle,
      'heroSubtitle': heroSubtitle,
      'whatsapp': whatsapp,
      'email': email,
      'phone': phone,
      'bannerImage': bannerImage,
      'promoBanner': promoBanner,
    };
  }
}
