import { Faker, en } from '@faker-js/faker';

export function makeFaker(seed: number) {
  const faker = new Faker({ locale: [en] });
  faker.seed(seed);
  return faker;
}