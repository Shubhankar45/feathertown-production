import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/dashboard_provider.dart';

class CategoriesInsightsScreen extends StatefulWidget {
  const CategoriesInsightsScreen({super.key});

  @override
  State<CategoriesInsightsScreen> createState() => _CategoriesInsightsScreenState();
}

class _CategoriesInsightsScreenState extends State<CategoriesInsightsScreen> {
  int _selectedPeriod = 0; // 0: This Month, 1: Last 3 Months
  String _selectedCategory = 'All';

  final List<String> _categoryTabs = [
    'All',
    'Exotic Birds',
    'Feed & Nutrition',
    'Cages & Housing',
    'Healthcare',
  ];

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<DashboardProvider>();
    final analytics = prov.analytics;
    final gross = analytics?.summary.grossRevenue ?? 0.0;
    final expenses = analytics?.summary.totalExpenses ?? 0.0;

    final categories = [
      {
        'title': 'Exotic Companion Birds',
        'subtitle': 'Conures, Macaws, Greys',
        'spent': gross * 0.58,
        'target': gross * 0.70,
        'icon': Icons.flutter_dash_rounded,
        'color': AppColors.catCockatiel,
        'bg': AppColors.pastelMint,
        'section': 'Livestock',
      },
      {
        'title': 'Aviary Cages & Flight Aviaries',
        'subtitle': 'Galvanized & Powder Coated',
        'spent': gross * 0.22,
        'target': gross * 0.25,
        'icon': Icons.home_work_rounded,
        'color': AppColors.catBudgie,
        'bg': AppColors.pastelBlue,
        'section': 'Housing',
      },
      {
        'title': 'Bird Nutrition & Seed Blends',
        'subtitle': 'Organic pellets & millets',
        'spent': expenses * 0.45,
        'target': expenses * 0.50,
        'icon': Icons.grain_rounded,
        'color': AppColors.catConure,
        'bg': AppColors.pastelYellow,
        'section': 'Operating',
      },
      {
        'title': 'Veterinary & DNA Testing',
        'subtitle': 'Certificates, vaccines & labs',
        'spent': expenses * 0.25,
        'target': expenses * 0.35,
        'icon': Icons.medical_services_rounded,
        'color': AppColors.lavenderText,
        'bg': AppColors.pastelLavender,
        'section': 'Operating',
      },
      {
        'title': 'Aviary Maintenance & Climate',
        'subtitle': 'Misting, heating, lighting',
        'spent': expenses * 0.20,
        'target': expenses * 0.25,
        'icon': Icons.thermostat_rounded,
        'color': AppColors.peachText,
        'bg': AppColors.pastelPeach,
        'section': 'Operating',
      },
    ];

    final filtered = _selectedCategory == 'All'
        ? categories
        : categories.where((c) => c['title'].toString().toLowerCase().contains(_selectedCategory.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Categories & Insights'),
      ),
      body: RefreshIndicator(
        onRefresh: () => prov.fetchAnalytics(refresh: true),
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Period Switcher (Matching Reference Screen 7 "Spending Insights")
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPeriod = 0),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 9),
                          decoration: BoxDecoration(
                            color: _selectedPeriod == 0 ? AppColors.heroDark : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'This Month',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: _selectedPeriod == 0 ? AppColors.white : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPeriod = 1),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 9),
                          decoration: BoxDecoration(
                            color: _selectedPeriod == 1 ? AppColors.heroDark : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'Last 3 Months',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: _selectedPeriod == 1 ? AppColors.white : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Weekly Bar Chart Card (Matching Reference Screen 7)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Total Cash Inflow',
                        style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            AppFormatters.currency(gross),
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.pastelMint,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: const [
                                Icon(Icons.arrow_upward_rounded, size: 13, color: AppColors.mintText),
                                SizedBox(width: 2),
                                Text(
                                  '+14% vs last mo',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.mintText),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Weekly Inflow Bar Chart
                      SizedBox(
                        height: 140,
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: 100,
                            barTouchData: BarTouchData(enabled: false),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (val, _) {
                                    const labels = ['W1', 'W2', 'W3', 'W4'];
                                    final idx = val.toInt();
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        idx < labels.length ? labels[idx] : '',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: idx == 2 ? FontWeight.w800 : FontWeight.w600,
                                          color: idx == 2 ? AppColors.heroDark : AppColors.textSecondary,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                              leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            ),
                            gridData: const FlGridData(show: false),
                            borderData: FlBorderData(show: false),
                            barGroups: [
                              _buildBar(0, 48, false),
                              _buildBar(1, 65, false),
                              _buildBar(2, 92, true), // Active week highlighted
                              _buildBar(3, 58, false),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Category Filter Chips (Matching Reference Screen 3 "Categories")
              SizedBox(
                height: 38,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categoryTabs.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 8),
                  itemBuilder: (ctx, i) {
                    final tab = _categoryTabs[i];
                    final isSelected = _selectedCategory == tab;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedCategory = tab),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.heroDark : AppColors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected ? AppColors.heroDark : AppColors.cardBorder,
                          ),
                        ),
                        child: Text(
                          tab,
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            color: isSelected ? AppColors.white : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 16),

              // Category Stream Items with Progress Bars (Matching Screen 3)
              Card(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    children: filtered.map((c) {
                      final spent = c['spent'] as double;
                      final target = c['target'] as double;
                      final pct = (spent / (target > 0 ? target : 1)).clamp(0.0, 1.0);

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: c['bg'] as Color,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(c['icon'] as IconData, size: 20, color: c['color'] as Color),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        c['title'] as String,
                                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        c['subtitle'] as String,
                                        style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      AppFormatters.currency(spent),
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'of ${AppFormatters.compactCurrency(target)}',
                                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(99),
                              child: LinearProgressIndicator(
                                value: pct,
                                minHeight: 6,
                                backgroundColor: AppColors.oatMilk,
                                color: c['color'] as Color,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Companion Bird Margin Helper Card (Matching Reference Screen 8 "Can I afford it?")
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.pastelMint,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFD3E7D7)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.calculate_outlined, color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'Breeding Margin Calculator',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.primary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Target selling price for weaned Sun Conure chick:',
                      style: TextStyle(fontSize: 12.5, color: AppColors.mintText),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      '₹24,000.00',
                      style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.primary),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Estimated Net Profit:', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                          Text(
                            '+₹14,500 (60% margin)',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.success),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  BarChartGroupData _buildBar(int x, double y, bool isHighlight) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: isHighlight ? AppColors.heroDark : const Color(0xFFCCE0D0),
          width: 22,
          borderRadius: BorderRadius.circular(8),
        ),
      ],
    );
  }
}
