package br.com.rumoaos5km.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Brand = Color(0xFFF97316)
val BrandDark = Color(0xFFEA580C)
val Steps = Color(0xFF0284C7)
val Burned = Color(0xFFEA580C)
val Eaten = Color(0xFF059669)
val Weight = Color(0xFF7C3AED)
val Sleep = Color(0xFF4F46E5)
val Heart = Color(0xFFE11D48)

private val Light = lightColorScheme(
    primary = BrandDark,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFEDD5),
    onPrimaryContainer = Color(0xFF7C2D12),
    secondary = Color(0xFF0F172A),
    background = Color(0xFFF8FAFC),
    surface = Color(0xFFF8FAFC),
    surfaceContainer = Color.White,
)

private val Dark = darkColorScheme(
    primary = Brand,
    onPrimary = Color(0xFF0F172A),
    primaryContainer = Color(0xFF7C2D12),
    onPrimaryContainer = Color(0xFFFFEDD5),
    background = Color(0xFF020617),
    surface = Color(0xFF020617),
    surfaceContainer = Color(0xFF0F172A),
)

@Composable
fun RumoTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (darkTheme) Dark else Light, content = content)
}
