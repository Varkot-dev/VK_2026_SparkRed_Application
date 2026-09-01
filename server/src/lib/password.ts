import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

/** Abstracted so services can be unit-tested without paying for real bcrypt. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export const bcryptHasher: PasswordHasher = {
  hash: (plain) => bcrypt.hash(plain, BCRYPT_ROUNDS),
  compare: (plain, hash) => bcrypt.compare(plain, hash),
};
