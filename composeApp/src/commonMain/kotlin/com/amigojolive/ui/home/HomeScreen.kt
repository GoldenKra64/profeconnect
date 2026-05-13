package com.amigojolive.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import cafe.adriel.voyager.navigator.LocalNavigator
import cafe.adriel.voyager.navigator.currentOrThrow
import com.amigojolive.domain.model.UserSummary
import com.amigojolive.navigation.*
import com.amigojolive.ui.components.LoadingOverlay
import com.amigojolive.ui.components.PublicationList
import com.amigojolive.ui.publications.PublicationsViewModel

/**
 * Pantalla de inicio del Panel del Docente.
 * Muestra métricas derivadas (publicaciones propias, distribución por etiquetas)
 * más accesos directos a las secciones principales.
 * No incluye accesos a /admin/* — la barra de docente está aislada del flujo admin.
 */
@Composable
fun TeacherHomeContent(
    publicationsViewModel: PublicationsViewModel,
    currentUser: UserSummary,
    onNavigateToCreatePost: () -> Unit,
    onLogout: () -> Unit = {}
) {
    val navigator = LocalNavigator.currentOrThrow
    val state     by publicationsViewModel.state.collectAsState()

    if (state.loading) { LoadingOverlay(); return }

    TeacherScaffold(
        currentUser = currentUser,
        onLogout = onLogout,
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToCreatePost,
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Añadir")
            }
        }
    ) {
        PublicationList(
            publications = state.publications,
            onPublicationClick = { navigator.push(PublicationDetailScreen(it)) }
        )
    }
}


// ── Scaffold del docente con Bottom Navigation Bar ────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeacherScaffold(
    currentUser: UserSummary,
    onLogout: () -> Unit,
    floatingActionButton: @Composable () -> Unit = {},
    content: @Composable () -> Unit,
) {
    val navigator   = LocalNavigator.currentOrThrow
    var menuExpanded by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AmigojoLive") },
                actions = {
                    IconButton(onClick = { menuExpanded = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Menú")
                    }
                    DropdownMenu(expanded = menuExpanded, onDismissRequest = { menuExpanded = false }) {
                        DropdownMenuItem(
                            text = { Text("Perfil") },
                            leadingIcon = { Icon(Icons.Default.Person, null) },
                            onClick = { menuExpanded = false; navigator.push(ProfileScreen) },
                        )
                        DropdownMenuItem(
                            text = { Text("Cerrar sesión") },
                            leadingIcon = { Icon(Icons.Default.Logout, null) },
                            onClick = { menuExpanded = false; onLogout() },
                        )
                    }
                },
            )
        },
        floatingActionButton = floatingActionButton,
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(TeacherHomeScreen) },
                    icon = { Icon(Icons.Default.Home, null) },
                    label = { Text("Inicio") },
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(FeedScreen) },
                    icon = { Icon(Icons.Default.Feed, null) },
                    label = { Text("Feed") },
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(ChatbotScreen) },
                    icon = { Icon(Icons.Default.SmartToy, null) },
                    label = { Text("Asistente") },
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { navigator.push(ProfileScreen) },
                    icon = { Icon(Icons.Default.Person, null) },
                    label = { Text("Perfil") },
                )
            }
        },
        content = { padding ->
            Box(Modifier.padding(padding)) { content() }
        },
    )
}
