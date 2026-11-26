import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/transaction_model.dart';
import '../../providers/transactions_provider.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransactionsProvider>().fetchTransactions();
    });
  }

  void _showAddTransactionModal() {
    String type = 'expense';
    String category = 'Feed & Nutrition';
    final amtCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final refCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
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
                    const Text('Record Ledger Entry', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 16),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'expense', label: Text('Expense (-Out)')),
                    ButtonSegment(value: 'income', label: Text('Income (+In)')),
                  ],
                  selected: {type},
                  onSelectionChanged: (set) {
                    setModalState(() {
                      type = set.first;
                      if (type == 'expense') {
                        category = 'Feed & Nutrition';
                      } else {
                        category = 'Sales';
                      }
                    });
                  },
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: amtCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Amount (₹) *', prefixIcon: Icon(Icons.currency_rupee_rounded)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description *', prefixIcon: Icon(Icons.description_outlined)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: refCtrl,
                  decoration: const InputDecoration(labelText: 'Reference / UTR (Optional)', prefixIcon: Icon(Icons.tag_rounded)),
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
                    final amt = double.tryParse(amtCtrl.text.trim());
                    if (amt == null || amt <= 0 || descCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter valid amount and description')),
                      );
                      return;
                    }
                    final prov = context.read<TransactionsProvider>();
                    final ok = await prov.createTransaction({
                      'type': type,
                      'category': category,
                      'amount': amt,
                      'description': descCtrl.text.trim(),
                      'reference': refCtrl.text.trim(),
                      'paymentMethod': 'UPI',
                      'date': DateTime.now().toIso8601String(),
                    });
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (mounted && ok) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Financial entry recorded in ledger!'), backgroundColor: AppColors.forestGreen),
                      );
                    }
                  },
                  child: const Text('Record Transaction', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEditTransactionModal(LedgerTransaction t) {
    String type = t.type;
    final amtCtrl = TextEditingController(text: t.amount.toString());
    final descCtrl = TextEditingController(text: t.description);
    final refCtrl = TextEditingController(text: t.reference);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
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
                    const Text('Edit Ledger Entry', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 16),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'expense', label: Text('Expense (-Out)')),
                    ButtonSegment(value: 'income', label: Text('Income (+In)')),
                  ],
                  selected: {type},
                  onSelectionChanged: (set) => setModalState(() => type = set.first),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: amtCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Amount (₹) *', prefixIcon: Icon(Icons.currency_rupee_rounded)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description *', prefixIcon: Icon(Icons.description_outlined)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: refCtrl,
                  decoration: const InputDecoration(labelText: 'Reference / UTR', prefixIcon: Icon(Icons.tag_rounded)),
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
                    final amt = double.tryParse(amtCtrl.text.trim());
                    if (amt == null || amt <= 0 || descCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter valid amount and description')),
                      );
                      return;
                    }
                    final ok = await context.read<TransactionsProvider>().updateTransaction(t.id, {
                      'type': type,
                      'amount': amt,
                      'description': descCtrl.text.trim(),
                      'reference': refCtrl.text.trim(),
                    });
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (mounted && ok) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Transaction updated!'), backgroundColor: AppColors.forestGreen),
                      );
                    }
                  },
                  child: const Text('Update Entry', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.danger,
                    side: const BorderSide(color: AppColors.danger),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.delete_outline_rounded, size: 18),
                  label: const Text('Delete Entry'),
                  onPressed: () {
                    Navigator.pop(ctx);
                    _showDeleteTransactionConfirmation(t);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showDeleteTransactionConfirmation(LedgerTransaction t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Ledger Entry?'),
        content: Text('Are you sure you want to delete ${t.description} (${AppFormatters.currency(t.amount)}) from the ledger?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await context.read<TransactionsProvider>().deleteTransaction(t.id);
              if (mounted && ok) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Transaction deleted')),
                );
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<TransactionsProvider>();
    final txns = prov.filteredTransactions;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddTransactionModal,
        backgroundColor: AppColors.heroDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Record Entry', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          // Cash flow summary card
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.heroDark,
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.heroDark.withValues(alpha: 0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Text('Total Net Balance', style: TextStyle(color: Color(0xFFBACEC0), fontSize: 12.5, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Text(
                    AppFormatters.currency(prov.netBalance),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Text('Total Income', style: TextStyle(color: Color(0xFFBACEC0), fontSize: 11)),
                          const SizedBox(height: 3),
                          Text(
                            AppFormatters.currency(prov.totalInflow),
                            style: const TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w800, fontSize: 15),
                          ),
                        ],
                      ),
                      Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.15)),
                      Column(
                        children: [
                          const Text('Total Expenses', style: TextStyle(color: Color(0xFFBACEC0), fontSize: 11)),
                          const SizedBox(height: 3),
                          Text(
                            AppFormatters.currency(prov.totalOutflow),
                            style: const TextStyle(color: Color(0xFFF87171), fontWeight: FontWeight.w800, fontSize: 15),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Type Filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildTypeChip(prov, 'all', 'All Entries'),
                const SizedBox(width: 8),
                _buildTypeChip(prov, 'income', 'Receipts (+In)'),
                const SizedBox(width: 8),
                _buildTypeChip(prov, 'expense', 'Expenses (-Out)'),
              ],
            ),
          ),
          const SizedBox(height: 10),

          Expanded(
            child: RefreshIndicator(
              onRefresh: () => prov.fetchTransactions(refresh: true),
              color: AppColors.primary,
              child: prov.isLoading && txns.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : txns.isEmpty
                      ? const Center(child: Text('No transactions recorded yet.'))
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                          itemCount: txns.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 10),
                          itemBuilder: (ctx, idx) {
                            final t = txns[idx];
                            return _TransactionTile(
                              transaction: t,
                              onTap: () => _showEditTransactionModal(t),
                              onDelete: () => _showDeleteTransactionConfirmation(t),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeChip(TransactionsProvider prov, String id, String label) {
    final isSelected = prov.typeFilter == id;
    return GestureDetector(
      onTap: () => prov.setTypeFilter(id),
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

class _TransactionTile extends StatelessWidget {
  final LedgerTransaction transaction;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _TransactionTile({
    required this.transaction,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.type == 'income';

    return Card(
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.cardBorder, width: 0.8),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: isIncome ? AppColors.successWash : AppColors.dangerWash,
                child: Icon(
                  isIncome ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                  color: isIncome ? AppColors.success : AppColors.danger,
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      transaction.description,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${transaction.category} • ${AppFormatters.date(transaction.date)}',
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${isIncome ? '+' : '-'}${AppFormatters.currency(transaction.amount)}',
                    style: TextStyle(
                      color: isIncome ? AppColors.success : AppColors.danger,
                      fontWeight: FontWeight.w800,
                      fontSize: 14.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.edit_outlined, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: onDelete,
                        child: const Icon(Icons.delete_outline_rounded, size: 15, color: AppColors.danger),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
