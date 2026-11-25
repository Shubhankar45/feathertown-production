import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../models/accessory_model.dart';
import '../../providers/accessories_provider.dart';
import '../../providers/ai_provider.dart';
import '../media/media_uploader_sheet.dart';

class AccessoriesScreen extends StatefulWidget {
  const AccessoriesScreen({super.key});

  @override
  State<AccessoriesScreen> createState() => _AccessoriesScreenState();
}

class _AccessoriesScreenState extends State<AccessoriesScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AccessoriesProvider>().fetchAccessories();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _showAddAccessoryModal() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final stockCtrl = TextEditingController(text: '10');
    final descCtrl = TextEditingController();
    String selectedCategory = 'Cages & Housing';
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
                        'Add Aviary Product',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.heroDark),
                      ),
                      IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Image Upload Area
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
                                Image.network(imageUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const Icon(Icons.inventory_2_outlined, size: 40)),
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
                                Icon(Icons.add_photo_alternate_outlined, size: 30, color: AppColors.heroDark),
                                SizedBox(height: 6),
                                Text('Tap to Upload Product Photo', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                              ],
                            ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Product Name',
                      hintText: 'e.g. Stainless Steel Parrot Cage',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: selectedCategory,
                    decoration: InputDecoration(
                      labelText: 'Category',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'Cages & Housing', child: Text('Cages & Housing')),
                      DropdownMenuItem(value: 'Feed & Nutrition', child: Text('Feed & Nutrition')),
                      DropdownMenuItem(value: 'Toys & Enrichment', child: Text('Toys & Enrichment')),
                      DropdownMenuItem(value: 'Health & Supplements', child: Text('Health & Supplements')),
                      DropdownMenuItem(value: 'Accessories', child: Text('Accessories')),
                    ],
                    onChanged: (val) => setModalState(() => selectedCategory = val ?? 'Accessories'),
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
                          controller: stockCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Initial Stock',
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Description', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      TextButton.icon(
                        onPressed: () async {
                          final name = nameCtrl.text.trim();
                          if (name.isEmpty) {
                            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please enter product name first')));
                            return;
                          }
                          final price = double.tryParse(priceCtrl.text.trim());
                          final res = await context.read<AiProvider>().generateProductDescription(
                                name: name,
                                category: selectedCategory,
                                price: price,
                              );
                          if (!ctx.mounted) return;
                          if (res != null && res['description'] != null) {
                            descCtrl.text = res['description'];
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(content: Text('AI Generated Product Description!'), backgroundColor: AppColors.forestGreen),
                            );
                          }
                        },
                        icon: const Icon(Icons.auto_awesome_rounded, size: 16, color: AppColors.forestGreen),
                        label: const Text('AI Write', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.forestGreen, fontSize: 12)),
                      ),
                    ],
                  ),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      labelText: 'Description (optional)',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () async {
                      final name = nameCtrl.text.trim();
                      final price = double.tryParse(priceCtrl.text.trim()) ?? 0.0;
                      final stock = int.tryParse(stockCtrl.text.trim()) ?? 0;
                      if (name.isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please enter product name')));
                        return;
                      }

                      final success = await context.read<AccessoriesProvider>().addAccessory({
                        'name': name,
                        'category': selectedCategory,
                        'price': price,
                        'stock': stock,
                        'description': descCtrl.text.trim(),
                        'image': imageUrl ?? '',
                      });

                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                      }
                      if (mounted && success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Product added to catalog!'), backgroundColor: AppColors.forestGreen),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.heroDark,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('Add to Stock', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _showEditAccessoryModal(AccessoryModel item) {
    final nameCtrl = TextEditingController(text: item.name);
    final priceCtrl = TextEditingController(text: item.price.toStringAsFixed(0));
    final stockCtrl = TextEditingController(text: item.stock.toString());
    final descCtrl = TextEditingController(text: item.description ?? '');
    String selectedCategory = item.category;
    final validCategories = ['Cages & Housing', 'Feed & Nutrition', 'Toys & Enrichment', 'Health & Supplements'];
    if (!validCategories.contains(selectedCategory)) {
      selectedCategory = 'Cages & Housing';
    }
    String? imageUrl = item.image;

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
                      Expanded(
                        child: Text(
                          'Edit ${item.name}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.heroDark),
                        ),
                      ),
                      IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Image Selector
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
                      child: imageUrl != null && imageUrl!.isNotEmpty
                          ? Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.network(
                                  imageUrl!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => const Icon(Icons.inventory_2_outlined, size: 40, color: AppColors.primary),
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
                                Text('Tap to Upload Product Photo', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                              ],
                            ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  TextField(
                    controller: nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Product Name',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 12),

                  DropdownButtonFormField<String>(
                    initialValue: selectedCategory,
                    decoration: InputDecoration(
                      labelText: 'Category',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                    items: validCategories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (val) => setModalState(() => selectedCategory = val ?? 'Cages & Housing'),
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
                          controller: stockCtrl,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: 'Current Stock',
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Description & Specs', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      TextButton.icon(
                        onPressed: () async {
                          final name = nameCtrl.text.trim();
                          if (name.isEmpty) {
                            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please enter product name first')));
                            return;
                          }
                          final price = double.tryParse(priceCtrl.text.trim());
                          final res = await context.read<AiProvider>().generateProductDescription(
                                name: name,
                                category: selectedCategory,
                                price: price,
                              );
                          if (!ctx.mounted) return;
                          if (res != null && res['description'] != null) {
                            descCtrl.text = res['description'];
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(content: Text('AI Generated Product Description!'), backgroundColor: AppColors.forestGreen),
                            );
                          }
                        },
                        icon: const Icon(Icons.auto_awesome_rounded, size: 16, color: AppColors.forestGreen),
                        label: const Text('AI Write', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.forestGreen, fontSize: 12)),
                      ),
                    ],
                  ),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      labelText: 'Product Description & Specs',
                      filled: true,
                      fillColor: AppColors.canvasLight,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),

                  const SizedBox(height: 24),
                  Row(
                    children: [
                      IconButton(
                        tooltip: 'Delete Product',
                        icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger),
                        onPressed: () async {
                          final confirm = await showDialog<bool>(
                            context: ctx,
                            builder: (dCtx) => AlertDialog(
                              title: const Text('Delete Product?'),
                              content: Text('Are you sure you want to delete ${item.name}?'),
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
                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted) context.read<AccessoriesProvider>().deleteAccessory(item.id);
                          }
                        },
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () async {
                            final name = nameCtrl.text.trim();
                            final price = double.tryParse(priceCtrl.text.trim()) ?? item.price;
                            final stock = int.tryParse(stockCtrl.text.trim()) ?? item.stock;
                            if (name.isEmpty) {
                              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please enter product name')));
                              return;
                            }

                            final Map<String, dynamic> updatePayload = {
                              'name': name,
                              'category': selectedCategory,
                              'price': price,
                              'stock': stock,
                              'description': descCtrl.text.trim(),
                            };
                            if (imageUrl != null) {
                              updatePayload['image'] = imageUrl;
                            }

                            final success = await context.read<AccessoriesProvider>().updateAccessory(item.id, updatePayload);

                            if (ctx.mounted) Navigator.pop(ctx);
                            if (mounted && success) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Product updated successfully!'), backgroundColor: AppColors.forestGreen),
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
                      ),
                    ],
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
    final prov = context.watch<AccessoriesProvider>();

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        title: const Text('Cages & Feed Stock', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => prov.fetchAccessories(refresh: true),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddAccessoryModal,
        backgroundColor: AppColors.heroDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Product'),
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
                    hintText: 'Search products, feed, cages...',
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

                // Category Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildCatChip('All', prov),
                      const SizedBox(width: 8),
                      _buildCatChip('Cages & Housing', prov),
                      const SizedBox(width: 8),
                      _buildCatChip('Feed & Nutrition', prov),
                      const SizedBox(width: 8),
                      _buildCatChip('Toys & Enrichment', prov),
                      const SizedBox(width: 8),
                      _buildCatChip('Health & Supplements', prov),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Items List
          Expanded(
            child: prov.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : prov.items.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inventory_2_outlined, size: 64, color: AppColors.textSecondary),
                            const SizedBox(height: 14),
                            const Text('No products found', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                            const SizedBox(height: 4),
                            const Text('Tap "+ Add Product" to create a new aviary inventory item', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => prov.fetchAccessories(refresh: true),
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(left: 18, right: 18, top: 6, bottom: 84),
                          itemCount: prov.items.length,
                          itemBuilder: (ctx, i) {
                            final item = prov.items[i];
                            return _buildItemCard(item, prov);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildCatChip(String cat, AccessoriesProvider prov) {
    final isSelected = prov.selectedCategory == cat;
    return InkWell(
      onTap: () => prov.setSelectedCategory(cat),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.heroDark : AppColors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.heroDark : const Color(0xFFE5E2DC)),
        ),
        child: Text(
          cat,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildItemCard(AccessoryModel item, AccessoriesProvider prov) {
    final isLowStock = item.stock > 0 && item.stock <= 5;
    final isOut = item.stock <= 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
      elevation: 0,
      color: AppColors.white,
      child: InkWell(
        onTap: () => _showEditAccessoryModal(item),
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                color: AppColors.canvasLight,
                borderRadius: BorderRadius.circular(16),
              ),
              clipBehavior: Clip.antiAlias,
              child: item.image != null && item.image!.isNotEmpty
                  ? Image.network(
                      item.image!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const Icon(Icons.inventory_2_outlined, color: AppColors.primary, size: 30),
                    )
                  : const Icon(Icons.inventory_2_outlined, color: AppColors.primary, size: 30),
            ),
            const SizedBox(width: 14),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5, color: AppColors.textPrimary),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: isOut ? const Color(0xFFFDE8E8) : (isLowStock ? AppColors.pastelPeach : AppColors.pastelMint),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isOut ? 'OUT' : (isLowStock ? 'LOW (${item.stock})' : '${item.stock} in stock'),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: isOut ? AppColors.danger : (isLowStock ? AppColors.accent : AppColors.success),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.category,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 8),

                  // Price & Rapid Stock Stepper
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        AppFormatters.currency(item.price),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.heroDark),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => _showEditAccessoryModal(item),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                              margin: const EdgeInsets.only(right: 6),
                              decoration: BoxDecoration(
                                color: AppColors.canvasLight,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFE5E2DC)),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.edit_outlined, size: 14, color: AppColors.heroDark),
                                  SizedBox(width: 4),
                                  Text('Edit', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.heroDark)),
                                ],
                              ),
                            ),
                          ),
                          // Stock Stepper (+ / -)
                          Container(
                            decoration: BoxDecoration(
                              color: AppColors.canvasLight,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE5E2DC)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.remove_rounded, size: 16),
                                  padding: const EdgeInsets.all(4),
                                  constraints: const BoxConstraints(),
                                  onPressed: item.stock > 0 ? () => prov.updateStock(item.id, item.stock - 1) : null,
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  child: Text('${item.stock}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.add_rounded, size: 16),
                                  padding: const EdgeInsets.all(4),
                                  constraints: const BoxConstraints(),
                                  onPressed: () => prov.updateStock(item.id, item.stock + 1),
                                ),
                              ],
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
