import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/customer_model.dart';
import '../../providers/customers_provider.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CustomersProvider>().fetchCustomers();
    });
  }

  void _callPhone(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _openWhatsApp(String phone, String name) async {
    final clean = phone.replaceAll(RegExp(r'\D'), '');
    final text = Uri.encodeComponent('Hello $name, this is FeatherTown Aviary regarding your flock inquiry.');
    final uri = Uri.parse('https://wa.me/$clean?text=$text');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<CustomersProvider>();
    final customers = prov.filteredCustomers;

    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search by name, phone, or city...',
                prefixIcon: Icon(Icons.search_rounded),
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              onChanged: prov.setSearchQuery,
            ),
          ),
          const Divider(height: 1),

          Expanded(
            child: RefreshIndicator(
              onRefresh: () => prov.fetchCustomers(refresh: true),
              color: AppColors.primary,
              child: prov.isLoading && customers.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : customers.isEmpty
                      ? const Center(child: Text('No customers found in directory.'))
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: customers.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (ctx, idx) {
                            final c = customers[idx];
                            return _CustomerCard(
                              customer: c,
                              onCall: () => _callPhone(c.phone),
                              onWhatsApp: () => _openWhatsApp(c.phone, c.name),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CustomerCard extends StatelessWidget {
  final Customer customer;
  final VoidCallback onCall;
  final VoidCallback onWhatsApp;

  const _CustomerCard({
    required this.customer,
    required this.onCall,
    required this.onWhatsApp,
  });

  @override
  Widget build(BuildContext context) {
    final isVip = customer.totalSpent >= 10000;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Text(
                        customer.name,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                      ),
                      if (isVip) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.warningWash,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'VIP',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.warning),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Text(
                  AppFormatters.currency(customer.totalSpent),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.primary),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${customer.phone} • ${customer.city ?? "Bangalore"}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            if (customer.email != null) ...[
              const SizedBox(height: 2),
              Text(customer.email!, style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted)),
            ],
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${customer.totalOrders} Completed Orders',
                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                ),
                Row(
                  children: [
                    IconButton.filledTonal(
                      icon: const Icon(Icons.call_outlined, size: 16),
                      onPressed: onCall,
                      visualDensity: VisualDensity.compact,
                    ),
                    const SizedBox(width: 6),
                    IconButton.filledTonal(
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16),
                      onPressed: onWhatsApp,
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
