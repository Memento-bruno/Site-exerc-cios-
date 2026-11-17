package br.com.rumoaos5km.data.health

import java.time.Instant
import java.time.LocalDate

/**
 * Dados de saúde do dia. O Galaxy Ring manda para o Samsung Health, que repassa
 * ao Health Connect; a balança segue o mesmo caminho. `null` = a fonte não tem o dado.
 */
data class HealthToday(
    val steps: Long? = null,
    /** Calorias gastas em atividade (kcal). */
    val activeKcal: Double? = null,
    /** Calorias totais do dia, incluindo metabolismo basal (kcal). */
    val totalKcal: Double? = null,
    val restingHeartRate: Long? = null,
    val sleepMinutes: Long? = null,
    val weight: WeightReading? = null,
    val fetchedAt: Instant = Instant.now(),
)

data class WeightReading(val kg: Double, val bodyFatPct: Double?, val date: LocalDate)

enum class HealthStatus {
    /** Health Connect não instalado ou desatualizado. */
    PrecisaInstalar,
    /** Instalado, mas o app ainda não tem permissão de leitura. */
    SemPermissao,
    Conectado,
}

/** Fonte dos dados de saúde. A implementação com Health Connect entra na próxima etapa. */
interface HealthRepository {
    suspend fun status(): HealthStatus
    suspend fun readToday(): HealthToday
}

/** Fonte provisória enquanto o Health Connect não está ligado: sem dados. */
class NotConnectedHealthRepository : HealthRepository {
    override suspend fun status() = HealthStatus.SemPermissao
    override suspend fun readToday() = HealthToday()
}

object Format {
    private val br = java.util.Locale.forLanguageTag("pt-BR")

    /** 8432 → "8.432" */
    fun int(n: Long): String = String.format(br, "%,d", n)

    /** 82.35 → "82,4" */
    fun oneDecimal(x: Double): String = String.format(br, "%.1f", x)

    /** 450 → "7 h 30"; 420 → "7 h". */
    fun sleep(minutes: Long): String {
        val h = minutes / 60
        val m = minutes % 60
        return if (m == 0L) "$h h" else "$h h ${m.toString().padStart(2, '0')}"
    }
}
