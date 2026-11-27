import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Pure typographic FeatherTown brand wordmark matching the website exactly in Outfit font.
class FeatherTownLogo extends StatelessWidget {
  final double fontSize;
  final bool showDot;
  final TextAlign textAlign;

  const FeatherTownLogo({
    super.key,
    this.fontSize = 24,
    this.showDot = true,
    this.textAlign = TextAlign.start,
  });

  @override
  Widget build(BuildContext context) {
    final baseStyle = GoogleFonts.outfit(
      fontSize: fontSize,
      fontWeight: FontWeight.w900,
      letterSpacing: -0.025 * fontSize,
      height: 1.0,
    );

    return RichText(
      textAlign: textAlign,
      text: TextSpan(
        style: baseStyle,
        children: [
          TextSpan(
            text: 'Feather',
            style: baseStyle.copyWith(color: const Color(0xFF1B3B22)),
          ),
          TextSpan(
            text: 'Town',
            style: baseStyle.copyWith(color: const Color(0xFFD9381E)),
          ),
          if (showDot)
            TextSpan(
              text: '.',
              style: baseStyle.copyWith(color: const Color(0xFFD9381E)),
            ),
        ],
      ),
    );
  }
}
