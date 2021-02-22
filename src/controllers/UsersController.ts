import { Request, Response } from '../libs/Models'
import bcrypt from 'bcryptjs'
import User from '../models/UserModel'
import { formatOne, formatAll } from '../formatters/UsersFormatter'
import { sendNewUser, sendNewEmail } from '../services/EmailService'
import { v4 as uuidv4 } from 'uuid'
import UserRepository from '../repositories/UserRepository'

export const add = (req: Request, res: Response, next: CallableFunction) => {
  return bcrypt
    .hash(req.body.credentials.password, 12)
    .then((password) => {
      const user = new User(
        req.body.username,
        req.body.name,
        req.body.familyName,
        req.body.email,
        req.body.locale
      )
      user.bootNew().getCredentials().setPassword(password)
      user.setActivationCode(uuidv4().toString())
      return UserRepository.save(user)
    })
    .then((user) => {
      res.status(204).send()
      return sendNewUser(user)
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({
          message: `Field "${Object.keys(err.keyPattern)[0]}" is not unique`
        })
      }
      return next(err)
    })
}

export const edit = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  try {
    const user = await UserRepository.findOneByUserId(req.user.id)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    let newEmail = false

    for (const [key, value] of Object.entries(req.body)) {
      switch (key) {
        case 'email':
          newEmail = value != user.getEmail()
          if (newEmail) {
            user.setActivationCode(uuidv4.toString())
          }
          break
        default:
          const tmp = user as any
          tmp['set' + capitalize(key)](value)
      }
    }
    await UserRepository.save(user)

    if (newEmail) {
      res
        .status(200)
        .json({ message: 'Account needs to activated after email change' })
      return sendNewEmail(user)
    }
    res.status(204).send()
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: `Field "${Object.keys(err.keyPattern)[0]}" is not unique`
      })
    }
    next(err)
  }
}

export const findByUsername = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const where = {
    username: req.params.username
  }
  try {
    const user = await UserRepository.findOne(where)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    return res.status(200).json(formatOne(user))
  } catch (error) {
    return next(error)
  }
}

export const get = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  let usersId = req.user.id

  if (req.params.usersId && req.user.id != req.params.usersId) {
    if (req.user.roles.indexOf('ADMIN') === -1) {
      return res.status(403).json({ message: `Not Allowed` })
    }
    usersId = req.params.usersId
  }
  try {
    const user = await UserRepository.findOneByUserId(usersId)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    return res.status(200).json(formatOne(user))
  } catch (error) {
    return next(error)
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  let usersId = req.user.id
  if (req.params.usersId && req.user.id != req.params.usersId) {
    if (req.user.roles.indexOf('ADMIN') === -1) {
      return res.status(403).json({ message: `Not Allowed` })
    }
    usersId = req.params.usersId
  }
  try {
    const user = await UserRepository.findOneByUserId(req.user.id)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    const isDeleted = await UserRepository.delete(user)
    if (isDeleted) {
      return res.status(204).send()
    }
    return res.status(404).json({ message: `User has not been found` })
  } catch (error) {
    return next(error)
  }
}

export const setRoles = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const usersId = req.params.usersId
  if (usersId == req.user.id || req.body.roles.lastIndexOf('SYS') !== -1) {
    return res.status(403).json({ message: `Not Allowed` })
  }
  req.body.roles.push('USER')
  const roles = [...new Set(<Array<string>>req.body.roles)]
  try {
    const user = await UserRepository.findOneByUserId(req.user.id)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    user.setRoles(roles)
    await UserRepository.save(user)
    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}

export const activate = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const where = {
    'credentials.activationCode': req.params.activationCode
  }
  try {
    const user = await UserRepository.findOne(where)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    user.setActivationCode(undefined)

    await UserRepository.save(user)
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

export const find = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const name = <String>req.query.name
  if (name.length < 3) {
    return res.status(400).json({
      message: 'Wrong search params'
    })
  }
  const where = [`user.name LIKE "%${name}%"`, `user._id!="${req.user.id}"`]

  const limit = Number(req.query.limit ?? 10)
  const offset = Number(req.query.offset ?? 0)
  try {
    const users = UserRepository.find(where, offset, limit)

    return res.status(200).json({
      users: formatAll(users, true)
    })
  } catch (error) {
    return next(error)
  }
}

export const findByEmail = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const where = {
    email: req.body.email
  }
  try {
    const user = await UserRepository.findOne(where)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    return res.status(200).json(formatOne(user))
  } catch (error) {
    return next(error)
  }
}

export const findByEmailPassword = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const where = {
    email: req.body.email
  }
  try {
    const user = await UserRepository.findOne(where)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }
    const password = user.getCredentials().getPassword() ?? ''
    if (bcrypt.compareSync(req.body.password, password)) {
      return res.status(200).json(formatOne(user))
    }
    return res.status(404).json({ message: `User does not exists` })
  } catch (error) {
    return next(error)
  }
}

export const passwordChange = async (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  let usersId = req.user.id

  if (req.params.usersId && req.user.id != req.params.usersId) {
    if (req.user.roles.indexOf('ADMIN') === -1) {
      return res.status(403).json({ message: `Not Allowed` })
    }
    usersId = req.params.usersId
  }
  try {
    const user = await UserRepository.findOneByUserId(req.user.id)
    if (!user) {
      return res.status(404).json({ message: `User does not exists` })
    }

    if (
      !bcrypt.compareSync(
        req.body.passwordOld,
        user.getCredentials().getPassword() ?? ''
      )
    ) {
      return res.status(400).json({
        message: 'Validation error',
        data: {
          body: {
            passwordOld: 'Current password is wrong'
          }
        }
      })
    }
    user.getCredentials().setPassword(bcrypt.hashSync(req.body.passwordNew, 12))
    await UserRepository.save(user)
    return res.status(204).send()
  } catch (err) {
    return next(err)
  }
}
