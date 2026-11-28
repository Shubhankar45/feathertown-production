import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../core/utils/invoice_pdf_generator.dart';
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

  String _formatInvoiceSummary(Invoice inv) {
    final custName = inv.customer['name']?.toString() ?? 'Valued Customer';
    final phone = inv.customer['phone']?.toString() ?? '';
    final itemsList = inv.items.isNotEmpty
        ? inv.items.map((it) => '• ${it.name} (x${it.quantity}) - ${AppFormatters.currency(it.total)}').join('\n')
        : '• ${inv.notes?.isNotEmpty == true ? inv.notes! : "Aviary Supplies & Services"} - ${AppFormatters.currency(inv.grandTotal)}';

    return '🦜 *FEATHERTOWN AVIARY & EXOTIC BIRDS*\n'
        '📜 *OFFICIAL TAX INVOICE*\n'
        '----------------------------------------\n'
        '📋 *Invoice #:* #${inv.invoiceNumber}\n'
        '📅 *Date:* ${AppFormatters.date(inv.createdAt)}\n'
        '👤 *Customer:* $custName\n'
        '${phone.isNotEmpty ? "📞 *Phone:* $phone\n" : ""}'
        '----------------------------------------\n'
        '*ITEMS:*\n'
        '$itemsList\n'
        '----------------------------------------\n'
        '💰 *Subtotal:* ${AppFormatters.currency(inv.subtotal > 0 ? inv.subtotal : inv.grandTotal)}\n'
        '${inv.taxAmount > 0 ? "🏛️ *Tax/GST:* ${AppFormatters.currency(inv.taxAmount)}\n" : ""}'
        '💵 *Grand Total:* ${AppFormatters.currency(inv.grandTotal)}\n'
        '✅ *Amount Paid:* ${AppFormatters.currency(inv.paidAmount)}\n'
        '${inv.balanceDue > 0 ? "⚠️ *Balance Due:* ${AppFormatters.currency(inv.balanceDue)}\n" : ""}'
        '🔖 *Payment Status:* ${inv.paymentStatus.toUpperCase()}\n'
        '💳 *Payment Mode:* ${inv.paymentMethod.toUpperCase()}\n'
        '----------------------------------------\n'
        'Thank you for choosing FeatherTown Aviary! 🦜\n'
        '🌐 https://feathertown.online\n'
        '📞 Support: +91 98765 43210';
  }

  /// Direct Send to customer via WhatsApp or SMS
  void _sendToCustomer(Invoice inv) async {
    final rawPhone = inv.customer['phone']?.toString() ?? '';
    final cleanPhone = rawPhone.replaceAll(RegExp(r'\D'), '');
    final summary = _formatInvoiceSummary(inv);

    if (cleanPhone.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Customer phone not recorded. Opening share sheet...')),
        );
      }
      await Share.share(summary, subject: 'FeatherTown Invoice #${inv.invoiceNumber}');
      return;
    }

    final fullPhone = cleanPhone.length == 10 ? '91$cleanPhone' : cleanPhone;
    final encoded = Uri.encodeComponent(summary);
    final waUrl = Uri.parse('https://wa.me/$fullPhone?text=$encoded');

    try {
      if (await canLaunchUrl(waUrl)) {
        await launchUrl(waUrl, mode: LaunchMode.externalApplication);
      } else {
        final smsUrl = Uri.parse('sms:$fullPhone?body=$encoded');
        if (await canLaunchUrl(smsUrl)) {
          await launchUrl(smsUrl);
        } else {
          await Share.share(summary, subject: 'FeatherTown Invoice #${inv.invoiceNumber}');
        }
      }
    } catch (_) {
      await Share.share(summary, subject: 'FeatherTown Invoice #${inv.invoiceNumber}');
    }
  }

  /// System Share Sheet (WhatsApp, Telegram, Gmail, Bluetooth, Copy)
  void _shareInvoice(Invoice inv) async {
    final summary = _formatInvoiceSummary(inv);
    try {
      await Share.share(
        summary,
        subject: 'FeatherTown Tax Invoice #${inv.invoiceNumber}',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sharing failed: $e')),
        );
      }
    }
  }

  /// Download or Print PDF Tax Invoice
  void _downloadPdf(Invoice inv) async {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              ),
              const SizedBox(width: 10),
              Expanded(child: Text('Opening PDF Tax Invoice for #${inv.invoiceNumber}...')),
            ],
          ),
          duration: const Duration(seconds: 2),
          backgroundColor: AppColors.heroDark,
        ),
      );
    }

    try {
      await InvoicePdfGenerator.downloadOrPrint(inv);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open PDF: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  void _showInvoiceDetailsSheet(Invoice inv) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
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
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Invoice #${inv.invoiceNumber}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.heroDark),
                      ),
                      Text(
                        AppFormatters.date(inv.createdAt),
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),

              // Patron Info Box
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.canvasLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('BILLED PATRON', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
                    const SizedBox(height: 4),
                    Text(inv.customer['name']?.toString() ?? 'Aviary Patron', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.heroDark)),
                    if (inv.customer['phone'] != null) ...[
                      const SizedBox(height: 2),
                      Text('Phone: ${inv.customer['phone']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                    if (inv.customer['email'] != null) ...[
                      const SizedBox(height: 2),
                      Text('Email: ${inv.customer['email']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Items List
              const Text('ITEMS BREAKDOWN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
              const SizedBox(height: 8),
              if (inv.items.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(inv.notes?.isNotEmpty == true ? inv.notes! : 'Aviary bird supplies / services', style: const TextStyle(fontWeight: FontWeight.w600)),
                )
              else
                ...inv.items.map((it) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${it.name} (x${it.quantity})',
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                          ),
                          Text(
                            AppFormatters.currency(it.total),
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                        ],
                      ),
                    )),

              const Divider(height: 24),

              // Totals
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Grand Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.heroDark)),
                  Text(AppFormatters.currency(inv.grandTotal), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.heroDark)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Paid Amount', style: TextStyle(fontSize: 13, color: AppColors.success, fontWeight: FontWeight.w700)),
                  Text(AppFormatters.currency(inv.paidAmount), style: const TextStyle(fontSize: 13, color: AppColors.success, fontWeight: FontWeight.w700)),
                ],
              ),
              if (inv.balanceDue > 0) ...[
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Balance Due', style: TextStyle(fontSize: 13, color: AppColors.danger, fontWeight: FontWeight.w800)),
                    Text(AppFormatters.currency(inv.balanceDue), style: const TextStyle(fontSize: 14, color: AppColors.danger, fontWeight: FontWeight.w900)),
                  ],
                ),
              ],

              const SizedBox(height: 24),

              // Action Buttons in Details Sheet
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF15803D),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.send_rounded, size: 16),
                      label: const Text('Send (WA)', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _sendToCustomer(inv);
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.heroDark,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.download_rounded, size: 16),
                      label: const Text('Download PDF', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _downloadPdf(inv);
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    style: IconButton.styleFrom(
                      backgroundColor: const Color(0xFFF1F5F9),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.all(12),
                    ),
                    icon: const Icon(Icons.share_rounded, size: 20, color: AppColors.heroDark),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _shareInvoice(inv);
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
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
                          DropdownMenuItem(value: 'unpaid', child: Text('Unpaid / Due')),
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
                          DropdownMenuItem(value: 'Card', child: Text('Card / POS')),
                          DropdownMenuItem(value: 'Bank Transfer', child: Text('Bank Transfer')),
                        ],
                        onChanged: (val) {
                          if (val != null) setModalState(() => paymentMethod = val);
                        },
                      ),
                    ),
                  ],
                ),
                if (paymentStatus == 'partial') ...[
                  const SizedBox(height: 12),
                  TextField(
                    controller: paidCtrl,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Advance Paid Amount (₹) *',
                      prefixIcon: const Icon(Icons.currency_rupee_rounded),
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                ],
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
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (ctx, idx) {
                            final inv = invoices[idx];
                            return _InvoiceCard(
                              invoice: inv,
                              onSend: () => _sendToCustomer(inv),
                              onShare: () => _shareInvoice(inv),
                              onDownload: () => _downloadPdf(inv),
                              onTap: () => _showInvoiceDetailsSheet(inv),
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
  final VoidCallback onSend;
  final VoidCallback onShare;
  final VoidCallback onDownload;
  final VoidCallback onMarkPaid;
  final VoidCallback onDelete;
  final VoidCallback onTap;

  const _InvoiceCard({
    required this.invoice,
    required this.onSend,
    required this.onShare,
    required this.onDownload,
    required this.onMarkPaid,
    required this.onDelete,
    required this.onTap,
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
    final hasBalance = invoice.balanceDue > 0 && invoice.paymentStatus != 'paid' && invoice.status != 'cancelled';

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Icon, Invoice Number & Customer, and Grand Total
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: invoice.paymentStatus == 'paid' ? AppColors.pastelMint : AppColors.pastelPeach,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.receipt_long_rounded,
                      size: 20,
                      color: invoice.paymentStatus == 'paid' ? AppColors.catCockatiel : AppColors.catMacaw,
                    ),
                  ),
                  const SizedBox(width: 12),
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
                            const SizedBox(width: 6),
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
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.heroDark),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          '${invoice.customer['phone'] ?? ''} • ${AppFormatters.date(invoice.createdAt)}',
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        AppFormatters.currency(invoice.grandTotal),
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.heroDark),
                      ),
                      if (invoice.balanceDue > 0) ...[
                        const SizedBox(height: 2),
                        Text(
                          'Due: ${AppFormatters.currency(invoice.balanceDue)}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.danger),
                        ),
                      ],
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.cardBorder),
              const SizedBox(height: 10),

              // Bottom Action Bar: Send | Share | Download | Paid | Delete
              Row(
                children: [
                  // 1. Send Button (Direct to customer WhatsApp / SMS)
                  _buildActionButton(
                    label: 'Send',
                    icon: Icons.send_rounded,
                    bgColor: const Color(0xFFDCFCE7),
                    textColor: const Color(0xFF15803D),
                    iconColor: const Color(0xFF15803D),
                    onTap: onSend,
                  ),
                  const SizedBox(width: 6),

                  // 2. Share Button (Native OS share sheet)
                  _buildActionButton(
                    label: 'Share',
                    icon: Icons.share_rounded,
                    bgColor: const Color(0xFFF1F5F9),
                    textColor: const Color(0xFF334155),
                    iconColor: const Color(0xFF334155),
                    onTap: onShare,
                  ),
                  const SizedBox(width: 6),

                  // 3. Download Button (PDF generation & download/print)
                  _buildActionButton(
                    label: 'Download',
                    icon: Icons.download_rounded,
                    bgColor: const Color(0xFFEFF6FF),
                    textColor: const Color(0xFF1D4ED8),
                    iconColor: const Color(0xFF1D4ED8),
                    onTap: onDownload,
                  ),
                  const SizedBox(width: 6),

                  if (hasBalance) ...[
                    _buildActionButton(
                      label: 'Paid',
                      icon: Icons.check_circle_outline_rounded,
                      bgColor: AppColors.heroDark,
                      textColor: Colors.white,
                      iconColor: Colors.white,
                      onTap: onMarkPaid,
                    ),
                  ],

                  const Spacer(),

                  // Delete / Void Icon Button
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: onDelete,
                    child: Container(
                      padding: const EdgeInsets.all(7),
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
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required String label,
    required IconData icon,
    required Color bgColor,
    required Color textColor,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: iconColor),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
