import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import "../styles/EmployeePage.css";
import AddEmployeeModal from "./AddEmployeeModal";
import { useEmployee, useLocations } from "../di/container";
import type { EmployeeRecord } from "../interfaces/EmployeeService";

function EmployeePage() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeRecord[]>([]);
  const employeeService = useEmployee();
  const locationService = useLocations();

  useEffect(() => {
    getEmployees();
  }, []);

  const getEmployees = async () => {
    const locations = await locationService.getLocations();
    const locationIDs = locations.map((location) => location.id);
    const employees = await employeeService.fetchEmployees(locationIDs);
    setEmployeeList(employees);
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddEmployeeModal onClose={() => setIsEmployeeModalOpen(false)} onSuccess={() => getEmployees()} isOpen={isEmployeeModalOpen} />
    </div>
  );
}

export default EmployeePage;
