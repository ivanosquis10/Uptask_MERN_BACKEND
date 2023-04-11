import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // Información del email
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: 'UpTask - Confirma tu cuenta',
    text: 'Confirma tu cuenta en UpTask',
    html: `<p>Hola: ${nombre} Confirma tu cuenta en UpTask</p>
    <p>Tu cuenta ya esta casi lista, solo debes confirmarla en el siguiente enlace: 
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirma Cuenta</a>
    
    <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
    `,
  })
}

const emailResetPassword = async (datos) => {
  const { email, nombre, token } = datos

  // TODO: MOVER A VARIABLES DE ENTORNO
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // Información del email
  const info = await transport.sendMail({
    from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
    to: email,
    subject: 'UpTask - Reestablece tu Password',
    text: 'Reestablece tu Password',
    html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
    <p>Sigue el siguiente enlace para generar un nuevo password: 
    <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reestablecer Password</a>
    
    <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
    `,
  })
}

export { emailRegistro, emailResetPassword }
