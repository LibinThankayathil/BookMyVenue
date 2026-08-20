export const venueKeys = {
  all: ["venues"] as const,
  lists: () => [...venueKeys.all, "list"] as const,
  list: () => [...venueKeys.lists()] as const,
  myList: () => [...venueKeys.lists(), "mine"] as const,
  savedList: () => [...venueKeys.lists(), "saved"] as const,
  details: () => [...venueKeys.all, "detail"] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
  closures: (venueId: string | number) => [...venueKeys.all, "closures", String(venueId)] as const,
  mutations: () => [...venueKeys.all, "mutation"] as const,
  create: () => [...venueKeys.mutations(), "create"] as const,
};
