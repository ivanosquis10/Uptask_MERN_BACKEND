import Usuario from '../models/Usuarios.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailRegistro, emailResetPassword } from '../helpers/emails.js'

// Estas funciones se van a encargar de darle los metodos a la seccion de las routes
// estos serian los controladores

// example: const usuarios = (req, res) => { res.json({msg: 'Desde api/usuarios',})}

const registrar = async (req, res) => {
  // evitar duplicados en la BD (email)
  const { email } = req.body
  // Al recibir la peticion utilizamos el metodo "findOne" para verificar si el email coincide con alguno en la BD
  const usuarioExiste = await Usuario.findOne({ email })

  // En caso de que exista generaremos un mensaje de error y lo devolveremos
  if (usuarioExiste) {
    const error = new Error('Usuario ya registrado')
    return res.status(400).json({ msg: error.message })
  }

  try {
    // creando la instancia del usuario con el schema y todo, se lo pasamos aqui para que se ingrese con ese modelo
    const usuario = new Usuario(req.body)
    usuario.token = generarId()
    // esto permitirá ingresarlo en la base de datos
    await usuario.save()

    // enviar el email de confirmacion despues de agregar al usuario, extraemos tres valores necesarios para enviarlo al email
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    })

    res.json({
      msg: 'Usuario creado correctamente, revisa tu email para confirmar',
    })
  } catch (error) {
    console.error(error)
  }
}

const autenticar = async (req, res) => {
  const { email, password } = req.body

  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email })
  if (!usuario) {
    const error = new Error('El usuario no existe')
    return res.status(404).json({ msg: error.message })
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada')
    return res.status(403).json({ msg: error.message })
  }

  // Comprobar el password del usuario
  if (await usuario.comprobarPassword(password)) {
    // en caso de estar todo bien, retoranos la instancia del usuario
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    })
  } else {
    const error = new Error('La contraseña no coinicide')
    return res.status(403).json({ msg: error.message })
  }
}

// const confirmar = async (req, res) => {
//   // extraemos el token
//   const { token } = req.params

//   // buscamos en la base de datos si hay un usuario con ese token
//   const usuarioValidar = await Usuario.findOne({ token })

//   // en caso de que no coinicida, soltamos este mensaje
//   if (!usuarioValidar) {
//     const error = new Error('Token no válido')
//     return res.status(403).json({ msg: error.message })
//   }

//   // en caso de que todo vaya bien
//   try {
//     // si el usuario confirma el token, su estado confirmado pasa a true
//     usuarioValidar.confirmado = true

//     // modificamos el token, ya que es de solo un uso
//     usuarioValidar.token = ''

//     // y lo guardamos en la base de datos
//     await usuarioValidar.save()

//     // y devolvemos un mensaje de exito
//     res.json({ msg: 'Usuario confirmado correctamente' })
//   } catch (error) {
//     console.error(error)
//   }
// }
const confirmar = async (req, res) => {
  const { token } = req.params
  const usuarioConfirmar = await Usuario.findOne({ token })
  if (!usuarioConfirmar) {
    const error = new Error('Token no válido')
    return res.status(403).json({ msg: error.message })
  }

  try {
    usuarioConfirmar.confirmado = true
    usuarioConfirmar.token = ''
    await usuarioConfirmar.save()
    res.json({ msg: 'Usuario Confirmado Correctamente' })
  } catch (error) {
    console.log(error)
  }
}

const olvidePassword = async (req, res) => {
  const { email } = req.body

  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email })
  if (!usuario) {
    const error = new Error('El usuario no existe')
    return res.status(403).json({ msg: error.message })
  }

  // si existe
  try {
    // genera un nuevo token al usuario
    usuario.token = generarId()
    await usuario.save()

    // enviar el email
    emailResetPassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    })

    res.json({
      msg: 'Hemos enviado las instrucciones para restablecer la contraseña a tu correo',
    })
  } catch (error) {
    console.error(error)
  }
}

const comprobarToken = async (req, res) => {
  const { token } = req.params

  // validar que el token existan en algunos de los usuarios
  const tokenValido = await Usuario.findOne({ token })

  // en caso de que no coinicida, soltamos este mensaje
  if (!tokenValido) {
    const error = new Error('Token no válido')
    return res.status(404).json({ msg: error.message })
  }

  res.json({ msg: 'Token valido y el usuario existe' })
}

const nuevoPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  // validar que el token exista y que sea valido
  const usuario = await Usuario.findOne({ token })
  // en caso de que no coinicida, soltamos este mensaje
  if (!usuario) {
    const error = new Error('Token no válido')
    return res.status(404).json({ msg: error.message })
  }

  usuario.password = password
  usuario.token = ''
  try {
    await usuario.save()
    return res.json({ msg: 'Contraseña restablecida correctamente' })
  } catch (error) {
    console.error(error)
  }
}

const perfil = async (req, res) => {
  const { usuario } = req

  res.json(usuario)
}

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
}
