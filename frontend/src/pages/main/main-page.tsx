import { Link } from 'react-router-dom';
import Card from '../../components/card/card';
import Gallery from '../../components/gallery/gallery';
import { useGetProductListQuery } from '@api';
import Spinner from '@components/spinner';

export default function MainPage() {
  const {
    data: products,
    isLoading,
  } = useGetProductListQuery();


  return (
    <Gallery>
      {isLoading && <Spinner />}
      {products && products.map((product) => (
        <Card key={product._id} dataCard={product} component={Link} />
      ))}
    </Gallery>
  );
}
