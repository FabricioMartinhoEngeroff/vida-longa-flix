
export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;  
  zipCode: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
  keepLoggedIn: boolean;
}

export interface ProfileData {
  name: string;
  email: string;
  taxId?: string;
  phone?: string;
  address?: Address;
}

export interface UpdateProfile {
  name?: string;
  taxId?: string;
  phone?: string;
  address?: Partial<Address>;
  photo?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  taxId?: string;
  phone?: string;
  address?: Address;
  photo?: string | null;
  profileComplete: boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface RecoverPassword {
  email: string;
}

export interface ResetPassword {
  token: string;
  newPassword: string;
}

export function isProfileComplete(user: User): boolean {
  return !!(
    user.name &&
    user.email &&
    user.taxId &&
    user.phone &&
    user.address?.street &&
    user.address?.number &&
    user.address?.neighborhood &&
    user.address?.city &&
    user.address?.state &&
    user.address?.zipCode
  );
}

export function createEmptyUser(): Partial<User> {
  return {
    name: '',
    email: '',
    taxId: '',
    phone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    photo: null,
    profileComplete: false
  };
}