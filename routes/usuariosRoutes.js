import express from 'express'
import {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from '../controllers/usuariosControllers.js'
import checkAuth from '../middleware/checkAuth.js'

// Llamada tipo get a la direccion de la api, en este caso, usuarios. ejemplo :router.get('/', usuarios)
const router = express.Router()

// Aqui ira la autenticacion, registro y confirmacion de usuarios, y recuperar contraseña
router.post('/', registrar) // crea un nuevo usuario
router.post('/login', autenticar) // autenticacion del usuario
router.get('/confirmar/:token', confirmar) // confirmacion del usuario con routing dinamico
router.post('/reset-password', olvidePassword) // instrucciones para recuperar contraseña
router.get('/reset-password/:token', comprobarToken) // confirmacion del token enviado para restablecer password
router.post('/reset-password/:token', nuevoPassword) // nuevo password

// esta parte se va a encargar de validar la autenticacion del usuario, el jwt, obtener el perfl del usuario, etc
// checkAuth va a proteger este endpoint
router.get('/perfil', checkAuth, perfil)

export default router
