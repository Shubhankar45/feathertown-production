import 'package:flutter/material.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/api_service.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  bool _isLoading = true;
  List<dynamic> _reviews = [];
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.get(ApiEndpoints.reviews);
      if (res is List) {
        setState(() => _reviews = res);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load reviews: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      await ApiService.put('${ApiEndpoints.reviews}/$id', body: {'status': status});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Review marked as $status!'), backgroundColor: AppColors.forestGreen),
        );
      }
      _loadReviews();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error updating review: $e')));
      }
    }
  }

  Future<void> _deleteReview(String id) async {
    try {
      await ApiService.delete('${ApiEndpoints.reviews}/$id');
      setState(() => _reviews.removeWhere((r) => r['_id'] == id || r['id'] == id));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Review deleted')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showAddReviewModal() {
    final nameCtrl = TextEditingController();
    final productCtrl = TextEditingController();
    final titleCtrl = TextEditingController();
    final commentCtrl = TextEditingController();
    final locationCtrl = TextEditingController();
    int rating = 5;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalCtx, setModalState) => Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Add Customer Review', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameCtrl,
                  decoration: InputDecoration(
                    labelText: 'Customer Name *',
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: productCtrl,
                  decoration: InputDecoration(
                    labelText: 'Product / Bird Breed *',
                    hintText: 'e.g. Sun Conure',
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Text('Rating:', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                    const SizedBox(width: 8),
                    ...List.generate(5, (index) => GestureDetector(
                      onTap: () => setModalState(() => rating = index + 1),
                      child: Icon(
                        index < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                        color: const Color(0xFFF4B400),
                        size: 28,
                      ),
                    )),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: titleCtrl,
                  decoration: InputDecoration(
                    labelText: 'Review Headline',
                    hintText: 'e.g. Healthy & very energetic bird!',
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: commentCtrl,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Detailed Experience *',
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: locationCtrl,
                  decoration: InputDecoration(
                    labelText: 'City / Location',
                    hintText: 'e.g. Bengaluru, Karnataka',
                    filled: true,
                    fillColor: AppColors.canvasLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    if (nameCtrl.text.trim().isEmpty || commentCtrl.text.trim().isEmpty) {
                      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Please fill required fields')));
                      return;
                    }
                    try {
                      await ApiService.post(ApiEndpoints.reviews, body: {
                        'name': nameCtrl.text.trim(),
                        'productOrBreed': productCtrl.text.trim(),
                        'rating': rating,
                        'title': titleCtrl.text.trim(),
                        'comment': commentCtrl.text.trim(),
                        'location': locationCtrl.text.trim(),
                        'status': 'approved',
                        'isVerified': true,
                      });
                      if (ctx.mounted) Navigator.pop(ctx);
                      _loadReviews();
                    } catch (e) {
                      if (ctx.mounted) ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Error: $e')));
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.heroDark,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Publish Review', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _reviews.where((r) {
      if (_filter == 'all') return true;
      final st = (r['status'] ?? 'approved').toString().toLowerCase();
      return st == _filter;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.canvasLight,
      appBar: AppBar(
        title: const Text('Customer Reviews', style: TextStyle(fontWeight: FontWeight.w800)),
        backgroundColor: AppColors.canvasLight,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Add Review',
            icon: const Icon(Icons.add_comment_rounded),
            onPressed: _showAddReviewModal,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.forestGreen))
          : Column(
              children: [
                // Filter Tabs
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      _buildChip('all', 'All (${_reviews.length})'),
                      const SizedBox(width: 8),
                      _buildChip('approved', 'Approved'),
                      const SizedBox(width: 8),
                      _buildChip('pending', 'Pending Moderation'),
                    ],
                  ),
                ),

                Expanded(
                  child: filtered.isEmpty
                      ? const Center(child: Text('No reviews found', style: TextStyle(color: AppColors.textSecondary)))
                      : RefreshIndicator(
                          onRefresh: _loadReviews,
                          color: AppColors.forestGreen,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            itemCount: filtered.length,
                            itemBuilder: (ctx, i) {
                              final rev = filtered[i];
                              final id = rev['_id'] ?? rev['id'];
                              final name = rev['name'] ?? 'Patron';
                              final rating = (rev['rating'] ?? 5) as int;
                              final title = rev['title'] ?? '';
                              final comment = rev['comment'] ?? '';
                              final product = rev['productOrBreed'] ?? '';
                              final status = (rev['status'] ?? 'approved').toString().toLowerCase();

                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: AppColors.cardBorderLight),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Text(name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14.5)),
                                            const SizedBox(width: 6),
                                            const Icon(Icons.verified_rounded, size: 16, color: AppColors.forestGreen),
                                          ],
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: status == 'approved' ? AppColors.pastelMint : AppColors.pastelYellow,
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            status.toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: status == 'approved' ? AppColors.catCockatiel : AppColors.catConure,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        ...List.generate(5, (idx) => Icon(
                                          idx < rating ? Icons.star_rounded : Icons.star_outline_rounded,
                                          size: 16,
                                          color: const Color(0xFFF4B400),
                                        )),
                                        if (product.isNotEmpty) ...[
                                          const SizedBox(width: 8),
                                          Text('• $product', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                                        ],
                                      ],
                                    ),
                                    if (title.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13.5)),
                                    ],
                                    const SizedBox(height: 4),
                                    Text(comment, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary, height: 1.35)),
                                    const SizedBox(height: 10),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        if (status != 'approved')
                                          TextButton.icon(
                                            icon: const Icon(Icons.check_rounded, size: 16, color: AppColors.forestGreen),
                                            label: const Text('Approve', style: TextStyle(color: AppColors.forestGreen, fontWeight: FontWeight.bold, fontSize: 12)),
                                            onPressed: () => _updateStatus(id, 'approved'),
                                          ),
                                        if (status == 'approved')
                                          TextButton.icon(
                                            icon: const Icon(Icons.pause_circle_outline_rounded, size: 16, color: AppColors.accent),
                                            label: const Text('Unpublish', style: TextStyle(color: AppColors.accent, fontSize: 12)),
                                            onPressed: () => _updateStatus(id, 'pending'),
                                          ),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.textSecondary),
                                          onPressed: () => _deleteReview(id),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildChip(String key, String label) {
    final active = _filter == key;
    return ChoiceChip(
      label: Text(label),
      selected: active,
      selectedColor: AppColors.heroDark,
      labelStyle: TextStyle(
        color: active ? Colors.white : AppColors.textPrimary,
        fontWeight: FontWeight.w600,
        fontSize: 12,
      ),
      onSelected: (_) => setState(() => _filter = key),
    );
  }
}
