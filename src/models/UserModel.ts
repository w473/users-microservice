import Base from './BaseModel';

export default class User extends Base {
  private username: String
  private name: String
  private familyName: String
  private email: String
  private locale: String
  private credentials!: Credentials
  private roles: Array<String> = ['USER'];
  private isActive: boolean = true

  constructor(username: String, name: String, familyName: String, email: String, locale: String) {
    super();
    this.username = username;
    this.name = name;
    this.familyName = familyName;
    this.email = email;
    this.locale = locale;
  }

  public setActivationCode (activationCode: String): void {
    this.credentials.setActivationCode(activationCode);
    this.isActive = activationCode.length === 0
  }

  public serialize () {
    return Object.assign(
      super.serialize(),
      {
        username: this.username,
        name: this.name,
        familyName: this.familyName,
        email: this.email,
        locale: this.locale,
        credentials: this.credentials,
        roles: this.roles,
        isActive: this.isActive,
      }
    );
  }

  public getKey (): String {
    if (this._key) {
      return this._key.toString();
    }
    return '';
  }

  public getEmail (): String {
    return this.email;
  }

  public getUsername (): String {
    return this.username;
  }

  public getName (): String {
    return this.name;
  }

  public getFamilyName (): String {
    return this.familyName;
  }

  public getLocale (): String {
    return this.locale;
  }

  public getCredentials (): Credentials {
    return this.credentials;
  }

  public getRoles (): Array<String> {
    return this.roles;
  }
  public getIsActive (): boolean {
    return this.isActive
  }
};

class Credentials {
  private password!: String | null
  private activationCode!: String | null

  public getPassword (): String | null {
    return this.password;
  }
  public setPassword (password: String): void {
    this.password = password;
  }

  public setActivationCode (activationCode: String): void {
    this.activationCode = activationCode;
  }

  public getActivationCode (): String | null {
    return this.activationCode;
  }

  public serialize (): object {
    const ret: any = {};
    if (this.password) {
      ret.password = this.password;
    }
    if (this.activationCode) {
      ret.activationCode = this.activationCode;
    }
    return ret;
  }
}