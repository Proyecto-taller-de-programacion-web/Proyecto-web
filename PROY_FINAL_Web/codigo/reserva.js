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


/*------------------ REGLAS DE NEGOCIO -----------------*/

// Cada cuenta puede tener, como máximo, 2 reservas por día y 3 reservas vigentes en total.
// "Vigente" = la fecha de la reserva es hoy o más adelante (las que ya pasaron no cuentan).
const MAX_RESERVAS_POR_DIA = 2;
const MAX_RESERVAS_TOTAL = 3;

// La fecha mínima del calendario siempre es hoy
selectorFecha.min = fechaDeHoy();

// Reservas de esa cuenta cuya fecha no ha pasado
function reservasVigentesDe(correo) {
    let hoy = fechaDeHoy();
    let guardadas = leerDato(CLAVES.reservasConfirmadas, []);
    let vigentes = [];

    for (let i = 0; i < guardadas.length; i++) {
        if (guardadas[i].usuario === correo && guardadas[i].fecha >= hoy) {
            vigentes.push(guardadas[i]);
        }
    }

    return vigentes;
}

// Cuántas reservas vigentes tiene esa cuenta en un día concreto
function contarReservasDelDia(correo, fecha) {
    let vigentes = reservasVigentesDe(correo);
    let total = 0;

    for (let i = 0; i < vigentes.length; i++) {
        if (vigentes[i].fecha === fecha) {
            total++;
        }
    }

    return total;
}

// Valida la fecha elegida. Devuelve un mensaje de error, o "" si todo está bien.
function validarFechaReserva(correo, fecha) {
    if (fecha < fechaDeHoy()) {
        return "Elige una fecha desde hoy en adelante.";
    }

    if (contarReservasDelDia(correo, fecha) >= MAX_RESERVAS_POR_DIA) {
        return "Ya tienes " + MAX_RESERVAS_POR_DIA + " reservas para el " + formatearFecha(fecha) +
            ". Solo se permiten " + MAX_RESERVAS_POR_DIA + " reservas por día: elige un día distinto.";
    }

    return "";
}


/*------------------ VENTANAS MODALES (dialog) -----------------*/

// Reserva armada que espera la confirmación del cliente
let reservaPendiente = null;

// Aviso general: título y texto cambian según el caso
function mostrarAviso(titulo, texto) {
    document.getElementById("avisoTitulo").textContent = titulo;
    document.getElementById("avisoTexto").textContent = texto;

    const modal = document.getElementById("modalAviso");
    if (!modal.open) {
        modal.showModal();
        modal.focus(); // el foco queda en la ventana, no sobre un botón
    }
}

function avisoAdministrador() {
    mostrarAviso("Cuenta de administrador",
        "Las cuentas de administrador solo pueden consultar las reservas. Para reservar, usa una cuenta de cliente.");
}

// Ventana "Por favor, inicia sesión" (solo para visitantes sin cuenta)
function abrirModalLogin() {
    const modal = document.getElementById("modalLogin");
    modal.showModal();
    modal.focus();
}

// "Cancelar": cierra la ventana y se queda en el paso 3 con todo lo elegido
function cerrarModalLogin() {
    document.getElementById("modalLogin").close();
}

function irAlLogin() {
    // Ruta desde paginas/5. reservar/ hacia paginas/0. login/
    window.location.href = "../../paginas/0. login/index.html";
}

function irAlInicio() {
    localStorage.removeItem(CLAVE_RESERVA); // se descarta lo que estaba armando
    window.location.href = "../../index.html";
}


/*------------------ PASO 2 y PASO 3 (botones SIGUIENTE) -----------------*/

// SIGUIENTE del paso 2: valida la fecha antes de ver los horarios
function validarPaso2() {
    const fecha = selectorFecha.value;
    if (!fecha || !selectorPersonas.value) return;

    const sesion = obtenerSesion();

    if (sesion && sesion.rol === "usuario") {
        const mensaje = validarFechaReserva(sesion.correo, fecha);
        if (mensaje) {
            mostrarAviso("Elige otro día", mensaje);
            return;
        }
    } else if (fecha < fechaDeHoy()) {
        mostrarAviso("Fecha no válida", "Elige una fecha desde hoy en adelante.");
        return;
    }

    document.getElementById("paso3").checked = true;
}

// SIGUIENTE del paso 3: guarda lo elegido y, según quién sea, avanza o pide iniciar sesión
function guardarDatos() {
    const sesion = obtenerSesion();

    if (sesion && sesion.rol === "admin") {
        avisoAdministrador();
        return;
    }

    if (bloquearSiLlegoAlLimite()) return;

    if (!horarioSeleccionado || !mesaSeleccionada) {
        mostrarAviso("Falta un horario", "Selecciona primero un horario disponible.");
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

    // Se guarda ANTES de preguntar por el login para no perder lo elegido
    localStorage.setItem(CLAVE_RESERVA, JSON.stringify(reservaTemporal));

    // Ya inició sesión: pasa al paso 4
    if (sesion) {
        const mensaje = validarFechaReserva(sesion.correo, filtros.fecha);
        if (mensaje) {
            document.getElementById("paso2").checked = true;
            mostrarAviso("Elige otro día", mensaje);
            return;
        }
        rellenarTitular();
        document.getElementById("paso4").checked = true;
        return;
    }

    // Visitante sin cuenta: ventana "Por favor, inicia sesión"
    abrirModalLogin();
}

// Actualiza la disponibilidad cuando cambie los filtros de la primera etapa
document.querySelectorAll('input[name="sede"], input[name="zona"]')

    .forEach(radio => {
        radio.addEventListener("change", mostrarHorarios);
    });

selectorPersonas.addEventListener("change", mostrarHorarios);
selectorFecha.addEventListener("change", mostrarHorarios);


/*------------------ DATOS DEL TITULAR -----------------*/

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


/*------------------ PASO 6: PAGO DE LA RESERVA -----------------*/

// IMPORTANTE: el número completo de la tarjeta y el CVV NUNCA se guardan
// (ni en localStorage ni en la reserva). Solo se guardan los últimos 4 dígitos.

const campoTarjeta = document.getElementById("numero-tarjeta");
const campoVence = document.getElementById("vence-tarjeta");
const campoCvv = document.getElementById("cvv-tarjeta");

// Muestra (o borra) el mensaje de error de un campo
function mostrarMensaje(idMensaje, texto) {
    document.getElementById(idMensaje).textContent = texto;
}

// Devuelve el mensaje de error del número de tarjeta, o "" si está bien
function errorTarjeta() {
    const digitos = campoTarjeta.value.replace(/\D/g, "");

    if (digitos.length === 0) return "Escribe los 16 dígitos de la tarjeta.";
    if (digitos.length < 16) return "Faltan " + (16 - digitos.length) + " dígitos.";
    return "";
}

// Fecha de vencimiento escrita como MM/AA
function errorVencimiento() {
    const texto = campoVence.value;

    if (texto.length < 5) return "Escribe el vencimiento como MM/AA.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(texto)) return "El mes debe estar entre 01 y 12.";

    const partes = texto.split("/");
    const mes = Number(partes[0]);
    const anio = 2000 + Number(partes[1]);
    const hoy = new Date();

    // La tarjeta vale hasta el último día del mes escrito
    if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
        return "La tarjeta está vencida.";
    }
    return "";
}

function errorCvv() {
    const texto = campoCvv.value;

    if (texto.length === 0) return "Escribe los 3 números de atrás de la tarjeta.";
    if (!/^\d{3}$/.test(texto)) return "Deben ser 3 números.";
    return "";
}

// Validación en tiempo real (addEventListener 'input', como en el ejercicio de clase)
campoTarjeta.addEventListener("input", function () {
    const digitos = this.value.replace(/\D/g, "").slice(0, 16);

    // Se agrupa de 4 en 4: 1234 5678 9012 3456
    this.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
    mostrarMensaje("msgTarjeta", digitos.length === 0 ? "" : errorTarjeta());
});

campoVence.addEventListener("input", function () {
    let digitos = this.value.replace(/\D/g, "").slice(0, 4);

    // Se agrega la "/" sola después del mes
    if (digitos.length > 2) {
        digitos = digitos.slice(0, 2) + "/" + digitos.slice(2);
    }
    this.value = digitos;
    mostrarMensaje("msgVence", digitos.length === 0 ? "" : errorVencimiento());
});

campoCvv.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 3);
    mostrarMensaje("msgCvv", this.value.length === 0 ? "" : errorCvv());
});

// Al darle a PAGAR: revisa los tres campos. Devuelve true si el pago es válido.
function validarPago() {
    const e1 = errorTarjeta();
    const e2 = errorVencimiento();
    const e3 = errorCvv();

    mostrarMensaje("msgTarjeta", e1);
    mostrarMensaje("msgVence", e2);
    mostrarMensaje("msgCvv", e3);

    return e1 === "" && e2 === "" && e3 === "";
}


/*------------------ ENVÍO FINAL (botón PAGAR del paso 6) -----------------*/

function finalizarReserva(evento) {
    evento.preventDefault();

    const sesion = obtenerSesion();
    if (!sesion) {
        guardarDatos(); // sesión cerrada en otra pestaña: de nuevo a la ventana de login
        return;
    }

    // Solo las cuentas de cliente reservan; el administrador únicamente consulta
    if (sesion.rol !== "usuario") {
        avisoAdministrador();
        return;
    }

    // Máximo 3 reservas vigentes en total
    if (bloquearSiLlegoAlLimite()) return;

    if (!horarioSeleccionado || !mesaSeleccionada) {
        mostrarAviso("Falta un horario", "Selecciona primero un horario disponible.");
        document.getElementById("paso3").checked = true;
        return;
    }

    const filtros = obtenerFiltros();
    const horaFin = calcularHoraFin(horarioSeleccionado);

    // Máximo 2 reservas por día
    const mensajeDia = validarFechaReserva(sesion.correo, filtros.fecha);
    if (mensajeDia) {
        document.getElementById("paso2").checked = true;
        mostrarAviso("Elige otro día", mensajeDia);
        return;
    }

    // Última comprobación: que nadie haya tomado la mesa mientras tanto
    if (!mesaEstaLibre(mesaSeleccionada.id, filtros.fecha, horarioSeleccionado, horaFin)) {
        alert("Esa mesa acaba de ser reservada. Elige otro horario.");
        mostrarHorarios();
        document.getElementById("paso3").checked = true;
        return;
    }

    // Datos de la tarjeta (simulado: no hay pasarela de pago real)
    if (!validarPago()) return;

    const digitos = campoTarjeta.value.replace(/\D/g, "");

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
        },
        pago: {
            metodo: "Tarjeta",
            ultimos4: digitos.slice(-4)
        }
    };

    // Todavía NO se guarda: primero se muestra el resumen en una ventana modal
    // (botón "Reservar" -> confirmarReserva()).
    reservaPendiente = reserva;
    document.getElementById("cajaResumen").innerHTML = reporteReserva(reserva, true);
    const ventanaResumen = document.getElementById("modalResumen");
    ventanaResumen.showModal();
    ventanaResumen.focus(); // el foco queda en la ventana, no sobre un botón
}

// Botón "Reservar" de la ventana del resumen: recién aquí se guarda
function confirmarReserva() {
    document.getElementById("modalResumen").close();

    if (!reservaPendiente) return;

    // Últimas comprobaciones antes de guardar
    const sesion = obtenerSesion();
    if (!sesion || sesion.rol !== "usuario") return;

    if (bloquearSiLlegoAlLimite()) return;

    const mensajeDia = validarFechaReserva(sesion.correo, reservaPendiente.fecha);
    if (mensajeDia) {
        document.getElementById("paso2").checked = true;
        mostrarAviso("Elige otro día", mensajeDia);
        return;
    }

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

    // Ventana de "reserva exitosa" que ya tenía el proyecto
    window.location.href = "confirmacion.html";
}


/*------------------ REPORTE DE UNA RESERVA -----------------*/

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

        // Solo se muestran los últimos 4 dígitos de la tarjeta
        if (reserva.pago) {
            cad += `
                <h3 class="modal-seccion">Pago</h3>
                <p><strong>Método</strong><span>${reserva.pago.metodo} •••• ${reserva.pago.ultimos4}</span></p>
            `;
        }
    }

    return cad;
}


/*------------------ LÍMITE: MÁXIMO 3 RESERVAS VIGENTES -----------------*/

// Si la cuenta ya tiene 3 reservas vigentes, lo avisa en una ventana modal con la lista
// (cada una con su botón "Cancelar") y devuelve true para detener el proceso.
function bloquearSiLlegoAlLimite() {
    const sesion = obtenerSesion();
    if (!sesion || sesion.rol !== "usuario") return false;

    const vigentes = reservasVigentesDe(sesion.correo);
    if (vigentes.length < MAX_RESERVAS_TOTAL) return false;

    let cad = "";
    for (let i = 0; i < vigentes.length; i++) {
        let r = vigentes[i];
        cad += `
            <div class="fila-reserva">
                <div>
                    <strong>${formatearFecha(r.fecha)} · ${r.horaInicio}</strong>
                    <span>${r.sede} - ${r.salon} · Mesa ${r.mesaId}</span>
                </div>
                <button type="button" class="btn-fila" onclick="cancelarReserva('${r.id}')">Cancelar</button>
            </div>
        `;
    }
    document.getElementById("cajaReservaActiva").innerHTML = cad;

    const modal = document.getElementById("modalReservaActiva");
    if (!modal.open) {
        modal.showModal();
        modal.focus(); // el foco queda en la ventana, no sobre un botón
    }
    return true;
}

// Botón "Cancelar" de una reserva de la lista (igual que confirEliminar de clase)
function cancelarReserva(id) {
    let sesion = obtenerSesion();
    if (sesion === null) return;

    let respuesta = confirm("¿Estás seguro de cancelar esta reserva?");

    if (respuesta === true) {
        let guardadas = leerDato(CLAVES.reservasConfirmadas, []);
        let quedan = [];

        // Se guardan todas las reservas, menos la que se está cancelando
        // (y solo se puede cancelar una reserva propia)
        for (let i = 0; i < guardadas.length; i++) {
            if (!(guardadas[i].id === id && guardadas[i].usuario === sesion.correo)) {
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
    return leerDato(CLAVE_RESERVA, null);
}

// Restaura los filtros y continúa al paso 4 (o al paso 2 si la fecha ya no se permite)

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

    // La cuenta pudo cambiar al iniciar sesión: se revisa la regla de 2 reservas por día
    const sesion = obtenerSesion();
    const mensajeDia = validarFechaReserva(sesion.correo, reserva.fecha);

    if (mensajeDia) {
        document.getElementById("paso2").checked = true;
        mostrarAviso("Elige otro día", mensajeDia);
        localStorage.removeItem(CLAVE_RESERVA);
        return;
    }

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

        mostrarAviso(
            "Horario no disponible",
            "El horario que elegiste ya no está disponible. Selecciona otro."
        );

        document.getElementById("paso3").checked = true;

        localStorage.removeItem(CLAVE_RESERVA);

    }
}

// ==========================================
// RECUPERAR RESERVA SOLO SI VIENE DEL LOGIN
// ==========================================

const parametrosURL = new URLSearchParams(window.location.search);

const vieneDelLogin = parametrosURL.get("continuar") === "1";

const sesionInicial = obtenerSesion();

if (bloquearSiLlegoAlLimite()) {

    // La cuenta ya tiene 3 reservas vigentes. Si venía del login se conserva lo que
    // estaba armando (por si cancela una reserva y quiere continuar); si no, se descarta.
    if (!vieneDelLogin) {
        localStorage.removeItem(CLAVE_RESERVA);
    }

} else if (vieneDelLogin && sesionInicial && sesionInicial.rol === "usuario") {

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
// LIMPIAR FORMULARIO
// ==========================================

// (El envío y el reset se conectan en el HTML con
//  onsubmit="finalizarReserva(event)" y onreset="limpiarReserva()")

// "Limpiar formulario" también descarta el horario elegido, la reserva temporal
// y los mensajes de error del pago
function limpiarReserva() {
    localStorage.removeItem(CLAVE_RESERVA);
    mostrarMensaje("msgTarjeta", "");
    mostrarMensaje("msgVence", "");
    mostrarMensaje("msgCvv", "");
    setTimeout(mostrarHorarios, 0);
}

// El enlace "Cerrar Sesión" del menú lo maneja almacen.js en todas las páginas.
