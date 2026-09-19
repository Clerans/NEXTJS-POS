import React, { useState, useEffect } from 'react';
import { UserAccount } from '@/types/user.types';
import { usersService } from '@/services/api/usersService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddUserDialog } from './components/AddUserDialog';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await usersService.getAll();
      if (data && data.length > 0) {
        const mapped = data.map((u) => ({
          username: u.username,
          mobile: u.mobile || 'N/A',
          status: (u.status || 'Active') as 'Active' | 'Inactive',
          role: (u.role.includes('ADMIN') ? 'Admin' : u.role.includes('MANAGE') ? 'Manager' : u.role.includes('BARISTA') ? 'Barista' : 'Cashier') as 'Admin' | 'Manager' | 'Barista' | 'Cashier',
          lastLogin: u.lastLogin || 'Today',
        }));
        setUsers(mapped);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    toast.success(`User ${newUser.username} added`);
  };

  const handleDelete = (username: string) => {
    setUsers((prev) => prev.filter((u) => u.username !== username));
    toast.info('User removed');
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Users</h1>
          <div className="page-sub">Manage system operator accounts and assigned roles</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setIsDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">System Users</div>
          <div className="text-xs text-textGray">Total Users: {users.length}</div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Username</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx} className="hover:bg-patina-light/50 transition-colors">
                <td className="font-bold text-gray-900">{u.username}</td>
                <td>{u.mobile}</td>
                <td>
                  <Badge variant="green">{u.status}</Badge>
                </td>
                <td>
                  <Badge variant="orange">{u.role}</Badge>
                </td>
                <td>{u.lastLogin}</td>
                <td className="actions-cell">
                  <button
                    className="act-btn"
                    title="Edit User"
                    onClick={() => toast.info(`Editing ${u.username}`)}
                  >
                    <SquarePen className="w-4 h-4" />
                  </button>
                  <button
                    className="act-btn act-delete"
                    title="Delete User"
                    onClick={() => handleDelete(u.username)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
};
