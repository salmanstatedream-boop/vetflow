export const PET_GENDER_OPTIONS = [
  'Male',
  'Female',
  'Neutered Male',
  'Spayed Female',
] as const;

export type PetGender = (typeof PET_GENDER_OPTIONS)[number];

export const DEFAULT_PET_GENDER: PetGender = 'Male';
