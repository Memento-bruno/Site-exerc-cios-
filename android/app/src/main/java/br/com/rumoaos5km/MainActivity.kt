package br.com.rumoaos5km

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import br.com.rumoaos5km.ui.RumoApp
import br.com.rumoaos5km.ui.theme.RumoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            RumoTheme {
                RumoApp()
            }
        }
    }
}
