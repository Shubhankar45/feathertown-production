import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../transactions/quick_record_modal.dart';
import '../bookings/booking_tracker_screen.dart';
import '../analytics/categories_insights_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().fetchAnalytics();
    });
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<DashboardProvider>();
    final auth = context.watch<AuthProvider>();
    final analytics = prov.analytics;

    final gross = analytics?.summary.grossRevenue ?? 248500.0;
    final expenses = analytics?.summary.totalExpenses ?? 63500.0;
    final netProfit = analytics?.summary.netProfit ?? (gross - expenses);
    final target = (gross * 1.35).clamp(100000.0, 1000000.0);
    final targetPct = (gross / target).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => prov.fetchAnalytics(refresh: true),
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Greeting Header (Matching Reference Screen 1 "Hi, Alex 👋")
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
                          "You're running FeatherTown smoothly today!",
                          style: TextStyle(
                            fontSize: 12.5,
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    // Profile Avatar with Status Ring
                    GestureCardAvatar(username: auth.user?.username ?? 'A'),
                  ],
                ),

                const SizedBox(height: 18),

                // Hero Dark Card (Matching Reference Screen 1 "Money left this month")
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
                          Container(
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
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        AppFormatters.currency(netProfit > 0 ? netProfit : gross),
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
                      const SizedBox(height: 14),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(99),
                        child: LinearProgressIndicator(
                          value: targetPct,
                          minHeight: 5,
                          backgroundColor: Colors.white.withValues(alpha: 0.15),
                          color: const Color(0xFF4ADE80),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Micro stats row
                      Row(
                        children: [
                          _buildDarkSubStat(
                            'Gross Receipts',
                            AppFormatters.compactCurrency(gross),
                            const Color(0xFF4ADE80),
                          ),
                          Container(width: 1, height: 20, color: Colors.white.withValues(alpha: 0.15)),
                          _buildDarkSubStat(
                            'Aviary Outflow',
                            AppFormatters.compactCurrency(expenses),
                            const Color(0xFFF87171),
                          ),
                          Container(width: 1, height: 20, color: Colors.white.withValues(alpha: 0.15)),
                          _buildDarkSubStat(
                            'Avian Flock',
                            '${analytics?.summary.availableBirds ?? 38} Birds',
                            AppColors.white,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Sales & Aviary Streams Card (Matching Reference Screen 1 "Spending Overview")
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
                              'Aviary Revenue Streams',
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
                                      'This month',
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
                        Row(
                          children: [
                            // Donut Chart with Center Hollow Text (Matching Reference Donut)
                            SizedBox(
                              width: 120,
                              height: 120,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  PieChart(
                                    PieChartData(
                                      sectionsSpace: 3,
                                      centerSpaceRadius: 42,
                                      sections: [
                                        PieChartSectionData(color: AppColors.catCockatiel, value: 58, showTitle: false, radius: 14),
                                        PieChartSectionData(color: AppColors.catBudgie, value: 22, showTitle: false, radius: 14),
                                        PieChartSectionData(color: AppColors.catConure, value: 12, showTitle: false, radius: 14),
                                        PieChartSectionData(color: AppColors.lavenderText, value: 8, showTitle: false, radius: 14),
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
                                        'inflow',
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
                            // Legend Column (Matching Reference Layout)
                            Expanded(
                              child: Column(
                                children: [
                                  _buildStreamLegend('Companion Birds', '58%', AppColors.catCockatiel),
                                  const SizedBox(height: 8),
                                  _buildStreamLegend('Cages & Housing', '22%', AppColors.catBudgie),
                                  const SizedBox(height: 8),
                                  _buildStreamLegend('Feed & Nutrition', '12%', AppColors.catConure),
                                  const SizedBox(height: 8),
                                  _buildStreamLegend('Health & Toys', '8%', AppColors.lavenderText),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Upcoming Handovers & Actions Card (Matching Reference Screen 1 "Upcoming Expenses")
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
                              'Upcoming Handovers & Bills',
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
                                  MaterialPageRoute(builder: (_) => const BookingTrackerScreen()),
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
                        _buildActionRow(
                          icon: Icons.flutter_dash_rounded,
                          iconBg: AppColors.pastelMint,
                          iconColor: AppColors.catCockatiel,
                          title: 'Sun Conure • Ring #FT-88',
                          subtitle: 'Apr 15 • Hand-reared & Weaned',
                          amount: '₹24,000',
                          statusTag: 'Ready',
                          statusColor: AppColors.success,
                          statusBg: AppColors.pastelMint,
                        ),
                        const Divider(height: 20, color: AppColors.cardBorder),
                        _buildActionRow(
                          icon: Icons.grain_rounded,
                          iconBg: AppColors.pastelYellow,
                          iconColor: AppColors.catConure,
                          title: 'Higgins Seed Mix Restock',
                          subtitle: 'Apr 18 • Due in 3 days',
                          amount: '₹6,500',
                          statusTag: 'Due',
                          statusColor: AppColors.danger,
                          statusBg: AppColors.pastelPeach,
                        ),
                        const Divider(height: 20, color: AppColors.cardBorder),
                        _buildActionRow(
                          icon: Icons.home_work_rounded,
                          iconBg: AppColors.pastelBlue,
                          iconColor: AppColors.catBudgie,
                          title: 'Breed Cage Flight Unit',
                          subtitle: 'Apr 22 • Confirmed Booking',
                          amount: '₹18,500',
                          statusTag: 'Upcoming',
                          statusColor: AppColors.blueText,
                          statusBg: AppColors.pastelBlue,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Two-Column Micro Cards (Matching Reference "Savings Goal" & "Can I afford it?")
                Row(
                  children: [
                    // Left Card: Flock Health & Capacity (Matching "Savings Goal")
                    Expanded(
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
                              'Aviary Capacity',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.mintText,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Flock Health',
                              style: TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              '38 / 45 Active',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(99),
                              child: const LinearProgressIndicator(
                                value: 0.84,
                                minHeight: 5,
                                backgroundColor: Color(0xFFCCE4CF),
                                color: AppColors.mintText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Right Card: Quick Ledger Entry (Matching "Can I afford it?")
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
                                    'Quick Entry?',
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
                                'Record Entry',
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Tap to log feed/vet cost in seconds',
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

                const SizedBox(height: 80), // Padding above bottom dock
              ],
            ),
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

class GestureCardAvatar extends StatelessWidget {
  final String username;
  const GestureCardAvatar({super.key, required this.username});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.topRight,
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AppColors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          padding: const EdgeInsets.all(3),
          child: CircleAvatar(
            backgroundColor: AppColors.heroDark,
            child: Text(
              username.isNotEmpty ? username[0].toUpperCase() : 'A',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15),
            ),
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
