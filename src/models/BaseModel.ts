import { v4 as uuidv4 } from 'uuid'

export default abstract class Base {
  protected _id!: String | null
  protected _rev!: String | null
  protected _key!: String | null

  public bootExisting (_id: String, _rev: String, _key: String): this {
    this._id = _id
    this._rev = _rev
    this._key = _key
    return this
  }

  public getDbId (): String | null {
    return this._id
  }

  public bootNew (): this {
    this._key = uuidv4().toString()
    return this
  }

  public serialize (): object {
    return {
      _id: this._id,
      _key: this._key
    }
  }
}
