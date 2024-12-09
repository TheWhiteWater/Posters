export interface Template {
    id: number;
    name: string;
    price: number;
    targetImage: string;
  }
  
  export const TEMPLATES: Template[] = [
    {
      id: 1,
      name: 'Wanted Poster',
      price: 10,
      targetImage: '/templates/wanted.jpg'
    },
    {
      id: 2,
      name: 'Mona Lisa',
      price: 15,
      targetImage: '/templates/mona-lisa.jpg'
    },
    {
      id: 3,
      name: 'Mugshot',
      price: 10,
      targetImage: '/templates/mugshot.jpg'
    }
  ];