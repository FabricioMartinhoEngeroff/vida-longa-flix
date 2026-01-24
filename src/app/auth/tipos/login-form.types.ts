import { FormControl } from '@angular/forms';

export type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  manterConectado: FormControl<boolean>;
};

export interface LoginFormData {
  email: string;
  password: string;
  manterConectado: boolean;
}
