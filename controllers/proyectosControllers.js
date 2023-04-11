import mongoose from 'mongoose'
import Proyecto from '../models/Proyecto.js'
import Usuario from '../models/Usuarios.js'

const obtenerProyectos = async (req, res) => {
  // obtenemos los proyectos y comparamos con el creador para traer unicamente los proyectos de cada usuario
  const proyectos = await Proyecto.find({
    $or: [
      {
        colaboradores: { $in: req.usuario },
      },
      { creador: { $in: req.usuario } },
    ],
  }).select('-tareas') // esta linea de codigo lo que permite es traer toda la informacion menos lo que se coloca entre los parentensis con el signo menos ex: -tareas -id -novia
  res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
  // primeros vamos a instancia el schema de proyecto y le pasamos lo que venga del metodo post
  const nuevoProyecto = new Proyecto(req.body)
  // le asignamos el creador (id), que viene gracias a la autenticacion (-check auth-)
  nuevoProyecto.creador = req.usuario._id

  // usamos trycatch para el guardado en la base de datos
  try {
    const proyectoAlmacenado = await nuevoProyecto.save()
    return res.json(proyectoAlmacenado)
  } catch (error) {
    console.error(error)
  }
}

const obtenerProyecto = async (req, res) => {
  const { id } = req.params
  const valid = mongoose.Types.ObjectId.isValid(id)

  if (!valid) {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({ msg: error.message })
  }
  // usamos el metodo para que nos traiga toda la informacion en caso de que coincida con el id del get
  // actualizacion: vamos a realizar un div populate o sea aplicarle un populate a un campo que ya se le hizo un populate ¿por que? porque necesitamos traernos la informacion de la persona que completo la tarea para poder mostrarla en el frontend =>
  const proyecto = await Proyecto.findById(id)
    .populate({
      path: 'tareas',
      populate: { path: 'completado', select: 'nombre' },
    })
    .populate('colaboradores', 'email nombre')

  if (!proyecto) {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({ msg: error.message })
  }

  // comprobamos si la persona que intenta entrar al proyecto es quien CREO ESE PROYECTO
  // si son diferentes, no podra verlo.
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error('Accion no válida')
    return res.status(401).json({ msg: error.message })
  }

  // Obtener las tareas del proyecto
  // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)

  res.json(proyecto)
}

const editarProyecto = async (req, res) => {
  // enviareamos la misma validacion que de obtener proyecto ya que realiza toda la validacion del id, del usuario y sus proyectos
  const { id } = req.params
  const valid = mongoose.Types.ObjectId.isValid(id)

  if (!valid) {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({ msg: error.message })
  }
  // usamos el metodo para que nos traiga toda la informacion en caso de que coincida con el id del get
  const proyecto = await Proyecto.findById(id)

  if (!proyecto) {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({ msg: error.message })
  }

  // comprobamos si la persona que intenta entrar al proyecto es quien CREO ESE PROYECTO
  // si son diferentes, no podra verlo.
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Accion no válida')
    return res.status(401).json({ msg: error.message })
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
  proyecto.cliente = req.body.cliente || proyecto.cliente

  try {
    const proyectoAlmacenado = await proyecto.save()
    return res.json(proyectoAlmacenado)
  } catch (error) {
    console.log(error)
  }
}

const eliminarProyecto = async (req, res) => {
  // enviareamos la misma validacion que de obtener proyecto ya que realiza toda la validacion del id, del usuario y sus proyectos
  const { id } = req.params
  const valid = mongoose.Types.ObjectId.isValid(id)

  if (!valid) {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({ msg: error.message })
  }
  // usamos el metodo para que nos traiga toda la informacion en caso de que coincida con el id del get
  const proyecto = await Proyecto.findById(id)

  if (!proyecto) {
    const error = new Error('El proyecto no existe')
    return res.status(404).json({ msg: error.message })
  }

  // comprobamos si la persona que intenta entrar al proyecto es quien CREO ESE PROYECTO
  // si son diferentes, no podra verlo.
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Accion no válida')
    return res.status(401).json({ msg: error.message })
  }

  // procedemos a crear el metodo de borrar
  try {
    await proyecto.deleteOne()
    return res.json({ msg: 'Proyecto eliminado' })
  } catch (error) {
    console.log(error)
  }
}

const buscarColaborador = async (req, res) => {
  const { email } = req.body
  const usuario = await Usuario.findOne({ email }).select(
    '-password -createdAt -__v -confirmado -updatedAt -token'
  )

  if (!usuario) {
    const error = new Error('Usuario no encontrado')
    // // y lo devolvemos para verlo en el frontend
    return res.status(404).json({ msg: error.message })
  }

  // caso contrario, devolvemos una respuesta del usuario
  res.json(usuario)
}

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id)

  // si no hay ningun proyecto
  if (!proyecto) {
    const error = new Error('Proyecto no encontrado')
    return res.status(404).json({ msg: error.message })
  }

  // validar si la persona que agrega al colaborador es el creador
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Acción no válida')
    return res.status(404).json({ msg: error.message })
  }

  const { email } = req.body
  const usuario = await Usuario.findOne({ email }).select(
    '-password -createdAt -__v -confirmado -updatedAt -token'
  )

  if (!usuario) {
    const error = new Error('Usuario no encontrado')
    // // y lo devolvemos para verlo en el frontend
    return res.status(404).json({ msg: error.message })
  }

  // validar que el admin no pueda agregarse como colaborador
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('El creador no puede ser colaborador!')
    return res.status(404).json({ msg: error.message })
  }

  // validar que la persona que se este agregando no este YA como colaborador en el proyecto
  // ya que el campo de colaborades es un array, usamos includes para verificar si el id coinicide con alguno en el campo
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El colaborador ya existe!')
    return res.status(404).json({ msg: error.message })
  }

  // en caso de todo okay, se puede agregar al array de colaboradores
  proyecto.colaboradores.push(usuario._id)
  await proyecto.save()
  res.json({ msg: 'Colaborador agregado correctamente' })
}

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id)

  // si no hay ningun proyecto
  if (!proyecto) {
    const error = new Error('Proyecto no encontrado')
    return res.status(404).json({ msg: error.message })
  }

  // validar si la persona que agrega al colaborador es el creador
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('Acción no válida')
    return res.status(404).json({ msg: error.message })
  }

  // en caso de todo okay, se puede eliminar el colabroador
  proyecto.colaboradores.pull(req.body.id)
  await proyecto.save()
  res.json({ msg: 'Colaborador eliminado correctamente' })
}

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  buscarColaborador,
  eliminarColaborador,
}
