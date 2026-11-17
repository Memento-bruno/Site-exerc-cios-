package br.com.rumoaos5km.ui.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MonitorWeight
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Watch
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import br.com.rumoaos5km.data.health.Format
import br.com.rumoaos5km.data.health.HealthRepository
import br.com.rumoaos5km.data.health.HealthStatus
import br.com.rumoaos5km.data.health.HealthToday
import br.com.rumoaos5km.data.health.NotConnectedHealthRepository
import br.com.rumoaos5km.ui.components.StatCard
import br.com.rumoaos5km.ui.theme.Burned
import br.com.rumoaos5km.ui.theme.Eaten
import br.com.rumoaos5km.ui.theme.Heart
import br.com.rumoaos5km.ui.theme.Sleep
import br.com.rumoaos5km.ui.theme.Steps
import br.com.rumoaos5km.ui.theme.Weight
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

private val ptBR: Locale = Locale.forLanguageTag("pt-BR")

private data class DashboardState(val status: HealthStatus? = null, val today: HealthToday = HealthToday())

/** Tela 1: resumo do dia com os dados do Galaxy Ring, da balança e da alimentação. */
@Composable
fun DashboardScreen(
    onOpenExercises: () -> Unit,
    repository: HealthRepository = remember { NotConnectedHealthRepository() },
) {
    val state by produceState(DashboardState(), repository) {
        val status = repository.status()
        value = DashboardState(status, if (status == HealthStatus.Conectado) repository.readToday() else HealthToday())
    }
    val d = state.today
    val date = LocalDate.now()
    val dateLabel = date.dayOfWeek.getDisplayName(TextStyle.FULL, ptBR).replaceFirstChar { it.titlecase(ptBR) } +
        ", " + date.format(DateTimeFormatter.ofPattern("d 'de' MMMM", ptBR))

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(dateLabel, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Resumo do dia", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)

        if (state.status != null && state.status != HealthStatus.Conectado) {
            ConnectCard(state.status!!)
        }

        StatRow {
            StatCard(Icons.AutoMirrored.Filled.DirectionsWalk, "Passos", d.steps?.let(Format::int), Steps, it)
            StatCard(
                Icons.Filled.LocalFireDepartment, "Calorias gastas",
                d.totalKcal?.let { k -> "${Format.int(k.toLong())} kcal" }, Burned, it,
                hint = d.activeKcal?.let { k -> "${Format.int(k.toLong())} kcal em atividade" },
            )
        }
        StatRow {
            StatCard(Icons.Filled.Restaurant, "Consumidas", null, Eaten, it, hint = "Foto do prato em breve")
            StatCard(
                Icons.Filled.MonitorWeight, "Peso", d.weight?.let { w -> "${Format.oneDecimal(w.kg)} kg" }, Weight, it,
                hint = d.weight?.bodyFatPct?.let { f -> "${Format.oneDecimal(f)}% de gordura" },
            )
        }
        StatRow {
            StatCard(Icons.Filled.Bedtime, "Sono", d.sleepMinutes?.let(Format::sleep), Sleep, it)
            StatCard(Icons.Filled.Favorite, "FC repouso", d.restingHeartRate?.let { b -> "$b bpm" }, Heart, it)
        }

        OutlinedButton(onClick = {}, enabled = false, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.PhotoCamera, contentDescription = null, modifier = Modifier.size(18.dp))
            Text("  Fotografar prato (em breve)")
        }

        Card(
            onClick = onOpenExercises,
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainer),
        ) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.FitnessCenter, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                    Text("TREINO DE HOJE", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("Ver na aba Exercícios", fontWeight = FontWeight.Bold)
                }
                Icon(Icons.Filled.ChevronRight, contentDescription = null)
            }
        }
    }
}

@Composable
private fun StatRow(content: @Composable (Modifier) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
        // Cada cartão recebe metade da largura.
        val cell = Modifier.weight(1f)
        content(cell)
    }
}

@Composable
private fun ConnectCard(status: HealthStatus) {
    val (title, text) = when (status) {
        HealthStatus.PrecisaInstalar ->
            "Instale o Health Connect" to "Ele é a ponte entre o Samsung Health (Galaxy Ring e balança) e este app."
        else ->
            "Conecte o Galaxy Ring e a balança" to
                "Passos, calorias, sono, frequência cardíaca e peso vão chegar pelo Health Connect. A conexão entra na próxima versão."
    }
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Watch, contentDescription = null, modifier = Modifier.size(20.dp))
                Text("  $title", fontWeight = FontWeight.Bold)
            }
            Text(text, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 4.dp))
        }
    }
}
