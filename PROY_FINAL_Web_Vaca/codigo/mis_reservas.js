/* =====================================================
   mis_reservas.js — historial de reservas del cliente
   Tabla con buscador, paginación y botón "Cancelar".
   Depende de almacen.js
   ===================================================== */

const FILAS_POR_PAGINA = 8;
let paginaActual = 1;
let coincidencias = []; // filas de la tabla que cumplen con el filtro
let sesion = null;

// Solo un cliente con sesión puede ver sus reservas
if (verificarUsuario()) {
    sesion = obtenerSesion();
    document.getElementById("contenidoUsuario").hidden = false;
    llenarTabla();
    filtrarTabla();
}

// Reservas de la cuenta, ordenadas por fecha (y hora): de la más reciente a la más antigua
function misReservas() {
    let mias = [];

    for (let i = 0; i < registros.length; i++) {
        if (registros[i].usuario === sesion.correo) {
            mias.push(registros[i]);
        }
    }

    mias.sort(function (a, b) {
        let ka = a.fecha + " " + a.horaInicio;
        let kb = b.fecha + " " + b.horaInicio;
        if (ka < kb) return 1;
        if (ka > kb) return -1;
        return 0;
    });

    return mias;
}

// Escribe una fila por cada reserva de la cuenta
function llenarTabla() {
    let tbody = document.getElementById("cuerpoTabla");
    let mias = misReservas();
    let cad = "";

    for (let i = 0; i < mias.length; i++) {
        let r = mias[i];
        let estado = estadoReserva(r);
        let accion = '<span class="sin-accion">—</span>';

        // Solo se pueden cancelar las reservas confirmadas (que aún no han empezado a pasar su hora de fin)
        if (estado === "confirmada") {
            accion = `<button type="button" class="btn-cancelar" onclick="cancelarMiReserva('${r.id}')">Cancelar</button>`;
        }

        cad += `
            <tr>
                <td>${r.id}</td>
                <td>${formatearFecha(r.fecha)}</td>
                <td>${r.horaInicio} - ${r.horaFin}</td>
                <td>${r.sede} - ${r.salon}</td>
                <td>${r.mesaId}</td>
                <td>${r.personas}</td>
                <td><span class="estado estado-${estado}">${textoEstado(estado)}</span></td>
                <td>${accion}</td>
            </tr>
        `;
    }

    if (mias.length === 0) {
        cad = `<tr><td colspan="8" class="admin-vacio">Aún no tienes reservas. ¡Haz tu primera reserva!</td></tr>`;
    }

    tbody.innerHTML = cad;
}

// Botón "Cancelar": la reserva no se borra, pasa a "cancelada" (se conserva el historial)
function cancelarMiReserva(id) {
    let respuesta = confirm("¿Estás seguro de cancelar esta reserva?\n\nRecuerda: el valor de S/ 20 de la reserva no se reembolsa.");

    if (respuesta === true) {
        for (let i = 0; i < registros.length; i++) {
            // Protección: una reserva que ya terminó (o ya cancelada) no se puede cancelar
            if (registros[i].id === id && registros[i].usuario === sesion.correo &&
                estadoReserva(registros[i]) === "confirmada") {
                registros[i].estado = "cancelada";
            }
        }

        guardarEnStorage();
        alert("Reserva cancelada");

        llenarTabla();
        let paginaGuardada = paginaActual;
        filtrarTabla();
        paginaActual = paginaGuardada;
        mostrarPagina();
    } else {
        alert("Acción cancelada");
    }
}

// Buscador: se llama en cada tecla (onkeyup) desde el HTML
function filtrarTabla() {
    const texto = document.getElementById("filtro").value.toLowerCase();
    const filas = document.querySelectorAll("#tabla tbody tr");

    coincidencias = [];

    filas.forEach(fila => {
        if (fila.textContent.toLowerCase().includes(texto) && !fila.querySelector(".admin-vacio")) {
            coincidencias.push(fila);
        } else {
            fila.style.display = "none";
        }
    });

    paginaActual = 1;
    mostrarPagina();
}

// Paginación: de las filas que coinciden, solo se muestran las de la página actual
function mostrarPagina() {
    let totalPaginas = Math.ceil(coincidencias.length / FILAS_POR_PAGINA);
    if (totalPaginas === 0) {
        totalPaginas = 1;
    }
    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    let inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    let fin = inicio + FILAS_POR_PAGINA;

    for (let i = 0; i < coincidencias.length; i++) {
        coincidencias[i].style.display = (i >= inicio && i < fin) ? "" : "none";
    }

    // Sin reservas: se deja visible el mensaje de tabla vacía
    let vacio = document.querySelector("#tabla .admin-vacio");
    if (vacio) {
        vacio.parentNode.parentNode.style.display = "";
    }

    let info = document.getElementById("infoPagina");
    if (coincidencias.length === 0) {
        info.textContent = "No hay reservas para mostrar.";
    } else {
        info.textContent = "Página " + paginaActual + " de " + totalPaginas +
            " (" + coincidencias.length + " reservas)";
    }

    document.getElementById("btnAnterior").disabled = (paginaActual === 1);
    document.getElementById("btnSiguiente").disabled = (paginaActual === totalPaginas);
}

function paginaAnterior() {
    paginaActual--;
    mostrarPagina();
}

function paginaSiguiente() {
    paginaActual++;
    mostrarPagina();
}
