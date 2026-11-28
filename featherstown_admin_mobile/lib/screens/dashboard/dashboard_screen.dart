import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/ai_provider.dart';
import '../transactions/quick_record_modal.dart';
import '../transactions/transactions_screen.dart';
import '../analytics/categories_insights_screen.dart';
import '../birds/birds_screen.dart';
import '../orders/orders_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final TextEditingController _aiPromptCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().fetchAnalytics();
    });
  }

  @override
  void dispose() {
    _aiPromptCtrl.dispose();
    super.dispose();
  }

  void _showAiAdvisorSheet(BuildContext context, {String? initialQuery}) {
    final queryCtrl = TextEditingController(text: initialQuery ?? '');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AiAdvisorSheet(initialQuery: queryCtrl.text),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<DashboardProvider>();
    final auth = context.watch<AuthProvider>();
    final analytics = prov.analytics;

    final gross = analytics?.summary.grossRevenue ?? 0.0;
    final expenses = analytics?.summary.totalExpenses ?? 0.0;
    final netProfit = analytics?.summary.netProfit ?? (gross - expenses);
    final birdsCount = analytics?.summary.availableBirds ?? 6;
    final target = 100000.0; // ₹1.0L budgeted target
    final targetPct = (gross / target).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => prov.fetchAnalytics(refresh: true),
          color: AppColors.primary,
          child: prov.isLoading && analytics == null
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 160),
                    child: CircularProgressIndicator(color: AppColors.heroDark),
                  ),
                )
              : SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Greeting Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'Hi, ${auth.user?.username ?? "Admin"}',
                              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 22,
                                    color: AppColors.textPrimary,
                                  ),
                            ),
                            const SizedBox(width: 6),
                            const Text('👋', style: TextStyle(fontSize: 20)),
                          ],
                        ),
                        const SizedBox(height: 3),
                        const Text(
                          "FeatherTown Store & Aviary Console",
                          style: TextStyle(
                            fontSize: 12.5,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    GestureCardAvatar(username: auth.user?.username ?? 'A'),
                  ],
                ),

                const SizedBox(height: 18),

                // ── 1. HERO FINANCIAL CARD ──
                Container(
                  padding: const EdgeInsets.all(22),
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    color: AppColors.heroDark,
                    borderRadius: BorderRadius.circular(26),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.heroDark.withValues(alpha: 0.25),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Net Aviary Inflow this month',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFBACEC0),
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const TransactionsScreen()),
                              );
                            },
                            borderRadius: BorderRadius.circular(20),
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.arrow_outward_rounded,
                                size: 18,
                                color: AppColors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppFormatters.currency(netProfit),
                        style: const TextStyle(
                          fontSize: 34,
                          fontWeight: FontWeight.w900,
                          color: AppColors.white,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'of ${AppFormatters.compactCurrency(target)} budgeted target',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFFBACEC0),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Target Progress Bar
                      Container(
                        height: 6,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: LayoutBuilder(
                          builder: (ctx, constraints) {
                            return Align(
                              alignment: Alignment.centerLeft,
                              child: Container(
                                width: (constraints.maxWidth * (targetPct > 0 ? targetPct : 0.02)).clamp(6.0, constraints.maxWidth),
                                height: 6,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4ADE80),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(height: 1, color: Colors.white.withValues(alpha: 0.12)),
                      const SizedBox(height: 14),
                      // Micro stats row (Gross Receipts, Aviary Outflow, Avian Flock)
                      Row(
                        children: [
                          _buildDarkSubStat(
                            'Gross Receipts',
                            AppFormatters.currency(gross),
                            const Color(0xFF4ADE80),
                          ),
                          Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.15)),
                          _buildDarkSubStat(
                            'Aviary Outflow',
                            AppFormatters.currency(expenses),
                            const Color(0xFFF87171),
                          ),
                          Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.15)),
                          _buildDarkSubStat(
                            'Avian Flock',
                            '$birdsCount Birds',
                            AppColors.white,
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      // Quick Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => QuickRecordModal.show(context, initialType: 'income'),
                              icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.heroDark),
                              label: const Text(
                                'Record Sale',
                                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5, color: AppColors.heroDark),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF4ADE80),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(vertical: 11),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => QuickRecordModal.show(context, initialType: 'expense'),
                              icon: const Icon(Icons.remove_rounded, size: 18, color: Colors.white),
                              label: const Text(
                                'Add Expense',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Colors.white),
                              ),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                                padding: const EdgeInsets.symmetric(vertical: 11),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // ── 2. SMART AI ASSISTANT CARD (AI EVERYWHERE) ──
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.cardBorder),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
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
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.auto_awesome_rounded, color: AppColors.forestGreen, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'FeatherTown AI Assistant',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Smart aviary pricing, care & ad copywriting',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.open_in_new_rounded, size: 18, color: AppColors.textSecondary),
                            onPressed: () => _showAiAdvisorSheet(context),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      // Quick Prompt Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildAiChip(
                              '💡 Price Advice',
                              'What is the ideal price for hand-tamed Sun Conures?',
                            ),
                            const SizedBox(width: 8),
                            _buildAiChip(
                              '📱 Instagram Ad',
                              'Write an engaging Instagram ad caption for Cockatiels and cages',
                            ),
                            const SizedBox(width: 8),
                            _buildAiChip(
                              '🦜 Nutrition Guide',
                              'What is the best daily diet for Conures and Parrots?',
                            ),
                            const SizedBox(width: 8),
                            _buildAiChip(
                              '📈 Boost Sales',
                              'Give me 3 practical ideas to boost store sales this weekend',
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // ── 3. SALES BY CATEGORY ──
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Sales by Category',
                              style: TextStyle(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const CategoriesInsightsScreen()),
                                );
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                child: Row(
                                  children: const [
                                    Text(
                                      'Analytics',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    Icon(Icons.keyboard_arrow_right_rounded, size: 16, color: AppColors.textSecondary),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Builder(
                          builder: (context) {
                            final categories = analytics?.categoryBreakdown ?? [];
                            final categoryColors = [
                              AppColors.catCockatiel,
                              AppColors.catBudgie,
                              AppColors.catConure,
                              AppColors.lavenderText,
                              AppColors.accent,
                              AppColors.forestGreen,
                            ];

                            return Row(
                              children: [
                                SizedBox(
                                  width: 120,
                                  height: 120,
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      PieChart(
                                        PieChartData(
                                          sectionsSpace: categories.length > 1 ? 3 : 0,
                                          centerSpaceRadius: 42,
                                          sections: categories.isNotEmpty
                                              ? List.generate(categories.length, (idx) {
                                                  final c = categories[idx];
                                                  final col = categoryColors[idx % categoryColors.length];
                                                  return PieChartSectionData(
                                                    color: col,
                                                    value: c.percentage > 0 ? c.percentage : 1.0,
                                                    showTitle: false,
                                                    radius: 14,
                                                  );
                                                })
                                              : [
                                                  PieChartSectionData(
                                                    color: const Color(0xFFE2E8F0),
                                                    value: 100,
                                                    showTitle: false,
                                                    radius: 14,
                                                  ),
                                                ],
                                        ),
                                      ),
                                      Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            AppFormatters.compactCurrency(gross),
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w900,
                                              fontSize: 14,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          const Text(
                                            'Sales',
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: AppColors.textSecondary,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 20),
                                Expanded(
                                  child: categories.isNotEmpty
                                      ? Column(
                                          children: List.generate(categories.take(4).length, (idx) {
                                            final c = categories[idx];
                                            final col = categoryColors[idx % categoryColors.length];
                                            return Padding(
                                              padding: EdgeInsets.only(bottom: idx < categories.take(4).length - 1 ? 8 : 0),
                                              child: _buildStreamLegend(
                                                c.name,
                                                '${c.percentage.toStringAsFixed(0)}%',
                                                col,
                                              ),
                                            );
                                          }),
                                        )
                                      : const Center(
                                          child: Text(
                                            'Ready for sales • Live categories populate automatically',
                                            style: TextStyle(
                                              fontSize: 11.5,
                                              color: AppColors.textSecondary,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // ── 4. RECENT ORDERS & BOOKINGS ──
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Recent Orders & Bookings',
                              style: TextStyle(
                                fontSize: 15.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const OrdersScreen()),
                                );
                              },
                              child: const Text(
                                'View all >',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Builder(
                          builder: (context) {
                            final recentOrders = analytics?.recentOrders ?? [];
                            if (recentOrders.isEmpty) {
                              return const Padding(
                                padding: EdgeInsets.symmetric(vertical: 14),
                                child: Center(
                                  child: Text(
                                    'No orders recorded yet • Website sales sync here in real-time',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              );
                            }

                            return Column(
                              children: List.generate(recentOrders.length, (idx) {
                                final ord = recentOrders[idx];
                                final isLast = idx == recentOrders.length - 1;
                                final st = ord.status.toLowerCase();
                                final isDelivered = st == 'delivered';
                                final isShipped = st == 'shipped';
                                final statusColor = isDelivered
                                    ? AppColors.forestGreen
                                    : (isShipped ? AppColors.blueText : AppColors.accent);
                                final statusBg = isDelivered
                                    ? AppColors.pastelMint
                                    : (isShipped ? AppColors.pastelBlue : AppColors.pastelPeach);

                                return Column(
                                  children: [
                                    InkWell(
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(builder: (_) => const OrdersScreen()),
                                        );
                                      },
                                      borderRadius: BorderRadius.circular(12),
                                      child: _buildActionRow(
                                        icon: Icons.shopping_bag_rounded,
                                        iconBg: statusBg,
                                        iconColor: statusColor,
                                        title: 'Order #${ord.orderNumber}',
                                        subtitle: '${ord.customerName} • ${ord.paymentMethod.toUpperCase()}',
                                        amount: AppFormatters.currency(ord.amount),
                                        statusTag: ord.status.toUpperCase(),
                                        statusColor: statusColor,
                                        statusBg: statusBg,
                                      ),
                                    ),
                                    if (!isLast) const Divider(height: 20, color: AppColors.cardBorder),
                                  ],
                                );
                              }),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // ── 5. TWO MICRO SHORTCUT CARDS ──
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const BirdsScreen()));
                        },
                        borderRadius: BorderRadius.circular(22),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.pastelMint,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: const Color(0xFFD6EAD9)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Store Stock',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.mintText,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Available Birds',
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '$birdsCount Birds Active',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => QuickRecordModal.show(context),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.pastelPeach,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: const Color(0xFFF7D9CE)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: const [
                                  Text(
                                    'Quick Entry',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.peachText,
                                    ),
                                  ),
                                  Icon(Icons.arrow_forward_rounded, size: 16, color: AppColors.peachText),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Record Sale',
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Tap to log sales or expenses',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textSecondary,
                                  height: 1.3,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAiChip(String label, String query) {
    return InkWell(
      onTap: () => _showAiAdvisorSheet(context, initialQuery: query),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.canvasLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildDarkSubStat(String label, String value, Color valueColor) {
    return Expanded(
      child: Column(
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 10.5, color: Color(0xFFBACEC0), fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: valueColor),
          ),
        ],
      ),
    );
  }

  Widget _buildStreamLegend(String label, String pct, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          ],
        ),
        Text(pct, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
      ],
    );
  }

  Widget _buildActionRow({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String amount,
    required String statusTag,
    required Color statusColor,
    required Color statusBg,
  }) {
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, size: 19, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              const SizedBox(height: 2),
              Text(subtitle, style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary)),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(amount, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5)),
            const SizedBox(height: 3),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(6)),
              child: Text(
                statusTag,
                style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: statusColor),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── AI ADVISOR BOTTOM SHEET ──
class _AiAdvisorSheet extends StatefulWidget {
  final String initialQuery;
  const _AiAdvisorSheet({required this.initialQuery});

  @override
  State<_AiAdvisorSheet> createState() => _AiAdvisorSheetState();
}

class _AiAdvisorSheetState extends State<_AiAdvisorSheet> {
  late final TextEditingController _ctrl;
  String? _answer;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.initialQuery);
    if (widget.initialQuery.isNotEmpty) {
      _runQuery(widget.initialQuery);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _runQuery(String q) async {
    if (q.trim().isEmpty) return;
    setState(() {
      _loading = true;
      _answer = null;
    });

    final ai = context.read<AiProvider>();
    final reply = await ai.askAdvisor(q);

    if (!mounted) return;
    setState(() {
      _loading = false;
      _answer = reply ?? 'Could not fetch response. Please try again.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.auto_awesome_rounded, color: AppColors.forestGreen, size: 22),
                  SizedBox(width: 8),
                  Text(
                    'FeatherTown AI Advisor',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _ctrl,
            decoration: InputDecoration(
              hintText: 'Ask anything about birds, pricing, or ads...',
              filled: true,
              fillColor: AppColors.canvasLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
              suffixIcon: IconButton(
                icon: const Icon(Icons.send_rounded, color: AppColors.forestGreen),
                onPressed: () => _runQuery(_ctrl.text),
              ),
            ),
            onSubmitted: _runQuery,
          ),
          const SizedBox(height: 16),
          if (_loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: CircularProgressIndicator(color: AppColors.forestGreen),
              ),
            )
          else if (_answer != null)
            Flexible(
              child: SingleChildScrollView(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.pastelMint.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFD6EAD9)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'AI Recommendation',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.forestGreen),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy_rounded, size: 16, color: AppColors.forestGreen),
                            tooltip: 'Copy Answer',
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _answer!));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Copied to clipboard!')),
                              );
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _answer!,
                        style: const TextStyle(fontSize: 13.5, height: 1.5, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class GestureCardAvatar extends StatelessWidget {
  final String? username;
  const GestureCardAvatar({super.key, this.username});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topRight,
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.cardBorder, width: 1.2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          padding: const EdgeInsets.all(4),
          child: Image.asset(
            'assets/images/app_logo.png',
            fit: BoxFit.contain,
          ),
        ),
        Container(
          width: 11,
          height: 11,
          decoration: BoxDecoration(
            color: const Color(0xFF4ADE80),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
          ),
        ),
      ],
    );
  }
}
