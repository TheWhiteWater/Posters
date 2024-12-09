export interface Template {
  id: number;
  name: string;
  price: number;
  targetImage: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 1,
    name: "Wanted Poster",
    price: 9.99,
    targetImage: "/templates/wanted.jpg"
  },
  {
    id: 2,
    name: "Mona Lisa",
    price: 14.99,
    targetImage: "/templates/mona-lisa.jpg"
  },
  {
    id: 3,
    name: "Mugshot",
    price: 4.99,
    targetImage: "/templates/mugshot.jpg"
  }
];