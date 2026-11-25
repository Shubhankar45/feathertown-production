import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../providers/transactions_provider.dart';
import '../../providers/dashboard_provider.dart';

class QuickRecordModal extends StatefulWidget {
  final String? initialType;
  const QuickRecordModal({super.key, this.initialType});

  static Future<void> show(BuildContext context, {String? initialType}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => QuickRecordModal(initialType: initialType),
    );
  }

  @override
  State<QuickRecordModal> createState() => _QuickRecordModalState();
}

class _QuickRecordModalState extends State<QuickRecordModal> {
  final _amountCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();

  late String _type; // 'expense' | 'income'
  late String _category;
  String _paymentMethod = 'UPI';
  DateTime _date = DateTime.now();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _type = widget.initialType == 'income' ? 'income' : 'expense';
    _category = _type == 'income' ? 'Companion Bird Sale' : 'Feed & Nutrition';
  }

  final List<Map<String, dynamic>> _expenseCategories = [
    {'name': 'Feed & Nutrition', 'icon': Icons.grain_rounded, 'color': AppColors.catCockatiel, 'bg': AppColors.pastelMint},
    {'name': 'Veterinary & Healthcare', 'icon': Icons.medical_services_rounded, 'color': AppColors.catMacaw, 'bg': AppColors.pastelPeach},
    {'name': 'Aviary Utilities', 'icon': Icons.bolt_rounded, 'color': AppColors.catConure, 'bg': AppColors.pastelYellow},
    {'name': 'Inventory Restock', 'icon': Icons.inventory_2_rounded, 'color': AppColors.catBudgie, 'bg': AppColors.pastelBlue},
    {'name': 'Logistics & Transport', 'icon': Icons.local_shipping_rounded, 'color': AppColors.lavenderText, 'bg': AppColors.pastelLavender},
    {'name': 'Aviary Maintenance', 'icon': Icons.build_rounded, 'color': AppColors.textSecondary, 'bg': AppColors.canvasLight},
  ];

  final List<Map<String, dynamic>> _incomeCategories = [
    {'name': 'Companion Bird Sale', 'icon': Icons.flutter_dash_rounded, 'color': AppColors.primary, 'bg': AppColors.pastelMint},
    {'name': 'Cage & Housing Sale', 'icon': Icons.home_work_rounded, 'color': AppColors.catBudgie, 'bg': AppColors.pastelBlue},
    {'name': 'Feed & Accessories', 'icon': Icons.shopping_bag_rounded, 'color': AppColors.catConure, 'bg': AppColors.pastelYellow},
    {'name': 'Aviary Consultation', 'icon': Icons.support_agent_rounded, 'color': AppColors.lavenderText, 'bg': AppColors.pastelLavender},
  ];

  @override
  void dispose() {
    _amountCtrl.dispose();
    _descCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final amt = double.tryParse(_amountCtrl.text.replaceAll(',', '').trim()) ?? 0.0;
    if (amt <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }

    final desc = _descCtrl.text.trim().isEmpty ? '$_category entry' : _descCtrl.text.trim();

    setState(() => _isSaving = true);
    final prov = context.read<TransactionsProvider>();

    final ok = await prov.createTransaction({
      'type': _type,
      'category': _category,
      'amount': amt,
      'description': desc,
      'reference': _noteCtrl.text.trim(),
      'paymentMethod': _paymentMethod,
      'date': _date.toIso8601String(),
    });

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (ok) {
      if (context.mounted) {
        context.read<DashboardProvider>().fetchAnalytics(refresh: true);
      }
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${_type == 'income' ? 'Revenue' : 'Expense'} of ${AppFormatters.currency(amt)} saved!'),
          backgroundColor: _type == 'income' ? AppColors.success : AppColors.heroDark,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = _type == 'expense' ? _expenseCategories : _incomeCategories;
    final activeCat = categories.firstWhere(
      (c) => c['name'] == _category,
      orElse: () => categories.first,
    );

    return Container(
      padding: EdgeInsets.only(
        top: 16,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Drag Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.borderLight,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
            ),

            // Top Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                  onPressed: () => Navigator.pop(context),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.oatMilk,
                    padding: const EdgeInsets.all(8),
                  ),
                ),
                Text(
                  _type == 'expense' ? 'Add Expense' : 'Record Inflow',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(width: 40),
              ],
            ),

            const SizedBox(height: 18),

            // Segmented Pill Switcher (Expense / Income)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.oatMilk,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _type = 'expense';
                          _category = _expenseCategories.first['name'];
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _type == 'expense' ? AppColors.heroDark : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Expense',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: _type == 'expense' ? AppColors.white : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _type = 'income';
                          _category = _incomeCategories.first['name'];
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _type == 'income' ? AppColors.heroDark : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          'Inflow / Sale',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: _type == 'income' ? AppColors.white : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Huge Currency Input (Matching Reference Design)
            Center(
              child: IntrinsicWidth(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    const Text(
                      '₹ ',
                      style: TextStyle(
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    ConstrainedBox(
                      constraints: const BoxConstraints(minWidth: 90, maxWidth: 240),
                      child: TextField(
                        controller: _amountCtrl,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        autofocus: true,
                        style: const TextStyle(
                          fontSize: 40,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.5,
                        ),
                        decoration: const InputDecoration(
                          hintText: '0.00',
                          hintStyle: TextStyle(color: AppColors.textMuted),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: EdgeInsets.zero,
                          filled: false,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Category Picker Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.oatMilk,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: activeCat['bg'] as Color,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(activeCat['icon'] as IconData, size: 20, color: activeCat['color'] as Color),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _category,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary),
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          fontFamily: 'Outfit',
                        ),
                        items: categories.map((c) {
                          return DropdownMenuItem<String>(
                            value: c['name'] as String,
                            child: Text(c['name'] as String),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _category = val);
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Description / Purpose Input
            TextField(
              controller: _descCtrl,
              decoration: InputDecoration(
                hintText: _type == 'expense'
                    ? 'e.g. Organic seeds & millet sprays'
                    : 'e.g. Sun Conure chick deposit',
                hintStyle: const TextStyle(fontSize: 13.5, color: AppColors.textMuted),
                prefixIcon: const Icon(Icons.edit_note_rounded, size: 20, color: AppColors.textSecondary),
              ),
            ),

            const SizedBox(height: 12),

            // Date & Payment Method Row
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _date,
                        firstDate: DateTime(2025),
                        lastDate: DateTime.now().add(const Duration(days: 30)),
                      );
                      if (picked != null) setState(() => _date = picked);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: AppColors.oatMilk,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 17, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              AppFormatters.date(_date.toIso8601String()),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.oatMilk,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.cardBorder),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _paymentMethod,
                        isExpanded: true,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFamily: 'Outfit'),
                        items: const [
                          DropdownMenuItem(value: 'UPI', child: Text('UPI / QR')),
                          DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                          DropdownMenuItem(value: 'Bank', child: Text('Bank')),
                          DropdownMenuItem(value: 'Card', child: Text('Card')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _paymentMethod = val);
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Optional Note / Reference
            TextField(
              controller: _noteCtrl,
              decoration: const InputDecoration(
                hintText: 'Add note / transaction reference (optional)',
                hintStyle: TextStyle(fontSize: 13, color: AppColors.textMuted),
                prefixIcon: Icon(Icons.tag_rounded, size: 18, color: AppColors.textSecondary),
              ),
            ),

            const SizedBox(height: 24),

            // Primary Save Button
            ElevatedButton(
              onPressed: _isSaving ? null : _handleSave,
              child: _isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('Save ${_type == 'expense' ? 'Expense' : 'Entry'} in Ledger'),
            ),

            const SizedBox(height: 20),

            // Reference Tip Box (Matching Quick Tip in Reference Screenshot)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.pastelYellow,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFF3E8BA)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.tips_and_updates_outlined, size: 20, color: AppColors.warning),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Quick tip:',
                          style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: Color(0xFF78350F)),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Daily logging of feed, veterinary care, and aviary maintenance maintains your avian health certification warranty.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF92400E), height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
