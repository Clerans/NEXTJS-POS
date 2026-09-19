import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Users, Clock, Calendar, DollarSign, Briefcase, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { hrService, Employee } from '@/services/api/hrService';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

interface HrSubScreenPageProps {
  title: string;
  subtitle: string;
  columns: string[];
  data: Record<string, string>[];
}

export const HrSubScreenPage: React.FC<HrSubScreenPageProps> = ({
  title,
  subtitle,
  columns,
  data: initialData,
}) => {
  const [tableData, setTableData] = useState<Record<string, string>[]>(initialData || []);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Form states for modal submissions
  const [empName, setEmpName] = useState('');
  const [empCode, setEmpCode] = useState('');
  const [empMobile, setEmpMobile] = useState('');
  const [empRole, setEmpRole] = useState('Head Barista');
  const [selectedEmpId, setSelectedEmpId] = useState<number>(0);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [baseSalary, setBaseSalary] = useState<number>(75000);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const liveEmps = await hrService.getEmployees();
      setEmployees(liveEmps);
      if (title === 'Employees') {
        if (liveEmps && liveEmps.length > 0) {
          const mapped = liveEmps.map((e) => ({
            name: e.name,
            role: e.jobTitle || e.role || 'Staff',
            mobile: e.mobile || '—',
          }));
          setTableData(mapped);
        }
      } else {
        setTableData(initialData || []);
      }
    } catch {
      setTableData(initialData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, [title]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (title === 'Employees') {
        if (!empName || !empCode) {
          toast.error('Employee name and code are required');
          return;
        }
        await hrService.createEmployee({
          name: empName,
          employeeCode: empCode,
          mobile: empMobile || '0770000000',
          jobTitle: empRole,
        });
        toast.success(`Employee ${empName} profile created successfully`);
        await fetchLiveData();
      } else if (title === 'Attendance') {
        if (!selectedEmpId) {
          toast.error('Please select an employee');
          return;
        }
        await hrService.clockIn(selectedEmpId);
        toast.success('Attendance clock-in recorded successfully');
        const empObj = employees.find((e) => e.id === selectedEmpId);
        setTableData((prev) => [
          { emp: empObj ? empObj.name : `Employee #${selectedEmpId}`, in: new Date().toLocaleTimeString(), out: 'Active' },
          ...prev,
        ]);
      } else if (title === 'Leave Management') {
        if (!selectedEmpId) {
          toast.error('Please select an employee');
          return;
        }
        await hrService.createLeaveRequest({
          employeeId: selectedEmpId,
          leaveType,
          startDate,
          endDate,
        });
        toast.success('Leave request submitted successfully');
        const empObj = employees.find((e) => e.id === selectedEmpId);
        setTableData((prev) => [
          { emp: empObj ? empObj.name : `Employee #${selectedEmpId}`, type: leaveType, status: 'Approved' },
          ...prev,
        ]);
      } else if (title === 'Payroll Management') {
        if (!selectedEmpId) {
          toast.error('Please select an employee');
          return;
        }
        await hrService.calculatePayroll({
          employeeId: selectedEmpId,
          month: 'Current Month',
          baseSalary,
        });
        toast.success('Payroll calculated and recorded successfully');
        const empObj = employees.find((e) => e.id === selectedEmpId);
        setTableData((prev) => [
          { emp: empObj ? empObj.name : `Employee #${selectedEmpId}`, month: 'Current Month', pay: `Rs. ${baseSalary.toLocaleString()}` },
          ...prev,
        ]);
      } else {
        toast.success(`${title} record created successfully`);
      }

      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to submit ${title} record`);
    }
  };

  const renderIcon = () => {
    if (title.includes('Employee')) return <Users className="w-8 h-8 text-patina" />;
    if (title.includes('Attendance') || title.includes('Shift')) return <Clock className="w-8 h-8 text-patina" />;
    if (title.includes('Leave')) return <Calendar className="w-8 h-8 text-patina" />;
    if (title.includes('Payroll')) return <DollarSign className="w-8 h-8 text-patina" />;
    if (title.includes('Transport')) return <Truck className="w-8 h-8 text-patina" />;
    return <Briefcase className="w-8 h-8 text-patina" />;
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <div className="page-sub">{subtitle}</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setModalOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">{title} Records</div>
          <div className="text-xs text-textGray">Total Entries: {tableData.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading {title.toLowerCase()} records...
          </div>
        ) : tableData.length === 0 ? (
          <EmptyState
            title={`No ${title} Records Found`}
            description={`No records logged for ${title.toLowerCase()} yet.`}
            icon={renderIcon()}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                {columns.map((col, idx) => (
                  <th key={idx} className="py-3 px-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tableData.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-patina-light/50 transition-colors">
                  {Object.values(row).map((val, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3 px-4 ${cIdx === 0 ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Submission Modal */}
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Add ${title} Record`}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {title === 'Employees' ? (
            <>
              <div className="field">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Employee Code <span className="text-red-500">*</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="e.g. EMP-101"
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="e.g. Thilini Perera"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="field">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <input
                    className="input w-full"
                    placeholder="0771234567"
                    value={empMobile}
                    onChange={(e) => setEmpMobile(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Job Title</label>
                  <select
                    className="select w-full"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                  >
                    <option value="Head Barista">Head Barista</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Kitchen Assistant">Kitchen Assistant</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Employee</label>
                <select
                  className="select w-full"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                >
                  <option value={0}>-- Select Employee --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              {title === 'Leave Management' && (
                <>
                  <div className="field">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Type</label>
                    <select
                      className="select w-full"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Medical Leave">Medical Leave</option>
                      <option value="Annual Leave">Annual Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="field">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        className="input w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        className="input w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {title === 'Payroll Management' && (
                <div className="field">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Salary (Rs.)</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Save {title} Record
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
