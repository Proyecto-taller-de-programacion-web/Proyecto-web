/* =====================================================
   almacen.js — LocalStorage, sesión y menú.
   Se carga en TODAS las páginas del sitio.
   Aquí está TODO el uso de LocalStorage del proyecto.
   ===================================================== */

// Ruta a la carpeta raíz del sitio (sirve desde cualquier página, para armar enlaces)
const RAIZ_SITIO = document.currentScript.src.replace("codigo/almacen.js", "");

// Listas que se guardan en el navegador:
//   usuarios  -> cuentas registradas (el admin es un usuario con rol "admin")
//   registros -> reservas confirmadas
// (Las claves empiezan con "vr_" para no mezclarse con otros proyectos
//  que hayan guardado datos en el mismo navegador)
// AQUI DENTRO vamos a usar LocalStorage
let usuarios = JSON.parse(localStorage.getItem("vr_usuarios")) || [];
let registros = JSON.parse(localStorage.getItem("vr_registros")) || [];

// El administrador siempre debe estar en la lista, aunque ya hubiera otras cuentas guardadas
let existeAdmin = false;

for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].correo === "admin@lavacaroja.pe") {
    existeAdmin = true;
  }
}

if (existeAdmin === false) {
  usuarios.push({
    nombre: "Administrador",
    apellido: "La Vaca Roja",
    correo: "admin@lavacaroja.pe",
    telefono: "000000000",
    pass: "admin123",
    rol: "admin"
  });
  guardarUsuarios();
}


/* ---------- GUARDAR ---------- */

function guardarUsuarios() {
  // AQUI DENTRO vamos a usar LocalStorage
  localStorage.setItem("vr_usuarios", JSON.stringify(usuarios));
}

function guardarEnStorage() {
  // AQUI DENTRO vamos a usar LocalStorage
  localStorage.setItem("vr_registros", JSON.stringify(registros));
}


/* ---------- RESERVA A MEDIAS ---------- */
// Lo que el visitante eligió antes de ir al login (sede, salón, personas, fecha y horario),
// para devolverlo al paso donde se quedó cuando vuelva con su sesión iniciada.

function guardarReservaTemporal(datos) {
  // AQUI DENTRO vamos a usar LocalStorage
  localStorage.setItem("vr_reservaTemporal", JSON.stringify(datos));
}

function obtenerReservaTemporal() {
  // AQUI DENTRO vamos a usar LocalStorage
  return JSON.parse(localStorage.getItem("vr_reservaTemporal"));
}

function borrarReservaTemporal() {
  // AQUI DENTRO vamos a usar LocalStorage
  localStorage.removeItem("vr_reservaTemporal");
}


/* ---------- SESIÓN ---------- */

// Devuelve la sesión (con su rol) o null si es visitante
function obtenerSesion() {
  // AQUI DENTRO vamos a usar LocalStorage
  return JSON.parse(localStorage.getItem("vr_sesion"));
}

// Guarda la sesión (sin la contraseña) y envía a cada rol a su página.
// Se usa desde login.js y registro.js (están en paginas/0. xxx/)
function abrirSesion(usuario) {
  let sesion = {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    telefono: usuario.telefono,
    rol: usuario.rol
  };

  // AQUI DENTRO vamos a usar LocalStorage
  localStorage.setItem("vr_sesion", JSON.stringify(sesion));

  if (usuario.rol === "admin") {
    location.href = "../6. admin/index.html";
  } else {
    // ?continuar=1 -> reservar.js devuelve al cliente al paso donde se quedó
    location.href = "../5. reservar/index.html?continuar=1";
  }
}

// Solo el administrador puede ver el panel. Devuelve true si puede entrar.
function verificarAdmin() {
  let sesion = obtenerSesion();

  if (sesion === null || sesion.rol !== "admin") {
    alert("No tienes permisos para entrar a esta página.");
    location.href = RAIZ_SITIO + "index.html";
    return false;
  }
  return true;
}

// Solo un cliente con sesión puede ver "Mis reservas". Devuelve true si puede entrar.
function verificarUsuario() {
  let sesion = obtenerSesion();

  if (sesion === null || sesion.rol !== "usuario") {
    alert("Inicia sesión con una cuenta de cliente para ver tus reservas.");
    location.href = RAIZ_SITIO + "paginas/0. login/index.html";
    return false;
  }
  return true;
}

// Pregunta con confirm() (igual que confirEliminar de clase)
function cerrarSesion(evento) {
  evento.preventDefault();

  let respuesta = confirm("¿Estás seguro de cerrar sesión?");

  if (respuesta === true) {
    // AQUI DENTRO vamos a usar LocalStorage
    localStorage.removeItem("vr_sesion");
    borrarReservaTemporal(); // una reserva a medias no pasa a otra persona

    // Si estaba en el panel del admin, ya no puede quedarse ahí
    if (location.pathname.indexOf("admin") !== -1) {
      location.href = RAIZ_SITIO + "index.html";
    } else {
      location.reload();
    }
  }
}

// Si hay sesión, el enlace del menú pasa a ser "Cerrar Sesión".
// Si es el administrador aparece "PANEL"; si es cliente, "MIS RESERVAS".
function actualizarMenu() {
  let enlace = document.getElementById("enlaceSesion");
  let sesion = obtenerSesion();

  if (enlace === null || sesion === null) {
    return;
  }

  enlace.innerHTML = "Cerrar Sesión";
  enlace.href = "#";
  enlace.onclick = cerrarSesion;

  if (sesion.rol === "admin") {
    let li = document.createElement("li");
    li.innerHTML = `<a href="${RAIZ_SITIO}paginas/6. admin/index.html">PANEL</a>`;
    enlace.parentNode.parentNode.insertBefore(li, enlace.parentNode);
  } else {
    let li = document.createElement("li");
    li.innerHTML = `<a href="${RAIZ_SITIO}paginas/7. mis reservas/index.html">MIS RESERVAS</a>`;
    enlace.parentNode.parentNode.insertBefore(li, enlace.parentNode);
  }
}

actualizarMenu();


/* ---------- FUNCIONES COMUNES ---------- */

// Evita que un texto escrito por el cliente se interprete como HTML
function escaparHTML(texto) {
  let resultado = "";

  for (let i = 0; i < texto.length; i++) {
    let letra = texto[i];

    if (letra === "<") {
      resultado += "&lt;";
    } else if (letra === ">") {
      resultado += "&gt;";
    } else if (letra === "&") {
      resultado += "&amp;";
    } else {
      resultado += letra;
    }
  }

  return resultado;
}

// 2026-11-20 -> 20/11/2026
function formatearFecha(fecha) {
  let partes = fecha.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Fecha de hoy como YYYY-MM-DD
function fechaDeHoy() {
  let hoy = new Date();
  let mes = hoy.getMonth() + 1;
  let dia = hoy.getDate();

  if (mes < 10) {
    mes = "0" + mes;
  }
  if (dia < 10) {
    dia = "0" + dia;
  }

  return hoy.getFullYear() + "-" + mes + "-" + dia;
}

// Hora actual como HH:MM
function horaActual() {
  let ahora = new Date();
  let h = ahora.getHours();
  let m = ahora.getMinutes();

  if (h < 10) {
    h = "0" + h;
  }
  if (m < 10) {
    m = "0" + m;
  }

  return h + ":" + m;
}

// Estado real de una reserva:
//   "cancelada"  -> la canceló el cliente
//   "finalizada" -> ya pasó su fecha, o es de hoy y su hora de fin ya terminó
//   "confirmada" -> todavía no se realiza
// No se guarda: se calcula cada vez que se muestra, así se actualiza sola con el tiempo.
function estadoReserva(r) {
  if (r.estado === "cancelada") {
    return "cancelada";
  }

  let hoy = fechaDeHoy();

  if (r.fecha < hoy || (r.fecha === hoy && r.horaFin <= horaActual())) {
    return "finalizada";
  }

  return "confirmada";
}

function textoEstado(estado) {
  if (estado === "cancelada") return "Cancelada";
  if (estado === "finalizada") return "Finalizada";
  return "Confirmada";
}
