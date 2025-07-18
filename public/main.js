document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (id) {
    // Traer datos de la acción
    try {
      const res = await fetch(`/api/acciones/${id}`);
      if (!res.ok) throw new Error('No se pudo cargar la acción');
      const accion = await res.json();

      // Rellenar formulario
      document.getElementById('nombre').value = accion.nombre || '';
      document.getElementById('asociacionEntidad').value = accion.asociacionEntidad || '';
      document.getElementById('email').value = accion.email || '';
      document.getElementById('telefono').value = accion.telefono || '';
      document.getElementById('fechaInicio').value = accion.fechaInicio ? accion.fechaInicio.split('T')[0] : '';
      document.getElementById('fechaFin').value = accion.fechaFin ? accion.fechaFin.split('T')[0] : '';
      document.getElementById('horarios').value = accion.horarios || '';
      document.getElementById('tipoAccion').value = accion.tipoAccion || 'consulta';
      document.getElementById('descripcion').value = accion.descripcion || '';
      document.getElementById('web').value = accion.web || '';

      // Marcar checkboxes de responsableAccion (que puede ser array o string)
      const responsables = Array.isArray(accion.responsableAccion) ? accion.responsableAccion : [accion.responsableAccion];
      responsables.forEach(val => {
        const checkbox = document.querySelector(`input[name="responsableAccion"][value="${val}"]`);
        if (checkbox) checkbox.checked = true;
      });

      // Añadimos hidden input con el id para saber que editamos
      let inputId = document.createElement('input');
      inputId.type = 'hidden';
      inputId.name = 'id';
      inputId.value = id;
      document.getElementById('formularioAnnadir').appendChild(inputId);

    } catch (error) {
      alert('Error al cargar datos: ' + error.message);
    }
  }

  // Manejar submit
  document.getElementById('formularioAnnadir').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Recoger datos
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // responsableAccion puede ser múltiples checkboxes
    data.responsableAccion = [];
    document.querySelectorAll('input[name="responsableAccion"]:checked').forEach(chk => {
      data.responsableAccion.push(chk.value);
    });

    // Decidir ruta POST según si hay id o no
    const url = data.id ? '/api/actualizar' : '/api/insertar';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.redirected) {
        window.location.href = res.url; // redirigir al panel o donde toque
      } else {
        const result = await res.json();
        alert(result.error || 'Error desconocido');
      }
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  });
});
