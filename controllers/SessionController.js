const db = require('../models')
const { ValidatePassword, CreateSignature } = require('../utils')
const { User } = db

const SessionsController = {}

SessionsController.login = async (req, res, next) => {
  /**
   * email: provisto por el usuario
   * password: provisto por el usuario (sin encriptar)
   */
  const { email, password } = req.body

  try {
    const user = await User.findOne({ where: { email } })

    if(!user) throw new Error('Usuario o contraseña inválidos', { cause: 'INVALID_CREDENTIALS' });

    /**
     * Comparamos contraseña que entrega usuario
     * por formulario  vs contraseña almacenada (encriptada)
     */
    const isValid = await ValidatePassword(user.password, password)

    if(!isValid) throw new Error('Usuario o contraseña inválidos', { cause: 'INVALID_CREDENTIALS' });

    /**
     * Creamos la firma o JWT (JOSE)
     */
    const signature = CreateSignature({
      _id: user.id,
      email: user.email,
      role: user.role
    })

    console.log(signature)
    return res.cookie('Bearer', signature).json({ message: 'Usuario loggeado' })
  } catch (err) {
    next(err)
  }
}

SessionsController.logout = async (req, res, next) => {
  console.log(req.user)
  if(req.user) {
    return res.clearCookie('Bearer').json({ message: 'Sesión cerrada' })
  }

  return res.json({ message: 'No haz iniciado sesión' })
}

module.exports = {
  SessionsController
}