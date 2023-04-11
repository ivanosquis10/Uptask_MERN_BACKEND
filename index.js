import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { Server } from 'socket.io'
import conectarDB from './config/db.js'
import usuarioRoutes from './routes/usuariosRoutes.js'
import proyectosRoutes from './routes/proyectosRoutes.js'
import tareasRoutes from './routes/tareasRoutes.js'

// inicializamos la app
const app = express()
app.use(express.json()) // esto habilita que pueda leer la informacion como formato json

// guardamos la informacion delicada en variables de entorno
dotenv.config()

// Hacemos la conexion a la base de datos
conectarDB()

// configuracion y uso de cors
const whiteList = [process.env.FRONTEND_URL] // lista de los dominios que estan permitidos para llamar a nuestra api

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      // puede consultar la api
      callback(null, true)
    } else {
      // No puede consultar la api
      callback(new Error('Error de CORS'))
    }
  },
}

app.use(cors(corsOptions))

// Routing || Aqui iran todas las routas que tendremos
// se recomienda organizar todo en este archivo con rutas y otro con los controladores
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectosRoutes)
app.use('/api/tareas', tareasRoutes)

// es importante que al hacer deploy tener una variable que apunte al puerto
const PORT = process.env.POST || 4000

// levantamos el servidor con express
const servidor = app.listen(PORT, () => {
  console.log(`Servidor en ${PORT}`)
})

// hacemos la conexion con socket io
const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})

// y abrimos una conexion con socket io
io.on('connection', (socket) => {
  // console.log('conectado a socket.io')

  // definir los eventos de socketio - todo evento que se vaya a hacer se tiene que registrar
  socket.on('abrir proyecto', (proyecto) => {
    // el metodo join, crea una especie de "cuarto/room" // basicamente cada usuario esta entrando a un cuarto/room diferente y el emit le enviara el mensaje a los usuarios
    socket.join(proyecto)
  })

  // evento relacionado con enviar nueva tarea
  socket.on('nueva tarea', (tarea) => {
    // console.log(tarea)
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea agregada', tarea)
  })

  // evento relacionado con eliminar una tarea
  socket.on('eliminar tarea', (tarea) => {
    // console.log(tarea)
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea eliminada', tarea)
  })

  // evento relacionado con actualizar una tarea
  socket.on('actualizar tarea', (tarea) => {
    // console.log(tarea)
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('tarea actualizada', tarea)
  })

  // evento relacionado con actualizar el estado de una tarea
  socket.on('cambiar estado', (tarea) => {
    // console.log(tarea)
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('nuevo estado', tarea)
  })
})

// socket.on('abrir proyecto', (proyecto) => {
//   // console.log('desde proyecto', proyecto)

//   // el metodo join, crea una especie de "cuarto/room" // basicamente cada usuario esta entrando a un cuarto/room diferente y el emit le enviara el mensaje a los usuarios
//   socket.join(proyecto)

//   // EJEMPLO luego enviamos la respuesta al frontend
//   // socket.emit('respuesta', { nombre: 'Ivan' })
// })
