import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Pure typographic FeatherTown brand wordmark - No images, zero raster stamps.
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
    return RichText(
      textAlign: textAlign,
      text: TextSpan(
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
          letterSpacing: -0.6,
          height: 1.1,
        ),
        children: [
          const TextSpan(
            text: 'Feather',
            style: TextStyle(color: AppColors.heroDark),
          ),
          const TextSpan(
            text: 'Town',
            style: TextStyle(color: AppColors.accent),
          ),
          if (showDot)
            const TextSpan(
              text: '.',
              style: TextStyle(color: AppColors.accent, fontWeight: FontWeight.w900),
            ),
        ],
      ),
    );
  }
}
