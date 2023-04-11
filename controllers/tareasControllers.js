import mongoose from 'mongoose'
import Proyecto from '../models/Proyecto.js'
import Tarea from '../models/Tarea.js'

// const agregarColaborador = async (req, res) => {
//   const tarea = new Tarea
// }
// const eliminarColaborador = async (req, res) => {}
// const obtenerTareas = async (req, res) => {}

const agregarTarea = async (req, res) => {
  // obtenemos el id del proyecto para saber si el proyecto existe
  const { proyecto } = req.body

  // si no existe, devolvemos el mensaje de error
  const existeProyecto = await Proyecto.findById(proyecto)

  if (!existeProyecto) {
    const errores = new Error('El proyecto no existe')
    return res.status(404).json({ msg: errores.message })
  }

  // vamos a comprobar si la persona que esta dando de alta la tarea es el creador del proyecto
  // esto va a comparar los ids para verificar que es el creador
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const errores = new Error('Acción no válida, no tienes permiso')
    return res.status(403).json({ msg: errores.message })
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body)
    // almacenar el ID en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id)
    // ahora almacenarlo en la bd
    await existeProyecto.save()
    return res.json(tareaAlmacenada)
  } catch (error) {
    console.log(error)
  }
}

const obtenerTarea = async (req, res) => {
  const { id } = req.params

  // esta consulta nos permite cruzar la informacion entre la tarea y el proyecto
  // para evitar tener que hacer dos consultas (una de tarea y otra del proyecto), utilizamos "populate" ya que en el modelo le dimos una referencia del proyecto al que esta "relacionado", gracias al id se trae la informacion tambien del proyecto y la une a la respuesta
  const tarea = await Tarea.findById(id).populate('proyecto')

  if (!tarea) {
    const errores = new Error('Tarea no encontrada')
    return res.status(404).json({ msg: errores.message })
  }

  // comprobar quien el creador del proyecto para poder obtener la tarea
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const errores = new Error('Acción no válida, no tienes permiso')
    return res.status(404).json({ msg: errores.message })
  }

  res.json(tarea)
}

const actualizarTarea = async (req, res) => {
  const { id } = req.params

  // esta consulta nos permite cruzar la informacion entre la tarea y el proyecto
  // para evitar tener que hacer dos consultas (una de tarea y otra del proyecto), utilizamos "populate" ya que en el modelo le dimos una referencia del proyecto al que esta "relacionado", gracias al id se trae la informacion tambien del proyecto y la une a la respuesta
  const tarea = await Tarea.findById(id).populate('proyecto')

  if (!tarea) {
    const errores = new Error('Tarea no encontrada')
    return res.status(404).json({ msg: errores.message })
  }

  // comprobar quien el creador del proyecto para poder obtener la tarea
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const errores = new Error('Acción no válida, no tienes permiso')
    return res.status(404).json({ msg: errores.message })
  }

  tarea.nombre = req.body.nombre || tarea.nombre
  tarea.descripcion = req.body.descripcion || tarea.descripcion
  tarea.prioridad = req.body.prioridad || tarea.prioridad
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

  try {
    const tareaAlmacenada = await tarea.save()
    return res.json(tareaAlmacenada)
  } catch (error) {
    console.log(error)
  }
}

const eliminarTarea = async (req, res) => {
  const { id } = req.params

  const tarea = await Tarea.findById(id).populate('proyecto')

  if (!tarea) {
    const error = new Error('Tarea no encontrada')
    return res.status(404).json({ msg: error.message })
  }

  // validar si es el creador del proyecto
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Acción no válida')
    return res.status(403).json({ msg: error.message })
  }

  try {
    // await tarea.deleteOne()
    // creamos una instancia del modelo y obtenemos el proyecto que esta relacionado con la tarea
    const proyecto = await Proyecto.findById(tarea.proyecto) // es la tarea que estamos tratando de eliminar

    // aqui ya tenemos acceso a las tareas y hacemos un pull para sacar las tareas
    proyecto.tareas.pull(tarea._id)

    // luego realizamos dos promesa de forma pararela
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
    return res.json({ msg: 'Tarea se ha eliminado' })
  } catch (error) {
    console.log(error)
  }
}

const cambiarEstado = async (req, res) => {
  const { id } = req.params

  const tarea = await Tarea.findById(id).populate('proyecto')

  if (!tarea) {
    const error = new Error('Tarea no encontrada')
    return res.status(404).json({ msg: error.message })
  }

  // validar si es el creador del proyecto
  // la segunda validacion es para evitar que una persona que no sea colaborador pueda cambiar algo de las tareas
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error('Acción no válida')
    return res.status(403).json({ msg: error.message })
  }

  // para cambiar el estado hacemos =>
  tarea.estado = !tarea.estado
  // en el campo de completado colocaremos el nombre de la persona que completo la tarea
  tarea.completado = req.usuario._id
  await tarea.save()

  // lo que hacemos aqui es almacenar la informacion que ha sido guardada y enviarla al froent para poder tener la ultima informacion obtenida, esto porque en el front no se veia la informacion ultima de quien agrego o elimino el estado de completada
  const tareaAlmacenada = await Tarea.findById(id)
    .populate('proyecto')
    .populate('completado')
  res.json(tareaAlmacenada)
}

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
}
