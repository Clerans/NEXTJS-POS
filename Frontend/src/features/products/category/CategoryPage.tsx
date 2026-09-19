import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { productsService, ProductCategory } from '@/services/api/productsService';
import { Plus, Eye, SquarePen, Trash2, X, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';

export const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<ProductCategory | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [categoryStatus, setCategoryStatus] = useState<'Active' | 'Inactive'>('Active');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await productsService.getCategories();
      setCategories(data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await productsService.createCategory({ name: categoryName, status: categoryStatus });
      toast.success('Category created successfully');
      setIsCreateOpen(false);
      setCategoryName('');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleEditSave = async () => {
    if (!selectedCat || !categoryName.trim()) return;
    try {
      await productsService.updateCategory(selectedCat.id, { name: categoryName, status: categoryStatus });
      toast.success('Category updated successfully');
      setIsEditOpen(false);
      setSelectedCat(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (cat: ProductCategory) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await productsService.deleteCategory(cat.id);
      toast.success(`Deleted ${cat.name}`);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to delete ${cat.name}`);
    }
  };

  const openEdit = (cat: ProductCategory) => {
    setSelectedCat(cat);
    setCategoryName(cat.name);
    setCategoryStatus(cat.status);
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Product Categories</h1>
          <div className="page-sub">Group items into manageable menu categories</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setCategoryName('');
            setCategoryStatus('Active');
            setIsCreateOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Categories List</div>
          <div className="text-xs text-textGray">Total Categories: {categories.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading product categories...
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No Categories Found"
            description="No product categories created yet."
            icon={<FolderTree className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Product Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{cat.name}</td>
                  <td className="py-3 px-4 text-gray-700">{cat.count || `${cat.productCount || 0} items`}</td>
                  <td className="py-3 px-4">
                    <Badge variant={cat.status === 'Active' ? 'green' : 'gray'}>
                      {cat.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                      title="View"
                      onClick={() => toast.info(`Viewing category: ${cat.name}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                      title="Edit"
                      onClick={() => openEdit(cat)}
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                      title="Delete"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-textDark">Add New Category</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-textGray hover:text-textDark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textGray mb-1">Category Name</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Cold Beverages"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textGray mb-1">Status</label>
                <select
                  className="select w-full"
                  value={categoryStatus}
                  onChange={(e) => setCategoryStatus(e.target.value as 'Active' | 'Inactive')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleCreate}>
                Save Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-textDark">Edit Category: {selectedCat.name}</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-textGray hover:text-textDark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textGray mb-1">Category Name</label>
                <input
                  type="text"
                  className="input w-full"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textGray mb-1">Status</label>
                <select
                  className="select w-full"
                  value={categoryStatus}
                  onChange={(e) => setCategoryStatus(e.target.value as 'Active' | 'Inactive')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleEditSave}>
                Update Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
