package br.com.rumoaos5km.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.FitnessCenter
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import br.com.rumoaos5km.ui.dashboard.DashboardScreen
import br.com.rumoaos5km.ui.exercises.ExercisesScreen
import br.com.rumoaos5km.ui.settings.SettingsScreen

/** As 3 telas principais, na ordem da barra inferior. */
enum class Tab(val route: String, val label: String, val icon: ImageVector, val selectedIcon: ImageVector) {
    Dashboard("dashboard", "Dashboard", Icons.Outlined.Dashboard, Icons.Filled.Dashboard),
    Exercicios("exercicios", "Exercícios", Icons.Outlined.FitnessCenter, Icons.Filled.FitnessCenter),
    Configuracoes("configuracoes", "Configurações", Icons.Outlined.Settings, Icons.Filled.Settings),
}

@Composable
fun RumoApp() {
    val nav = rememberNavController()
    val backStack by nav.currentBackStackEntryAsState()
    val current = backStack?.destination

    Scaffold(
        bottomBar = {
            NavigationBar {
                Tab.entries.forEach { tab ->
                    val selected = current?.hierarchy?.any { it.route == tab.route } == true
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            nav.navigate(tab.route) {
                                popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(if (selected) tab.selectedIcon else tab.icon, contentDescription = null) },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Tab.Dashboard.route,
            modifier = Modifier.padding(padding),
        ) {
            composable(Tab.Dashboard.route) {
                DashboardScreen(onOpenExercises = { nav.navigate(Tab.Exercicios.route) })
            }
            composable(Tab.Exercicios.route) { ExercisesScreen() }
            composable(Tab.Configuracoes.route) { SettingsScreen() }
        }
    }
}
