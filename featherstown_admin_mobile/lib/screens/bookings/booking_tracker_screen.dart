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

  void _showUpdateModal(BirdBookingItem item) {
    String currentStatus = item.status;
    final ringCtrl = TextEditingController(text: item.birdBooking?.ringNumber ?? '');
    final stageCtrl = TextEditingController(text: item.birdBooking?.weaningStage ?? 'Fully Weaned & Flight Ready');

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
              Text('Update Booking • ${item.birdName}', style: Theme.of(ctx).textTheme.titleLarge),
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
                onPressed: () async {
                  final prov = context.read<BookingsProvider>();
                  final ok = await prov.updateBooking(item.invoiceId, {
                    'status': currentStatus,
                    'ringNumber': ringCtrl.text.trim(),
                    'weaningStage': stageCtrl.text.trim(),
                  });
                  if (ctx.mounted) Navigator.pop(ctx);
                  if (mounted && ok) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Bird booking updated successfully!')),
                    );
                  }
                },
                child: const Text('Save Changes'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<BookingsProvider>();
    final bookings = prov.filteredBookings;

    return Scaffold(
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
                          padding: const EdgeInsets.all(16),
                          itemCount: bookings.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (ctx, idx) {
                            final b = bookings[idx];
                            return _BookingCard(
                              booking: b,
                              onTapUpdate: () => _showUpdateModal(b),
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

class _BookingCard extends StatelessWidget {
  final BirdBookingItem booking;
  final VoidCallback onTapUpdate;

  const _BookingCard({required this.booking, required this.onTapUpdate});

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
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    booking.birdName,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.primary),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _getStatusColor().withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    booking.status.replaceAll('_', ' ').toUpperCase(),
                    style: TextStyle(
                      color: _getStatusColor(),
                      fontWeight: FontWeight.w800,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                if (booking.birdBooking?.ringNumber != null) ...[
                  const Icon(Icons.tag_rounded, size: 14, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    'Ring: ${booking.birdBooking!.ringNumber}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(width: 12),
                ],
                const Icon(Icons.badge_outlined, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  'DNA: ${booking.birdBooking?.dnaSex ?? "Pending"}',
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'Customer: ${booking.customer?['name'] ?? "—"} (${booking.customer?['phone'] ?? ""})',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Deposit: ${AppFormatters.currency(booking.amount)}',
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                OutlinedButton.icon(
                  onPressed: onTapUpdate,
                  icon: const Icon(Icons.edit_outlined, size: 14),
                  label: const Text('Update'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
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
