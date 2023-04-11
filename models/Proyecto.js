import mongoose from 'mongoose'

// creamos el schema del modelo de usuarios
const proyectosSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
    },
    cliente: {
      type: String,
      required: true,
      trim: true,
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    tareas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea',
      },
    ],
    colaboradores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
      },
    ],
  },
  { timestamps: true }
)

// Aqui inicializamos el modelo dandole el nombre y pasandole el schema y se exporta
const Proyecto = mongoose.model('Proyecto', proyectosSchema)

export default Proyecto
