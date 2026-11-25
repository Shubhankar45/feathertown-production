import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/constants/app_colors.dart';
import '../core/widgets/feather_town_logo.dart';
import '../providers/auth_provider.dart';
import '../providers/notifications_provider.dart';
import 'dashboard/dashboard_screen.dart';
import 'billing/invoices_screen.dart';
import 'bookings/booking_tracker_screen.dart';
import 'analytics/categories_insights_screen.dart';
import 'customers/customers_screen.dart';
import 'transactions/transactions_screen.dart';
import 'transactions/quick_record_modal.dart';
import 'notifications/notification_center_screen.dart';
import 'birds/birds_screen.dart';
import 'accessories/accessories_screen.dart';
import 'orders/orders_screen.dart';
import 'media/media_uploader_sheet.dart';
import 'ads/ads_tracker_screen.dart';
import 'website/website_settings_screen.dart';
import 'reviews/reviews_screen.dart';
import 'subscribers/subscribers_screen.dart';
import 'auth/login_screen.dart';

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    DashboardScreen(),
    InvoicesScreen(),
    BookingTrackerScreen(),
    CategoriesInsightsScreen(),
    CustomersScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsProvider>().fetchNotifications();
    });
  }

  void _onSelectTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final unread = context.watch<NotificationsProvider>().unreadCount;
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        title: const FeatherTownLogo(fontSize: 22),
        actions: [
          // Notification Bell with Badge
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textPrimary),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const NotificationCenterScreen()),
                  );
                },
              ),
              if (unread > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      unread > 99 ? '99+' : unread.toString(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(color: AppColors.heroDark),
              currentAccountPicture: CircleAvatar(
                backgroundColor: AppColors.white,
                child: Text(
                  (auth.user?.username.isNotEmpty ?? false)
                      ? auth.user!.username[0].toUpperCase()
                      : 'A',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.heroDark,
                  ),
                ),
              ),
              accountName: Text(
                auth.user?.username ?? 'FeatherTown Admin',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
              accountEmail: const Text(
                'Store & Aviary Management • Live Sync',
                style: TextStyle(fontSize: 12, color: Color(0xFFBACEC0)),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.dashboard_rounded),
              title: const Text('Dashboard'),
              selected: _currentIndex == 0,
              onTap: () {
                Navigator.pop(context);
                _onSelectTab(0);
              },
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text(
                'INVENTORY & STORE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.flutter_dash_rounded, color: AppColors.catCockatiel),
              title: const Text('Birds', style: TextStyle(fontWeight: FontWeight.w600)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.pastelMint,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('Live', style: TextStyle(color: AppColors.catCockatiel, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const BirdsScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.inventory_2_rounded, color: AppColors.catBudgie),
              title: const Text('Products & Cages', style: TextStyle(fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const AccessoriesScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_bag_rounded, color: AppColors.accent),
              title: const Text('Orders', style: TextStyle(fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.add_photo_alternate_rounded, color: AppColors.lavenderText),
              title: const Text('Upload Photos', style: TextStyle(fontWeight: FontWeight.w600)),
              trailing: const Icon(Icons.upload_file_rounded, size: 18, color: AppColors.textSecondary),
              onTap: () {
                Navigator.pop(context);
                MediaUploaderSheet.show(context);
              },
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text(
                'MARKETING & ADS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.campaign_rounded, color: Color(0xFF1877F2)),
              title: const Text('Ads & Marketing', style: TextStyle(fontWeight: FontWeight.w600)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFE7F3FF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('Meta/Google', style: TextStyle(color: Color(0xFF1877F2), fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const AdsTrackerScreen()));
              },
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text(
                'WEBSITE & REVIEWS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.web_rounded, color: AppColors.forestGreen),
              title: const Text('Website Settings', style: TextStyle(fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const WebsiteSettingsScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.star_rounded, color: Color(0xFFF4B400)),
              title: const Text('Reviews', style: TextStyle(fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ReviewsScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.mail_rounded, color: AppColors.catConure),
              title: const Text('Subscribers', style: TextStyle(fontWeight: FontWeight.w600)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscribersScreen()));
              },
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Text(
                'FINANCE & BILLING',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.receipt_long_rounded),
              title: const Text('Invoices'),
              selected: _currentIndex == 1,
              onTap: () {
                Navigator.pop(context);
                _onSelectTab(1);
              },
            ),
            ListTile(
              leading: const Icon(Icons.calendar_month_rounded),
              title: const Text('Bookings'),
              selected: _currentIndex == 2,
              onTap: () {
                Navigator.pop(context);
                _onSelectTab(2);
              },
            ),
            ListTile(
              leading: const Icon(Icons.insights_rounded),
              title: const Text('Analytics'),
              selected: _currentIndex == 3,
              onTap: () {
                Navigator.pop(context);
                _onSelectTab(3);
              },
            ),
            ListTile(
              leading: const Icon(Icons.people_alt_rounded),
              title: const Text('Customers'),
              selected: _currentIndex == 4,
              onTap: () {
                Navigator.pop(context);
                _onSelectTab(4);
              },
            ),
            ListTile(
              leading: const Icon(Icons.account_balance_wallet_rounded),
              title: const Text('Transactions'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const TransactionsScreen()),
                );
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.add_circle_outline_rounded, color: AppColors.heroDark),
              title: const Text('+ Record Sale / Expense', style: TextStyle(fontWeight: FontWeight.w700)),
              onTap: () {
                Navigator.pop(context);
                QuickRecordModal.show(context);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout_rounded, color: AppColors.danger),
              title: const Text('Sign Out', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700)),
              onTap: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Sign Out'),
                    content: const Text('Are you sure you want to log out of FeatherTown Admin?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );
                if (confirm != true) return;
                await auth.logout();
                if (!context.mounted) return;
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
            ),
          ],
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),

      // Custom Floating Bottom Navigation Bar (Matching Reference Screenshot)
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.home_filled, Icons.home_outlined, 'Home'),
                _buildNavItem(1, Icons.receipt_long, Icons.receipt_long_outlined, 'Expenses'),
                // Center Elevated '+' Action Button (Matching Reference Screenshot)
                GestureDetector(
                  onTap: () => QuickRecordModal.show(context),
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.heroDark,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.heroDark.withValues(alpha: 0.35),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.add_rounded,
                      color: AppColors.white,
                      size: 26,
                    ),
                  ),
                ),
                _buildNavItem(2, Icons.calendar_month, Icons.calendar_month_outlined, 'Bookings'),
                _buildNavItem(3, Icons.insights, Icons.insights_outlined, 'Analytics'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData activeIcon, IconData inactiveIcon, String label) {
    final isSelected = _currentIndex == index;
    return InkWell(
      onTap: () => _onSelectTab(index),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : inactiveIcon,
              size: 22,
              color: isSelected ? AppColors.heroDark : AppColors.textMuted,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? AppColors.heroDark : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
