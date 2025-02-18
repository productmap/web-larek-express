import { useAppSelector } from '@store';
import { selectBasketItems } from '@slices/basketSlice.ts';

const useIsBasket = (id: string) => {
  const productsInBasket = useAppSelector(selectBasketItems);
  const isBasket = productsInBasket.find((product) => product._id === id);

  return Boolean(isBasket);
};

export { useIsBasket };
