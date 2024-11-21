import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Employee, Department } from "@/utils/types";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

import { getDepartmentEmployees } from "@/utils/supabase/queries";

interface DepartmentEmployeesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  allDepartments: Department[];
}

export function DepartmentEmployeesDialog({ 
    isOpen, 
    onClose, 
    department,
    allDepartments 
}: DepartmentEmployeesDialogProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen, department.id]);

  const getSubDepartmentIds = (deptId: string): string[] => {
    const subDepts = allDepartments.filter(d => d.parent_department_id === deptId);
    const subDeptIds = subDepts.map(d => d.id);
    subDepts.forEach(d => {
      subDeptIds.push(...getSubDepartmentIds(d.id));
    });
    return subDeptIds;
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const employees = await getDepartmentEmployees(supabase, department.id);
      
      if (!employees) {
        throw new Error('Failed to fetch employees');
      }

      setEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Employees in {department.name}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Loading...</div>
        ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.given_name}</td>
                    <td>{employee.company_email}</td>
                    <td>{employee.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </DialogContent>
    </Dialog>
  );
}