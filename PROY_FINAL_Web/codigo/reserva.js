// ==========================================
// LA VACA ROJA - RESERVAS
// ==========================================

// La última mesa de cada zona es la mesa grande: tiene capacidad para 15 personas.
// (buscarMesaDisponible toma la primera mesa del arreglo que alcance, por eso
// las mesas grandes van al final de cada zona.)
const mesas = [


    // ------------------------ Sede: MIRAFLORES --------------------

    // MIRAFLORES - SALÓN PRINCIPAL
    { id: 1, sede: "miraflores", salon: "salon-principal", capacidad: 2 },
    { id: 2, sede: "miraflores", salon: "salon-principal", capacidad: 2 },
    { id: 3, sede: "miraflores", salon: "salon-principal", capacidad: 4 },
    { id: 4, sede: "miraflores", salon: "salon-principal", capacidad: 4 },
    { id: 5, sede: "miraflores", salon: "salon-principal", capacidad: 15 },

    // MIRAFLORES - LOUNGE
    { id: 6, sede: "miraflores", salon: "lounge", capacidad: 2 },
    { id: 7, sede: "miraflores", salon: "lounge", capacidad: 4 },
    { id: 8, sede: "miraflores", salon: "lounge", capacidad: 6 },
    { id: 9, sede: "miraflores", salon: "lounge", capacidad: 15 },

    // MIRAFLORES - TERRAZA ALTA
    { id: 10, sede: "miraflores", salon: "terraza-alta", capacidad: 2 },
    { id: 11, sede: "miraflores", salon: "terraza-alta", capacidad: 4 },
    { id: 12, sede: "miraflores", salon: "terraza-alta", capacidad: 6 },
    { id: 13, sede: "miraflores", salon: "terraza-alta", capacidad: 15 },

    // ------------------------ Sede: SAN ISIDRO --------------------

    // SAN ISIDRO - SALÓN PRINCIPAL
    { id: 14, sede: "san-isidro", salon: "salon-principal", capacidad: 2 },
    { id: 15, sede: "san-isidro", salon: "salon-principal", capacidad: 2 },
    { id: 16, sede: "san-isidro", salon: "salon-principal", capacidad: 4 },
    { id: 17, sede: "san-isidro", salon: "salon-principal", capacidad: 4 },
    { id: 18, sede: "san-isidro", salon: "salon-principal", capacidad: 6 },
    { id: 19, sede: "san-isidro", salon: "salon-principal", capacidad: 15 },

    // SAN ISIDRO - LOUNGE
    { id: 20, sede: "san-isidro", salon: "lounge", capacidad: 2 },
    { id: 21, sede: "san-isidro", salon: "lounge", capacidad: 4 },
    { id: 22, sede: "san-isidro", salon: "lounge", capacidad: 6 },
    { id: 23, sede: "san-isidro", salon: "lounge", capacidad: 15 },

    // SAN ISIDRO - TERRAZA ALTA
    { id: 24, sede: "san-isidro", salon: "terraza-alta", capacidad: 2 },
    { id: 25, sede: "san-isidro", salon: "terraza-alta", capacidad: 4 },
    { id: 26, sede: "san-isidro", salon: "terraza-alta", capacidad: 6 },
    { id: 27, sede: "san-isidro", salon: "terraza-alta", capacidad: 8 },
    { id: 28, sede: "san-isidro", salon: "terraza-alta", capacidad: 15 }

];

// Reservas de demostración. Las reservas confirmadas ocupan mesa.
const reservas = [
    {
        mesaId: 13,
        fecha: "2026-11-28",
        horaInicio: "12:00",
        horaFin: "14:00",
        estado: "confirmada"
    },

    {
        mesaId: 13,
        fecha: "2026-11-28",
        horaInicio: "18:00",
        horaFin: "20:00",
        estado: "confirmada"
    },

];
// Se suman las reservas confirmadas que ya quedaron guardadas en este navegador,
// para que esas mesas aparezcan como ocupadas.
let reservasGuardadas = leerDato(CLAVES.reservasConfirmadas, []);
for (let i = 0; i < reservasGuardadas.length; i++) {
    reservas.push(reservasGuardadas[i]);
}

const DURACION_RESERVA_MIN = 120;
const CLAVE_RESERVA = "reservaTemporal";
let mesaSeleccionada = null;
let horarioSeleccionado = null;

//Seleccionamos elementos

const contenedor = document.getElementById("contenedor-horarios");
const selectorPersonas = document.getElementById("numero-personas");
const selectorFecha = document.getElementById("fecha-reserva");
const botonLogin = document.getElementById("btn-ir-login");

//Obtener la sede y el lugar seleccionados

function obtenerValorRadio(nombre) {
    const seleccionado = document.querySelector(
        `input[name="${nombre}"]:checked`);
    return seleccionado ? seleccionado.value : "";
}

function obtenerFiltros() {
    return {
        sede: obtenerValorRadio("sede"),
        salon: obtenerValorRadio("zona"),
        personas: Number(selectorPersonas.value),
        fecha: selectorFecha.value
    };
}


//Función para convertir de HORAS A MINUTOS y MINUTOS a HORAS

function horaAMinutos(hora) {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos;
}
function minutosAHora(totalMinutos) {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return String(horas).padStart(2, "0") + ":" +
        String(minutos).padStart(2, "0");
}

//Función para calcular la hora de FIN

function calcularHoraFin(horaInicio) {
    return minutosAHora(
        horaAMinutos(horaInicio) + DURACION_RESERVA_MIN
    );
}

//Función para evitar que el navegador interprete mal una reserva, según la zona horaria local.

function obtenerHorarios(fecha) {
    // getUTCDay evita que la fecha YYYY-MM-DD cambie por zona horaria.
    const dia = new Date(fecha + "T00:00:00Z").getUTCDay();
    // 0 = domingo; 1 = lunes; 2 a 6 = martes a sábado.
    if (dia === 1) return [];
    const ultimoInicio = dia === 0 ? 17 : 20;
    const horarios = [];
    for (let hora = 12; hora <= ultimoInicio; hora++) {
        horarios.push(String(hora).padStart(2, "0") + ":00");
    }
    return horarios;
}


//Función para comprobar si dos reservas se cruzan

function hayCruce(inicioNuevo, finNuevo, inicioExistente, finExistente) {

    return horaAMinutos(inicioNuevo) < horaAMinutos(finExistente) &&
        horaAMinutos(finNuevo) > horaAMinutos(inicioExistente);
}

function mesaEstaLibre(mesaId, fecha, horaInicio, horaFin) {
    return !reservas.some(reserva => {
        if (reserva.mesaId !== mesaId ||
            reserva.fecha !== fecha ||
            reserva.estado !== "confirmada") {
            return false;
        }
        return hayCruce(
            horaInicio,
            horaFin,
            reserva.horaInicio,
            reserva.horaFin
        );
    });
}

//Función para buscar la Mesa disponible

function buscarMesaDisponible(filtros, horaInicio) {
    const horaFin = calcularHoraFin(horaInicio);
    const mesasAdecuadas = mesas.filter(mesa =>
        mesa.sede === filtros.sede &&
        mesa.salon === filtros.salon &&
        mesa.capacidad >= filtros.personas
    );

    return mesasAdecuadas.find(mesa =>
        mesaEstaLibre(
            mesa.id,
            filtros.fecha,
            horaInicio,
            horaFin
        )
    ) || null;
}


// Función para seleccionar un horario
function seleccionarHorario(hora, mesa) {
    horarioSeleccionado = hora;
    mesaSeleccionada = mesa;
    document.querySelectorAll("#contenedor-horarios .horario")
        .forEach(boton => boton.classList.remove("seleccionado"));
    const botonElegido = document.querySelector(
        `#contenedor-horarios button[data-hora="${hora}"]`
    );
    if (botonElegido) {
        botonElegido.classList.add("seleccionado");
    }
}


/*------------------CREAR LOS BOTONES CON LOS HORARIOS y los muestra-----------------*/

function mostrarHorarios() {
    contenedor.innerHTML = "";
    horarioSeleccionado = null;
    mesaSeleccionada = null;
    const filtros = obtenerFiltros();

    if (!filtros.sede || !filtros.salon ||
        !filtros.personas || !filtros.fecha) {
        contenedor.textContent = "Completa los cuatro filtros para consultar.";
        return;
    }

    const horarios = obtenerHorarios(filtros.fecha);
    if (horarios.length === 0) {
        contenedor.textContent = "No hay reservas disponibles para ese día.";
        return;
    }

    horarios.forEach(hora => {
        const mesa = buscarMesaDisponible(filtros, hora);
        const boton = document.createElement("button");
        boton.type = "button";
        boton.classList.add("horario");
        boton.textContent = hora;
        boton.dataset.hora = hora;
        if (mesa) {
            boton.classList.add("disponible");
            boton.setAttribute("aria-label", hora + ", disponible");
            boton.addEventListener("click", () => {
                seleccionarHorario(hora, mesa);
            });
        } else {
            boton.classList.add("ocupado");
            boton.disabled = true;
            boton.textContent = hora + " · No disponible";
        }
        contenedor.appendChild(boton);
    });
}


/* Función para guardar los datos cuando nos mande al LOGIN*/

function guardarDatos() {
    // Un cliente no puede tener más de una reserva activa
    if (bloquearSiTieneReserva()) return;

    if (!horarioSeleccionado || !mesaSeleccionada) {
        alert("Selecciona primero un horario disponible.");
        return;
    }
    const filtros = obtenerFiltros();
    const reservaTemporal = {
        sede: filtros.sede,
        salon: filtros.salon,
        personas: filtros.personas,
        fecha: filtros.fecha,
        horario: horarioSeleccionado,
        horaFin: calcularHoraFin(horarioSeleccionado),
        mesaId: mesaSeleccionada.id
    };

    localStorage.setItem(CLAVE_RESERVA, JSON.stringify(reservaTemporal)
    );

    // Si ya inició sesión antes, no hace falta pasar por el login
    if (obtenerSesion()) {
        rellenarTitular();
        document.getElementById("paso4").checked = true;
        return;
    }

    // Aún no inició sesión: va directo al login
    irAlLogin();
}

function irAlLogin() {
    // Ruta desde paginas/5. reservar/ hacia paginas/0. login/
    window.location.href = "../../paginas/0. login/index.html";
}


// Actualiza la disponibilidad cuando cambie los filtros de la primera etapa
document.querySelectorAll('input[name="sede"], input[name="zona"]')

    .forEach(radio => {
        radio.addEventListener("change", mostrarHorarios);
    });

selectorPersonas.addEventListener("change", mostrarHorarios);
selectorFecha.addEventListener("change", mostrarHorarios);


/*------------------ DATOS DEL TITULAR Y RESERVA FINAL -----------------*/

// Rellena el paso 4 con los datos de la cuenta (sin pisar lo que ya se escribió)
function rellenarTitular() {
    const sesion = obtenerSesion();
    if (!sesion) return;

    if (document.getElementById("nombre").value === "") {
        document.getElementById("nombre").value = sesion.nombre;
    }
    if (document.getElementById("apellido").value === "") {
        document.getElementById("apellido").value = sesion.apellido;
    }
    if (document.getElementById("correo").value === "") {
        document.getElementById("correo").value = sesion.correo;
    }
    if (document.getElementById("telefono").value === "") {
        document.getElementById("telefono").value = sesion.telefono;
    }
}

// Texto que se muestra de la sede ("san-isidro" -> "San Isidro")
function nombreSede(valor) {
    switch (valor) {
        case "san-isidro":
            return "San Isidro";
        case "miraflores":
            return "Miraflores";
        default:
            return valor;
    }
}

// Texto que se muestra de la zona ("salon-principal" -> "Salón Principal")
function nombreSalon(valor) {
    switch (valor) {
        case "salon-principal":
            return "Salón Principal";
        case "lounge":
            return "Lounge";
        case "terraza-alta":
            return "Terraza Alta";
        default:
            return valor;
    }
}

// Envío final (botón RESERVAR del paso 5)
function finalizarReserva(evento) {
    evento.preventDefault();

    const sesion = obtenerSesion();
    if (!sesion) {
        guardarDatos(); // sesión cerrada en otra pestaña: de nuevo al login
        return;
    }

    // Un cliente no puede tener más de una reserva activa
    if (bloquearSiTieneReserva()) return;

    if (!horarioSeleccionado || !mesaSeleccionada) {
        alert("Selecciona primero un horario disponible.");
        document.getElementById("paso3").checked = true;
        return;
    }

    const filtros = obtenerFiltros();
    const horaFin = calcularHoraFin(horarioSeleccionado);

    // Última comprobación: que nadie haya tomado la mesa mientras tanto
    if (!mesaEstaLibre(mesaSeleccionada.id, filtros.fecha, horarioSeleccionado, horaFin)) {
        alert("Esa mesa acaba de ser reservada. Elige otro horario.");
        mostrarHorarios();
        document.getElementById("paso3").checked = true;
        return;
    }

    // Mismos nombres de campo que el arreglo "reservas" (mesaId, fecha, horaInicio,
    // horaFin, estado) para que esta mesa quede ocupada en las próximas consultas.
    const reserva = {
        usuario: sesion.correo,
        mesaId: mesaSeleccionada.id,
        fecha: filtros.fecha,
        horaInicio: horarioSeleccionado,
        horaFin: horaFin,
        estado: "confirmada",
        sede: nombreSede(filtros.sede),
        salon: nombreSalon(filtros.salon),
        personas: filtros.personas,
        titular: {
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim()
        },
        adicional: {
            motivo: document.getElementById("motivo-reserva").value.trim(),
            requerimiento: document.getElementById("requerimiento").value.trim(),
            necesidad: document.getElementById("necesidad").value.trim(),
            alergias: document.getElementById("alergias").value.trim()
        }
    };

    // Todavía NO se guarda: primero se muestra el resumen en una ventana modal
    // para que el cliente confirme (botón "Confirmar reserva" -> confirmarReserva()).
    reservaPendiente = reserva;
    document.getElementById("cajaResumen").innerHTML = reporteReserva(reserva, true);
    const ventanaResumen = document.getElementById("modalResumen");
    ventanaResumen.showModal();
    ventanaResumen.focus(); // el foco queda en la ventana, no sobre un botón
}

// Botón "Confirmar reserva" de la ventana modal: recién aquí se guarda
function confirmarReserva() {
    document.getElementById("modalResumen").close();

    if (!reservaPendiente) return;

    // Últimas comprobaciones antes de guardar
    if (bloquearSiTieneReserva()) return;

    if (!mesaEstaLibre(reservaPendiente.mesaId, reservaPendiente.fecha,
                       reservaPendiente.horaInicio, reservaPendiente.horaFin)) {
        alert("Esa mesa acaba de ser reservada. Elige otro horario.");
        mostrarHorarios();
        document.getElementById("paso3").checked = true;
        return;
    }

    reservaPendiente.id = "VR-" + Date.now();

    const guardadas = leerDato(CLAVES.reservasConfirmadas, []);
    guardadas.push(reservaPendiente);
    guardarDato(CLAVES.reservasConfirmadas, guardadas);

    localStorage.removeItem(CLAVE_RESERVA); // la reserva ya está completa
    reservaPendiente = null;

    // Pantalla de confirmación que ya tenía el proyecto
    window.location.href = "confirmacion.html";
}


/*------------------ VENTANAS MODALES (dialog) -----------------*/

// Reserva armada que espera la confirmación del cliente
let reservaPendiente = null;

function irAlInicio() {
    localStorage.removeItem(CLAVE_RESERVA); // se descarta lo que estaba armando
    window.location.href = "../../index.html";
}

// 2026-11-20 -> 20/11/2026
function formatearFecha(fecha) {
    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

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

// Reporte de una reserva (se arma con comillas invertidas y se muestra con innerHTML,
// igual que el "cajaReporte" de clase)
// Con completo = true muestra TODOS los datos (se usa en el resumen para confirmar).
function reporteReserva(reserva, completo) {
    let cad = `<h3 class="modal-seccion">Detalle de la reserva</h3>`;

    // El código solo existe cuando la reserva ya fue confirmada
    if (reserva.id) {
        cad += `<p class="fila-codigo"><strong>Código</strong><span>${reserva.id}</span></p>`;
    }

    cad += `
        <p><strong>Sede</strong><span>${reserva.sede} - ${reserva.salon}</span></p>
        <p><strong>Mesa</strong><span>N.º ${reserva.mesaId}</span></p>
        <p><strong>Fecha</strong><span>${formatearFecha(reserva.fecha)}</span></p>
        <p><strong>Horario</strong><span>${reserva.horaInicio} - ${reserva.horaFin}</span></p>
        <p><strong>Personas</strong><span>${reserva.personas}</span></p>

        <h3 class="modal-seccion">Titular</h3>
        <p><strong>Nombre</strong><span>${escaparHTML(reserva.titular.nombre)} ${escaparHTML(reserva.titular.apellido)}</span></p>
    `;

    if (completo) {
        cad += `
            <p><strong>Correo</strong><span>${escaparHTML(reserva.titular.correo)}</span></p>
            <p><strong>Teléfono</strong><span>${escaparHTML(reserva.titular.telefono)}</span></p>

            <h3 class="modal-seccion">Información adicional</h3>
            <p><strong>Motivo</strong><span>${escaparHTML(reserva.adicional.motivo) || "—"}</span></p>
            <p><strong>Requerimiento</strong><span>${escaparHTML(reserva.adicional.requerimiento) || "—"}</span></p>
            <p><strong>Necesidad</strong><span>${escaparHTML(reserva.adicional.necesidad) || "—"}</span></p>
            <p><strong>Alergias</strong><span>${escaparHTML(reserva.adicional.alergias) || "—"}</span></p>
        `;
    }

    return cad;
}


/*------------------ UN CLIENTE = UNA RESERVA ACTIVA -----------------*/

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

// Una reserva está "activa" mientras su fecha no haya pasado
function buscarReservaActiva(correo) {
    let hoy = fechaDeHoy();
    let guardadas = leerDato(CLAVES.reservasConfirmadas, []);

    for (let i = 0; i < guardadas.length; i++) {
        if (guardadas[i].usuario === correo && guardadas[i].fecha >= hoy) {
            return guardadas[i];
        }
    }

    return null;
}

// Si el cliente ya tiene una reserva activa, lo avisa en una ventana modal
// y devuelve true para que quien la llamó detenga el proceso.
function bloquearSiTieneReserva() {
    const sesion = obtenerSesion();
    if (!sesion) return false;

    const activa = buscarReservaActiva(sesion.correo);
    if (!activa) return false;

    document.getElementById("cajaReservaActiva").innerHTML = reporteReserva(activa);

    const modal = document.getElementById("modalReservaActiva");
    if (!modal.open) {
        modal.showModal();
        modal.focus(); // el foco queda en la ventana, no sobre un botón
    }
    return true;
}

// Botón "Cancelar reserva" de la ventana modal (igual que confirEliminar de clase)
function cancelarReserva() {
    let sesion = obtenerSesion();
    if (sesion === null) return;

    let respuesta = confirm("¿Estás seguro de cancelar tu reserva?");

    if (respuesta === true) {
        let activa = buscarReservaActiva(sesion.correo);
        let guardadas = leerDato(CLAVES.reservasConfirmadas, []);
        let quedan = [];

        // Se guardan todas las reservas, menos la que se está cancelando
        for (let i = 0; i < guardadas.length; i++) {
            if (activa === null || guardadas[i].id !== activa.id) {
                quedan.push(guardadas[i]);
            }
        }

        guardarDato(CLAVES.reservasConfirmadas, quedan);
        alert("Reserva cancelada");

        // Se recarga la página: la mesa vuelve a quedar libre y, si venía del login,
        // continúa con la reserva que estaba armando (?continuar=1)
        location.href = "index.html?continuar=1";
    } else {
        alert("Acción cancelada");
    }
}


/*------------------ VOLVIENDO DEL LOGIN   -----------------*/

// Recupera la reserva temporal, que fue guardada con LocalStorage

function recuperarReservaTemporal() {

    const textoGuardado = localStorage.getItem(CLAVE_RESERVA);

    if (!textoGuardado) return null;

    try {

        return JSON.parse(textoGuardado);

    } catch (error) {

        console.error(
            "No se pudo leer la reserva temporal:",
            error
        );

        localStorage.removeItem(CLAVE_RESERVA);

        return null;

    }

}

//Restaura los filtros y continua al paso 4

function restaurarFiltros(reserva) {

    const radioSede = document.querySelector(
        `input[name="sede"][value="${reserva.sede}"]`
    );

    const radioSalon = document.querySelector(
        `input[name="zona"][value="${reserva.salon}"]`
    );

    if (radioSede) radioSede.checked = true;

    if (radioSalon) radioSalon.checked = true;

    selectorPersonas.value = String(reserva.personas);

    selectorFecha.value = reserva.fecha;

    mostrarHorarios();

    const filtros = obtenerFiltros();

    const mesaActual = buscarMesaDisponible(
        filtros,
        reserva.horario
    );

    if (mesaActual) {

        seleccionarHorario(reserva.horario, mesaActual);

        const paso4 = document.getElementById("paso4");

        rellenarTitular();

        if (paso4) paso4.checked = true;

    } else {

        alert(
            "El horario ya no está disponible. Selecciona otro."
        );

        localStorage.removeItem(CLAVE_RESERVA);

    }
}

// ==========================================
// RECUPERAR RESERVA SOLO SI VIENE DEL LOGIN
// ==========================================

const parametrosURL = new URLSearchParams(window.location.search);

const vieneDelLogin = parametrosURL.get("continuar") === "1";

if (bloquearSiTieneReserva()) {

    // El cliente ya tiene una reserva activa. Si venía del login se conserva lo que
    // estaba armando (por si cancela su reserva y quiere continuar); si no, se descarta.
    if (!vieneDelLogin) {
        localStorage.removeItem(CLAVE_RESERVA);
    }

} else if (vieneDelLogin && obtenerSesion()) {

    const reservaRecuperada = recuperarReservaTemporal();

    if (reservaRecuperada) {
        restaurarFiltros(reservaRecuperada);
    }

} else {

    // Si entra normalmente a RESERVAR,
    // eliminamos cualquier reserva temporal anterior.
    localStorage.removeItem(CLAVE_RESERVA);

}

// ==========================================
// ENVÍO FINAL, LIMPIAR FORMULARIO Y SESIÓN
// ==========================================

// (El envío y el reset se conectan en el HTML con
//  onsubmit="finalizarReserva(event)" y onreset="limpiarReserva()")

// "Limpiar formulario" también descarta el horario elegido y la reserva temporal
function limpiarReserva() {
    localStorage.removeItem(CLAVE_RESERVA);
    setTimeout(mostrarHorarios, 0);
}

// El enlace "Cerrar Sesión" del menú lo maneja almacen.js en todas las páginas.
