import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types/product.types';
import { productsService, ProductCategory } from '@/services/api/productsService';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product Name is required'),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  stock: z.coerce.number().min(0, 'Stock must be non-negative'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export const AddProductDialog: React.FC<AddProductDialogProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    productsService.getCategories().then(setCategories).catch(() => {});
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      categoryId: 1,
      price: 0,
      stock: 0,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const selectedCat = categories.find((c) => c.id === data.categoryId);
      const sku = `SKU-PRD-${Date.now().toString().slice(-4)}`;

      const created = await productsService.create({
        sku,
        name: data.name,
        categoryId: data.categoryId,
        unitId: 1,
        retailPrice: data.price,
        costPrice: data.price * 0.4,
      });

      const newProd: Product = {
        id: created.id || Date.now(),
        code: created.sku || sku,
        name: data.name,
        category: selectedCat?.name || created.category?.name || 'Beverages',
        type: 'Product',
        outletPrice: data.price,
        pickmePrice: data.price * 1.15,
        uberPrice: data.price * 1.15,
        price: data.price,
        stock: data.stock,
        status: 'Active',
        icon: 'package',
      };

      onAddProduct(newProd);
      toast.success(`Product "${data.name}" saved successfully!`);
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Product">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label>
            Product Name <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. Croissant"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="field">
          <label>
            Category <span className="req">*</span>
          </label>
          <select className="select w-full" {...register('categoryId')}>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            ) : (
              <>
                <option value={1}>Beverages</option>
                <option value={2}>Bakery</option>
                <option value={3}>Main Course</option>
                <option value={4}>Desserts</option>
              </>
            )}
          </select>
        </div>

        <div className="field">
          <label>
            Price (LKR) <span className="req">*</span>
          </label>
          <input
            type="number"
            className="input"
            placeholder="500"
            {...register('price')}
          />
          {errors.price && (
            <span className="text-xs text-red-500">{errors.price.message}</span>
          )}
        </div>

        <div className="field">
          <label>Stock Qty</label>
          <input
            type="number"
            className="input"
            placeholder="100"
            {...register('stock')}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={isSubmitting}>
            Save Product
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
