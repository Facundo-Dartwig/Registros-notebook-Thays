// Verificar si el usuario está autenticado
const isAuthenticated = localStorage.getItem("isAuthenticated");

if (!isAuthenticated || isAuthenticated !== "true") {
    window.location.href = "index.html";
}

// Función para cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "index.html";
});

// Función para formatear la fecha y hora en el formato latinoamericano (dd/mm/yyyy hh:mm hs)
function formatearFechaHora(fechaHoraISO) {
    const fecha = new Date(fechaHoraISO);
    
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');  // Los meses en JS son 0-11
    const anio = fecha.getFullYear();

    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos} hs`;
}


// Agregar más campos de modelo dinámicamente
document.getElementById("addModelBtn").addEventListener("click", function() {
    const modelosContainer = document.getElementById("modelosContainer");
    
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "modelo";
    newInput.placeholder = "Ej: Inspiron 15";
    newInput.required = true;

    modelosContainer.appendChild(newInput);
});

// Registrar varias computadoras con diferentes modelos
document.getElementById("computerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const responsable = document.getElementById("responsable").value;
    const curso = document.getElementById("curso").value;
    const prestador = document.getElementById("prestador").value;
    const fechaHora = document.getElementById("fechaHora").value;  // Obtener la fecha y hora del campo

    const modelos = Array.from(document.querySelectorAll(".modelo")).map(input => input.value);

    let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];

    modelos.forEach(modelo => {
        const computadora = { responsable, curso, modelo, prestador, fechaHora };
        computadoras.push(computadora);
        registrarEnExcel(computadora, "Egreso");
    });

    // Guardar en localStorage
    localStorage.setItem("computadoras", JSON.stringify(computadoras));

    // Mostrar mensaje de éxito
    alert("Computadoras registradas correctamente");

    // Limpiar formulario y modelos adicionales
    document.getElementById("computerForm").reset();
    document.getElementById("modelosContainer").innerHTML = '<input type="text" class="modelo" placeholder="Ej: Inspiron 15" required>';

    // Actualizar tabla
    mostrarComputadoras();
});

// Función para mostrar las computadoras registradas en la tabla
function mostrarComputadoras() {
    const computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    const tableBody = document.querySelector("#computerTable tbody");

    tableBody.innerHTML = "";

    computadoras.forEach(function(computadora, index) {
        const row = document.createElement("tr");

        const responsableCell = document.createElement("td");
        responsableCell.textContent = computadora.responsable;

        const cursoCell = document.createElement("td");
        cursoCell.textContent = computadora.curso;

        const modeloCell = document.createElement("td");
        modeloCell.textContent = computadora.modelo;

        const prestadorCell = document.createElement("td");
        prestadorCell.textContent = computadora.prestador;

        const fechaHoraCell = document.createElement("td");
        fechaHoraCell.textContent = formatearFechaHora(computadora.fechaHora);

        const accionesCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", function() {
            eliminarComputadora(index);
        });
        accionesCell.appendChild(deleteBtn);

        row.appendChild(responsableCell);
        row.appendChild(cursoCell);
        row.appendChild(modeloCell);
        row.appendChild(prestadorCell);
        row.appendChild(fechaHoraCell);
        row.appendChild(accionesCell);

        tableBody.appendChild(row);
    });
}

// Función para eliminar una computadora individualmente
function eliminarComputadora(index) {
    let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    computadoras.splice(index, 1);
    localStorage.setItem("computadoras", JSON.stringify(computadoras));
    mostrarComputadoras();

    const fechaHoraEliminacion = new Date().toISOString();
    eliminada.fechaHoraEliminacion = fechaHoraEliminacion;
    registrarEnExcel(eliminada, "Egreso");
}

// Función para eliminar todos los registros de computadoras
document.getElementById("clearAllBtn").addEventListener("click", function() {
    let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    const fechaHoraEliminacion = new Date().toISOString();

    computadoras.forEach(computadora => {
        computadora.fechaHoraEliminacion = fechaHoraEliminacion;
        registrarEnExcel(computadora, "Ingreso");
    });

    localStorage.removeItem("computadoras");
    mostrarComputadoras();
});

// Función para registrar en Excel y descargar el archivo
function registrarEnExcel(datos, tipo) {
    const computadorasExcel = datos.map(computadora => ({
        Responsable: computadora.responsable,
        Curso: computadora.curso,
        Modelo: computadora.modelo,
        Prestador: computadora.prestador,
        "Fecha y Hora de Registro": formatearFechaHora(computadora.fechaHora),
        Tipo: tipo,  // Ingreso o Egreso
        "Fecha y Hora de Eliminación": computadora.fechaHoraEliminacion ? formatearFechaHora(computadora.fechaHoraEliminacion) : ""
    }));

    const wb = XLSX.utils.book_new();  // Crear un nuevo libro de Excel
    const ws = XLSX.utils.json_to_sheet(computadorasExcel);  // Convertir los datos JSON a hoja de Excel
    XLSX.utils.book_append_sheet(wb, ws, "Computadoras");  // Añadir la hoja al libro
    return wb;
}

// Función para descargar el archivo Excel
function descargarExcel() {
    const computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];
    const wb = registrarEnExcel(computadoras, "Ingreso");

    // Descarga el archivo Excel generado
    XLSX.writeFile(wb, "computadoras_registro.xlsx");
}

// Asignar el evento al botón de descarga
document.getElementById("downloadExcelBtn").addEventListener("click", descargarExcel);


// Mostrar las computadoras al cargar la página
mostrarComputadoras();

