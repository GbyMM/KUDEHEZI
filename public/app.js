const container = document.querySelector('.container');
const formulario = document.querySelector('#formularioAnnadir');
//guardar cada input del formulario en una variable
const nombreInput = document.querySelector('#nombre');
const telefonoInput = document.querySelector('#telefono');
const emailInput = document.querySelector('#email');
const entidadInput = document.querySelector('#asociacionEntidad');
const tipoAccionInput = document.querySelector('#tipoAccion');
const checkboxes = document.querySelectorAll('input[name="responsableAccion[]"]:checked');


async function renderAcciones() {
    const response = await fetch('/api/acciones');
    const acciones = await response.json();
    console.log(acciones);
    container.replaceChildren(); // Limpiar el contenido actual del contenedor

    acciones.forEach(accion => {
        const div = document.createElement('div'); // Tarjeta principal
        div.classList.add('containerPerson');

        // Nombre
        const nombre = document.createElement('p');
        nombre.classList.add('name');
        nombre.textContent = accion.nombre;

        // Entidad
        const entidad = document.createElement('p');
        entidad.classList.add('entidad');
        entidad.textContent = accion.asociacionEntidad;

        // Tipo de acción
        const tipoAccion = document.createElement('p');
        tipoAccion.classList.add('tipoAccion');
        tipoAccion.textContent = accion.tipoAccion;

        // Responsable
        const responsable = document.createElement('p');
        responsable.classList.add('responsable');
        responsable.textContent = accion.responsableAccion;

        // Fecha (rango)
        const fecha = document.createElement('p');
        fecha.classList.add('fechas');
        let inicio = accion.fechaInicio ? new Date(accion.fechaInicio).toLocaleDateString() : '';
        let fin = accion.fechaFin ? new Date(accion.fechaFin).toLocaleDateString() : '';
        fecha.textContent = inicio && fin ? `Del ${inicio} al ${fin}` : '';

        // Contenedor de botones editar/eliminar
        const editar = document.createElement('div');
        editar.classList.add('editar');

        // Botón editar
        const editarBtn = document.createElement('button');
        const iconoEditar = document.createElement('i');
        iconoEditar.classList.add('fa-solid', 'fa-pen');
        editarBtn.appendChild(iconoEditar);
        editarBtn.addEventListener('click', () => {
            // Lógica para editar
        });

        // Botón eliminar
        const eliminarBtn = document.createElement('button');
        const iconoEliminar = document.createElement('i');
        iconoEliminar.classList.add('fa-solid', 'fa-trash');
        eliminarBtn.appendChild(iconoEliminar);
        eliminarBtn.addEventListener('click', () => {
            // Lógica para eliminar
        });

        // Añadir botones al contenedor de acciones
        editar.appendChild(editarBtn);
        editar.appendChild(eliminarBtn);

        // Añadir todos los elementos a la tarjeta principal
        div.appendChild(nombre);
        div.appendChild(entidad);
        div.appendChild(tipoAccion);
        div.appendChild(responsable);
        div.appendChild(fecha);
        div.appendChild(editar);

        // Agregar la tarjeta al contenedor general
        container.appendChild(div);
    });
}


renderAcciones();
