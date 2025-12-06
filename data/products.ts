import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    name: 'Klasická Ketuba',
    description: 'Tradiční svatební smlouva s elegantními hebrejskými písmeny a jemným okrajem',
    price: 5500,
    image: '/images/ketubah-1.jpg',
    category: 'Tradiční',
    features: [
      'Ruční kaligrafie',
      'Prémiový papír',
      'Zlaté detaily',
      'Personalizace jmen a data'
    ]
  },
  {
    id: '2',
    name: 'Moderní Ketuba',
    description: 'Současný design s minimalistickými prvky a čistými liniemi',
    price: 6200,
    image: '/images/ketubah-2.jpg',
    category: 'Moderní',
    features: [
      'Moderní typografie',
      'Archivní papír',
      'Elegantní design',
      'Vlastní text'
    ]
  },
  {
    id: '3',
    name: 'Květinová Ketuba',
    description: 'Jemné květinové motivy obklopující svatební text',
    price: 6800,
    image: '/images/ketubah-3.jpg',
    category: 'Přírodní',
    features: [
      'Akvarel ilustrace',
      'Ručně malované květiny',
      'Jemné barvy',
      'Unikátní design'
    ]
  },
  {
    id: '4',
    name: 'Jeruzalémská Ketuba',
    description: 'Inspirováno starobylou architekturou svatého města',
    price: 7500,
    image: '/images/ketubah-4.jpg',
    category: 'Tradiční',
    features: [
      'Motiv Jeruzaléma',
      'Zlatá fólie',
      'Ručně kolorováno',
      'Luxusní provedení'
    ]
  }
];
