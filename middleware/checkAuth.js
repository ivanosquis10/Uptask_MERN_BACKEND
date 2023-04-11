import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuarios.js'
// funcion encargada de checkear la autenticacion del usuario
const checkAuth = async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // si hay un bearer, obtenemos el token
    try {
      // asignamos el token del headers
      token = req.headers.authorization.split(' ')[1]

      // ahora decodificamos el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // obtenemos el id que viene del token y extraemos la instacia del perfil
      req.usuario = await Usuario.findById(decoded.id).select(
        '-password -token -confirmado -createdAt -updatedAt -__v'
      )

      return next()
    } catch (error) {
      // en caso de un error o que haya expirado el token
      return res
        .status(404)
        .json({ msg: 'Hubo un error. El Token no está vigente' })
    }
  }

  // en caso de que haya un error con el token, mostramos un mensaje
  if (!token) {
    const error = new Error('No fue enviado el Token. Por favor enviarlo!')
    return res.status(401).json({ msg: error.message })
  }

  next()
}

export default checkAuth
