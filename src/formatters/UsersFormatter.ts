import User from '../models/UserModel'

export const formatOne = (user: User, limited = false) => {
  let ret: object = {
    id: user.getKey(),
    username: user.getUsername(),
    longName: user.getName() + '' + user.getFamilyName()
  }
  if (!limited) {
    let retNotLimited: object = {
      isActive: user.getIsActive(),
      roles: user.getRoles(),
      locale: user.getLocale,
      email: user.getEmail()
    }
    ret = Object.assign(ret, retNotLimited)
  }
  return ret
}

export const formatAll = (users: Array<User>, limited = false) => {
  return users.map((user) => formatOne(user, limited))
}
