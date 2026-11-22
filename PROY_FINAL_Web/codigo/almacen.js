/* =====================================================
   almacen.js — utilidades compartidas de localStorage
   y control de sesión del menú.
   Se carga en TODAS las páginas del sitio.
   ===================================================== */

const CLAVES = {
  usuarios: 'vr_usuarios',                    // cuentas registradas
  sesion: 'vr_sesion',                        // usuario con sesión iniciada
  reservaTemporal: 'reservaTemporal',         // reserva a medias (la guarda reserva.js)
  reservasConfirmadas: 'vr_reservas_confirmadas' // reservas terminadas
};

function leerDato(clave, porDefecto) {
  let texto = localStorage.getItem(clave);

  if (texto === null) {
    return porDefecto;
  }
  return JSON.parse(texto);
}

function guardarDato(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function borrarDato(clave) {
  localStorage.removeItem(clave);
}

function obtenerSesion() {
  return leerDato(CLAVES.sesion, null);
}


/* ---------- MENÚ: "Iniciar Sesión" / "Cerrar Sesión" ---------- */

// Primero pregunta con confirm() (igual que confirEliminar de clase)
function cerrarSesion(evento) {
  evento.preventDefault();

  let respuesta = confirm("¿Estás seguro de cerrar sesión?");

  if (respuesta === true) {
    borrarDato(CLAVES.sesion);
    borrarDato(CLAVES.reservaTemporal); // una reserva a medias no pasa a otra persona
    location.reload();
  }
}

// Si hay sesión abierta, el enlace del menú pasa a ser "Cerrar Sesión"
function actualizarEnlaceSesion() {
  let enlace = document.getElementById("enlaceSesion");

  if (enlace === null || obtenerSesion() === null) {
    return;
  }

  enlace.innerHTML = "Cerrar Sesión";
  enlace.href = "#";
  enlace.removeAttribute("aria-current");
  enlace.onclick = cerrarSesion;
}

// Este archivo se carga al final de cada página (o con defer),
// así que el menú ya existe y se puede llamar directamente.
actualizarEnlaceSesion();
