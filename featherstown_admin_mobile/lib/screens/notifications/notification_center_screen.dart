import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/notification_model.dart';
import '../../providers/notifications_provider.dart';

class NotificationCenterScreen extends StatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  State<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends State<NotificationCenterScreen> {
  final List<Map<String, String>> _categories = const [
    {'id': 'all', 'label': 'All'},
    {'id': 'order', 'label': 'Orders'},
    {'id': 'invoice', 'label': 'Billing'},
    {'id': 'booking', 'label': 'Bookings'},
    {'id': 'inventory', 'label': 'Inventory'},
  ];

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<NotificationsProvider>();
    final items = prov.filteredNotifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Center'),
        actions: [
          if (prov.unreadCount > 0)
            TextButton(
              onPressed: () => prov.markAllAsRead(),
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: Column(
        children: [
          // Category Tabs Filter
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (context, index) => const SizedBox(width: 8),
              itemBuilder: (ctx, i) {
                final cat = _categories[i];
                final isSelected = prov.activeCategory == cat['id'];
                return ChoiceChip(
                  label: Text(cat['label']!),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                  onSelected: (_) => prov.setActiveCategory(cat['id']!),
                );
              },
            ),
          ),
          const Divider(height: 1),

          Expanded(
            child: RefreshIndicator(
              onRefresh: () => prov.fetchNotifications(refresh: true),
              color: AppColors.primary,
              child: items.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_none_rounded, size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          Text('No notifications yet', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 4),
                          const Text('Real alerts for store orders and aviary bookings will appear here.',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: items.length,
                      itemBuilder: (ctx, idx) {
                        final notif = items[idx];
                        return _NotificationTile(notification: notif);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final AdminNotification notification;

  const _NotificationTile({required this.notification});

  IconData _getIcon() {
    switch (notification.category) {
      case 'order':
        return Icons.shopping_bag_outlined;
      case 'invoice':
        return Icons.receipt_long_outlined;
      case 'booking':
        return Icons.egg_alt_outlined;
      case 'inventory':
        return Icons.inventory_2_outlined;
      default:
        return Icons.info_outline_rounded;
    }
  }

  Color _getColor() {
    switch (notification.category) {
      case 'order':
        return AppColors.info;
      case 'invoice':
        return AppColors.success;
      case 'booking':
        return AppColors.warning;
      case 'inventory':
        return AppColors.danger;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.read<NotificationsProvider>();

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppColors.danger,
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      onDismissed: (_) => prov.deleteNotification(notification.id),
      child: ListTile(
        onTap: () => prov.markAsRead(notification.id),
        tileColor: notification.isRead ? null : AppColors.primaryWash.withValues(alpha: 0.35),
        leading: CircleAvatar(
          backgroundColor: _getColor().withValues(alpha: 0.15),
          child: Icon(_getIcon(), color: _getColor(), size: 20),
        ),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.w800,
            fontSize: 14,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(notification.body, style: const TextStyle(fontSize: 12.5)),
            const SizedBox(height: 4),
            Text(
              '${AppFormatters.dateTime(notification.createdAt)} • ${AppFormatters.notificationGroup(notification.createdAt)}',
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
        trailing: notification.isRead
            ? null
            : Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle),
              ),
      ),
    );
  }
}
