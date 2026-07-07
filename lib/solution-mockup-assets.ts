export const SOLUTION_MOCKUP_ASSETS = {
  doctors: {
    sarah: '/solution-mockups/doctor-sarah.jpg',
    taylor: '/solution-mockups/doctor-taylor.jpg',
    morgan: '/solution-mockups/doctor-morgan.jpg',
    lee: '/solution-mockups/doctor-lee.jpg',
    james: '/solution-mockups/doctor-james.jpg',
  },
  pets: {
    bella: '/solution-mockups/pet-bella.jpg',
    max: '/solution-mockups/pet-max.jpg',
    luna: '/solution-mockups/pet-luna.jpg',
    rocky: '/solution-mockups/pet-rocky.jpg',
    milo: '/solution-mockups/pet-milo.jpg',
    charlie: '/solution-mockups/pet-charlie.jpg',
    cooper: '/solution-mockups/pet-cooper.jpg',
    bruno: '/solution-mockups/pet-bruno.jpg',
    daisy: '/solution-mockups/pet-daisy.jpg',
  },
  products: {
    amoxicillin: '/solution-mockups/product-amoxicillin.jpg',
    syringe: '/solution-mockups/product-syringe.jpg',
    gloves: '/solution-mockups/product-gloves.jpg',
    vaccine: '/solution-mockups/product-vaccine.jpg',
    vacutainer: '/solution-mockups/product-vacutainer.jpg',
    strips: '/solution-mockups/product-strips.jpg',
  },
} as const;

export type SolutionDoctorKey = keyof typeof SOLUTION_MOCKUP_ASSETS.doctors;
export type SolutionPetKey = keyof typeof SOLUTION_MOCKUP_ASSETS.pets;
export type SolutionProductKey = keyof typeof SOLUTION_MOCKUP_ASSETS.products;
