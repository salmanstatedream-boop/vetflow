export type CatalogServiceMatch = {
  id: string;
  name: string;
  price: number;
};

export type ServiceMatchPurpose =
  | 'vaccination'
  | 'deworming'
  | 'grooming'
  | 'consult'
  | 'surgery'
  | string;

const SPECIES_ALIASES: Record<string, string[]> = {
  dog: ['dog', 'canine', 'puppy'],
  cat: ['cat', 'feline', 'kitten'],
  bird: ['bird', 'avian', 'parrot'],
  rabbit: ['rabbit', 'bunny'],
  horse: ['horse', 'equine'],
};

function normalizeSpecies(species: string | null | undefined): string {
  return (species || '').trim().toLowerCase();
}

function speciesTokens(species: string | null | undefined): string[] {
  const raw = normalizeSpecies(species);
  if (!raw) return [];
  for (const [canonical, aliases] of Object.entries(SPECIES_ALIASES)) {
    if (aliases.some((a) => raw === a || raw.includes(a))) {
      return aliases;
    }
  }
  return [raw.split(/[\s/,-]+/)[0]].filter(Boolean);
}

function purposeKeyword(purpose: ServiceMatchPurpose): string {
  return purpose.replace(/_/g, ' ').trim().toLowerCase();
}

function nameHasSpecies(name: string, tokens: string[]): boolean {
  const n = name.toLowerCase();
  return tokens.some((t) => n.includes(t));
}

function nameHasOtherSpecies(name: string, ownTokens: string[]): boolean {
  const n = name.toLowerCase();
  const all = Object.values(SPECIES_ALIASES).flat();
  return all.some((t) => n.includes(t) && !ownTokens.includes(t));
}

/**
 * Pick the best catalog service for a visit purpose without blindly taking
 * the first alphabetical substring match (which prefers "Cat …").
 */
export function matchCatalogService(
  catalog: CatalogServiceMatch[],
  purpose: ServiceMatchPurpose,
  petSpecies?: string | null
): CatalogServiceMatch | null {
  if (!catalog.length) return null;

  const keyword = purposeKeyword(purpose);
  if (!keyword) return null;

  const candidates = catalog.filter((s) =>
    s.name.toLowerCase().includes(keyword)
  );
  if (!candidates.length) return null;

  const tokens = speciesTokens(petSpecies);

  if (tokens.length) {
    const speciesMatch = candidates.find((s) => nameHasSpecies(s.name, tokens));
    if (speciesMatch) return speciesMatch;
  }

  const exactGeneric = candidates.find((s) => {
    const n = s.name.toLowerCase().trim();
    return n === keyword || n === `${keyword} service` || n === `general ${keyword}`;
  });
  if (exactGeneric) return exactGeneric;

  const genericNoSpecies = candidates.find(
    (s) => !nameHasOtherSpecies(s.name, tokens)
  );
  if (genericNoSpecies) return genericNoSpecies;

  // Do not fall back to a wrong-species SKU (e.g. Cat Vaccination for a dog).
  return null;
}

export function serviceItemFromCatalog(
  service: CatalogServiceMatch | null
): {
  serviceId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}[] {
  if (!service) return [];
  return [
    {
      serviceId: service.id,
      name: service.name,
      unitPrice: service.price,
      quantity: 1,
    },
  ];
}
