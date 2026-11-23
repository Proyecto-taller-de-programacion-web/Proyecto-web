/* =====================================================
   registro.js — crea la cuenta y abre sesión
   Depende de almacen.js
   ===================================================== */

// Se llama desde el HTML:  <form onsubmit="registrarUsuario(event)">
function registrarUsuario(event) {
  event.preventDefault();

  let nombre = document.getElementById("nombre").value.trim();
  let apellido = document.getElementById("apellido").value.trim();
  let correo = document.getElementById("correo").value.trim().toLowerCase();
  let telefono = document.getElementById("telefono").value.trim();
  let pass = document.getElementById("pass").value;
  let pass2 = document.getElementById("pass2").value;

  if (pass !== pass2) {
    document.getElementById("mgError").innerHTML = "Las contraseñas no coinciden.";
    return;
  }

  // ¿El correo ya estaba registrado?
  let existe = false;

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo === correo) {
      existe = true;
    }
  }

  if (existe === true) {
    document.getElementById("mgError").innerHTML = "Este correo ya está registrado. Inicia sesión.";
    return;
  }

  // El rol siempre es "usuario": nadie se hace administrador desde el formulario
  let nuevo = {
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    telefono: telefono,
    pass: pass,
    rol: "usuario"
  };

  usuarios.push(nuevo);
  guardarUsuarios();
  abrirSesion(nuevo);
}
