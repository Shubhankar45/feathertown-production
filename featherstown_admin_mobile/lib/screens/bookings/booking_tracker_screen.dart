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
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Soft Tinted Icon Badge (Matching Reference Screen 6 "Bill Tracker")
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
            // Middle Content
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
            // Right Side Amount & Status Pill
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  AppFormatters.currency(booking.amount),
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                const SizedBox(height: 4),
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
              ],
            ),
          ],
        ),
      ),
    );
  }
}
