import { useParams } from 'react-router';
import { Preloader } from '@components/preloader';
import Card from '../card/card';
import { useAppSelector } from '@store';
import { selectProducts } from '@slices/productsSlice.ts';
import { IProduct } from '@types';

const CardDetails = () => {
  const { cardId } = useParams<{ cardId: string }>();

  const productData = useAppSelector(selectProducts).find(
    (item: IProduct) => item._id === cardId
  );

  if (!productData) {
    return <Preloader />;
  }

  return <Card dataCard={productData} full component='div' />;
};

export default CardDetails;
