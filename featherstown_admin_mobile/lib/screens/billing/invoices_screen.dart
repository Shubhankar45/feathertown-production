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

  void _showCreateInvoiceModal() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final itemCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final qtyCtrl = TextEditingController(text: '1');
    final paidCtrl = TextEditingController();
    String paymentStatus = 'paid';
    String paymentMethod = 'UPI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('New POS Tax Invoice', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.heroDark)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(
                    labelText: 'Customer / Patron Name *',
                    hintText: 'e.g. Ramesh Patel',
                    prefixIcon: const Icon(Icons.person_outline),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: phoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: 'Phone Number *',
                    hintText: 'e.g. 9876543210',
                    prefixIcon: const Icon(Icons.phone_outlined),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: itemCtrl,
                  decoration: InputDecoration(
                    labelText: 'Item Description *',
                    hintText: 'e.g. Hand-fed Sun Conure or Aviary Cage',
                    prefixIcon: const Icon(Icons.inventory_2_outlined),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: priceCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Unit Price (₹) *',
                          prefixIcon: const Icon(Icons.currency_rupee_rounded),
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 1,
                      child: TextField(
                        controller: qtyCtrl,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Qty',
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
                      child: DropdownButtonFormField<String>(
                        initialValue: paymentStatus,
                        decoration: InputDecoration(
                          labelText: 'Payment Status',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'paid', child: Text('Fully Paid')),
                          DropdownMenuItem(value: 'partial', child: Text('Partial Advance')),
                          DropdownMenuItem(value: 'unpaid', child: Text('Unpaid Credit')),
                        ],
                        onChanged: (val) {
                          if (val != null) setModalState(() => paymentStatus = val);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: paymentMethod,
                        decoration: InputDecoration(
                          labelText: 'Method',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'UPI', child: Text('UPI / QR')),
                          DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                          DropdownMenuItem(value: 'Card', child: Text('Card')),
                          DropdownMenuItem(value: 'Bank Transfer', child: Text('Bank')),
                        ],
                        onChanged: (val) {
                          if (val != null) setModalState(() => paymentMethod = val);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: paidCtrl,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Advance / Paid Amount (₹)',
                    hintText: 'Leave empty for full price',
                    prefixIcon: const Icon(Icons.payment_rounded),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.heroDark,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () async {
                    final name = nameCtrl.text.trim();
                    final phone = phoneCtrl.text.trim();
                    final item = itemCtrl.text.trim();
                    final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                    final qty = int.tryParse(qtyCtrl.text.trim()) ?? 1;
                    final total = price * qty;
                    final paid = double.tryParse(paidCtrl.text.trim()) ?? (paymentStatus == 'paid' ? total : 0.0);

                    if (name.isEmpty || item.isEmpty || price <= 0) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter customer name, item and valid price')),
                      );
                      return;
                    }

                    final newInv = await context.read<InvoicesProvider>().createInvoice({
                      'customer': {
                        'name': name,
                        'phone': phone,
                      },
                      'items': [
                        {
                          'name': item,
                          'price': price,
                          'quantity': qty,
                        }
                      ],
                      'paymentStatus': paymentStatus,
                      'paymentMethod': paymentMethod,
                      'paidAmount': paid,
                    });

                    if (ctx.mounted) Navigator.pop(ctx);
                    if (mounted && newInv != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Invoice #${newInv.invoiceNumber} created and synced!'),
                          backgroundColor: AppColors.forestGreen,
                        ),
                      );
                    }
                  },
                  child: const Text('Generate & Record Invoice', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _confirmDeleteInvoice(Invoice inv) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Invoice?'),
        content: Text('Are you sure you want to delete invoice #${inv.invoiceNumber}? This will also reverse any associated ledger entry.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final ok = await context.read<InvoicesProvider>().deleteInvoice(inv.id);
      if (mounted && ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invoice deleted successfully'), backgroundColor: AppColors.forestGreen),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<InvoicesProvider>();
    final invoices = prov.filteredInvoices;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.heroDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Invoice', style: TextStyle(fontWeight: FontWeight.w800)),
        onPressed: _showCreateInvoiceModal,
      ),
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
                      ? ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: const [
                            SizedBox(height: 120),
                            Center(child: Text('No matching invoices found.')),
                          ],
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: invoices.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (ctx, idx) {
                            final inv = invoices[idx];
                            return _InvoiceCard(
                              invoice: inv,
                              onWhatsApp: () => _shareWhatsApp(inv),
                              onMarkPaid: () async {
                                final ok = await context.read<InvoicesProvider>().markInvoicePaid(inv.id);
                                if (ctx.mounted && ok) {
                                  ScaffoldMessenger.of(ctx).showSnackBar(
                                    SnackBar(
                                      content: Text('Invoice #${inv.invoiceNumber} marked as PAID!'),
                                      backgroundColor: AppColors.forestGreen,
                                    ),
                                  );
                                }
                              },
                              onDelete: () => _confirmDeleteInvoice(inv),
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
  final VoidCallback onMarkPaid;
  final VoidCallback onDelete;

  const _InvoiceCard({
    required this.invoice,
    required this.onWhatsApp,
    required this.onMarkPaid,
    required this.onDelete,
  });

  Color _getStatusColor() {
    if (invoice.status == 'cancelled') return AppColors.textMuted;
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
                          invoice.status == 'cancelled' ? 'CANCELLED' : invoice.paymentStatus.toUpperCase(),
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
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (invoice.paymentStatus != 'paid' && invoice.status != 'cancelled') ...[
                      GestureDetector(
                        onTap: onMarkPaid,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.heroDark,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle_outline_rounded, size: 12, color: Colors.white),
                              SizedBox(width: 3),
                              Text(
                                'Mark Paid',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                    ],
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
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: onDelete,
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.delete_outline_rounded, size: 14, color: AppColors.danger),
                      ),
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
