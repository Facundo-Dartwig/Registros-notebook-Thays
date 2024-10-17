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

// Formatear fecha y hora en formato latinoamericano
function formatearFechaHora(fechaHoraISO) {
    const fecha = new Date(fechaHoraISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos} hs`;
}

// Array para almacenar los registros de computadoras
let computadoras = JSON.parse(localStorage.getItem("computadoras")) || [];

// Agregar más campos de modelo dinámicamente
document.getElementById("addModelBtn").addEventListener("click", function() {
    const modelosContainer = document.getElementById("modelosContainer");
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "modelo";
    newInput.placeholder = "Ej: 15";
    newInput.required = true;
    modelosContainer.appendChild(newInput);
});

// Función para registrar computadoras
document.getElementById("computerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const responsable = document.getElementById("responsable").value;
    const curso = document.getElementById("curso").value;
    const prestador = document.getElementById("prestador").value;
    const fechaHora = document.getElementById("fechaHora").value;

    const modelos = Array.from(document.querySelectorAll(".modelo")).map(input => input.value);

    modelos.forEach(modelo => {
        const computadora = { 
            responsable, 
            curso, 
            modelo, 
            prestador, 
            fechaHora, 
            estado: 'Ingreso'  // Marcamos el estado como ingreso
        };
        computadoras.push(computadora);
    });

    localStorage.setItem("computadoras", JSON.stringify(computadoras));
    alert("Computadoras registradas correctamente");
    document.getElementById("computerForm").reset();
    document.getElementById("modelosContainer").innerHTML = '<input type="text" class="modelo" placeholder="Ej: 15" required>';
    mostrarComputadoras();
});

// Función para mostrar las computadoras en la tabla
function mostrarComputadoras() {
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

        const estadoCell = document.createElement("td");
        estadoCell.textContent = computadora.estado;

        const accionesCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Eliminar";
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

// Función para eliminar computadora
function eliminarComputadora(index) {
    const computadoraEliminada = computadoras[index];
    const fechaHoraEliminacion = new Date().toISOString(); // Fecha y hora actual para eliminación

    // Modificamos el estado de la computadora a "Egreso" y guardamos la fecha/hora de eliminación
    computadoraEliminada.estado = 'Egreso';
    computadoraEliminada.fechaHoraEliminacion = fechaHoraEliminacion;

    computadoras[index] = computadoraEliminada; // Actualizamos el registro
    localStorage.setItem("computadoras", JSON.stringify(computadoras)); // Guardamos los cambios
    mostrarComputadoras();
}

// Función para eliminar todos los registros
document.getElementById("clearAllBtn").addEventListener("click", function() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los registros?")) {
        computadoras = []; // Limpiamos el array
        localStorage.removeItem("computadoras"); // Limpiamos el localStorage
        mostrarComputadoras();
    }
});

// Registrar datos en el archivo Excel
function registrarEnExcel(computadoras) {
    const workbook = XLSX.utils.book_new();
    const worksheetData = computadoras.map(computadora => [
        computadora.responsable,
        computadora.curso,
        computadora.modelo,
        computadora.prestador,
        formatearFechaHora(computadora.fechaHora),
        computadora.estado,  // Estado de la computadora (Ingreso/Egreso)
        computadora.fechaHoraEliminacion ? formatearFechaHora(computadora.fechaHoraEliminacion) : "" // Fecha/hora de eliminación
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([["Responsable", "Curso", "Modelo", "Prestador", "Fecha/Hora", "Estado", "Fecha/Hora de Eliminación"], ...worksheetData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
    return workbook;
}

// Descargar el archivo Excel con los registros actuales
document.getElementById("downloadExcelBtn").addEventListener("click", function() {
    if (computadoras.length === 0) {
        alert("No hay registros para descargar.");
        return;  // No intentar descargar si no hay registros
    }
    const workbook = registrarEnExcel(computadoras);
    XLSX.writeFile(workbook, "Registros_Computadoras.xlsx");
});

// Cargar registros al cargar la página
window.onload = mostrarComputadoras;
