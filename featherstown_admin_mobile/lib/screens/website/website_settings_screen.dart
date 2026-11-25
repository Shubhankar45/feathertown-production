import 'package:flutter/material.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/api_service.dart';

class WebsiteSettingsScreen extends StatefulWidget {
  const WebsiteSettingsScreen({super.key});

  @override
  State<WebsiteSettingsScreen> createState() => _WebsiteSettingsScreenState();
}

class _WebsiteSettingsScreenState extends State<WebsiteSettingsScreen> {
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, dynamic> _settings = {};

  final _announcementCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _whatsappCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _heroTitleCtrl = TextEditingController();
  final _heroSubCtrl = TextEditingController();
  final _shippingThresholdCtrl = TextEditingController();

  bool _announcementEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  @override
  void dispose() {
    _announcementCtrl.dispose();
    _phoneCtrl.dispose();
    _whatsappCtrl.dispose();
    _emailCtrl.dispose();
    _addressCtrl.dispose();
    _heroTitleCtrl.dispose();
    _heroSubCtrl.dispose();
    _shippingThresholdCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.get(ApiEndpoints.settings);
      if (res is Map) {
        _settings = Map<String, dynamic>.from(res);
        final ann = _settings['announcement'] as Map?;
        _announcementCtrl.text = (_settings['announcementText'] ?? ann?['text'] ?? '').toString();
        _announcementEnabled = _settings['announcementActive'] == true || ann?['enabled'] == true;

        final contact = _settings['contact'] as Map?;
        _phoneCtrl.text = (_settings['phone'] ?? contact?['phone'] ?? '').toString();
        _whatsappCtrl.text = (_settings['whatsapp'] ?? contact?['whatsapp'] ?? '').toString();
        _emailCtrl.text = (_settings['email'] ?? contact?['email'] ?? '').toString();
        _addressCtrl.text = (_settings['address'] ?? contact?['address'] ?? '').toString();

        final hero = _settings['hero'] as Map?;
        _heroTitleCtrl.text = (_settings['heroTitle'] ?? hero?['title'] ?? '').toString();
        _heroSubCtrl.text = (_settings['heroSubtitle'] ?? hero?['subtitle'] ?? '').toString();

        final shipping = _settings['shipping'] as Map?;
        _shippingThresholdCtrl.text = (_settings['freeShippingThreshold'] ?? shipping?['freeShippingThreshold'] ?? 999).toString();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error loading settings: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);
    try {
      final threshold = double.tryParse(_shippingThresholdCtrl.text.trim()) ?? 999.0;
      final payload = {
        ..._settings,
        'announcementText': _announcementCtrl.text.trim(),
        'announcementActive': _announcementEnabled,
        'phone': _phoneCtrl.text.trim(),
        'whatsapp': _whatsappCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'address': _addressCtrl.text.trim(),
        'heroTitle': _heroTitleCtrl.text.trim(),
        'heroSubtitle': _heroSubCtrl.text.trim(),
        'freeShippingThreshold': threshold,
        'announcement': {
          'text': _announcementCtrl.text.trim(),
          'enabled': _announcementEnabled,
        },
        'contact': {
          'phone': _phoneCtrl.text.trim(),
          'whatsapp': _whatsappCtrl.text.trim(),
          'email': _emailCtrl.text.trim(),
          'address': _addressCtrl.text.trim(),
        },
        'hero': {
          'title': _heroTitleCtrl.text.trim(),
          'subtitle': _heroSubCtrl.text.trim(),
        },
        'shipping': {
          'freeShippingThreshold': threshold,
        },
      };

      await ApiService.put(ApiEndpoints.settings, body: payload);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Website modifications saved successfully!'), backgroundColor: AppColors.forestGreen),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to save settings: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        title: const Text('Website CMS & Settings', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Reload',
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadSettings,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.forestGreen))
          : ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              children: [
                // Announcement Banner Section
                _buildSectionCard(
                  title: 'Announcement Ticker Bar',
                  icon: Icons.campaign_rounded,
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Show Announcement on Website', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      value: _announcementEnabled,
                      activeThumbColor: AppColors.forestGreen,
                      onChanged: (val) => setState(() => _announcementEnabled = val),
                    ),
                    TextField(
                      controller: _announcementCtrl,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Ticker Message',
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Store Contacts & Helplines
                _buildSectionCard(
                  title: 'Store Helplines & WhatsApp',
                  icon: Icons.phone_in_talk_rounded,
                  children: [
                    TextField(
                      controller: _whatsappCtrl,
                      decoration: InputDecoration(
                        labelText: 'WhatsApp Helpline (with country code)',
                        prefixIcon: const Icon(Icons.chat_bubble_outline_rounded, color: AppColors.forestGreen),
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _phoneCtrl,
                      decoration: InputDecoration(
                        labelText: 'Calling Support Number',
                        prefixIcon: const Icon(Icons.call_rounded),
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _emailCtrl,
                      decoration: InputDecoration(
                        labelText: 'Support Email Address',
                        prefixIcon: const Icon(Icons.email_outlined),
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _addressCtrl,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Aviary Nursery Physical Address',
                        prefixIcon: const Icon(Icons.location_on_outlined),
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Hero & Showcase Headlines
                _buildSectionCard(
                  title: 'Homepage Hero Showcase',
                  icon: Icons.auto_awesome_rounded,
                  children: [
                    TextField(
                      controller: _heroTitleCtrl,
                      decoration: InputDecoration(
                        labelText: 'Main Hero Headline',
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _heroSubCtrl,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Hero Subtitle / Avian Ethos',
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Shipping Policy
                _buildSectionCard(
                  title: 'Shipping & Delivery Rules',
                  icon: Icons.local_shipping_outlined,
                  children: [
                    TextField(
                      controller: _shippingThresholdCtrl,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Free Shipping Threshold (₹)',
                        helperText: 'Orders above this amount get free delivery nationwide',
                        filled: true,
                        fillColor: AppColors.canvasLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                ElevatedButton.icon(
                  onPressed: _isSaving ? null : _saveSettings,
                  icon: _isSaving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.save_rounded),
                  label: Text(_isSaving ? 'Saving Changes...' : 'Save Website Modifications', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.heroDark,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
    );
  }

  Widget _buildSectionCard({required String title, required IconData icon, required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.pastelMint,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: AppColors.catCockatiel, size: 20),
              ),
              const SizedBox(width: 12),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}
