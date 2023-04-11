import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// creamos el schema del modelo de usuarios
const usuariosSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// prev se ejecuta antes de la llamada a la api
usuariosSchema.pre('save', async function (next) {
  // esta validacion va a revisar que el password hasheado no sean cambiado
  // si no esta modificando el password, no hagaas nada, el next hace que no se ejecute
  if (!this.isModified('password')) {
    next()
  }

  // se va a encarga de hashear el password del usuario
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// creamos un metodo para comprobar si la contraseña es igual o no y compararla
usuariosSchema.methods.comprobarPassword = async function (passwordForm) {
  // va a devolver true o false
  return await bcrypt.compare(passwordForm, this.password)
}

// Aqui inicializamos el modelo dandole el nombre y pasandole el schema y se exporta
const Usuario = mongoose.model('Usuario', usuariosSchema)

export default Usuario
