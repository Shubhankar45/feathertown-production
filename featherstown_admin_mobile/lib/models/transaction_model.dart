class LedgerTransaction {
  final String id;
  final String transactionId;
  final String type; // 'income' | 'expense' | 'refund'
  final String category;
  final double amount;
  final String paymentMethod;
  final String description;
  final String reference;
  final String? customerOrPayee;
  final String? invoiceId;
  final DateTime date;

  LedgerTransaction({
    required this.id,
    required this.transactionId,
    required this.type,
    required this.category,
    required this.amount,
    required this.paymentMethod,
    required this.description,
    required this.reference,
    this.customerOrPayee,
    this.invoiceId,
    required this.date,
  });

  factory LedgerTransaction.fromJson(Map<String, dynamic> json) {
    DateTime dt;
    try {
      final raw = json['date'] ?? json['createdAt'];
      dt = raw != null ? DateTime.parse(raw.toString()) : DateTime.now();
    } catch (_) {
      dt = DateTime.now();
    }

    return LedgerTransaction(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      transactionId: json['transactionId']?.toString() ?? 'TXN',
      type: json['type']?.toString().toLowerCase() ?? 'expense',
      category: json['category']?.toString() ?? 'General',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      paymentMethod: json['paymentMethod']?.toString() ?? 'UPI',
      description: json['description']?.toString() ?? '',
      reference: json['reference']?.toString() ?? '',
      customerOrPayee: json['customerOrPayee']?.toString(),
      invoiceId: json['invoiceId']?.toString(),
      date: dt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'category': category,
      'amount': amount,
      'paymentMethod': paymentMethod,
      'description': description,
      'reference': reference,
      'customerOrPayee': customerOrPayee,
      'date': date.toIso8601String(),
    };
  }
}
