import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/invoice_model.dart';
import '../../providers/invoices_provider.dart';

class InvoicesScreen extends StatefulWidget {
  const InvoicesScreen({super.key});

  @override
  State<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends State<InvoicesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InvoicesProvider>().fetchInvoices();
    });
  }

  void _shareWhatsApp(Invoice inv) async {
    final phone = inv.customer['phone']?.toString().replaceAll(RegExp(r'\D'), '') ?? '';
    final custName = inv.customer['name']?.toString() ?? 'Valued Customer';
    final text = Uri.encodeComponent(
      'Hello $custName, here is your FeatherTown Tax Invoice #${inv.invoiceNumber} for ${AppFormatters.currency(inv.grandTotal)}. Thank you for choosing FeatherTown Aviary!',
    );
    final url = Uri.parse('https://wa.me/$phone?text=$text');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<InvoicesProvider>();
    final invoices = prov.filteredInvoices;

    return Scaffold(
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by invoice # or customer...',
                prefixIcon: const Icon(Icons.search_rounded),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                suffixIcon: prov.searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded),
                        onPressed: () => prov.setSearchQuery(''),
                      )
                    : null,
              ),
              onChanged: prov.setSearchQuery,
            ),
          ),

          // Status Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _buildStatusChip(prov, 'all', 'All Statuses'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'paid', 'Fully Paid'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'partial', 'Partial Advance'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'unpaid', 'Unpaid'),
              ],
            ),
          ),

          const Divider(height: 12),

          Expanded(
            child: RefreshIndicator(
              onRefresh: () => prov.fetchInvoices(refresh: true),
              color: AppColors.primary,
              child: prov.isLoading && invoices.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : invoices.isEmpty
                      ? const Center(child: Text('No matching invoices found.'))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: invoices.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (ctx, idx) {
                            final inv = invoices[idx];
                            return _InvoiceCard(
                              invoice: inv,
                              onWhatsApp: () => _shareWhatsApp(inv),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(InvoicesProvider prov, String id, String label) {
    final isSelected = prov.statusFilter == id;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textPrimary,
        fontWeight: FontWeight.w600,
        fontSize: 12,
      ),
      onSelected: (_) => prov.setStatusFilter(id),
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  final Invoice invoice;
  final VoidCallback onWhatsApp;

  const _InvoiceCard({required this.invoice, required this.onWhatsApp});

  Color _getStatusColor() {
    switch (invoice.paymentStatus) {
      case 'paid':
        return AppColors.success;
      case 'partial':
        return AppColors.warning;
      case 'void':
        return AppColors.textMuted;
      default:
        return AppColors.danger;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  invoice.invoiceNumber,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.primary),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _getStatusColor().withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    invoice.paymentStatus.toUpperCase(),
                    style: TextStyle(
                      color: _getStatusColor(),
                      fontWeight: FontWeight.w800,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              invoice.customer['name']?.toString() ?? 'Customer',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
            ),
            Text(
              '${invoice.customer['phone'] ?? ''} • ${AppFormatters.date(invoice.createdAt)}',
              style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Total Amount', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      AppFormatters.currency(invoice.grandTotal),
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                    ),
                  ],
                ),
                if (invoice.balanceDue > 0)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Balance Due', style: TextStyle(fontSize: 11, color: AppColors.danger)),
                      Text(
                        AppFormatters.currency(invoice.balanceDue),
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.danger),
                      ),
                    ],
                  ),
                IconButton.filledTonal(
                  icon: const Icon(Icons.share_rounded, size: 18),
                  tooltip: 'WhatsApp Invoice',
                  onPressed: onWhatsApp,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
