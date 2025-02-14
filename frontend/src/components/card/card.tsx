import { ElementType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { AppRoute, CATEGORY_CLASSES } from '@constants';
import Button from '../button/button';
import { useIsBasket } from './hooks/useIsBasket';
import { useAppDispatch } from '@store';
import { addProductCart } from '@slices/basketSlice.ts';
import { IProduct } from '@types';
import styles from './card.module.scss';

type CardProps = {
  dataCard: IProduct;
  full?: boolean;
  compact?: boolean;
  component: ElementType;
};

export default function Card({
  dataCard,
  full,
  compact,
  component: Component = 'div',
}: CardProps) {
  const {
    category,
    title,
    description,
    price,
    image,
    _id,
  } = dataCard;
  const isBasket = useIsBasket(_id);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleButtonClick = () => {
    if (isBasket) {
      navigate({ pathname: AppRoute.Basket }, { replace: true });
    } else {
      dispatch(addProductCart(dataCard));
    }
  };

  return (
    <Component
      to={{ pathname: `/product/${dataCard._id}` }}
      state={{ background: location }}
      className={clsx(
        styles.card,
        full && styles.card_full,
        compact && styles.card_compact,
      )}
    >
      {!full && (
        <>
          <span
            className={clsx(
              styles.card__category,
              category && CATEGORY_CLASSES[category],
            )}
          >
            {category}
          </span>
          <h2 className={styles.card__title}>{title}</h2>
        </>
      )}
      <img className={styles.card__image} src={image.fileName} alt={title} />
      <div className={styles.card__column}>
        {full && (
          <>
            <span
              className={clsx(
                styles.card__category,
                category && CATEGORY_CLASSES[category],
              )}
            >
              {category}
            </span>
            <h2 className={styles.card__title}>{title}</h2>
            <p className={styles.card__text}>{description}</p>
          </>
        )}
        <div className={styles.card__row}>
          {price && full && (
            <Button onClick={handleButtonClick}>
              {!isBasket ? 'В корзину' : 'В корзине'}
            </Button>
          )}
          <span className={styles.card__price}>
            {price ? `${price} синапсов` : 'Бесценно'}
          </span>
        </div>
      </div>
    </Component>
  );
}
