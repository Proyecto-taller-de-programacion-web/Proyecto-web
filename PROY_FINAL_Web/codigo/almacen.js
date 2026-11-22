/* =====================================================
   almacen.js — utilidades compartidas de localStorage,
   roles (usuario / admin) y control de sesión del menú.
   Se carga en TODAS las páginas del sitio.
   (Sigue el modelo del PDF de la semana 16: usuarios iniciales,
    inicializar localStorage, obtenerSesion, verificarAutenticacion,
    redirigirPorRol y cerrarSesion.)
   ===================================================== */

const CLAVES = {
  usuarios: 'vr_usuarios',                    // cuentas registradas
  sesion: 'vr_sesion',                        // usuario con sesión iniciada
  reservaTemporal: 'reservaTemporal',         // reserva a medias (la guarda reserva.js)
  reservasConfirmadas: 'vr_reservas_confirmadas' // reservas terminadas
};

// Ruta a la carpeta raíz del sitio (sirve desde cualquier página, para armar enlaces)
const RAIZ_SITIO = document.currentScript
  ? document.currentScript.src.replace('codigo/almacen.js', '')
  : '';


/* ---------- LEER / GUARDAR (con try/catch como en el PDF) ---------- */

function leerDato(clave, porDefecto) {
  try {
    let texto = localStorage.getItem(clave);

    if (texto === null) {
      return porDefecto;
    }
    return JSON.parse(texto);
  } catch (error) {
    // El dato estaba dañado: se descarta y se usa el valor por defecto
    localStorage.removeItem(clave);
    return porDefecto;
  }
}

function guardarDato(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function borrarDato(clave) {
  localStorage.removeItem(clave);
}


/* ---------- USUARIOS INICIALES Y ROLES ---------- */

// Única cuenta administradora. El rol NUNCA viene de un formulario:
// el registro siempre crea rol "usuario" (ver registro.js).
const usuariosIniciales = [
  {
    nombre: 'Administrador',
    apellido: 'La Vaca Roja',
    correo: 'admin@lavacaroja.pe',
    telefono: '000000000',
    pass: 'admin123', // OJO: solo válido para un proyecto de curso sin servidor
    rol: 'admin'
  }
];

// Revisa que la lista guardada tenga la estructura correcta y que exista el admin.
// Las cuentas antiguas (sin rol) pasan a ser "usuario".
function inicializarUsuarios() {
  let usuarios = leerDato(CLAVES.usuarios, []);

  if (!Array.isArray(usuarios)) {
    usuarios = [];
  }

  // Cuentas con estructura dañada se descartan
  let validos = [];
  for (let i = 0; i < usuarios.length; i++) {
    let u = usuarios[i];
    if (u && typeof u.correo === 'string' && typeof u.pass === 'string') {
      if (u.rol !== 'admin' && u.rol !== 'usuario') {
        u.rol = 'usuario';
      }
      validos.push(u);
    }
  }

  // Si falta algún usuario inicial (el admin), se agrega
  for (let i = 0; i < usuariosIniciales.length; i++) {
    let existe = validos.some(u => u.correo === usuariosIniciales[i].correo);
    if (!existe) {
      validos.push(usuariosIniciales[i]);
    }
  }

  guardarDato(CLAVES.usuarios, validos);
}

inicializarUsuarios();


/* ---------- SESIÓN ---------- */

// Devuelve la sesión (con su rol) o null si es visitante
function obtenerSesion() {
  let sesion = leerDato(CLAVES.sesion, null);

  if (sesion === null || typeof sesion.correo !== 'string') {
    return null;
  }
  if (sesion.rol !== 'admin' && sesion.rol !== 'usuario') {
    sesion.rol = 'usuario'; // sesiones antiguas, creadas antes de los roles
  }
  return sesion;
}

// Guarda la sesión (sin la contraseña) y envía a cada rol a su lugar.
// Se usa desde login.js y registro.js (ambos están en paginas/0. xxx/).
function abrirSesion(usuario) {
  let sesion = {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    telefono: usuario.telefono,
    rol: usuario.rol
  };
  guardarDato(CLAVES.sesion, sesion);
  redirigirPorRol(sesion);
}

function redirigirPorRol(sesion) {
  if (sesion.rol === 'admin') {
    location.href = '../6. admin/index.html';
  } else if (localStorage.getItem(CLAVES.reservaTemporal)) {
    // Venía de una reserva a medias: vuelve a ella y continúa en el paso 4
    location.href = '../5. reservar/index.html?continuar=1';
  } else {
    location.href = '../../index.html';
  }
}

// Protege una página por rol (modelo del PDF). Devuelve true si puede entrar.
function verificarAutenticacion(rolRequerido) {
  let sesion = obtenerSesion();

  if (sesion === null) {
    alert('Acceso denegado. Debes iniciar sesión.');
    location.replace(RAIZ_SITIO + 'paginas/0. login/index.html');
    return false;
  }

  if (rolRequerido && sesion.rol !== rolRequerido) {
    alert('No tienes permisos para acceder a esta página.');
    location.replace(RAIZ_SITIO + 'index.html');
    return false;
  }

  return true;
}


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

// Fecha de hoy como YYYY-MM-DD (con la hora local del cliente)
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


/* ---------- MENÚ: "Iniciar Sesión" / "Cerrar Sesión" / "Panel" ---------- */

// Primero pregunta con confirm() (igual que confirEliminar de clase)
function cerrarSesion(evento) {
  evento.preventDefault();

  let respuesta = confirm("¿Estás seguro de cerrar sesión?");

  if (respuesta === true) {
    borrarDato(CLAVES.sesion);
    borrarDato(CLAVES.reservaTemporal); // una reserva a medias no pasa a otra persona

    // Si estaba en el panel del admin, ya no puede quedarse ahí
    if (location.pathname.indexOf('6. admin') !== -1 || location.pathname.indexOf('6.%20admin') !== -1) {
      location.href = RAIZ_SITIO + 'index.html';
    } else {
      location.reload();
    }
  }
}

// Si hay sesión abierta, el enlace del menú pasa a ser "Cerrar Sesión".
// Si la sesión es del administrador, además aparece el enlace "PANEL".
function actualizarEnlaceSesion() {
  let enlace = document.getElementById("enlaceSesion");
  let sesion = obtenerSesion();

  if (enlace === null || sesion === null) {
    return;
  }

  enlace.innerHTML = "Cerrar Sesión";
  enlace.href = "#";
  enlace.removeAttribute("aria-current");
  enlace.onclick = cerrarSesion;

  if (sesion.rol === 'admin') {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = RAIZ_SITIO + "paginas/6. admin/index.html";
    a.textContent = "PANEL";
    if (location.pathname.indexOf('6. admin') !== -1 || location.pathname.indexOf('6.%20admin') !== -1) {
      a.setAttribute("aria-current", "page");
    }
    li.appendChild(a);
    enlace.parentNode.parentNode.insertBefore(li, enlace.parentNode);
  }
}

// Este archivo se carga al final de cada página (o con defer),
// así que el menú ya existe y se puede llamar directamente.
actualizarEnlaceSesion();
