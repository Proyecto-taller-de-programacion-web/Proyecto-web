/* =====================================================
   admin.js — panel del administrador (SOLO LECTURA)
   Muestra, en una tabla paginada, las reservas guardadas en
   localStorage. Tiene un buscador con combobox para elegir
   el campo. Depende de almacen.js
   ===================================================== */

const FILAS_POR_PAGINA = 8;

let todasLasReservas = [];
let reservasFiltradas = [];
let paginaActual = 1;

const textoBusqueda = document.getElementById("textoBusqueda");
const criterioBusqueda = document.getElementById("criterioBusqueda");


/* ---------- ACCESO: solo el rol "admin" (principio de mínimo privilegio) ---------- */

if (verificarAutenticacion('admin')) {
  document.getElementById("contenidoAdmin").hidden = false;
  cargarReservas();
}


/* ---------- DATOS ---------- */

// Lee las reservas de localStorage y las ordena: primero las más recientes
function cargarReservas() {
  todasLasReservas = leerDato(CLAVES.reservasConfirmadas, []);

  todasLasReservas.sort(function (a, b) {
    let claveA = a.fecha + " " + a.horaInicio;
    let claveB = b.fecha + " " + b.horaInicio;

    if (claveA < claveB) return 1;
    if (claveA > claveB) return -1;
    return 0;
  });

  filtrarReservas();
}

// Pone en minúsculas y quita las tildes (así "Maria" encuentra "María")
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function textoEstado(estado) {
  if (estado === "confirmada") {
    return "Confirmada";
  }
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

// Texto de la reserva donde se va a buscar, según lo elegido en el combobox
function textoDeBusqueda(reserva, criterio) {
  let nombre = reserva.titular.nombre + " " + reserva.titular.apellido;
  let fecha = reserva.fecha + " " + formatearFecha(reserva.fecha);
  let sede = reserva.sede + " " + reserva.salon;

  switch (criterio) {
    case "nombre":
      return nombre;
    case "correo":
      return reserva.usuario;
    case "codigo":
      return reserva.id;
    case "fecha":
      return fecha;
    case "sede":
      return sede;
    case "mesa":
      return "mesa " + reserva.mesaId;
    case "estado":
      return textoEstado(reserva.estado);
    default:
      return [reserva.id, nombre, reserva.usuario, sede, "mesa " + reserva.mesaId,
        fecha, reserva.horaInicio, textoEstado(reserva.estado)].join(" ");
  }
}

// Se llama en cada pulsación (input) y al cambiar el combobox (change)
function filtrarReservas() {
  let buscado = normalizar(textoBusqueda.value.trim());
  let criterio = criterioBusqueda.value;

  reservasFiltradas = todasLasReservas.filter(function (reserva) {
    if (buscado === "") {
      return true;
    }

    // La mesa se compara completa ("1" solo encuentra la mesa 1, no la 10 ni la 13)
    if (criterio === "mesa") {
      return String(reserva.mesaId) === buscado.replace("mesa", "").trim();
    }

    return normalizar(textoDeBusqueda(reserva, criterio)).includes(buscado);
  });

  paginaActual = 1;
  mostrarTabla();
}

textoBusqueda.addEventListener("input", filtrarReservas);
criterioBusqueda.addEventListener("change", filtrarReservas);

// Si otra pestaña guarda o cancela una reserva, la tabla se actualiza sola
window.addEventListener("storage", function (evento) {
  if (evento.key === CLAVES.reservasConfirmadas && verificarAutenticacion('admin')) {
    cargarReservas();
  }
});


/* ---------- TABLA ---------- */

function mostrarTabla() {
  let tbody = document.getElementById("cuerpoTabla");
  let totalPaginas = Math.max(1, Math.ceil(reservasFiltradas.length / FILAS_POR_PAGINA));

  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  let inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  let fin = Math.min(inicio + FILAS_POR_PAGINA, reservasFiltradas.length);

  tbody.innerHTML = "";

  if (reservasFiltradas.length === 0) {
    let mensaje = todasLasReservas.length === 0
      ? "Aún no hay reservas registradas."
      : "Ninguna reserva coincide con la búsqueda.";
    tbody.innerHTML = `<tr><td class="admin-vacio" colspan="9">${mensaje}</td></tr>`;
  }

  for (let i = inicio; i < fin; i++) {
    let r = reservasFiltradas[i];

    tbody.innerHTML += `
      <tr>
        <td>${escaparHTML(r.id)}</td>
        <td>${escaparHTML(r.titular.nombre)} ${escaparHTML(r.titular.apellido)}</td>
        <td>${escaparHTML(r.usuario)}</td>
        <td>${escaparHTML(r.sede)} - ${escaparHTML(r.salon)}</td>
        <td>${r.mesaId}</td>
        <td>${formatearFecha(r.fecha)}</td>
        <td>${r.horaInicio} - ${r.horaFin}</td>
        <td>${r.personas}</td>
        <td><span class="estado estado-${escaparHTML(r.estado)}">${textoEstado(r.estado)}</span></td>
      </tr>
    `;
  }

  mostrarPaginacion(totalPaginas, inicio, fin);
}


/* ---------- PAGINACIÓN ---------- */

function irAPagina(numero) {
  paginaActual = numero;
  mostrarTabla();
}

function mostrarPaginacion(totalPaginas, inicio, fin) {
  let info = document.getElementById("infoPagina");
  let botones = document.getElementById("botonesPagina");

  if (reservasFiltradas.length === 0) {
    info.textContent = "0 reservas";
  } else {
    info.textContent = "Mostrando " + (inicio + 1) + "–" + fin + " de " + reservasFiltradas.length + " reservas";
  }

  let cad = "";

  cad += `<button type="button" class="btn-pagina" onclick="irAPagina(${paginaActual - 1})" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>`;

  for (let n = 1; n <= totalPaginas; n++) {
    cad += `<button type="button" class="btn-pagina ${n === paginaActual ? "activa" : ""}" onclick="irAPagina(${n})" ${n === paginaActual ? 'aria-current="page"' : ""}>${n}</button>`;
  }

  cad += `<button type="button" class="btn-pagina" onclick="irAPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente</button>`;

  botones.innerHTML = cad;
}
