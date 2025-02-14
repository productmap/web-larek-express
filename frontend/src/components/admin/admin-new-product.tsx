import { SyntheticEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, FileInput, Form, Input, Select } from '@/components';
import useFormWithValidation from '@utils/hooks/useFormWithValidation';
import { toast } from 'react-toastify';
import { weblarekApi } from '@api';
import { uploadUrl } from '@/config';
import { AppRoute, CATEGORY_CLASSES, CATEGORY_TYPES, OptionType } from '@constants';
import { IFile } from '@types';
import { ProductFormValues } from './helpers/types';
import styles from './admin.module.scss';

export default function AdminNewProduct() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    values,
    handleChange,
    errors,
    isValid,
  } =
    useFormWithValidation<ProductFormValues>(
      {
        title: '',
        description: '',
        price: null,
      },
      formRef.current,
    );

  const [createProduct, { isLoading: isCreating }] = weblarekApi.useCreateProductMutation();
  const [uploadImageFile, { isLoading: isUploading }] = weblarekApi.useUploadFileMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(
    null,
  );
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const isValidForm =
    isValid && Boolean(selectedFile) && Boolean(selectedCategory);

  const handleFileChange = async (e: SyntheticEvent<HTMLInputElement>) => {
    if (e.currentTarget.files?.length) {
      const dataFile = new FormData();
      dataFile.append('file', e.currentTarget.files[0]);
      const response = await uploadImageFile(dataFile)
        .unwrap();
      if (response?.file?.fileName) {
        setSelectedFile(response.file);
        setPreviewImageUrl(`${uploadUrl}/${response.file.fileName}`);
      } else {
        toast.error('Ошибка загрузки файла: неверный ответ сервера');
        setSelectedFile(null);
        setPreviewImageUrl(null);
      }
    } else {
      setSelectedFile(null);
      setPreviewImageUrl(null);
    }
  };

  const handleCreateProduct = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile || !selectedCategory) {
      toast.error('Не выбран файл или категория');
      return;
    }

    const dataProduct = {
      ...values,
      category: selectedCategory?.title as keyof typeof CATEGORY_CLASSES,
      image: {
        fileName: selectedFile.fileName,
        alt: values.title,
      },
      price: values.price ?? null,
    };

    try {
      await createProduct(dataProduct)
        .unwrap();
      toast.success('Продукт успешно создан');
      navigate(AppRoute.Admin);
    } catch (error: unknown) {
      toast.error('Ошибка создания продукта');
    }
  };

  return (
    <Form
      formRef={formRef}
      handleFormSubmit={handleCreateProduct}
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
        label="Загрузить изображение"
        accept="image/*,.png,.jpeg,.jpg,.svg"
      />
      {/* Блок для отображения превью изображения */}
      {previewImageUrl && (
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
      )}
      <Button
        type="submit"
        extraClass={styles.admin__button}
        disabled={!isValidForm || isCreating || isUploading}
      >
        {isCreating || isUploading ? 'Сохраняю...' : 'Сохранить'}
      </Button>
    </Form>
  );
}
