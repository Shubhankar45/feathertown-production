import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/bird_model.dart';
import '../../providers/birds_provider.dart';
import '../media/media_uploader_sheet.dart';

class BirdsScreen extends StatefulWidget {
  const BirdsScreen({super.key});

  @override
  State<BirdsScreen> createState() => _BirdsScreenState();
}

class _BirdsScreenState extends State<BirdsScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BirdsProvider>().fetchBirds();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _showAddBirdModal() {
    final nameCtrl = TextEditingController();
    final speciesCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final ringCtrl = TextEditingController();
    String selectedStatus = 'available';
    String selectedDna = 'Male';
    String? imageUrl;

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
                        'Add Companion Bird',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.heroDark),
                      ),
                      IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Image Selector Banner
                  InkWell(
                    onTap: () async {
                      final url = await MediaUploaderSheet.show(ctx);
                      if (url != null) {
                        setModalState(() => imageUrl = url);
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: AppColors.canvasLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE5E2DC)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: imageUrl != null
                          ? Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.network(imageUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => Image.asset('assets/images/macaw.png')),
                                Positioned(
                                  right: 8,
                                  top: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.6), borderRadius: BorderRadius.circular(12)),
                                    child: const Text('Change Photo', style: TextStyle(color: Colors.white, fontSize: 11)),
                                  ),
                                ),
                              ],
                            )
                          : const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_a_photo_outlined, size: 30, color: AppColors.heroDark),
                                SizedBox(height: 6),
                                Text('Tap to Upload Bird Photo', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                              ],
                            ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Bird Name / Ring Label',
                      hintText: 'e.g. Scarlet Macaw Junior',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: speciesCtrl,
                    decoration: InputDecoration(
                      labelText: 'Species / Breed',
                      hintText: 'e.g. Blue and Gold Macaw',
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
                          controller: priceCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Price (₹)',
                            prefixText: '₹ ',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: ringCtrl,
                          decoration: InputDecoration(
                            labelText: 'Leg Ring #',
                            hintText: 'FT-2026-99',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // DNA Sexing & Status Row
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: selectedDna,
                          decoration: InputDecoration(
                            labelText: 'DNA Sexing',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'Male', child: Text('Male ♂')),
                            DropdownMenuItem(value: 'Female', child: Text('Female ♀')),
                            DropdownMenuItem(value: 'Pending', child: Text('Pending DNA')),
                          ],
                          onChanged: (val) => setModalState(() => selectedDna = val ?? 'Male'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: selectedStatus,
                          decoration: InputDecoration(
                            labelText: 'Status',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'available', child: Text('Available')),
                            DropdownMenuItem(value: 'reserved', child: Text('Reserved')),
                            DropdownMenuItem(value: 'sold', child: Text('Sold')),
                          ],
                          onChanged: (val) => setModalState(() => selectedStatus = val ?? 'available'),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () async {
                      final name = nameCtrl.text.trim();
                      final species = speciesCtrl.text.trim();
                      final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                      if (name.isEmpty || species.isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please fill name and species')));
                        return;
                      }

                      final success = await context.read<BirdsProvider>().addBird({
                        'name': name,
                        'species': species,
                        'price': price.toStringAsFixed(0),
                        'category': 'Birds',
                        'status': selectedStatus,
                        'dnaSex': selectedDna,
                        'ringNumber': ringCtrl.text.trim(),
                        'image': imageUrl ?? 'https://feathertown.online/assets/hero-birds-companion.jpg',
                      });

                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                      }
                      if (mounted && success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Companion bird added to live database!'), backgroundColor: AppColors.forestGreen),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.heroDark,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('Save Companion Bird', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showEditBirdModal(BirdModel bird) {
    final nameCtrl = TextEditingController(text: bird.name);
    final speciesCtrl = TextEditingController(text: bird.species);
    final priceCtrl = TextEditingController(text: bird.price.toStringAsFixed(0));
    final ringCtrl = TextEditingController(text: bird.ringNumber ?? '');
    final descCtrl = TextEditingController(text: bird.description ?? '');
    String selectedStatus = bird.status.toLowerCase();
    if (selectedStatus != 'available' && selectedStatus != 'reserved' && selectedStatus != 'sold') {
      selectedStatus = 'available';
    }
    String selectedDna = bird.dnaSex ?? 'Male';
    String? imageUrl = bird.image;

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
                      Text(
                        'Edit ${bird.name}',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.heroDark),
                      ),
                      IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Image Selector Banner
                  InkWell(
                    onTap: () async {
                      final url = await MediaUploaderSheet.show(ctx);
                      if (url != null) {
                        setModalState(() => imageUrl = url);
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 130,
                      decoration: BoxDecoration(
                        color: AppColors.canvasLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE5E2DC)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: imageUrl != null && imageUrl!.isNotEmpty
                          ? Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.network(
                                  imageUrl!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => Image.asset('assets/images/macaw.png', fit: BoxFit.contain),
                                ),
                                Positioned(
                                  right: 8,
                                  top: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.65), borderRadius: BorderRadius.circular(12)),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.camera_alt_outlined, size: 14, color: Colors.white),
                                        SizedBox(width: 4),
                                        Text('Change Photo', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            )
                          : const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_a_photo_outlined, size: 30, color: AppColors.heroDark),
                                SizedBox(height: 6),
                                Text('Tap to Upload Real Bird Photo', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                              ],
                            ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Bird Name / Ring Label',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: speciesCtrl,
                    decoration: InputDecoration(
                      labelText: 'Species / Breed',
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
                          controller: priceCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Price (₹)',
                            prefixText: '₹ ',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: ringCtrl,
                          decoration: InputDecoration(
                            labelText: 'Leg Ring #',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // DNA Sexing & Status Row
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: selectedDna,
                          decoration: InputDecoration(
                            labelText: 'DNA Sexing',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'Male', child: Text('Male ♂')),
                            DropdownMenuItem(value: 'Female', child: Text('Female ♀')),
                            DropdownMenuItem(value: 'Pending', child: Text('Pending DNA')),
                          ],
                          onChanged: (val) => setModalState(() => selectedDna = val ?? 'Male'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          initialValue: selectedStatus,
                          decoration: InputDecoration(
                            labelText: 'Status',
                            filled: true,
                            fillColor: AppColors.canvasLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'available', child: Text('Available')),
                            DropdownMenuItem(value: 'reserved', child: Text('Reserved')),
                            DropdownMenuItem(value: 'sold', child: Text('Sold')),
                          ],
                          onChanged: (val) => setModalState(() => selectedStatus = val ?? 'available'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      labelText: 'Health & Temperament Notes',
                      hintText: 'e.g. Hand-fed, very cuddly, closed rung, vaccinated',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),

                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () async {
                      final name = nameCtrl.text.trim();
                      final species = speciesCtrl.text.trim();
                      final price = double.tryParse(priceCtrl.text.trim()) ?? bird.price;
                      if (name.isEmpty || species.isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please fill name and species')));
                        return;
                      }

                      final Map<String, dynamic> updatePayload = {
                        'name': name,
                        'species': species,
                        'price': price.toStringAsFixed(0),
                        'category': 'Birds',
                        'status': selectedStatus,
                        'dnaSex': selectedDna,
                        'ringNumber': ringCtrl.text.trim(),
                        'description': descCtrl.text.trim(),
                      };
                      if (imageUrl != null) {
                        updatePayload['image'] = imageUrl;
                        updatePayload['images'] = [imageUrl];
                      }

                      final success = await context.read<BirdsProvider>().updateBird(bird.id, updatePayload);

                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                      }
                      if (mounted && success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Bird updated successfully!'), backgroundColor: AppColors.forestGreen),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.heroDark,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('Save Changes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showStatusUpdateSheet(BirdModel bird) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Manage ${bird.name}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
            const SizedBox(height: 14),
            ListTile(
              leading: const Icon(Icons.edit_note_rounded, color: AppColors.heroDark, size: 26),
              title: const Text('Edit Bird Details & Photo', style: TextStyle(fontWeight: FontWeight.w700)),
              subtitle: const Text('Change photo, price, breed, DNA, or notes'),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                Navigator.pop(ctx);
                _showEditBirdModal(bird);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.check_circle_outline_rounded, color: AppColors.success),
              title: const Text('Mark Available'),
              onTap: () {
                context.read<BirdsProvider>().updateBirdStatus(bird.id, 'available');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.bookmark_border_rounded, color: AppColors.accent),
              title: const Text('Mark Reserved'),
              onTap: () {
                context.read<BirdsProvider>().updateBirdStatus(bird.id, 'reserved');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.done_all_rounded, color: Colors.grey),
              title: const Text('Mark Sold'),
              onTap: () {
                context.read<BirdsProvider>().updateBirdStatus(bird.id, 'sold');
                Navigator.pop(ctx);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.delete_outline_rounded, color: AppColors.danger),
              title: const Text('Remove from Aviary Record', style: TextStyle(color: AppColors.danger)),
              onTap: () async {
                final confirm = await showDialog<bool>(
                  context: ctx,
                  builder: (dCtx) => AlertDialog(
                    title: const Text('Delete Bird Record?'),
                    content: Text('Are you sure you want to remove ${bird.name}?'),
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
                if (confirm == true) {
                  if (ctx.mounted) {
                    Navigator.pop(ctx);
                  }
                  if (mounted) {
                    context.read<BirdsProvider>().deleteBird(bird.id);
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<BirdsProvider>();

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        title: const Text('Avian Inventory', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => prov.fetchBirds(refresh: true),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddBirdModal,
        backgroundColor: AppColors.heroDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Bird'),
      ),
      body: Column(
        children: [
          // Search & Filter Box
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: prov.setSearchQuery,
                  decoration: InputDecoration(
                    hintText: 'Search birds, species, ring #...',
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textSecondary),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () {
                              _searchCtrl.clear();
                              prov.setSearchQuery('');
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),

                // Status Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('All (${prov.totalCount})', 'all', prov),
                      const SizedBox(width: 8),
                      _buildFilterChip('Available (${prov.availableCount})', 'available', prov),
                      const SizedBox(width: 8),
                      _buildFilterChip('Reserved (${prov.reservedCount})', 'reserved', prov),
                      const SizedBox(width: 8),
                      _buildFilterChip('Sold (${prov.soldCount})', 'sold', prov),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bird List
          Expanded(
            child: prov.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : prov.birds.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Image.asset('assets/images/macaw.png', height: 90),
                            const SizedBox(height: 14),
                            const Text(
                              'No companion birds match filter',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Tap "+ Add Bird" to register a new companion avian',
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => prov.fetchBirds(refresh: true),
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 18, right: 18, top: 6, bottom: 84),
                          itemCount: prov.birds.length,
                          itemBuilder: (ctx, i) {
                            final bird = prov.birds[i];
                            return _buildBirdCard(bird);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String status, BirdsProvider prov) {
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

  Widget _buildBirdCard(BirdModel bird) {
    Color statusBg;
    Color statusColor;
    String statusLabel = bird.status.toUpperCase();

    switch (bird.status.toLowerCase()) {
      case 'available':
        statusBg = AppColors.pastelMint;
        statusColor = AppColors.success;
        break;
      case 'reserved':
        statusBg = AppColors.pastelPeach;
        statusColor = AppColors.accent;
        break;
      case 'sold':
      default:
        statusBg = Colors.grey.shade200;
        statusColor = Colors.grey.shade700;
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      elevation: 0,
      color: AppColors.white,
      child: InkWell(
        onTap: () => _showStatusUpdateSheet(bird),
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Bird Photo Thumbnail
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.canvasLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                clipBehavior: Clip.antiAlias,
                child: bird.image != null && bird.image!.isNotEmpty
                    ? Image.network(
                        bird.image!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Image.asset('assets/images/macaw.png', fit: BoxFit.contain),
                      )
                    : Image.asset('assets/images/macaw.png', fit: BoxFit.contain),
              ),
              const SizedBox(width: 14),

              // Bird Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            bird.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.textPrimary),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(6)),
                          child: Text(
                            statusLabel,
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      bird.species,
                      style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 8),

                    // Price & Badges
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          AppFormatters.currency(bird.price),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.heroDark),
                        ),
                        Row(
                          children: [
                            if (bird.ringNumber != null && bird.ringNumber!.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                margin: const EdgeInsets.only(right: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.canvasLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  bird.ringNumber!,
                                  style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                                ),
                              ),
                            if (bird.dnaSex != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: bird.dnaSex?.toLowerCase() == 'male' ? const Color(0xFFEDF4FC) : const Color(0xFFFAF0EB),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  bird.dnaSex == 'Male' ? '♂ M' : '♀ F',
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                    color: bird.dnaSex == 'Male' ? const Color(0xFF2563EB) : const Color(0xFFD9381E),
                                  ),
                                ),
                              ),
                            const SizedBox(width: 6),
                            InkWell(
                              onTap: () => _showEditBirdModal(bird),
                              borderRadius: BorderRadius.circular(6),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.canvasLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.edit_outlined, size: 12, color: AppColors.heroDark),
                                    SizedBox(width: 3),
                                    Text('Edit', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.heroDark)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
