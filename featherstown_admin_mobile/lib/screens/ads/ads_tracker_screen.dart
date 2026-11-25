import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/ads_provider.dart';
import '../../providers/ai_provider.dart';

class AdsTrackerScreen extends StatefulWidget {
  const AdsTrackerScreen({super.key});

  @override
  State<AdsTrackerScreen> createState() => _AdsTrackerScreenState();
}

class _AdsTrackerScreenState extends State<AdsTrackerScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;
  String _platformFilter = 'all';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdsProvider>().loadAll();
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  void _showAddCampaignModal() {
    final nameCtrl = TextEditingController();
    final spendCtrl = TextEditingController();
    final budgetCtrl = TextEditingController();
    final impCtrl = TextEditingController();
    final clicksCtrl = TextEditingController();
    final leadsCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String selectedPlatform = 'meta';
    String selectedObjective = 'leads';
    bool autoRecord = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
          ),
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Record Ad Expense / Campaign', style: Theme.of(ctx).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(
                    labelText: 'Campaign Name *',
                    hintText: 'e.g. Instagram Reels • Conure Handover',
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: selectedPlatform,
                        decoration: InputDecoration(
                          labelText: 'Platform',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'meta', child: Text('Meta / Facebook')),
                          DropdownMenuItem(value: 'instagram', child: Text('Instagram')),
                          DropdownMenuItem(value: 'google', child: Text('Google Ads')),
                          DropdownMenuItem(value: 'youtube', child: Text('YouTube')),
                          DropdownMenuItem(value: 'other', child: Text('Other')),
                        ],
                        onChanged: (val) => setModalState(() => selectedPlatform = val ?? 'meta'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: selectedObjective,
                        decoration: InputDecoration(
                          labelText: 'Objective',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'leads', child: Text('Leads / Adoptions')),
                          DropdownMenuItem(value: 'sales', child: Text('Store Sales')),
                          DropdownMenuItem(value: 'traffic', child: Text('Website Traffic')),
                          DropdownMenuItem(value: 'brand_awareness', child: Text('Awareness')),
                        ],
                        onChanged: (val) => setModalState(() => selectedObjective = val ?? 'leads'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: spendCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Spent (₹) *',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: budgetCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Budget (₹)',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: impCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Impressions',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: clicksCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Clicks',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: leadsCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Leads',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Record in Financial Ledger as Expense', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  value: autoRecord,
                  activeThumbColor: AppColors.forestGreen,
                  onChanged: (val) => setModalState(() => autoRecord = val),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    final name = nameCtrl.text.trim();
                    if (name.isEmpty) {
                      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please enter campaign name')));
                      return;
                    }
                    final spend = double.tryParse(spendCtrl.text.trim()) ?? 0.0;
                    final budget = double.tryParse(budgetCtrl.text.trim()) ?? spend;

                    final success = await context.read<AdsProvider>().createCampaign({
                      'name': name,
                      'platform': selectedPlatform,
                      'objective': selectedObjective,
                      'spend': spend,
                      'budget': budget,
                      'impressions': int.tryParse(impCtrl.text.trim()) ?? 0,
                      'clicks': int.tryParse(clicksCtrl.text.trim()) ?? 0,
                      'leads': int.tryParse(leadsCtrl.text.trim()) ?? 0,
                      'autoRecordExpense': autoRecord,
                      'notes': notesCtrl.text.trim(),
                    });

                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                    }
                    if (mounted && success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Ad campaign recorded & tracked!'), backgroundColor: AppColors.forestGreen),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.heroDark,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  child: const Text('Save Campaign Record', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<AdsProvider>();
    final analytics = prov.analytics;
    final creds = prov.credentials;

    final filtered = prov.campaigns.filterByPlatform(_platformFilter);

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        title: const Text('Social Media & Ads', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Sync Insights',
            icon: const Icon(Icons.sync_rounded),
            onPressed: () async {
              final ok = await prov.syncInsights();
              if (context.mounted && ok) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Ad metrics synced!'), backgroundColor: AppColors.forestGreen),
                );
              }
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppColors.heroDark,
          labelColor: AppColors.heroDark,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700),
          tabs: const [
            Tab(text: 'Campaigns'),
            Tab(text: 'AI Copywriter'),
            Tab(text: 'Credentials'),
          ],
        ),
      ),
      body: prov.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.forestGreen))
          : TabBarView(
              controller: _tabCtrl,
              children: [
                // ── TAB 1: CAMPAIGNS ──
                RefreshIndicator(
                  onRefresh: () => prov.loadAll(),
                  color: AppColors.forestGreen,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    children: [
                      // Analytics KPI Banner
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.heroDark, Color(0xFF1B3B22)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(22),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.heroDark.withValues(alpha: 0.2),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('TOTAL AD SPEND', style: TextStyle(color: Color(0xFF9EBF9E), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'ROAS ${(analytics?['overallRoas'] ?? 4.2)}x',
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              '₹${((analytics?['totalSpend'] ?? 0) as num).toInt().toString().replaceAllMapped(RegExp(r'(\d+?)(?=(\d\d)+(\d)(?!\d))'), (m) => '${m[1]},')}',
                              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white),
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                _kpiTile('Clicks', '${analytics?['totalClicks'] ?? 0}', 'CTR ${analytics?['avgCtr'] ?? 0}%'),
                                const SizedBox(width: 8),
                                _kpiTile('Leads', '${analytics?['totalLeads'] ?? 0}', 'Avg CPL ₹${analytics?['avgCpl'] ?? 0}'),
                                const SizedBox(width: 8),
                                _kpiTile('Active', '${analytics?['activeCount'] ?? 0}', 'Campaigns'),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Platform Filter Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _filterChip('all', 'All Platforms'),
                            _filterChip('meta', 'Meta (FB)'),
                            _filterChip('instagram', 'Instagram'),
                            _filterChip('google', 'Google Ads'),
                            _filterChip('youtube', 'YouTube'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Campaign Cards
                      if (filtered.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 40),
                          child: Center(child: Text('No ad campaigns found in this filter', style: TextStyle(color: AppColors.textSecondary))),
                        )
                      else
                        ...filtered.map((c) => _buildCampaignCard(context, c)),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),

                // ── TAB 2: AI AD COPYWRITER ──
                const _AiAdCopywriterTab(),

                // ── TAB 3: DIRECT CREDENTIALS ──
                ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  children: [
                    _buildMetaCard(context, creds?['meta']),
                    const SizedBox(height: 16),
                    _buildGoogleCard(context, creds?['google']),
                    const SizedBox(height: 16),
                    _buildInstagramCard(context, creds?['instagram']),
                    const SizedBox(height: 80),
                  ],
                ),
              ],
            ),
      floatingActionButton: _tabCtrl.index == 0
          ? FloatingActionButton.extended(
              onPressed: _showAddCampaignModal,
              backgroundColor: AppColors.heroDark,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Record Ad Spend', style: TextStyle(fontWeight: FontWeight.w700)),
            )
          : null,
    );
  }

  Widget _kpiTile(String label, String value, String sub) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFFBACEC0), fontSize: 10, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
            Text(sub, style: const TextStyle(color: Color(0xFF9EBF9E), fontSize: 9)),
          ],
        ),
      ),
    );
  }

  Widget _filterChip(String id, String label) {
    final active = _platformFilter == id;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: active,
        selectedColor: AppColors.heroDark,
        labelStyle: TextStyle(
          color: active ? Colors.white : AppColors.textPrimary,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
        onSelected: (_) => setState(() => _platformFilter = id),
      ),
    );
  }

  Widget _buildCampaignCard(BuildContext context, dynamic c) {
    final name = c['name'] ?? 'Untitled Campaign';
    final platform = (c['platform'] ?? 'meta').toString().toLowerCase();
    final spend = (c['spend'] ?? 0) as num;
    final budget = (c['budget'] ?? spend) as num;
    final clicks = c['clicks'] ?? 0;
    final leads = c['leads'] ?? 0;
    final status = c['status'] ?? 'active';
    final pct = budget > 0 ? (spend / budget).clamp(0.0, 1.0) : 1.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.cardBorderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: platform == 'meta' ? const Color(0xFFE7F3FF) :
                         platform == 'instagram' ? const Color(0xFFFCE8F3) :
                         platform == 'google' ? const Color(0xFFE6F4EA) : const Color(0xFFFCE8E6),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  platform.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: platform == 'meta' ? const Color(0xFF1877F2) :
                           platform == 'instagram' ? const Color(0xFFE1306C) :
                           platform == 'google' ? const Color(0xFF0F9D58) : const Color(0xFFEA4335),
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: status == 'active' ? AppColors.pastelMint : AppColors.canvasLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: status == 'active' ? AppColors.catCockatiel : AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.textPrimary)),
          const SizedBox(height: 8),

          // Progress bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Budget Utilized', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              Text('₹$spend / ₹$budget', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              backgroundColor: AppColors.canvasLight,
              color: AppColors.primary,
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),

          // Stats footer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Clicks: $clicks', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Text('Leads: $leads', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.forestGreen)),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.textSecondary),
                onPressed: () async {
                  final id = c['_id'] ?? c['id'];
                  if (id != null) {
                    await context.read<AdsProvider>().deleteCampaign(id);
                  }
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Meta Direct Connect Card ──
  Widget _buildMetaCard(BuildContext context, Map<String, dynamic>? meta) {
    final actIdCtrl = TextEditingController(text: meta?['adAccountId'] ?? '');
    final tokenCtrl = TextEditingController(text: meta?['maskedToken'] ?? '');
    final pixelCtrl = TextEditingController(text: meta?['pixelId'] ?? '');
    final isConnected = meta?['status'] == 'connected';

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(color: const Color(0xFF1877F2), borderRadius: BorderRadius.circular(10)),
                    child: const Center(child: Text('f', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20))),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Meta Ads', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      Text('Facebook & Instagram Ads', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isConnected ? AppColors.pastelMint : AppColors.canvasLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(isConnected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded, size: 12, color: isConnected ? AppColors.catCockatiel : AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(isConnected ? 'Connected' : 'Not Connected', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isConnected ? AppColors.catCockatiel : AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextField(
            controller: actIdCtrl,
            decoration: InputDecoration(
              labelText: 'Ad Account ID (act_XXXXXXXX)',
              filled: true,
              fillColor: AppColors.canvasLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: tokenCtrl,
            obscureText: true,
            decoration: InputDecoration(
              labelText: 'Graph API User Access Token',
              filled: true,
              fillColor: AppColors.canvasLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: pixelCtrl,
            decoration: InputDecoration(
              labelText: 'Meta Pixel ID',
              filled: true,
              fillColor: AppColors.canvasLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    await context.read<AdsProvider>().saveCredentials('meta', {
                      'adAccountId': actIdCtrl.text.trim(),
                      'accessToken': tokenCtrl.text.trim(),
                      'pixelId': pixelCtrl.text.trim(),
                    });
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Meta credentials saved!')));
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.heroDark, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: const Text('Save Credentials'),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () async {
                  final res = await context.read<AdsProvider>().testConnection('meta');
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res?['msg'] ?? 'Tested Meta Connection')));
                  }
                },
                style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Test'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Google Ads Direct Connect Card ──
  Widget _buildGoogleCard(BuildContext context, Map<String, dynamic>? google) {
    final custIdCtrl = TextEditingController(text: google?['customerId'] ?? '');
    final devTokenCtrl = TextEditingController(text: google?['maskedToken'] ?? '');
    final isConnected = google?['status'] == 'connected';

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(color: const Color(0xFF0F9D58), borderRadius: BorderRadius.circular(10)),
                    child: const Center(child: Text('G', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20))),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Google Ads', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                      Text('Search, YouTube & Display', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isConnected ? AppColors.pastelMint : AppColors.canvasLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(isConnected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded, size: 12, color: isConnected ? AppColors.catCockatiel : AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(isConnected ? 'Connected' : 'Not Connected', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isConnected ? AppColors.catCockatiel : AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextField(
            controller: custIdCtrl,
            decoration: InputDecoration(
              labelText: 'Google Ads Customer ID (123-456-7890)',
              filled: true,
              fillColor: AppColors.canvasLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: devTokenCtrl,
            obscureText: true,
            decoration: InputDecoration(
              labelText: 'Developer Token',
              filled: true,
              fillColor: AppColors.canvasLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () async {
                    await context.read<AdsProvider>().saveCredentials('google', {
                      'customerId': custIdCtrl.text.trim(),
                      'developerToken': devTokenCtrl.text.trim(),
                    });
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Google Ads credentials saved!')));
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.heroDark, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: const Text('Save Credentials'),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () async {
                  final res = await context.read<AdsProvider>().testConnection('google');
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res?['msg'] ?? 'Tested Google Connection')));
                  }
                },
                style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Test'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Instagram Direct Connect Card ──
  Widget _buildInstagramCard(BuildContext context, Map<String, dynamic>? ig) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorderLight),
      ),
      child: const Row(
        children: [
          Icon(Icons.camera_alt_outlined, color: Color(0xFFE1306C), size: 28),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Instagram Business Graph', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                Text('Linked directly through Meta Business Manager', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

extension PlatformFilterExt on List<dynamic> {
  List<dynamic> filterByPlatform(String platform) {
    if (platform == 'all') return this;
    return where((c) => (c['platform'] ?? '').toString().toLowerCase() == platform.toLowerCase()).toList();
  }
}

// ── AI AD COPYWRITER TAB ──
class _AiAdCopywriterTab extends StatefulWidget {
  const _AiAdCopywriterTab();

  @override
  State<_AiAdCopywriterTab> createState() => _AiAdCopywriterTabState();
}

class _AiAdCopywriterTabState extends State<_AiAdCopywriterTab> {
  final _itemCtrl = TextEditingController(text: 'Hand-Tamed Sun Conure');
  final _offerCtrl = TextEditingController(text: 'Free starter feed kit & care guide');
  String _platform = 'instagram'; // instagram | facebook | whatsapp | google
  bool _loading = false;
  Map<String, dynamic>? _generated;

  @override
  void dispose() {
    _itemCtrl.dispose();
    _offerCtrl.dispose();
    super.dispose();
  }

  Future<void> _generate() async {
    final item = _itemCtrl.text.trim();
    if (item.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter an item or bird name')));
      return;
    }

    setState(() {
      _loading = true;
      _generated = null;
    });

    final ai = context.read<AiProvider>();
    final res = await ai.generateAdCopy(
      platform: _platform,
      itemName: item,
      category: 'Birds & Accessories',
      offer: _offerCtrl.text.trim(),
    );

    if (!mounted) return;
    setState(() {
      _loading = false;
      _generated = res;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.pastelMint, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.auto_awesome_rounded, color: AppColors.forestGreen, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('AI Ad Copywriter', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                        Text('Generate high-converting captions & hashtags in seconds', style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Platform Selector
              const Text('Target Platform', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _platformPill('instagram', 'Instagram', Icons.camera_alt_outlined),
                  const SizedBox(width: 8),
                  _platformPill('facebook', 'Facebook', Icons.facebook),
                  const SizedBox(width: 8),
                  _platformPill('whatsapp', 'WhatsApp', Icons.chat_bubble_outline),
                ],
              ),
              const SizedBox(height: 16),

              // Item Name Input
              const Text('Bird / Product Name', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              const SizedBox(height: 8),
              TextField(
                controller: _itemCtrl,
                decoration: InputDecoration(
                  hintText: 'e.g. Hand-Tamed Sun Conure',
                  filled: true,
                  fillColor: AppColors.canvasLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 8),

              // Quick Preset Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _presetChip('Sun Conure'),
                    const SizedBox(width: 6),
                    _presetChip('African Grey'),
                    const SizedBox(width: 6),
                    _presetChip('Cockatiel'),
                    const SizedBox(width: 6),
                    _presetChip('Flight Cage'),
                    const SizedBox(width: 6),
                    _presetChip('Organic Pellets'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Special Offer Input
              const Text('Special Hook / Offer (optional)', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              const SizedBox(height: 8),
              TextField(
                controller: _offerCtrl,
                decoration: InputDecoration(
                  hintText: 'e.g. 15% off cage + free diet onboarding',
                  filled: true,
                  fillColor: AppColors.canvasLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 18),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _loading ? null : _generate,
                  icon: _loading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.auto_awesome_rounded, size: 18, color: Colors.white),
                  label: Text(_loading ? 'Writing Copy...' : 'Generate AI Ad Copy', style: const TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.heroDark,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // Result Container
        if (_generated != null)
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFD6EAD9)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Generated Ad Copy', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.forestGreen)),
                    TextButton.icon(
                      onPressed: () {
                        final fullText = '${_generated!['headline'] ?? ''}\n\n${_generated!['caption'] ?? ''}\n\n${_generated!['hashtags'] ?? ''}';
                        Clipboard.setData(ClipboardData(text: fullText));
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('All copied to clipboard!')));
                      },
                      icon: const Icon(Icons.copy_all_rounded, size: 16, color: AppColors.forestGreen),
                      label: const Text('Copy All', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.forestGreen, fontSize: 12)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Headline
                if (_generated!['headline'] != null) ...[
                  const Text('HEADLINE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textSecondary)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.canvasLight, borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: Text(_generated!['headline'], style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5))),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, size: 16),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: _generated!['headline']));
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Headline copied!')));
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Caption
                if (_generated!['caption'] != null) ...[
                  const Text('CAPTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textSecondary)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.canvasLight, borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_generated!['caption'], style: const TextStyle(fontSize: 13, height: 1.4)),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton.icon(
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _generated!['caption']));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Caption copied!')));
                            },
                            icon: const Icon(Icons.copy_rounded, size: 14, color: AppColors.forestGreen),
                            label: const Text('Copy Caption', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: AppColors.forestGreen)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Hashtags
                if (_generated!['hashtags'] != null && (_generated!['hashtags'] as String).isNotEmpty) ...[
                  const Text('HASHTAGS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textSecondary)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.canvasLight, borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: Text(_generated!['hashtags'], style: const TextStyle(fontSize: 12, color: Color(0xFF1877F2)))),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, size: 16),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: _generated!['hashtags']));
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Hashtags copied!')));
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
      ],
    );
  }

  Widget _platformPill(String id, String label, IconData icon) {
    final active = _platform == id;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _platform = id),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? AppColors.heroDark : AppColors.canvasLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: active ? Colors.white : AppColors.textSecondary),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  color: active ? Colors.white : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _presetChip(String name) {
    return InkWell(
      onTap: () => setState(() => _itemCtrl.text = name),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.canvasLight,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Text(name, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      ),
    );
  }
}
