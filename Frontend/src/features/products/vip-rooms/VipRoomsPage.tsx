import React, { useState, useEffect } from 'react';
import { vipRoomsService, VipRoom, CreateVipRoomPayload, UpdateVipRoomPayload } from '@/services/api/vipRoomsService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddVipRoomDialog } from './components/AddVipRoomDialog';
import { Plus, Pencil, Trash2, DoorOpen, ToggleRight, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const VipRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<VipRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<VipRoom | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<VipRoom | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await vipRoomsService.getAll();
      setRooms(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch VIP rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSaveRoom = async (payload: CreateVipRoomPayload | UpdateVipRoomPayload) => {
    setSaving(true);
    try {
      if (selectedRoom) {
        await vipRoomsService.update(selectedRoom.id, payload);
        toast.success(`VIP Room '${payload.name}' updated successfully`);
      } else {
        await vipRoomsService.create(payload as CreateVipRoomPayload);
        toast.success(`VIP Room '${payload.name}' created successfully`);
      }
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save VIP room');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (room: VipRoom) => {
    const nextStatus = room.isActive === false;
    try {
      await vipRoomsService.updateStatus(room.id, nextStatus);
      toast.success(`VIP Room '${room.name}' status set to ${nextStatus ? 'Active' : 'Inactive'}`);
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update VIP room status');
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteConfirm) return;
    try {
      await vipRoomsService.delete(deleteConfirm.id);
      toast.success(`VIP Room '${deleteConfirm.name}' deleted successfully`);
      setDeleteConfirm(null);
      await fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete VIP room');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">VIP Rooms</h1>
          <div className="page-sub">Manage private dining space specifications and hourly pricing tiers</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setSelectedRoom(null);
            setIsDialogOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add VIP Room
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">VIP Rooms Master Roster</div>
          <div className="text-xs text-textGray">Total Rooms: {rooms.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading VIP rooms...
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            title="No VIP Rooms Configured"
            description="No private VIP dining suites have been added yet."
            icon={<DoorOpen className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Room Name</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Hourly Rate</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {rooms.map((item) => {
                let catBadge: 'purple' | 'blue' | 'orange' = 'purple';
                if (item.category === 'Small') catBadge = 'blue';
                if (item.category === 'Large') catBadge = 'orange';
                const isActive = item.isActive !== false;

                return (
                  <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.branchName || `Branch #${item.branchId}`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={catBadge}>{item.category}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      Rs. {Number(item.hourlyRate || 0).toLocaleString()} / hr
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 font-semibold">
                      {item.discountPercentage ? `${item.discountPercentage}%` : '0%'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isActive ? 'green' : 'gray'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-teal-600 inline-flex items-center"
                        title="Toggle Active Status"
                        onClick={() => handleToggleStatus(item)}
                      >
                        <ToggleRight className="w-4 h-4 text-teal-600" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                        title="Edit Room"
                        onClick={() => {
                          setSelectedRoom(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                        title="Delete Room"
                        onClick={() => setDeleteConfirm(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit VIP Room Dialog */}
      <AddVipRoomDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRoom}
        initialData={selectedRoom}
        loading={saving}
      />

      {/* Confirm Delete Dialog */}
      {deleteConfirm && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete VIP Room"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete VIP Room{' '}
              <strong className="text-gray-900">"{deleteConfirm.name}"</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeleteRoom} className="bg-red-600 hover:bg-red-700">
                Delete VIP Room
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
