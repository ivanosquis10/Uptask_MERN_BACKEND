import mongoose from 'mongoose'

// funcion que se encarga de hacer la conexion a la base de datos
const conectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    const url = `${connection.connection.host}: ${connection.connection.port}`

    console.log(`mongoDB conectado en ${url}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default conectarDB
