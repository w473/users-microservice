import { Request, Response } from '../libs/Models'
import bcrypt from 'bcryptjs';
import User from '../models/UserModel';
import { formatOne } from '../formatters/UsersFormatter';
import { sendNewUser, sendNewEmail } from '../services/EmailService';
import { v4 as uuidv4 } from 'uuid';
import UserRepository from '../repositories/UserRepository';

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
      user.bootNew().getCredentials().setPassword(password);
      user.setActivationCode(uuidv4().toString());
      return UserRepository.save(user);
    })
    .then((user) => {
      res.status(204).send();
      return sendNewUser(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({
          message: `Field "${Object.keys(err.keyPattern)[0]}" is not unique`
        });
      }
      return next(err);
    });
};

export const edit = async (req: Request, res: Response, next: CallableFunction) => {
  try {
    const user = await User.findById(MUUID.from(req.user.id));
    if (!user) {
      return res.status(404).json({ message: `User does not exists` });
    }
    let newEmail = false;

    for (const [key, value] of Object.entries(req.body)) {
      switch (key) {
        case 'email':
          newEmail = value != user.email;
          if (newEmail) {
            user.isActive = false;
            user.credentials.activationCode = uuidv4.toString()
          }
        default:
          user[key] = value;
      }
    }
    await user.save();

    if (newEmail) {
      res
        .status(200)
        .json({ message: 'Account needs to activated after email change' });
      return sendNewEmail(user);
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: `Field "${Object.keys(err.keyPattern)[0]}" is not unique`
      });
    }
    next(err);
  }
};

export const findByUsername = (req: Request, res: Response, next: CallableFunction) => {
  const where = {
    username: req.params.username
  };
  return User.findOne(where)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: `User does not exists` });
      }
      return res.status(200).json(formatOne(user));
    })
    .catch((err) => next(err));
};

export const get = (req: Request, res: Response, next: CallableFunction) => {
  let usersId = req.user.id;

  if (req.params.usersId && req.user.id != req.params.usersId) {
    if (req.user.roles.indexOf('ADMIN') === -1) {
      return res.status(403).json({ message: `Not Allowed` });
    }
    usersId = req.params.usersId;
  }
  return User.findById(MUUID.from(usersId))
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: `User does not exists` });
      }
      return res.status(200).json(formatOne(user));
    })
    .catch((err) => next(err));
};

export const deleteUser = (req: Request, res: Response, next: CallableFunction) => {
  let usersId = req.user.id;
  if (req.params.usersId && req.user.id != req.params.usersId) {
    if (req.user.roles.indexOf('ADMIN') === -1) {
      return res.status(403).json({ message: `Not Allowed` });
    }
    usersId = req.params.usersId;
  }

  return User.deleteOne({ _id: MUUID.from(usersId) })
    .exec()
    .then((result) => {
      if (result.deletedCount === 1) {
        return res.status(204).send();
      }
      return res.status(404).json({ message: `User has not been found` });
    })
    .catch((err) => next(err));
};

export const setRoles = (req: Request, res: Response, next: CallableFunction) => {
  const usersId = req.params.usersId;
  if (usersId == req.user.id || req.body.roles.lastIndexOf('SYS') !== -1) {
    return res.status(403).json({ message: `Not Allowed` });
  }
  req.body.roles.push('USER');
  const roles = [...new Set(req.body.roles)];

  return User.findById(MUUID.from(usersId))
    .exec()
    .then((user) => {
      if (user) {
        user.roles = roles;
        return user.save();
      }
    })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: `User does not exists` });
      }
      return res.status(204).send();
    })
    .catch((err) => next(err));
};

export const activate = (req: Request, res: Response, next: CallableFunction) => {
  return User.findOne({
    'credentials.activationCode': req.params.activationCode
  })
    .exec()
    .then((user) => {
      if (user) {
        user.credentials.activationCode = undefined;
        user.isActive = true;
        return user.save();
      }
    })
    .then((result) => {
      if (result) {
        return res.status(204).send();
      }
      return res.status(404).json({ message: `User has not been found` });
    })
    .catch((err) => next(err));
};

export const find = async (req: Request, res: Response, next: CallableFunction) => {
  const longName = req.query.longName;
  if (longName.length < 3) {
    return res.status(400).json({
      message: 'Wrong search params'
    });
  }
  const where = {
    longName: new RegExp(longName, 'i'),
    _id: { $ne: MUUID.from(req.user.id) }
  };

  const limit = req.query.limit ?? 10;
  const offset = req.query.offset ?? 0;

  return User.find(where)
    .limit(limit)
    .skip(offset)
    .sort({ longName: 1 })
    .exec()
    .then((users) => {
      return res.status(200).json({
        users: usersFormatter.formatAll(users, true)
      });
    })
    .catch((err) => next(err));
};

export const findByEmail = async (req: Request, res: Response, next: CallableFunction) => {
  return User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: `User does not exists` });
      }
      return res.status(200).json(formatOne(user));
    })
    .catch((err) => next(err));
};

export const findByEmailPassword = async (req: Request, res: Response, next: CallableFunction) => {
  return User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: `User does not exist` });
      }
      if (bcrypt.compareSync(req.body.password, user.credentials.password)) {
        return res.status(200).json(formatOne(user));
      }
      return res.status(404).json({ message: `User does not exists` });
    })
    .catch((err) => next(err));
};

export const passwordChange = async (req: Request, res: Response, next: CallableFunction) => {
  let usersId = req.user.id;

  if (req.params.usersId && req.user.id != req.params.usersId) {
    if (req.user.roles.indexOf('ADMIN') === -1) {
      return res.status(403).json({ message: `Not Allowed` });
    }
    usersId = req.params.usersId;
  }
  return User.findById(MUUID.from(usersId))
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: `User does not exists` });
      }
      if (
        !bcrypt.compareSync(req.body.passwordOld, user.credentials.password)
      ) {
        return res.status(400).json({
          message: 'Validation error',
          data: {
            body: {
              passwordOld: 'Current password is wrong'
            }
          }
        });
      }
      user.credentials.password = bcrypt.hashSync(req.body.passwordNew, 12);
      return user.save();
    })
    .then(() => {
      return res.status(204).send();
    })
    .catch((err) => next(err));
};
