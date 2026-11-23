import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_endpoints.dart';
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final dynamic data;

  ApiException(this.message, {this.statusCode = 500, this.data});

  @override
  String toString() => message;
}

class ApiService {
  static String get baseUrl {
    final custom = StorageService.getBaseUrl();
    if (custom != null && custom.trim().isNotEmpty) {
      return custom.trim().replaceAll(RegExp(r'/+$'), '');
    }
    return ApiEndpoints.defaultBaseUrl;
  }

  static Map<String, String> _buildHeaders({Map<String, String>? extra}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final token = StorageService.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (extra != null) {
      headers.addAll(extra);
    }
    return headers;
  }

  static Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$baseUrl$cleanPath';
    if (queryParams != null && queryParams.isNotEmpty) {
      final filtered = <String, String>{};
      queryParams.forEach((k, v) {
        if (v != null) filtered[k] = v.toString();
      });
      return Uri.parse(fullUrl).replace(queryParameters: filtered);
    }
    return Uri.parse(fullUrl);
  }

  static dynamic _handleResponse(http.Response res) {
    dynamic jsonBody;
    try {
      jsonBody = jsonDecode(res.body);
    } catch (_) {
      jsonBody = res.body;
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonBody;
    }

    String message = 'Request failed (${res.statusCode})';
    if (jsonBody is Map) {
      final rawMsg = jsonBody['msg'] ?? jsonBody['detail'] ?? jsonBody['message'];
      if (rawMsg is List) {
        message = rawMsg.join(', ');
      } else if (rawMsg != null) {
        message = rawMsg.toString();
      }
    }
    throw ApiException(message, statusCode: res.statusCode, data: jsonBody);
  }

  // GET
  static Future<dynamic> get(String path, {Map<String, dynamic>? queryParams}) async {
    try {
      final uri = _buildUri(path, queryParams);
      final res = await http.get(uri, headers: _buildHeaders()).timeout(const Duration(seconds: 25));
      return _handleResponse(res);
    } on SocketException catch (e) {
      throw ApiException('Cannot reach FeatherTown backend (${e.message}). Please check internet or server status.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please check your internet connection.');
    } on http.ClientException catch (e) {
      throw ApiException('Network connection error: ${e.message}');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error: $e');
    }
  }

  // POST
  static Future<dynamic> post(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final res = await http
          .post(
            uri,
            headers: _buildHeaders(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 25));
      return _handleResponse(res);
    } on SocketException catch (e) {
      throw ApiException('Cannot reach FeatherTown backend (${e.message}). Please check internet or server status.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please check your internet connection.');
    } on http.ClientException catch (e) {
      throw ApiException('Network connection error: ${e.message}');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error: $e');
    }
  }

  // PUT
  static Future<dynamic> put(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final res = await http
          .put(
            uri,
            headers: _buildHeaders(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 25));
      return _handleResponse(res);
    } on SocketException catch (e) {
      throw ApiException('Cannot reach FeatherTown backend (${e.message}). Please check internet or server status.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please check your internet connection.');
    } on http.ClientException catch (e) {
      throw ApiException('Network connection error: ${e.message}');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error: $e');
    }
  }

  // PATCH
  static Future<dynamic> patch(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final res = await http
          .patch(
            uri,
            headers: _buildHeaders(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(const Duration(seconds: 25));
      return _handleResponse(res);
    } on SocketException catch (e) {
      throw ApiException('Cannot reach FeatherTown backend (${e.message}). Please check internet or server status.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please check your internet connection.');
    } on http.ClientException catch (e) {
      throw ApiException('Network connection error: ${e.message}');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error: $e');
    }
  }

  // DELETE
  static Future<dynamic> delete(String path) async {
    try {
      final uri = _buildUri(path);
      final res = await http.delete(uri, headers: _buildHeaders()).timeout(const Duration(seconds: 25));
      return _handleResponse(res);
    } on SocketException catch (e) {
      throw ApiException('Cannot reach FeatherTown backend (${e.message}). Please check internet or server status.');
    } on TimeoutException {
      throw ApiException('Request timed out. Please check your internet connection.');
    } on http.ClientException catch (e) {
      throw ApiException('Network connection error: ${e.message}');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error: $e');
    }
  }

  // Multipart File Upload (Image)
  static Future<String> uploadImage(File file) async {
    try {
      final uri = _buildUri(ApiEndpoints.upload);
      final req = http.MultipartRequest('POST', uri);
      final token = StorageService.getToken();
      if (token != null && token.isNotEmpty) {
        req.headers['Authorization'] = 'Bearer $token';
      }
      req.files.add(await http.MultipartFile.fromPath('file', file.path));

      final streamedRes = await req.send().timeout(const Duration(seconds: 40));
      final res = await http.Response.fromStream(streamedRes);
      final json = _handleResponse(res);
      if (json is Map && json['url'] != null) {
        return json['url'].toString();
      }
      throw ApiException('Upload response missing image URL');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to upload image: $e');
    }
  }
}
