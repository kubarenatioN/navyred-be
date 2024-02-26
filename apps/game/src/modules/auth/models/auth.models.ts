export interface UserLogin {
  login: string;
  password: string;
}

export interface UserRegister {
  login: string;
  password: string;
}

export interface UserSessionModel {
  userId: number;
  uid: string;
  expiredAt: Date;
}
