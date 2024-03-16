export interface UserRead {
  id: number;
  login: string;
  account: {
    goldBalance: number;
  };
}

export interface UserReadQuery {
  id?: number;
  login?: string;
  password?: string;
}
