export interface AccessTokenPayload {
  userId: number;
  refreshId: number;
  address?: string;
}

export interface RefreshTokenPayload {
  userId: number;
}
