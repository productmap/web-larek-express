import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Input } from '@/components';
import useFormWithValidation from '@utils/hooks/useFormWithValidation';
import FileInput from '../form/file-input';
import { toast } from 'react-toastify';
import Select from '../select';
import { useGetProductItemQuery, weblarekApi } from '@api';
import { uploadUrl } from '@/config';
import { AppRoute, CATEGORY_CLASSES, CATEGORY_TYPES, OptionType } from '@constants';
import { IFile } from '@types';
import { ProductFormValues } from './helpers/types';
import styles from './admin.module.scss';
import { useAppDispatch } from '@store';

export default function AdminEditProduct() {
  const navigate = useNavigate();
  const { editId } = useParams();
  const dispatch = useAppDispatch();
  const { data: currentProduct } = useGetProductItemQuery(editId || '');

  const [updateProduct, { isLoading: isUpdating }] = weblarekApi.useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = weblarekApi.useDeleteProductMutation();
  const [uploadImageFile, { isLoading: isUploading }] = weblarekApi.useUploadFileMutation();

  const formRef = useRef<HTMLFormElement>(null);
  const {
    values,
    handleChange,
    errors,
    isValid,
    setValuesForm,
  } = useFormWithValidation<ProductFormValues>(
    {
      title: '',
      description: '',
      price: null,
    },
    formRef.current,
  );
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const isValidForm = isValid && Boolean(selectedCategory);
  const navigateAdminList = useCallback(() => navigate(AppRoute.Admin), [navigate]);

  const handleFileChange = useCallback(async (e: SyntheticEvent<HTMLInputElement>) => {
    setSelectedFile(null);
    setPreviewImageUrl(null);

    if (e.currentTarget.files?.length) {
      const dataFile = new FormData();
      dataFile.append('file', e.currentTarget.files[0]);
      try {
        const response = await uploadImageFile(dataFile)
          .unwrap();
        if (response?.file?.fileName) {
          setSelectedFile(response.file);
          setPreviewImageUrl(`${uploadUrl}/${response.file.fileName}`);
        } else {
          toast.error('Ошибка загрузки файла: неверный ответ сервера');
        }
      } catch (error: unknown) {
        toast.error('Ошибка загрузки файла');
      }
    }
  }, [uploadImageFile, setPreviewImageUrl, setSelectedFile]);

  useEffect(() => {

    if (editId && currentProduct) {
      const currentCategory = CATEGORY_TYPES.find(item => item.title === currentProduct?.category);
      setSelectedCategory(currentCategory || null);
      setValuesForm({
        description: currentProduct.description,
        price: currentProduct.price,
        title: currentProduct.title,
      });
      setPreviewImageUrl(currentProduct.image.fileName);
    } else if (editId && !currentProduct) {
      toast.error('Продукт не найден');
      navigateAdminList();
    }
  }, [editId, currentProduct, navigateAdminList, setValuesForm]);

  const handleFormSubmit = useCallback(async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory || !editId) return;

    const dataProduct = {
      ...values,
      category: selectedCategory.title as keyof typeof CATEGORY_CLASSES,
      image: selectedFile ? {
        fileName: selectedFile.fileName,
        alt: values.title,
      } : {
        fileName: currentProduct?.image.fileName ?? '',
        alt: values.title,
      },
      price: values.price ?? null,
    };

    try {
      await updateProduct({
        id: editId,
        data: dataProduct,
      })
        .unwrap();
      dispatch(weblarekApi.util.invalidateTags([{
        type: 'Products',
        id: editId,
      }]));
      navigateAdminList();
      toast.success('Продукт успешно обновлен!');
    } catch (error: unknown) {
      toast.error('Ошибка обновления продукта');
    }
  }, [editId, values, selectedCategory, updateProduct, dispatch, navigateAdminList, selectedFile, currentProduct?.image?.fileName]);

  const handleDeleteProduct = useCallback(async () => {
    if (!editId) return;
    try {
      await deleteProduct(editId)
        .unwrap();
      dispatch(weblarekApi.util.invalidateTags(['Products']));
      navigateAdminList();
      toast.success('Продукт успешно удален!');
    } catch (error: unknown) {
      toast.error('Ошибка удаления продукта');
    }
  }, [editId, deleteProduct, dispatch, navigateAdminList]);

  return (
    <Form
      formRef={formRef}
      handleFormSubmit={handleFormSubmit}
      encType="multipart/form-data"
    >
      <Input
        value={values.title || ''}
        onChange={handleChange}
        name="title"
        type="text"
        placeholder="Придумайте название"
        label="Название"
        required
        error={errors.title}
      />
      <Select
        options={CATEGORY_TYPES}
        selected={selectedCategory}
        placeholder="Выберите категорию"
        onChange={setSelectedCategory}
      />
      <Input
        value={values.description || ''}
        onChange={handleChange}
        component="textarea"
        name="description"
        placeholder="Введите описание"
        label="Описание"
        required
        error={errors.description}
      />
      <Input
        value={values.price || ''}
        extraClassLabel={styles.label__price}
        onChange={handleChange}
        type="number"
        name="price"
        placeholder="Введите стоимость"
        label="Стоимость (в синапсах)"
        error={errors.description}
      />
      <FileInput
        onChange={handleFileChange}
        extraClass={styles.admin__file}
        inputRef={fileRef}
        label="Заменить изображение"
        accept="image/*,.png,.jpeg,.jpg,.svg"
        fileName={currentProduct?.image.fileName}
      />
      {/* Блок для отображения превью изображения */}
      {previewImageUrl ? (
        <div className={styles.admin__preview}>
          <img
            src={previewImageUrl}
            alt="Превью изображения"
            style={{
              maxWidth: '100px',
              maxHeight: '100px',
            }}
          />
        </div>
      ) : currentProduct?.image.fileName && (
        <div className={styles.admin__preview}>
          <img
            src={currentProduct.image.fileName}
            alt="Текущее изображение товара"
            style={{
              maxWidth: '100px',
              maxHeight: '100px',
            }}
          />
        </div>
      )}
      <div className={styles.admin__buttons}>
        <Button type="submit" disabled={!isValidForm || isUpdating || isUploading || isDeleting}>
          {isUpdating || isUploading || isDeleting ? 'Сохраняю...' : 'Сохранить'}
        </Button>
        <Button
          onClick={handleDeleteProduct}
          type="button"
          extraClass={styles.admin__button_alt}
          disabled={isUpdating || isUploading || isDeleting}
        >
          {isDeleting ? 'Удаляю...' : 'Удалить товар'}
        </Button>
      </div>
    </Form>
  );
}
