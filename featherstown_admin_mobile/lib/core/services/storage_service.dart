import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _keyToken = 'ft_admin_token';
  static const String _keyAdminUser = 'ft_admin_user_json';
  static const String _keyBaseUrl = 'ft_admin_base_url';
  static const String _keyBiometrics = 'ft_admin_biometrics_enabled';
  static const String _keyDarkMode = 'ft_admin_dark_mode';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // Token
  static Future<void> setToken(String token) async {
    await _prefs?.setString(_keyToken, token);
  }

  static String? getToken() {
    return _prefs?.getString(_keyToken);
  }

  static Future<void> clearToken() async {
    await _prefs?.remove(_keyToken);
  }

  // Admin User JSON
  static Future<void> setAdminUser(String userJson) async {
    await _prefs?.setString(_keyAdminUser, userJson);
  }

  static String? getAdminUser() {
    return _prefs?.getString(_keyAdminUser);
  }

  // Custom Base URL (Allows local dev / staging switching)
  static Future<void> setBaseUrl(String url) async {
    await _prefs?.setString(_keyBaseUrl, url);
  }

  static String? getBaseUrl() {
    return _prefs?.getString(_keyBaseUrl);
  }

  // Biometrics preference
  static Future<void> setBiometricsEnabled(bool enabled) async {
    await _prefs?.setBool(_keyBiometrics, enabled);
  }

  static bool isBiometricsEnabled() {
    return _prefs?.getBool(_keyBiometrics) ?? false;
  }

  // Dark Mode preference
  static Future<void> setDarkMode(bool enabled) async {
    await _prefs?.setBool(_keyDarkMode, enabled);
  }

  static bool isDarkMode() {
    return _prefs?.getBool(_keyDarkMode) ?? false;
  }

  // Clear Session
  static Future<void> clearSession() async {
    await _prefs?.remove(_keyToken);
    await _prefs?.remove(_keyAdminUser);
  }
}
