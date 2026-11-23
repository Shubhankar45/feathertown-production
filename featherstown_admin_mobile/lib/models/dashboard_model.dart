class DayTrend {
  final String date;
  final double revenue;
  final double expenses;

  DayTrend({required this.date, required this.revenue, required this.expenses});

  factory DayTrend.fromJson(Map<String, dynamic> json) {
    return DayTrend(
      date: json['date']?.toString() ?? '',
      revenue: (json['revenue'] is num) ? (json['revenue'] as num).toDouble() : 0.0,
      expenses: (json['expenses'] is num) ? (json['expenses'] as num).toDouble() : 0.0,
    );
  }
}

class DashboardSummary {
  final double grossRevenue;
  final double totalExpenses;
  final double netProfit;
  final double profitMargin;
  final int totalOrders;
  final int pendingBookings;
  final int totalCustomers;
  final double averageOrderValue;
  final int totalBirds;
  final int availableBirds;
  final int totalAccessories;
  final int lowStockCount;

  DashboardSummary({
    this.grossRevenue = 0.0,
    this.totalExpenses = 0.0,
    this.netProfit = 0.0,
    this.profitMargin = 0.0,
    this.totalOrders = 0,
    this.pendingBookings = 0,
    this.totalCustomers = 0,
    this.averageOrderValue = 0.0,
    this.totalBirds = 0,
    this.availableBirds = 0,
    this.totalAccessories = 0,
    this.lowStockCount = 0,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      grossRevenue: (json['grossRevenue'] is num) ? (json['grossRevenue'] as num).toDouble() : 0.0,
      totalExpenses: (json['totalExpenses'] is num) ? (json['totalExpenses'] as num).toDouble() : 0.0,
      netProfit: (json['netProfit'] is num) ? (json['netProfit'] as num).toDouble() : 0.0,
      profitMargin: (json['profitMargin'] is num) ? (json['profitMargin'] as num).toDouble() : 0.0,
      totalOrders: (json['totalOrders'] is num) ? (json['totalOrders'] as num).toInt() : 0,
      pendingBookings: (json['pendingBookings'] is num) ? (json['pendingBookings'] as num).toInt() : 0,
      totalCustomers: (json['totalCustomers'] is num) ? (json['totalCustomers'] as num).toInt() : 0,
      averageOrderValue: (json['averageOrderValue'] is num) ? (json['averageOrderValue'] as num).toDouble() : 0.0,
      totalBirds: (json['totalBirds'] is num) ? (json['totalBirds'] as num).toInt() : 0,
      availableBirds: (json['availableBirds'] is num) ? (json['availableBirds'] as num).toInt() : 0,
      totalAccessories: (json['totalAccessories'] is num) ? (json['totalAccessories'] as num).toInt() : 0,
      lowStockCount: (json['lowStockCount'] is num) ? (json['lowStockCount'] as num).toInt() : 0,
    );
  }
}

class DashboardAnalytics {
  final DashboardSummary summary;
  final List<DayTrend> trend30Days;
  final Map<String, dynamic> orderStatusFunnel;
  final List<dynamic> lowStockAlerts;
  final List<dynamic> recentTransactions;
  final List<dynamic> recentInvoices;

  DashboardAnalytics({
    required this.summary,
    required this.trend30Days,
    required this.orderStatusFunnel,
    required this.lowStockAlerts,
    required this.recentTransactions,
    required this.recentInvoices,
  });

  factory DashboardAnalytics.fromJson(Map<String, dynamic> json) {
    final summaryRaw = json['summary'] is Map ? json['summary'] : json;
    final summaryObj = DashboardSummary.fromJson(Map<String, dynamic>.from(summaryRaw));

    final rawTrends = json['trend30Days'] as List? ?? [];
    final trendsList = rawTrends.map((e) => DayTrend.fromJson(Map<String, dynamic>.from(e))).toList();

    return DashboardAnalytics(
      summary: summaryObj,
      trend30Days: trendsList,
      orderStatusFunnel: json['orderStatusFunnel'] is Map ? Map<String, dynamic>.from(json['orderStatusFunnel']) : {},
      lowStockAlerts: json['lowStockAlerts'] as List? ?? [],
      recentTransactions: json['recentTransactions'] as List? ?? [],
      recentInvoices: json['recentInvoices'] as List? ?? [],
    );
  }
}
