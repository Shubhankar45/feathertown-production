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
    return GestureDetector(
      onTap: () => prov.setStatusFilter(id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.heroDark : AppColors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.heroDark : AppColors.cardBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            fontSize: 12,
          ),
        ),
      ),
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
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Soft Tinted Icon Badge (Matching Reference Screenshot)
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: invoice.paymentStatus == 'paid' ? AppColors.pastelMint : AppColors.pastelPeach,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                Icons.receipt_long_rounded,
                size: 22,
                color: invoice.paymentStatus == 'paid' ? AppColors.catCockatiel : AppColors.catMacaw,
              ),
            ),
            const SizedBox(width: 14),
            // Middle Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        invoice.invoiceNumber,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.heroDark),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getStatusColor().withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          invoice.paymentStatus.toUpperCase(),
                          style: TextStyle(
                            color: _getStatusColor(),
                            fontWeight: FontWeight.w800,
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    invoice.customer['name']?.toString() ?? 'Aviary Patron',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${invoice.customer['phone'] ?? ''} • ${AppFormatters.date(invoice.createdAt)}',
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            // Right Side Amount & WhatsApp action
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  AppFormatters.currency(invoice.grandTotal),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                ),
                if (invoice.balanceDue > 0) ...[
                  const SizedBox(height: 2),
                  Text(
                    'Due: ${AppFormatters.currency(invoice.balanceDue)}',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.danger),
                  ),
                ],
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: onWhatsApp,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.pastelMint,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.share_rounded, size: 12, color: AppColors.mintText),
                        SizedBox(width: 4),
                        Text(
                          'Share',
                          style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.mintText),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
