export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  userId?: number;
  currentPassword: string;
  newPassword: string;
}

export interface VerifyPinRequestDto {
  pinCode: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  emailOrUsername: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

export interface UserAuthProfileDto {
  id: number;
  username: string;
  name: string;
  email: string | null;
  role: string | {
    id: number;
    name: string;
    permissions: string[];
  };
  mustChangePassword?: boolean;
  branches?: Array<{
    id: number;
    code: string;
    name: string;
  }>;
}

export interface AuthTokenResponseDto {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: UserAuthProfileDto;
}
