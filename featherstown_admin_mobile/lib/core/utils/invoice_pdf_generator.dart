import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../models/invoice_model.dart';

class InvoicePdfGenerator {
  /// Format currency safely for PDF (using Rs. prefix to ensure 100% font compatibility)
  static String formatCurrency(double amount) {
    final formatter = NumberFormat('#,##,##0.00', 'en_IN');
    return 'Rs. ${formatter.format(amount)}';
  }

  /// Generate the PDF document as raw bytes
  static Future<Uint8List> generatePdfBytes(Invoice inv) async {
    final pdf = pw.Document();

    pw.Font? regularFont;
    pw.Font? boldFont;
    try {
      regularFont = await PdfGoogleFonts.outfitRegular();
      boldFont = await PdfGoogleFonts.outfitBold();
    } catch (_) {
      // Fallback to standard Helvetica if offline
      regularFont = pw.Font.helvetica();
      boldFont = pw.Font.helveticaBold();
    }

    final theme = pw.ThemeData.withFont(
      base: regularFont,
      bold: boldFont,
    );

    final isPaid = inv.paymentStatus.toLowerCase() == 'paid';
    final isPartial = inv.paymentStatus.toLowerCase() == 'partial';
    final statusColor = isPaid
        ? PdfColor.fromHex('15803D')
        : isPartial
            ? PdfColor.fromHex('D97706')
            : PdfColor.fromHex('DC2626');

    final statusBg = isPaid
        ? PdfColor.fromHex('DCFCE7')
        : isPartial
            ? PdfColor.fromHex('FEF3C7')
            : PdfColor.fromHex('FEE2E2');

    final dateStr = DateFormat('dd MMM yyyy, hh:mm a').format(inv.createdAt.toLocal());
    final customerName = inv.customer['name']?.toString() ?? 'Valued Aviary Patron';
    final customerPhone = inv.customer['phone']?.toString() ?? 'N/A';
    final customerEmail = inv.customer['email']?.toString() ?? '—';
    final customerAddress = inv.customer['address']?.toString() ?? 'In-Store / Direct Delivery';

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        theme: theme,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // 1. Top Header Banner
              pw.Container(
                padding: const pw.EdgeInsets.all(16),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('1B3B22'), // FeatherTown Forest Green
                  borderRadius: pw.BorderRadius.circular(8),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: pw.CrossAxisAlignment.center,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'FEATHERTOWN AVIARY',
                          style: pw.TextStyle(
                            color: PdfColors.white,
                            fontSize: 20,
                            fontWeight: pw.FontWeight.bold,
                          ),
                        ),
                        pw.SizedBox(height: 3),
                        pw.Text(
                          'Premium Avian Nursery & Boutique • GST Tax Invoice',
                          style: pw.TextStyle(
                            color: PdfColor.fromHex('A7F3D0'),
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: pw.BoxDecoration(
                        color: statusBg,
                        borderRadius: pw.BorderRadius.circular(20),
                      ),
                      child: pw.Text(
                        inv.status == 'cancelled' ? 'CANCELLED' : inv.paymentStatus.toUpperCase(),
                        style: pw.TextStyle(
                          color: statusColor,
                          fontSize: 11,
                          fontWeight: pw.FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              pw.SizedBox(height: 18),

              // 2. Invoice & Parties Info Grid
              pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  // Aviary Info
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('ISSUED BY:', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.grey700)),
                        pw.SizedBox(height: 4),
                        pw.Text('FeatherTown Aviary & Breeders', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                        pw.Text('Aviary Sanctuary Campus', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                        pw.Text('Bangalore, Karnataka - 560034', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                        pw.Text('Phone: +91 98765 43210', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                        pw.Text('Web: https://feathertown.online', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                      ],
                    ),
                  ),

                  // Customer Info
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('BILLED TO (PATRON):', style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColors.grey700)),
                        pw.SizedBox(height: 4),
                        pw.Text(customerName, style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold)),
                        pw.Text('Phone: $customerPhone', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                        if (customerEmail != '—') pw.Text('Email: $customerEmail', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                        pw.Text('Address: $customerAddress', style: const pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
                      ],
                    ),
                  ),

                  // Invoice Details
                  pw.Container(
                    width: 150,
                    padding: const pw.EdgeInsets.all(10),
                    decoration: pw.BoxDecoration(
                      color: PdfColor.fromHex('F8FAFC'),
                      borderRadius: pw.BorderRadius.circular(6),
                      border: pw.Border.all(color: PdfColor.fromHex('E2E8F0')),
                    ),
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('INVOICE NUMBER', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                        pw.Text('#${inv.invoiceNumber}', style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold, color: PdfColor.fromHex('1B3B22'))),
                        pw.SizedBox(height: 6),
                        pw.Text('DATE & TIME', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                        pw.Text(dateStr, style: const pw.TextStyle(fontSize: 9.5)),
                        pw.SizedBox(height: 6),
                        pw.Text('PAYMENT METHOD', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                        pw.Text(inv.paymentMethod.toUpperCase(), style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),

              pw.SizedBox(height: 20),

              // 3. Line Items Table
              pw.Container(
                decoration: pw.BoxDecoration(
                  border: pw.Border.all(color: PdfColor.fromHex('CBD5E1')),
                  borderRadius: pw.BorderRadius.circular(6),
                ),
                child: pw.Table(
                  columnWidths: const {
                    0: pw.FixedColumnWidth(30),
                    1: pw.FlexColumnWidth(4),
                    2: pw.FlexColumnWidth(1),
                    3: pw.FlexColumnWidth(2),
                    4: pw.FlexColumnWidth(2),
                  },
                  children: [
                    // Table Header
                    pw.TableRow(
                      decoration: pw.BoxDecoration(
                        color: PdfColor.fromHex('F1F5F9'),
                      ),
                      children: [
                        _buildTableHeaderCell('#', align: pw.TextAlign.center),
                        _buildTableHeaderCell('Description / Avian Line Item'),
                        _buildTableHeaderCell('Qty', align: pw.TextAlign.center),
                        _buildTableHeaderCell('Unit Price', align: pw.TextAlign.right),
                        _buildTableHeaderCell('Total', align: pw.TextAlign.right),
                      ],
                    ),
                    // Items Rows
                    if (inv.items.isEmpty)
                      pw.TableRow(
                        children: [
                          _buildTableCell('1', align: pw.TextAlign.center),
                          _buildTableCell(inv.notes?.isNotEmpty == true ? inv.notes! : 'Aviary Services & Bird Supplies'),
                          _buildTableCell('1', align: pw.TextAlign.center),
                          _buildTableCell(formatCurrency(inv.grandTotal), align: pw.TextAlign.right),
                          _buildTableCell(formatCurrency(inv.grandTotal), align: pw.TextAlign.right),
                        ],
                      )
                    else
                      ...List.generate(inv.items.length, (index) {
                        final item = inv.items[index];
                        final isEven = index % 2 == 0;
                        return pw.TableRow(
                          decoration: pw.BoxDecoration(
                            color: isEven ? PdfColors.white : PdfColor.fromHex('F8FAFC'),
                          ),
                          children: [
                            _buildTableCell('${index + 1}', align: pw.TextAlign.center),
                            _buildTableCell(item.name),
                            _buildTableCell('${item.quantity}', align: pw.TextAlign.center),
                            _buildTableCell(formatCurrency(item.rate), align: pw.TextAlign.right),
                            _buildTableCell(formatCurrency(item.total), align: pw.TextAlign.right),
                          ],
                        );
                      }),
                  ],
                ),
              ),

              pw.SizedBox(height: 16),

              // 4. Summary & Payment Breakdown Box
              pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  // Avian Health & Guarantee Note
                  pw.Expanded(
                    flex: 3,
                    child: pw.Container(
                      padding: const pw.EdgeInsets.all(12),
                      decoration: pw.BoxDecoration(
                        color: PdfColor.fromHex('F0FDF4'),
                        borderRadius: pw.BorderRadius.circular(6),
                        border: pw.Border.all(color: PdfColor.fromHex('BBF7D0')),
                      ),
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.start,
                        children: [
                          pw.Text(
                            'Avian Health Certification & Terms',
                            style: pw.TextStyle(
                              fontSize: 9,
                              fontWeight: pw.FontWeight.bold,
                              color: PdfColor.fromHex('166534'),
                            ),
                          ),
                          pw.SizedBox(height: 4),
                          pw.Text(
                            '• All birds are veterinary health checked and closed-band ring registered.\n'
                            '• Ensure clean filtered water, diet transition, and acclimatization.\n'
                            '• Retain this digital tax invoice for avian health warranty & ownership proof.\n'
                            '• In-store POS & Online Orders verified.',
                            style: pw.TextStyle(fontSize: 8.5, color: PdfColor.fromHex('14532D')),
                          ),
                        ],
                      ),
                    ),
                  ),

                  pw.SizedBox(width: 20),

                  // Financial Totals
                  pw.Expanded(
                    flex: 2,
                    child: pw.Column(
                      children: [
                        _buildSummaryRow('Subtotal', formatCurrency(inv.subtotal > 0 ? inv.subtotal : inv.grandTotal)),
                        if (inv.totalDiscount > 0)
                          _buildSummaryRow('Discount', '- ${formatCurrency(inv.totalDiscount)}', isDiscount: true),
                        if (inv.taxAmount > 0)
                          _buildSummaryRow('Taxes / GST', formatCurrency(inv.taxAmount)),
                        pw.Divider(color: PdfColor.fromHex('CBD5E1'), thickness: 1),
                        _buildSummaryRow('Grand Total', formatCurrency(inv.grandTotal), isBold: true, fontSize: 13),
                        _buildSummaryRow('Amount Paid', formatCurrency(inv.paidAmount), color: PdfColor.fromHex('15803D')),
                        if (inv.balanceDue > 0)
                          _buildSummaryRow('Balance Due', formatCurrency(inv.balanceDue), color: PdfColor.fromHex('DC2626'), isBold: true)
                        else
                          _buildSummaryRow('Balance Due', 'Rs. 0.00', color: PdfColor.fromHex('15803D')),
                      ],
                    ),
                  ),
                ],
              ),

              pw.Spacer(),

              // 5. Official Footer
              pw.Divider(color: PdfColor.fromHex('E2E8F0')),
              pw.SizedBox(height: 6),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text(
                    'Computer-generated invoice. Authorized by FeatherTown Aviary Management.',
                    style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
                  ),
                  pw.Text(
                    'feathertown.online • Support: care@feathertown.online',
                    style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildTableHeaderCell(String text, {pw.TextAlign align = pw.TextAlign.left}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: pw.Text(
        text,
        textAlign: align,
        style: pw.TextStyle(
          fontSize: 9,
          fontWeight: pw.FontWeight.bold,
          color: PdfColor.fromHex('334155'),
        ),
      ),
    );
  }

  static pw.Widget _buildTableCell(String text, {pw.TextAlign align = pw.TextAlign.left}) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: pw.Text(
        text,
        textAlign: align,
        style: const pw.TextStyle(
          fontSize: 9,
          color: PdfColors.black,
        ),
      ),
    );
  }

  static pw.Widget _buildSummaryRow(
    String label,
    String value, {
    bool isBold = false,
    bool isDiscount = false,
    double fontSize = 10,
    PdfColor? color,
  }) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 2.5),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: pw.TextStyle(
              fontSize: fontSize,
              fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal,
              color: color ?? PdfColor.fromHex('475569'),
            ),
          ),
          pw.Text(
            value,
            style: pw.TextStyle(
              fontSize: fontSize,
              fontWeight: isBold ? pw.FontWeight.bold : pw.FontWeight.normal,
              color: isDiscount ? PdfColor.fromHex('15803D') : (color ?? PdfColors.black),
            ),
          ),
        ],
      ),
    );
  }

  /// Download or Print PDF via native Android print manager / save dialog
  static Future<void> downloadOrPrint(Invoice inv) async {
    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => generatePdfBytes(inv),
      name: 'FeatherTown_Invoice_${inv.invoiceNumber}.pdf',
    );
  }

  /// Share PDF file directly through the OS share sheet
  static Future<void> sharePdf(Invoice inv) async {
    final bytes = await generatePdfBytes(inv);
    await Printing.sharePdf(
      bytes: bytes,
      filename: 'FeatherTown_Invoice_${inv.invoiceNumber}.pdf',
      subject: 'FeatherTown Tax Invoice #${inv.invoiceNumber}',
    );
  }
}
