export interface UserRead {
  id: number;
  login: string;
  gameAccount: {
    goldBalance: number;
  };
}

export interface UserReadQuery {
  id?: number;
  login?: string;
  password?: string;
  walletAddress?: string;
}
