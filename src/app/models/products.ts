export interface IProducts {
  //?-вказує що поле є не обовязковим
  id: number;
  title: string;
  price: number;
  year: number;
  image?: string;
  configure: any;
  quantity: number;
}

export interface IProductsConfig {
  chip: string;
  SSD: string;
  memory: string;
  display: string;
}
