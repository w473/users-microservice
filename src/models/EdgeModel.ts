export default abstract class Edge {
  protected _from: string
  protected _to: string
  protected _key!: string | null

  constructor(from: string, to: string, key: string | null = null) {
    this._from = from;
    this._to = to;
    this._key = key;
  }

  public serialize (): object {
    return {
      _from: this._from,
      _to: this._to,
      _key: this._key
    }
  }

  public getFrom (): string {
    return this._from;
  }

  public getTo (): string {
    return this._to;
  }

  public getKey (): string | null {
    return this._key;
  }
}
