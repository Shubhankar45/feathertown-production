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
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Record Ledger Entry', style: Theme.of(ctx).textTheme.titleLarge),
              const SizedBox(height: 16),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'expense', label: Text('Expense')),
                  ButtonSegment(value: 'income', label: Text('Income')),
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
                decoration: const InputDecoration(labelText: 'Amount (₹) *'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descCtrl,
                decoration: const InputDecoration(labelText: 'Description *'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: refCtrl,
                decoration: const InputDecoration(labelText: 'Reference / UTR (Optional)'),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
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
                      const SnackBar(content: Text('Financial entry recorded in ledger!')),
                    );
                  }
                },
                child: const Text('Record Transaction'),
              ),
            ],
          ),
        ),
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
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Record Entry'),
      ),
      body: Column(
        children: [
          // Cash flow summary card
          Padding(
            padding: const EdgeInsets.all(16),
            child: Card(
              color: AppColors.primary,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text('Net Cash Flow', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(
                      AppFormatters.currency(prov.netBalance),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            const Text('Total Inflow', style: TextStyle(color: Colors.white70, fontSize: 11)),
                            Text(
                              AppFormatters.currency(prov.totalInflow),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                          ],
                        ),
                        Container(width: 1, height: 24, color: Colors.white24),
                        Column(
                          children: [
                            const Text('Total Outflow', style: TextStyle(color: Colors.white70, fontSize: 11)),
                            Text(
                              AppFormatters.currency(prov.totalOutflow),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
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
                            return _TransactionTile(transaction: t);
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
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textPrimary,
        fontWeight: FontWeight.w600,
        fontSize: 12,
      ),
      onSelected: (_) => prov.setTypeFilter(id),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  final LedgerTransaction transaction;

  const _TransactionTile({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.type == 'income';

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isIncome ? AppColors.successWash : AppColors.dangerWash,
          child: Icon(
            isIncome ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
            color: isIncome ? AppColors.success : AppColors.danger,
            size: 20,
          ),
        ),
        title: Text(
          transaction.description,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5),
        ),
        subtitle: Text(
          '${transaction.category} • ${AppFormatters.date(transaction.date)}',
          style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
        ),
        trailing: Text(
          '${isIncome ? '+' : '-'}${AppFormatters.currency(transaction.amount)}',
          style: TextStyle(
            color: isIncome ? AppColors.success : AppColors.danger,
            fontWeight: FontWeight.w800,
            fontSize: 14.5,
          ),
        ),
      ),
    );
  }
}
