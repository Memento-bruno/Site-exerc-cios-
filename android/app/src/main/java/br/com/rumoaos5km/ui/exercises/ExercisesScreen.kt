package br.com.rumoaos5km.ui.exercises

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsRun
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import br.com.rumoaos5km.ui.components.Section
import br.com.rumoaos5km.ui.components.SectionRow

/** Tela 2: treino do dia e atalhos. O plano de 24 semanas será portado do app web. */
@Composable
fun ExercisesScreen() {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Exercícios", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("TREINO DE HOJE", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("Plano Rumo aos 5 km", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text(
                    "O plano de 24 semanas, os cronômetros e o registro de séries chegam numa próxima etapa.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp),
                )
                Button(onClick = {}, enabled = false, modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
                    Text("Começar treino")
                }
            }
        }

        Section("Atalhos") {
            SectionRow(Icons.Filled.CalendarMonth, "Plano", "Fases e semanas")
            SectionRow(Icons.AutoMirrored.Filled.MenuBook, "Biblioteca", "Como fazer cada exercício")
            SectionRow(Icons.AutoMirrored.Filled.DirectionsRun, "Corrida", "Cronômetro de intervalos")
            SectionRow(Icons.Filled.ShowChart, "Progresso", "Peso, cargas e tempos")
            SectionRow(Icons.Filled.CheckCircle, "Hábitos", "Água, proteína, mobilidade e sono")
        }
    }
}
