import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import "../styles/EmployeePage.css";
import AddEmployeeModal from "./AddEmployeeModal";
import { useEmployee, useLocations } from "../di/container";
import type { EmployeeRecord } from "../interfaces/EmployeeService";
import DeleteEmployeeModal from "./DeleteEmployeeModal";

function EmployeePage() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeRecord[]>([]);
  const [employeeToRemove, setEmployeeToRemove] = useState<EmployeeRecord | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const employeeService = useEmployee();
  const locationService = useLocations();

  useEffect(() => {
    getEmployees();
    const loadRole = async () => {
      const role = await locationService.fetchUserRole();
      setUserRole(role!);
    };
    loadRole();
  }, []);

  const getEmployees = async () => {
    const locations = await locationService.getLocations();
    const locationIDs = locations.map((location) => location.id);
    const employees = await employeeService.fetchEmployees(locationIDs);
    setEmployeeList(employees);
  };

  const handleRemoveEmployee = async () => {
    if (!employeeToRemove) return;
    try {
      await employeeService.removeAdminLocation(employeeToRemove.email);
      await getEmployees();
    } catch (error) {
      console.error("Failed to delete machine:", error);
    } finally {
      setEmployeeToRemove(null);
    }
  };

  return (
    <div>
      <div className="sub-section">
        <button className="add-employee" onClick={() => setIsEmployeeModalOpen(true)}>
          <Plus size={15} />
          <p>Add Employee</p>
        </button>
      </div>

      <div className="employee-table-wrapper">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location ID</th>
              {userRole == "Owner" && <th>Delete</th>}
            </tr>
          </thead>
          <tbody>
            {employeeList.length === 0 && (
              <tr>
                <td colSpan={4} className="machine-empty-row">
                  No employees at this time.
                </td>
              </tr>
            )}
            {employeeList.map((employee, index) => (
              <tr key={index} className="machine-row">
                <td className="machine-name">{employee.name}</td>
                <td>
                  <span>{employee.email}</span>
                </td>
                <td>{employee.locationID}</td>
                {userRole == "Owner" && (
                  <td>
                    <button onClick={() => setEmployeeToRemove(employee)} className="delete-button">
                      <Trash2 />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddEmployeeModal onClose={() => setIsEmployeeModalOpen(false)} onSuccess={() => getEmployees()} isOpen={isEmployeeModalOpen} />
      <DeleteEmployeeModal employee={employeeToRemove} onConfirm={handleRemoveEmployee} onCancel={() => setEmployeeToRemove(null)} />
    </div>
  );
}

export default EmployeePage;
