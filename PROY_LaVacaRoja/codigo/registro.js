// Validación del formulario de registro.
// Los datos solo se revisan en esta página; no se guardan como una cuenta permanente.
function registrarUsuario(event) {
    event.preventDefault();

    let nombre = document.getElementById("nombre").value.trim();
    let apellido = document.getElementById("apellido").value.trim();
    let correo = document.getElementById("correo").value.trim();
    let telefono = document.getElementById("telefono").value.trim();
    let pass = document.getElementById("pass").value;
    let pass2 = document.getElementById("pass2").value;

    if (nombre === "" || apellido === "" || correo === "" || telefono === "") {
        document.getElementById("mgError").innerHTML = "Completa todos los campos.";
        return;
    }

    if (pass !== pass2) {
        document.getElementById("mgError").innerHTML = "Las contraseñas no coinciden.";
        return;
    }

    document.getElementById("mgError").innerHTML =
        "Los datos son correctos. En esta versión académica no se guardan cuentas nuevas.";
}
