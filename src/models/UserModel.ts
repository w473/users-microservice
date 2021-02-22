import Base from './BaseModel'

export default class User extends Base {
  private username: string
  private name: string
  private familyName: string
  private email: string
  private locale: string
  private credentials: Credentials
  private roles: Array<string> = ['USER']
  private isActive: boolean = true

  constructor(
    username: string,
    name: string,
    familyName: string,
    email: string,
    locale: string
  ) {
    super()
    this.credentials = new Credentials()
    this.username = username
    this.name = name
    this.familyName = familyName
    this.email = email
    this.locale = locale
  }

  public setActivationCode(activationCode: string | undefined): void {
    this.credentials.setActivationCode(activationCode)
    this.isActive = activationCode != undefined && activationCode.length === 0
  }

  public serialize() {
    return Object.assign(super.serialize(), {
      username: this.username,
      name: this.name,
      familyName: this.familyName,
      email: this.email,
      locale: this.locale,
      credentials: this.credentials,
      roles: this.roles,
      isActive: this.isActive
    })
  }

  public getKey(): string {
    if (this._key) {
      return this._key.toString()
    }
    return ''
  }

  public getEmail(): string {
    return this.email
  }

  public setEmail(email: string): void {
    this.email = email
  }

  public getUsername(): string {
    return this.username
  }

  public setUsername(username: string): void {
    this.username = username
  }

  public getName(): string {
    return this.name
  }

  public setName(name: string): void {
    this.name = name
  }

  public getFamilyName(): string {
    return this.familyName
  }

  public setFamilyName(familyName: string): void {
    this.familyName = familyName
  }

  public getLocale(): string {
    return this.locale
  }

  public setLocale(locale: string): void {
    this.locale = locale
  }

  public getCredentials(): Credentials {
    return this.credentials
  }

  public getRoles(): Array<string> {
    return this.roles
  }

  public setRoles(roles: Array<string>): void {
    this.roles = roles
  }

  public getIsActive(): boolean {
    return this.isActive
  }

  public setIsActive(isActive: boolean): void {
    this.isActive = isActive
  }
}

class Credentials {
  private password!: string | undefined
  private activationCode!: string | undefined

  public getPassword(): string | undefined {
    return this.password
  }
  public setPassword(password: string): void {
    this.password = password
  }

  public setActivationCode(activationCode: string | undefined): void {
    this.activationCode = activationCode
  }

  public getActivationCode(): string | undefined {
    return this.activationCode
  }

  public serialize(): object {
    const ret: any = {}
    if (this.password) {
      ret.password = this.password
    }
    if (this.activationCode) {
      ret.activationCode = this.activationCode
    }
    return ret
  }
}
