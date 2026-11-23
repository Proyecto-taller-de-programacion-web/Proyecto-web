/* =====================================================
   admin.js — panel del administrador (SOLO LECTURA)
   Tabla de reservas con buscador y paginación básica.
   Depende de almacen.js
   ===================================================== */

const FILAS_POR_PAGINA = 8;
let paginaActual = 1;
let coincidencias = []; // filas de la tabla que cumplen con el filtro

// Solo el rol "admin" puede ver el panel
if (verificarAdmin()) {
    document.getElementById("contenidoAdmin").hidden = false;
    llenarTabla();
    filtrarTabla();
}

// Escribe una fila por cada reserva guardada (las más nuevas primero)
function llenarTabla() {
    let tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = "";

    for (let i = registros.length - 1; i >= 0; i--) {
        let r = registros[i];

        tbody.innerHTML += `
            <tr>
                <td>${r.id}</td>
                <td>${escaparHTML(r.titular.nombre)} ${escaparHTML(r.titular.apellido)}</td>
                <td>${escaparHTML(r.usuario)}</td>
                <td>${r.sede} - ${r.salon}</td>
                <td>${r.mesaId}</td>
                <td>${formatearFecha(r.fecha)}</td>
                <td>${r.horaInicio} - ${r.horaFin}</td>
                <td>${r.personas}</td>
                <td><span class="estado estado-confirmada">Confirmada</span></td>
            </tr>
        `;
    }
}

// Buscador: se llama en cada tecla (onkeyup) desde el HTML
function filtrarTabla() {
    const texto = document.getElementById("filtro").value.toLowerCase();
    const filas = document.querySelectorAll("#tabla tbody tr");

    coincidencias = [];

    filas.forEach(fila => {
        const contenidoFila = fila.textContent.toLowerCase();

        if (contenidoFila.includes(texto)) {
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

    let inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    let fin = inicio + FILAS_POR_PAGINA;

    for (let i = 0; i < coincidencias.length; i++) {
        if (i >= inicio && i < fin) {
            coincidencias[i].style.display = "";
        } else {
            coincidencias[i].style.display = "none";
        }
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
