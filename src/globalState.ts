/** @format */
import * as vscode from "vscode";

export type UserDataType = {
  isSignedIn: boolean;
  isPremium: boolean;
  username: string;
  avatar: string;
  isVerified?: boolean;
};

export type APConnectionInfo = {
  hostname: string;
  port: number;
  slotname: string;
  password: string;
};

const CookieKey = "archipelacode-lc-cookie";
const ExpirationKey = "archipelacode-lc-expiration";
const UserStatusKey = "archipelacode-lc-user-status";
const APConnectionInfoKey = "archipelacode-ap-connection-info";

class GlobalState {
  private context!: vscode.ExtensionContext;
  private _leetCodeCookie!: string;
  private _leetCodeExpiration!: number;
  private _state!: vscode.Memento;
  private _userStatus!: UserDataType;
  private _apConnectionInfo!: APConnectionInfo;

  constructor() {}

  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
    this._state = this.context.globalState;
  }

  public setCookie(cookie: string): any {
    this._leetCodeCookie = cookie;
    return this._state.update(CookieKey, this._leetCodeCookie);
  }

  public getCookie(): string | undefined {
    return this._leetCodeCookie ?? this._state.get(CookieKey);
  }

  public removeCookie(): void {
    this._state.update(CookieKey, undefined);
  }

  public setExpiration(expiration: number): any {
    this._leetCodeExpiration = expiration;
    return this._state.update(ExpirationKey, this._leetCodeExpiration);
  }

  public getExpiration(): number | undefined {
    return this._leetCodeExpiration ?? this._state.get(ExpirationKey);
  }

  public removeExpiration(): void {
    this._state.update(ExpirationKey, undefined);
  }

  public setAPConnectionInfo(apConnectionInfo: APConnectionInfo): any {
    this._apConnectionInfo = apConnectionInfo;
    return this._state.update(APConnectionInfoKey, this._apConnectionInfo);
  }

  public getAPConnectionInfo(): APConnectionInfo | undefined {
    return this._apConnectionInfo ?? this._state.get(APConnectionInfoKey);
  }

  public removeAPConnectionInfo(): void {
    this._state.update(APConnectionInfoKey, undefined);
  }

  public setUserStatus(userStatus: UserDataType): any {
    this._userStatus = userStatus;
    return this._state.update(UserStatusKey, this._userStatus);
  }

  public getUserStatus(): UserDataType | undefined {
    return this._userStatus ?? this._state.get(UserStatusKey);
  }

  public removeAll(): void {
    this._state.update(CookieKey, undefined);
    this._state.update(UserStatusKey, undefined);
    this._state.update(APConnectionInfoKey, undefined);
  }
}

export const globalState: GlobalState = new GlobalState();
