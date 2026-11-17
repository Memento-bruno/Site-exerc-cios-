package br.com.rumoaos5km.data.health

import org.junit.Assert.assertEquals
import org.junit.Test

class FormatTest {
    @Test
    fun sono() {
        assertEquals("7 h 30", Format.sleep(450))
        assertEquals("7 h 05", Format.sleep(425))
        assertEquals("7 h", Format.sleep(420))
    }

    @Test
    fun numerosEmPortugues() {
        assertEquals("8.432", Format.int(8432))
        assertEquals("82,4", Format.oneDecimal(82.36))
    }
}
