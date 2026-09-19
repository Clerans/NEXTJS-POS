import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product.types';
import { productsService, ProductCategory } from '@/services/api/productsService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddProductDialog } from './components/AddProductDialog';
import { Plus, Eye, SquarePen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadLiveProducts = async () => {
    try {
      const data = await productsService.getAll();
      if (data && data.length > 0) {
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          code: p.sku,
          name: p.name,
          category: p.category?.name || 'Beverages',
          type: p.isRecipeBased ? 'Recipe' : 'Product',
          outletPrice: Number(p.retailPrice),
          pickmePrice: Number(p.retailPrice) * 1.15,
          uberPrice: Number(p.retailPrice) * 1.15,
          price: Number(p.retailPrice),
          stock: 100,
          status: p.isActive ? 'Active' : 'Inactive',
        }));
        setProducts(mapped);
      }
    } catch {
      // Keep local list if offline
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await productsService.getCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    loadLiveProducts();
    loadCategories();
  }, []);

  const filtered = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesType && matchesStatus;
  });

  const handleAddProduct = async (newProd: Product) => {
    await loadLiveProducts();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await productsService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.info(`Product "${name}" deleted`);
      loadLiveProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to delete ${name}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">All Products</h1>
          <div className="page-sub">Manage outlet products and pricing tiers</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setIsDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Product Catalog</div>
          <div className="text-xs text-textGray">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>

        <div className="filters-grid four">
          <input
            className="input"
            placeholder="Search product code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.length > 0 ? (
              categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))
            ) : (
              <>
                <option value="Beverages">Beverages</option>
                <option value="Bakery">Bakery</option>
                <option value="Main Course">Main Course</option>
                <option value="Desserts">Desserts</option>
              </>
            )}
          </select>
          <select
            className="select w-full"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Product">Product</option>
            <option value="Recipe">Recipe</option>
          </select>
          <select
            className="select w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Type</th>
              <th>Outlet Price</th>
              <th>Third-Party Prices</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                  <td>
                    <div className="font-bold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.code}</div>
                  </td>
                  <td>{item.category}</td>
                  <td>
                    <Badge variant="orange">{item.type}</Badge>
                  </td>
                  <td className="font-bold">LKR {item.outletPrice.toFixed(2)}</td>
                  <td className="text-xs">
                    <div>Pick Me: LKR {item.pickmePrice.toFixed(2)}</div>
                    <div>Uber: LKR {item.uberPrice.toFixed(2)}</div>
                  </td>
                  <td>
                    <Badge variant={item.status === 'Active' ? 'green' : 'gray'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="act-btn"
                      title="View"
                      onClick={() => toast.info(`Viewing product: ${item.name} (${item.code})`)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn"
                      title="Edit"
                      onClick={() => toast.info(`Editing product: ${item.name}`)}
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn act-delete"
                      title="Delete"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-textGray">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};
