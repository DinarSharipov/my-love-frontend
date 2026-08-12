import type { AuthResponseDto, RegisterDto, UserResponseDto } from '@/shared/api';

export type AuthSession = AuthResponseDto;
export type Gender = RegisterDto['gender'];
export type User = UserResponseDto;
