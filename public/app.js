/* -----BLOQUE UNO--- */
const container = document.querySelector('.container');
let accionesOriginales = [];/* variable global */
if (container) {
  renderAcciones();
}
/* ------BLOQUE DOS------ */

// --- FUNCIÓN PARA CARGAR Y GUARDAR ACCIONES ORIGINALES ---
async function renderAcciones() {
  try {
    const response = await fetch('/api/acciones');
    if (!response.ok) throw new Error('Fallo al obtener acciones');

    accionesOriginales = await response.json();
    aplicarFiltrosYRender();
  } catch (err) {
    console.error('Error al renderizar acciones:', err);
  }
}
/* ------------------------------------------------------ */

// --- FUNCIÓN PARA APLICAR FILTROS Y RENDERIZAR ---
function aplicarFiltrosYRender() {
  const nombreFiltro = document.getElementById('filtroNombre')?.value.toLowerCase() || '';
  const entidadFiltro = document.getElementById('filtroEntidad')?.value.toLowerCase() || '';
  const fechaDesde = document.getElementById('fechaInicioDesde')?.value;
  const fechaHasta = document.getElementById('fechaInicioHasta')?.value;

  const accionesFiltradas = accionesOriginales.filter(accion => {
    const nombre = accion.nombre?.toLowerCase() || '';
    const entidad = accion.asociacionEntidad?.toLowerCase() || '';
    const fechaInicio = accion.fechaInicio ? new Date(accion.fechaInicio) : null;

    const pasaNombre = nombre.includes(nombreFiltro);
    const pasaEntidad = entidad.includes(entidadFiltro);

    let pasaFecha = true;
    if (fechaDesde) {
      pasaFecha = fechaInicio && fechaInicio >= new Date(fechaDesde);
    }
    if (fechaHasta && pasaFecha) {
      pasaFecha = fechaInicio && fechaInicio <= new Date(fechaHasta);
    }

    return pasaNombre && pasaEntidad && pasaFecha;
  });

  container.replaceChildren();
  accionesFiltradas.forEach(crearTarjetaAccion);
}

// --- CREAR CADA TARJETA DE ACCIÓN ---
function crearTarjetaAccion(accion) {
  const div = document.createElement('div');
  div.classList.add('containerPerson');

  const toggleBtn = document.createElement('button');
  toggleBtn.classList.add('toggle-info');
  toggleBtn.type = 'button';
  const iconChevron = document.createElement('i');
  iconChevron.classList.add('fa-solid', 'fa-chevron-down');
  toggleBtn.appendChild(iconChevron);

  const extraInfo = document.createElement('div');
  extraInfo.classList.add('extra-info');
  extraInfo.style.display = 'none';
  extraInfo.style.opacity = '0';
  extraInfo.style.transition = 'opacity 0.3s ease, height 0.3s ease';
  extraInfo.style.height = '0';
  extraInfo.style.overflow = 'hidden';

  const crearItemOculto = (label, valor) => {
    const p = document.createElement('p');
    p.classList.add('extra-info-item');
    p.textContent = `${label}: ${valor || 'No especificado'}`;
    return p;
  };

  const seccionDatosPersonales = document.createElement('div');
  seccionDatosPersonales.classList.add('datos-personales');
  seccionDatosPersonales.appendChild(crearItemOculto('Email', accion.email));
  seccionDatosPersonales.appendChild(crearItemOculto('Teléfono', accion.telefono));
  seccionDatosPersonales.appendChild(crearItemOculto('Descripción', accion.descripcion));

  const seccionInfoAccion = document.createElement('div');
  seccionInfoAccion.classList.add('info-accion');
  const inicio = accion.fechaInicio ? new Date(accion.fechaInicio).toLocaleDateString() : 'No especificada';
  const fin = accion.fechaFin ? new Date(accion.fechaFin).toLocaleDateString() : 'No especificada';
  seccionInfoAccion.appendChild(crearItemOculto('Fecha Inicio', inicio));
  seccionInfoAccion.appendChild(crearItemOculto('Fecha Fin', fin));
  if (accion.horarios) {
    seccionInfoAccion.appendChild(crearItemOculto('Horarios', accion.horarios));
  }

  extraInfo.appendChild(seccionDatosPersonales);
  extraInfo.appendChild(seccionInfoAccion);

  const nombre = document.createElement('p');
  nombre.classList.add('name');
  nombre.textContent = accion.nombre;

  const entidad = document.createElement('p');
  entidad.classList.add('entidad');
  entidad.textContent = accion.asociacionEntidad;

  const tipoAccion = document.createElement('p');
  tipoAccion.classList.add('tipoAccion');
  tipoAccion.textContent = accion.tipoAccion;

  const responsable = document.createElement('p');
  responsable.classList.add('responsable');
  responsable.textContent = accion.responsableAccion;

  const editar = document.createElement('div');
  editar.classList.add('editar');

  const editarBtn = document.createElement('button');
  editarBtn.type = 'button';
  editarBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editarBtn.addEventListener('click', () => {
    window.location.href = `/formAnn?id=${accion._id}`;
  });

  const eliminarBtn = document.createElement('button');
  eliminarBtn.type = 'button';
  eliminarBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  eliminarBtn.addEventListener('click', () => borrarAccion(accion._id));

  editar.append(editarBtn, eliminarBtn);

  div.append(toggleBtn, nombre, entidad, tipoAccion, responsable, editar, extraInfo);

  toggleBtn.addEventListener('click', () => {
    const isExpanded = extraInfo.style.display === 'flex';
    extraInfo.style.display = isExpanded ? 'none' : 'flex';
    extraInfo.style.height = isExpanded ? '0' : 'auto';
    extraInfo.style.opacity = isExpanded ? '0' : '1';
    iconChevron.classList.toggle('fa-chevron-up', !isExpanded);
    iconChevron.classList.toggle('fa-chevron-down', isExpanded);
  });

  container.appendChild(div);
}

// --- FUNCIÓN PARA ELIMINAR ACCIÓN ---
async function borrarAccion(id) {
  try {
    const response = await fetch('/api/eliminar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (response.ok) {
      renderAcciones();
    } else {
      console.error('Error al eliminar acción');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// --- EVENTOS DE FILTRADO Y RESETEO ---
document.getElementById('btnFiltrar')?.addEventListener('click', aplicarFiltrosYRender);
document.getElementById('btnReset')?.addEventListener('click', () => {
  document.getElementById('filtroNombre').value = '';
  document.getElementById('filtroEntidad').value = '';
  document.getElementById('fechaInicioDesde').value = '';
  document.getElementById('fechaInicioHasta').value = '';
  aplicarFiltrosYRender();
});
 