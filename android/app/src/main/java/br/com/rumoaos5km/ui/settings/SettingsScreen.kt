package br.com.rumoaos5km.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Watch
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import br.com.rumoaos5km.ui.components.Section
import br.com.rumoaos5km.ui.components.SectionRow

/** Tela 3: conexões, metas, foto do prato e preferências. */
@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    val version = runCatching {
        context.packageManager.getPackageInfo(context.packageName, 0).versionName
    }.getOrNull() ?: "?"

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Configurações", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)

        Section("Conexões") {
            SectionRow(Icons.Filled.Favorite, "Health Connect", "Não conectado · próxima etapa")
            SectionRow(Icons.Filled.Watch, "Samsung Galaxy Ring", "Passos, calorias, sono e frequência cardíaca via Samsung Health")
            SectionRow(Icons.Filled.MonitorWeight, "Balança", "Peso e gordura corporal via Samsung Health")
        }

        Section("Metas do dia") {
            SectionRow(Icons.AutoMirrored.Filled.DirectionsWalk, "Passos", "A definir")
            SectionRow(Icons.Filled.LocalFireDepartment, "Calorias consumidas", "A definir")
        }

        Section("Foto do prato") {
            SectionRow(Icons.Filled.Key, "Chave da IA de visão", "Usada para estimar as calorias pela foto · próxima etapa")
        }

        Section("Preferências") {
            SectionRow(Icons.Filled.Notifications, "Lembretes", "Mobilidade, sono e pesagem")
            SectionRow(Icons.Filled.DarkMode, "Tema", "Segue o sistema")
        }

        Section("Sobre") {
            SectionRow(Icons.Filled.Info, "Rumo aos 5 km", "Versão $version")
        }
    }
}
