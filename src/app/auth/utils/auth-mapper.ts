import { RegisterData, LoginPayload, RegisterPayload } from '../types/user.types';
import { applyPhoneMaskAuto } from './masks.utils';

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function mapLoginToApi(
  email: string,
  password: string,
  keepLoggedIn: boolean
): LoginPayload {
  return {
    email: normalizeEmail(email),
    password: (password ?? '').trim(),
    keepLoggedIn,
  };
}

export function mapRegisterToApi(data: RegisterData): RegisterPayload {
  return {
    name: (data.name ?? '').trim(),
    email: normalizeEmail(data.email),
    password: data.password ?? '',
    phone: applyPhoneMaskAuto(data.phone ?? ''),
  };
}
