import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/order_model.dart';
import '../../providers/orders_provider.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrdersProvider>().fetchOrders();
    });
  }

  void _showStatusPicker(StoreOrder order) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Update Order #${order.displayOrderNumber}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            ListTile(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              tileColor: const Color(0xFFF0FDF4),
              leading: const Icon(Icons.local_shipping_rounded, color: Color(0xFF166534)),
              title: const Text('Live Logistics & Courier Tracking', style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF166534))),
              subtitle: Text(
                order.courierCarrier != null ? '${order.courierCarrier} • ${order.trackingNumber ?? "No AWB"}' : 'Assign carrier & AWB tracking number',
                style: const TextStyle(fontSize: 12, color: Color(0xFF166534)),
              ),
              onTap: () {
                Navigator.pop(ctx);
                _showTrackingModal(order);
              },
            ),
            const Divider(height: 20),
            ListTile(
              leading: const Icon(Icons.hourglass_empty_rounded, color: AppColors.accent),
              title: const Text('Pending Payment / Review'),
              onTap: () {
                context.read<OrdersProvider>().updateOrderStatus(order.id, 'pending');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.check_circle_outline_rounded, color: AppColors.primary),
              title: const Text('Confirmed & Packing'),
              onTap: () {
                context.read<OrdersProvider>().updateOrderStatus(order.id, 'confirmed');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.local_shipping_outlined, color: Color(0xFF2563EB)),
              title: const Text('Shipped via Courier'),
              onTap: () {
                context.read<OrdersProvider>().updateOrderStatus(order.id, 'shipped');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.done_all_rounded, color: AppColors.success),
              title: const Text('Delivered to Customer'),
              onTap: () {
                context.read<OrdersProvider>().updateOrderStatus(order.id, 'delivered');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.cancel_outlined, color: AppColors.danger),
              title: const Text('Cancelled', style: TextStyle(color: AppColors.danger)),
              onTap: () {
                context.read<OrdersProvider>().updateOrderStatus(order.id, 'cancelled');
                Navigator.pop(ctx);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.delete_outline_rounded, color: AppColors.danger),
              title: const Text('Delete Order', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700)),
              onTap: () async {
                Navigator.pop(ctx);
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (dCtx) => AlertDialog(
                    title: const Text('Delete Order?'),
                    content: const Text('Are you sure you want to permanently remove this order?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(dCtx, false), child: const Text('Cancel')),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(dCtx, true),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                        child: const Text('Delete'),
                      ),
                    ],
                  ),
                );
                if (confirm == true && mounted) {
                  final ok = await context.read<OrdersProvider>().deleteOrder(order.id);
                  if (mounted && ok) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Order deleted successfully!'), backgroundColor: AppColors.forestGreen),
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showTrackingModal(StoreOrder order) {
    final courierCtrl = TextEditingController(text: order.courierCarrier ?? 'Delhivery');
    final awbCtrl = TextEditingController(text: order.trackingNumber ?? '');
    final urlCtrl = TextEditingController(text: order.trackingUrl ?? '');
    final estCtrl = TextEditingController(text: order.estimatedDelivery ?? '3 - 5 Days');
    final notesCtrl = TextEditingController();
    String selectedStatus = order.trackingStatus.toLowerCase();
    if (!['confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].contains(selectedStatus)) {
      selectedStatus = 'shipped';
    }

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
                    Text('Logistics • Order #${order.displayOrderNumber}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: courierCtrl,
                  decoration: InputDecoration(
                    labelText: 'Courier Partner',
                    hintText: 'Delhivery, BlueDart, DTDC, India Post',
                    prefixIcon: const Icon(Icons.local_shipping_outlined),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: awbCtrl,
                  decoration: InputDecoration(
                    labelText: 'AWB / Tracking Number',
                    hintText: 'e.g. DELH192837465',
                    prefixIcon: const Icon(Icons.tag_rounded),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: urlCtrl,
                  keyboardType: TextInputType.url,
                  decoration: InputDecoration(
                    labelText: 'Courier Tracking Link (Optional)',
                    hintText: 'https://track.delhivery.com/...',
                    prefixIcon: const Icon(Icons.link_rounded),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: estCtrl,
                        decoration: InputDecoration(
                          labelText: 'Estimated Delivery',
                          hintText: '3 - 5 Days',
                          prefixIcon: const Icon(Icons.calendar_today_outlined),
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: selectedStatus,
                        decoration: InputDecoration(
                          labelText: 'Live Status',
                          filled: true,
                          fillColor: AppColors.canvasLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                        ),
                        items: const [
                          DropdownMenuItem(value: 'confirmed', child: Text('Confirmed')),
                          DropdownMenuItem(value: 'shipped', child: Text('Dispatched')),
                          DropdownMenuItem(value: 'out_for_delivery', child: Text('Out for Del.')),
                          DropdownMenuItem(value: 'delivered', child: Text('Delivered')),
                        ],
                        onChanged: (val) {
                          if (val != null) setModalState(() => selectedStatus = val);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: notesCtrl,
                  decoration: InputDecoration(
                    labelText: 'Transit Location / Update Note',
                    hintText: 'e.g. Out of regional sorting facility',
                    prefixIcon: const Icon(Icons.edit_note_rounded),
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF166534),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () async {
                    final courier = courierCtrl.text.trim();
                    final awb = awbCtrl.text.trim();
                    if (courier.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter courier name')));
                      return;
                    }
                    final ok = await context.read<OrdersProvider>().updateOrderTracking(
                      order.id,
                      courier: courier,
                      trackingNumber: awb,
                      trackingUrl: urlCtrl.text.trim(),
                      estimatedDelivery: estCtrl.text.trim(),
                      status: selectedStatus,
                      notes: notesCtrl.text.trim(),
                    );
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (mounted && ok) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Tracking & carrier details updated!'), backgroundColor: AppColors.forestGreen),
                      );
                    }
                  },
                  child: const Text('Update Live Tracking', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showCreateOrderModal() {
    final customerCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final itemCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String selectedStatus = 'confirmed';
    String paymentMethod = 'UPI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) {
          final bottomInset = MediaQuery.of(ctx).viewInsets.bottom;

          return Container(
            decoration: const BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            padding: EdgeInsets.only(left: 20, right: 20, top: 16, bottom: bottomInset + 24),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(99)),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Create New Order / Sale',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.heroDark),
                      ),
                      IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  TextField(
                    controller: customerCtrl,
                    decoration: InputDecoration(
                      labelText: 'Customer Name',
                      hintText: 'e.g. Rahul Sharma',
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
                      labelText: 'Phone Number',
                      hintText: 'e.g. 9876543210',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: itemCtrl,
                    decoration: InputDecoration(
                      labelText: 'Ordered Item(s)',
                      hintText: 'e.g. 1x Sun Conure or 2x Deluxe Aviary Cage',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: amountCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Amount (₹)',
                            prefixText: '₹ ',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: paymentMethod,
                          decoration: InputDecoration(
                            labelText: 'Payment',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'UPI', child: Text('UPI / GPay')),
                            DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                            DropdownMenuItem(value: 'Card', child: Text('Card')),
                            DropdownMenuItem(value: 'COD', child: Text('COD')),
                          ],
                          onChanged: (val) => setModalState(() => paymentMethod = val ?? 'UPI'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: selectedStatus,
                    decoration: InputDecoration(
                      labelText: 'Order Status',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'confirmed', child: Text('Confirmed & Ready')),
                      DropdownMenuItem(value: 'pending', child: Text('Pending Payment')),
                      DropdownMenuItem(value: 'shipped', child: Text('Shipped')),
                      DropdownMenuItem(value: 'delivered', child: Text('Delivered')),
                    ],
                    onChanged: (val) => setModalState(() => selectedStatus = val ?? 'confirmed'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesCtrl,
                    decoration: InputDecoration(
                      labelText: 'Delivery Address / Notes',
                      hintText: 'e.g. Local pickup at aviary or delivery city',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),

                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () async {
                      final cName = customerCtrl.text.trim();
                      final item = itemCtrl.text.trim();
                      final amt = double.tryParse(amountCtrl.text.trim()) ?? 0.0;
                      if (cName.isEmpty || amt <= 0) {
                        ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please enter customer name and valid amount')));
                        return;
                      }

                      final success = await context.read<OrdersProvider>().createOrder({
                        'customerName': cName,
                        'customerPhone': phoneCtrl.text.trim(),
                        'shippingAddress': notesCtrl.text.trim(),
                        'amount': amt,
                        'totalAmount': amt,
                        'orderItems': [
                          {'name': item.isEmpty ? 'Custom Order' : item, 'quantity': 1, 'price': amt}
                        ],
                        'paymentMethod': paymentMethod,
                        'orderStatus': selectedStatus,
                        'status': selectedStatus,
                        'notes': notesCtrl.text.trim(),
                      });

                      if (ctx.mounted) Navigator.pop(ctx);
                      if (mounted && success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Order created successfully!'), backgroundColor: AppColors.forestGreen),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.heroDark,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('Save Order', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<OrdersProvider>();

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        title: const Text('Store Orders', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, size: 28),
            tooltip: 'Add Order',
            onPressed: _showCreateOrderModal,
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => prov.fetchOrders(refresh: true),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.heroDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('New Order', style: TextStyle(fontWeight: FontWeight.w800)),
        onPressed: _showCreateOrderModal,
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Row(
              children: [
                _buildStatusChip('All', 'all', prov),
                const SizedBox(width: 8),
                _buildStatusChip('Pending (${prov.pendingCount})', 'pending', prov),
                const SizedBox(width: 8),
                _buildStatusChip('Confirmed (${prov.confirmedCount})', 'confirmed', prov),
                const SizedBox(width: 8),
                _buildStatusChip('Shipped (${prov.shippedCount})', 'shipped', prov),
                const SizedBox(width: 8),
                _buildStatusChip('Delivered (${prov.deliveredCount})', 'delivered', prov),
              ],
            ),
          ),

          // Orders List
          Expanded(
            child: prov.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : prov.orders.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.shopping_bag_outlined, size: 64, color: AppColors.textSecondary),
                            const SizedBox(height: 14),
                            const Text('No orders found', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                            const SizedBox(height: 4),
                            Text(
                              prov.selectedStatus == 'all' ? 'Customers haven\'t placed any orders yet' : 'No ${prov.selectedStatus} orders at the moment',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => prov.fetchOrders(refresh: true),
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 18, right: 18, top: 4, bottom: 40),
                          itemCount: prov.orders.length,
                          itemBuilder: (ctx, i) {
                            final order = prov.orders[i];
                            return _buildOrderCard(order);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String label, String status, OrdersProvider prov) {
    final isSelected = prov.selectedStatus == status;
    return InkWell(
      onTap: () => prov.setSelectedStatus(status),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.heroDark : AppColors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.heroDark : const Color(0xFFE5E2DC)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard(StoreOrder order) {
    Color statusBg;
    Color statusColor;

    switch (order.orderStatus.toLowerCase()) {
      case 'delivered':
        statusBg = AppColors.pastelMint;
        statusColor = AppColors.success;
        break;
      case 'shipped':
        statusBg = const Color(0xFFEDF4FC);
        statusColor = const Color(0xFF2563EB);
        break;
      case 'confirmed':
        statusBg = AppColors.pastelLavender;
        statusColor = const Color(0xFF7C3AED);
        break;
      case 'cancelled':
        statusBg = const Color(0xFFFDE8E8);
        statusColor = AppColors.danger;
        break;
      case 'pending':
      default:
        statusBg = AppColors.pastelPeach;
        statusColor = AppColors.accent;
        break;
    }

    final itemsSummary = order.items.isNotEmpty
        ? order.items.map((i) => '${i.quantity}x ${i.name}').join(', ')
        : 'Store Order';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      elevation: 0,
      color: AppColors.white,
      child: InkWell(
        onTap: () => _showStatusPicker(order),
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Order #${order.displayOrderNumber}',
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppColors.heroDark),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(6)),
                    child: Text(
                      order.orderStatus.toUpperCase(),
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                order.shippingAddress?['name']?.toString() ??
                    order.shippingAddress?['fullName']?.toString() ??
                    order.userEmail ??
                    'Guest Customer',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 4),
              Text(
                itemsSummary,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              if (order.courierCarrier != null && order.courierCarrier!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFBBF7D0)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.local_shipping_outlined, size: 14, color: Color(0xFF166534)),
                      const SizedBox(width: 6),
                      Text(
                        '${order.courierCarrier}${order.trackingNumber != null && order.trackingNumber!.isNotEmpty ? " • ${order.trackingNumber}" : ""}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF166534)),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.cardBorder),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    AppFormatters.date(order.createdAt),
                    style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                  ),
                  Text(
                    AppFormatters.currency(order.amount),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.heroDark),
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
