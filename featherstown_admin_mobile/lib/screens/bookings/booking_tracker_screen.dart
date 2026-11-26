import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/booking_model.dart';
import '../../providers/bookings_provider.dart';

class BookingTrackerScreen extends StatefulWidget {
  const BookingTrackerScreen({super.key});

  @override
  State<BookingTrackerScreen> createState() => _BookingTrackerScreenState();
}

class _BookingTrackerScreenState extends State<BookingTrackerScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingsProvider>().fetchBookings();
    });
  }

  void _showAddBookingModal() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final birdCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final depositCtrl = TextEditingController();
    final dateCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('New Bird Reservation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: birdCtrl,
                decoration: const InputDecoration(labelText: 'Companion Bird Species *', prefixIcon: Icon(Icons.flutter_dash_outlined)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'Patron / Customer Name *', prefixIcon: Icon(Icons.person_outline)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone Number *', prefixIcon: Icon(Icons.phone_outlined)),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: priceCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Total Price (₹) *'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: depositCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Deposit Paid (₹)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: dateCtrl,
                decoration: const InputDecoration(labelText: 'Expected Handover Date (e.g. 15 Dec 2026)', prefixIcon: Icon(Icons.calendar_month_outlined)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesCtrl,
                decoration: const InputDecoration(labelText: 'Special Requests / Aviary Notes', prefixIcon: Icon(Icons.note_alt_outlined)),
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
                  final bird = birdCtrl.text.trim();
                  final name = nameCtrl.text.trim();
                  final phone = phoneCtrl.text.trim();
                  final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                  final deposit = double.tryParse(depositCtrl.text.trim()) ?? 0.0;

                  if (bird.isEmpty || name.isEmpty || price <= 0) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter bird name, customer name, and valid price')),
                    );
                    return;
                  }

                  final ok = await context.read<BookingsProvider>().createBooking({
                    'birdName': bird,
                    'customerName': name,
                    'customerPhone': phone,
                    'totalAmount': price,
                    'depositPaid': deposit,
                    'expectedDeliveryDate': dateCtrl.text.trim(),
                    'notes': notesCtrl.text.trim(),
                    'bookingStatus': 'reserved',
                  });
                  if (ctx.mounted) Navigator.pop(ctx);
                  if (mounted && ok) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Bird reservation created!'), backgroundColor: AppColors.forestGreen),
                    );
                  }
                },
                child: const Text('Create Reservation', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showUpdateModal(BirdBookingItem item) {
    String currentStatus = item.status;
    final ringCtrl = TextEditingController(text: item.birdBooking?.ringNumber ?? '');
    final stageCtrl = TextEditingController(text: item.birdBooking?.weaningStage ?? 'Fully Weaned & Flight Ready');

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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Update • ${item.birdName}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: currentStatus,
                decoration: const InputDecoration(labelText: 'Handover Status'),
                items: const [
                  DropdownMenuItem(value: 'reserved', child: Text('Active Reservation')),
                  DropdownMenuItem(value: 'health_certified', child: Text('Health Certified')),
                  DropdownMenuItem(value: 'ready_for_handover', child: Text('Ready for Handover')),
                  DropdownMenuItem(value: 'completed', child: Text('Handover Completed')),
                  DropdownMenuItem(value: 'cancelled', child: Text('Cancelled')),
                ],
                onChanged: (val) {
                  if (val != null) setModalState(() => currentStatus = val);
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: ringCtrl,
                decoration: const InputDecoration(labelText: 'Closed Ring #'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: stageCtrl,
                decoration: const InputDecoration(labelText: 'Weaning Stage'),
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
                  final prov = context.read<BookingsProvider>();
                  final ok = await prov.updateBooking(item.id, {
                    'status': currentStatus,
                    'ringNumber': ringCtrl.text.trim(),
                    'weaningStage': stageCtrl.text.trim(),
                  });
                  if (ctx.mounted) Navigator.pop(ctx);
                  if (mounted && ok) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Bird booking updated successfully!'), backgroundColor: AppColors.forestGreen),
                    );
                  }
                },
                child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
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
                label: const Text('Delete Reservation'),
                onPressed: () {
                  Navigator.pop(ctx);
                  _showDeleteBookingConfirmation(item);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDeleteBookingConfirmation(BirdBookingItem item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Reservation?'),
        content: Text('Are you sure you want to permanently delete the reservation for ${item.birdName} (${item.invoiceNumber})?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            onPressed: () async {
              Navigator.pop(ctx);
              final ok = await context.read<BookingsProvider>().deleteBooking(item.id);
              if (mounted && ok) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Reservation deleted')),
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
    final prov = context.watch<BookingsProvider>();
    final bookings = prov.filteredBookings;

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddBookingModal,
        backgroundColor: AppColors.heroDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Reservation', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          // Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                _buildStatusChip(prov, 'all', 'All Bookings'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'reserved', 'Reserved'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'health_certified', 'Certified'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'ready_for_handover', 'Ready for Handover'),
                const SizedBox(width: 6),
                _buildStatusChip(prov, 'completed', 'Completed'),
              ],
            ),
          ),
          const Divider(height: 1),

          Expanded(
            child: RefreshIndicator(
              onRefresh: () => prov.fetchBookings(refresh: true),
              color: AppColors.primary,
              child: prov.isLoading && bookings.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : bookings.isEmpty
                      ? const Center(child: Text('No bird bookings found in this status.'))
                      : ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                          itemCount: bookings.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (ctx, idx) {
                            final b = bookings[idx];
                            return _BookingCard(
                              booking: b,
                              onTapUpdate: () => _showUpdateModal(b),
                              onDelete: () => _showDeleteBookingConfirmation(b),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(BookingsProvider prov, String id, String label) {
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

class _BookingCard extends StatelessWidget {
  final BirdBookingItem booking;
  final VoidCallback onTapUpdate;
  final VoidCallback onDelete;

  const _BookingCard({
    required this.booking,
    required this.onTapUpdate,
    required this.onDelete,
  });

  Color _getStatusColor() {
    switch (booking.status) {
      case 'reserved':
        return AppColors.warning;
      case 'health_certified':
        return AppColors.info;
      case 'ready_for_handover':
        return AppColors.success;
      case 'completed':
        return AppColors.primary;
      default:
        return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.cardBorder, width: 0.8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: booking.status == 'ready_for_handover' ? AppColors.pastelMint : AppColors.pastelPeach,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                Icons.flutter_dash_rounded,
                size: 22,
                color: booking.status == 'ready_for_handover' ? AppColors.catCockatiel : AppColors.catMacaw,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    booking.birdName,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Ring: ${booking.birdBooking?.ringNumber ?? "Pending"} • ${booking.customer?['name'] ?? "Patron"}',
                    style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'DNA: ${booking.birdBooking?.dnaSex ?? "Pending"} • Stage: ${booking.birdBooking?.weaningStage ?? "Weaning"}',
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  AppFormatters.currency(booking.amount),
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    GestureDetector(
                      onTap: onTapUpdate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _getStatusColor().withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              booking.status.replaceAll('_', ' ').toUpperCase(),
                              style: TextStyle(
                                color: _getStatusColor(),
                                fontWeight: FontWeight.w800,
                                fontSize: 9.5,
                              ),
                            ),
                            const SizedBox(width: 2),
                            Icon(Icons.edit, size: 10, color: _getStatusColor()),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    InkWell(
                      onTap: onDelete,
                      borderRadius: BorderRadius.circular(12),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
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
