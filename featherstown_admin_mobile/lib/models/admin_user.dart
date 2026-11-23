class AdminUser {
  final String username;
  final String role;
  final String? email;
  final String? token;

  AdminUser({
    required this.username,
    required this.role,
    this.email,
    this.token,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json, {String? token}) {
    return AdminUser(
      username: json['username'] ?? json['user'] ?? 'admin',
      role: json['role'] ?? 'admin',
      email: json['email'],
      token: token ?? json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'role': role,
      'email': email,
      'token': token,
    };
  }
}
