export default abstract class Edge {
  protected _from: string
  protected _to: string
  protected _key!: string | undefined

  constructor(from: string, to: string, key: string | undefined = undefined) {
    this._from = from;
    this._to = to;
    this._key = key;
  }

  public serialize (): object {
    const ret: any = {
      _from: this._from,
      _to: this._to
    }
    if (this._key) {
      ret._key = this._key
    }
    return ret
  }

  public getFrom (): string {
    return this._from;
  }

  public getTo (): string {
    return this._to;
  }

  public getKey (): string | undefined {
    return this._key;
  }
}
