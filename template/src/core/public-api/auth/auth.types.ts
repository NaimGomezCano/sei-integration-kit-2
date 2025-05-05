export type AuthSuccess<T = any> = {
  success: true
  payload: T
}

export type AuthFailure = {
  success: false
}

export type AuthResult<T = any> = AuthSuccess<T> | AuthFailure
