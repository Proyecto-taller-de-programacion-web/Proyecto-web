/* =====================================================
   registro.js — crea la cuenta, la guarda en localStorage y abre sesión
   Depende de almacen.js
   ===================================================== */

// Se llama desde el HTML:  <form onsubmit="registrarUsuario(event)">
function registrarUsuario(event) {
  event.preventDefault(); // para que no se recargue la página al enviar

  let nombre = document.getElementById("nombre").value.trim();
  let apellido = document.getElementById("apellido").value.trim();
  let correo = document.getElementById("correo").value.trim().toLowerCase();
  let telefono = document.getElementById("telefono").value.trim();
  let pass = document.getElementById("pass").value;
  let pass2 = document.getElementById("pass2").value;

  // Validaciones: el mensaje sale en el div "mgError"
  if (pass !== pass2) {
    document.getElementById("mgError").innerHTML = "Las contraseñas no coinciden.";
    return;
  }

  // Se revisa, recorriendo la lista, si el correo ya estaba registrado
  let usuarios = leerDato(CLAVES.usuarios, []);
  let existe = false;

  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].correo === correo) {
      existe = true;
    }
  }

  if (existe === true) {
    document.getElementById("mgError").innerHTML =
      "Este correo ya está registrado. Inicia sesión.";
    return;
  }

  document.getElementById("mgError").innerHTML = "";

  // El rol siempre es "usuario": nadie puede hacerse administrador desde el formulario
  let nuevo = {
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    telefono: telefono,
    pass: pass, // OJO: solo válido para un proyecto de curso sin servidor
    rol: "usuario"
  };
  usuarios.push(nuevo);
  guardarDato(CLAVES.usuarios, usuarios);

  // Cuenta creada -> entra directo con su sesión. Si venía de una reserva a medias,
  // abrirSesion lo devuelve a ella (paso 4); si no, va al inicio.
  abrirSesion(nuevo);
}
